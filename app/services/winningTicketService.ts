import { db } from "@/db";

export interface WinningTicketStats {
  competitionId: string;
  totalWinningTickets: number;
  claimedTickets: number;
  availableTickets: number;
  prizeBreakdown: {
    prizeId: string;
    prizeName: string;
    totalTickets: number;
    claimed: number;
    available: number;
  }[];
}

export interface WinningTicketInfo {
  id: string;
  competitionId: string;
  prizeId: string;
  ticketNumber: number;
  status: "available" | "claimed";
  claimedByUserId?: string;
  claimedAt?: Date;
  prizeName: string;
  prizeValue: number;
}

/**
 * Get comprehensive winning ticket statistics for a competition
 * Much more efficient than array-based queries
 */
export async function getWinningTicketStats(
  competitionId: string
): Promise<WinningTicketStats | null> {
  try {
    const stats = await db
      .selectFrom("winning_tickets as wt")
      .innerJoin("competition_prizes as cp", "cp.id", "wt.prize_id")
      .innerJoin("products as p", "p.id", "cp.product_id")
      .select([
        "wt.competition_id",
        "wt.prize_id",
        "p.name as prize_name",
        "wt.status",
        db.fn.count("wt.id").as("ticket_count"),
      ])
      .where("wt.competition_id", "=", competitionId)
      .groupBy(["wt.competition_id", "wt.prize_id", "p.name", "wt.status"])
      .execute();

    if (stats.length === 0) {
      return null;
    }

    // Process the stats to create the breakdown
    const prizeMap = new Map<
      string,
      {
        prizeId: string;
        prizeName: string;
        totalTickets: number;
        claimed: number;
        available: number;
      }
    >();

    let totalWinningTickets = 0;
    let claimedTickets = 0;
    let availableTickets = 0;

    for (const stat of stats) {
      const ticketCount = Number(stat.ticket_count);
      totalWinningTickets += ticketCount;

      if (stat.status === "claimed") {
        claimedTickets += ticketCount;
      } else {
        availableTickets += ticketCount;
      }

      // Update prize breakdown
      const prizeKey = stat.prize_id;
      if (!prizeMap.has(prizeKey)) {
        prizeMap.set(prizeKey, {
          prizeId: stat.prize_id,
          prizeName: stat.prize_name,
          totalTickets: 0,
          claimed: 0,
          available: 0,
        });
      }

      const prizeData = prizeMap.get(prizeKey)!;
      prizeData.totalTickets += ticketCount;

      if (stat.status === "claimed") {
        prizeData.claimed += ticketCount;
      } else {
        prizeData.available += ticketCount;
      }
    }

    return {
      competitionId,
      totalWinningTickets,
      claimedTickets,
      availableTickets,
      prizeBreakdown: Array.from(prizeMap.values()),
    };
  } catch (error) {
    console.error("Error getting winning ticket stats:", error);
    return null;
  }
}

/**
 * Get all winning tickets for a competition with prize information
 * Single efficient query instead of array operations
 */
export async function getWinningTickets(
  competitionId: string
): Promise<WinningTicketInfo[]> {
  try {
    const tickets = await db
      .selectFrom("winning_tickets as wt")
      .innerJoin("competition_prizes as cp", "cp.id", "wt.prize_id")
      .innerJoin("products as p", "p.id", "cp.product_id")
      .select([
        "wt.id",
        "wt.competition_id",
        "wt.prize_id",
        "wt.ticket_number",
        "wt.status",
        "wt.claimed_by_user_id",
        "wt.claimed_at",
        "p.name as prize_name",
        "p.market_value as prize_value",
      ])
      .where("wt.competition_id", "=", competitionId)
      .orderBy("wt.ticket_number", "asc")
      .execute();

    return tickets.map((ticket) => ({
      id: ticket.id,
      competitionId: ticket.competition_id,
      prizeId: ticket.prize_id,
      ticketNumber: ticket.ticket_number,
      status: ticket.status as "available" | "claimed",
      claimedByUserId: ticket.claimed_by_user_id || undefined,
      claimedAt: ticket.claimed_at || undefined,
      prizeName: ticket.prize_name,
      prizeValue: ticket.prize_value,
    }));
  } catch (error) {
    console.error("Error getting winning tickets:", error);
    return [];
  }
}

