"use client";

import { useEffect, useState } from "react";
import { prepareCheckout } from "./actions";

declare global {
  interface Window {
    OPPWA: any;
  }
}

interface PaymentFormProps {
  amount: string;
  currency?: string;
  paymentType?: string;
  brands?: string;
  className?: string;
}

export function PaymentForm({
  amount,
  currency = "GBP",
  paymentType = "DB",
  brands = "VISA AMEX APPLEPAY GOOGLEPAY",
  className = "",
}: PaymentFormProps) {
  const [checkoutId, setCheckoutId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializeCheckout = async () => {
      try {
        const result = await prepareCheckout({
          amount,
          currency,
          paymentType,
        });

        if (result.id) {
          setCheckoutId(result.id);
        } else {
          setError(result.error || "Failed to prepare checkout");
        }
      } catch (err) {
        setError("Error preparing checkout");
        console.error(err);
      }
    };

    initializeCheckout();
  }, [amount, currency, paymentType]);

  useEffect(() => {
    if (checkoutId) {
      // Load the payment widget script
      const script = document.createElement("script");
      script.src = `https://eu-test.oppwa.com/v1/paymentWidgets.js?checkoutId=${checkoutId}`;
      script.async = true;
      document.body.appendChild(script);

      return () => {
        document.body.removeChild(script);
      };
    }
  }, [checkoutId]);

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <div className={className}>
      {checkoutId ? (
        <form
          action="/checkout/result"
          className="paymentWidgets"
          data-brands={brands}
        />
      ) : (
        <div>Loading payment form...</div>
      )}
    </div>
  );
}
