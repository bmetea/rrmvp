"use server";

import { revalidatePath } from "next/cache";
import { formatPrice } from "@/shared/lib/utils/price";
import { logCheckoutError } from "@/shared/lib/logger";

// Import the 4 distinct steps
import {
  calculateCheckoutStrategy,
  type CheckoutCalculation,
} from "./checkout-calculator.actions";
import { processWalletPayment } from "./wallet-payment.actions";
import { prepareRealPayment, verifyRealPayment } from "./real-payment.actions";
import {
  allocateTickets,
  type TicketAllocationResult,
} from "./ticket-allocation.actions";
import {
  processWalletCreditsForEntries,
  type WalletCreditResult,
} from "./wallet-credit.actions";

interface CartItem {
  competition: {
    id: string;
    title: string;
    type: string;
    ticket_price: number;
  };
  quantity: number;
}

export interface CheckoutResult {
  success: boolean;
  error?: string;
  // For payment form display
  requiresPaymentForm?: boolean;
  checkoutId?: string;
  widgetUrl?: string;
  // For completed purchases
  shouldRedirect?: boolean;
  redirectUrl?: string;
  finalResults?: {
    strategy: string;
    walletAmount: number;
    cardAmount: number;
    ticketResults: TicketAllocationResult;
    walletCreditResults?: WalletCreditResult;
    message: string;
  };
}

// Helper function to revalidate relevant paths
function revalidatePaths() {
  revalidatePath("/competitions/[id]");
  revalidatePath("/profile");
  revalidatePath("/checkout");
}

