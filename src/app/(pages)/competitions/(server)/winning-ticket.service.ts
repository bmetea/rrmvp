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
