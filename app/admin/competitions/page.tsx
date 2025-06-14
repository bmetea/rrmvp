"use client";

import { useAuth } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function CompetitionsPage() {
  const { userId } = useAuth();

  // Check if the user is the admin
  if (userId !== "user_2yHYTl16QkOq9usCZ4GlQY3vW3Y") {
    redirect("/");
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Competitions</h1>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Competition
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Competitions List</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Manage your competitions here. You can add, edit, or remove
            competitions.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
