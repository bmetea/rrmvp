import Link from 'next/link'
import Image from 'next/image'
import { Button } from "@/components/ui/button"
import { ShoppingCart } from 'lucide-react'
import { cn } from "@/lib/utils"

interface NavbarProps {
  activePath?: string;
}

const navLinks = [
  { href: '/prizes', label: 'Prizes' },
  { href: '/how-it-works', label: 'How it works' },
  { href: '/about', label: 'About us' },
  { href: '/faq', label: 'FAQ' },
]

const Navbar = ({ activePath = '/' }: NavbarProps) => {
  return (
    <nav className="border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center">
              <Image
                src="/text-logo-black.png"
                alt="Radiance Rewards"
                width={120}
                height={32}
                priority
              />
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "text-gray-600 hover:text-gray-900 relative py-2",
                  activePath === link.href && [
                    "text-orange-500",
                    "after:absolute after:bottom-0 after:left-0 after:right-0",
                    "after:h-0.5 after:bg-orange-500"
                  ]
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right side buttons */}
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon">
              <ShoppingCart className="h-5 w-5" />
            </Button>
            <Button variant="default" className="bg-indigo-600 hover:bg-indigo-700">
              Enter now
            </Button>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar 