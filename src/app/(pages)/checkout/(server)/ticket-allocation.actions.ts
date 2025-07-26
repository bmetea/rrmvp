"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { sql } from "kysely";
import { logCheckoutError } from "@/shared/lib/logger";

// --- Internal Helper Functions (previously in ticket.actions.ts) ---

async function _allocateTicketNumbers(
  competitionId: string,
  count: number,
  trx: any
): Promise<{ success: boolean; ticketNumbers?: number[]; error?: string }> {
  try {
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
    logCheckoutError("ticket number allocation", error, {
      competitionId,
      count,
    });
    return {
      success: false,
      error: "Failed to allocate tickets",
    };
  }
}

async function _createCompetitionEntry(
  competitionId: string,
  userId: string,
  ticketNumbers: number[],
  orderId: string,
  trx: any
): Promise<{ success: boolean; entryId?: string; error?: string }> {
  try {
    const competitionEntry = await trx
      .insertInto("competition_entries")
      .values({
        competition_id: competitionId,
        user_id: userId,
        order_id: orderId,
        tickets: ticketNumbers,
      })
      .returning("id")
      .executeTakeFirst();

    if (!competitionEntry) {
      return {
        success: false,
        error: "Failed to create competition entry",
      };
    }

    await trx
      .updateTable("competitions")
      .set({
        tickets_sold: sql`tickets_sold + ${ticketNumbers.length}`,
      })
      .where("id", "=", competitionId)
      .execute();

    return {
      success: true,
      entryId: competitionEntry.id,
    };
  } catch (error) {
    logCheckoutError("competition entry creation", error, {
      competitionId,
      userId,
      ticketCount: ticketNumbers.length,
      orderId,
    });
    return {
      success: false,
      error: "Failed to create competition entry",
    };
  }
}

async function _claimWinningTickets(
  competitionId: string,
  ticketNumbers: number[],
  userId: string,
  entryId: string,
  trx: any
): Promise<{
  success: boolean;
  claimedTickets?: { ticketNumber: number; prizeId: string }[];
  error?: string;
}> {
  try {
    const winningTickets = await trx
      .selectFrom("winning_tickets")
      .select(["id", "ticket_number", "prize_id"])
      .where("competition_id", "=", competitionId)
      .where("ticket_number", "in", ticketNumbers)
      .where("status", "=", "available")
      .execute();

    const claimedTickets: { ticketNumber: number; prizeId: string }[] = [];

    for (const winningTicket of winningTickets) {
      const claimedTicket = await trx
        .updateTable("winning_tickets")
        .set({
          status: "claimed",
          claimed_by_user_id: userId,
          claimed_at: new Date(),
          competition_entry_id: entryId,
        })
        .where("id", "=", winningTicket.id)
        .where("status", "=", "available")
        .returning("id")
        .executeTakeFirst();

      if (claimedTicket) {
        claimedTickets.push({
          ticketNumber: winningTicket.ticket_number,
          prizeId: winningTicket.prize_id,
        });
      }
    }

    return {
      success: true,
      claimedTickets,
    };
  } catch (error) {
    logCheckoutError("winning ticket claiming", error, {
      competitionId,
      userId,
      entryId,
      ticketCount: ticketNumbers.length,
    });
    return {
      success: false,
      error: "Failed to claim winning tickets",
    };
  }
}

// --- Exported Function ---

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
  items: Array<{
    competition: {
      id: string;
      title: string;
      type: string;
      ticket_price: number;
    };
    quantity: number;
  }>,
  orderId: string
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

    return await db.transaction().execute(async (trx) => {
      const user = await trx
        .selectFrom("users")
        .select("id")
        .where("clerk_id", "=", session.userId)
        .executeTakeFirst();

      if (!user) {
        throw new Error("User not found");
      }

      const results = [];

      for (const item of items) {
        try {
          const allocation = await _allocateTicketNumbers(
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

          const entryResult = await _createCompetitionEntry(
            item.competition.id,
            user.id,
            ticketNumbers,
            orderId,
            trx
          );

          if (!entryResult.success) {
            throw new Error(
              entryResult.error ||
                `Failed to create entry for ${item.competition.title}`
            );
          }

          const claimResult = await _claimWinningTickets(
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
          logCheckoutError("ticket allocation for item", itemError, {
            competitionId: item.competition.id,
            competitionTitle: item.competition.title,
            quantity: item.quantity,
            userId: user.id,
          });
          results.push({
            competitionId: item.competition.id,
            success: false,
            message:
              itemError instanceof Error
                ? itemError.message
                : `Failed to allocate tickets for ${item.competition.title}`,
          });
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
    logCheckoutError("ticket allocation", error, {
      itemCount: items.length,
      orderId,
    });
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to allocate tickets",
      results: [],
      message: "Ticket allocation failed",
    };
  }
}