export async function checkout(
  items: CartItem[],
  checkoutId?: string
): Promise<CheckoutResult> {
  try {
    // Step 1: Calculate checkout strategy
    const calculation = await calculateCheckoutStrategy(items);
    if (!calculation.success) {
      return {
        success: false,
        error: calculation.error,
      };
    }

    // If we have a checkoutId, this is the second call after payment form submission
    if (checkoutId) {
      // Verify the real payment first
      const paymentVerification = await verifyRealPayment(checkoutId);
      if (!paymentVerification.success) {
        return {
          success: false,
          error: paymentVerification.error,
        };
      }

      // Recalculate strategy to get payment amounts
      const recalculation = await calculateCheckoutStrategy(items);
      if (!recalculation.success) {
        return {
          success: false,
          error: recalculation.error,
        };
      }

      let walletTransactionIds: string[] = [];

      // Process wallet payment if required (for hybrid payments)
      if (recalculation.requiresWalletPayment) {
        const walletPayment = await processWalletPayment(
          items,
          recalculation.walletId!,
          recalculation.walletAmount
        );
        if (!walletPayment.success) {
          return {
            success: false,
            error: walletPayment.error,
          };
        }
        walletTransactionIds = walletPayment.walletTransactionIds;
      }

      // Allocate tickets
      const ticketAllocation = await allocateTickets(
        items,
        walletTransactionIds,
        paymentVerification.paymentTransactionId
      );

      if (!ticketAllocation.success) {
        return {
          success: false,
          error: ticketAllocation.error,
        };
      }

      // Process wallet credits for winning tickets (if any)
      const entryIds = ticketAllocation.results
        .filter((result) => result.success && result.entryId)
        .map((result) => result.entryId!);

      let walletCreditResults: WalletCreditResult | undefined;
      if (entryIds.length > 0) {
        walletCreditResults = await processWalletCreditsForEntries(entryIds);
        if (
          walletCreditResults.success &&
          walletCreditResults.creditAmount > 0
        ) {
          console.log(
            `Wallet credit processed: £${(
              walletCreditResults.creditAmount / 100
            ).toFixed(2)} for ${
              walletCreditResults.winningTicketsWithCredits
            } winning tickets`
          );
        }
      }

      // Revalidate paths
      revalidatePaths();

      const strategyMessage =
        recalculation.strategy === "hybrid"
          ? `Hybrid Payment: ${formatPrice(
              recalculation.walletAmount
            )} wallet credit + ${formatPrice(
              recalculation.cardAmount
            )} card payment`
          : `Card Payment: ${formatPrice(recalculation.cardAmount)}`;

      // Prepare summary data for redirect
      const summaryData = {
        paymentMethod: recalculation.strategy === "hybrid" ? "hybrid" : "card",
        walletAmount: recalculation.walletAmount,
        cardAmount: recalculation.cardAmount,
        results: ticketAllocation.results || [],
        paymentStatus: "success",
        paymentMessage: `Purchase completed using ${strategyMessage.toLowerCase()}`,
        walletCreditResults,
      };

      const encodedSummary = encodeURIComponent(JSON.stringify(summaryData));

      return {
        success: true,
        shouldRedirect: true,
        redirectUrl: `/checkout/summary?summary=${encodedSummary}`,
        finalResults: {
          strategy: strategyMessage,
          walletAmount: recalculation.walletAmount,
          cardAmount: recalculation.cardAmount,
          ticketResults: ticketAllocation,
          walletCreditResults,
          message: `Purchase completed using ${strategyMessage.toLowerCase()}`,
        },
      };
    }

    // First call - determine payment flow based on strategy
    if (calculation.requiresWalletPayment && !calculation.requiresCardPayment) {
      // Wallet only payment
      const walletPayment = await processWalletPayment(
        items,
        calculation.walletId!,
        calculation.walletAmount
      );
      if (!walletPayment.success) {
        return {
          success: false,
          error: walletPayment.error,
        };
      }

      // Allocate tickets
      const ticketAllocation = await allocateTickets(
        items,
        walletPayment.walletTransactionIds
      );
      if (!ticketAllocation.success) {
        return {
          success: false,
          error: ticketAllocation.error,
        };
      }

      // Process wallet credits for winning tickets (if any)
      const entryIds = ticketAllocation.results
        .filter((result) => result.success && result.entryId)
        .map((result) => result.entryId!);

      let walletCreditResults: WalletCreditResult | undefined;
      if (entryIds.length > 0) {
        walletCreditResults = await processWalletCreditsForEntries(entryIds);
        if (
          walletCreditResults.success &&
          walletCreditResults.creditAmount > 0
        ) {
          console.log(
            `Wallet credit processed: £${(
              walletCreditResults.creditAmount / 100
            ).toFixed(2)} for ${
              walletCreditResults.winningTicketsWithCredits
            } winning tickets`
          );
        }
      }

      // Revalidate paths
      revalidatePaths();

      // Prepare summary data for redirect
      const summaryData = {
        paymentMethod: "wallet",
        walletAmount: calculation.walletAmount,
        cardAmount: 0,
        results: ticketAllocation.results || [],
        paymentStatus: "success",
        paymentMessage: `Purchase completed using ${formatPrice(
          calculation.walletAmount
        )} wallet credit only`,
        walletCreditResults,
      };

      const encodedSummary = encodeURIComponent(JSON.stringify(summaryData));

      return {
        success: true,
        shouldRedirect: true,
        redirectUrl: `/checkout/summary?summary=${encodedSummary}`,
        finalResults: {
          strategy: "Wallet Credit Only",
          walletAmount: calculation.walletAmount,
          cardAmount: 0,
          ticketResults: ticketAllocation,
          walletCreditResults,
          message: `Purchase completed using ${formatPrice(
            calculation.walletAmount
          )} wallet credit only`,
        },
      };
    } else if (
      !calculation.requiresWalletPayment &&
      calculation.requiresCardPayment
    ) {
      // Card only payment - prepare payment form
      const paymentPreparation = await prepareRealPayment(
        calculation.cardAmount
      );
      if (!paymentPreparation.success) {
        return {
          success: false,
          error: paymentPreparation.error,
        };
      }

      return {
        success: true,
        requiresPaymentForm: true,
        checkoutId: paymentPreparation.checkoutId,
        widgetUrl: paymentPreparation.widgetUrl,
      };
    } else if (
      calculation.requiresWalletPayment &&
      calculation.requiresCardPayment
    ) {
      // Hybrid payment - prepare payment form (wallet will be processed after card payment)
      const paymentPreparation = await prepareRealPayment(
        calculation.cardAmount
      );
      if (!paymentPreparation.success) {
        return {
          success: false,
          error: paymentPreparation.error,
        };
      }

      return {
        success: true,
        requiresPaymentForm: true,
        checkoutId: paymentPreparation.checkoutId,
        widgetUrl: paymentPreparation.widgetUrl,
      };
    }

    // Fallback for unknown strategy
    return {
      success: false,
      error: "Unknown checkout strategy",
    };
  } catch (error) {
    logCheckoutError("flow", error, {
      hasCheckoutId: !!checkoutId,
      itemCount: items.length,
      totalAmount: items.reduce(
        (sum, item) => sum + item.competition.ticket_price * item.quantity,
        0
      ),
    });
    const message =
      error instanceof Error ? error.message : "Checkout flow failed";
    return {
      success: false,
      error: message,
    };
  }
}
