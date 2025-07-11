"use client";

import { useCallback, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { analytics } from "@/shared/lib/segment";
import { useMetaPixel } from "./use-meta-pixel";

export interface SegmentUser {
  userId: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  createdAt?: string;
  lastActive?: string;
  totalPurchases?: number;
  totalSpent?: number;
}

export interface CartItem {
  competitionId: string;
  competitionTitle: string;
  competitionType?: string;
  price: number;
  quantity: number;
  ticketPrice?: number;
}

export interface PurchaseData {
  orderId: string;
  revenue: number;
  currency?: string;
  paymentMethod: string;
  items: CartItem[];
  walletAmount?: number;
  cardAmount?: number;
}

export const useAnalytics = () => {
  const { user, isSignedIn } = useUser();
  const metaPixel = useMetaPixel();

  // Identify user when they sign in or user data is available
  useEffect(() => {
    if (isSignedIn && user) {
      const userData: SegmentUser = {
        userId: user.id,
        email: user.primaryEmailAddress?.emailAddress,
        firstName: user.firstName || undefined,
        lastName: user.lastName || undefined,
        createdAt: user.createdAt?.toISOString(),
        lastActive: new Date().toISOString(),
      };

      analytics.then(([analytics]) => {
        analytics.identify(user.id, userData);
      });

      // Track last active
      trackLastActive();
    }
  }, [isSignedIn, user]);

  // Track page views
  const trackPageView = useCallback(
    (page: string, properties?: Record<string, any>) => {
      analytics.then(([analytics]) => {
        analytics.page(page, {
          path: page,
          url: window.location.href,
          title: document.title,
          ...properties,
          timestamp: new Date().toISOString(),
        });
      });
    },
    []
  );

  // Track user signup
  const trackSignUp = useCallback((userData: SegmentUser) => {
    analytics.then(([analytics]) => {
      analytics.track("User Signed Up", {
        userId: userData.userId,
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        signupDate: userData.createdAt,
        signupMethod: "clerk",
      });

      // Also identify the user
      analytics.identify(userData.userId, userData);
    });
  }, []);

  // Track add to cart
  const trackAddToCart = useCallback(
    (item: CartItem) => {
      analytics.then(([analytics]) => {
        analytics.track("Product Added", {
          product_id: item.competitionId,
          name: item.competitionTitle,
          category: item.competitionType || "competition",
          price: item.price,
          quantity: item.quantity,
          ticket_price: item.ticketPrice,
          currency: "GBP",
          value: item.price * item.quantity,
        });
      });

      // Track in Meta Pixel
      metaPixel.trackAddToCart({
        content_ids: [item.competitionId],
        content_name: item.competitionTitle,
        content_type: "product",
        value: (item.price * item.quantity) / 100, // Convert pence to pounds for Meta
        currency: "GBP",
      });
    },
    [metaPixel]
  );

  // Track remove from cart
  const trackRemoveFromCart = useCallback((item: CartItem) => {
    analytics.then(([analytics]) => {
      analytics.track("Product Removed", {
        product_id: item.competitionId,
        name: item.competitionTitle,
        category: item.competitionType || "competition",
        price: item.price,
        quantity: item.quantity,
        currency: "GBP",
        value: item.price * item.quantity,
      });
    });
  }, []);

  // Track cart viewed
  const trackCartViewed = useCallback(
    (items: CartItem[], totalValue: number) => {
      const products = items.map((item) => ({
        product_id: item.competitionId,
        name: item.competitionTitle,
        category: item.competitionType || "competition",
        price: item.price,
        quantity: item.quantity,
      }));

      analytics.then(([analytics]) => {
        analytics.track("Cart Viewed", {
          cart_id: `cart_${Date.now()}`,
          products,
          value: totalValue,
          currency: "GBP",
          num_items: items.length,
        });
      });
    },
    []
  );

  // Track checkout started
  const trackCheckoutStarted = useCallback(
    (items: CartItem[], totalValue: number, checkoutId?: string) => {
      const products = items.map((item) => ({
        product_id: item.competitionId,
        name: item.competitionTitle,
        category: item.competitionType || "competition",
        price: item.price,
        quantity: item.quantity,
      }));

      analytics.then(([analytics]) => {
        analytics.track("Checkout Started", {
          order_id: checkoutId || `checkout_${Date.now()}`,
          products,
          value: totalValue,
          currency: "GBP",
          num_items: items.length,
          checkout_step: 1,
        });
      });

      // Track in Meta Pixel
      metaPixel.trackInitiateCheckout({
        content_ids: items.map((item) => item.competitionId),
        num_items: items.length,
        value: totalValue / 100, // Convert pence to pounds for Meta
        currency: "GBP",
      });

      // Set checkout abandonment timer
      setTimeout(() => {
        trackCheckoutAbandoned(items, totalValue, checkoutId);
      }, 15 * 60 * 1000); // 15 minutes
    },
    [metaPixel]
  );

  // Track checkout abandoned
  const trackCheckoutAbandoned = useCallback(
    (items: CartItem[], totalValue: number, checkoutId?: string) => {
      // Check if purchase was completed by checking if we're still on checkout pages
      const currentPath = window.location.pathname;
      if (
        currentPath.includes("/checkout") &&
        !currentPath.includes("/summary")
      ) {
        const products = items.map((item) => ({
          product_id: item.competitionId,
          name: item.competitionTitle,
          category: item.competitionType || "competition",
          price: item.price,
          quantity: item.quantity,
        }));

        analytics.then(([analytics]) => {
          analytics.track("Checkout Abandoned", {
            order_id: checkoutId || `abandoned_${Date.now()}`,
            products,
            value: totalValue,
            currency: "GBP",
            num_items: items.length,
            abandonment_time: new Date().toISOString(),
          });
        });
      }
    },
    []
  );

  // Track purchase completed
  const trackPurchase = useCallback(
    (purchaseData: PurchaseData) => {
      const products = purchaseData.items.map((item) => ({
        product_id: item.competitionId,
        sku: item.competitionId,
        name: item.competitionTitle,
        category: item.competitionType || "competition",
        price: item.price,
        quantity: item.quantity,
      }));

      analytics.then(([analytics]) => {
        analytics.track("Order Completed", {
          order_id: purchaseData.orderId,
          products,
          revenue: purchaseData.revenue,
          value: purchaseData.revenue,
          currency: purchaseData.currency || "GBP",
          payment_method: purchaseData.paymentMethod,
          wallet_amount: purchaseData.walletAmount,
          card_amount: purchaseData.cardAmount,
          num_items: purchaseData.items.length,
          total_tickets: purchaseData.items.reduce(
            (sum, item) => sum + item.quantity,
            0
          ),
        });

        // Track revenue
        analytics.track("Revenue", {
          revenue: purchaseData.revenue,
          currency: purchaseData.currency || "GBP",
          order_id: purchaseData.orderId,
        });
      });

      // Track in Meta Pixel
      metaPixel.trackPurchase({
        content_ids: purchaseData.items.map((item) => item.competitionId),
        value: purchaseData.revenue / 100, // Convert pence to pounds for Meta
        currency: purchaseData.currency || "GBP",
        num_items: purchaseData.items.length,
      });
    },
    [metaPixel]
  );

  // Track competition viewed
  const trackCompetitionViewed = useCallback(
    (
      competitionId: string,
      competitionTitle: string,
      competitionType?: string
    ) => {
      analytics.then(([analytics]) => {
        analytics.track("Product Viewed", {
          product_id: competitionId,
          name: competitionTitle,
          category: competitionType || "competition",
        });
      });

      // Track in Meta Pixel
      metaPixel.trackViewContent({
        content_ids: [competitionId],
        content_name: competitionTitle,
        content_type: "product",
      });
    },
    [metaPixel]
  );

  // Track search
  const trackSearch = useCallback(
    (query: string, results?: number) => {
      analytics.then(([analytics]) => {
        analytics.track("Products Searched", {
          query,
          results_count: results,
        });
      });

      // Track in Meta Pixel
      metaPixel.trackSearch({
        search_string: query,
      });
    },
    [metaPixel]
  );

  // Track last active (called periodically)
  const trackLastActive = useCallback(() => {
    if (isSignedIn && user) {
      analytics.then(([analytics]) => {
        analytics.track("User Active", {
          last_active: new Date().toISOString(),
          page: window.location.pathname,
        });
      });
    }
  }, [isSignedIn, user]);

  // Track custom events
  const trackEvent = useCallback(
    (eventName: string, properties?: Record<string, any>) => {
      analytics.then(([analytics]) => {
        analytics.track(eventName, {
          ...properties,
          timestamp: new Date().toISOString(),
        });
      });
    },
    []
  );

  // Set up periodic activity tracking
  useEffect(() => {
    if (isSignedIn) {
      const interval = setInterval(() => {
        trackLastActive();
      }, 30000); // Track activity every 30 seconds

      // Track activity on visibility change
      const handleVisibilityChange = () => {
        if (!document.hidden) {
          trackLastActive();
        }
      };

      document.addEventListener("visibilitychange", handleVisibilityChange);

      return () => {
        clearInterval(interval);
        document.removeEventListener(
          "visibilitychange",
          handleVisibilityChange
        );
      };
    }
  }, [isSignedIn, trackLastActive]);

  return {
    trackPageView,
    trackSignUp,
    trackAddToCart,
    trackRemoveFromCart,
    trackCartViewed,
    trackCheckoutStarted,
    trackCheckoutAbandoned,
    trackPurchase,
    trackCompetitionViewed,
    trackSearch,
    trackLastActive,
    trackEvent,
  };
};
