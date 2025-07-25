# Google Analytics Integration Documentation

## Overview

Google Analytics (GA4) integration for Radiance Rewards is **partially implemented**. Basic page view tracking is working, but e-commerce event tracking integration is incomplete.

**Tracking ID:** `G-TCT192NP1Q` (default)
**Current Status:** 🟡 Partially Implemented - Page Views Only

---

## ✅ Currently Implemented

### 1. Basic Infrastructure
- ✅ **GoogleAnalytics Component** (`GoogleAnalytics.tsx`) - Loads GA4 script
- ✅ **Page View Tracking** (`PageViewTracker.tsx`) - Automatic page view tracking
- ✅ **Environment Configuration** - Analytics enable/disable controls
- ✅ **Isolated Hook** (`useGoogleAnalytics.ts`) - Basic event tracking capabilities

### 2. Working Features

#### Page View Tracking ✅
```typescript
// Automatically tracks all page navigation
// Location: src/shared/components/analytics/PageViewTracker.tsx
// Integrated in: src/app/layout.tsx
```
- **Event:** `page_view`
- **Trigger:** Route changes in Next.js App Router
- **Data:** URL path, search parameters

#### Manual Event Tracking ✅
```typescript
// Available but not integrated with main analytics flow
import { useGoogleAnalytics } from "@/shared/hooks/use-google-analytics";

const { trackEvent, trackPageView, trackPurchase } = useGoogleAnalytics();
```

#### Environment Configuration ✅
```bash
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_GA_TRACKING_ID=G-TCT192NP1Q  # Optional, defaults to G-TCT192NP1Q
```

### 3. Current File Structure ✅
```
src/
├── shared/
│   ├── components/analytics/
│   │   ├── GoogleAnalytics.tsx           ✅ Working
│   │   └── PageViewTracker.tsx           ✅ Working
│   └── hooks/
│       └── use-google-analytics.ts       ✅ Exists but isolated
└── app/layout.tsx                        ✅ Components integrated
```

---

## ❌ Missing Implementation

### 1. Unified Analytics Integration
**Problem:** Google Analytics is NOT integrated with the main `useAnalytics` hook that coordinates Klaviyo and Meta Pixel.

**Current Flow:**
```
User Action → useAnalytics Hook → Multiple Destinations
                                 ├── Klaviyo Analytics ✅
                                 ├── Meta Pixel ✅
                                 └── Google Analytics ❌ MISSING
```

### 2. Missing E-commerce Events
The following events are tracked in Klaviyo and Meta Pixel but **NOT** in Google Analytics:

- ❌ `add_to_cart` - Cart additions
- ❌ `remove_from_cart` - Cart removals  
- ❌ `view_cart` - Cart modal viewed
- ❌ `begin_checkout` - Checkout started
- ❌ `purchase` - Orders completed
- ❌ `view_item` - Competition pages viewed
- ❌ `search` - Search queries

### 3. Enhanced E-commerce Data
- ❌ Item-level data (competition details, prices, quantities)
- ❌ Transaction IDs for purchase tracking
- ❌ Revenue attribution and conversion tracking
- ❌ Currency conversion (currently defaults to USD instead of GBP)

---

## 🚀 Next Steps Implementation Plan

### Step 1: Fix Currency Default
**File:** `src/shared/hooks/use-google-analytics.ts`
```typescript
// Change line 42 from:
currency: string = "USD"
// To:
currency: string = "GBP"
```

### Step 2: Add GA4 Events to Unified Analytics Hook
**File:** `src/shared/hooks/use-klaviyo-analytics.ts`

Add Google Analytics import and integration:

```typescript
import { useGoogleAnalytics } from "./use-google-analytics";

export const useKlaviyoAnalytics = () => {
  const googleAnalytics = useGoogleAnalytics();
  // ... existing code ...

  const trackAddToCart = useCallback((item: CartItem) => {
    // ... existing Klaviyo code ...
    
    // Add Google Analytics tracking
    googleAnalytics.trackEvent("add_to_cart", "ecommerce", item.competitionTitle, item.price / 100);
  }, [/* dependencies */]);

  // Repeat for all e-commerce events...
};
```

### Step 3: Implement Enhanced E-commerce Events

#### A. Add to Cart Event
```typescript
// In trackAddToCart method
if (typeof window !== "undefined" && window.gtag) {
  window.gtag("event", "add_to_cart", {
    currency: "GBP",
    value: (item.price * item.quantity) / 100,
    items: [{
      item_id: item.competitionId,
      item_name: item.competitionTitle,
      item_category: "competition",
      price: item.price / 100,
      quantity: item.quantity
    }]
  });
}
```

