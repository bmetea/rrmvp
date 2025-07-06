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

/**
 * Get available prizes with winning ticket information for a competition
 * Groups prizes by product_id to handle multiple competition_prizes linking to the same product
 */
export async function getAvailablePrizesWithTickets(
  competitionId: string
): Promise<
  {
    productId: string;
    productName: string;
    productValue: number;
    productDescription: string;
    productMediaInfo: any;
    productSubName: string | null;
    isWalletCredit: boolean;
    creditAmount: number | null;
    prizes: {
      prizeId: string;
      prizeGroup: string;
      phase: number;
      totalTickets: number;
      claimedTickets: number;
      availableTickets: number;
      isInstantWin: boolean;
    }[];
  }[]
> {
  try {
    // Get all prizes and their winning tickets for this competition
    const prizesWithTickets = await db
      .selectFrom("competition_prizes as cp")
      .innerJoin("products as p", "p.id", "cp.product_id")
      .leftJoin("winning_tickets as wt", "wt.prize_id", "cp.id")
      .select([
        "cp.id as prize_id",
        "cp.product_id",
        "cp.prize_group",
        "cp.phase",
        "cp.is_instant_win",
        "p.name as product_name",
        "p.market_value as product_value",
        "p.description as product_description",
        "p.media_info as product_media_info",
        "p.sub_name as product_sub_name",
        "p.is_wallet_credit",
        "p.credit_amount",
        "wt.status",
        db.fn.count("wt.id").as("ticket_count"),
      ])
      .where("cp.competition_id", "=", competitionId)
      .groupBy([
        "cp.id",
        "cp.product_id",
        "cp.prize_group",
        "cp.phase",
        "cp.is_instant_win",
        "p.name",
        "p.market_value",
        "p.description",
        "p.media_info",
        "p.sub_name",
        "p.is_wallet_credit",
        "p.credit_amount",
        "wt.status",
      ])
      .execute();

    // Group prizes by product_id
    const prizesByProduct = new Map<
      string,
      {
        productId: string;
        productName: string;
        productValue: number;
        productDescription: string;
        productMediaInfo: any;
        productSubName: string | null;
        isWalletCredit: boolean;
        creditAmount: number | null;
        prizes: Map<
          string,
          {
            prizeId: string;
            prizeGroup: string;
            phase: number;
            totalTickets: number;
            claimedTickets: number;
            availableTickets: number;
            isInstantWin: boolean;
          }
        >;
      }
    >();

    // Process each prize and its tickets
    for (const prize of prizesWithTickets) {
      if (!prizesByProduct.has(prize.product_id)) {
        prizesByProduct.set(prize.product_id, {
          productId: prize.product_id,
          productName: prize.product_name,
          productValue: prize.product_value,
          productDescription: prize.product_description,
          productMediaInfo:
            typeof prize.product_media_info === "string"
              ? JSON.parse(prize.product_media_info)
              : prize.product_media_info,
          productSubName: prize.product_sub_name,
          isWalletCredit: prize.is_wallet_credit ?? false,
          creditAmount: prize.credit_amount,
          prizes: new Map(),
        });
      }

      const productGroup = prizesByProduct.get(prize.product_id)!;

      if (!productGroup.prizes.has(prize.prize_id)) {
        productGroup.prizes.set(prize.prize_id, {
          prizeId: prize.prize_id,
          prizeGroup: prize.prize_group,
          phase: prize.phase,
          totalTickets: 0,
          claimedTickets: 0,
          availableTickets: 0,
          isInstantWin: prize.is_instant_win ?? false,
        });
      }

      const prizeStats = productGroup.prizes.get(prize.prize_id)!;
      const ticketCount = Number(prize.ticket_count);

      if (prize.status === "claimed") {
        prizeStats.claimedTickets = ticketCount;
      } else {
        prizeStats.availableTickets = ticketCount;
      }
      prizeStats.totalTickets =
        prizeStats.claimedTickets + prizeStats.availableTickets;
    }

    // Convert the Map to the desired return format
    return Array.from(prizesByProduct.values()).map((product) => ({
      productId: product.productId,
      productName: product.productName,
      productValue: product.productValue,
      productDescription: product.productDescription,
      productMediaInfo: product.productMediaInfo,
      productSubName: product.productSubName,
      isWalletCredit: product.isWalletCredit,
      creditAmount: product.creditAmount,
      prizes: Array.from(product.prizes.values()),
    }));
  } catch (error) {
    console.error("Error getting available prizes with tickets:", error);
    return [];
  }
}

/**
 * Get winning tickets grouped by product for a competition
 * Returns product details and associated winning ticket information
 */
export async function getWinningTicketsByProduct(
  competitionId: string
): Promise<
  {
    productId: string;
    name: string;
    description: string;
    mediaInfo: any;
    subName: string | null;
    marketValue: number;
    isWalletCredit: boolean;
    creditAmount: number | null;
    winningTickets: {
      ticketNumber: number;
      status: "available" | "claimed";
      prizeId: string;
      prizeGroup: string;
      phase: number;
      isInstantWin: boolean;
    }[];
  }[]
> {
  try {
    const tickets = await db
      .selectFrom("winning_tickets as wt")
      .innerJoin("competition_prizes as cp", "wt.prize_id", "cp.id")
      .innerJoin("products as p", "cp.product_id", "p.id")
      .select([
        "cp.product_id",
        "p.name",
        "p.description",
        "p.media_info",
        "p.sub_name",
        "p.market_value",
        "p.is_wallet_credit",
        "p.credit_amount",
        "wt.status",
        "wt.ticket_number",
        "wt.prize_id",
        "cp.prize_group",
        "cp.phase",
        "cp.is_instant_win",
      ])
      .where("wt.competition_id", "=", competitionId)
      .orderBy("wt.ticket_number", "asc")
      .execute();

    // Group tickets by product
    const productMap = new Map<
      string,
      {
        productId: string;
        name: string;
        description: string;
        mediaInfo: any;
        subName: string | null;
        marketValue: number;
        isWalletCredit: boolean;
        creditAmount: number | null;
        winningTickets: {
          ticketNumber: number;
          status: "available" | "claimed";
          prizeId: string;
          prizeGroup: string;
          phase: number;
          isInstantWin: boolean;
        }[];
      }
    >();

    for (const ticket of tickets) {
      if (!productMap.has(ticket.product_id)) {
        productMap.set(ticket.product_id, {
          productId: ticket.product_id,
          name: ticket.name,
          description: ticket.description,
          mediaInfo:
            typeof ticket.media_info === "string"
              ? JSON.parse(ticket.media_info)
              : ticket.media_info,
          subName: ticket.sub_name,
          marketValue: ticket.market_value,
          isWalletCredit: ticket.is_wallet_credit ?? false,
          creditAmount: ticket.credit_amount,
          winningTickets: [],
        });
      }

      const product = productMap.get(ticket.product_id)!;
      product.winningTickets.push({
        ticketNumber: ticket.ticket_number,
        status: ticket.status as "available" | "claimed",
        prizeId: ticket.prize_id,
        prizeGroup: ticket.prize_group,
        phase: ticket.phase,
        isInstantWin: ticket.is_instant_win ?? false,
      });
    }

    return Array.from(productMap.values());
  } catch (error) {
    console.error("Error getting winning tickets by product:", error);
    return [];
  }
}
