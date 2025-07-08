"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";

// --- Internal Helper Functions (previously in wallet.actions.ts) ---

async function _getUserWalletBalance(userId: string): Promise<{
  success: boolean;
  balance?: number;
  walletId?: string;
  error?: string;
}> {
  try {
    const user = await db
      .selectFrom("users")
      .select("id")
      .where("clerk_id", "=", userId)
      .executeTakeFirst();

    if (!user) {
      return { success: false, error: "User not found" };
    }

    const wallet = await db
      .selectFrom("wallets")
      .select(["id", "balance"])
      .where("user_id", "=", user.id)
      .executeTakeFirst();

    return {
      success: true,
      balance: wallet?.balance ?? 0,
      walletId: wallet?.id,
    };
  } catch (error) {
    console.error("Error getting wallet balance:", error);
    return { success: false, error: "Failed to get wallet balance" };
  }
}

async function _createWalletTransaction(
  walletId: string,
  amount: number,
  type: "credit" | "debit",
  referenceType: string,
  referenceId: string,
  description: string,
  numberOfTickets: number | undefined,
  trx: any
): Promise<{ success: boolean; transactionId?: string; error?: string }> {
  try {
    const walletTransaction = await trx
      .insertInto("wallet_transactions")
      .values({
        wallet_id: walletId,
        amount: Math.round(amount),
        type,
        status: "completed",
        reference_type: referenceType,
        reference_id: referenceId,
        description,
        number_of_tickets: numberOfTickets,
      })
      .returning("id")
      .executeTakeFirst();

    if (!walletTransaction) {
      return { success: false, error: "Failed to create wallet transaction" };
    }

    return { success: true, transactionId: walletTransaction.id };
  } catch (error) {
    console.error("Error creating wallet transaction:", error);
    return { success: false, error: "Failed to create wallet transaction" };
  }
}

async function _updateWalletBalance(
  walletId: string,
  newBalance: number,
  trx: any
): Promise<{ success: boolean; error?: string }> {
  try {
    await trx
      .updateTable("wallets")
      .set({ balance: newBalance })
      .where("id", "=", walletId)
      .execute();

    return { success: true };
  } catch (error) {
    console.error("Error updating wallet balance:", error);
    return { success: false, error: "Failed to update wallet balance" };
  }
}

async function _debitWalletBalance(
  walletId: string,
  amount: number,
  referenceType: string,
  referenceId: string,
  description: string,
  numberOfTickets: number | undefined,
  trx: any
): Promise<{
  success: boolean;
  transactionId?: string;
  newBalance?: number;
  error?: string;
}> {
  try {
    const wallet = await trx
      .selectFrom("wallets")
      .select(["id", "balance"])
      .where("id", "=", walletId)
      .executeTakeFirst();

    if (!wallet) {
      return { success: false, error: "Wallet not found" };
    }

    if (wallet.balance < amount) {
      return { success: false, error: "Insufficient wallet balance" };
    }

    const newBalance = wallet.balance - amount;

    const transactionResult = await _createWalletTransaction(
      walletId,
      amount,
      "debit",
      referenceType,
      referenceId,
      description,
      numberOfTickets,
      trx
    );

    if (!transactionResult.success) {
      return { success: false, error: transactionResult.error };
    }

    const balanceResult = await _updateWalletBalance(walletId, newBalance, trx);

    if (!balanceResult.success) {
      return { success: false, error: balanceResult.error };
    }

    return {
      success: true,
      transactionId: transactionResult.transactionId,
      newBalance,
    };
  } catch (error) {
    console.error("Error debiting wallet balance:", error);
    return { success: false, error: "Failed to debit wallet balance" };
  }
}

// --- Exported Functions ---

export interface WalletPaymentResult {
  success: boolean;
  error?: string;
  walletTransactionIds: string[];
  message: string;
}

export async function processWalletPayment(
  items: Array<{
    competition: {
      id: string;
      title: string;
      type: string;
      ticket_price: number;
    };
    quantity: number;
  }>,
  walletId: string,
  walletAmount: number
): Promise<WalletPaymentResult> {
  try {
    return await db.transaction().execute(async (trx) => {
      const walletTransactionIds: string[] = [];
      const totalCost = items.reduce(
        (sum, item) => sum + item.competition.ticket_price * item.quantity,
        0
      );

      const itemWalletAmounts = items.map((item) => {
        const itemCost = item.competition.ticket_price * item.quantity;
        return Math.floor((walletAmount * itemCost) / totalCost);
      });

      const distributedSum = itemWalletAmounts.reduce(
        (sum, amount) => sum + amount,
        0
      );
      let remainder = walletAmount - distributedSum;

      for (let i = 0; i < remainder; i++) {
        itemWalletAmounts[i % itemWalletAmounts.length]++;
      }

      for (const [index, item] of items.entries()) {
        const itemWalletAmount = itemWalletAmounts[index];

        if (itemWalletAmount > 0) {
          const walletResult = await _debitWalletBalance(
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

export async function getUserWalletBalance(): Promise<{
  success: boolean;
  balance?: number;
  walletId?: string;
  error?: string;
}> {
  const session = await auth();
  if (!session?.userId) {
    return {
      success: false,
      error: "You must be logged in to view wallet balance",
    };
  }
  return await _getUserWalletBalance(session.userId);
}
