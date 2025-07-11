import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Utility function to clean up payment widget scripts that might interfere with navigation
export function cleanupPaymentWidgetGlobals() {
  if (typeof window === "undefined") return;

  try {
    // Remove payment widget global objects
    delete (window as any).wpwl;
    delete (window as any).wpwlOptions;
    delete (window as any).OPPWA;

    // Remove payment widget scripts (excluding jquery to avoid conflicts)
    const paymentScripts = document.querySelectorAll(
      'script[data-payment-widget="true"], script[src*="paymentWidgets.js"]'
    );
    paymentScripts.forEach((script) => {
      try {
        script.remove();
      } catch (e) {
        // Ignore removal errors
      }
    });

    // Remove payment widget styles
    const paymentStyles = document.querySelectorAll(
      'style[data-payment-widget="true"]'
    );
    paymentStyles.forEach((style) => {
      try {
        style.remove();
      } catch (e) {
        // Ignore removal errors
      }
    });

    // Remove any payment widget DOM elements that might still be present
    const paymentWidgets = document.querySelectorAll(
      ".paymentWidgets, .wpwl-form, .nomupaySubmitButton"
    );
    paymentWidgets.forEach((element) => {
      try {
        element.remove();
      } catch (e) {
        // Ignore removal errors
      }
    });

    // Only log once to avoid console spam
    if (!window.hasOwnProperty('_paymentWidgetCleaned')) {
      (window as any)._paymentWidgetCleaned = true;
      console.log("Payment widget cleanup completed");
    }
  } catch (error) {
    console.warn("Error during payment widget cleanup:", error);
  }
}
