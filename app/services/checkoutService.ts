"use server";

import { purchaseTickets } from "./ticketPurchasingService";

interface CartItem {
  competition: {
    id: string;
    title: string;
    type: string;
    ticket_price: number;
    media_info?: {
      thumbnail?: string;
    };
  };
  quantity: number;
}

interface CheckoutResult {
  success: boolean;
  message: string;
  results: {
    competitionId: string;
    success: boolean;
    message: string;
    ticketId?: string;
  }[];
}

export async function processCheckout(
  items: CartItem[]
): Promise<CheckoutResult> {
  const results = [];

  for (const item of items) {
    try {
      const result = await purchaseTickets(item.competition.id, item.quantity);
      results.push({
        competitionId: item.competition.id,
        success: result.success,
        message: result.message,
        ticketId: result.ticketId,
      });
    } catch (error) {
      results.push({
        competitionId: item.competition.id,
        success: false,
        message:
          error instanceof Error ? error.message : "An unknown error occurred",
      });
    }
  }

  // Check if all purchases were successful
  const allSuccessful = results.every((result) => result.success);

  return {
    success: allSuccessful,
    message: allSuccessful
      ? "All tickets purchased successfully"
      : "Some purchases failed",
    results,
  };
}
