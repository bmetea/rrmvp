import { db } from "@/db";

export interface CreateWalletResult {
  success: boolean;
  message: string;
  walletId?: string;
}

export const createWallet = async (
  userId: string
): Promise<CreateWalletResult> => {
  try {
    // Start a transaction to ensure data consistency
    return await db.transaction().execute(async (trx) => {
      // Check if user already has a wallet
      const existingWallet = await trx
        .selectFrom("wallets")
        .select(["id"])
        .where("user_id", "=", userId)
        .executeTakeFirst();

      if (existingWallet) {
        return {
          success: true,
          message: "Wallet already exists",
          walletId: existingWallet.id,
        };
      }

      // Create new wallet
      const wallet = await trx
        .insertInto("wallets")
        .values({
          user_id: userId,
          balance: 0,
        })
        .returning("id")
        .executeTakeFirst();

      if (!wallet) {
        return {
          success: false,
          message: "Failed to create wallet",
        };
      }

      return {
        success: true,
        message: "Wallet created successfully",
        walletId: wallet.id,
      };
    });
  } catch (error) {
    console.error("Error creating wallet:", error);
    return {
      success: false,
      message: "An error occurred while creating the wallet",
    };
  }
};

export const getWalletBalance = async (
  userId: string
): Promise<number | null> => {
  try {
    const wallet = await db
      .selectFrom("wallets")
      .select(["balance"])
      .where("user_id", "=", userId)
      .executeTakeFirst();

    return wallet?.balance ?? null;
  } catch (error) {
    console.error("Error getting wallet balance:", error);
    return null;
  }
};

export const updateWalletBalance = async (
  userId: string,
  amount: number,
  type: "credit" | "debit"
): Promise<boolean> => {
  try {
    return await db.transaction().execute(async (trx) => {
      const wallet = await trx
        .selectFrom("wallets")
        .select(["id", "balance"])
        .where("user_id", "=", userId)
        .executeTakeFirst();

      if (!wallet) {
        return false;
      }

      const newBalance =
        type === "credit" ? wallet.balance + amount : wallet.balance - amount;

      if (newBalance < 0) {
        return false;
      }

      await trx
        .updateTable("wallets")
        .set({
          balance: newBalance,
        })
        .where("id", "=", wallet.id)
        .execute();

      return true;
    });
  } catch (error) {
    console.error("Error updating wallet balance:", error);
    return false;
  }
};
