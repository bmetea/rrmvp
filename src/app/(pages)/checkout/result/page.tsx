"use client";

import { useEffect, useState, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { checkout } from "../(server)/checkout-orchestrator.actions";
import { useCart } from "@/shared/lib/context/cart-context";
import { oppwaLogger } from "@/shared/lib/logger";

function CheckoutResultContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { clearCart } = useCart();
  const [isProcessing, setIsProcessing] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const hasProcessed = useRef(false);

  useEffect(() => {
    const processCheckout = async () => {
      // Prevent double processing
      if (hasProcessed.current) return;
      hasProcessed.current = true;

      const checkoutId = searchParams.get("id");
      const resourcePath = searchParams.get("resourcePath");

      oppwaLogger.logWidget("resultPage:start", { checkoutId, resourcePath });

      if (!checkoutId) {
        setError("No checkout ID found");
        setIsProcessing(false);
        return;
      }

      try {
        // Get items from sessionStorage
        const storedItems = sessionStorage.getItem("checkout_items");
        if (!storedItems) {
          setError("No checkout items found");
          setIsProcessing(false);
          return;
        }

        const items = JSON.parse(storedItems);

        // Process the checkout with the new flow
        oppwaLogger.logWidget("resultPage:processingCheckout", { checkoutId });
        const result = await checkout(items, checkoutId);

        // Clear cart before redirecting
        clearCart();

        // The checkout function will handle the redirect to summary page
        // If we reach here, there was likely an error
        if (!result.success) {
          setError(result.error || "Checkout failed");
          setIsProcessing(false);
        }
      } catch (error) {
        console.error("Checkout result processing error:", error);
        setError("An error occurred processing your payment");
        setIsProcessing(false);
      }
    };

    processCheckout();
  }, [searchParams, clearCart]);

  if (isProcessing) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4" />
          <p className="text-lg font-medium">Processing your payment...</p>
          <p className="text-sm text-muted-foreground">Please wait</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="text-red-500 text-xl font-semibold">{error}</div>
        <button
          onClick={() => router.push("/checkout")}
          className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
        >
          Back to Checkout
        </button>
      </div>
    );
  }

  // This should not be reached due to redirect, but just in case
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <p className="text-lg font-medium">Redirecting...</p>
      </div>
    </div>
  );
}

export default function CheckoutResultPage() {
  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <CheckoutResultContent />
    </div>
  );
}
