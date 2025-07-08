"use server";

import { auth } from "@clerk/nextjs/server";

// Atomic ticket allocation function
export async function allocateTicketNumbers(
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

export async function createCompetitionEntry(
  competitionId: string,
  userId: string,
  ticketNumbers: number[],
  walletTransactionId?: string | null,
  paymentTransactionId?: string,
  trx?: any
): Promise<{ success: boolean; entryId?: string; error?: string }> {
  try {
    const dbInstance = trx || (await import("@/db")).db;

    const competitionEntry = await dbInstance
      .insertInto("competition_entries")
      .values({
        competition_id: competitionId,
        user_id: userId,
        wallet_transaction_id: walletTransactionId,
        payment_transaction_id: paymentTransactionId,
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

    // Update competition tickets sold count using atomic increment
    const { sql } = await import("kysely");
    await dbInstance
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
    console.error("Error creating competition entry:", error);
    return {
      success: false,
      error: "Failed to create competition entry",
    };
  }
}

export async function claimWinningTickets(
  competitionId: string,
  ticketNumbers: number[],
  userId: string,
  entryId: string,
  trx?: any
): Promise<{
  success: boolean;
  claimedTickets?: { ticketNumber: number; prizeId: string }[];
  error?: string;
}> {
  try {
    const dbInstance = trx || (await import("@/db")).db;

    // Check for and claim any winning tickets
    const winningTickets = await dbInstance
      .selectFrom("winning_tickets")
      .select(["id", "ticket_number", "prize_id"])
      .where("competition_id", "=", competitionId)
      .where("ticket_number", "in", ticketNumbers)
      .where("status", "=", "available")
      .execute();

    const claimedTickets: { ticketNumber: number; prizeId: string }[] = [];

    // Claim each winning ticket atomically
    for (const winningTicket of winningTickets) {
      const claimedTicket = await dbInstance
        .updateTable("winning_tickets")
        .set({
          status: "claimed",
          claimed_by_user_id: userId,
          claimed_at: new Date(),
          competition_entry_id: entryId,
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

    return {
      success: true,
      claimedTickets,
    };
  } catch (error) {
    console.error("Error claiming winning tickets:", error);
    return {
      success: false,
      error: "Failed to claim winning tickets",
    };
  }
}

export async function processTicketPurchase(
  competitionId: string,
  quantity: number,
  walletTransactionId?: string | null,
  paymentTransactionId?: string,
  trx?: any
): Promise<{
  success: boolean;
  entryId?: string;
  ticketNumbers?: number[];
  claimedTickets?: { ticketNumber: number; prizeId: string }[];
  error?: string;
}> {
  try {
    const session = await auth();
    if (!session?.userId) {
      return {
        success: false,
        error: "You must be logged in to purchase tickets",
      };
    }

    const { db } = await import("@/db");
    const dbInstance = trx || db;

    // Get database user ID from Clerk user ID
    const user = await dbInstance
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

    // 1. Allocate ticket numbers
    const allocation = await allocateTicketNumbers(
      competitionId,
      quantity,
      dbInstance
    );
    if (!allocation.success) {
      return {
        success: false,
        error: allocation.error,
      };
    }

    const ticketNumbers = allocation.ticketNumbers!;

    // 2. Create competition entry
    const entryResult = await createCompetitionEntry(
      competitionId,
      user.id,
      ticketNumbers,
      walletTransactionId,
      paymentTransactionId,
      dbInstance
    );

    if (!entryResult.success) {
      return {
        success: false,
        error: entryResult.error,
      };
    }

    // 3. Claim any winning tickets
    const claimResult = await claimWinningTickets(
      competitionId,
      ticketNumbers,
      user.id,
      entryResult.entryId!,
      dbInstance
    );

    if (!claimResult.success) {
      return {
        success: false,
        error: claimResult.error,
      };
    }

    return {
      success: true,
      entryId: entryResult.entryId,
      ticketNumbers,
      claimedTickets: claimResult.claimedTickets,
    };
  } catch (error) {
    console.error("Error processing ticket purchase:", error);
    return {
      success: false,
      error: "Failed to process ticket purchase",
    };
  }
}
