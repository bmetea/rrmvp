"use client";

import { useCallback, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { analytics } from "@/shared/lib/klaviyo";
import { useMetaPixel } from "./use-meta-pixel";

export interface KlaviyoUser {
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

export const useKlaviyoAnalytics = () => {
  const { user, isSignedIn } = useUser();
  const metaPixel = useMetaPixel();

  // Get user email for Klaviyo tracking
  const getUserEmail = useCallback(() => {
    return user?.primaryEmailAddress?.emailAddress || undefined;
  }, [user]);

  // Track sign-in events
  const trackSignIn = useCallback((userData: KlaviyoUser) => {
    analytics.track("User Signed In", {
      userId: userData.userId,
      email: userData.email,
      first_name: userData.firstName,
      last_name: userData.lastName,
      signin_date: new Date().toISOString(),
      signin_method: "clerk",
    });
  }, []);

  // Identify user and track sign-in when they sign in or user data is available
  useEffect(() => {
    if (isSignedIn && user) {
      const userData: KlaviyoUser = {
        userId: user.id,
        email: user.primaryEmailAddress?.emailAddress,
        firstName: user.firstName || undefined,
        lastName: user.lastName || undefined,
        createdAt: user.createdAt?.toISOString(),
        lastActive: new Date().toISOString(),
      };

      // Always identify user in Klaviyo (this updates their profile)
      analytics.identify(user.id, userData);

      // Only track sign-in event once per session for this user
      const sessionKey = `klaviyo_signin_tracked_${user.id}`;
      const hasTrackedThisSession = typeof window !== "undefined" && 
        sessionStorage.getItem(sessionKey);
      
      if (!hasTrackedThisSession) {
        trackSignIn(userData);
        if (typeof window !== "undefined") {
          sessionStorage.setItem(sessionKey, "true");
        }
      }
    }
  }, [isSignedIn, user]);

  // Track page views
  const trackPageView = useCallback(
    (page: string, properties?: Record<string, any>) => {
      analytics.page(page, {
        userId: user?.id,
        email: getUserEmail(),
        path: page,
        url: typeof window !== "undefined" ? window.location.href : undefined,
        title: typeof document !== "undefined" ? document.title : undefined,
        ...properties,
      });
    },
    [user?.id, getUserEmail]
  );

  // Track user signup - maps to Klaviyo's "Account Created" event
  const trackSignUp = useCallback((userData: KlaviyoUser) => {
    analytics.track("Account Created", {
      userId: userData.userId,
      email: userData.email,
      first_name: userData.firstName,
      last_name: userData.lastName,
      signup_date: userData.createdAt,
      signup_method: "clerk",
    });
  }, []);

  // Track add to cart - maps to Klaviyo's "Added to Cart" event
  const trackAddToCart = useCallback(
    (item: CartItem) => {
      analytics.track("Added to Cart", {
        userId: user?.id,
        email: getUserEmail(),
        $event_id: `cart_add_${item.competitionId}_${Date.now()}`,
        $value: (item.price * item.quantity) / 100, // Convert pence to pounds
        Items: [
          {
            ProductID: item.competitionId,
            ProductName: item.competitionTitle,
            ProductCategory: item.competitionType || "competition",
            ItemPrice: item.price / 100, // Convert pence to pounds
            Quantity: item.quantity,
            ProductURL:
              typeof window !== "undefined"
                ? `${window.location.origin}/competitions/${item.competitionId}`
                : undefined,
          },
        ],
        // Additional Klaviyo e-commerce properties
        Categories: [item.competitionType || "competition"],
        ItemNames: [item.competitionTitle],
        CheckoutURL:
          typeof window !== "undefined"
            ? `${window.location.origin}/checkout`
            : undefined,
        currency: "GBP",
      });

      // Track in Meta Pixel
      metaPixel.trackAddToCart({
        content_ids: [item.competitionId],
        content_name: item.competitionTitle,
        content_type: "product",
        value: (item.price * item.quantity) / 100,
        currency: "GBP",
      });
    },
    [user?.id, getUserEmail, metaPixel]
  );

  // Track remove from cart
  const trackRemoveFromCart = useCallback(
    (item: CartItem) => {
      analytics.track("Removed from Cart", {
        userId: user?.id,
        email: getUserEmail(),
        $event_id: `cart_remove_${item.competitionId}_${Date.now()}`,
        $value: (item.price * item.quantity) / 100,
        ProductID: item.competitionId,
        ProductName: item.competitionTitle,
        ProductCategory: item.competitionType || "competition",
        ItemPrice: item.price / 100,
        Quantity: item.quantity,
        currency: "GBP",
      });
    },
    [user?.id, getUserEmail]
  );

  // Track cart viewed
  const trackCartViewed = useCallback(
    (items: CartItem[], totalValue: number) => {
      analytics.track("Viewed Cart", {
        userId: user?.id,
        email: getUserEmail(),
        $event_id: `cart_view_${Date.now()}`,
        $value: totalValue / 100,
        Items: items.map((item) => ({
          ProductID: item.competitionId,
          ProductName: item.competitionTitle,
          ProductCategory: item.competitionType || "competition",
          ItemPrice: item.price / 100,
          Quantity: item.quantity,
        })),
        ItemNames: items.map((item) => item.competitionTitle),
        Categories: items.map((item) => item.competitionType || "competition"),
        num_items: items.length,
        currency: "GBP",
      });
    },
    [user?.id, getUserEmail]
  );

  // Track checkout started - maps to Klaviyo's "Started Checkout" event
  const trackCheckoutStarted = useCallback(
    (items: CartItem[], totalValue: number, checkoutId?: string) => {
      analytics.track("Started Checkout", {
        userId: user?.id,
        email: getUserEmail(),
        $event_id: checkoutId || `checkout_start_${Date.now()}`,
        $value: totalValue / 100,
        Items: items.map((item) => ({
          ProductID: item.competitionId,
          ProductName: item.competitionTitle,
          ProductCategory: item.competitionType || "competition",
          ItemPrice: item.price / 100,
          Quantity: item.quantity,
          ProductURL:
            typeof window !== "undefined"
              ? `${window.location.origin}/competitions/${item.competitionId}`
              : undefined,
        })),
        ItemNames: items.map((item) => item.competitionTitle),
        Categories: items.map((item) => item.competitionType || "competition"),
        CheckoutURL:
          typeof window !== "undefined"
            ? `${window.location.origin}/checkout`
            : undefined,
        num_items: items.length,
        currency: "GBP",
      });

      // Track in Meta Pixel
      metaPixel.trackInitiateCheckout({
        content_ids: items.map((item) => item.competitionId),
        num_items: items.length,
        value: totalValue / 100,
        currency: "GBP",
      });

      // Set checkout abandonment timer
      setTimeout(() => {
        trackCheckoutAbandoned(items, totalValue, checkoutId);
      }, 15 * 60 * 1000); // 15 minutes
    },
    [user?.id, getUserEmail, metaPixel]
  );

  // Track checkout abandoned
  const trackCheckoutAbandoned = useCallback(
    (items: CartItem[], totalValue: number, checkoutId?: string) => {
      // Check if purchase was completed by checking if we're still on checkout pages
      if (typeof window !== "undefined") {
        const currentPath = window.location.pathname;
        if (
          currentPath.includes("/checkout") &&
          !currentPath.includes("/summary")
        ) {
          analytics.track("Checkout Abandoned", {
            userId: user?.id,
            email: getUserEmail(),
            $event_id: checkoutId || `abandoned_${Date.now()}`,
            $value: totalValue / 100,
            Items: items.map((item) => ({
              ProductID: item.competitionId,
              ProductName: item.competitionTitle,
              ProductCategory: item.competitionType || "competition",
              ItemPrice: item.price / 100,
              Quantity: item.quantity,
            })),
            ItemNames: items.map((item) => item.competitionTitle),
            abandonment_time: new Date().toISOString(),
            num_items: items.length,
            currency: "GBP",
          });
        }
      }
    },
    [user?.id, getUserEmail]
  );

  // Track purchase completed - maps to Klaviyo's "Placed Order" event
  const trackPurchase = useCallback(
    (purchaseData: PurchaseData) => {
      analytics.track("Placed Order", {
        userId: user?.id,
        email: getUserEmail(),
        $event_id: purchaseData.orderId,
        $value: purchaseData.revenue / 100,
        OrderId: purchaseData.orderId,
        Items: purchaseData.items.map((item) => ({
          ProductID: item.competitionId,
          SKU: item.competitionId,
          ProductName: item.competitionTitle,
          ProductCategory: item.competitionType || "competition",
          ItemPrice: item.price / 100,
          Quantity: item.quantity,
          ProductURL:
            typeof window !== "undefined"
              ? `${window.location.origin}/competitions/${item.competitionId}`
              : undefined,
        })),
        ItemNames: purchaseData.items.map((item) => item.competitionTitle),
        Categories: purchaseData.items.map(
          (item) => item.competitionType || "competition"
        ),
        BillingAddress: {
          // Add billing address if available
        },
        ShippingAddress: {
          // Add shipping address if available
        },
        currency: purchaseData.currency || "GBP",
        payment_method: purchaseData.paymentMethod,
        wallet_amount: purchaseData.walletAmount
          ? purchaseData.walletAmount / 100
          : 0,
        card_amount: purchaseData.cardAmount
          ? purchaseData.cardAmount / 100
          : 0,
        num_items: purchaseData.items.length,
        total_tickets: purchaseData.items.reduce(
          (sum, item) => sum + item.quantity,
          0
        ),
      });

      // Track in Meta Pixel
      metaPixel.trackPurchase({
        content_ids: purchaseData.items.map((item) => item.competitionId),
        value: purchaseData.revenue / 100,
        currency: purchaseData.currency || "GBP",
        num_items: purchaseData.items.length,
      });
    },
    [user?.id, getUserEmail, metaPixel]
  );

  // Track competition viewed - maps to Klaviyo's "Viewed Product" event
  const trackCompetitionViewed = useCallback(
    (
      competitionId: string,
      competitionTitle: string,
      competitionType?: string
    ) => {
      analytics.track("Viewed Product", {
        userId: user?.id,
        email: getUserEmail(),
        $event_id: `product_view_${competitionId}_${Date.now()}`,
        ProductID: competitionId,
        ProductName: competitionTitle,
        ProductCategory: competitionType || "competition",
        ProductURL:
          typeof window !== "undefined"
            ? `${window.location.origin}/competitions/${competitionId}`
            : undefined,
        Categories: [competitionType || "competition"],
      });

      // Track in Meta Pixel
      metaPixel.trackViewContent({
        content_ids: [competitionId],
        content_name: competitionTitle,
        content_type: "product",
      });
    },
    [user?.id, getUserEmail, metaPixel]
  );

  // Track search - maps to Klaviyo's "Searched Site" event
  const trackSearch = useCallback(
    (query: string, results?: number) => {
      analytics.track("Searched Site", {
        userId: user?.id,
        email: getUserEmail(),
        $event_id: `search_${Date.now()}`,
        SearchTerm: query,
        results_count: results,
      });

      // Track in Meta Pixel
      metaPixel.trackSearch({
        search_string: query,
      });
    },
    [user?.id, getUserEmail, metaPixel]
  );

  // Track last active (called periodically)
  const trackLastActive = useCallback(() => {
    if (isSignedIn && user) {
      analytics.track("User Active", {
        userId: user.id,
        email: getUserEmail(),
        last_active: new Date().toISOString(),
        page:
          typeof window !== "undefined" ? window.location.pathname : undefined,
      });
    }
  }, [isSignedIn, user, getUserEmail]);

  // Track custom events
  const trackEvent = useCallback(
    (eventName: string, properties?: Record<string, any>) => {
      analytics.track(eventName, {
        userId: user?.id,
        email: getUserEmail(),
        ...properties,
      });
    },
    [user?.id, getUserEmail]
  );

  // Set up periodic activity tracking
  useEffect(() => {
    if (isSignedIn && typeof window !== "undefined") {
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
    trackSignIn,
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
