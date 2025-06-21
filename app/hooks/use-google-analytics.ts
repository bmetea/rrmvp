import { useCallback } from "react";

declare global {
  interface Window {
    gtag: (...args: any[]) => void;
  }
}

const ENABLE_ANALYTICS = process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === "true";
const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GA_TRACKING_ID || "G-TCT192NP1Q";

export const useGoogleAnalytics = () => {
  const trackEvent = useCallback(
    (action: string, category: string, label?: string, value?: number) => {
      if (!ENABLE_ANALYTICS) return;

      if (typeof window !== "undefined" && window.gtag) {
        window.gtag("event", action, {
          event_category: category,
          event_label: label,
          value: value,
        });
      }
    },
    []
  );

  const trackPageView = useCallback((url: string) => {
    if (!ENABLE_ANALYTICS) return;

    if (typeof window !== "undefined" && window.gtag) {
      window.gtag("config", GA_TRACKING_ID, {
        page_path: url,
      });
    }
  }, []);

  const trackPurchase = useCallback(
    (
      transactionId: string,
      value: number,
      currency: string = "USD",
      items?: Array<{
        item_id: string;
        item_name: string;
        price: number;
        quantity: number;
      }>
    ) => {
      if (!ENABLE_ANALYTICS) return;

      if (typeof window !== "undefined" && window.gtag) {
        window.gtag("event", "purchase", {
          transaction_id: transactionId,
          value: value,
          currency: currency,
          items: items,
        });
      }
    },
    []
  );

  return {
    trackEvent,
    trackPageView,
    trackPurchase,
  };
};
