import { db } from "@/db";
import { cache } from "react";

export type Product = {
  id: string;
  name: string;
  sub_name: string | null;
  market_value: number;
  description: string | null;
  media_info: {
    images?: string[];
    videos?: string[];
  } | null;
  is_wallet_credit: boolean;
  credit_amount: number | null;
  created_at: Date | null;
  updated_at: Date | null;
};

export type ProductsResponse = {
  products: Product[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export const fetchProductsServer = cache(
  async (
    page: number = 1,
    pageSize: number = 10,
    search?: string
  ): Promise<ProductsResponse> => {
    const offset = (page - 1) * pageSize;

    // Get total count with search filter
    let countQuery = db
      .selectFrom("products")
      .select((eb) => eb.fn.countAll().as("count"));

    if (search && search.trim() !== "") {
      countQuery = countQuery.where((eb) => eb("name", "ilike", `%${search}%`));
    }

    const countResult = await countQuery.executeTakeFirst();
    const total = Number(countResult?.count ?? 0);
    const totalPages = Math.ceil(total / pageSize);

    // Get paginated results with search filter
    let productsQuery = db
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
      ]);

    if (search && search.trim() !== "") {
      productsQuery = productsQuery.where((eb) =>
        eb("name", "ilike", `%${search}%`)
      );
    }

    const products = await productsQuery
      .orderBy("created_at", "desc")
      .limit(pageSize)
      .offset(offset)
      .execute();

    return {
      products: products.map((product) => ({
        ...product,
        media_info: product.media_info
          ? ((typeof product.media_info === "string"
              ? JSON.parse(product.media_info)
              : product.media_info) as {
              images?: string[];
              videos?: string[];
            })
          : null,
      })),
      total,
      page,
      pageSize,
      totalPages,
    };
  }
);

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

    if (!product) return null;

    return {
      ...product,
      media_info: product.media_info
        ? ((typeof product.media_info === "string"
            ? JSON.parse(product.media_info)
            : product.media_info) as {
            images?: string[];
            videos?: string[];
          })
        : null,
    };
  }
);

export type CreateProductInput = {
  name: string;
  sub_name?: string | null;
  market_value: number;
  description?: string | null;
  media_info?: {
    images?: string[];
    videos?: string[];
  } | null;
  is_wallet_credit: boolean;
  credit_amount?: number | null;
};

export async function createProduct(
  input: CreateProductInput
): Promise<Product> {
  // Validate and normalize media_info
  const mediaInfo = input.media_info
    ? {
        images: Array.isArray(input.media_info.images)
          ? input.media_info.images
          : [],
        videos: Array.isArray(input.media_info.videos)
          ? input.media_info.videos
          : [],
      }
    : null;

  const product = await db
    .insertInto("products")
    .values({
      name: input.name,
      sub_name: input.sub_name,
      market_value: input.market_value,
      description: input.description,
      media_info: mediaInfo,
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

  return {
    ...product,
    media_info: product.media_info
      ? ((typeof product.media_info === "string"
          ? JSON.parse(product.media_info)
          : product.media_info) as {
          images?: string[];
          videos?: string[];
        })
      : null,
  };
}
