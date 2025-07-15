# Facebook Meta Pixel Integration Documentation

## Overview

The Facebook Meta Pixel (formerly Facebook Pixel) is a tracking code that allows you to measure the effectiveness of your advertising by understanding the actions people take on your website. This implementation integrates seamlessly with the existing Radiance Rewards analytics infrastructure.

**Pixel ID:** `1422329032149636`

---

## What is Meta Pixel?

Meta Pixel is a piece of JavaScript code that:
- **Tracks conversions** from Facebook and Instagram ads
- **Builds audiences** for future advertising campaigns  
- **Optimizes ad delivery** to people likely to take action
- **Provides insights** into cross-device customer journeys
- **Enables retargeting** of website visitors

---

## Implementation Architecture

### Integration Strategy
The Meta Pixel is integrated as part of a **unified analytics system** alongside Klaviyo and Google Analytics, ensuring consistent event tracking across all platforms without code duplication.

```
User Action → useAnalytics Hook → Multiple Destinations
                                 ├── Klaviyo Analytics
                                 ├── Meta Pixel (Facebook)
                                 └── Google Analytics
```

### Core Components

#### 1. Meta Pixel Initialization (`MetaPixel.tsx`)
- Loads the Facebook Pixel script asynchronously
- Initializes with your Pixel ID
- Includes noscript fallback for users with JavaScript disabled
- Respects analytics enablement settings

#### 2. Page View Tracking (`MetaPixelPageTracker.tsx`)
- Automatically tracks page views on route changes
- Integrates with Next.js App Router navigation
- Triggers alongside other analytics platforms

#### 3. Event Tracking Hook (`useMetaPixel.ts`)
- Provides programmatic access to Meta Pixel events
- Type-safe interface for all standard events
- Handles analytics enablement checks

---

## Configuration

### Environment Variables

Add these to your `.env.local` file:

```bash
# Required for all analytics
NEXT_PUBLIC_ENABLE_ANALYTICS=true

# Meta Pixel specific
NEXT_PUBLIC_META_PIXEL_ID=1422329032149636
```

### Fallback Configuration
If `NEXT_PUBLIC_META_PIXEL_ID` is not set, the system defaults to the hardcoded Pixel ID (`1422329032149636`).

---

## Events Tracked

### Automatic Events (No Code Required)

#### 1. PageView
- **When:** Every page navigation
- **Trigger:** Route changes in Next.js App Router
- **Data:** Automatic (no custom parameters)

#### 2. AddToCart
- **When:** User adds competition to cart
- **Trigger:** Cart context in `useAnalytics`
- **Data:**
  ```javascript
  {
    content_ids: ["competition_id"],
    content_name: "Competition Title",
    content_type: "product",
    value: 2.99, // in pounds (converted from pence)
    currency: "GBP"
  }
  ```

#### 3. InitiateCheckout
- **When:** User starts checkout process
- **Trigger:** Checkout page load with items
- **Data:**
  ```javascript
  {
    content_ids: ["comp1", "comp2"],
    num_items: 2,
    value: 5.99,
    currency: "GBP"
  }
  ```

#### 4. Purchase
- **When:** Purchase completed successfully
- **Trigger:** Checkout summary page
- **Data:**
  ```javascript
  {
    content_ids: ["competition_id"],
    value: 2.99,
    currency: "GBP",
    num_items: 1
  }
  ```

#### 5. ViewContent
- **When:** User views competition details
- **Trigger:** Competition page visits
- **Data:**
  ```javascript
  {
    content_ids: ["competition_id"],
    content_name: "Competition Title",
    content_type: "product"
  }
  ```

#### 6. Search
- **When:** User searches competitions
- **Trigger:** Search functionality
- **Data:**
  ```javascript
  {
    search_string: "search query"
  }
  ```

### Manual Event Tracking

Use the `useMetaPixel` hook for custom events:

```typescript
import { useMetaPixel } from "@/shared/hooks/use-meta-pixel";

function MyComponent() {
  const metaPixel = useMetaPixel();

  const handleCustomAction = () => {
    // Standard Meta event
    metaPixel.trackEvent("Lead", {
      content_name: "Newsletter Signup",
      value: 1,
      currency: "GBP"
    });

    // Custom event
    metaPixel.trackCustomEvent("Newsletter_Signup", {
      source: "homepage_footer"
    });
  };
}
```

---

## Standard Meta Events Available

### E-commerce Events
- `AddToCart` - Product added to cart
- `InitiateCheckout` - Checkout process started
- `Purchase` - Transaction completed
- `ViewContent` - Product page viewed

### Engagement Events
- `Search` - Search performed
- `Lead` - Lead generated (newsletter, contact form)
- `CompleteRegistration` - Account creation
- `Subscribe` - Subscription started

### Custom Events
Use `trackCustomEvent()` for business-specific events that don't fit standard categories.

---

## Data Format & Currency

### Currency Handling
- **Internal Format:** All prices stored in pence (e.g., £2.99 = 299 pence)
- **Meta Pixel Format:** Automatically converted to pounds (e.g., 299 pence → 2.99)
- **Currency Code:** Always `"GBP"`

### Content IDs
- Use competition IDs as `content_ids`
- Format: Array of strings `["comp_123", "comp_456"]`
- Maps to your internal competition identification system

---

## Testing & Verification

### 1. Browser Console Testing
```javascript
// Check if Meta Pixel is loaded
console.log(typeof window.fbq); // Should return "function"

// Manual test event
window.fbq('track', 'PageView');

// Check pixel initialization
window.fbq('track', 'ViewContent', {
  content_ids: ['test_123'],
  content_type: 'product'
});
```

