"use client";

import { useAuth } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Package, Trophy } from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = useAuth();
  const pathname = usePathname();

  // Check if the user is the admin
  if (userId !== "user_2yHYTl16QkOq9usCZ4GlQY3vW3Y") {
    redirect("/");
  }

  const navItems = [
    {
      title: "Products",
      href: "/admin/products",
      icon: Package,
    },
    {
      title: "Competitions",
      href: "/admin/competitions",
      icon: Trophy,
    },
  ];

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className="w-64 border-r bg-background">
        <div className="flex h-16 items-center border-b px-6">
          <h2 className="text-lg font-semibold">Admin Dashboard</h2>
        </div>
        <nav className="space-y-1 p-4">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-accent",
                pathname === item.href
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.title}
            </Link>
          ))}
        </nav>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-auto">
        <main className="p-8">{children}</main>
      </div>
    </div>
  );
}
