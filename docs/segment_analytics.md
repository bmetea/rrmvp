# Segment Analytics Integration Documentation

## Overview

Segment is a customer data platform (CDP) that acts as the central hub for all analytics data in Radiance Rewards. It collects, cleans, and routes event data to downstream destinations like data warehouses, marketing tools, and analytics platforms.

**Write Key:** Configured via `NEXT_PUBLIC_SEGMENT_WRITE_KEY`

---

## What is Segment Analytics?

Segment is a customer data infrastructure platform that:
- **Centralizes data collection** from multiple sources (web, mobile, server)
- **Standardizes event schemas** across different tools and platforms
- **Routes data** to 300+ downstream destinations (warehouses, marketing tools)
- **Provides data governance** and privacy controls
- **Enables real-time and batch data processing**

---

## Implementation Architecture

### Integration Strategy
Segment serves as the **primary analytics platform** in our unified system, with Meta Pixel and Google Analytics receiving parallel events for platform-specific optimization.

```
User Action → useAnalytics Hook → Multiple Destinations
                                 ├── Segment Analytics (Primary)
                                 ├── Meta Pixel (Facebook)
                                 └── Google Analytics (GA4)
```

### Core Components

#### 1. Segment Initialization (`segment.ts`)
- Loads the `@segment/analytics-next` library
- Initializes with your Write Key
- Configures client-side tracking
- Handles analytics consent and privacy

#### 2. Page View Tracking (`SegmentProvider.tsx`)
- Automatically tracks page views on route changes
- Integrates with Next.js App Router navigation
- Sends detailed page context to Segment

#### 3. Unified Analytics Hook (`useAnalytics.ts`)
- Primary interface for all analytics tracking
- Automatically sends events to Segment + other platforms
- Type-safe event interfaces
- Handles user identification and session management

---

## Configuration

### Environment Variables

Add these to your `.env.local` file:

```bash
# Required for all analytics
NEXT_PUBLIC_ENABLE_ANALYTICS=true

# Segment specific (primary)
NEXT_PUBLIC_SEGMENT_WRITE_KEY=your_segment_write_key
```

### Initialization
```typescript
// src/shared/lib/segment.ts
import { AnalyticsBrowser } from '@segment/analytics-next';

export const analytics = AnalyticsBrowser.load({
  writeKey: process.env.NEXT_PUBLIC_SEGMENT_WRITE_KEY!,
  cdnSettings: {
    // Configure Segment settings
  }
});
```

---

## Events Tracked

### Automatic Events (No Code Required)

All events are tracked through the `useAnalytics` hook and automatically sent to Segment with rich context:

#### 1. User Identification
- **When:** User signs in or user data becomes available
- **Trigger:** `useAnalytics` hook on authentication
- **Segment Call:** `identify()`
- **Data:**
  ```javascript
  analytics.identify("clerk_user_id", {
    email: "user@example.com",
    firstName: "John",
    lastName: "Doe",
    createdAt: "2025-01-10T23:17:58.896Z",
    lastActive: "2025-01-10T23:17:58.896Z"
  });
  ```

#### 2. Page Tracking
- **When:** User navigates to any page
- **Trigger:** `SegmentProvider` component
- **Segment Call:** `page()`
- **Data:**
  ```javascript
  analytics.page("/competitions/123", {
    path: "/competitions/123",
    search: "?filter=active",
    referrer: "https://google.com",
    title: "Competition Details - Radiance Rewards",
    url: "https://radiancerewards.co.uk/competitions/123",
    timestamp: "2025-01-10T23:17:58.896Z"
  });
  ```

#### 3. E-commerce Events

##### Product Added (Add to Cart)
- **When:** User adds competition to cart
- **Trigger:** Cart context
- **Segment Event:** `"Product Added"`
- **Data:**
  ```javascript
  analytics.track("Product Added", {
    product_id: "competition_id",
    name: "iPhone 15 Pro Giveaway",
    category: "competition",
    price: 299, // in pence
    quantity: 1,
    ticket_price: 299,
    currency: "GBP",
    value: 299
  });
  ```

