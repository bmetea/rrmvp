import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/navigation/Navbar";
import Footer from "@/components/navigation/Footer";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { ClerkProvider } from "@clerk/nextjs";
import { CartProvider } from "@/lib/context/cart-context";
import Script from "next/script";
import { Toaster } from "sonner";
import GoogleAnalytics from "@/components/analytics/GoogleAnalytics";
import PageViewTracker from "@/components/analytics/PageViewTracker";
// import SegmentProvider from "@/components/analytics/SegmentProvider";

export const metadata: Metadata = {
  title: "Radiance Rewards",
  description: "Beauty and cosmetics competition platform",
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
        <body className="antialiased" suppressHydrationWarning>
          <Toaster />
          <GoogleAnalytics />
          <PageViewTracker />
          {/* <SegmentProvider /> */}
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <CartProvider>
              <div className="flex min-h-screen flex-col">
                <Navbar />
                <main className="flex-1 pt-16">{children}</main>
                <Footer />
              </div>
            </CartProvider>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
