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
  media_info: {
    thumbnail?: string;
    images?: string[];
  } | null;
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
  media_info: {
    thumbnail?: string;
    images?: string[];
  } | null;
  prizes: CompetitionPrize[];
};

export const fetchCompetitionsServer = cache(async () => {
  try {
    const competitions = await db
      .selectFrom("competitions")
      .selectAll()
      .where("status", "=", "active")
      .where("start_date", "<=", new Date())
      .where("end_date", ">=", new Date())
      .execute();

    // Parse media_info for each competition
    return competitions.map((competition) => ({
      ...competition,
      media_info: competition.media_info
        ? ((typeof competition.media_info === "string"
            ? JSON.parse(competition.media_info)
            : competition.media_info) as {
            thumbnail?: string;
            images?: string[];
          })
        : null,
    }));
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
      .where("status", "=", "active")
      .where("start_date", "<=", new Date())
      .where("end_date", ">=", new Date())
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

    // Parse media_info from JSON for competition
    const parsedMediaInfo = competition.media_info
      ? ((typeof competition.media_info === "string"
          ? JSON.parse(competition.media_info)
          : competition.media_info) as {
          thumbnail?: string;
          images?: string[];
        })
      : null;

    return {
      ...competition,
      media_info: parsedMediaInfo,
      prizes: competitionPrizes.map((prize) => {
        // Parse media_info from JSON for product
        const parsedProductMediaInfo = prize.media_info
          ? ((typeof prize.media_info === "string"
              ? JSON.parse(prize.media_info)
              : prize.media_info) as {
              images?: string[];
              videos?: string[];
            })
          : null;

        return {
          ...prize,
          product: {
            id: prize.product_id,
            name: prize.name,
            description: prize.description,
            market_value: prize.market_value,
            media_info: parsedProductMediaInfo,
            sub_name: prize.sub_name,
            is_wallet_credit: prize.is_wallet_credit,
            credit_amount: prize.credit_amount,
          },
        };
      }),
    };
  }
);

export const fetchAllCompetitionsServer = cache(async () => {
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
            thumbnail?: string;
            images?: string[];
          })
        : null,
    }));
  } catch (error) {
    console.error("Failed to fetch competitions:", error);
    return [];
  }
});
