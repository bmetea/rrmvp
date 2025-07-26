"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { updateWalletBalance } from "@/app/(pages)/user/(server)/wallet.service";
import { logCheckoutError } from "@/shared/lib/logger";

// Types and Interfaces
export interface WalletCreditResult {
  success: boolean;
  error?: string;
  creditAmount: number;
  message: string;
  entriesProcessed: number;
  winningTicketsWithCredits: number;
}

export interface EntryWithPrizeData {
  entryId: string;
  competitionId: string;
  winningTickets: Array<{
    ticketNumber: number;
    prizeId: string;
    productId: string;
    productName: string;
    creditAmount: number;
    isWalletCredit: boolean;
  }>;
}

// Helper Functions

/**
 * Get user's current wallet balance
 */
async function getUserWalletBalance(userId: string): Promise<number | null> {
  try {
    const wallet = await db
      .selectFrom("wallets")
      .select(["balance"])
      .where("user_id", "=", userId)
      .executeTakeFirst();

    return wallet?.balance ?? null;
  } catch (error) {
    logCheckoutError("user wallet balance fetch", error, { userId });
    return null;
  }
}

/**
 * Get competition entries with their winning tickets and prize data
 * Only returns entries that have winning tickets with wallet credit products
 */
async function getEntriesWithPrizeData(
  entryIds: string[]
): Promise<EntryWithPrizeData[]> {
  try {
    if (entryIds.length === 0) {
      return [];
    }

    // Get all winning tickets for these entries with their prize and product data
    const winningTicketsData = await db
      .selectFrom("winning_tickets as wt")
      .innerJoin("competition_prizes as cp", "cp.id", "wt.prize_id")
      .innerJoin("products as p", "p.id", "cp.product_id")
      .select([
        "wt.competition_entry_id",
        "wt.ticket_number",
        "wt.prize_id",
        "wt.competition_id",
        "p.id as product_id",
        "p.name as product_name",
        "p.credit_amount",
        "p.is_wallet_credit",
      ])
      .where("wt.competition_entry_id", "in", entryIds)
      .where("wt.status", "=", "claimed")
      .where("p.is_wallet_credit", "=", true)
      .where("p.credit_amount", "is not", null)
      .execute();

    // Group winning tickets by entry ID
    const entriesMap = new Map<string, EntryWithPrizeData>();

    for (const ticket of winningTicketsData) {
      const entryId = ticket.competition_entry_id!;

      if (!entriesMap.has(entryId)) {
        entriesMap.set(entryId, {
          entryId,
          competitionId: ticket.competition_id,
          winningTickets: [],
        });
      }

      const entry = entriesMap.get(entryId)!;
      entry.winningTickets.push({
        ticketNumber: ticket.ticket_number,
        prizeId: ticket.prize_id,
        productId: ticket.product_id,
        productName: ticket.product_name,
        creditAmount: ticket.credit_amount || 0,
        isWalletCredit: ticket.is_wallet_credit,
      });
    }

    return Array.from(entriesMap.values());
  } catch (error) {
    logCheckoutError("entries with prize data fetch", error, {
      entryIdsCount: entryIds.length,
      entryIds: entryIds.slice(0, 3), // Log first 3 for debugging without flooding logs
    });
    return [];
  }
}

/**
 * Calculate total credit amount from all winning tickets with wallet credit products
 */
function calculateTotalCreditAmount(entries: EntryWithPrizeData[]): number {
  let totalCredit = 0;

  for (const entry of entries) {
    for (const ticket of entry.winningTickets) {
      if (ticket.isWalletCredit && ticket.creditAmount > 0) {
        totalCredit += ticket.creditAmount;
      }
    }
  }

  return totalCredit;
}

/**
 * Update user's wallet with credit amount and create transaction record
 */
async function updateWalletWithCredit(
  userId: string,
  creditAmount: number,
  entriesData: EntryWithPrizeData[]
): Promise<boolean> {
  try {
    return await db.transaction().execute(async (trx) => {
      // Get user's wallet
      const wallet = await trx
        .selectFrom("wallets")
        .select(["id", "balance"])
        .where("user_id", "=", userId)
        .executeTakeFirst();

      if (!wallet) {
        logCheckoutError(
          "wallet not found for user",
          new Error("Wallet not found"),
          { userId }
        );
        return false;
      }

      // Update wallet balance
      const newBalance = wallet.balance + creditAmount;
      await trx
        .updateTable("wallets")
        .set({
          balance: newBalance,
          updated_at: new Date(),
        })
        .where("id", "=", wallet.id)
        .execute();

      // Create wallet transaction record for audit trail
      const entryIds = entriesData.map((e) => e.entryId);
      const ticketCount = entriesData.reduce(
        (sum, entry) => sum + entry.winningTickets.length,
        0
      );

      await trx
        .insertInto("wallet_transactions")
        .values({
          wallet_id: wallet.id,
          amount: creditAmount,
          type: "credit",
          status: "completed",
          description: `Wallet credit from ${ticketCount} winning ticket${
            ticketCount > 1 ? "s" : ""
          } in ${entriesData.length} competition entr${
            entriesData.length > 1 ? "ies" : "y"
          } (Entry IDs: ${entryIds.join(", ")})`,
          reference_type: "prize_win",
          number_of_tickets: ticketCount, // Set the actual number of winning tickets with credits
        })
        .execute();

      return true;
    });
  } catch (error) {
    logCheckoutError("wallet credit update", error, {
      userId,
      creditAmount,
      entriesCount: entriesData.length,
      totalTickets: entriesData.reduce(
        (sum, entry) => sum + entry.winningTickets.length,
        0
      ),
    });
    return false;
  }
}

