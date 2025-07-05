"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { checkPaymentStatus } from "@/components/payments/actions";
import { useCart } from "@/lib/context/cart-context";
import { checkoutWithTransaction } from "../actions";
import { PurchaseResult } from "@/components/payments/purchase-result";

export default function CheckoutResultPage() {
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [message, setMessage] = useState("");
  const [isOpen, setIsOpen] = useState(true);
  const [isProcessingCheckout, setIsProcessingCheckout] = useState(false);
  const [purchaseResults, setPurchaseResults] = useState<any[]>([]);
  const searchParams = useSearchParams();
  const router = useRouter();
  const { clearCart, items } = useCart();

  useEffect(() => {
    const verifyPayment = async () => {
      const checkoutId = searchParams.get("id");

      if (!checkoutId) {
        setStatus("error");
        setMessage("Invalid payment response");
        return;
      }

      try {
        const result = await checkPaymentStatus(checkoutId);

        if (result.error) {
          setStatus("error");
          setMessage(result.error);
          return;
        }

        if (result.result?.code === "000.100.110") {
          setStatus("success");
          setMessage("Payment successful!");
        } else {
          setStatus("error");
          setMessage(result.result?.description || "Payment failed");
        }
      } catch (error) {
        setStatus("error");
        setMessage("Error checking payment status");
        console.error(error);
      }
    };

    verifyPayment();
  }, [searchParams]);

  useEffect(() => {
    if (status === "success" && !isProcessingCheckout) {
      const processCheckout = async () => {
        setIsProcessingCheckout(true);
        try {
          const checkoutId = searchParams.get("id");
          const result = await checkoutWithTransaction(items, checkoutId);
          if (!result.success) {
            setStatus("error");
            setMessage(result.message || "Failed to process checkout");
            return;
          }
          setPurchaseResults(result.results || []);
          clearCart();
        } catch (error) {
          setStatus("error");
          setMessage("Error processing checkout");
          console.error(error);
        }
      };
      processCheckout();
    }
  }, [status, clearCart, items, isProcessingCheckout, searchParams]);

  const handleClose = () => {
    setIsOpen(false);
    router.push("/competitions");
  };

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900" />
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="text-red-500 text-xl font-semibold">{message}</div>
        <button
          onClick={() => router.push("/checkout")}
          className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <PurchaseResult
      isOpen={isOpen}
      onClose={handleClose}
      results={purchaseResults}
      paymentMethod="card"
    />
  );
}
