"use client";

import { useEffect, useState, useRef } from "react";
import {
  getUserCompetitionEntries,
  CompetitionEntry,
} from "@/(pages)/user/(server)/entry.service";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { useAnalytics } from "@/shared/hooks";
import { EntryCard } from "./EntryCard";

// Cache for entries data to persist across remounts
let entriesCache: CompetitionEntry[] | null = null;
let cacheTimestamp: number = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export default function MyEntriesPage() {
  const [entries, setEntries] = useState<CompetitionEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const isFetching = useRef(false);
  const { trackPageView } = useAnalytics();

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

  // Track enhanced page view for user entries
  useEffect(() => {
    if (!loading && entries.length > 0) {
      const totalEntries = entries.length;
      const totalTickets = entries.reduce(
        (sum, entry) => sum + entry.tickets.length,
        0
      );
      const totalWinningTickets = entries.reduce(
        (sum, entry) => sum + (entry.winning_tickets?.length || 0),
        0
      );
      const activeCompetitions = entries.filter(
        (entry) => entry.competition.status === "active"
      ).length;
      const competitionTypes = [
        ...new Set(entries.map((entry) => entry.competition.type)),
      ];

      trackPageView("/user/my-entries", {
        total_entries: totalEntries,
        total_tickets: totalTickets,
        total_winning_tickets: totalWinningTickets,
        active_competitions: activeCompetitions,
        competition_types: competitionTypes,
        has_winning_tickets: totalWinningTickets > 0,
        page_type: "user_entries",
      });
    } else if (!loading && entries.length === 0) {
      // Track page view for users with no entries
      trackPageView("/user/my-entries", {
        total_entries: 0,
        total_tickets: 0,
        total_winning_tickets: 0,
        active_competitions: 0,
        competition_types: [],
        has_winning_tickets: false,
        page_type: "user_entries_empty",
      });
    }
  }, [loading, entries, trackPageView]);

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
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        alignSelf: "stretch",
        gap: 16,
        padding: "0px 20px 32px",
      }}
    >
      {entries.map((entry) => (
        <EntryCard key={entry.id} entry={entry} />
      ))}
    </div>
  );
}
