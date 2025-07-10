"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { oppwaLogger } from "@/shared/lib/logger";
import { penceToPounds } from "@/shared/lib/utils/price";

const OPPWA_BASE_URL =
  process.env.OPPWA_BASE_URL || "https://eu-test.oppwa.com";
const OPPWA_ENTITY_ID = process.env.OPPWA_ENTITY_ID;
const OPPWA_ACCESS_TOKEN = process.env.OPPWA_ACCESS_TOKEN;

// --- Internal Helper Functions (previously in payment.actions.ts) ---

async function _prepareCheckout(input: {
  amount: string;
  currency: string;
  paymentType: string;
  userId?: string;
}): Promise<{
  id?: string;
  transactionId?: string;
  error?: string;
  widgetUrl?: string;
}> {
  try {
    const path = "/v1/checkouts";
    const data = new URLSearchParams({
      entityId: OPPWA_ENTITY_ID!,
      amount: input.amount,
      currency: input.currency,
      paymentType: input.paymentType,
      integrity: "true",
    }).toString();

    oppwaLogger.logRequest(path, "POST", data);

    const response = await fetch(`${OPPWA_BASE_URL}${path}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Content-Length": data.length.toString(),
        Authorization: `Bearer ${OPPWA_ACCESS_TOKEN}`,
      },
      body: data,
    });

    const result = await response.json();
    oppwaLogger.logResponse(path, "POST", result);

    let databaseUserId: string | null = null;
    if (input.userId) {
      const user = await db
        .selectFrom("users")
        .select("id")
        .where("clerk_id", "=", input.userId)
        .executeTakeFirst();
      if (user) {
        databaseUserId = user.id;
      }
    }

    const insertResult = await db
      .insertInto("payment_transactions")
      .values({
        user_id: databaseUserId,
        checkout_id: result.id,
        amount: Number(input.amount),
        currency: input.currency,
        payment_type: input.paymentType,
        raw_prepare_result: result,
      })
      .returning(["id"])
      .executeTakeFirst();

    if (result.result.code !== "000.200.100") {
      throw new Error(
        `Payment preparation failed: ${result.result.description}`
      );
    }

    return {
      id: result.id,
      transactionId: insertResult?.id,
      widgetUrl: `${OPPWA_BASE_URL}/v1/paymentWidgets.js?checkoutId=${result.id}`,
    };
  } catch (error) {
    oppwaLogger.logResponse("/v1/checkouts", "POST", null, error);
    console.error("Checkout preparation error:", error);
    return { error: "Failed to prepare checkout" };
  }
}

async function _checkPaymentStatus(
  checkoutId: string
): Promise<{ result?: { code: string; description: string }; error?: string }> {
  try {
    if (!checkoutId) {
      return { error: "Missing checkoutId parameter" };
    }

    const path = `/v1/checkouts/${checkoutId}/payment?entityId=${OPPWA_ENTITY_ID}`;
    oppwaLogger.logRequest(path, "GET");

    const response = await fetch(`${OPPWA_BASE_URL}${path}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${OPPWA_ACCESS_TOKEN}`,
      },
    });

    const data = await response.json();
    oppwaLogger.logResponse(path, "GET", data);

    // Additional detailed logging for parameter errors
    if (data.parameterErrors && Array.isArray(data.parameterErrors)) {
      console.error("OPPWA Parameter Errors Details:", {
        checkoutId,
        parameterErrors: data.parameterErrors,
        resultCode: data.result?.code,
        resultDescription: data.result?.description,
        fullResponse: data,
      });

      // Log each parameter error individually for clarity
      data.parameterErrors.forEach((error: any, index: number) => {
        console.error(`Parameter Error ${index + 1}:`, error);
      });
    }

    await db
      .updateTable("payment_transactions")
      .set({
        status_code: data.result?.code,
        status_description: data.result?.description,
        brand: data.paymentBrand || null,
        payment_id: data.id || null,
        raw_status_result: data,
      })
      .where("checkout_id", "=", checkoutId)
      .execute();

    return { result: data.result };
  } catch (error) {
    oppwaLogger.logResponse(
      `/v1/checkouts/${checkoutId}/payment`,
      "GET",
      null,
      error
    );
    console.error("Payment status check error:", error);
    return { error: "Failed to check payment status" };
  }
}

// --- Exported Functions ---

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

function isPaymentSuccessful(code: string): boolean {
  const successCodes = [
    "000.000.000",
    "000.000.100",
    "000.100.105",
    "000.100.106",
    "000.100.110",
    "000.100.111",
    "000.100.112",
    "000.300.000",
    "000.300.100",
    "000.300.101",
    "000.300.102",
    "000.310.100",
    "000.310.101",
    "000.310.110",
    "000.600.000",
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

    const amountInPounds = penceToPounds(cardAmount).toFixed(2);

    const checkoutResult = await _prepareCheckout({
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
    const paymentStatus = await _checkPaymentStatus(checkoutId);
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
