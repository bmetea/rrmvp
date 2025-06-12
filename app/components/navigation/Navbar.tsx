"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Menu, X, Ticket } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { useTheme } from "next-themes";
import {
  SignInButton,
  SignedIn,
  SignedOut,
  UserButton,
  useAuth,
} from "@clerk/nextjs";
import { CompetitionCartDialog } from "@/components/cart/competition-cart-dialog";
import MyEntriesPage from "@/components/user/MyEntriesPage";

interface NavbarProps {
  activePath?: string;
}

const navLinks = [
  { href: "/competitions", label: "Competitions" },
  { href: "/how-it-works", label: "How it works" },
  { href: "/about", label: "About us" },
  { href: "/faq", label: "FAQ" },
];

const Navbar = ({ activePath = "/" }: NavbarProps) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const { userId } = useAuth();

  // After mounting, we can safely show the theme-dependent logo
  useEffect(() => {
    setMounted(true);
  }, []);

  const isAdmin = userId === "user_2yHYTl16QkOq9usCZ4GlQY3vW3Y";

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center">
              {mounted ? (
                <Image
                  src={
                    resolvedTheme === "dark"
                      ? "/svg/text-logo-white.svg"
                      : "/svg/text-logo-black.svg"
                  }
                  alt="Radiance Rewards"
                  width={150}
                  height={40}
                  priority
                  className="h-8 w-auto"
                />
              ) : (
                <Image
                  src="/svg/text-logo-black.svg"
                  alt="Radiance Rewards"
                  width={150}
                  height={40}
                  priority
                  className="h-8 w-auto"
                />
              )}
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="hover:scale-110 transition-transform duration-200"
              aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
            <CompetitionCartDialog />
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8 h-16">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-primary",
                  activePath === link.href
                    ? "text-foreground"
                    : "text-muted-foreground"
                )}
              >
                {link.label}
              </Link>
            ))}
            {isAdmin && (
              <Link
                href="/admin"
                className={cn(
                  "text-sm font-medium transition-colors hover:text-primary",
                  activePath === "/admin"
                    ? "text-foreground"
                    : "text-muted-foreground"
                )}
              >
                Admin Dashboard
              </Link>
            )}
          </div>

          {/* Right side buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <ThemeToggle />
            <CompetitionCartDialog />
            <SignedIn>
              <UserButton>
                <UserButton.UserProfilePage
                  label="My Entries"
                  url="entries"
                  labelIcon={<Ticket className="h-4 w-4" />}
                >
                  <MyEntriesPage />
                </UserButton.UserProfilePage>
              </UserButton>
            </SignedIn>
            <SignedOut>
              <SignInButton mode="modal">
                <Button
                  variant="default"
                  className="bg-indigo-600 hover:bg-indigo-700 hover:scale-105 transition-all duration-200"
                >
                  Sign in
                </Button>
              </SignInButton>
            </SignedOut>
          </div>
        </div>

        {/* Mobile menu */}
        <div className={cn("md:hidden", isMobileMenuOpen ? "block" : "hidden")}>
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "block px-3 py-2 rounded-md text-base font-medium group transition-all duration-300",
                  activePath === link.href
                    ? "text-orange-500 bg-orange-50"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                )}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <span className="relative inline-block">
                  {link.label}
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-orange-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></span>
                </span>
              </Link>
            ))}
            {isAdmin && (
              <Link
                href="/admin"
                className={cn(
                  "block px-3 py-2 rounded-md text-base font-medium group transition-all duration-300",
                  activePath === "/admin"
                    ? "text-orange-500 bg-orange-50"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                )}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <span className="relative inline-block">
                  Admin Dashboard
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-orange-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></span>
                </span>
              </Link>
            )}
            <div className="pt-4 pb-3 border-t border-gray-200">
              <div className="flex items-center px-5 space-x-2">
                <ThemeToggle />
                <SignedIn>
                  <CompetitionCartDialog />
                  <UserButton>
                    <UserButton.UserProfilePage
                      label="My Entries"
                      url="entries"
                      labelIcon={<Ticket className="h-4 w-4" />}
                    >
                      <MyEntriesPage />
                    </UserButton.UserProfilePage>
                  </UserButton>
                </SignedIn>
                <SignedOut>
                  <SignInButton mode="modal">
                    <Button
                      variant="default"
                      className="bg-indigo-600 hover:bg-indigo-700 hover:scale-105 transition-all duration-200 w-full"
                    >
                      Sign in
                    </Button>
                  </SignInButton>
                </SignedOut>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
