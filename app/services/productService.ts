import { db } from "@/db";
import { cache } from "react";

export type Product = {
  id: string;
  name: string;
  sub_name: string | null;
  market_value: number;
  description: string | null;
  media_info: unknown;
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

export type CreateProductInput = {
  name: string;
  sub_name?: string | null;
  market_value: number;
  description?: string | null;
  media_info?: unknown;
  is_wallet_credit: boolean;
  credit_amount?: number | null;
};

export async function createProduct(
  input: CreateProductInput
): Promise<Product> {
  const product = await db
    .insertInto("products")
    .values({
      name: input.name,
      sub_name: input.sub_name,
      market_value: input.market_value,
      description: input.description,
      media_info: input.media_info,
      is_wallet_credit: input.is_wallet_credit,
      credit_amount: input.credit_amount,
    })
    .returning([
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
    .executeTakeFirstOrThrow();

  return product;
}
