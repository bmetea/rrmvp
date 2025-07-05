"use server";

import { processCheckout } from "@/services/checkoutService";
import { revalidatePath } from "next/cache";

interface CartItem {
  competition: {
    id: string;
    title: string;
    type: string;
    ticket_price: number;
  };
  quantity: number;
}

export async function checkout(
  items: CartItem[],
  paymentTransactionId?: string
) {
  try {
    const result = await processCheckout(items, paymentTransactionId);

    if (result.success) {
      // Revalidate relevant paths
      revalidatePath("/competitions/[id]");
      revalidatePath("/profile");
      revalidatePath("/checkout");
    }

    return result;
  } catch (error) {
    console.error("Checkout error:", error);
    return {
      success: false,
      message: "An error occurred during checkout",
      results: [],
    };
  }
}

export async function checkoutWithTransaction(
  items: CartItem[],
  checkoutId?: string
) {
  try {
    let paymentTransactionId: string | undefined = undefined;
    if (checkoutId) {
      const { db } = await import("@/db");
      const tx = await db
        .selectFrom("payment_transactions")
        .select("id")
        .where("checkout_id", "=", checkoutId)
        .executeTakeFirst();
      if (tx) paymentTransactionId = tx.id;
    }
    const result = await processCheckout(items, paymentTransactionId);
    if (result.success) {
      revalidatePath("/competitions/[id]");
      revalidatePath("/profile");
      revalidatePath("/checkout");
    }
    return result;
  } catch (error) {
    console.error("Checkout error:", error);
    return {
      success: false,
      message: "An error occurred during checkout",
      results: [],
    };
  }
}
