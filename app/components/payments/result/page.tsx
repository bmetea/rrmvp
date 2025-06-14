"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { checkPaymentStatus } from "../actions";
import { PaymentResultDialog } from "../components/payment-result-dialog";

export default function CheckoutResultPage() {
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [message, setMessage] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(true);
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
        console.log("result", result);

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

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    router.push("/nomu-checkout");
  };

  return (
    <PaymentResultDialog
      isOpen={isDialogOpen}
      status={status}
      message={message}
      onClose={handleDialogClose}
    />
  );
}
