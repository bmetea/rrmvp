"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { checkPaymentStatus } from "@/components/payments/actions";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle } from "lucide-react";
import { useCart } from "@/lib/context/cart-context";
import { checkout } from "../actions";

export default function CheckoutResultPage() {
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [message, setMessage] = useState("");
  const [isOpen, setIsOpen] = useState(true);
  const [isProcessingCheckout, setIsProcessingCheckout] = useState(false);
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
          const result = await checkout(items);
          if (!result.success) {
            setStatus("error");
            setMessage(result.message || "Failed to process checkout");
            return;
          }
          clearCart();
          const timer = setTimeout(() => {
            handleClose();
          }, 3000);
          return () => clearTimeout(timer);
        } catch (error) {
          setStatus("error");
          setMessage("Error processing checkout");
          console.error(error);
        }
      };
      processCheckout();
    }
  }, [status, clearCart, items, isProcessingCheckout]);

  const handleClose = () => {
    setIsOpen(false);
    router.push("/checkout");
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">
            {status === "loading" && "Processing Payment"}
            {status === "success" && "Payment Successful"}
            {status === "error" && "Payment Failed"}
          </DialogTitle>
          <DialogDescription className="text-center">
            {message}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center justify-center py-4">
          {status === "loading" && (
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900" />
          )}
          {status === "success" && (
            <CheckCircle2 className="h-12 w-12 text-green-500" />
          )}
          {status === "error" && <XCircle className="h-12 w-12 text-red-500" />}
        </div>

        {status === "error" && (
          <div className="flex justify-center">
            <Button onClick={handleClose} variant="default">
              Try Again
            </Button>
          </div>
        )}

        {status === "success" && (
          <p className="text-center text-sm text-gray-500">
            Redirecting back to checkout...
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
}
