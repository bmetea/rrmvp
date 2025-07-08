"use server";

import { auth } from "@clerk/nextjs/server";
import { prepareCheckout, checkPaymentStatus } from "./payment.actions";
import { penceToPounds } from "@/shared/lib/utils/price";

export interface RealPaymentPreparation {
  success: boolean;
  error?: string;
  checkoutId?: string;
  widgetUrl?: string;
  message: string;
}

export interface RealPaymentResult {
  success: boolean;
  error?: string;
  paymentTransactionId?: string;
  message: string;
}

// Helper function to check if payment is successful
function isPaymentSuccessful(code: string): boolean {
  const successCodes = [
    "000.000.000", // Transaction succeeded
    "000.000.100", // Successful request
    "000.100.105", // Chargeback Representment is successful
    "000.100.106", // Chargeback Representment cancellation is successful
    "000.100.110", // Request successfully processed in 'Merchant in Integrator Test Mode'
    "000.100.111", // Request successfully processed in 'Merchant in Validator Test Mode'
    "000.100.112", // Request successfully processed in 'Merchant in Connector Test Mode'
    "000.300.000", // Two-step transaction succeeded
    "000.300.100", // Risk check successful
    "000.300.101", // Risk bank account check successful
    "000.300.102", // Risk report successful
    "000.310.100", // Account updated
    "000.310.101", // Account updated (Credit card expired)
    "000.310.110", // No updates found, but account is valid
    "000.600.000", // Transaction succeeded due to external update
  ];
  return successCodes.includes(code);
}

export async function prepareRealPayment(
  cardAmount: number
): Promise<RealPaymentPreparation> {
  try {
    const session = await auth();
    if (!session?.userId) {
      return {
        success: false,
        error: "You must be logged in to make payments",
        message: "Authentication required",
      };
    }

    // Convert pence to pounds for OPPWA
    const amountInPounds = penceToPounds(cardAmount).toFixed(2);

    // Prepare checkout with OPPWA
    const checkoutResult = await prepareCheckout({
      amount: amountInPounds,
      currency: "GBP",
      paymentType: "DB",
      userId: session.userId,
    });

    if (checkoutResult.error || !checkoutResult.id) {
      return {
        success: false,
        error: checkoutResult.error || "Failed to prepare payment",
        message: "Payment preparation failed",
      };
    }

    return {
      success: true,
      checkoutId: checkoutResult.id,
      widgetUrl: checkoutResult.widgetUrl,
      message: "Payment preparation successful",
    };
  } catch (error) {
    console.error("Real payment preparation error:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to prepare card payment",
      message: "Payment preparation failed",
    };
  }
}

export async function verifyRealPayment(
  checkoutId: string
): Promise<RealPaymentResult> {
  try {
    // Check payment status
    const paymentStatus = await checkPaymentStatus(checkoutId);
    if (paymentStatus.error || !paymentStatus.result) {
      return {
        success: false,
        error: paymentStatus.error || "Failed to check payment status",
        message: "Payment verification failed",
      };
    }

    if (!isPaymentSuccessful(paymentStatus.result.code)) {
      return {
        success: false,
        error: `Payment failed: ${
          paymentStatus.result.description ||
          `Error code: ${paymentStatus.result.code}`
        }`,
        message: "Payment was not successful",
      };
    }

    // Get payment transaction ID from database
    const { db } = await import("@/db");
    const paymentTransaction = await db
      .selectFrom("payment_transactions")
      .select("id")
      .where("checkout_id", "=", checkoutId)
      .executeTakeFirst();

    if (!paymentTransaction) {
      return {
        success: false,
        error: "Payment transaction not found in database",
        message: "Payment verification failed",
      };
    }

    return {
      success: true,
      paymentTransactionId: paymentTransaction.id,
      message: "Payment verification successful",
    };
  } catch (error) {
    console.error("Real payment verification error:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to verify payment",
      message: "Payment verification failed",
    };
  }
}
