"use server";

import { auth } from "@clerk/nextjs/server";
import {
  allocateTicketNumbers,
  createCompetitionEntry,
  claimWinningTickets,
} from "./ticket.actions";

interface CartItem {
  competition: {
    id: string;
    title: string;
    type: string;
    ticket_price: number;
  };
  quantity: number;
}

export interface TicketAllocationResult {
  success: boolean;
  error?: string;
  results: Array<{
    competitionId: string;
    success: boolean;
    message: string;
    entryId?: string;
    ticketNumbers?: number[];
    winningTickets?: Array<{ ticketNumber: number; prizeId: string }>;
  }>;
  message: string;
}

export async function allocateTickets(
  items: CartItem[],
  walletTransactionIds: string[],
  paymentTransactionId?: string
): Promise<TicketAllocationResult> {
  try {
    const session = await auth();
    if (!session?.userId) {
      return {
        success: false,
        error: "You must be logged in to allocate tickets",
        results: [],
        message: "Authentication required",
      };
    }

    const { db } = await import("@/db");

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

      const results = [];
      let walletTransactionIndex = 0;

      for (const item of items) {
        try {
          // 1. Allocate ticket numbers
          const allocation = await allocateTicketNumbers(
            item.competition.id,
            item.quantity,
            trx
          );

          if (!allocation.success) {
            throw new Error(
              allocation.error ||
                `Failed to allocate tickets for ${item.competition.title}`
            );
          }

          const ticketNumbers = allocation.ticketNumbers!;

          // 2. Determine wallet transaction ID for this item
          const walletTransactionId =
            walletTransactionIds[walletTransactionIndex] || null;
          if (walletTransactionIds.length > 0) {
            walletTransactionIndex++;
          }

          // 3. Create competition entry
          const entryResult = await createCompetitionEntry(
            item.competition.id,
            user.id,
            ticketNumbers,
            walletTransactionId,
            paymentTransactionId,
            trx
          );

          if (!entryResult.success) {
            throw new Error(
              entryResult.error ||
                `Failed to create entry for ${item.competition.title}`
            );
          }

          // 4. Claim any winning tickets
          const claimResult = await claimWinningTickets(
            item.competition.id,
            ticketNumbers,
            user.id,
            entryResult.entryId!,
            trx
          );

          if (!claimResult.success) {
            throw new Error(
              claimResult.error ||
                `Failed to claim winning tickets for ${item.competition.title}`
            );
          }

          // Generate success message with winning ticket info
          const winningMessage =
            claimResult.claimedTickets && claimResult.claimedTickets.length > 0
              ? ` 🎉 Congratulations! You won ${
                  claimResult.claimedTickets.length
                } prize${
                  claimResult.claimedTickets.length > 1 ? "s" : ""
                } with ticket${
                  claimResult.claimedTickets.length > 1 ? "s" : ""
                } #${claimResult.claimedTickets
                  .map((t) => t.ticketNumber)
                  .join(", #")}!`
              : "";

          results.push({
            competitionId: item.competition.id,
            success: true,
            message: `Successfully allocated ${item.quantity} tickets${winningMessage}`,
            entryId: entryResult.entryId,
            ticketNumbers,
            winningTickets: claimResult.claimedTickets,
          });
        } catch (itemError) {
          console.error(
            `Error allocating tickets for ${item.competition.id}:`,
            itemError
          );
          results.push({
            competitionId: item.competition.id,
            success: false,
            message:
              itemError instanceof Error
                ? itemError.message
                : `Failed to allocate tickets for ${item.competition.title}`,
          });
          // If any item fails, we should fail the entire allocation
          throw itemError;
        }
      }

      const totalWinningTickets = results.reduce(
        (count, result) => count + (result.winningTickets?.length || 0),
        0
      );

      const overallMessage =
        totalWinningTickets > 0
          ? `Ticket allocation completed successfully! You won ${totalWinningTickets} prize${
              totalWinningTickets > 1 ? "s" : ""
            }!`
          : "Ticket allocation completed successfully!";

      return {
        success: true,
        results,
        message: overallMessage,
      };
    });
  } catch (error) {
    console.error("Ticket allocation error:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to allocate tickets",
      results: [],
      message: "Ticket allocation failed",
    };
  }
}