##### Checkout Started
- **When:** User visits checkout page with items
- **Trigger:** Checkout page component
- **Segment Event:** `"Checkout Started"`
- **Data:**
  ```javascript
  analytics.track("Checkout Started", {
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
  });
  ```

##### Order Completed (Purchase)
- **When:** Purchase successfully processed
- **Trigger:** Checkout summary page
- **Segment Event:** `"Order Completed"`
- **Data:**
  ```javascript
  analytics.track("Order Completed", {
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
  });
  ```

#### 4. User Engagement Events

##### Product Viewed
- **When:** User views competition details
- **Trigger:** Competition page visits
- **Segment Event:** `"Product Viewed"`
- **Data:**
  ```javascript
  analytics.track("Product Viewed", {
    product_id: "comp_123",
    name: "iPhone 15 Pro Giveaway",
    category: "competition"
  });
  ```

##### Products Searched
- **When:** User searches competitions
- **Trigger:** Search functionality
- **Segment Event:** `"Products Searched"`
- **Data:**
  ```javascript
  analytics.track("Products Searched", {
    query: "iPhone",
    results_count: 5
  });
  ```

##### User Active
- **When:** Every 30 seconds while user is active + page visibility changes
- **Trigger:** Periodic tracking in `useAnalytics`
- **Segment Event:** `"User Active"`
- **Data:**
  ```javascript
  analytics.track("User Active", {
    last_active: "2025-01-10T23:17:58.896Z",
    page: "/competitions"
  });
  ```

### Manual Event Tracking

Use the `useAnalytics` hook for custom events:

```typescript
import { useAnalytics } from "@/shared/hooks/use-analytics";

function MyComponent() {
  const { trackEvent, trackCompetitionViewed } = useAnalytics();

  const handleCustomAction = () => {
    // Custom event
    trackEvent('Newsletter Signup', {
      source: 'homepage_footer',
      email: 'user@example.com'
    });

    // Predefined event
    trackCompetitionViewed('comp_123', 'iPhone 15 Pro Giveaway', 'raffle');
  };
}
```

---

## Segment Event Schema

### Standard E-commerce Events
Following Segment's E-commerce Spec v2:

- `Product Added` - Item added to cart
- `Product Removed` - Item removed from cart  
- `Cart Viewed` - Cart page/modal opened
- `Checkout Started` - Checkout process initiated
- `Checkout Abandoned` - Checkout left incomplete (15min timeout)
- `Order Completed` - Purchase finalized
- `Product Viewed` - Product detail page viewed
- `Product List Viewed` - Category/search results viewed

### Custom Business Events
- `User Active` - Periodic activity tracking
- `Products Searched` - Search queries
- `Competition Entered` - Free entry submissions

### Event Properties
All events automatically include:
- `timestamp` - ISO 8601 timestamp
- User context (if authenticated)
- Session information
- Page context

---

## Data Format & Standards

### Currency Handling
- **Internal Storage:** All prices in pence (e.g., £2.99 = 299 pence)
- **Segment Format:** Maintain pence for precision in data warehouse
- **Currency Code:** Always `"GBP"`

### Product Properties
```javascript
{
  product_id: "competition_id",     // Required: unique identifier
  name: "Competition Title",        // Required: human-readable name
  category: "competition",          // Required: product category
  price: 299,                      // Required: price in pence
  quantity: 1,                     // Required: quantity
  sku: "competition_id",           // Optional: SKU (same as product_id)
  currency: "GBP"                  // Required: currency code
}
```

### User Properties
```javascript
{
  userId: "clerk_user_id",         // Required: unique user ID
  email: "user@example.com",       // Optional: email address
  firstName: "John",               // Optional: first name
  lastName: "Doe",                 // Optional: last name
  createdAt: "2025-01-10T...",     // Optional: account creation
  lastActive: "2025-01-10T..."     // Optional: last activity
}
```

