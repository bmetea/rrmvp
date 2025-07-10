"use server";

import { db } from "@/db";
import { revalidatePath } from "next/cache";

export async function createProductAction(formData: {
  name: string;
  sub_name?: string | null;
  market_value: number;
  description?: string | null;
  is_wallet_credit: boolean;
  credit_amount?: number | null;
  media_info: { images: string[] };
}) {
  try {
    const product = await db
      .insertInto("products")
      .values({
        name: formData.name,
        sub_name: formData.sub_name,
        market_value: formData.market_value,
        description: formData.description,
        is_wallet_credit: formData.is_wallet_credit,
        credit_amount: formData.credit_amount,
        media_info: formData.media_info,
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

    revalidatePath("/admin/products");
    return { success: true, data: product };
  } catch (error) {
    console.error("Failed to create product:", error);
    return { success: false, error: "Failed to create product" };
  }
}

export async function updateProductAction(
  id: string,
  formData: {
    name: string;
    sub_name?: string | null;
    market_value: number;
    description?: string | null;
    is_wallet_credit: boolean;
    credit_amount?: number | null;
    media_info: { images: string[] };
  }
) {
  try {
    const product = await db
      .updateTable("products")
      .set({
        name: formData.name,
        sub_name: formData.sub_name,
        market_value: formData.market_value,
        description: formData.description,
        is_wallet_credit: formData.is_wallet_credit,
        credit_amount: formData.credit_amount,
        media_info: formData.media_info,
        updated_at: new Date(),
      })
      .where("id", "=", id)
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

    revalidatePath("/admin/products");
    return { success: true, data: product };
  } catch (error) {
    console.error("Failed to update product:", error);
    return { success: false, error: "Failed to update product" };
  }
}