/**
 * Check if a specific ticket number is a winning ticket
 * Much faster than array containment checks
 */
export async function isWinningTicket(
  competitionId: string,
  ticketNumber: number
): Promise<{
  isWinning: boolean;
  isAvailable: boolean;
  prizeId?: string;
  prizeName?: string;
}> {
  try {
    const ticket = await db
      .selectFrom("winning_tickets as wt")
      .innerJoin("competition_prizes as cp", "cp.id", "wt.prize_id")
      .innerJoin("products as p", "p.id", "cp.product_id")
      .select(["wt.status", "wt.prize_id", "p.name as prize_name"])
      .where("wt.competition_id", "=", competitionId)
      .where("wt.ticket_number", "=", ticketNumber)
      .executeTakeFirst();

    if (!ticket) {
      return { isWinning: false, isAvailable: false };
    }

    return {
      isWinning: true,
      isAvailable: ticket.status === "available",
      prizeId: ticket.prize_id,
      prizeName: ticket.prize_name,
    };
  } catch (error) {
    console.error("Error checking winning ticket:", error);
    return { isWinning: false, isAvailable: false };
  }
}

/**
 * Get all available winning tickets for a competition
 * Useful for displaying unclaimed prizes
 */
export async function getAvailableWinningTickets(
  competitionId: string
): Promise<WinningTicketInfo[]> {
  try {
    const tickets = await db
      .selectFrom("winning_tickets as wt")
      .innerJoin("competition_prizes as cp", "cp.id", "wt.prize_id")
      .innerJoin("products as p", "p.id", "cp.product_id")
      .select([
        "wt.id",
        "wt.competition_id",
        "wt.prize_id",
        "wt.ticket_number",
        "wt.status",
        "p.name as prize_name",
        "p.market_value as prize_value",
      ])
      .where("wt.competition_id", "=", competitionId)
      .where("wt.status", "=", "available")
      .orderBy("wt.ticket_number", "asc")
      .execute();

    return tickets.map((ticket) => ({
      id: ticket.id,
      competitionId: ticket.competition_id,
      prizeId: ticket.prize_id,
      ticketNumber: ticket.ticket_number,
      status: ticket.status as "available" | "claimed",
      prizeName: ticket.prize_name,
      prizeValue: ticket.prize_value,
    }));
  } catch (error) {
    console.error("Error getting available winning tickets:", error);
    return [];
  }
}

/**
 * Get user's claimed winning tickets across all competitions
 * Useful for user dashboard
 */
export async function getUserClaimedWinningTickets(
  userId: string
): Promise<WinningTicketInfo[]> {
  try {
    const tickets = await db
      .selectFrom("winning_tickets as wt")
      .innerJoin("competition_prizes as cp", "cp.id", "wt.prize_id")
      .innerJoin("products as p", "p.id", "cp.product_id")
      .innerJoin("competitions as c", "c.id", "wt.competition_id")
      .select([
        "wt.id",
        "wt.competition_id",
        "wt.prize_id",
        "wt.ticket_number",
        "wt.status",
        "wt.claimed_at",
        "p.name as prize_name",
        "p.market_value as prize_value",
        "c.title as competition_title",
      ])
      .where("wt.claimed_by_user_id", "=", userId)
      .where("wt.status", "=", "claimed")
      .orderBy("wt.claimed_at", "desc")
      .execute();

    return tickets.map((ticket) => ({
      id: ticket.id,
      competitionId: ticket.competition_id,
      prizeId: ticket.prize_id,
      ticketNumber: ticket.ticket_number,
      status: ticket.status as "available" | "claimed",
      claimedAt: ticket.claimed_at || undefined,
      prizeName: ticket.prize_name,
      prizeValue: ticket.prize_value,
    }));
  } catch (error) {
    console.error("Error getting user's claimed winning tickets:", error);
    return [];
  }
}
