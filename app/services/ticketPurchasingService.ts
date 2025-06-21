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

// Helper function to move a winning ticket from available to claimed
export async function claimWinningTicket(
  competitionId: string,
  ticketNumber: number
): Promise<{ success: boolean; message: string; prizeId?: string }> {
  try {
    return await db.transaction().execute(async (trx) => {
      // Find the prize that has this winning ticket number
      const prize = await trx
        .selectFrom("competition_prizes")
        .select(["id", "winning_ticket_numbers", "claimed_winning_tickets"])
        .where("competition_id", "=", competitionId)
        .where("winning_ticket_numbers", "@>", [ticketNumber])
        .executeTakeFirst();

      if (!prize) {
        return {
          success: false,
          message: "No winning prize found for this ticket number",
        };
      }

      // Check if the ticket is already claimed
      if (
        prize.claimed_winning_tickets &&
        prize.claimed_winning_tickets.includes(ticketNumber)
      ) {
        return {
          success: false,
          message: "This winning ticket has already been claimed",
        };
      }

      // Remove the ticket from winning_ticket_numbers and add to claimed_winning_tickets
      const updatedWinningTickets =
        prize.winning_ticket_numbers?.filter((num) => num !== ticketNumber) ||
        [];

      const updatedClaimedTickets = [
        ...(prize.claimed_winning_tickets || []),
        ticketNumber,
      ];

      // Update the prize
      await trx
        .updateTable("competition_prizes")
        .set({
          winning_ticket_numbers: updatedWinningTickets,
          claimed_winning_tickets: updatedClaimedTickets,
          updated_at: new Date(),
        })
        .where("id", "=", prize.id)
        .execute();

      return {
        success: true,
        message: "Winning ticket claimed successfully",
        prizeId: prize.id,
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
    // Get all existing ticket numbers for this competition from both tables
    const existingTickets = await db
      .selectFrom("tickets")
      .select("ticket_number")
      .where("competition_id", "=", competitionId)
      .union(
        db
          .selectFrom("competition_entry_tickets")
          .select("ticket_number")
          .where("competition_id", "=", competitionId)
      )
      .execute();

    const existingNumbers = new Set(
      existingTickets.map((ticket) => ticket.ticket_number)
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
  ticketCount: number
): Promise<PurchaseResult> {
  const session = await auth();

  if (!session?.userId) {
    return {
      success: false,
      message: "You must be logged in to purchase tickets",
    };
  }

  try {
    // Start a transaction to ensure data consistency
    return await db.transaction().execute(async (trx) => {
      try {
        // 1. Get the competition and validate it's available
        const competition = await trx
          .selectFrom("competitions")
          .select([
            "id",
            "ticket_price",
            "total_tickets",
            "tickets_sold",
            "status",
            "end_date",
          ])
          .where("id", "=", competitionId)
          .executeTakeFirst();

        if (!competition) {
          return {
            success: false,
            message: "Competition not found",
          };
        }

        // Validate competition status and availability
        if (competition.status !== "active") {
          return {
            success: false,
            message: "This competition is not active",
          };
        }

        if (new Date() > competition.end_date) {
          return {
            success: false,
            message: "This competition has ended",
          };
        }

        if (
          competition.tickets_sold + ticketCount >
          competition.total_tickets
        ) {
          return {
            success: false,
            message: "Not enough tickets available",
          };
        }

        // 2. Get user and their wallet
        const user = await trx
          .selectFrom("users")
          .select(["id"])
          .where("clerk_id", "=", session.userId)
          .executeTakeFirst();

        if (!user) {
          return {
            success: false,
            message: "User not found",
          };
        }

        const wallet = await trx
          .selectFrom("wallets")
          .select(["id", "balance"])
          .where("user_id", "=", user.id)
          .executeTakeFirst();

        if (!wallet) {
          return {
            success: false,
            message: "Wallet not found",
          };
        }

        const totalCost = competition.ticket_price * ticketCount;
        if (wallet.balance < totalCost) {
          return {
            success: false,
            message: "Insufficient balance",
          };
        }

        // 3. Create wallet transaction
        const walletTransaction = await trx
          .insertInto("wallet_transactions")
          .values({
            wallet_id: wallet.id,
            amount: totalCost,
            type: "debit",
            status: "completed",
            reference_type: "ticket_purchase",
            reference_id: competitionId,
            description: `Purchase of ${ticketCount} tickets for competition ${competitionId}`,
            number_of_tickets: ticketCount,
          })
          .returning("id")
          .executeTakeFirst();

        if (!walletTransaction) {
          throw new Error("Failed to create wallet transaction");
        }

        // 4. Update wallet balance
        await trx
          .updateTable("wallets")
          .set({
            balance: wallet.balance - totalCost,
          })
          .where("id", "=", wallet.id)
          .execute();

        // 5. Find next available ticket numbers
        const ticketNumbers = await findNextAvailableTicketNumbers(
          competitionId,
          ticketCount
        );

        if (ticketNumbers.length !== ticketCount) {
          throw new Error("Not enough available ticket numbers");
        }

        // 6. Create competition entry
        const competitionEntry = await trx
          .insertInto("competition_entries")
          .values({
            competition_id: competitionId,
            user_id: user.id,
            wallet_transaction_id: walletTransaction.id,
          })
          .returning("id")
          .executeTakeFirst();

        if (!competitionEntry) {
          throw new Error("Failed to create competition entry");
        }

        // 7. Create individual ticket records in competition_entry_tickets
        const ticketValues = ticketNumbers.map((ticketNumber) => ({
          competition_entry_id: competitionEntry.id,
          competition_id: competitionId,
          ticket_number: ticketNumber,
          winning_ticket: false,
        }));

        await trx
          .insertInto("competition_entry_tickets")
          .values(ticketValues)
          .execute();

        // 8. Update competition tickets sold count
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

        return {
          success: true,
          message: `Successfully purchased ${ticketCount} tickets (numbers: ${ticketNumbers.join(
            ", "
          )})`,
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
