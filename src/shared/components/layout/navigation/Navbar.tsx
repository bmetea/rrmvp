"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/shared/components/ui/button";
import {
  Menu,
  X,
  Ticket,
  Home,
  Gift,
  HelpCircle,
  Info,
  Users,
  User,
  Instagram,
  Facebook,
  ShoppingCart,
  LogOut,
  CreditCard,
  Heart,
  Settings,
} from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { useState, useEffect, useRef } from "react";
import { ThemeToggle } from "@/shared/components/theme/theme-toggle";
import { useTheme } from "next-themes";
import { SignInButton, SignedIn, SignedOut, useAuth } from "@clerk/nextjs";
import { CompetitionCartDialog } from "@/app/(pages)/competitions/(components)/competition-cart-dialog";
import { useAdmin } from "@/shared/hooks/use-admin";
import { CustomUserButton } from "@/app/(pages)/user/(components)/CustomUserButton";

interface NavbarProps {
  activePath?: string;
}

const navLinks = [
  { href: "/", label: "Home", icon: Home },
  { href: "/competitions", label: "Competitions", icon: Gift },
  { href: "/how-it-works", label: "How it works", icon: HelpCircle },
  { href: "/about", label: "About us", icon: Info },
  { href: "/faq", label: "FAQ", icon: Users },
];

const mobileNavLinks = [
  { href: "/user/my-entries", label: "My Entries", icon: Ticket },
  { href: "/user/profile", label: "Edit Profile", icon: Settings },
  { href: "/user/order-history", label: "Order History", icon: ShoppingCart },
  {
    href: "/user/billing",
    label: "Billing & Payment Details",
    icon: CreditCard,
  },
  { href: "/user/loyalty", label: "Loyalty & Referral", icon: Heart },
];

const Navbar = ({ activePath = "/" }: NavbarProps) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const { userId } = useAuth();
  const { isAdmin } = useAdmin();
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const burgerButtonRef = useRef<HTMLButtonElement>(null);

  // After mounting, we can safely show the theme-dependent logo
  useEffect(() => {
    setMounted(true);
  }, []);

  // Handle click outside for mobile menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Don't close if clicking the burger button - let the onClick handler manage that
      if (burgerButtonRef.current?.contains(event.target as Node)) {
        return;
      }

      // Close if clicking outside the menu
      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target as Node)
      ) {
        setIsMobileMenuOpen(false);
      }
    };

    if (isMobileMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMobileMenuOpen]);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b bg-background font-open-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Social Icons */}
          <div className="flex items-center gap-4">
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
            <div className="flex items-center gap-2">
              <a
                href="https://www.instagram.com/radiance.rewards"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-accent transition-colors"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href="https://www.facebook.com/profile.php?id=61573382340671"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-accent transition-colors"
              >
                <Facebook className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Mobile menu button and right side items */}
          <div className="md:hidden flex items-center gap-2">
            {/* Mobile Nav Icons - Match Figma Design */}
            <SignedIn>
              <Button
                variant="ghost"
                size="icon"
                className="w-10 h-10 p-2"
                aria-label="My Account"
              >
                <User className="w-6 h-6 text-[#E19841]" strokeWidth={2} />
              </Button>
            </SignedIn>

            <CompetitionCartDialog />

            <Button
              ref={burgerButtonRef}
              variant="ghost"
              size="icon"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="w-10 h-10 p-2 hover:bg-transparent"
              aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6 text-[#151515]" strokeWidth={2} />
              ) : (
                <Menu className="h-6 w-6 text-[#151515]" strokeWidth={2} />
              )}
            </Button>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8 h-16">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-accent",
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
              <CustomUserButton />
            </SignedIn>
            <SignedOut>
              <SignInButton mode="modal">
                <Button
                  variant="default"
                  className="bg-accent hover:bg-accent/90 text-accent-foreground hover:scale-105 transition-all duration-200"
                >
                  Sign in
                </Button>
              </SignInButton>
            </SignedOut>
          </div>
        </div>

        {/* Mobile menu - Match Figma Design */}
        <div
          ref={mobileMenuRef}
          className={cn(
            "md:hidden fixed inset-x-0 top-[64px] bg-[#F7F7F7] shadow-lg z-40 transition-all duration-300",
            isMobileMenuOpen
              ? "opacity-100 visible translate-y-0"
              : "opacity-0 invisible -translate-y-2"
          )}
        >
          <div className="px-5 py-5 space-y-1">
            <SignedIn>
              {mobileNavLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="flex items-center gap-3 px-2 py-3 text-[#151515] hover:bg-white/50 rounded-lg transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Icon className="w-6 h-6 text-[#151515]" strokeWidth={2} />
                    <span className="text-[16px] font-semibold font-open-sans">
                      {link.label}
                    </span>
                  </Link>
                );
              })}

              <button
                className="flex items-center gap-3 px-2 py-3 text-[#151515] hover:bg-white/50 rounded-lg transition-colors w-full text-left"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  // Add logout logic here
                }}
              >
                <LogOut className="w-6 h-6 text-[#151515]" strokeWidth={2} />
                <span className="text-[16px] font-semibold font-open-sans">
                  Log out
                </span>
              </button>

              <div className="pt-4 mt-4">
                <Button
                  className="w-full bg-[#3D2C8D] hover:bg-[#3D2C8D]/90 text-white border-2 border-[#3D2C8D] rounded-full py-2 px-5 text-[16px] font-semibold font-open-sans"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Enter now
                </Button>
              </div>
            </SignedIn>

            <SignedOut>
              <div className="pt-4">
                <SignInButton mode="modal">
                  <Button
                    className="w-full bg-[#3D2C8D] hover:bg-[#3D2C8D]/90 text-white border-2 border-[#3D2C8D] rounded-full py-2 px-5 text-[16px] font-semibold font-open-sans"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Sign in
                  </Button>
                </SignInButton>
              </div>
            </SignedOut>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
