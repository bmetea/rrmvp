import type { Metadata } from "next";
import { Crimson_Pro, Open_Sans } from "next/font/google";
import "./globals.css";
import Navbar from "@/shared/components/layout/navigation/Navbar";
import Footer from "@/shared/components/layout/navigation/Footer";
import SponsorshipBanner from "@/shared/components/sections/SponsorshipBanner";

import { ClerkProvider } from "@clerk/nextjs";
import { CartProvider } from "@/shared/lib/context/cart-context";
import Script from "next/script";
import { Toaster } from "sonner";
import GoogleAnalytics from "@/shared/components/analytics/GoogleAnalytics";
import PageViewTracker from "@/shared/components/analytics/PageViewTracker";
import MetaPixel from "@/shared/components/analytics/MetaPixel";
import MetaPixelPageTracker from "@/shared/components/analytics/MetaPixelPageTracker";
import AffiliateCodeTracker from "@/shared/components/analytics/AffiliateCodeTracker";
import Hotjar from "@/shared/components/analytics/Hotjar";
import KlaviyoTest from "@/shared/components/debug/KlaviyoTest";

const crimsonPro = Crimson_Pro({
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-crimson-pro",
  display: "swap",
});

const openSans = Open_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-open-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Radiance Rewards",
  description: "Beauty and cosmetics competition platform",
  manifest: "/manifest.json",
  icons: {
    icon: [
      {
        rel: "icon",
        url: "/svg/logo-favicon-black.svg",
        type: "image/svg+xml",
      },
    ],
    shortcut: [
      {
        rel: "shortcut icon",
        url: "/svg/logo-favicon-black.svg",
        type: "image/svg+xml",
      },
    ],
    apple: [
      {
        rel: "apple-touch-icon",
        url: "/svg/logo-favicon-black.svg",
        type: "image/svg+xml",
      },
    ],
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      {/* <ReactScan /> */}
      <html lang="en" suppressHydrationWarning>
        <head>
          <meta name="color-scheme" content="light" />
          <link
            rel="icon"
            href="/svg/logo-favicon-black.svg"
            type="image/svg+xml"
          />
          <link
            rel="shortcut icon"
            href="/svg/logo-favicon-black.svg"
            type="image/svg+xml"
          />
          <link
            rel="apple-touch-icon"
            href="/svg/logo-favicon-black.svg"
            type="image/svg+xml"
          />
          <Script id="bfcache-handler" strategy="beforeInteractive">
            {`
              window.addEventListener('pageshow', (event) => {
                if (event.persisted) {
                  if (window.Clerk) {
                    window.Clerk.load();
                  }
                }
              });
            `}
          </Script>
        </head>
        <body
          className={`${crimsonPro.variable} ${openSans.variable} antialiased`}
          suppressHydrationWarning
        >
          <Toaster />
          <GoogleAnalytics />
          <PageViewTracker />
          <MetaPixel />
          <MetaPixelPageTracker />
          <AffiliateCodeTracker />
          <Hotjar />
          <CartProvider>
            <div className="flex min-h-screen flex-col">
              <Navbar />
              <div className="pt-16">
                <SponsorshipBanner />
                <main className="flex-1">{children}</main>
              </div>
              <Footer />
            </div>
            <KlaviyoTest />
          </CartProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
