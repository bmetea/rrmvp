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
            <CompetitionCartDialog />
            <SignedIn>
              <CustomUserButton />
            </SignedIn>
            <SignedOut>
              <SignInButton mode="modal">
                <Button
                  variant="outline"
                  size="icon"
                  className="border-accent text-accent"
                  aria-label="Sign in"
                >
                  <User className="w-5 h-5" />
                </Button>
              </SignInButton>
            </SignedOut>
            <Button
              ref={burgerButtonRef}
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

        {/* Mobile menu */}
        <div
          ref={mobileMenuRef}
          className={cn("md:hidden", isMobileMenuOpen ? "block" : "hidden")}
        >
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-md text-base font-medium group transition-all duration-300",
                    activePath === link.href
                      ? "text-accent bg-accent/10"
                      : "text-gray-600 hover:text-accent hover:bg-accent/10"
                  )}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {Icon && <Icon className="w-5 h-5 text-accent" />}
                  <span className="relative inline-block">
                    {link.label}
                    <span className="absolute bottom-0 left-0 w-full h-0.5 bg-accent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></span>
                  </span>
                </Link>
              );
            })}
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
                <SignedOut>
                  <SignInButton mode="modal">
                    <Button
                      variant="default"
                      className="bg-accent hover:bg-accent/90 text-accent-foreground hover:scale-105 transition-all duration-200 w-full"
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
