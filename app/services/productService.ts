import { db } from "@/db";
import { cache } from "react";
import { Products } from "@/db/types";

export type Product = {
  id: string;
  name: string;
  sub_name: string | null;
  market_value: number;
  description: string | null;
  media_info: any;
  is_wallet_credit: boolean;
  credit_amount: number | null;
  created_at: Date | null;
  updated_at: Date | null;
};

export const fetchProductsServer = cache(async (): Promise<Product[]> => {
  const products = await db
    .selectFrom("products")
    .select([
      "id",
      "name",
      "sub_name",
      "market_value",
      "description",
      "media_info",
      "is_wallet_credit",
      "credit_amount",
      "created_at",
      "updated_at",
    ])
    .orderBy("created_at", "desc")
    .execute();

  return products;
});

export const fetchProductByIdServer = cache(
  async (id: string): Promise<Product | null> => {
    const product = await db
      .selectFrom("products")
      .select([
        "id",
        "name",
        "sub_name",
        "market_value",
        "description",
        "media_info",
        "is_wallet_credit",
        "credit_amount",
        "created_at",
        "updated_at",
      ])
      .where("id", "=", id)
      .executeTakeFirst();

    return product || null;
  }
);
