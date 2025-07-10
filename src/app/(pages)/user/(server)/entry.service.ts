"use server";

import { db } from "@/db";
import { sql } from "kysely";
import { auth } from "@clerk/nextjs/server";

export interface CompetitionEntry {
  id: string;
  competition_id: string;
  user_id: string;
  wallet_transaction_id: string | null;
  payment_transaction_id: string | null;
  created_at: Date;
  updated_at: Date;
  tickets: number[];
  competition: {
    id: string;
    title: string;
    type: string;
    status: string;
    end_date: Date;
    media_info: {
      images?: string[];
    } | null;
  };
  winning_tickets?: {
    ticket_number: number;
    prize_id: string;
    prize_name: string;
    prize_value: number;
  }[];
}

export async function getUserCompetitionEntries(): Promise<{
  success: boolean;
  entries?: CompetitionEntry[];
  error?: string;
}> {
  const session = await auth();

  if (!session?.userId) {
    return {
      success: false,
      error: "You must be logged in to view your entries",
    };
  }

  try {
    // Get the user's database ID from their Clerk ID
    const user = await db
      .selectFrom("users")
      .select(["id"])
      .where("clerk_id", "=", session.userId)
      .executeTakeFirst();

    if (!user) {
      return {
        success: false,
        error: "User not found",
      };
    }

    // Fetch all entries with competition data in a single query
    const entries = await db
      .selectFrom("competition_entries as ce")
      .innerJoin("competitions as c", "c.id", "ce.competition_id")
      .select([
        "ce.id",
        "ce.competition_id",
        "ce.user_id",
        "ce.wallet_transaction_id",
        "ce.payment_transaction_id",
        "ce.tickets",
        "ce.created_at",
        "ce.updated_at",
        "c.title",
        "c.type",
        "c.status",
        "c.end_date",
        "c.media_info",
      ])
      .where("ce.user_id", "=", user.id)
      .orderBy("ce.created_at", "desc")
      .execute();

    if (entries.length === 0) {
      return {
        success: true,
        entries: [],
      };
    }

    // Get all entry IDs
    const entryIds = entries.map((entry) => entry.id);

    // Get winning tickets for these entries with prize information
    const winningTickets = await db
      .selectFrom("winning_tickets as wt")
      .innerJoin("competition_prizes as cp", "cp.id", "wt.prize_id")
      .innerJoin("products as p", "p.id", "cp.product_id")
      .select([
        "wt.ticket_number",
        "wt.competition_entry_id",
        "wt.prize_id",
        "p.name as prize_name",
        "p.market_value as prize_value",
      ])
      .where("wt.competition_entry_id", "in", entryIds)
      .where("wt.status", "=", "claimed")
      .execute();

    // Create a map of winning tickets by entry ID
    const winningTicketsByEntryId = winningTickets.reduce(
      (acc, ticket) => {
        if (!acc[ticket.competition_entry_id]) {
          acc[ticket.competition_entry_id] = [];
        }
        acc[ticket.competition_entry_id].push({
          ticket_number: ticket.ticket_number,
          prize_id: ticket.prize_id,
          prize_name: ticket.prize_name,
          prize_value: ticket.prize_value,
        });
        return acc;
      },
      {} as Record<
        string,
        Array<{
          ticket_number: number;
          prize_id: string;
          prize_name: string;
          prize_value: number;
        }>
      >
    );

    // Format entries with their tickets and winning tickets
    const formattedEntries = entries.map((entry) => ({
      ...entry,
      competition: {
        id: entry.competition_id,
        title: entry.title,
        type: entry.type,
        status: entry.status,
        end_date: entry.end_date,
        media_info: entry.media_info
          ? ((typeof entry.media_info === "string"
              ? JSON.parse(entry.media_info)
              : entry.media_info) as {
              images?: string[];
            })
          : null,
      },
      winning_tickets: winningTicketsByEntryId[entry.id] || [],
    }));

    return {
      success: true,
      entries: formattedEntries,
    };
  } catch (error) {
    console.error("Error fetching user competition entries:", error);
    return {
      success: false,
      error: "Failed to fetch competition entries",
    };
  }
}

export async function purchaseCompetitionEntry(
  competitionId: string,
  userId: string,
  walletTransactionId: string | null,
  numberOfTickets: number,
  paymentTransactionId: string | null
): Promise<{
  success: boolean;
  entry?: CompetitionEntry;
  error?: string;
}> {
  try {
    return await db.transaction().execute(async (trx) => {
      // Atomically allocate ticket numbers
      const allocation = await allocateTicketNumbers(
        competitionId,
        numberOfTickets,
        trx
      );

      if (!allocation.success) {
        throw new Error(allocation.error || "Failed to allocate tickets");
      }

      const ticketNumbers = allocation.ticketNumbers!;

      // Create the competition entry with ticket numbers
      const [entry] = await trx
        .insertInto("competition_entries")
        .values({
          competition_id: competitionId,
          user_id: userId,
          wallet_transaction_id: walletTransactionId,
          payment_transaction_id: paymentTransactionId,
          tickets: ticketNumbers,
        })
        .returningAll()
        .execute();

      // Fetch the complete entry with competition data
      const [completeEntry] = await trx
        .selectFrom("competition_entries as ce")
        .innerJoin("competitions as c", "c.id", "ce.competition_id")
        .select([
          "ce.id",
          "ce.competition_id",
          "ce.user_id",
          "ce.wallet_transaction_id",
          "ce.payment_transaction_id",
          "ce.tickets",
          "ce.created_at",
          "ce.updated_at",
          "c.title",
          "c.type",
          "c.status",
          "c.end_date",
          "c.media_info",
        ])
        .where("ce.id", "=", entry.id)
        .execute();

      return {
        success: true,
        entry: {
          ...completeEntry,
          competition: {
            id: completeEntry.competition_id,
            title: completeEntry.title,
            type: completeEntry.type,
            status: completeEntry.status,
            end_date: completeEntry.end_date,
            media_info: completeEntry.media_info
              ? ((typeof completeEntry.media_info === "string"
                  ? JSON.parse(completeEntry.media_info)
                  : completeEntry.media_info) as {
                  images?: string[];
                })
              : null,
          },
        },
      };
    });
  } catch (error) {
    console.error("Error purchasing competition entry:", error);
    return {
      success: false,
      error: "Failed to purchase competition entry",
    };
  }
}

// Atomic ticket allocation function
async function allocateTicketNumbers(
  competitionId: string,
  count: number,
  trx: any
): Promise<{ success: boolean; ticketNumbers?: number[]; error?: string }> {
  try {
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
