## URLS
prd= https://d27p6ej8vra5wq.cloudfront.net
ppr= https://d2qvkhcyrxsbba.cloudfront.net



## TODO

- [ ] implement image upload s3
- [ ] warm lambda ?
  - [ ] https://sst.dev/docs/component/aws/nextjs/#warm
- [x] Segment prod setuo
- [ ] increment credit when credit is won
- [x] Design stuff.
- [ ] clerk social providers setup
  - [x] google
  - [ ] facebook(doesnt work)
- [ ] nomu
  - [ ] google pay
    - [ ] Implement callback
- [x] Facebook pixel
  - [x] got the pixel
  - [x] implement the pixel
- [ ] think of edge cases 
- [ ] change clerk webhook path


- [x] deploy prod
- [ ] audit logs
- [ ] Link winning ticket numbers to actual products
- [ ] So, they seem to do it relative to end date. If it's within a week they say'ends this friday' if it's today or tomorrow they say that and if anything else, they say just launched.
- [ ]transform into monorepo
- [ ]infra
  - hosting/dns
  - how to do migrations automatically ? 
  - cicd?
- [ ] db
  - [ ] use clerkid as primary key.
    - [ ] or store user-uuid in token
  - [ ] ticket counter on competition table
  - [ ] review all db queries

## Google Analytics Setup

This application includes Google Analytics 4 (GA4) tracking. The setup includes:

### Environment Variables

Add these environment variables to your `.env.local` file:

```bash
# Enable/disable analytics (default: false)
NEXT_PUBLIC_ENABLE_ANALYTICS=true

# Google Analytics Tracking ID (default: G-TCT192NP1Q)
NEXT_PUBLIC_GA_TRACKING_ID=G-TCT192NP1Q
```

### Features

- **Automatic Page View Tracking**: Page views are automatically tracked when users navigate between pages
- **Custom Event Tracking**: Use the `useGoogleAnalytics` hook to track custom events
- **Purchase Tracking**: Built-in support for tracking e-commerce purchases
- **Conditional Loading**: Analytics only loads when `NEXT_PUBLIC_ENABLE_ANALYTICS` is set to `true`

### Usage

#### Track Custom Events

```tsx
import { useGoogleAnalytics } from '@/hooks/use-google-analytics';

function MyComponent() {
  const { trackEvent } = useGoogleAnalytics();

  const handleButtonClick = () => {
    trackEvent('button_click', 'engagement', 'hero_cta', 1);
  };

  return <button onClick={handleButtonClick}>Click me</button>;
}
```

#### Track Purchases

```tsx
import { useGoogleAnalytics } from '@/hooks/use-google-analytics';

function CheckoutComponent() {
  const { trackPurchase } = useGoogleAnalytics();

  const handlePurchase = (orderData) => {
    trackPurchase(
      orderData.transactionId,
      orderData.total,
      'USD',
      orderData.items
    );
  };
}
```

### Components

- `GoogleAnalytics`: Loads the Google Analytics script
- `PageViewTracker`: Automatically tracks page views
- `useGoogleAnalytics`: Hook for tracking custom events

## Segment Analytics Setup

This application includes comprehensive Segment Analytics for detailed customer journey tracking.

### Environment Variables

Add these environment variables to your `.env.local` file:

```bash
# Enable/disable analytics (default: false)
NEXT_PUBLIC_ENABLE_ANALYTICS=true

# Segment Write Key (required for Segment analytics)
NEXT_PUBLIC_SEGMENT_WRITE_KEY=your_segment_write_key_here
```

### Features

- **User Identification**: Automatic user identification with signup date, email, and profile data
- **Page View Tracking**: Enhanced page views with referrer, title, and custom properties
- **E-commerce Tracking**: Complete funnel tracking including:
  - Product viewed (competition pages)
  - Add to cart / Remove from cart
  - Cart viewed
  - Checkout started
  - Purchase completed
  - Abandoned checkout (15-minute timeout)
- **User Activity**: Last active tracking with 30-second intervals
- **Signup Tracking**: New user registration events via Clerk webhooks
- **Revenue Tracking**: Order values, payment methods, and wallet credit usage

### Automatically Tracked Events

The following events are tracked automatically without additional code:

1. **User Signed Up** - When users register via Clerk
2. **Product Added** - When items are added to cart
3. **Product Removed** - When items are removed from cart
4. **Cart Viewed** - When cart modal/page is opened
5. **Checkout Started** - When users visit checkout page with items
6. **Checkout Abandoned** - After 15 minutes on checkout without completion
7. **Order Completed** - When purchases are successfully processed
8. **User Active** - Every 30 seconds and on page visibility changes
9. **Page Views** - All navigation with enhanced properties

### Usage

#### Using the Hook

