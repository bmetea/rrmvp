"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { checkPaymentStatus } from "./actions";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle } from "lucide-react";

export function PaymentResult() {
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [message, setMessage] = useState("");
  const [isOpen, setIsOpen] = useState(true);
  const searchParams = useSearchParams();
  const router = useRouter();

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
    if (status === "success") {
      const timer = setTimeout(() => {
        handleClose();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [status]);

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
