"use client";

import { UserButton } from "@clerk/nextjs";
import { Ticket } from "lucide-react";
import MyEntriesPage from "./MyEntriesPage";

export function CustomUserButton() {
  return (
    <UserButton>
      <UserButton.MenuItems>
        <UserButton.Action
          label="My Entries"
          labelIcon={<Ticket className="w-4 h-4" />}
          open="my-entries"
        />
      </UserButton.MenuItems>

      <UserButton.UserProfilePage
        label="My Entries"
        labelIcon={<Ticket className="w-4 h-4" />}
        url="my-entries"
      >
        <div className="p-6">
          <MyEntriesPage />
        </div>
      </UserButton.UserProfilePage>
    </UserButton>
  );
}
