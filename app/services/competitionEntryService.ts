"use server";

import { db } from "@/db";
import { sql } from "kysely";
import { auth } from "@clerk/nextjs/server";

export interface CompetitionEntry {
  id: string;
  competition_id: string;
  user_id: string;
  wallet_transaction_id: string;
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
      thumbnail?: string;
      images?: string[];
    } | null;
  };
}

export interface CompetitionEntryTicket {
  id: string;
  competition_entry_id: string;
  competition_id: string;
  ticket_number: number;
  winning_ticket: boolean;
  created_at: Date;
  updated_at: Date;
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

    // Get winning tickets for these entries
    const winningTickets = await db
      .selectFrom("winning_tickets")
      .select(["ticket_number", "competition_entry_id"])
      .where("competition_entry_id", "in", entryIds)
      .where("status", "=", "claimed")
      .execute();

    // Create a map of winning tickets by entry ID
    const winningTicketsByEntryId = winningTickets.reduce((acc, ticket) => {
      if (!acc[ticket.competition_entry_id]) {
        acc[ticket.competition_entry_id] = [];
      }
      acc[ticket.competition_entry_id].push(ticket.ticket_number);
      return acc;
    }, {} as Record<string, number[]>);

    // Format entries with their tickets
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
              thumbnail?: string;
              images?: string[];
            })
          : null,
      },
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
  walletTransactionId: string,
  numberOfTickets: number,
  paymentTransactionId: string
): Promise<{
  success: boolean;
  entry?: CompetitionEntry;
  error?: string;
}> {
  try {
    // Find next available ticket numbers for this competition
    const nextTicketNumbers = await findNextAvailableTicketNumbers(
      competitionId,
      numberOfTickets
    );

    if (!nextTicketNumbers || nextTicketNumbers.length !== numberOfTickets) {
      return {
        success: false,
        error: "Not enough available ticket numbers",
      };
    }

    // Create the competition entry
    const [entry] = await db
      .insertInto("competition_entries")
      .values({
        competition_id: competitionId,
        user_id: userId,
        wallet_transaction_id: walletTransactionId,
        payment_transaction_id: paymentTransactionId,
      })
      .returningAll()
      .execute();

    // Create individual ticket records
    const ticketValues = nextTicketNumbers.map((ticketNumber) => ({
      competition_entry_id: entry.id,
      competition_id: competitionId,
      ticket_number: ticketNumber,
      winning_ticket: false,
    }));

    await db
      .insertInto("competition_entry_tickets")
      .values(ticketValues)
      .execute();

    // Fetch the complete entry with tickets
    const [completeEntry] = await db
      .selectFrom("competition_entries as ce")
      .innerJoin("competitions as c", "c.id", "ce.competition_id")
      .select([
        "ce.id",
        "ce.competition_id",
        "ce.user_id",
        "ce.wallet_transaction_id",
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

    const tickets = await db
      .selectFrom("competition_entry_tickets")
      .selectAll()
      .where("competition_entry_id", "=", entry.id)
      .orderBy("ticket_number", "asc")
      .execute();

    return {
      success: true,
      entry: {
        ...completeEntry,
        tickets,
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
                thumbnail?: string;
                images?: string[];
              })
            : null,
        },
      },
    };
  } catch (error) {
    console.error("Error purchasing competition entry:", error);
    return {
      success: false,
      error: "Failed to purchase competition entry",
    };
  }
}

async function findNextAvailableTicketNumbers(
  competitionId: string,
  count: number
): Promise<number[]> {
  try {
    // Get all existing ticket numbers for this competition from competition_entry_tickets table
    const existingTickets = await db
      .selectFrom("competition_entry_tickets")
      .select("ticket_number")
      .where("competition_id", "=", competitionId)
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
