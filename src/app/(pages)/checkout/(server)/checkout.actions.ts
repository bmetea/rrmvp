"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@clerk/nextjs/server";
import { formatPrice } from "@/shared/lib/utils/price";

interface CartItem {
  competition: {
    id: string;
    title: string;
    type: string;
    ticket_price: number;
  };
  quantity: number;
}

// Atomic ticket allocation function
async function allocateTicketNumbers(
  competitionId: string,
  count: number,
  trx: any
): Promise<{ success: boolean; ticketNumbers?: number[]; error?: string }> {
  try {
    const { sql } = await import("kysely");

    // Atomic allocation: increment counter and check availability in one operation
    const result = await trx
      .updateTable("ticket_counters")
      .set({
        last_ticket_number: sql`last_ticket_number + ${count}`,
        updated_at: sql`CURRENT_TIMESTAMP`,
      })
      .where("competition_id", "=", competitionId)
      .where(
        sql`last_ticket_number + ${count} <= (
        SELECT total_tickets FROM competitions WHERE id = ${competitionId}
      )`
      )
      .returning(["last_ticket_number"])
      .executeTakeFirst();

    if (!result) {
      return {
        success: false,
        error: "Not enough tickets available",
      };
    }

    // Generate the ticket numbers for this allocation
    const startNumber = result.last_ticket_number - count + 1;
    const ticketNumbers = Array.from(
      { length: count },
      (_, i) => startNumber + i
    );

    return {
      success: true,
      ticketNumbers,
    };
  } catch (error) {
    console.error("Error allocating ticket numbers:", error);
    return {
      success: false,
      error: "Failed to allocate tickets",
    };
  }
}

