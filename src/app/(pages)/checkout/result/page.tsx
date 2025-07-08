"use client";

import { useEffect, useState, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { completeCheckoutAfterPayment } from "../(server)/checkout-orchestrator.actions";
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

        // Process the checkout with the new flow
        oppwaLogger.logWidget("resultPage:processingCheckout", { checkoutId });
        const result = await completeCheckoutAfterPayment(items, checkoutId);

        // Clear cart before redirecting
        clearCart();

        oppwaLogger.logWidget("resultPage:checkoutComplete", {
          checkoutId,
          success: result.success,
          step: result.step,
          error: result.error,
        });

        // Redirect to summary page with results
        const summaryData = {
          paymentMethod: "card",
          results: result.finalResults?.ticketResults.results || [],
          paymentStatus: result.success ? "success" : "error",
          paymentMessage:
            result.finalResults?.message || result.error || "Payment failed",
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
