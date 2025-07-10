****# Segment Analytics Events Documentation

This document outlines all the events tracked via Segment Analytics in the Radiance Rewards application.

## Configuration

**Environment Variables Required:**
- `NEXT_PUBLIC_ENABLE_ANALYTICS=true`
- `NEXT_PUBLIC_SEGMENT_WRITE_KEY=your_segment_write_key`

**Implementation:** Uses `@segment/analytics-next` with custom `useSegmentAnalytics` hook.

---

## Automatically Tracked Events

These events are tracked automatically without additional code requirements:

### 1. User Identification & Authentication

#### `identify` Call
- **When:** User signs in or user data becomes available
- **Trigger:** `useSegmentAnalytics` hook on sign-in
- **Data:**
  ```javascript
  {
    userId: "clerk_user_id",
    email: "user@example.com",
    firstName: "John",
    lastName: "Doe", 
    createdAt: "2025-01-10T23:17:58.896Z",
    lastActive: "2025-01-10T23:17:58.896Z"
  }
  ```

#### `User Signed Up`
- **When:** New user registers via Clerk
- **Trigger:** Clerk webhook (`src/app/api/webhooks/route.ts`)
- **Data:**
  ```javascript
  {
    userId: "clerk_user_id",
    email: "user@example.com",
    firstName: "John",
    lastName: "Doe",
    username: "johndoe",
    signupDate: "2025-01-10T23:17:58.896Z",
    signupMethod: "clerk",
    hasWallet: true
  }
  ```

#### `Profile Updated`
- **When:** User updates profile information
- **Trigger:** Clerk webhook on user.updated
- **Data:**
  ```javascript
  {
    userId: "clerk_user_id",
    email: "updated@example.com",
    updatedAt: "2025-01-10T23:17:58.896Z"
  }
  ```

### 2. Page Tracking

#### `page` Call
- **When:** User navigates to any page
- **Trigger:** `SegmentProvider` component
- **Data:**
  ```javascript
  {
    path: "/competitions/123",
    search: "?filter=active",
    referrer: "https://google.com",
    title: "Competition Details - Radiance Rewards",
    url: "https://radiancerewards.co.uk/competitions/123",
    timestamp: "2025-01-10T23:17:58.896Z"
  }
  ```

### 3. E-commerce Funnel

#### `Product Added`
- **When:** User adds competition to cart
- **Trigger:** Cart context (`src/shared/lib/context/cart-context.tsx`)
- **Data:**
  ```javascript
  {
    product_id: "competition_id",
    name: "iPhone 15 Pro Giveaway",
    category: "competition",
    price: 299, // in pence
    quantity: 1,
    ticket_price: 299,
    currency: "GBP",
    value: 299
  }
  ```

#### `Product Removed`
- **When:** User removes competition from cart
- **Trigger:** Cart context on item removal
- **Data:**
  ```javascript
  {
    product_id: "competition_id",
    name: "iPhone 15 Pro Giveaway",
    category: "competition", 
    price: 299,
    quantity: 1,
    currency: "GBP",
    value: 299
  }
  ```

#### `Cart Viewed`
- **When:** User opens cart modal/dialog
- **Trigger:** Cart context when `isCartOpen` becomes true
- **Data:**
  ```javascript
  {
    cart_id: "cart_1736551078896",
    products: [
      {
        product_id: "competition_id",
        name: "iPhone 15 Pro Giveaway",
        category: "competition",
        price: 299,
        quantity: 1
      }
    ],
    value: 299,
    currency: "GBP",
    num_items: 1
  }
  ```

#### `Checkout Started`
- **When:** User visits checkout page with items in cart
- **Trigger:** Checkout page component (`src/app/(pages)/checkout/page.tsx`)
- **Data:**
  ```javascript
  {
    order_id: "checkout_1736551078896",
    products: [
      {
        product_id: "competition_id",
        name: "iPhone 15 Pro Giveaway",
        category: "competition",
        price: 299,
        quantity: 1
      }
    ],
    value: 299,
    currency: "GBP",
    num_items: 1,
    checkout_step: 1
  }
  ```

#### `Checkout Abandoned`
- **When:** 15 minutes after checkout started without completion
- **Trigger:** Timeout in `useSegmentAnalytics` hook
- **Conditions:** Only fires if user still on checkout pages (not summary)
- **Data:**
  ```javascript
  {
    order_id: "abandoned_1736551078896",
    products: [...],
    value: 299,
    currency: "GBP", 
    num_items: 1,
    abandonment_time: "2025-01-10T23:32:58.896Z"
  }
  ```

#### `Order Completed`
- **When:** Purchase successfully processed
- **Trigger:** Checkout summary page (`src/app/(pages)/checkout/summary/page.tsx`)
- **Data:**
  ```javascript
  {
    order_id: "order_1736551078896",
    products: [
      {
        product_id: "competition_id",
        sku: "competition_id",
        name: "iPhone 15 Pro Giveaway",
        category: "competition",
        price: 299,
        quantity: 1
      }
    ],
    revenue: 299,
    value: 299,
    currency: "GBP",
    payment_method: "hybrid", // "wallet" | "card" | "hybrid"
    wallet_amount: 100,
    card_amount: 199,
    num_items: 1,
    total_tickets: 1
  }
  ```

