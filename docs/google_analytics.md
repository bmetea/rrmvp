# Google Analytics Integration Documentation

## Overview

Google Analytics (GA4) provides comprehensive web analytics and reporting for Radiance Rewards. It tracks user behavior, traffic sources, and conversion goals to help understand website performance and user engagement patterns.

**Tracking ID:** `G-TCT192NP1Q` (default)

---

## What is Google Analytics?

Google Analytics is a web analytics service that:
- **Tracks website traffic** and user behavior patterns
- **Measures conversion goals** and e-commerce performance
- **Analyzes traffic sources** (organic, paid, social, direct)
- **Provides demographic insights** about your audience
- **Offers real-time reporting** and historical trend analysis

---

## Implementation Architecture

### Integration Strategy
Google Analytics is integrated as part of a **unified analytics system** alongside Segment Analytics and Meta Pixel, ensuring consistent event tracking across all platforms.

```
User Action → useAnalytics Hook → Multiple Destinations
                                 ├── Segment Analytics
                                 ├── Meta Pixel (Facebook)
                                 └── Google Analytics (GA4)
```

### Core Components

#### 1. Google Analytics Initialization (`GoogleAnalytics.tsx`)
- Loads the gtag.js library asynchronously
- Initializes with your Tracking ID
- Configured for enhanced e-commerce tracking
- Respects analytics enablement settings

#### 2. Page View Tracking (`PageViewTracker.tsx`)
- Automatically tracks page views on route changes
- Integrates with Next.js App Router navigation
- Sends custom page view events to GA4

#### 3. Event Tracking Hook (`useGoogleAnalytics.ts`)
- Provides programmatic access to GA4 events
- Type-safe interface for e-commerce and custom events
- Handles analytics enablement checks

---

## Configuration

### Environment Variables

Add these to your `.env.local` file:

```bash
# Required for all analytics
NEXT_PUBLIC_ENABLE_ANALYTICS=true

# Google Analytics specific
NEXT_PUBLIC_GA_TRACKING_ID=G-TCT192NP1Q
```

### Fallback Configuration
If `NEXT_PUBLIC_GA_TRACKING_ID` is not set, the system defaults to the hardcoded Tracking ID (`G-TCT192NP1Q`).

---

## Events Tracked

### Automatic Events (No Code Required)

Google Analytics automatically tracks enhanced e-commerce events through the `useAnalytics` hook:

#### 1. Page Views
- **When:** Every page navigation
- **Trigger:** Route changes in Next.js App Router
- **GA4 Event:** `page_view`
- **Data:** URL, page title, referrer

#### 2. Add to Cart
- **When:** User adds competition to cart
- **Trigger:** Cart context in `useAnalytics`
- **GA4 Event:** `add_to_cart`
- **Data:**
  ```javascript
  {
    currency: "GBP",
    value: 2.99, // converted from pence
    items: [{
      item_id: "competition_id",
      item_name: "Competition Title",
      item_category: "competition",
      price: 2.99,
      quantity: 1
    }]
  }
  ```

#### 3. Begin Checkout
- **When:** User starts checkout process
- **Trigger:** Checkout page load with items
- **GA4 Event:** `begin_checkout`
- **Data:**
  ```javascript
  {
    currency: "GBP",
    value: 5.99,
    items: [/* cart items */]
  }
  ```

#### 4. Purchase
- **When:** Purchase completed successfully
- **Trigger:** Checkout summary page
- **GA4 Event:** `purchase`
- **Data:**
  ```javascript
  {
    transaction_id: "order_123",
    value: 2.99,
    currency: "GBP",
    items: [/* purchased items */]
  }
  ```

#### 5. View Item
- **When:** User views competition details
- **Trigger:** Competition page visits
- **GA4 Event:** `view_item`
- **Data:**
  ```javascript
  {
    currency: "GBP",
    value: 2.99,
    items: [{
      item_id: "competition_id",
      item_name: "Competition Title",
      item_category: "competition"
    }]
  }
  ```

#### 6. Search
- **When:** User searches competitions
- **Trigger:** Search functionality
- **GA4 Event:** `search`
- **Data:**
  ```javascript
  {
    search_term: "search query"
  }
  ```

### Manual Event Tracking

Use the `useGoogleAnalytics` hook for custom events:

```typescript
import { useGoogleAnalytics } from "@/shared/hooks/use-google-analytics";

function MyComponent() {
  const { trackEvent, trackPurchase } = useGoogleAnalytics();

  const handleCustomAction = () => {
    // Custom event
    trackEvent("newsletter_signup", "engagement", "footer", 1);

    // E-commerce event
    trackPurchase("order_123", 29.99, "GBP", [
      {
        item_id: "comp_123",
        item_name: "iPhone Competition",
        price: 29.99,
        quantity: 1
      }
    ]);
  };
}
```

---

## Standard GA4 Events Available

### E-commerce Events
- `add_to_cart` - Product added to cart
- `remove_from_cart` - Product removed from cart
- `view_cart` - Cart viewed
- `begin_checkout` - Checkout process started
- `purchase` - Transaction completed
- `view_item` - Product page viewed
- `view_item_list` - Product list viewed

### Engagement Events
- `search` - Search performed
- `sign_up` - Account creation
- `login` - User sign in
- `share` - Content shared
- `video_play` - Video started
- `video_complete` - Video finished

### Custom Events
Use `trackEvent()` for business-specific events:

```typescript
trackEvent("action", "category", "label", value);
```

---

## Data Format & Enhanced E-commerce

### Currency Handling
- **Internal Format:** All prices stored in pence (e.g., £2.99 = 299 pence)
- **GA4 Format:** Automatically converted to pounds (e.g., 299 pence → 2.99)
- **Currency Code:** Always `"GBP"`

### Item Data Structure
```javascript
{
  item_id: "competition_123",        // Required: unique identifier
  item_name: "iPhone 15 Pro",       // Required: product name
  item_category: "competition",      // Optional: product category
  item_category2: "electronics",     // Optional: subcategory
  item_brand: "Apple",              // Optional: brand name
  price: 2.99,                      // Required: price in pounds
  quantity: 1                       // Required: quantity
}
```

---

## Testing & Verification