#### B. Begin Checkout Event
```typescript
// In trackCheckoutStarted method
if (typeof window !== "undefined" && window.gtag) {
  window.gtag("event", "begin_checkout", {
    currency: "GBP",
    value: totalValue / 100,
    items: items.map(item => ({
      item_id: item.competitionId,
      item_name: item.competitionTitle,
      item_category: "competition",
      price: item.price / 100,
      quantity: item.quantity
    }))
  });
}
```

#### C. Purchase Event
```typescript
// In trackPurchase method
if (typeof window !== "undefined" && window.gtag) {
  window.gtag("event", "purchase", {
    transaction_id: purchaseData.orderId,
    value: purchaseData.revenue / 100,
    currency: "GBP",
    items: purchaseData.items.map(item => ({
      item_id: item.competitionId,
      item_name: item.competitionTitle,
      item_category: "competition",
      price: item.price / 100,
      quantity: item.quantity
    }))
  });
}
```

#### D. View Item Event
```typescript
// In trackCompetitionViewed method
if (typeof window !== "undefined" && window.gtag) {
  window.gtag("event", "view_item", {
    currency: "GBP",
    items: [{
      item_id: competitionId,
      item_name: competitionTitle,
      item_category: "competition"
    }]
  });
}
```

### Step 4: Update Enhanced E-commerce Configuration

**File:** `src/shared/components/analytics/GoogleAnalytics.tsx`

Add enhanced e-commerce configuration:
```typescript
gtag('config', '${GA_TRACKING_ID}', {
  send_page_view: false, // Handled by PageViewTracker
  allow_enhanced_conversions: true,
  enhanced_conversions: true
});
```

### Step 5: Testing & Verification

#### Development Testing
1. Enable debug mode in `GoogleAnalytics.tsx`:
```typescript
gtag('config', '${GA_TRACKING_ID}', {
  debug_mode: process.env.NODE_ENV === 'development'
});
```

2. Use browser console to verify events:
```javascript
// Check for gtag calls in Network tab
// Filter by: google-analytics.com/g/collect
```

#### Production Verification
1. **Real-time Reports:** Check GA4 real-time events
2. **DebugView:** Enable in GA4 interface
3. **Event Parameters:** Verify item data and revenue

---

## Implementation Priority

### High Priority (Complete Core E-commerce Tracking)
1. ✅ **Step 1:** Fix currency default (5 minutes)
2. ✅ **Step 2:** Add GA4 to unified analytics hook (30 minutes)
3. ✅ **Step 3A-C:** Implement add_to_cart, begin_checkout, purchase events (45 minutes)

### Medium Priority (Enhanced Tracking)
4. ✅ **Step 3D:** View item tracking (15 minutes)
5. ✅ **Step 4:** Enhanced e-commerce configuration (15 minutes)

### Low Priority (Optimization)
6. ✅ **Step 5:** Testing and debug setup (30 minutes)
7. Custom dimensions and metrics
8. Conversion goals configuration

---

## File Changes Required

### 1. `src/shared/hooks/use-klaviyo-analytics.ts`
- Add `useGoogleAnalytics` import
- Add GA4 event calls to each tracking method
- Ensure currency is consistently "GBP"

### 2. `src/shared/hooks/use-google-analytics.ts`
- Change default currency from "USD" to "GBP"
- Add enhanced e-commerce event methods if needed

### 3. `src/shared/components/analytics/GoogleAnalytics.tsx`
- Add enhanced e-commerce configuration
- Add debug mode for development

---

## Expected Results After Implementation

### Unified Event Flow ✅
```
User Action → useAnalytics Hook → Multiple Destinations
                                 ├── Klaviyo Analytics ✅
                                 ├── Meta Pixel ✅
                                 └── Google Analytics ✅ COMPLETE
```

### GA4 Reports Available ✅
- **E-commerce Overview:** Revenue, transactions, conversion rate
- **Product Performance:** Competition views, cart additions, purchases
- **Sales Performance:** Revenue by payment method, cart abandonment
- **User Journey:** Full funnel from view to purchase

### Enhanced Attribution ✅
- Cross-platform conversion tracking
- Revenue attribution across channels
- Customer lifetime value analysis
- Detailed e-commerce insights

---

**Estimated Implementation Time:** 2-3 hours
**Current Status:** 🟡 Page Views Only → 🟢 Full E-commerce Tracking
**Last Updated:** January 2025 