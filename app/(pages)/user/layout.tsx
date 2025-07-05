"use client";

import { useAuth } from "@clerk/nextjs";
import { redirect } from "next/navigation";

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = useAuth();

  if (!userId) {
    redirect("/sign-in");
  }

  return <div className="min-h-screen bg-background">{children}</div>;
}
