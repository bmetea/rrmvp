"use client";

import { useEffect, useState, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { checkout } from "../(server)/checkout-orchestrator.actions";
import { useCart } from "@/shared/lib/context/cart-context";
import { logCheckoutError } from "@/shared/lib/logger";
import { useAuth } from "@clerk/nextjs";

function CheckoutResultContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { clearCart } = useCart();
  const { userId, isSignedIn, isLoaded } = useAuth();
  const [isProcessing, setIsProcessing] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const hasProcessed = useRef(false);

  useEffect(() => {
    const processCheckout = async () => {
      // Wait for auth to be loaded
      if (!isLoaded) {
        return;
      }

      // Prevent double processing
      if (hasProcessed.current) return;
      hasProcessed.current = true;

      const checkoutId = searchParams.get("id");
      const resourcePath = searchParams.get("resourcePath");

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
        if (!userId) {
          setError("User not authenticated");
          setIsProcessing(false);
          return;
        }

        const result = await checkout(items, checkoutId, userId);

        // Clear cart before redirecting
        clearCart();

        if (result.success && result.shouldRedirect && result.redirectUrl) {
          // Navigate to the summary page
          router.push(result.redirectUrl);
        } else if (!result.success) {
          setError(result.error || "Checkout failed");
          setIsProcessing(false);
        }
      } catch (error) {
        const storedItems = sessionStorage.getItem("checkout_items");
        logCheckoutError("result processing", error, {
          checkoutId,
          resourcePath,
          hasStoredItems: !!storedItems,
        });
        setError("An error occurred processing your payment");
        setIsProcessing(false);
      }
    };

    processCheckout();
  }, [searchParams, clearCart, isLoaded, userId]);

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
