"use client";

import { useEffect, useState, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  checkPaymentStatus,
  checkoutWithTransaction,
} from "../(server)/actions";
import { useCart } from "@/shared/lib/context/cart-context";
import { oppwaLogger } from "@/shared/lib/logger";

export default function CheckoutResultPage() {
  const [status, setStatus] = useState<"loading" | "error">("loading");
  const [message, setMessage] = useState("");
  const searchParams = useSearchParams();
  const router = useRouter();
  const { clearCart, items } = useCart();
  const isProcessing = useRef(false);

  useEffect(() => {
    const controller = new AbortController();

    const processPaymentAndCheckout = async () => {
      const checkoutId = searchParams.get("id");

      // Prevent duplicate processing
      if (isProcessing.current) {
        oppwaLogger.logWidget("resultPage:skipped", {
          reason: "Already processing",
        });
        return;
      }

      if (!checkoutId) {
        oppwaLogger.logWidget("resultPage:error", {
          error: "Invalid payment response - missing checkoutId",
        });
        redirectToSummary("error", "Invalid payment response");
        return;
      }

      try {
        isProcessing.current = true;
        oppwaLogger.logWidget("resultPage:verifyingPayment", { checkoutId });

        // Check if the request was aborted
        if (controller.signal.aborted) {
          return;
        }

        // Verify payment first
        const paymentResult = await checkPaymentStatus(checkoutId);

        // Check if payment is successful using the success codes
        const isPaymentSuccessful = (code: string): boolean => {
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
        };

        if (
          paymentResult.error ||
          !paymentResult.result?.code ||
          !isPaymentSuccessful(paymentResult.result.code)
        ) {
          oppwaLogger.logWidget("resultPage:paymentFailed", {
            checkoutId,
            error: paymentResult.error,
            code: paymentResult.result?.code,
            description: paymentResult.result?.description,
          });

          redirectToSummary(
            "error",
            paymentResult.error ||
              paymentResult.result?.description ||
              "Payment failed"
          );
          return;
        }

        // Check if the request was aborted
        if (controller.signal.aborted) {
          return;
        }

        oppwaLogger.logWidget("resultPage:paymentSuccessful", {
          checkoutId,
          code: paymentResult.result.code,
        });

        // Process the checkout
        oppwaLogger.logWidget("resultPage:processingCheckout", { checkoutId });
        const result = await checkoutWithTransaction(items, checkoutId);

        // Clear cart before redirecting
        clearCart();

        oppwaLogger.logWidget("resultPage:checkoutComplete", {
          checkoutId,
          success: result.success,
          message: result.message,
        });

        // Redirect to summary page with results
        const summaryData = {
          paymentMethod: "card",
          results: result.results || [],
          paymentStatus: result.success ? "success" : "error",
          paymentMessage: result.message,
        };

        const encodedSummary = encodeURIComponent(JSON.stringify(summaryData));
        router.replace(`/checkout/summary?summary=${encodedSummary}`);
      } catch (error) {
        if (!controller.signal.aborted) {
          oppwaLogger.logWidget("resultPage:error", {
            checkoutId,
            error: error instanceof Error ? error.message : "Unknown error",
          });
          console.error("Error processing payment and checkout:", error);
          redirectToSummary("error", "Error processing payment and checkout");
        }
      } finally {
        isProcessing.current = false;
      }
    };

    processPaymentAndCheckout();

    // Cleanup function to abort any pending requests when the component unmounts
    // or when the dependencies change
    return () => {
      controller.abort();
    };
  }, [searchParams]); // Remove router, items, and clearCart from dependencies

  const redirectToSummary = (status: "error", message: string) => {
    const summaryData = {
      paymentMethod: "card",
      results: [],
      paymentStatus: status,
      paymentMessage: message,
    };
    const encodedSummary = encodeURIComponent(JSON.stringify(summaryData));
    router.replace(`/checkout/summary?summary=${encodedSummary}`);
  };

  // Show loading spinner while processing
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900" />
    </div>
  );
}
