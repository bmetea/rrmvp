"use server";

import { debitWalletBalance } from "./wallet.actions";

interface CartItem {
  competition: {
    id: string;
    title: string;
    type: string;
    ticket_price: number;
  };
  quantity: number;
}

export interface WalletPaymentResult {
  success: boolean;
  error?: string;
  walletTransactionIds: string[];
  message: string;
}

export async function processWalletPayment(
  items: CartItem[],
  walletId: string,
  walletAmount: number
): Promise<WalletPaymentResult> {
  try {
    const { db } = await import("@/db");

    return await db.transaction().execute(async (trx) => {
      const walletTransactionIds: string[] = [];

      // Calculate proportional amounts for each item
      const totalCost = items.reduce(
        (sum, item) => sum + item.competition.ticket_price * item.quantity,
        0
      );

      for (const item of items) {
        const itemCost = item.competition.ticket_price * item.quantity;
        const itemWalletAmount = (walletAmount * itemCost) / totalCost;

        if (itemWalletAmount > 0) {
          const walletResult = await debitWalletBalance(
            walletId,
            itemWalletAmount,
            "ticket_purchase",
            item.competition.id,
            `Wallet payment for ${item.quantity} tickets in ${item.competition.title}`,
            item.quantity,
            trx
          );

          if (!walletResult.success) {
            throw new Error(
              `Failed to process wallet payment for ${item.competition.title}: ${walletResult.error}`
            );
          }

          if (walletResult.transactionId) {
            walletTransactionIds.push(walletResult.transactionId);
          }
        }
      }

      return {
        success: true,
        walletTransactionIds,
        message: `Successfully processed wallet payment of ${walletAmount} credits`,
      };
    });
  } catch (error) {
    console.error("Wallet payment error:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to process wallet payment",
      walletTransactionIds: [],
      message: "Wallet payment failed",
    };
  }
}
