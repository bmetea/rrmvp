import { useCallback } from "react";

declare global {
  interface Window {
    fbq: (...args: any[]) => void;
  }
}

const ENABLE_ANALYTICS = process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === "true";
const META_PIXEL_ID =
  process.env.NEXT_PUBLIC_META_PIXEL_ID || "1422329032149636";

export const useMetaPixel = () => {
  const trackEvent = useCallback(
    (eventName: string, parameters?: Record<string, any>) => {
      if (!ENABLE_ANALYTICS) return;

      if (typeof window !== "undefined" && window.fbq) {
        window.fbq("track", eventName, parameters);
      }
    },
    []
  );

  const trackCustomEvent = useCallback(
    (eventName: string, parameters?: Record<string, any>) => {
      if (!ENABLE_ANALYTICS) return;

      if (typeof window !== "undefined" && window.fbq) {
        window.fbq("trackCustom", eventName, parameters);
      }
    },
    []
  );

  const trackPageView = useCallback((url?: string) => {
    if (!ENABLE_ANALYTICS) return;

    if (typeof window !== "undefined" && window.fbq) {
      window.fbq("track", "PageView");
    }
  }, []);

  const trackAddToCart = useCallback(
    (parameters: {
      content_ids: string[];
      content_name?: string;
      content_type?: string;
      value?: number;
      currency?: string;
    }) => {
      if (!ENABLE_ANALYTICS) return;

      if (typeof window !== "undefined" && window.fbq) {
        window.fbq("track", "AddToCart", {
          content_ids: parameters.content_ids,
          content_name: parameters.content_name,
          content_type: parameters.content_type || "product",
          value: parameters.value,
          currency: parameters.currency || "GBP",
        });
      }
    },
    []
  );

  const trackInitiateCheckout = useCallback(
    (parameters: {
      content_ids: string[];
      num_items?: number;
      value?: number;
      currency?: string;
    }) => {
      if (!ENABLE_ANALYTICS) return;

      if (typeof window !== "undefined" && window.fbq) {
        window.fbq("track", "InitiateCheckout", {
          content_ids: parameters.content_ids,
          num_items: parameters.num_items,
          value: parameters.value,
          currency: parameters.currency || "GBP",
        });
      }
    },
    []
  );

  const trackPurchase = useCallback(
    (parameters: {
      content_ids: string[];
      value: number;
      currency?: string;
      num_items?: number;
    }) => {
      if (!ENABLE_ANALYTICS) return;

      if (typeof window !== "undefined" && window.fbq) {
        window.fbq("track", "Purchase", {
          content_ids: parameters.content_ids,
          value: parameters.value,
          currency: parameters.currency || "GBP",
          num_items: parameters.num_items,
        });
      }
    },
    []
  );

  const trackViewContent = useCallback(
    (parameters: {
      content_ids: string[];
      content_name?: string;
      content_type?: string;
      value?: number;
      currency?: string;
    }) => {
      if (!ENABLE_ANALYTICS) return;

      if (typeof window !== "undefined" && window.fbq) {
        window.fbq("track", "ViewContent", {
          content_ids: parameters.content_ids,
          content_name: parameters.content_name,
          content_type: parameters.content_type || "product",
          value: parameters.value,
          currency: parameters.currency || "GBP",
        });
      }
    },
    []
  );

  const trackSearch = useCallback(
    (parameters: { search_string: string; content_ids?: string[] }) => {
      if (!ENABLE_ANALYTICS) return;

      if (typeof window !== "undefined" && window.fbq) {
        window.fbq("track", "Search", {
          search_string: parameters.search_string,
          content_ids: parameters.content_ids,
        });
      }
    },
    []
  );

  return {
    trackEvent,
    trackCustomEvent,
    trackPageView,
    trackAddToCart,
    trackInitiateCheckout,
    trackPurchase,
    trackViewContent,
    trackSearch,
  };
};
