"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import { Badge } from "@/shared/components/ui/badge";
import { Trophy } from "lucide-react";
import { fetchCompetitionEntriesAction } from "../actions";
import { formatPrice } from "@/shared/lib/utils/price";

interface CompetitionEntriesDialogProps {
  competitionId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CompetitionEntriesDialog({
  competitionId,
  open,
  onOpenChange,
}: CompetitionEntriesDialogProps) {
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (open) {
      fetchEntries();
    }
  }, [open, competitionId]);

  const fetchEntries = async () => {
    setLoading(true);
    try {
      const result = await fetchCompetitionEntriesAction(competitionId);
      if (result.success && result.entries) {
        setEntries(result.entries);
      }
    } catch (error) {
      console.error("Failed to fetch entries:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString("en-GB", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatTickets = (tickets: number[]) => {
    if (tickets.length <= 5) {
      return tickets.join(", ");
    }
    return `${tickets.slice(0, 5).join(", ")}... (${tickets.length} total)`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[1000px] h-[90vh]">
        <DialogHeader>
          <DialogTitle>Competition Entries</DialogTitle>
        </DialogHeader>
        <div className="overflow-y-auto flex-1">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              Loading entries...
            </div>
          ) : entries.length === 0 ? (
            <div className="flex items-center justify-center h-32">
              No entries found for this competition.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Tickets</TableHead>
                  <TableHead>Purchase Date</TableHead>
                  <TableHead>Winning Tickets</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {entries.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell>{entry.email}</TableCell>
                    <TableCell>{formatTickets(entry.tickets)}</TableCell>
                    <TableCell>{formatDate(entry.created_at)}</TableCell>
                    <TableCell>
                      {entry.winning_tickets.length > 0 ? (
                        <div className="space-y-1">
                          {entry.winning_tickets.map((ticket: any) => (
                            <div
                              key={ticket.ticket_number}
                              className="flex items-center gap-2"
                            >
                              <Trophy className="h-4 w-4 text-yellow-500" />
                              <span className="text-sm">
                                Ticket {ticket.ticket_number} -{" "}
                                {ticket.prize_name} (
                                {formatPrice(ticket.prize_value)})
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm">
                          No winning tickets
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
