"use server";

import { auth } from "@clerk/nextjs/server";

export async function getUserWalletBalance(): Promise<{
  success: boolean;
  balance?: number;
  walletId?: string;
  error?: string;
}> {
  try {
    const session = await auth();

    if (!session?.userId) {
      return {
        success: false,
        error: "You must be logged in to view wallet balance",
      };
    }

    const { db } = await import("@/db");

    // Get database user ID from Clerk user ID
    const user = await db
      .selectFrom("users")
      .select("id")
      .where("clerk_id", "=", session.userId)
      .executeTakeFirst();

    if (!user) {
      return {
        success: false,
        error: "User not found",
      };
    }

    // Get wallet balance
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
    return {
      success: false,
      error: "Failed to get wallet balance",
    };
  }
}

export async function createWalletTransaction(
  walletId: string,
  amount: number,
  type: "credit" | "debit",
  referenceType: string,
  referenceId: string,
  description: string,
  numberOfTickets?: number,
  trx?: any
): Promise<{
  success: boolean;
  transactionId?: string;
  error?: string;
}> {
  try {
    const dbInstance = trx || (await import("@/db")).db;

    const walletTransaction = await dbInstance
      .insertInto("wallet_transactions")
      .values({
        wallet_id: walletId,
        amount: Math.round(amount), // Round to avoid decimal issues
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
      return {
        success: false,
        error: "Failed to create wallet transaction",
      };
    }

    return {
      success: true,
      transactionId: walletTransaction.id,
    };
  } catch (error) {
    console.error("Error creating wallet transaction:", error);
    return {
      success: false,
      error: "Failed to create wallet transaction",
    };
  }
}

export async function updateWalletBalance(
  walletId: string,
  newBalance: number,
  trx?: any
): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const dbInstance = trx || (await import("@/db")).db;

    await dbInstance
      .updateTable("wallets")
      .set({
        balance: newBalance,
      })
      .where("id", "=", walletId)
      .execute();

    return {
      success: true,
    };
  } catch (error) {
    console.error("Error updating wallet balance:", error);
    return {
      success: false,
      error: "Failed to update wallet balance",
    };
  }
}

export async function debitWalletBalance(
  walletId: string,
  amount: number,
  referenceType: string,
  referenceId: string,
  description: string,
  numberOfTickets?: number,
  trx?: any
): Promise<{
  success: boolean;
  transactionId?: string;
  newBalance?: number;
  error?: string;
}> {
  try {
    const { db } = await import("@/db");
    const dbInstance = trx || db;

    // Get current wallet balance
    const wallet = await dbInstance
      .selectFrom("wallets")
      .select(["id", "balance"])
      .where("id", "=", walletId)
      .executeTakeFirst();

    if (!wallet) {
      return {
        success: false,
        error: "Wallet not found",
      };
    }

    if (wallet.balance < amount) {
      return {
        success: false,
        error: "Insufficient wallet balance",
      };
    }

    const newBalance = wallet.balance - amount;

    // Create debit transaction
    const transactionResult = await createWalletTransaction(
      walletId,
      amount,
      "debit",
      referenceType,
      referenceId,
      description,
      numberOfTickets,
      dbInstance
    );

    if (!transactionResult.success) {
      return {
        success: false,
        error: transactionResult.error,
      };
    }

    // Update wallet balance
    const balanceResult = await updateWalletBalance(
      walletId,
      newBalance,
      dbInstance
    );

    if (!balanceResult.success) {
      return {
        success: false,
        error: balanceResult.error,
      };
    }

    return {
      success: true,
      transactionId: transactionResult.transactionId,
      newBalance,
    };
  } catch (error) {
    console.error("Error debiting wallet balance:", error);
    return {
      success: false,
      error: "Failed to debit wallet balance",
    };
  }
}

// Removed creditWalletBalance - was not being used

// Removed processWalletPurchase - was not being used
