"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle } from "lucide-react";

type PaymentResultDialogProps = {
  isOpen: boolean;
  status: "loading" | "success" | "error";
  message: string;
  onClose: () => void;
};

export function PaymentResultDialog({
  isOpen,
  status,
  message,
  onClose,
}: PaymentResultDialogProps) {
  const router = useRouter();

  useEffect(() => {
    if (status === "success") {
      const timer = setTimeout(() => {
        onClose();
        router.push("/nomu-checkout");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [status, onClose, router]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
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
            <Button
              onClick={() => {
                onClose();
                router.push("/nomu-checkout");
              }}
              variant="default"
            >
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
