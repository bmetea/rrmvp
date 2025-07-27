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
  List,
} from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { useState, useEffect, useRef } from "react";

import {
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  useAuth,
} from "@clerk/nextjs";
import { CompetitionCartDialog } from "@/app/(pages)/competitions/(components)/competition-cart-dialog";
import { useAdmin } from "@/shared/hooks/use-admin";
import { CustomUserButton } from "@/app/(pages)/user/(components)/CustomUserButton";
import { useAnalytics } from "@/shared/hooks";

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

  const { userId } = useAuth();
  const { isAdmin } = useAdmin();
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const burgerButtonRef = useRef<HTMLButtonElement>(null);
  const { trackEvent } = useAnalytics();

  // Track mobile menu toggle
  const handleMobileMenuToggle = () => {
    const newState = !isMobileMenuOpen;
    setIsMobileMenuOpen(newState);

    trackEvent("Mobile Menu Toggled", {
      action: newState ? "opened" : "closed",
      current_page: activePath,
    });
  };

  // Track social media clicks
  const handleSocialClick = (platform: string, url: string) => {
    trackEvent("Social Media Link Clicked", {
      platform,
      url,
      location: "navbar",
      current_page: activePath,
    });
  };

  // Track navigation link clicks
  const handleNavLinkClick = (
    href: string,
    label: string,
    isMobile = false
  ) => {
    trackEvent("Navigation Link Clicked", {
      link_text: label,
      link_url: href,
      is_mobile: isMobile,
      current_page: activePath,
    });

    if (isMobile) {
      setIsMobileMenuOpen(false);
    }
  };

  // Track CTA button clicks
  const handleCTAClick = (buttonText: string, isMobile = false) => {
    trackEvent("CTA Button Clicked", {
      button_text: buttonText,
      location: "navbar",
      is_mobile: isMobile,
      current_page: activePath,
    });

    if (isMobile) {
      setIsMobileMenuOpen(false);
    }
  };

  // Track sign-in button clicks
  const handleSignInClick = (isMobile = false) => {
    trackEvent("Sign In Button Clicked", {
      location: "navbar",
      is_mobile: isMobile,
      current_page: activePath,
    });

    if (isMobile) {
      setIsMobileMenuOpen(false);
    }
  };

  // After mounting, we can safely show the theme-dependent logo

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
            <Link
              href="/"
              className="flex items-center"
              onClick={() => handleNavLinkClick("/", "Logo")}
            >
              <Image
                src="/svg/text-logo-black.svg"
                alt="Radiance Rewards"
                width={150}
                height={40}
                priority
                className="h-8 w-auto"
              />
            </Link>
            <div className="flex items-center gap-2">
              <a
                href="https://www.instagram.com/radiance.rewards"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-accent transition-colors"
                onClick={() =>
                  handleSocialClick(
                    "Instagram",
                    "https://www.instagram.com/radiance.rewards"
                  )
                }
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href="https://www.facebook.com/profile.php?id=61573382340671"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-accent transition-colors"
                onClick={() =>
                  handleSocialClick(
                    "Facebook",
                    "https://www.facebook.com/profile.php?id=61573382340671"
                  )
                }
              >
                <Facebook className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Mobile menu button and right side items */}
          <div className="md:hidden flex items-center gap-2">
            {/* Mobile Nav Icons - Match Figma Design */}
            <SignedIn>
              <CustomUserButton />
            </SignedIn>

            <CompetitionCartDialog />

            <Button
              ref={burgerButtonRef}
              variant="ghost"
              size="icon"
              onClick={handleMobileMenuToggle}
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
                  "text-sm font-medium transition-colors hover:text-accent font-sans",
                  activePath === link.href
                    ? "text-foreground"
                    : "text-muted-foreground"
                )}
                onClick={() => handleNavLinkClick(link.href, link.label)}
              >
                {link.label}
              </Link>
            ))}
            {userId && (
              <Link
                href="/user/my-entries"
                className={cn(
                  "text-sm font-medium transition-colors hover:text-accent font-sans",
                  activePath === "/user/my-entries"
                    ? "text-foreground"
                    : "text-muted-foreground"
                )}
                onClick={() =>
                  handleNavLinkClick("/user/my-entries", "My Entries")
                }
              >
                My Entries
              </Link>
            )}
            {isAdmin && (
              <Link
                href="/admin"
                className={cn(
                  "text-sm font-medium transition-colors hover:text-primary font-sans",
                  activePath === "/admin"
                    ? "text-foreground"
                    : "text-muted-foreground"
                )}
                onClick={() => handleNavLinkClick("/admin", "Admin Dashboard")}
              >
                Admin Dashboard
              </Link>
            )}
          </div>

          {/* Right side buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <CompetitionCartDialog />
            <SignedIn>
              <CustomUserButton />
            </SignedIn>
            <SignedOut>
              <SignUpButton mode="modal">
                <Button
                  variant="default"
                  className="bg-[#3D2C8D] hover:bg-[#3D2C8D]/90 text-white hover:scale-105 transition-all duration-200"
                  onClick={() => handleSignInClick(false)}
                >
                  Sign up
                </Button>
              </SignUpButton>
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
            {/* Main Navigation Links */}
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "flex items-center gap-3 px-2 py-3 rounded-lg transition-colors font-sans",
                    activePath === link.href
                      ? "bg-white text-[#E19841]"
                      : "text-[#151515] hover:bg-white/50"
                  )}
                  onClick={() =>
                    handleNavLinkClick(link.href, link.label, true)
                  }
                >
                  <Icon
                    className={cn(
                      "w-6 h-6",
                      activePath === link.href
                        ? "text-[#E19841]"
                        : "text-[#151515]"
                    )}
                    strokeWidth={2}
                  />
                  <span className="text-[16px] font-semibold font-open-sans">
                    {link.label}
                  </span>
                </Link>
              );
            })}

            {/* My Entries Link - For Authenticated Users */}
            {userId && (
              <Link
                href="/user/my-entries"
                className={cn(
                  "flex items-center gap-3 px-2 py-3 rounded-lg transition-colors font-sans",
                  activePath === "/user/my-entries"
                    ? "bg-white text-[#E19841]"
                    : "text-[#151515] hover:bg-white/50"
                )}
                onClick={() =>
                  handleNavLinkClick("/user/my-entries", "My Entries", true)
                }
              >
                <List
                  className={cn(
                    "w-6 h-6",
                    activePath === "/user/my-entries"
                      ? "text-[#E19841]"
                      : "text-[#151515]"
                  )}
                  strokeWidth={2}
                />
                <span className="text-[16px] font-semibold font-open-sans">
                  My Entries
                </span>
              </Link>
            )}

            {/* Admin Dashboard Link */}
            {isAdmin && (
              <Link
                href="/admin"
                className={cn(
                  "flex items-center gap-3 px-2 py-3 rounded-lg transition-colors font-sans",
                  activePath === "/admin"
                    ? "bg-white text-[#E19841]"
                    : "text-[#151515] hover:bg-white/50"
                )}
                onClick={() =>
                  handleNavLinkClick("/admin", "Admin Dashboard", true)
                }
              >
                <Gift
                  className={cn(
                    "w-6 h-6",
                    activePath === "/admin"
                      ? "text-[#E19841]"
                      : "text-[#151515]"
                  )}
                  strokeWidth={2}
                />
                <span className="text-[16px] font-semibold font-open-sans">
                  Admin Dashboard
                </span>
              </Link>
            )}

            {/* Sign Up Button for Non-Authenticated Users */}
            <SignedOut>
              <div className="pt-2">
                <SignUpButton mode="modal">
                  <Button
                    className="w-full bg-[#3D2C8D] hover:bg-[#3D2C8D]/90 text-white border-2 border-[#3D2C8D] rounded-full py-2 px-5 text-[16px] font-semibold font-open-sans"
                    variant="default"
                    onClick={() => handleSignInClick(true)}
                  >
                    Sign up
                  </Button>
                </SignUpButton>
              </div>
            </SignedOut>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