// Main Function

/**
 * Process wallet credits for competition entries
 * This function is called after successful ticket allocation to credit wallets
 * for any winning tickets that have wallet credit products
 */
export async function processWalletCreditsForEntries(
  entryIds: string[]
): Promise<WalletCreditResult> {
  try {
    // Get current user
    const session = await auth();
    if (!session?.userId) {
      return {
        success: false,
        error: "Authentication required",
        creditAmount: 0,
        message: "User must be logged in to process wallet credits",
        entriesProcessed: 0,
        winningTicketsWithCredits: 0,
      };
    }

    // Get user database record
    const user = await db
      .selectFrom("users")
      .select(["id"])
      .where("clerk_id", "=", session.userId)
      .executeTakeFirst();

    if (!user) {
      return {
        success: false,
        error: "User not found",
        creditAmount: 0,
        message: "User record not found in database",
        entriesProcessed: 0,
        winningTicketsWithCredits: 0,
      };
    }

    // Get current wallet balance (for logging purposes)
    const currentBalance = await getUserWalletBalance(user.id);
    if (currentBalance === null) {
      console.warn(
        `No wallet found for user ${user.id}, wallet credits cannot be processed`
      );
      return {
        success: true, // Don't fail checkout if wallet doesn't exist
        creditAmount: 0,
        message: "No wallet found - no credits to process",
        entriesProcessed: 0,
        winningTicketsWithCredits: 0,
      };
    }

    // Get entries with winning tickets that have wallet credit products
    const entriesWithPrizeData = await getEntriesWithPrizeData(entryIds);

    if (entriesWithPrizeData.length === 0) {
      return {
        success: true,
        creditAmount: 0,
        message: "No winning tickets with wallet credit products found",
        entriesProcessed: entryIds.length,
        winningTicketsWithCredits: 0,
      };
    }

    // Calculate total credit amount
    const totalCreditAmount = calculateTotalCreditAmount(entriesWithPrizeData);

    if (totalCreditAmount <= 0) {
      return {
        success: true,
        creditAmount: 0,
        message: "No wallet credits to process",
        entriesProcessed: entriesWithPrizeData.length,
        winningTicketsWithCredits: 0,
      };
    }

    // Update wallet with credit
    const updateSuccess = await updateWalletWithCredit(
      user.id,
      totalCreditAmount,
      entriesWithPrizeData
    );

    if (!updateSuccess) {
      return {
        success: false,
        error: "Failed to update wallet balance",
        creditAmount: 0,
        message: "Database error while updating wallet",
        entriesProcessed: entriesWithPrizeData.length,
        winningTicketsWithCredits: 0,
      };
    }

    // Count total winning tickets with credits
    const totalWinningTicketsWithCredits = entriesWithPrizeData.reduce(
      (sum, entry) => sum + entry.winningTickets.length,
      0
    );

    const message = `Successfully added £${(totalCreditAmount / 100).toFixed(
      2
    )} to your wallet from ${totalWinningTicketsWithCredits} winning ticket${
      totalWinningTicketsWithCredits > 1 ? "s" : ""
    }!`;

    console.log(
      `Wallet credit processed for user ${user.id}: £${(
        totalCreditAmount / 100
      ).toFixed(2)} from ${totalWinningTicketsWithCredits} winning tickets`
    );

    return {
      success: true,
      creditAmount: totalCreditAmount,
      message,
      entriesProcessed: entriesWithPrizeData.length,
      winningTicketsWithCredits: totalWinningTicketsWithCredits,
    };
  } catch (error) {
    const session = await auth();
    logCheckoutError("wallet credits processing", error, {
      entryIdsCount: entryIds.length,
      userId: session?.userId,
    });

    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
      creditAmount: 0,
      message: "Failed to process wallet credits",
      entriesProcessed: 0,
      winningTicketsWithCredits: 0,
    };
  }
}
