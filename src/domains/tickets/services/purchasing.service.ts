"use server";

import { db } from "@/db";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

interface PurchaseResult {
  success: boolean;
  message: string;
  entryId?: string;
  ticketNumbers?: number[];
}

// Helper function to claim a winning ticket using the new table-based approach
export async function claimWinningTicket(
  competitionId: string,
  ticketNumber: number,
  userId: string
): Promise<{ success: boolean; message: string; prizeId?: string }> {
  try {
    return await db.transaction().execute(async (trx) => {
      // Find the available winning ticket
      const winningTicket = await trx
        .selectFrom("winning_tickets")
        .select(["id", "prize_id", "status"])
        .where("competition_id", "=", competitionId)
        .where("ticket_number", "=", ticketNumber)
        .where("status", "=", "available")
        .executeTakeFirst();

      if (!winningTicket) {
        return {
          success: false,
          message: "No available winning ticket found for this number",
        };
      }

      // Claim the ticket atomically
      const claimedTicket = await trx
        .updateTable("winning_tickets")
        .set({
          status: "claimed",
          claimed_by_user_id: userId,
          claimed_at: new Date(),
        })
        .where("id", "=", winningTicket.id)
        .where("status", "=", "available") // Double-check to prevent race conditions
        .returning("id")
        .executeTakeFirst();

      if (!claimedTicket) {
        return {
          success: false,
          message: "This winning ticket has already been claimed",
        };
      }

      return {
        success: true,
        message: "Winning ticket claimed successfully",
        prizeId: winningTicket.prize_id,
      };
    });
  } catch (error) {
    console.error("Error claiming winning ticket:", error);
    return {
      success: false,
      message: "An error occurred while claiming the winning ticket",
    };
  }
}

// Helper function to find next available ticket numbers
async function findNextAvailableTicketNumbers(
  competitionId: string,
  count: number
): Promise<number[]> {
  try {
    // Get all existing ticket numbers for this competition from competition_entries table
    const entries = await db
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

export async function purchaseTickets(
  competitionId: string,
  ticketCount: number,
  paymentTransactionId?: string
): Promise<PurchaseResult> {
  try {
    const session = await auth();

    if (!session?.userId) {
      return {
        success: false,
        message: "You must be logged in to purchase tickets",
      };
    }

    return await db.transaction().execute(async (trx) => {
      try {
        // 1. Get user's database ID from their Clerk ID
        const user = await trx
          .selectFrom("users")
          .select(["id"])
          .where("clerk_id", "=", session.userId)
          .executeTakeFirst();

        if (!user) {
          throw new Error("User not found");
        }

        // 2. Get competition details
        const competition = await trx
          .selectFrom("competitions")
          .select([
            "id",
            "ticket_price",
            "total_tickets",
            "tickets_sold",
            "status",
          ])
          .where("id", "=", competitionId)
          .executeTakeFirst();

        if (!competition) {
          throw new Error("Competition not found");
        }

        if (competition.status !== "active") {
          throw new Error("Competition is not active");
        }

        // 3. Check if there are enough tickets available
        if (
          competition.tickets_sold + ticketCount >
          competition.total_tickets
        ) {
          throw new Error("Not enough tickets available");
        }

        // 4. Get user's wallet
        const wallet = await trx
          .selectFrom("wallets")
          .select(["id", "balance"])
          .where("user_id", "=", user.id)
          .executeTakeFirst();

        if (!wallet) {
          throw new Error("Wallet not found");
        }

        // 5. Create wallet transaction
        const totalCost = competition.ticket_price * ticketCount;

        if (!paymentTransactionId && wallet.balance < totalCost) {
          throw new Error("Insufficient wallet balance");
        }

        const walletTransaction = await trx
          .insertInto("wallet_transactions")
          .values({
            wallet_id: wallet.id,
            amount: -totalCost,
            type: "debit",
            status: "completed",
            reference_type: "ticket_purchase",
            description: `Purchased ${ticketCount} tickets for competition ${competitionId}`,
            number_of_tickets: ticketCount,
          })
          .returning("id")
          .executeTakeFirst();

        if (!walletTransaction) {
          throw new Error("Failed to create wallet transaction");
        }

        // Get next available ticket numbers
        const ticketNumbers = await findNextAvailableTicketNumbers(
          competitionId,
          ticketCount
        );

        if (ticketNumbers.length !== ticketCount) {
          throw new Error("Not enough available ticket numbers");
        }

        // 6. Create competition entry with ticket numbers
        const competitionEntry = await trx
          .insertInto("competition_entries")
          .values({
            competition_id: competitionId,
            user_id: user.id,
            wallet_transaction_id: walletTransaction.id,
            tickets: ticketNumbers,
            ...(paymentTransactionId
              ? { payment_transaction_id: paymentTransactionId }
              : {}),
          })
          .returning("id")
          .executeTakeFirst();

        if (!competitionEntry) {
          throw new Error("Failed to create competition entry");
        }

        // 7. Check if any of the purchased tickets are winning tickets and claim them
        const winningTicketsFound: { ticketNumber: number; prizeId: string }[] =
          [];

        // Check for winning tickets using the table-based approach
        const winningTickets = await trx
          .selectFrom("winning_tickets")
          .select(["ticket_number", "prize_id"])
          .where("competition_id", "=", competitionId)
          .where("ticket_number", "in", ticketNumbers)
          .where("status", "=", "available")
          .execute();

        // 8. Claim winning tickets atomically
        for (const winningTicket of winningTickets) {
          // Claim the winning ticket
          const claimedTicket = await trx
            .updateTable("winning_tickets")
            .set({
              status: "claimed",
              claimed_by_user_id: user.id,
              claimed_at: new Date(),
              competition_entry_id: competitionEntry.id,
            })
            .where("competition_id", "=", competitionId)
            .where("ticket_number", "=", winningTicket.ticket_number)
            .where("status", "=", "available") // Double-check to prevent race conditions
            .returning("id")
            .executeTakeFirst();

          if (claimedTicket) {
            winningTicketsFound.push({
              ticketNumber: winningTicket.ticket_number,
              prizeId: winningTicket.prize_id,
            });
          }
        }

        // 9. Update competition tickets sold count
        await trx
          .updateTable("competitions")
          .set({
            tickets_sold: competition.tickets_sold + ticketCount,
          })
          .where("id", "=", competitionId)
          .execute();

        // If we get here, all operations were successful
        // Revalidate relevant paths
        revalidatePath("/competitions/[id]", "page");
        revalidatePath("/profile", "page");

        const winningTicketNumbers = winningTicketsFound.map(
          (wt) => wt.ticketNumber
        );
        const winningMessage =
          winningTicketNumbers.length > 0
            ? ` 🎉 Congratulations! You won ${
                winningTicketNumbers.length
              } prize${winningTicketNumbers.length > 1 ? "s" : ""} with ticket${
                winningTicketNumbers.length > 1 ? "s" : ""
              } #${winningTicketNumbers.join(", #")}!`
            : "";

        return {
          success: true,
          message: `Successfully purchased ${ticketCount} tickets (numbers: ${ticketNumbers.join(
            ", "
          )})${winningMessage}`,
          entryId: competitionEntry.id,
          ticketNumbers,
        };
      } catch (error) {
        // This will trigger a rollback of all changes in the transaction
        throw error;
      }
    });
  } catch (error) {
    console.error("Error in purchase transaction:", error);
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "An error occurred during purchase",
    };
  }
}
