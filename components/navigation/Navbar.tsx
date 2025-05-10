"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { useTheme } from "next-themes";

interface NavbarProps {
  activePath?: string;
}

const navLinks = [
  { href: "/prizes", label: "Prizes" },
  { href: "/how-it-works", label: "How it works" },
  { href: "/about", label: "About us" },
  { href: "/faq", label: "FAQ" },
];

const Navbar = ({ activePath = "/" }: NavbarProps) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { resolvedTheme } = useTheme();

  return (
    <nav className="border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center">
              <Image
                src={
                  resolvedTheme === "dark"
                    ? "/text-logo-white.svg"
                    : "/text-logo-black.svg"
                }
                alt="Radiance Rewards"
                width={150}
                height={40}
                priority
                className="h-8 w-auto"
              />
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
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
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "text-gray-600 hover:text-gray-900 relative py-2 group transition-all duration-300",
                  activePath === link.href && [
                    "text-orange-500",
                    "after:absolute after:bottom-0 after:left-0 after:right-0",
                    "after:h-0.5 after:bg-orange-500 after:transition-all after:duration-300",
                  ]
                )}
              >
                <span className="relative inline-block">
                  {link.label}
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-orange-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></span>
                </span>
              </Link>
            ))}
          </div>

          {/* Right side buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <ThemeToggle />
            <Button
              variant="ghost"
              size="icon"
              className="hover:scale-110 hover:bg-orange-50 transition-all duration-200"
              aria-label="View shopping cart"
            >
              <ShoppingCart className="h-5 w-5" />
            </Button>
            <Button
              variant="default"
              className="bg-indigo-600 hover:bg-indigo-700 hover:scale-105 transition-all duration-200"
              aria-label="Enter the beauty contest"
            >
              Enter now
            </Button>
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
            <div className="pt-4 pb-3 border-t border-gray-200">
              <div className="flex items-center px-5 space-x-2">
                <ThemeToggle />
                <Button
                  variant="ghost"
                  size="icon"
                  className="hover:scale-110 hover:bg-orange-50 transition-all duration-200"
                >
                  <ShoppingCart className="h-5 w-5" />
                </Button>
                <Button
                  variant="default"
                  className="bg-indigo-600 hover:bg-indigo-700 hover:scale-105 transition-all duration-200 w-full"
                >
                  Enter now
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
