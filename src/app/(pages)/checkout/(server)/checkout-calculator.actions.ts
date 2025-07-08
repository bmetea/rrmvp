"use server";

import { auth } from "@clerk/nextjs/server";
import { getUserWalletBalance } from "./wallet.actions";

interface CartItem {
  competition: {
    id: string;
    title: string;
    type: string;
    ticket_price: number;
  };
  quantity: number;
}

export interface CheckoutCalculation {
  success: boolean;
  error?: string;
  strategy: "wallet-only" | "card-only" | "hybrid";
  totalAmount: number;
  walletAmount: number;
  cardAmount: number;
  walletBalance: number;
  walletId?: string;
  requiresWalletPayment: boolean;
  requiresCardPayment: boolean;
}

export async function calculateCheckoutStrategy(
  items: CartItem[]
): Promise<CheckoutCalculation> {
  try {
    const session = await auth();
    if (!session?.userId) {
      return {
        success: false,
        error: "You must be logged in to complete this purchase",
        strategy: "card-only",
        totalAmount: 0,
        walletAmount: 0,
        cardAmount: 0,
        walletBalance: 0,
        requiresWalletPayment: false,
        requiresCardPayment: false,
      };
    }

    // Calculate total cost
    const totalAmount = items.reduce(
      (sum, item) => sum + item.competition.ticket_price * item.quantity,
      0
    );

    // Get wallet balance
    const walletDetails = await getUserWalletBalance();
    if (!walletDetails.success) {
      return {
        success: false,
        error: walletDetails.error || "Failed to get wallet balance",
        strategy: "card-only",
        totalAmount,
        walletAmount: 0,
        cardAmount: totalAmount,
        walletBalance: 0,
        requiresWalletPayment: false,
        requiresCardPayment: true,
      };
    }

    const walletBalance = walletDetails.balance || 0;
    const walletId = walletDetails.walletId;

    // Determine payment strategy
    if (walletBalance >= totalAmount) {
      // Scenario 1: Wallet-only
      return {
        success: true,
        strategy: "wallet-only",
        totalAmount,
        walletAmount: totalAmount,
        cardAmount: 0,
        walletBalance,
        walletId,
        requiresWalletPayment: true,
        requiresCardPayment: false,
      };
    } else if (walletBalance === 0) {
      // Scenario 2: Card-only
      return {
        success: true,
        strategy: "card-only",
        totalAmount,
        walletAmount: 0,
        cardAmount: totalAmount,
        walletBalance,
        walletId,
        requiresWalletPayment: false,
        requiresCardPayment: true,
      };
    } else {
      // Scenario 3: Hybrid
      const cardAmount = totalAmount - walletBalance;
      return {
        success: true,
        strategy: "hybrid",
        totalAmount,
        walletAmount: walletBalance,
        cardAmount,
        walletBalance,
        walletId,
        requiresWalletPayment: true,
        requiresCardPayment: true,
      };
    }
  } catch (error) {
    console.error("Checkout calculation error:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to calculate checkout strategy",
      strategy: "card-only",
      totalAmount: 0,
      walletAmount: 0,
      cardAmount: 0,
      walletBalance: 0,
      requiresWalletPayment: false,
      requiresCardPayment: false,
    };
  }
}