### 2. Facebook Events Manager
1. Go to [Facebook Events Manager](https://www.facebook.com/events_manager2)
2. Select your Pixel ID (`1422329032149636`)
3. Navigate to "Test Events" tab
4. Perform actions on your website
5. Verify events appear in real-time

### 3. Facebook Pixel Helper (Browser Extension)
- Install the [Facebook Pixel Helper](https://chrome.google.com/webstore/detail/facebook-pixel-helper/fdgfkebogiimcoedlicjlajpkdmockpc) Chrome extension
- Navigate to your website
- Click the extension icon to see fired events
- Green indicators = successful tracking

### 4. Meta Pixel Tab in Browser DevTools
- Open browser DevTools (F12)
- Look for network requests to `facebook.com/tr`
- Inspect request payloads to verify event data

---

## Integration with Existing Analytics

### Unified Event Tracking
When you call any tracking method in `useAnalytics`, events are automatically sent to:

1. **Klaviyo Analytics** (primary)
2. **Meta Pixel** (conversion tracking)
3. **Google Analytics** (web analytics)

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
// ✅ Klaviyo: "Added to Cart" event
// ✅ Meta Pixel: AddToCart event (value: 2.99 GBP)
// ✅ Google Analytics: add_to_cart event
```

---

## File Structure

```
src/
├── shared/
│   ├── components/
│   │   └── analytics/
│   │       ├── MetaPixel.tsx                 # Pixel initialization
│   │       └── MetaPixelPageTracker.tsx      # Page view tracking
│   └── hooks/
│       ├── use-meta-pixel.ts                 # Meta Pixel hook
│       └── use-klaviyo-analytics.ts          # Unified analytics (Klaviyo)
├── app/
│   └── layout.tsx                            # Component integration
└── docs/
    └── meta_pixel.md                         # This document
```

---

## Troubleshooting

### Common Issues

#### 1. Events Not Firing
**Symptoms:** No events in Facebook Events Manager
**Solutions:**
- Check `NEXT_PUBLIC_ENABLE_ANALYTICS=true` in environment
- Verify `NEXT_PUBLIC_META_PIXEL_ID` is set correctly
- Ensure user consent for tracking (if implemented)
- Check browser console for JavaScript errors

#### 2. Incorrect Event Values
**Symptoms:** Wrong prices or currencies in Meta
**Solutions:**
- Verify price conversion logic (pence → pounds)
- Check currency parameter is "GBP"
- Ensure `content_ids` are properly formatted

#### 3. Page Views Not Tracking
**Symptoms:** Only initial page load tracked
**Solutions:**
- Verify `MetaPixelPageTracker` component is included in layout
- Check Next.js routing setup (App Router vs Pages Router)
- Ensure component is wrapped in `Suspense` if needed

#### 4. Development vs Production
**Symptoms:** Works in dev but not production
**Solutions:**
- Verify environment variables are set in production
- Check Content Security Policy (CSP) headers
- Ensure `facebook.com` domains are allowlisted

### Debug Mode

Enable Facebook's debug mode in development:

```typescript
// Add to MetaPixel.tsx for debugging
fbq('init', '${META_PIXEL_ID}', {}, {
  debug: process.env.NODE_ENV === 'development'
});
```

### Event Validation

Use Facebook's Event Quality dashboard to identify:
- Events with missing parameters
- Duplicate events
- Browser compatibility issues
- Data quality scores

---

## Privacy & Compliance

### GDPR Compliance
- Meta Pixel respects the global `NEXT_PUBLIC_ENABLE_ANALYTICS` setting
- Consider implementing cookie consent before initializing pixel
- Provide opt-out mechanisms as required by law

### Data Processing
- Meta Pixel automatically hashes email addresses
- Personal data is processed according to Facebook's Data Policy
- Consider implementing Advanced Matching for better attribution

### Recommended Implementation
```typescript
// Conditional initialization based on consent
if (userConsent && ENABLE_ANALYTICS) {
  // Initialize Meta Pixel
}
```

---

## Performance Considerations

### Loading Strategy
- Script loads with `strategy="afterInteractive"` (after page interactive)
- Minimal impact on initial page load performance
- Asynchronous loading prevents blocking

### Bundle Size
- Meta Pixel script loaded externally (~50KB)
- Custom hooks add minimal bundle overhead
- No additional dependencies required

---

## Advanced Features

### Custom Audiences
Meta Pixel automatically builds audiences based on:
- Website visitors (all pages)
- Product viewers (competition pages)  
- Add to cart users
- Purchasers
- Search users

### Conversion Optimization
Use tracked events to:
- Optimize for purchase conversions
- Create lookalike audiences
- Retarget abandoned cart users
- Measure ROAS (Return on Ad Spend)

### Cross-Device Tracking
Meta Pixel enables:
- Cross-device conversion attribution
- Mobile-to-desktop user journeys
- Comprehensive customer lifetime value tracking

---

## Support & Resources

### Documentation
- [Meta Pixel Documentation](https://developers.facebook.com/docs/facebook-pixel)
- [Meta Business Help Center](https://www.facebook.com/business/help)
- [Meta Events Manager](https://www.facebook.com/events_manager2)

### Tools
- [Facebook Pixel Helper](https://chrome.google.com/webstore/detail/facebook-pixel-helper/fdgfkebogiimcoedlicjlajpkdmockpc)
- [Facebook Event Testing Tool](https://developers.facebook.com/tools/test-events)
- [Meta Conversions API](https://developers.facebook.com/docs/marketing-api/conversions-api) (future enhancement)

---

**Last Updated:** January 2025  
**Pixel ID:** 1422329032149636  
**Status:** ✅ Active and Tracking 