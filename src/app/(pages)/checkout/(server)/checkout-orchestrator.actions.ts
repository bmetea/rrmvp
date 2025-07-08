"use server";

import { revalidatePath } from "next/cache";
import { formatPrice } from "@/shared/lib/utils/price";

// Import the 4 distinct steps
import {
  calculateCheckoutStrategy,
  type CheckoutCalculation,
} from "./checkout-calculator.actions";
import {
  processWalletPayment,
  type WalletPaymentResult,
} from "./wallet-payment.actions";
import {
  prepareRealPayment,
  verifyRealPayment,
  type RealPaymentPreparation,
  type RealPaymentResult,
} from "./real-payment.actions";
import {
  allocateTickets,
  type TicketAllocationResult,
} from "./ticket-allocation.actions";

interface CartItem {
  competition: {
    id: string;
    title: string;
    type: string;
    ticket_price: number;
  };
  quantity: number;
}

export interface CheckoutFlowResult {
  success: boolean;
  error?: string;
  step:
    | "calculation"
    | "wallet-payment"
    | "real-payment"
    | "ticket-allocation"
    | "completed";

  // Step 1 - Calculation
  calculation?: CheckoutCalculation;

  // Step 2 - Real Payment Preparation (if needed)
  paymentPreparation?: RealPaymentPreparation;

  // Final results
  finalResults?: {
    strategy: string;
    walletAmount: number;
    cardAmount: number;
    ticketResults: TicketAllocationResult;
    message: string;
  };
}

// Step 1: Calculate checkout strategy
export async function startCheckoutFlow(
  items: CartItem[]
): Promise<CheckoutFlowResult> {
  try {
    // Step 1: Calculate checkout strategy
    const calculation = await calculateCheckoutStrategy(items);

    if (!calculation.success) {
      return {
        success: false,
        error: calculation.error,
        step: "calculation",
        calculation,
      };
    }

    // If wallet-only, we can complete immediately
    if (calculation.strategy === "wallet-only") {
      return await completeWalletOnlyCheckout(items, calculation);
    }

    // If card payment is required, prepare it
    if (calculation.requiresCardPayment) {
      const paymentPreparation = await prepareRealPayment(
        calculation.cardAmount
      );

      return {
        success: paymentPreparation.success,
        error: paymentPreparation.error,
        step: "real-payment",
        calculation,
        paymentPreparation,
      };
    }

    // This shouldn't happen, but handle edge case
    return {
      success: false,
      error: "Unknown checkout strategy",
      step: "calculation",
      calculation,
    };
  } catch (error) {
    console.error("Checkout flow error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Checkout flow failed",
      step: "calculation",
    };
  }
}

// Complete wallet-only checkout (Steps 2 & 4)
async function completeWalletOnlyCheckout(
  items: CartItem[],
  calculation: CheckoutCalculation
): Promise<CheckoutFlowResult> {
  try {
    // Step 2: Process wallet payment
    const walletPayment = await processWalletPayment(
      items,
      calculation.walletId!,
      calculation.walletAmount
    );

    if (!walletPayment.success) {
      return {
        success: false,
        error: walletPayment.error,
        step: "wallet-payment",
        calculation,
      };
    }

    // Step 4: Allocate tickets (no card payment)
    const ticketAllocation = await allocateTickets(
      items,
      walletPayment.walletTransactionIds
    );

    if (!ticketAllocation.success) {
      return {
        success: false,
        error: ticketAllocation.error,
        step: "ticket-allocation",
        calculation,
      };
    }

    // Revalidate paths
    revalidatePaths();

    return {
      success: true,
      step: "completed",
      calculation,
      finalResults: {
        strategy: "Wallet Credit Only",
        walletAmount: calculation.walletAmount,
        cardAmount: 0,
        ticketResults: ticketAllocation,
        message: `Purchase completed using ${formatPrice(
          calculation.walletAmount
        )} wallet credit only`,
      },
    };
  } catch (error) {
    console.error("Wallet-only checkout error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Wallet checkout failed",
      step: "wallet-payment",
      calculation,
    };
  }
}

// Complete checkout after card payment (Steps 2, 3 & 4)
export async function completeCheckoutAfterPayment(
  items: CartItem[],
  checkoutId: string
): Promise<CheckoutFlowResult> {
  try {
    // Recalculate to get the original strategy
    const calculation = await calculateCheckoutStrategy(items);
    if (!calculation.success) {
      return {
        success: false,
        error: calculation.error,
        step: "calculation",
        calculation,
      };
    }

    // Step 3: Verify real payment
    const paymentVerification = await verifyRealPayment(checkoutId);
    if (!paymentVerification.success) {
      return {
        success: false,
        error: paymentVerification.error,
        step: "real-payment",
        calculation,
      };
    }

    let walletTransactionIds: string[] = [];

    // Step 2: Process wallet payment if hybrid
    if (calculation.requiresWalletPayment) {
      const walletPayment = await processWalletPayment(
        items,
        calculation.walletId!,
        calculation.walletAmount
      );

      if (!walletPayment.success) {
        return {
          success: false,
          error: walletPayment.error,
          step: "wallet-payment",
          calculation,
        };
      }

      walletTransactionIds = walletPayment.walletTransactionIds;
    }

    // Step 4: Allocate tickets
    const ticketAllocation = await allocateTickets(
      items,
      walletTransactionIds,
      paymentVerification.paymentTransactionId
    );

    if (!ticketAllocation.success) {
      return {
        success: false,
        error: ticketAllocation.error,
        step: "ticket-allocation",
        calculation,
      };
    }

    // Revalidate paths
    revalidatePaths();

    const strategyMessage =
      calculation.strategy === "hybrid"
        ? `Hybrid Payment: ${formatPrice(
            calculation.walletAmount
          )} wallet credit + ${formatPrice(
            calculation.cardAmount
          )} card payment`
        : `Card Payment: ${formatPrice(calculation.cardAmount)}`;

    return {
      success: true,
      step: "completed",
      calculation,
      finalResults: {
        strategy: strategyMessage,
        walletAmount: calculation.walletAmount,
        cardAmount: calculation.cardAmount,
        ticketResults: ticketAllocation,
        message: `Purchase completed using ${strategyMessage.toLowerCase()}`,
      },
    };
  } catch (error) {
    console.error("Complete checkout after payment error:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Checkout completion failed",
      step: "real-payment",
    };
  }
}

// Helper function to revalidate relevant paths
function revalidatePaths() {
  revalidatePath("/competitions/[id]");
  revalidatePath("/profile");
  revalidatePath("/checkout");
}

// Legacy compatibility functions
export async function processCheckout(items: CartItem[]) {
  return await startCheckoutFlow(items);
}

export async function completeCheckoutWithPayment(
  items: CartItem[],
  checkoutId: string
) {
  return await completeCheckoutAfterPayment(items, checkoutId);
}