```tsx
import { useAnalytics } from '@/shared/hooks/use-analytics';

function MyComponent() {
  const { trackEvent, trackCompetitionViewed } = useAnalytics();

  const handleCompetitionView = () => {
    trackCompetitionViewed('competition-id', 'Competition Title', 'raffle');
  };

  const handleCustomEvent = () => {
    trackEvent('Custom Event', {
      category: 'engagement',
      value: 100,
    });
  };

  return (
    <div>
      <button onClick={handleCompetitionView}>View Competition</button>
      <button onClick={handleCustomEvent}>Custom Action</button>
    </div>
  );
}
```

#### Available Tracking Methods

- `trackPageView(page, properties?)` - Manual page view tracking
- `trackSignUp(userData)` - Track user registrations
- `trackAddToCart(item)` - Track cart additions
- `trackRemoveFromCart(item)` - Track cart removals
- `trackCartViewed(items, totalValue)` - Track cart views
- `trackCheckoutStarted(items, totalValue, checkoutId?)` - Track checkout initiation
- `trackPurchase(purchaseData)` - Track completed purchases
- `trackCompetitionViewed(id, title, type?)` - Track competition page views
- `trackSearch(query, results?)` - Track search events
- `trackEvent(eventName, properties?)` - Track custom events

### Data Structure

Events include rich context such as:
- **User Properties**: ID, email, signup date, last active
- **Product Properties**: Competition ID, title, type, price, quantity
- **Order Properties**: Payment method, wallet/card amounts, revenue
- **Session Properties**: Page path, referrer, timestamp

### Configuration Notes

- Events only fire when `NEXT_PUBLIC_ENABLE_ANALYTICS=true` and valid write key provided
- User identification happens automatically on sign-in
- Activity tracking respects page visibility (pauses when tab inactive)
- Checkout abandonment uses intelligent detection (checks if still on checkout pages)
- All events include timestamps and additional context for better analysis

## Notes

### Using Other db stage on sst dev
- If you want to use PPR db when you run `sst dev` you need to use the PPR vpc
- Then in the RDS dev property pass in the PPR details.

### DB Migrations

- `pnpm sst shell --stage ppr pnpm db:migrate` 
- `pnpm sst shell --stage ppr pnpm db:revert` 
- `pnpm sst shell --stage ppr pnpm db:revert_all` 
- `migrate": "tsx scripts/migrate.ts`

### SSM Bastion

https://medium.com/@rajputmanish061/how-to-access-aws-rds-via-bastion-host-using-ssm-plu-93d6c4f2bb08

- on local machine to connect to the bastion
    - `aws ssm start-session --target i-06f1f927361315d42 --region eu-west-1`
    - `aws ssm start-session --target i-06f1f927361315d42 --document-name AWS-StartPortForwardingSession --parameters '{"portNumber":["5432"], "localPortNumber":["5433"]}' --region eu-west-1`
- on bastion to do the forwarding
  - `socat TCP-LISTEN:5432,reuseaddr,fork TCP4:rr-ppr-rrdbproxy-ufbkzhwo.proxy-c7yw6ysg4zqm.eu-west-1.rds.amazonaws.com:5432`


### SST Tunnel

- `pnpm sst shell --stage ppr sst tunnel`
- dupa care folosesti exact detaliile din output



This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Competition Details

# 🏆 Ultimate Anti-Wrinkle Treatment Prize Draw

## Win £2,400 in Cash! 
### Transform Your Beauty Journey or Choose Your Own Path

> Win £2,400 in cash—designed to cover the cost of anti-wrinkle treatments for up to 24 months, or spend it however you wish.

**Important:** Please read our full Terms and Conditions, including Clause 6, before entering.

### 🎁 Prize Overview

*   **Prize Value:** £2,400 cash
*   **Treatment Equivalent:** Up to 24 months of anti-wrinkle treatments
*   **Usage Flexibility:** No restrictions on how the cash is used
*   **Entry Requirements:** Open to UK residents aged 18 and over

#### 📋 Detailed Information

1. **Prize Breakdown**
   - Total Cash Value: £2,400
   - Monthly Treatment Value: ~£100
   - Duration Coverage: 24 months

2. **Treatment Options**
   * Anti-wrinkle injections
   * Facial treatments
   * Or any personal choice

3. **Winner's Freedom**
   - [x] Use for treatments
   - [x] Save for future
   - [x] Spend on anything else

##### 💫 Why Enter?

* **Flexibility** - Your prize, your choice
* **Value** - Full 2-year treatment coverage
* **Freedom** - No strings attached
* **Simplicity** - Direct cash prize

###### 📝 Entry Notes

~~~
Terms and conditions apply
Must be 18 or over
UK residents only
See Clause 6 for full details
~~~

---

*Remember: This life-changing prize could be yours!*

**Ready to Enter?** [Click Here](#) to join the draw.
