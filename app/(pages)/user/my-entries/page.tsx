"use client";

import { auth } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import MyEntriesPage from "@/components/user/MyEntriesPage";

export default function EntriesPage() {
  return (
    <div className="container max-w-4xl mx-auto py-8">
      <MyEntriesPage />
    </div>
  );
}