export async function processHybridCheckout(
  items: CartItem[],
  paymentTransactionId?: string
): Promise<{
  success: boolean;
  message: string;
  results?: any[];
  walletAmount?: number;
  cardAmount?: number;
}> {
  try {
    const session = await auth();

    if (!session?.userId) {
      return {
        success: false,
        message: "You must be logged in to complete this purchase",
      };
    }

    const { db } = await import("@/db");

    // Calculate total cost
    const totalCost = items.reduce(
      (sum, item) => sum + item.competition.ticket_price * item.quantity,
      0
    );

    return await db.transaction().execute(async (trx) => {
      // Get database user ID from Clerk user ID
      const user = await trx
        .selectFrom("users")
        .select("id")
        .where("clerk_id", "=", session.userId)
        .executeTakeFirst();

      if (!user) {
        throw new Error("User not found");
      }

      // Get wallet balance
      const wallet = await trx
        .selectFrom("wallets")
        .select(["id", "balance"])
        .where("user_id", "=", user.id)
        .executeTakeFirst();

      if (!wallet) {
        throw new Error("Wallet not found");
      }

      // Calculate payment breakdown
      const walletCreditUsed = Math.min(wallet.balance, totalCost);
      const cardPaymentAmount = totalCost - walletCreditUsed;

      const results = [];

      // Scenario analysis:
      // 1. Card-only: walletCreditUsed = 0, cardPaymentAmount = totalCost
      // 2. Wallet-only: walletCreditUsed = totalCost, cardPaymentAmount = 0
      // 3. Hybrid: walletCreditUsed > 0 && cardPaymentAmount > 0

      for (const item of items) {
        const itemCost = item.competition.ticket_price * item.quantity;
        const itemWalletCredit = Math.min(
          walletCreditUsed * (itemCost / totalCost),
          itemCost
        );

        let walletTransactionId: string | null = null;

        // Create wallet transaction if wallet credit is used
        if (itemWalletCredit > 0) {
          const walletTransaction = await trx
            .insertInto("wallet_transactions")
            .values({
              wallet_id: wallet.id,
              amount: Math.round(itemWalletCredit), // Round to avoid decimal issues
              type: "debit",
              status: "completed",
              reference_type: "ticket_purchase",
              reference_id: item.competition.id,
              description: `Wallet credit for ${item.quantity} tickets in competition ${item.competition.id}`,
              number_of_tickets: item.quantity,
            })
            .returning("id")
            .executeTakeFirst();

          if (!walletTransaction) {
            throw new Error(
              `Failed to create wallet transaction for competition ${item.competition.id}`
            );
          }

          walletTransactionId = walletTransaction.id;
        }

        // Atomically allocate ticket numbers
        const allocation = await allocateTicketNumbers(
          item.competition.id,
          item.quantity,
          trx
        );

        if (!allocation.success) {
          throw new Error(
            allocation.error ||
              `Failed to allocate tickets for competition ${item.competition.id}`
          );
        }

        const ticketNumbers = allocation.ticketNumbers!;

        // Create competition entry with ticket numbers
        const competitionEntry = await trx
          .insertInto("competition_entries")
          .values({
            competition_id: item.competition.id,
            user_id: user.id,
            wallet_transaction_id: walletTransactionId,
            tickets: ticketNumbers,
            ...(paymentTransactionId
              ? { payment_transaction_id: paymentTransactionId }
              : {}),
          })
          .returning("id")
          .executeTakeFirst();

        if (!competitionEntry) {
          throw new Error(
            `Failed to create competition entry for ${item.competition.id}`
          );
        }

        // Check for and claim any winning tickets
        const winningTickets = await trx
          .selectFrom("winning_tickets")
          .select(["id", "ticket_number", "prize_id"])
          .where("competition_id", "=", item.competition.id)
          .where("ticket_number", "in", ticketNumbers)
          .where("status", "=", "available")
          .execute();

        const claimedTickets: { ticketNumber: number; prizeId: string }[] = [];

        // Claim each winning ticket atomically
        for (const winningTicket of winningTickets) {
          const claimedTicket = await trx
            .updateTable("winning_tickets")
            .set({
              status: "claimed",
              claimed_by_user_id: user.id,
              claimed_at: new Date(),
              competition_entry_id: competitionEntry.id,
            })
            .where("id", "=", winningTicket.id)
            .where("status", "=", "available") // Double-check to prevent race conditions
            .returning("id")
            .executeTakeFirst();

          if (claimedTicket) {
            claimedTickets.push({
              ticketNumber: winningTicket.ticket_number,
              prizeId: winningTicket.prize_id,
            });
          }
        }

        // Update competition tickets sold count using atomic increment
        const { sql } = await import("kysely");

        await trx
          .updateTable("competitions")
          .set({
            tickets_sold: sql`tickets_sold + ${item.quantity}`,
          })
          .where("id", "=", item.competition.id)
          .execute();

        const winningMessage =
          claimedTickets.length > 0
            ? ` 🎉 Congratulations! You won ${claimedTickets.length} prize${
                claimedTickets.length > 1 ? "s" : ""
              } with ticket${
                claimedTickets.length > 1 ? "s" : ""
              } #${claimedTickets.map((t) => t.ticketNumber).join(", #")}!`
            : "";

        results.push({
          competitionId: item.competition.id,
          success: true,
          message: `Successfully purchased ${item.quantity} tickets${winningMessage}`,
          entryId: competitionEntry.id,
          ticketNumbers,
          winningTickets: claimedTickets,
        });
      }

      // Update wallet balance if wallet credit was used
      if (walletCreditUsed > 0) {
        await trx
          .updateTable("wallets")
          .set({
            balance: wallet.balance - walletCreditUsed,
          })
          .where("id", "=", wallet.id)
          .execute();
      }

      const scenarioMessage =
        cardPaymentAmount === 0
          ? "Purchase completed using wallet credit only"
          : walletCreditUsed === 0
          ? "Purchase completed using card payment only"
          : `Purchase completed using ${formatPrice(
              walletCreditUsed
            )} wallet credit + ${formatPrice(cardPaymentAmount)} card payment`;

      return {
        success: true,
        message: scenarioMessage,
        results,
        walletAmount: walletCreditUsed,
        cardAmount: cardPaymentAmount,
      };
    });
  } catch (error) {
    console.error("Hybrid checkout error:", error);
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "An error occurred during checkout",
    };
  } finally {
    // Revalidate relevant paths
    revalidatePath("/competitions/[id]");
    revalidatePath("/profile");
    revalidatePath("/checkout");
  }
}

export async function checkoutWithTransaction(
  items: CartItem[],
  checkoutId?: string
) {
  try {
    let paymentTransactionId: string | undefined = undefined;
    if (checkoutId) {
      const { db } = await import("@/db");
      const tx = await db
        .selectFrom("payment_transactions")
        .select("id")
        .where("checkout_id", "=", checkoutId)
        .executeTakeFirst();
      if (tx) paymentTransactionId = tx.id;
    }

    return await processHybridCheckout(items, paymentTransactionId);
  } catch (error) {
    console.error("Checkout error:", error);
    return {
      success: false,
      message: "An error occurred during checkout",
      results: [],
    };
  }
}

export async function processWalletOnlyCheckout(items: CartItem[]) {
  return await processHybridCheckout(items); // No payment transaction ID = wallet-only
}
