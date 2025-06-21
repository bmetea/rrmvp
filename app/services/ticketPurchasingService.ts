"use server";

import { db } from "@/db";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

interface PurchaseResult {
  success: boolean;
  message: string;
  ticketId?: string;
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

        // 5. Create a single ticket entry with number_of_tickets
        const ticketNumber =
          Math.floor(Math.random() * competition.total_tickets) + 1;
        const ticket = await trx
          .insertInto("tickets")
          .values({
            competition_id: competitionId,
            user_id: user.id,
            wallet_transaction_id: walletTransaction.id,
            status: "active",
            ticket_number: ticketNumber,
            number_of_tickets: ticketCount,
          })
          .returning("id")
          .executeTakeFirst();

        if (!ticket) {
          throw new Error("Failed to create ticket");
        }

        // 6. Update competition tickets sold count
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
          message: `Successfully purchased ${ticketCount} tickets`,
          ticketId: ticket.id,
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
