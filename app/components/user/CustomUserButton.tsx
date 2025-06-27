"use client";

import { UserButton } from "@clerk/nextjs";
import { Ticket } from "lucide-react";
import MyEntriesPage from "./MyEntriesPage";

const TicketIcon = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-4 h-4"
    >
      <path d="M2 9V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v4" />
      <path d="M2 15v4a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-4" />
      <path d="M9 5v14" />
      <path d="M15 5v14" />
    </svg>
  );
};

export function CustomUserButton() {
  return (
    <UserButton>
      <UserButton.MenuItems>
        <UserButton.Action
          label="My Entries"
          labelIcon={<TicketIcon />}
          open="my-entries"
        />
      </UserButton.MenuItems>

      <UserButton.UserProfilePage
        label="My Entries"
        labelIcon={<TicketIcon />}
        url="my-entries"
      >
        <div className="p-6">
          <MyEntriesPage />
        </div>
      </UserButton.UserProfilePage>
    </UserButton>
  );
}
