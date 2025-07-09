## URLS
prd= https://d27p6ej8vra5wq.cloudfront.net
ppr= https://d2qvkhcyrxsbba.cloudfront.net



## TODO

- [ ] implement image upload s3
- [ ] Segment prod setuo
  - [ ] Send event when someone wins
    - [ ] should contain products
    - [ ] Nick will show example
  - [ ] or find a solution
- [ ] increment credit when credit is won
- [ ] Design stuff.
- [ ] clerk social providers setup
- [ ] nomu
  - [ ] google pay
    - [ ] Implement callback
- [ ] Facebook pixel
  - [x] got the pixel
  - [ ] implement the pixel
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

This application also includes Segment Analytics for enhanced tracking capabilities.

### Environment Variables

Add these environment variables to your `.env.local` file:

```bash
# Enable/disable analytics (default: false)
NEXT_PUBLIC_ENABLE_ANALYTICS=true

# Segment Write Key (required for Segment analytics)
NEXT_PUBLIC_SEGMENT_WRITE_KEY=your_segment_write_key_here
```

### Features

- **Automatic Cart Tracking**: Cart events are automatically tracked when items are added/removed
- **Checkout Tracking**: Purchase events are tracked during checkout
- **Conditional Loading**: Segment only loads when both `NEXT_PUBLIC_ENABLE_ANALYTICS` is `true` and a valid write key is provided
- **Graceful Degradation**: If analytics is disabled or write key is missing, a no-op analytics instance is used

### Usage

Segment analytics is automatically used in the cart context and checkout flow. No additional setup is required.

### Configuration Notes

- If `NEXT_PUBLIC_ENABLE_ANALYTICS` is set to `false`, both Google Analytics and Segment will be disabled
- If `NEXT_PUBLIC_SEGMENT_WRITE_KEY` is not provided or is empty, Segment will be disabled but Google Analytics will still work (if enabled)
- The application will not throw errors if Segment is not properly configured

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
