"use server";

import { db } from "@/db";
import { sql } from "kysely";
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
  clerkUserId: string,
  affiliateCode?: string
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
        order_summary: orderSummary as any,
        affiliate_code: affiliateCode,
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

export async function getOrderWithDetails(
  orderId: string,
  clerkUserId: string
): Promise<{
  success: boolean;
  orderDetails?: {
    order: any;
    entries: any[];
    totalTickets: number;
    totalWinningTickets: number;
  };
  error?: string;
}> {
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

    // Fetch the order
    const order = await db
      .selectFrom("orders")
      .selectAll()
      .where("id", "=", orderId)
      .where("user_id", "=", user.id)
      .executeTakeFirst();

    if (!order) {
      return { success: false, error: "Order not found" };
    }

    // Fetch basic competition entries first
    const basicEntries = await db
      .selectFrom("competition_entries as ce")
      .innerJoin("competitions as c", "ce.competition_id", "c.id")
      .select([
        "ce.id as entry_id",
        "ce.competition_id",
        "ce.tickets",
        "ce.created_at as entry_created_at",
        "c.title as competition_title",
        "c.type as competition_type",
        "c.ticket_price",
        "c.media_info as competition_media_info",
      ])
      .where("ce.order_id", "=", orderId)
      .execute();

    // Fetch winning tickets with prize data separately
    const winningTicketsData = await db
      .selectFrom("winning_tickets as wt")
      .innerJoin("competition_prizes as cp", "cp.id", "wt.prize_id")
      .innerJoin("products as p", "p.id", "cp.product_id")
      .select([
        "wt.competition_entry_id",
        "wt.ticket_number",
        "wt.prize_id",
        "p.name as prize_name",
        "p.market_value as prize_value",
        "p.media_info as prize_media_info",
        "p.id as product_id", // Add product ID for debugging
      ])
      .where(
        "wt.competition_entry_id",
        "in",
        basicEntries.map((e) => e.entry_id)
      )
      .where("wt.status", "=", "claimed")
      .execute();

    // Debug: Check specific Chanel product
    const chanelPrizes = winningTicketsData.filter((wt) =>
      wt.prize_name.toLowerCase().includes("chanel")
    );
    if (chanelPrizes.length > 0) {
      console.log("🔍 Chanel product media info:", {
        product_id: chanelPrizes[0].product_id,
        prize_name: chanelPrizes[0].prize_name,
        media_info: chanelPrizes[0].prize_media_info,
        media_info_type: typeof chanelPrizes[0].prize_media_info,
        images_array: (chanelPrizes[0].prize_media_info as any)?.images,
      });

      // Also check the raw product data
      try {
        const productData = await db
          .selectFrom("products")
          .select(["id", "name", "media_info"])
          .where("id", "=", chanelPrizes[0].product_id)
          .executeTakeFirst();
        
        console.log("🔍 Direct product query:", {
          product: productData,
          media_info_direct: productData?.media_info,
          images_direct: (productData?.media_info as any)?.images
        });
      } catch (error) {
        console.log("❌ Product query error:", error);
      }
    }

    // Group winning tickets by entry ID
    const winningTicketsByEntry = winningTicketsData.reduce((acc, ticket) => {
      if (!acc[ticket.competition_entry_id]) {
        acc[ticket.competition_entry_id] = [];
      }
      acc[ticket.competition_entry_id].push({
        ticket_number: ticket.ticket_number,
        prize_id: ticket.prize_id,
        prize_name: ticket.prize_name,
        prize_value: ticket.prize_value,
        prize_media_info: ticket.prize_media_info,
      });
      return acc;
    }, {} as Record<string, any[]>);

    // Combine the data
    const entries = basicEntries.map((entry) => ({
      entry_id: entry.entry_id,
      competition_id: entry.competition_id,
      tickets: entry.tickets,
      entry_created_at: entry.entry_created_at,
      competition_title: entry.competition_title,
      competition_type: entry.competition_type,
      ticket_price: entry.ticket_price,
      competition_media_info: entry.competition_media_info,
      winning_tickets: winningTicketsByEntry[entry.entry_id] || [],
    }));

    // Transform entries to the expected format
    const processedEntries = entries.map((entry) => ({
      id: entry.entry_id,
      competition_id: entry.competition_id,
      tickets: entry.tickets,
      created_at: entry.entry_created_at,
      competition: {
        title: entry.competition_title,
        type: entry.competition_type,
        ticket_price: entry.ticket_price,
        media_info: entry.competition_media_info,
      },
      winning_tickets: entry.winning_tickets,
    }));

    // Calculate totals
    const totalTickets = processedEntries.reduce(
      (sum, entry) => sum + (entry.tickets ? entry.tickets.length : 0),
      0
    );

    const totalWinningTickets = processedEntries.reduce(
      (sum, entry) => sum + entry.winning_tickets.length,
      0
    );

    return {
      success: true,
      orderDetails: {
        order,
        entries: processedEntries,
        totalTickets,
        totalWinningTickets,
      },
    };
  } catch (error) {
    console.error("Get order with details error:", error);
    return { success: false, error: "Failed to get order details" };
  }
}
