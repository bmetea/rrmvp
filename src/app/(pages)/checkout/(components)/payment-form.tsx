"use client";

import { useEffect, useState, useRef } from "react";
import { prepareCheckout } from "../(server)/actions";
import { useAuth } from "@clerk/nextjs";
import { oppwaLogger } from "@/shared/lib/logger";
import { penceToPounds } from "@/shared/lib/utils/price";

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
  const { userId } = useAuth();
  const isInitializing = useRef(false);

  // Get gatewayMerchantId from env
  const gatewayMerchantId = process.env.NEXT_PUBLIC_OPPWA_ENTITY_ID;

  useEffect(() => {
    const initializeCheckout = async () => {
      // Prevent duplicate initialization
      if (isInitializing.current) {
        oppwaLogger.logWidget("initializeCheckout:skipped", {
          reason: "Already initializing",
        });
        return;
      }

      try {
        isInitializing.current = true;
        oppwaLogger.logWidget("initializeCheckout:start");
        // Convert pence to pounds for OPPWA
        const amountInPounds = penceToPounds(parseInt(amount)).toFixed(2);

        const result = await prepareCheckout({
          amount: amountInPounds,
          currency,
          paymentType,
          userId: userId || undefined,
        });

        if (result.id) {
          setCheckoutId(result.id);
          oppwaLogger.logWidget("initializeCheckout:success", {
            checkoutId: result.id,
          });
        } else {
          setError(result.error || "Failed to prepare checkout");
          oppwaLogger.logWidget("initializeCheckout:error", {
            error: result.error,
          });
        }
      } catch (err) {
        setError("Error preparing checkout");
        oppwaLogger.logWidget("initializeCheckout:error", { error: err });
        console.error(err);
      } finally {
        isInitializing.current = false;
      }
    };

    // Only initialize if we don't already have a checkoutId
    if (!checkoutId) {
      initializeCheckout();
    }
  }, [amount, currency, paymentType, userId]);

  useEffect(() => {
    if (checkoutId) {
      oppwaLogger.logWidget("loadingWidget:start", { checkoutId });
      // Inject jQuery first
      const jqueryScript = document.createElement("script");
      jqueryScript.src = "https://code.jquery.com/jquery.js";
      jqueryScript.async = false;
      document.body.appendChild(jqueryScript);

      // Inject wpwlOptions config script
      const optionsScript = document.createElement("script");
      optionsScript.type = "text/javascript";
      optionsScript.innerHTML = `
        window.wpwlOptions = {
          style: 'card',
          enableSAQACompliance: true,
          applePay: {
            buttonStyle: "black",
            buttonSource: "js",
            displayName: "MyStore",
            total: { label: "COMPANY, INC." },
            merchantIdentifier: '${gatewayMerchantId}',
          },
          googlePay: {
            buttonColor: 'black',
            buttonSizeMode: 'fill',
            gatewayMerchantId: '${gatewayMerchantId}',
            merchantId: 'BCR2DN4TWXD3VYDY'
          },
          onReady: function() {
            console.log('[OPPWA Widget] Widget ready');
            if (window.$) {
              $(".wpwl-container-card").before($(".wpwl-form-virtualAccount"))
              $(".wpwl-container-card").before('<hr class="rounded">')
              // The following lines are commented out to restore browser autofill:
              // $(".wpwl-control-cardHolder").attr("placeholder", "Name on card")
              // $(".wpwl-control-cardNumber").attr("placeholder", "1234 1234 1234 1234")
              // $(".wpwl-control-expiry").attr("placeholder", "MM / YY")
              // $(".wpwl-control-cardExpiryMonth").attr("placeholder", "MM")
              // $(".wpwl-control-cardExpiryYear").attr("placeholder", "YY")
              // $(".wpwl-control-cvv, .wpwl-control-cardCvv").attr("placeholder", "123")
              $(".wpwl-form-card:first").after("<div class='nomupaySubmitButton' ><center>Click to Pay</center></div>")
              $(".nomupaySubmitButton").click(function(){
                console.log('[OPPWA Widget] Submit button clicked');
                if (window.wpwl && window.wpwl.executePayment) {
                  wpwl.executePayment("wpwl-container-card")
                }
              })
            } else {
      
            }
          },
          onBeforeSubmit: function() {
            console.log('[OPPWA Widget] Before submit');
            return true;
          },
          onAfterSubmit: function() {
            console.log('[OPPWA Widget] After submit');
          },
          onError: function(error) {
            console.error('[OPPWA Widget] Error:', error);
          }
        }
      `;
      document.body.appendChild(optionsScript);

      // Inject custom CSS
      const styleTag = document.createElement("style");
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
      script.src = `https://eu-test.oppwa.com/v1/paymentWidgets.js?checkoutId=${checkoutId}`;
      script.async = true;
      document.body.appendChild(script);

      oppwaLogger.logWidget("loadingWidget:complete", { checkoutId });

      return () => {
        oppwaLogger.logWidget("cleanupWidget", { checkoutId });
        document.body.removeChild(script);
        document.body.removeChild(optionsScript);
        document.body.removeChild(styleTag);
        document.body.removeChild(jqueryScript);
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
