import { db } from "@/db";
import { getWinningTicketsByProduct } from "@/(pages)/competitions/(server)/winning-ticket.service";

export type Competition = {
  id: string;
  title: string;
  description: string | null;
  faq: string | null;
  start_date: Date;
  end_date: Date;
  type: string;
  ticket_price: number;
  total_tickets: number;
  tickets_sold: number;
  status: string;
  media_info: {
    thumbnail?: string;
    images?: string[];
  } | null;
  prizes?: CompetitionPrize[];
};

type Product = {
  id: string;
  name: string;
  description: string;
  market_value: number;
  media_info: {
    images?: string[];
    videos?: string[];
  } | null;
  sub_name: string | null;
  is_wallet_credit: boolean;
  credit_amount: number | null;
};

type CompetitionPrize = {
  id: string;
  competition_id: string;
  product_id: string;
  available_quantity: number;
  total_quantity: number;
  won_quantity: number;
  phase: number;
  prize_group: string;
  is_instant_win: boolean;
  winning_ticket_numbers: number[];
  product: Product;
};

export type CompetitionWithPrizes = {
  id: string;
  title: string;
  description: string;
  faq: string | null;
  start_date: Date;
  end_date: Date;
  type: string;
  ticket_price: number;
  total_tickets: number;
  tickets_sold: number;
  status: string;
  media_info: {
    thumbnail?: string;
    images?: string[];
  } | null;
  prizes: CompetitionPrize[];
};

export async function fetchCompetitionsServer() {
  try {
    const competitions = await db
      .selectFrom("competitions")
      .selectAll()
      .where("status", "=", "active")
      .where("start_date", "<=", new Date())
      .where("end_date", ">=", new Date())
      .orderBy("end_date", "asc")
      .execute();

    // Parse media_info for each competition
    return competitions.map((competition) => ({
      ...competition,
      media_info: competition.media_info
        ? ((typeof competition.media_info === "string"
            ? JSON.parse(competition.media_info)
            : competition.media_info) as {
            images?: string[];
          })
        : null,
    }));
  } catch (error) {
    console.error("Failed to fetch competitions:", error);
    return [];
  }
}

export async function fetchCompetitionPrizesServer(
  id: string
): Promise<CompetitionWithPrizes | null> {
  const competition = await db
    .selectFrom("competitions")
    .select([
      "id",
      "title",
      "description",
      "faq",
      "start_date",
      "end_date",
      "type",
      "ticket_price",
      "total_tickets",
      "tickets_sold",
      "status",
      "media_info",
    ])
    .where("competitions.id", "=", id)
    .where("status", "=", "active")
    .where("start_date", "<=", new Date())
    .where("end_date", ">=", new Date())
    .executeTakeFirst();

  if (!competition) {
    return null;
  }

  // Get prizes with winning ticket information
  const prizesWithTickets = await getWinningTicketsByProduct(id);

  // Parse media_info from JSON for competition
  const parsedMediaInfo = competition.media_info
    ? ((typeof competition.media_info === "string"
        ? JSON.parse(competition.media_info)
        : competition.media_info) as {
        images?: string[];
      })
    : null;

  // Transform the data into the expected format
  const prizesWithTicketsAndNumbers = prizesWithTickets.map((product) => {
    const availableTickets = product.winningTickets.filter(
      (t) => t.status === "available"
    ).length;
    const totalTickets = product.winningTickets.length;
    const claimedTickets = totalTickets - availableTickets;

    return {
      id: product.winningTickets[0]?.prizeId || "", // Use first prize ID since they're grouped by product
      competition_id: id,
      product_id: product.productId,
      available_quantity: availableTickets,
      total_quantity: totalTickets,
      won_quantity: claimedTickets,
      phase: product.winningTickets[0]?.phase || 1,
      prize_group: product.winningTickets[0]?.prizeGroup || "",
      is_instant_win: product.winningTickets[0]?.isInstantWin || false,
      winning_ticket_numbers: product.winningTickets
        .map((t) => t.ticketNumber)
        .sort((a, b) => a - b),
      claimed_winning_tickets: product.winningTickets
        .filter((t) => t.status === "claimed")
        .map((t) => t.ticketNumber)
        .sort((a, b) => a - b),
      product: {
        id: product.productId,
        name: product.name || "Prize",
        description: product.description || "",
        market_value: product.marketValue || 0,
        media_info: product.mediaInfo || null,
        sub_name: product.subName || null,
        is_wallet_credit: product.isWalletCredit || false,
        credit_amount: product.creditAmount || null,
      },
    };
  });

  return {
    ...competition,
    media_info: parsedMediaInfo,
    prizes: prizesWithTicketsAndNumbers,
  };
}

export async function fetchAllCompetitionsServer() {
  try {
    const competitions = await db
      .selectFrom("competitions")
      .selectAll()
      .execute();

    // Parse media_info for each competition
    return competitions.map((competition) => ({
      ...competition,
      media_info: competition.media_info
        ? ((typeof competition.media_info === "string"
            ? JSON.parse(competition.media_info)
            : competition.media_info) as {
            images?: string[];
          })
        : null,
    }));
  } catch (error) {
    console.error("Failed to fetch competitions:", error);
    return [];
  }
}
