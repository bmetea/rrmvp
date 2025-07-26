"use server";

import { db } from "@/db";
import { auth } from "@clerk/nextjs/server";

export interface OrderSummary {
  items: Array<{
    competition_id: string;
    competition_title: string;
    quantity: number;
    unit_price: number;
    total_price: number;
  }>;
  total_amount: number;
  wallet_amount: number;
  payment_amount: number;
  currency: string;
}

export async function createOrder(
  orderSummary: OrderSummary,
  clerkUserId: string
): Promise<{ success: boolean; orderId?: string; error?: string }> {
  try {
    if (!clerkUserId) {
      return { success: false, error: "User not authenticated" };
    }

    // Get the internal database user ID
    const user = await db
      .selectFrom("users")
      .select("id")
      .where("clerk_id", "=", clerkUserId)
      .executeTakeFirst();

    if (!user) {
      return { success: false, error: "User not found" };
    }

    const order = await db
      .insertInto("orders")
      .values({
        user_id: user.id,
        total_amount: orderSummary.total_amount,
        currency: orderSummary.currency,
        status: "pending",
        total_tickets: orderSummary.items.reduce(
          (sum, item) => sum + item.quantity,
          0
        ),
        wallet_amount: orderSummary.wallet_amount,
        payment_amount: orderSummary.payment_amount,
        order_summary: orderSummary,
      })
      .returning("id")
      .executeTakeFirst();

    if (!order) {
      return { success: false, error: "Failed to create order" };
    }

    return { success: true, orderId: order.id };
  } catch (error) {
    console.error("Order creation error:", error);
    return { success: false, error: "Failed to create order" };
  }
}

export async function updateOrderStatus(
  orderId: string,
  status: "pending" | "completed" | "failed" | "cancelled"
): Promise<{ success: boolean; error?: string }> {
  try {
    await db
      .updateTable("orders")
      .set({
        status,
        updated_at: new Date(),
      })
      .where("id", "=", orderId)
      .execute();

    return { success: true };
  } catch (error) {
    console.error("Order status update error:", error);
    return { success: false, error: "Failed to update order status" };
  }
}

export async function getOrderById(
  orderId: string,
  clerkUserId: string
): Promise<{ success: boolean; order?: any; error?: string }> {
  try {
    if (!clerkUserId) {
      return { success: false, error: "User not authenticated" };
    }

    // Get the internal database user ID
    const user = await db
      .selectFrom("users")
      .select("id")
      .where("clerk_id", "=", clerkUserId)
      .executeTakeFirst();

    if (!user) {
      return { success: false, error: "User not found" };
    }

    const order = await db
      .selectFrom("orders")
      .selectAll()
      .where("id", "=", orderId)
      .where("user_id", "=", user.id)
      .executeTakeFirst();

    if (!order) {
      return { success: false, error: "Order not found" };
    }

    return { success: true, order };
  } catch (error) {
    console.error("Get order error:", error);
    return { success: false, error: "Failed to get order" };
  }
}

export async function getOrderIdFromCheckoutId(
  checkoutId: string
): Promise<{ success: boolean; orderId?: string; error?: string }> {
  try {
    const paymentTransaction = await db
      .selectFrom("payment_transactions")
      .select("order_id")
      .where("checkout_id", "=", checkoutId)
      .executeTakeFirst();

    if (!paymentTransaction || !paymentTransaction.order_id) {
      return { success: false, error: "Order not found for checkout ID" };
    }

    return { success: true, orderId: paymentTransaction.order_id };
  } catch (error) {
    console.error("Get order ID from checkout ID error:", error);
    return { success: false, error: "Failed to get order ID from checkout ID" };
  }
}