### 1. Real-time Reports
1. Go to [Google Analytics](https://analytics.google.com/)
2. Select your property
3. Navigate to "Reports" → "Real-time"
4. Perform actions on your website
5. Verify events appear within seconds

### 2. DebugView
1. In GA4, go to "Configure" → "DebugView"
2. Enable debug mode in your browser:
   ```javascript
   // In browser console
   gtag('config', 'GA_TRACKING_ID', {
     debug_mode: true
   });
   ```
3. See detailed event data in real-time

### 3. Google Analytics Debugger (Browser Extension)
- Install the [Google Analytics Debugger](https://chrome.google.com/webstore/detail/google-analytics-debugger/jnkmfdileelhofjcijamephohjechhna) Chrome extension
- Enable the extension
- Open browser DevTools console
- See detailed GA4 event logging

### 4. GA4 Events in DevTools
- Open browser DevTools (F12)
- Look for network requests to `google-analytics.com/g/collect`
- Inspect request parameters to verify event data

---

## Integration with Existing Analytics

### Unified Event Tracking
When you call any tracking method in `useAnalytics`, events are automatically sent to:

1. **Segment Analytics** (primary data warehouse)
2. **Meta Pixel** (advertising optimization)
3. **Google Analytics** (web analytics and reporting)

### Example Flow
```typescript
// This single call triggers all three platforms
const { trackAddToCart } = useAnalytics();

trackAddToCart({
  competitionId: "comp_123",
  competitionTitle: "iPhone 15 Pro",
  price: 299, // pence
  quantity: 1
});

// Results in:
// ✅ Segment: "Product Added" event
// ✅ Meta Pixel: AddToCart event
// ✅ Google Analytics: add_to_cart event
```

---

## File Structure

```
src/
├── shared/
│   ├── components/
│   │   └── analytics/
│   │       ├── GoogleAnalytics.tsx           # GA4 initialization
│   │       └── PageViewTracker.tsx           # Page view tracking
│   └── hooks/
│       ├── use-google-analytics.ts           # GA4 hook
│       └── use-analytics.ts                  # Unified analytics
├── app/
│   └── layout.tsx                            # Component integration
└── docs/
    └── google_analytics.md                   # This document
```

---

## Reporting & Analysis

### Key Metrics Available

#### E-commerce Reports
- **Revenue:** Total purchase value
- **Transactions:** Number of completed orders
- **Average Order Value:** Revenue ÷ transactions
- **Conversion Rate:** Transactions ÷ sessions
- **Cart Abandonment:** Checkout starts vs completions

#### Audience Reports
- **Demographics:** Age, gender, interests
- **Geography:** Country, city, language
- **Technology:** Device, browser, OS
- **Behavior:** New vs returning users

#### Acquisition Reports
- **Traffic Sources:** Organic, direct, social, referral
- **Campaigns:** UTM parameter tracking
- **Search Terms:** Organic search queries
- **Social Networks:** Traffic from social platforms

#### Engagement Reports
- **Page Views:** Most visited pages
- **Session Duration:** Time spent on site
- **Bounce Rate:** Single-page sessions
- **Events:** Custom event tracking

---

## Troubleshooting

### Common Issues

#### 1. Events Not Appearing
**Symptoms:** No events in GA4 reports
**Solutions:**
- Check `NEXT_PUBLIC_ENABLE_ANALYTICS=true` in environment
- Verify `NEXT_PUBLIC_GA_TRACKING_ID` is correct
- Ensure gtag.js is loading (check Network tab)
- Wait up to 24 hours for non-real-time reports

#### 2. Real-time vs Standard Reports
**Symptoms:** Events show in real-time but not standard reports
**Solutions:**
- Standard reports have 24-48 hour delay
- Use real-time reports for immediate verification
- Check data retention settings

#### 3. Enhanced E-commerce Not Working
**Symptoms:** Purchase events missing transaction data
**Solutions:**
- Verify enhanced e-commerce is enabled in GA4
- Check item data structure matches requirements
- Ensure transaction_id is unique

#### 4. Development vs Production Data
**Symptoms:** Development events mixing with production
**Solutions:**
- Use different GA4 properties for dev/prod
- Implement environment-based tracking ID selection
- Use debug mode for development testing

### Debug Mode

Enable debug mode for development:

```typescript
// Add to GoogleAnalytics.tsx for debugging
gtag('config', '${GA_TRACKING_ID}', {
  debug_mode: process.env.NODE_ENV === 'development',
  send_page_view: true
});
```

### Data Sampling

GA4 may sample data in high-traffic situations:
- Free GA4: 10 million events per month before sampling
- GA4 360: Higher limits with less sampling
- Use Google Analytics Intelligence API for unsampled reports

---

## Privacy & Compliance

### GDPR Compliance
- GA4 respects the global `NEXT_PUBLIC_ENABLE_ANALYTICS` setting
- Consider implementing cookie consent before tracking
- Use IP anonymization (enabled by default in GA4)
- Configure data retention settings appropriately

### Data Collection
- GA4 automatically anonymizes IP addresses
- No personally identifiable information (PII) should be sent
- Respect user privacy preferences
- Implement opt-out mechanisms if required

### Recommended Implementation
```typescript
// Conditional tracking based on consent
if (userConsent && ENABLE_ANALYTICS) {
  gtag('config', 'GA_TRACKING_ID', {
    anonymize_ip: true,
    allow_google_signals: userConsent
  });
}
```

---

## Performance Considerations

### Loading Strategy
- Script loads with `strategy="afterInteractive"` (non-blocking)
- Minimal impact on Core Web Vitals
- Asynchronous event tracking
- No render-blocking resources

### Bundle Size
- gtag.js loaded externally (~50KB compressed)
- Custom hooks add minimal overhead (<5KB)
- No additional dependencies required

### Optimization Tips
- Use `send_page_view: false` for custom page tracking
- Batch events when possible
- Avoid tracking every user interaction
- Use sampling for high-frequency events

---

## Advanced Configuration

### Custom Dimensions & Metrics
```typescript
// Set custom dimensions
gtag('config', 'GA_TRACKING_ID', {
  custom_map: {
    'custom_parameter_1': 'user_type',
    'custom_parameter_2': 'subscription_status'
  }
});

// Send custom dimension data
trackEvent('login', 'engagement', 'header', 1, {
  user_type: 'premium',
  subscription_status: 'active'
});
```

### Enhanced Measurement
GA4 automatically tracks:
- Scroll events (90% page scroll)
- Outbound link clicks
- Site search (if configured)
- Video engagement (YouTube embedded)
- File downloads

### Cross-Domain Tracking
```typescript
gtag('config', 'GA_TRACKING_ID', {
  linker: {
    domains: ['example.com', 'checkout.example.com']
  }
});
```

---

## Support & Resources

### Documentation
- [GA4 Developer Documentation](https://developers.google.com/analytics/ga4)
- [GA4 Help Center](https://support.google.com/analytics)
- [gtag.js Reference](https://developers.google.com/gtagjs/reference/api)

### Tools
- [Google Analytics Debugger](https://chrome.google.com/webstore/detail/google-analytics-debugger/jnkmfdileelhofjcijamephohjechhna)
- [GA4 Event Builder](https://ga-dev-tools.web.app/ga4/event-builder/)
- [Google Tag Assistant](https://tagassistant.google.com/)

### Communities
- [Google Analytics Community](https://www.en.advertisercommunity.com/t5/Google-Analytics/ct-p/Google_Analytics)
- [r/GoogleAnalytics](https://www.reddit.com/r/GoogleAnalytics/)
- [GA4 on Stack Overflow](https://stackoverflow.com/questions/tagged/google-analytics-4)

---

**Last Updated:** January 2025  
**Tracking ID:** G-TCT192NP1Q  
**Status:** ✅ Active and Tracking 