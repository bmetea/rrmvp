"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { checkPaymentStatus } from "../(server)/payment.actions";
import { useCart } from "@/shared/lib/context/cart-context";
import { checkoutWithTransaction } from "../(server)/checkout.actions";

export default function CheckoutResultPage() {
  const [status, setStatus] = useState<"loading" | "error">("loading");
  const [message, setMessage] = useState("");
  const searchParams = useSearchParams();
  const router = useRouter();
  const { clearCart, items } = useCart();

  useEffect(() => {
    const processPaymentAndCheckout = async () => {
      const checkoutId = searchParams.get("id");

      if (!checkoutId) {
        redirectToSummary("error", "Invalid payment response");
        return;
      }

      try {
        // Verify payment first
        const paymentResult = await checkPaymentStatus(checkoutId);

        // Handle specific error codes
        if (paymentResult.error || !paymentResult.result) {
          redirectToSummary(
            "error",
            paymentResult.error || "Payment verification failed"
          );
          return;
        }

        // Handle specific error codes
        if (paymentResult.result.code === "200.300.404") {
          redirectToSummary(
            "error",
            "Payment session has expired. Please try again."
          );
          return;
        }

        if (paymentResult.result.code !== "000.100.110") {
          redirectToSummary(
            "error",
            `Payment failed: ${paymentResult.result.description}`
          );
          return;
        }

        // Process the checkout
        const result = await checkoutWithTransaction(items, checkoutId);

        // Clear cart before redirecting
        clearCart();

        // Redirect to summary page with results
        const summaryData = {
          paymentMethod: "card",
          results: result.results || [],
          paymentStatus: result.success ? "success" : "error",
          paymentMessage: result.message,
        };

        const encodedSummary = encodeURIComponent(JSON.stringify(summaryData));
        router.push(`/checkout/summary?summary=${encodedSummary}`);
      } catch (error) {
        console.error("Error processing payment and checkout:", error);
        redirectToSummary("error", "Error processing payment and checkout");
      }
    };

    processPaymentAndCheckout();
  }, [searchParams, items, clearCart, router]);

  const redirectToSummary = (status: "error", message: string) => {
    const summaryData = {
      paymentMethod: "card",
      results: [],
      paymentStatus: status,
      paymentMessage: message,
    };
    const encodedSummary = encodeURIComponent(JSON.stringify(summaryData));
    router.push(`/checkout/summary?summary=${encodedSummary}`);
  };

  // Show loading spinner while processing
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900" />
    </div>
  );
}
