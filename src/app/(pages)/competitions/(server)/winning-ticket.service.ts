import { db } from "@/db";

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
    // First get the competition to check its type
    const competition = await db
      .selectFrom("competitions")
      .select("type")
      .where("id", "=", competitionId)
      .executeTakeFirst();

    let query = db
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
      .where("wt.competition_id", "=", competitionId);

    // For instant win competitions, order by market_value descending, then by ticket_number
    // For other competition types, keep the original ordering by ticket_number
    if (competition?.type === "instant_win") {
      query = query
        .orderBy("p.market_value", "desc")
        .orderBy("wt.ticket_number", "asc");
    } else {
      query = query.orderBy("wt.ticket_number", "asc");
    }

    const tickets = await query.execute();

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

    const products = Array.from(productMap.values());

    // For instant win competitions, sort the final products array by market value descending
    // to ensure consistent ordering even after grouping
    if (competition?.type === "instant_win") {
      products.sort((a, b) => b.marketValue - a.marketValue);
    }

    return products;
  } catch (error) {
    console.error("Error getting winning tickets by product:", error);
    return [];
  }
}
