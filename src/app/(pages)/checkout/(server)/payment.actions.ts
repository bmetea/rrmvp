"use server";

import { db } from "@/db";
import { auth } from "@clerk/nextjs/server";
import { oppwaLogger } from "@/shared/lib/logger";

const OPPWA_BASE_URL =
  process.env.OPPWA_BASE_URL || "https://eu-test.oppwa.com";
const OPPWA_ENTITY_ID = process.env.OPPWA_ENTITY_ID;
const OPPWA_ACCESS_TOKEN = process.env.OPPWA_ACCESS_TOKEN;

export type PrepareCheckoutInput = {
  amount: string;
  currency: string;
  paymentType: string;
  userId?: string;
};

export type PrepareCheckoutResponse = {
  id?: string;
  transactionId?: string;
  error?: string;
  widgetUrl?: string;
};

export async function prepareCheckout(
  input: PrepareCheckoutInput
): Promise<PrepareCheckoutResponse> {
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
    console.log("result", result);

    // Get database user ID from Clerk user ID
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

    // Save to payment_transactions
    const insertResult = await db
      .insertInto("payment_transactions")
      .values({
        user_id: databaseUserId,
        checkout_id: result.id,
        amount: Number(input.amount),
        currency: input.currency,
        payment_type: input.paymentType,
        raw_prepare_result: result,
        created_at: new Date(),
        updated_at: new Date(),
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

export type CheckPaymentStatusResponse = {
  result?: {
    code: string;
    description: string;
  };
  error?: string;
};

export async function checkPaymentStatus(
  checkoutId: string
): Promise<CheckPaymentStatusResponse> {
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
    console.log("payment status result:", data);
    if (data.result && data.result.parameterErrors) {
      console.log("parameterErrors:", data.result.parameterErrors);
    }

    // Update payment_transactions with status and raw result
    await db
      .updateTable("payment_transactions")
      .set({
        status_code: data.result?.code,
        status_description: data.result?.description,
        brand: data.paymentBrand || null,
        payment_id: data.id || null,
        raw_status_result: data,
        updated_at: new Date(),
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


