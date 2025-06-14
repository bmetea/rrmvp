"use client";

import { useEffect, useState } from "react";
import { prepareCheckout } from "./actions";

declare global {
  interface Window {
    OPPWA: any;
  }
}

export default function CheckoutPage() {
  const [checkoutId, setCheckoutId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializeCheckout = async () => {
      try {
        const result = await prepareCheckout({
          amount: "10.00", // Replace with actual amount
          currency: "GBP", // Replace with actual currency
          paymentType: "DB",
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
  }, []);

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
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Checkout</h1>
      {checkoutId ? (
        <form
          action="/nomu-checkout/result"
          className="paymentWidgets"
          data-brands="VISA AMEX APPLEPAY GOOGLEPAY"
        />
      ) : (
        <div>Loading payment form...</div>
      )}
    </div>
  );
}
