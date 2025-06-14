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

export async function checkout(items: CartItem[]) {
  try {
    const result = await processCheckout(items);

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
