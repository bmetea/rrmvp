"use server";

import { processCheckout } from "@/services/checkoutService";
import { revalidatePath } from "next/cache";
import { auth } from "@clerk/nextjs/server";

interface CartItem {
  competition: {
    id: string;
    title: string;
    type: string;
    ticket_price: number;
  };
  quantity: number;
}

export async function checkout(
  items: CartItem[],
  paymentTransactionId?: string
) {
  try {
    const result = await processCheckout(items, paymentTransactionId);

    if (result.success) {
      // Revalidate relevant paths
      revalidatePath("/competitions/[id]");
      revalidatePath("/profile");
      revalidatePath("/checkout");
    }

    return result;
  } catch (error) {
    console.error("Checkout error:", error);
    return {
      success: false,
      message: "An error occurred during checkout",
      results: [],
    };
  }
}

// Helper function to find next available ticket numbers (copied from ticketPurchasingService)
async function findNextAvailableTicketNumbers(
  competitionId: string,
  count: number,
  trx: any
): Promise<number[]> {
  try {
    // Get all existing ticket numbers for this competition from competition_entries table
    const entries = await trx
      .selectFrom("competition_entries")
      .select("tickets")
      .where("competition_id", "=", competitionId)
      .execute();

    // Flatten all ticket arrays into a single set of used numbers
    const existingNumbers = new Set(
      entries.flatMap((entry) => entry.tickets || [])
    );

    // Find the next available numbers
    const availableNumbers: number[] = [];
    let currentNumber = 1;

    while (availableNumbers.length < count) {
      if (!existingNumbers.has(currentNumber)) {
        availableNumbers.push(currentNumber);
      }
      currentNumber++;
    }

    return availableNumbers;
  } catch (error) {
    console.error("Error finding next available ticket numbers:", error);
    return [];
  }
}

export async function processHybridCheckout(
  items: CartItem[],
  paymentTransactionId?: string
): Promise<{
  success: boolean;
  message: string;
  results?: any[];
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

        // Create tickets using local helper function
        const ticketNumbers = await findNextAvailableTicketNumbers(
          item.competition.id,
          item.quantity,
          trx
        );

        if (ticketNumbers.length !== item.quantity) {
          throw new Error(
            `Not enough available ticket numbers for competition ${item.competition.id}`
          );
        }

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

        // Update competition tickets sold count
        const currentCompetition = await trx
          .selectFrom("competitions")
          .select("tickets_sold")
          .where("id", "=", item.competition.id)
          .executeTakeFirst();

        await trx
          .updateTable("competitions")
          .set({
            tickets_sold:
              (currentCompetition?.tickets_sold || 0) + item.quantity,
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
          : `Purchase completed using £${(walletCreditUsed / 100).toFixed(
              2
            )} wallet credit + £${(cardPaymentAmount / 100).toFixed(
              2
            )} card payment`;

      return {
        success: true,
        message: scenarioMessage,
        results,
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

export async function getUserWalletBalance(): Promise<{
  success: boolean;
  balance?: number;
  error?: string;
}> {
  try {
    const session = await auth();

    if (!session?.userId) {
      return {
        success: false,
        error: "You must be logged in to view wallet balance",
      };
    }

    const { db } = await import("@/db");

    // Get database user ID from Clerk user ID
    const user = await db
      .selectFrom("users")
      .select("id")
      .where("clerk_id", "=", session.userId)
      .executeTakeFirst();

    if (!user) {
      return {
        success: false,
        error: "User not found",
      };
    }

    // Get wallet balance
    const wallet = await db
      .selectFrom("wallets")
      .select("balance")
      .where("user_id", "=", user.id)
      .executeTakeFirst();

    return {
      success: true,
      balance: wallet?.balance ?? 0,
    };
  } catch (error) {
    console.error("Error getting wallet balance:", error);
    return {
      success: false,
      error: "Failed to get wallet balance",
    };
  }
}

export async function processWalletOnlyCheckout(items: CartItem[]) {
  return await processHybridCheckout(items); // No payment transaction ID = wallet-only
}
