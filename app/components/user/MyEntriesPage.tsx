"use client";

import { useEffect, useState } from "react";
import { getUserTickets, UserTicket } from "@/services/userDataService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";
import Link from "next/link";

export default function MyEntriesPage() {
  const [tickets, setTickets] = useState<UserTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const result = await getUserTickets();
        if (result.success && result.tickets) {
          setTickets(result.tickets);
        } else {
          setError(result.message || "Failed to load tickets");
        }
      } catch (err) {
        setError("An error occurred while loading tickets");
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, []);

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="space-y-4 p-4">
        <Skeleton className="h-8 w-1/3" />
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-center text-red-500">
        <p>{error}</p>
      </div>
    );
  }

  if (tickets.length === 0) {
    return (
      <div className="p-4 text-center">
        <p>You haven't entered any competitions yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4">
      <h2 className="text-xl font-semibold">My Entries</h2>
      <div className="space-y-4">
        {tickets.map((ticket) => (
          <Link
            key={ticket.id}
            href={`/competitions/${ticket.competition.id}`}
            className="block"
          >
            <Card className="transition-colors hover:bg-accent">
              <CardContent className="flex items-center gap-4 p-4">
                {ticket.competition.media_info?.thumbnail && (
                  <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-md">
                    <Image
                      src={ticket.competition.media_info.thumbnail}
                      alt={ticket.competition.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <div className="flex-1">
                  <h3 className="font-medium">{ticket.competition.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    Ticket #{ticket.ticket_number}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Purchased on {formatDate(ticket.purchase_date)}
                  </p>
                </div>
                <div className="text-right">
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                      ticket.status === "active"
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {ticket.status}
                  </span>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
