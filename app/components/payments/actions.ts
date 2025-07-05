"use server";

const OPPWA_BASE_URL =
  process.env.OPPWA_BASE_URL || "https://eu-test.oppwa.com";
const OPPWA_ENTITY_ID = process.env.OPPWA_ENTITY_ID;
const OPPWA_ACCESS_TOKEN = process.env.OPPWA_ACCESS_TOKEN;

export type PrepareCheckoutInput = {
  amount: string;
  currency: string;
  paymentType: string;
};

export type PrepareCheckoutResponse = {
  id?: string;
  error?: string;
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
    console.log("result", result);

    if (result.result.code !== "000.200.100") {
      throw new Error(
        `Payment preparation failed: ${result.result.description}`
      );
    }

    return { id: result.id };
  } catch (error) {
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

    const response = await fetch(`${OPPWA_BASE_URL}${path}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${OPPWA_ACCESS_TOKEN}`,
      },
    });

    const data = await response.json();
    console.log("payment status result:", data);
    if (data.result && data.result.parameterErrors) {
      console.log("parameterErrors:", data.result.parameterErrors);
    }
    return { result: data.result };
  } catch (error) {
    console.error("Payment status check error:", error);
    return { error: "Failed to check payment status" };
  }
}