#### `Revenue`
- **When:** Purchase completed (secondary event)
- **Trigger:** Automatically after Order Completed
- **Data:**
  ```javascript
  {
    revenue: 299,
    currency: "GBP",
    order_id: "order_1736551078896"
  }
  ```

### 4. User Activity

#### `User Active`
- **When:** Every 30 seconds while user is active + page visibility changes
- **Trigger:** `useSegmentAnalytics` hook with intervals
- **Data:**
  ```javascript
  {
    last_active: "2025-01-10T23:17:58.896Z",
    page: "/competitions"
  }
  ```

---

## Manual Tracking Methods

These events can be triggered manually using the `useSegmentAnalytics` hook:

### Product Interactions

#### `trackCompetitionViewed(id, title, type?)`
```javascript
trackCompetitionViewed('comp_123', 'iPhone 15 Pro Giveaway', 'raffle');

// Event: "Product Viewed"
{
  product_id: "comp_123",
  name: "iPhone 15 Pro Giveaway", 
  category: "raffle"
}
```

#### `trackSearch(query, results?)`
```javascript
trackSearch('iPhone', 5);

// Event: "Products Searched"
{
  query: "iPhone",
  results_count: 5
}
```

### Custom Events

#### `trackEvent(eventName, properties?)`
```javascript
trackEvent('Newsletter Signup', {
  source: 'homepage_footer',
  email: 'user@example.com'
});

// Event: "Newsletter Signup"
{
  source: 'homepage_footer',
  email: 'user@example.com',
  timestamp: "2025-01-10T23:17:58.896Z"
}
```

### Advanced Cart Methods

#### `trackCartViewed(items, totalValue)`
Manual cart view tracking (usually automatic)

#### `trackCheckoutStarted(items, totalValue, checkoutId?)`
Manual checkout start tracking (usually automatic)

#### `trackPurchase(purchaseData)`
Manual purchase tracking (usually automatic)

---

## Event Properties Reference

### Common Properties
All events automatically include:
- `timestamp`: ISO 8601 timestamp
- User context (if signed in)

### User Properties
- `userId`: Clerk user ID
- `email`: User email
- `firstName`: User first name
- `lastName`: User last name
- `createdAt`: Account creation date
- `lastActive`: Last activity timestamp

### Product Properties
- `product_id`: Competition ID
- `name`: Competition title
- `category`: Competition type ("competition", "raffle", etc.)
- `price`: Price in pence
- `quantity`: Number of tickets
- `currency`: Always "GBP"

### Order Properties
- `order_id`: Unique order identifier
- `revenue`/`value`: Order total in pence
- `payment_method`: "wallet", "card", or "hybrid"
- `wallet_amount`: Amount paid with wallet credit
- `card_amount`: Amount paid with card
- `num_items`: Number of different competitions
- `total_tickets`: Total number of tickets purchased

---

## Implementation Files

### Core Implementation
- `src/shared/hooks/use-segment-analytics.ts` - Main analytics hook
- `src/shared/lib/segment.ts` - Segment initialization
- `src/shared/components/analytics/SegmentProvider.tsx` - Page tracking

### Integration Points
- `src/app/api/webhooks/route.ts` - User signup/update tracking
- `src/shared/lib/context/cart-context.tsx` - Cart event tracking
- `src/app/(pages)/checkout/page.tsx` - Checkout start tracking
- `src/app/(pages)/checkout/summary/page.tsx` - Purchase completion tracking
- `src/app/layout.tsx` - Provider initialization

---

## Data Flow

```
User Action → Component/Hook → useSegmentAnalytics → Segment API → Your Analytics Platform
```

### Example: Add to Cart Flow
1. User clicks "Add to Cart" button
2. `CartProvider` calls `addItem()`
3. Cart context triggers `trackAddToCart()` 
4. `useSegmentAnalytics` formats event data
5. Segment receives "Product Added" event
6. Data flows to connected destinations (e.g., Amplitude, Mixpanel, etc.)

---

## Testing & Verification

### Browser Console
```javascript
// Check if Segment is loaded
window.analytics

// Manually trigger test event
window.analytics?.track('test_event', { test: true })
```

### Segment Debugger
1. Go to Segment dashboard → Sources → Your source → Debugger
2. Perform actions on your site
3. Watch events appear in real-time

### Environment Check
Events only fire when:
- `NEXT_PUBLIC_ENABLE_ANALYTICS=true`
- `NEXT_PUBLIC_SEGMENT_WRITE_KEY` is set and valid
- User consents to tracking (if applicable)

---

## Notes

- All timestamps are in ISO 8601 format (UTC)
- Prices are stored in pence (GBP minor unit)
- Cart abandonment uses intelligent detection (only triggers if still on checkout pages)
- User identification happens automatically on sign-in
- Activity tracking respects page visibility (pauses when tab inactive)
- All events include rich context for better analysis and segmentation 