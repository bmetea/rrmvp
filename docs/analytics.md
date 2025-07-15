# Analytics Documentation

This document provides comprehensive analytics tracking documentation for Radiance Rewards. Our analytics system tracks user behavior across multiple platforms through a unified `useAnalytics` hook.

## Architecture Overview

```
User Action → useAnalytics Hook → Multiple Destinations
                                 ├── Meta Pixel (Facebook)
                                 └── Google Analytics
```

All analytics tracking flows through a single hook (`useAnalytics`) that automatically dispatches events to all configured platforms, ensuring consistent tracking without code duplication.

## Platform-Specific Documentation

### 📱 [Meta Pixel](./meta_pixel.md)  
- Facebook and Instagram advertising optimization
- Conversion tracking and audience building
- Custom audiences and lookalike modeling
- Purchase attribution and ROAS measurement

### 📈 [Google Analytics](./google_analytics.md)
- Web analytics and reporting
- User behavior analysis
- Traffic source attribution
- Goal and conversion tracking

## Quick Start

### Environment Configuration
```bash
# Required for all analytics
NEXT_PUBLIC_ENABLE_ANALYTICS=true

# Platform-specific (optional)
NEXT_PUBLIC_META_PIXEL_ID=your_meta_pixel_id  
NEXT_PUBLIC_GA_TRACKING_ID=your_ga_tracking_id
NEXT_PUBLIC_KLAVIYO_PUBLIC_KEY=your_klaviyo_public_key
```

### Basic Usage
```typescript
import { useAnalytics } from '@/shared/hooks';

function MyComponent() {
  const { trackEvent, trackCompetitionViewed } = useAnalytics();

  const handleAction = () => {
    // This single call sends events to all platforms
    trackEvent('Custom Event', {
      category: 'engagement',
      value: 1
    });
  };
}
```

## Events Automatically Tracked

### E-commerce Flow
- **Product Added** - Cart additions
- **Cart Viewed** - Cart modal opened  
- **Checkout Started** - Checkout process initiated
- **Order Completed** - Purchase finalized
- **Product Viewed** - Competition details viewed
- **Products Searched** - Search queries

### User Engagement  
- **Page Views** - Route navigation
- **User Active** - Periodic activity tracking
- **User Signed Up** - Account registration
- **Profile Updated** - Account modifications

## Cross-Platform Event Mapping

| `useAnalytics` Event | Meta Pixel Event | Google Analytics | Klaviyo Event |
|---------------------|------------------|------------------|---------------|
| `trackAddToCart()` | AddToCart | add_to_cart | Added to Cart |
| `trackCheckoutStarted()` | InitiateCheckout | begin_checkout | Started Checkout |
| `trackPurchase()` | Purchase | purchase | Placed Order |
| `trackCompetitionViewed()` | ViewContent | view_item | Viewed Product |
| `trackSearch()` | Search | search | Searched Site |

## File Structure

```
src/shared/
├── hooks/
│   ├── use-klaviyo-analytics.ts      # Main unified analytics hook (Klaviyo)
│   ├── use-meta-pixel.ts             # Meta Pixel specific
│   └── use-google-analytics.ts       # Google Analytics specific
├── components/analytics/
│   ├── MetaPixel.tsx                 # Meta Pixel initialization
│   ├── MetaPixelPageTracker.tsx      # Meta Pixel page tracking
│   ├── GoogleAnalytics.tsx           # GA initialization
│   └── PageViewTracker.tsx           # GA page tracking
└── lib/
    └── klaviyo.ts                   # Klaviyo configuration
```

## Data Consistency

### Currency Handling
- **Internal Format:** Prices stored in pence (299 = £2.99)
- **External Format:** Automatically converted to pounds for external platforms
- **Currency Code:** Consistent "GBP" across all platforms

### User Identification
- **User ID:** Clerk user ID used consistently
- **Anonymous Tracking:** Supported across all platforms
- **Cross-Device:** Meta Pixel and Google Analytics provide cross-device attribution

## Privacy & Compliance

All platforms respect the global `NEXT_PUBLIC_ENABLE_ANALYTICS` setting and follow privacy-first practices:

- **GDPR Compliance** - Analytics disabled by default, enabled via environment variable
- **Cookie Management** - Handled by each platform according to their policies  
- **Data Processing** - User data processed according to each platform's privacy policies
- **Opt-out Support** - Can be extended to support user-level opt-out

## Support & Resources

- **Implementation Issues:** Check individual platform documentation
- **Event Debugging:** Each platform provides real-time event debugging tools
- **Data Discrepancies:** Expected minor variations due to different attribution models

---

**Last Updated:** January 2025  
**Hook Name:** `useAnalytics` (now using Klaviyo)  
**Status:** ✅ Active and Tracking All Platforms 