---

## Testing & Verification

### 1. Segment Debugger
1. Go to [Segment Dashboard](https://app.segment.com/)
2. Select your source
3. Navigate to "Debugger" tab
4. Perform actions on your website
5. Verify events appear in real-time with correct data

### 2. Browser Console Testing
```javascript
// Check if Segment is loaded
window.analytics

// View Segment analytics object
console.log(window.analytics);

// Manually trigger test event
analytics.then(([analytics]) => {
  analytics.track('Test Event', { test: true });
});
```

### 3. Event Validation
Segment provides automatic validation for:
- Required properties missing
- Incorrect data types
- Schema violations
- Destination compatibility issues

### 4. Real-time vs Batch Processing
- **Real-time:** Events appear in debugger immediately
- **Batch:** Data warehouse destinations process hourly/daily
- **Streaming:** Real-time destinations (webhooks) process within seconds

---

## Integration with Existing Analytics

### Unified Event Flow
```typescript
// Single call triggers all platforms
const { trackAddToCart } = useAnalytics();

trackAddToCart({
  competitionId: "comp_123",
  competitionTitle: "iPhone 15 Pro",
  price: 299, // pence
  quantity: 1
});

// Results in:
// ✅ Segment: "Product Added" event (primary)
// ✅ Meta Pixel: AddToCart event
// ✅ Google Analytics: add_to_cart event
```

### Downstream Destinations
Configure in Segment dashboard to send data to:

#### Data Warehouses
- **Snowflake** - Primary data warehouse
- **BigQuery** - Google Cloud data warehouse
- **Redshift** - Amazon data warehouse
- **Postgres** - Direct database integration

#### Analytics Tools
- **Amplitude** - Product analytics
- **Mixpanel** - Event analytics
- **Heap** - Automated event capture
- **Hotjar** - User behavior analytics

#### Marketing Tools
- **Klaviyo** - Email marketing
- **Braze** - Customer engagement
- **Mailchimp** - Email campaigns
- **HubSpot** - CRM integration

---

## File Structure

```
src/
├── shared/
│   ├── lib/
│   │   └── segment.ts                    # Segment initialization
│   ├── components/analytics/
│   │   └── SegmentProvider.tsx           # Page tracking component
│   └── hooks/
│       └── use-analytics.ts              # Main analytics hook
├── app/
│   ├── layout.tsx                        # Provider integration
│   └── api/webhooks/
│       └── route.ts                      # Server-side events
└── docs/
    └── segment_analytics.md              # This document
```

---

## Server-Side Events

### Webhook Integration
Server-side events sent from webhook handlers:

```typescript
// src/app/api/webhooks/route.ts
import { analytics } from "@/shared/lib/segment";

// User signup via Clerk webhook
analytics.then(([analytics]) => {
  analytics.track("User Signed Up", {
    userId: "clerk_user_id",
    email: "user@example.com",
    firstName: "John",
    lastName: "Doe",
    signupDate: "2025-01-10T23:17:58.896Z",
    signupMethod: "clerk",
    hasWallet: true
  });
});
```

### Benefits of Server-Side Tracking
- **Reliability** - Not affected by ad blockers or client-side issues
- **Security** - Sensitive data doesn't pass through browser
- **Completeness** - Captures events even if client-side fails
- **Accuracy** - Timestamps from server perspective

---

## Advanced Features

### User Sessions
Segment automatically tracks:
- Session start/end
- Session duration
- Pages per session
- Traffic source attribution

### Cross-Device Tracking
- User identification across devices
- Event attribution to same user
- Customer journey mapping
- Lifetime value calculation

### Real-time Personalization
- Segment Personas for audience building
- Real-time user traits and computed traits
- A/B testing integration
- Dynamic content delivery

---

## Troubleshooting

### Common Issues

#### 1. Events Not Appearing in Debugger
**Symptoms:** No events in Segment debugger
**Solutions:**
- Check `NEXT_PUBLIC_ENABLE_ANALYTICS=true`
- Verify `NEXT_PUBLIC_SEGMENT_WRITE_KEY` is correct
- Ensure Segment library loaded (check Network tab)
- Check browser console for JavaScript errors

#### 2. Events Missing Properties
**Symptoms:** Events appear but missing expected data
**Solutions:**
- Verify event schema matches Segment specs
- Check for undefined/null values in properties
- Ensure proper data types (string, number, boolean)
- Validate required vs optional properties

#### 3. Destination Not Receiving Data
**Symptoms:** Events in Segment but not reaching destination
**Solutions:**
- Check destination configuration in Segment dashboard
- Verify destination-specific settings and credentials
- Review destination error logs
- Ensure event schema matches destination requirements

#### 4. Development vs Production Data
**Symptoms:** Development events mixing with production
**Solutions:**
- Use separate Segment sources for dev/staging/prod
- Implement environment-based Write Key selection
- Use Segment's test mode for development

### Debug Mode

Enable debug logging:

```typescript
// Add to segment.ts for debugging
const analytics = AnalyticsBrowser.load({
  writeKey: SEGMENT_WRITE_KEY,
  cdnSettings: {
    debug: process.env.NODE_ENV === 'development'
  }
});
```

### Event Validation Schema

Segment validates events against schema:
```json
{
  "event": "Product Added",
  "properties": {
    "product_id": "string (required)",
    "name": "string (required)", 
    "price": "number (required)",
    "currency": "string (required)",
    "category": "string (optional)"
  }
}
```

---

## Privacy & Compliance

### GDPR Compliance
- Segment respects global `NEXT_PUBLIC_ENABLE_ANALYTICS` setting
- User identification only with consent
- Data retention policies configurable per destination
- Right to deletion supported via Segment Privacy API

### Data Processing
- All PII handled according to Segment's privacy policies
- Data encrypted in transit and at rest
- EU data residency options available
- SOC2 Type II certified infrastructure

### Privacy Controls
```typescript
// Conditional initialization based on consent
if (userConsent && ENABLE_ANALYTICS) {
  analytics.then(([analytics]) => {
    analytics.identify(userId, userTraits);
  });
}

// User opt-out
analytics.then(([analytics]) => {
  analytics.reset(); // Clear user data
});
```

---

## Performance Considerations

### Loading Strategy
- Segment loads asynchronously with `strategy="afterInteractive"`
- Events queued until library loads, then flushed
- Minimal impact on Core Web Vitals
- CDN distribution for fast loading globally

### Bundle Size
- Segment Analytics Next.js: ~45KB compressed
- Lazy loading of destination libraries
- Tree-shaking for unused features
- No additional dependencies required

### Optimization Tips
- Batch events when possible using `analytics.group()`
- Use `analytics.alias()` for user identity resolution
- Implement client-side caching for computed traits
- Debounce high-frequency events (scroll, mouse movement)

---

## Support & Resources

### Documentation
- [Segment Documentation](https://segment.com/docs/)
- [Analytics.js 2.0 Reference](https://segment.com/docs/connections/sources/catalog/libraries/website/javascript/)
- [E-commerce Spec](https://segment.com/docs/connections/spec/ecommerce/v2/)

### Tools
- [Segment Dashboard](https://app.segment.com/)
- [Schema Builder](https://app.segment.com/schemas)
- [Event Tester](https://app.segment.com/debugger)

### Support
- [Segment Community](https://community.segment.com/)
- [Support Portal](https://support.segment.com/)
- [Status Page](https://status.segment.com/)

---

**Last Updated:** January 2025  
**Primary Platform:** ✅ Yes (Data Warehouse)  
**Status:** ✅ Active and Tracking 