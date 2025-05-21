import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/navigation/Navbar";
import Footer from "@/components/navigation/Footer";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { ClerkProvider } from "@clerk/nextjs";
import { CartProvider } from "@/lib/context/cart-context";
import { PrizesProvider } from "../lib/context/prizes-context";
import Script from "next/script";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  preload: true,
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  preload: true,
  display: "swap",
});

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
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <PrizesProvider>
              <CartProvider>
                <div className="flex min-h-screen flex-col">
                  <Navbar />
                  <main className="flex-1 pt-16">{children}</main>
                  <Footer />
                </div>
              </CartProvider>
            </PrizesProvider>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
