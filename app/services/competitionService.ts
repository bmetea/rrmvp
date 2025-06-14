import { db } from "@/db";
import { cache } from "react";

export type Competition = {
  id: string;
  title: string;
  description: string;
  type: string;
  ticket_price: number;
  total_tickets: number;
  tickets_sold: number;
  start_date: Date;
  end_date: Date;
  status: string;
  created_at: Date;
  updated_at: Date;
};

const allowedSortColumns = [
  "id",
  "title",
  "type",
  "ticket_price",
  "total_tickets",
  "tickets_sold",
  "start_date",
  "end_date",
  "status",
  "created_at",
  "updated_at",
] as const;
type SortColumn = (typeof allowedSortColumns)[number];

type Product = {
  id: string;
  name: string;
  description: string;
  market_value: number;
  media_info: unknown;
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
  min_ticket_percentage: string;
  max_ticket_percentage: string;
  winning_ticket_numbers: string[];
  product: Product;
};

export type CompetitionWithPrizes = {
  id: string;
  title: string;
  description: string;
  start_date: Date;
  end_date: Date;
  type: string;
  ticket_price: number;
  total_tickets: number;
  tickets_sold: number;
  status: string;
  media_info: unknown;
  prizes: CompetitionPrize[];
};

export const fetchCompetitionsServer = cache(async () => {
  try {
    const competitions = await db
      .selectFrom("competitions")
      .selectAll()
      .execute();
    return competitions;
  } catch (error) {
    console.error("Failed to fetch competitions:", error);
    return [];
  }
});

