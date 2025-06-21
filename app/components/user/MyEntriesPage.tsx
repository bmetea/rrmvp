"use client";

import { useEffect, useState } from "react";
import {
  getUserCompetitionEntries,
  CompetitionEntry,
} from "@/services/competitionEntryService";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";
import Link from "next/link";

export default function MyEntriesPage() {
  const [entries, setEntries] = useState<CompetitionEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEntries = async () => {
      try {
        const result = await getUserCompetitionEntries();
        if (result.success && result.entries) {
          setEntries(result.entries);
        }
      } catch (err) {
        console.error("An error occurred while loading entries", err);
      } finally {
        setLoading(false);
      }
    };

    fetchEntries();
  }, []);

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTicketNumbers = (tickets: CompetitionEntry["tickets"]) => {
    if (tickets.length === 1) {
      return `Ticket #${tickets[0].ticket_number}`;
    }

    if (tickets.length <= 5) {
      return `Tickets #${tickets.map((t) => t.ticket_number).join(", #")}`;
    }

    return `Tickets #${tickets[0].ticket_number}-#${
      tickets[tickets.length - 1].ticket_number
    } (${tickets.length} total)`;
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

  if (entries.length === 0) {
    return (
      <div className="p-4 text-center">
        <p>You haven&apos;t entered any competitions yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4">
      <h2 className="text-xl font-semibold">My Entries</h2>
      <div className="space-y-4">
        {entries.map((entry) => (
          <Link
            key={entry.id}
            href={`/competitions/${entry.competition.id}`}
            className="block"
          >
            <Card className="transition-colors hover:bg-accent">
              <CardContent className="flex items-center gap-4 p-4">
                {entry.competition.media_info?.thumbnail && (
                  <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-md">
                    <Image
                      src={entry.competition.media_info.thumbnail}
                      alt={entry.competition.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <div className="flex-1">
                  <h3 className="font-medium">{entry.competition.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {formatTicketNumbers(entry.tickets)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Purchased on {formatDate(entry.created_at)}
                  </p>
                </div>
                <div className="text-right">
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                      entry.competition.status === "active"
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {entry.competition.status}
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
