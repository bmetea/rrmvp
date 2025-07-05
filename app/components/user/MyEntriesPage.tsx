"use client";

import { useEffect, useState, useRef } from "react";
import {
  getUserCompetitionEntries,
  CompetitionEntry,
} from "@/services/competitionEntryService";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, Trophy } from "lucide-react";
import Image from "next/image";

type ViewMode = "list" | "detail";

// Cache for entries data to persist across remounts
let entriesCache: CompetitionEntry[] | null = null;
let cacheTimestamp: number = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export default function MyEntriesPage() {
  const [entries, setEntries] = useState<CompetitionEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [selectedEntry, setSelectedEntry] = useState<CompetitionEntry | null>(
    null
  );
  const isFetching = useRef(false);

  useEffect(() => {
    const fetchEntries = async () => {
      // Check if we have valid cached data
      const now = Date.now();
      if (entriesCache && now - cacheTimestamp < CACHE_DURATION) {
        setEntries(entriesCache);
        setLoading(false);
        return;
      }

      // Prevent multiple simultaneous API calls
      if (isFetching.current) {
        return;
      }
      isFetching.current = true;
      setLoading(true);

      try {
        const result = await getUserCompetitionEntries();
        if (result.success && result.entries) {
          // Cache the results
          entriesCache = result.entries;
          cacheTimestamp = now;
          setEntries(result.entries);
        }
      } catch (err) {
        console.error("An error occurred while loading entries", err);
      } finally {
        setLoading(false);
        isFetching.current = false;
      }
    };

    fetchEntries();

    // Cleanup function
    return () => {};
  }, []);

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTicketNumbers = (tickets: number[]) => {
    if (tickets.length === 1) {
      return `Ticket #${tickets[0]}`;
    }

    if (tickets.length <= 5) {
      return `Tickets #${tickets.join(", #")}`;
    }

    return `Tickets #${tickets[0]}-#${tickets[tickets.length - 1]} (${
      tickets.length
    } total)`;
  };

  const handleEntryClick = (entry: CompetitionEntry) => {
    setSelectedEntry(entry);
    setViewMode("detail");
  };

  const handleBackToList = () => {
    setViewMode("list");
    setSelectedEntry(null);
  };

  const getWinningTicketsCount = (entry: CompetitionEntry) => {
    return entry.winning_tickets?.length || 0;
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

  // Detail view
  if (viewMode === "detail" && selectedEntry) {
    const winningTicketsCount = getWinningTicketsCount(selectedEntry);
    const hasWinningTickets = winningTicketsCount > 0;

    return (
      <div className="space-y-4 p-4">
        {/* Back button */}
        <Button
          variant="ghost"
          onClick={handleBackToList}
          className="mb-4 -ml-2"
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Back to Entries
        </Button>

        {/* Entry detail */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-start gap-4 mb-6">
              {selectedEntry.competition.media_info?.thumbnail && (
                <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-md">
                  <Image
                    src={selectedEntry.competition.media_info.thumbnail}
                    alt={selectedEntry.competition.title}
                    fill
                    className="object-cover"
                  />
                </div>
              )}
              <div className="flex-1">
                <h2 className="text-xl font-semibold mb-2">
                  {selectedEntry.competition.title}
                </h2>
                <p className="text-sm text-muted-foreground mb-1">
                  Purchased on {formatDate(selectedEntry.created_at)}
                </p>
                <p className="text-sm text-muted-foreground mb-2">
                  {selectedEntry.tickets.length} ticket
                  {selectedEntry.tickets.length > 1 ? "s" : ""} purchased
                </p>
                <span
                  className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                    selectedEntry.competition.status === "active"
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-700"
                  }`}
                >
                  {selectedEntry.competition.status}
                </span>
              </div>
            </div>

            {/* Winning tickets summary */}
            {hasWinningTickets && (
              <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-yellow-600" />
                  <span className="font-medium text-yellow-800">
                    Congratulations! You have {winningTicketsCount} winning
                    ticket{winningTicketsCount > 1 ? "s" : ""} in this
                    competition.
                  </span>
                </div>
              </div>
            )}

            {/* Tickets grid */}
            <div>
              <h3 className="font-medium mb-4">Your Tickets</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                {selectedEntry.tickets.map((ticketNumber) => {
                  const winningTicket = selectedEntry.winning_tickets?.find(
                    (wt) => wt.ticket_number === ticketNumber
                  );
                  const isWinning = !!winningTicket;

                  return (
                    <div
                      key={ticketNumber}
                      className={`p-4 rounded-lg border text-center transition-colors ${
                        isWinning
                          ? "bg-yellow-50 border-yellow-200 shadow-sm"
                          : "bg-background border-border"
                      }`}
                    >
                      <div className="text-lg font-bold mb-2">
                        #{ticketNumber}
                      </div>
                      {isWinning && (
                        <div className="space-y-1">
                          <Badge
                            variant="secondary"
                            className="bg-yellow-100 text-yellow-800 border-yellow-200"
                          >
                            <Trophy className="h-3 w-3 mr-1" />
                            Winner
                          </Badge>
                          <div className="text-xs text-yellow-800 mt-2">
                            <div className="font-medium">
                              {winningTicket.prize_name}
                            </div>
                            <div>
                              Value: £
                              {(winningTicket.prize_value / 100).toFixed(2)}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // List view
  return (
    <div className="space-y-4 p-4">
      <h2 className="text-xl font-semibold">My Entries</h2>
      <div className="space-y-4">
        {entries.map((entry) => {
          const winningTicketsCount = getWinningTicketsCount(entry);
          const hasWinningTickets = winningTicketsCount > 0;

          return (
            <Card
              key={entry.id}
              className="transition-colors hover:bg-accent cursor-pointer"
              onClick={() => handleEntryClick(entry)}
            >
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
                  {hasWinningTickets && (
                    <div className="flex items-center gap-2 mt-1">
                      <Trophy className="h-4 w-4 text-yellow-500" />
                      <span className="text-sm font-medium text-yellow-700">
                        {winningTicketsCount} winning ticket
                        {winningTicketsCount > 1 ? "s" : ""}!
                      </span>
                    </div>
                  )}
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
          );
        })}
      </div>
    </div>
  );
}