export const fetchCompetitionPrizesServer = cache(
  async (id: string): Promise<CompetitionWithPrizes | null> => {
    const competition = await db
      .selectFrom("competitions")
      .select([
        "id",
        "title",
        "description",
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
      .executeTakeFirst();

    if (!competition) {
      return null;
    }

    const competitionPrizes = await db
      .selectFrom("competition_prizes")
      .innerJoin("products", "competition_prizes.product_id", "products.id")
      .select([
        "competition_prizes.id",
        "competition_prizes.competition_id",
        "competition_prizes.product_id",
        "competition_prizes.available_quantity",
        "competition_prizes.total_quantity",
        "competition_prizes.won_quantity",
        "competition_prizes.phase",
        "competition_prizes.prize_group",
        "competition_prizes.is_instant_win",
        "competition_prizes.min_ticket_percentage",
        "competition_prizes.max_ticket_percentage",
        "competition_prizes.winning_ticket_numbers",
        "products.id as product_id",
        "products.name",
        "products.description",
        "products.market_value",
        "products.media_info",
        "products.sub_name",
        "products.is_wallet_credit",
        "products.credit_amount",
      ])
      .where("competition_prizes.competition_id", "=", id)
      .execute();

    return {
      ...competition,
      prizes: competitionPrizes.map((prize) => ({
        ...prize,
        product: {
          id: prize.product_id,
          name: prize.name,
          description: prize.description,
          market_value: prize.market_value,
          media_info: prize.media_info,
          sub_name: prize.sub_name,
          is_wallet_credit: prize.is_wallet_credit,
          credit_amount: prize.credit_amount,
        },
      })),
    };
  }
);

export async function fetchCompetitionByIdServer(id: string) {
  try {
    const competition = await db
      .selectFrom("competitions")
      .selectAll()
      .where("id", "=", id)
      .executeTakeFirst();
    return competition;
  } catch (error) {
    console.error("Failed to fetch competition:", error);
    return null;
  }
}

// Commented out because 'slug' is not a valid column in Competition type
// export async function fetchCompetitionBySlugServer(slug: string) {
//   try {
//     const competition = await db
//       .selectFrom("competitions")
//       .selectAll()
//       .where("slug", "=", slug)
//       .executeTakeFirst();
//     return competition;
//   } catch (error) {
//     console.error("Failed to fetch competition:", error);
//     return null;
//   }
// }

export async function fetchCompetitionsByStatusServer(status: string) {
  try {
    const competitions = await db
      .selectFrom("competitions")
      .selectAll()
      .where("status", "=", status)
      .execute();
    return competitions;
  } catch (error) {
    console.error("Failed to fetch competitions:", error);
    return [];
  }
}

export async function fetchCompetitionsByTypeServer(type: string) {
  try {
    const competitions = await db
      .selectFrom("competitions")
      .selectAll()
      .where("type", "=", type)
      .execute();
    return competitions;
  } catch (error) {
    console.error("Failed to fetch competitions:", error);
    return [];
  }
}

export async function fetchCompetitionsByDateRangeServer(
  startDate: Date,
  endDate: Date
) {
  try {
    const competitions = await db
      .selectFrom("competitions")
      .selectAll()
      .where("start_date", ">=", startDate)
      .where("end_date", "<=", endDate)
      .execute();
    return competitions;
  } catch (error) {
    console.error("Failed to fetch competitions:", error);
    return [];
  }
}

export async function fetchCompetitionsByPriceRangeServer(
  minPrice: number,
  maxPrice: number
) {
  try {
    const competitions = await db
      .selectFrom("competitions")
      .selectAll()
      .where("ticket_price", ">=", minPrice)
      .where("ticket_price", "<=", maxPrice)
      .execute();
    return competitions;
  } catch (error) {
    console.error("Failed to fetch competitions:", error);
    return [];
  }
}

export async function fetchCompetitionsByTicketsRangeServer(
  minTickets: number,
  maxTickets: number
) {
  try {
    const competitions = await db
      .selectFrom("competitions")
      .selectAll()
      .where("total_tickets", ">=", minTickets)
      .where("total_tickets", "<=", maxTickets)
      .execute();
    return competitions;
  } catch (error) {
    console.error("Failed to fetch competitions:", error);
    return [];
  }
}

export async function fetchCompetitionsByTicketsSoldRangeServer(
  minTicketsSold: number,
  maxTicketsSold: number
) {
  try {
    const competitions = await db
      .selectFrom("competitions")
      .selectAll()
      .where("tickets_sold", ">=", minTicketsSold)
      .where("tickets_sold", "<=", maxTicketsSold)
      .execute();
    return competitions;
  } catch (error) {
    console.error("Failed to fetch competitions:", error);
    return [];
  }
}

export async function fetchCompetitionsBySearchServer(searchTerm: string) {
  try {
    const competitions = await db
      .selectFrom("competitions")
      .selectAll()
      .where((eb) =>
        eb.or([
          eb("title", "ilike", `%${searchTerm}%`),
          eb("description", "ilike", `%${searchTerm}%`),
        ])
      )
      .execute();
    return competitions;
  } catch (error) {
    console.error("Failed to fetch competitions:", error);
    return [];
  }
}

export async function fetchCompetitionsBySortServer(
  sortBy: SortColumn,
  sortOrder: "asc" | "desc"
) {
  try {
    const competitions = await db
      .selectFrom("competitions")
      .selectAll()
      .orderBy(sortBy, sortOrder)
      .execute();
    return competitions;
  } catch (error) {
    console.error("Failed to fetch competitions:", error);
    return [];
  }
}

export async function fetchCompetitionsByFilterServer(
  filters: Partial<{
    status: string;
    type: string;
    minPrice: number;
    maxPrice: number;
    minTickets: number;
    maxTickets: number;
    minTicketsSold: number;
    maxTicketsSold: number;
    startDate: Date;
    endDate: Date;
    searchTerm: string;
    sortBy: SortColumn;
    sortOrder: "asc" | "desc";
  }>
) {
  try {
    let query = db.selectFrom("competitions").selectAll();

    if (filters.status) {
      query = query.where("status", "=", filters.status);
    }

    if (filters.type) {
      query = query.where("type", "=", filters.type);
    }

    if (filters.minPrice) {
      query = query.where("ticket_price", ">=", filters.minPrice);
    }

    if (filters.maxPrice) {
      query = query.where("ticket_price", "<=", filters.maxPrice);
    }

    if (filters.minTickets) {
      query = query.where("total_tickets", ">=", filters.minTickets);
    }

    if (filters.maxTickets) {
      query = query.where("total_tickets", "<=", filters.maxTickets);
    }

    if (filters.minTicketsSold) {
      query = query.where("tickets_sold", ">=", filters.minTicketsSold);
    }

    if (filters.maxTicketsSold) {
      query = query.where("tickets_sold", "<=", filters.maxTicketsSold);
    }

    if (filters.startDate) {
      query = query.where("start_date", ">=", filters.startDate);
    }

    if (filters.endDate) {
      query = query.where("end_date", "<=", filters.endDate);
    }

    if (filters.searchTerm) {
      query = query.where((eb) =>
        eb.or([
          eb("title", "ilike", `%${filters.searchTerm}%`),
          eb("description", "ilike", `%${filters.searchTerm}%`),
        ])
      );
    }

    if (filters.sortBy && allowedSortColumns.includes(filters.sortBy)) {
      query = query.orderBy(filters.sortBy, filters.sortOrder || "asc");
    }

    const competitions = await query.execute();
    return competitions;
  } catch (error) {
    console.error("Failed to fetch competitions:", error);
    return [];
  }
}
