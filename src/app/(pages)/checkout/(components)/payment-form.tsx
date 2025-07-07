"use client";

import { useEffect, useState } from "react";
import { prepareCheckout } from "../(server)/payment.actions";
import { useAuth } from "@clerk/nextjs";
import { PenceAmount, formatPrice } from "@/shared/lib/utils/price";

declare global {
  interface Window {
    OPPWA: any;
  }
}

interface PaymentFormProps {
  amount: PenceAmount;
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
  const [widgetUrl, setWidgetUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { userId } = useAuth();

  useEffect(() => {
    const initializeCheckout = async () => {
      try {
        const result = await prepareCheckout({
          amount: formatPrice(amount, false), // Convert pence to pounds string without symbol
          currency,
          paymentType,
          userId: userId || undefined,
        });

        if (result.id && result.widgetUrl) {
          setCheckoutId(result.id);
          setWidgetUrl(result.widgetUrl);
        } else {
          setError(result.error || "Failed to prepare checkout");
        }
      } catch (err) {
        setError("Error preparing checkout");
        console.error(err);
      }
    };

    // Reset error state and initialize checkout
    setError(null);
    initializeCheckout();
  }, [amount, currency, paymentType, userId]);

  useEffect(() => {
    if (checkoutId && widgetUrl) {
      // Cleanup function to remove scripts
      const cleanup = () => {
        const scripts = document.querySelectorAll(
          "script[data-payment-widget]"
        );
        scripts.forEach((script) => script.remove());
        const styles = document.querySelectorAll("style[data-payment-widget]");
        styles.forEach((style) => style.remove());
      };

      // Clean up any existing payment widget scripts
      cleanup();

      // Inject jQuery first
      const jqueryScript = document.createElement("script");
      jqueryScript.src = "https://code.jquery.com/jquery.js";
      jqueryScript.async = false;
      jqueryScript.setAttribute("data-payment-widget", "true");
      document.body.appendChild(jqueryScript);

      // Inject wpwlOptions config script
      const optionsScript = document.createElement("script");
      optionsScript.type = "text/javascript";
      optionsScript.setAttribute("data-payment-widget", "true");
      optionsScript.innerHTML = `
        window.wpwlOptions = {
          style: 'card',
          enableSAQACompliance: true,
          applePay: {
            buttonStyle: "black",
            buttonSource: "js",
            displayName: "MyStore",
            total: { label: "COMPANY, INC." }
          },
          googlePay: {
            buttonColor: 'black',
            buttonSizeMode: 'fill',
            merchantId: 'BCR2DN4TWXD3VYDY'
          },
          onReady: function() {
            if (window.$) {
              $(".wpwl-container-card").before($(".wpwl-form-virtualAccount"))
              $(".wpwl-container-card").before('<hr class="rounded">')
              $(".wpwl-form-card:first").after("<div class='nomupaySubmitButton'><center>Click to Pay</center></div>")
              $(".nomupaySubmitButton").click(function(){
                if (window.wpwl && window.wpwl.executePayment) {
                  wpwl.executePayment("wpwl-container-card")
                }
              })
            }
          },
          onError: function(error) {
            console.error("Payment widget error:", error);
            // Handle specific error codes
            if (error.code === "200.300.404") {
              setError("Payment session has expired. Please try again.");
            } else {
              setError("Payment processing error. Please try again.");
            }
          }
        }
      `;
      document.body.appendChild(optionsScript);

      // Inject custom CSS
      const styleTag = document.createElement("style");
      styleTag.setAttribute("data-payment-widget", "true");
      styleTag.innerHTML = `
        .wpwl-wrapper:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }
        .nomupaySubmitButton {
          background-color: #2563eb;
          color: white;
          padding: 0.75rem 1rem;
          border: none;
          border-radius: 0.375rem;
          font-weight: 600;
          margin-top: 1.5rem;
          cursor: pointer;
          transition: background-color 0.2s ease;
          margin-bottom: 10px;
          justify-content: center;
        }
        .wpwl-form {
          max-width: none;
          background-image: none;
          background-color: inherit;
          box-shadow: none;
          border: none;
          border-radius: 6px;
          padding-bottom: 6px;
        }
        .wpwl-control-iframe {
          width: 100%;
          height: 40px;
          border: 2px solid #d1d5db;
          border-radius: 0.375rem;
          font-size: 1rem;
          outline: none;
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
        }
        .wpwl-label {
          display: block;
          font-size: 0.875rem;
          font-weight: 500;
          color: #374151;
          margin-bottom: 0.5rem;
        }
        hr.rounded {
          border-top: 3px solid #d1d5db;
          border-radius: 5px;
          margin-bottom: 20px;
        }
      `;
      document.body.appendChild(styleTag);

      // Load the payment widget script
      const script = document.createElement("script");
      script.src = widgetUrl;
      script.async = true;
      script.setAttribute("data-payment-widget", "true");
      script.onerror = () => {
        setError("Failed to load payment form. Please try again.");
      };
      document.body.appendChild(script);

      return cleanup;
    }
  }, [checkoutId, widgetUrl]);

  if (error) {
    return (
      <div className="rounded-md bg-red-50 p-4 mb-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg
              className="h-5 w-5 text-red-400"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Payment Error</h3>
            <div className="mt-2 text-sm text-red-700">{error}</div>
          </div>
        </div>
      </div>
    );
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
        <div className="flex items-center justify-center p-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
          <span className="ml-2">Loading payment form...</span>
        </div>
      )}
    </div>
  );
}
