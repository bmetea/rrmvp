"use client";

import { useState } from "react";
import { Button } from "@/shared/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import { Pencil, Plus, ListFilter } from "lucide-react";
import type { Competition } from "@/(pages)/competitions/(server)/competition.service";
import { CompetitionDialog } from "./competition-dialog";
import { CompetitionEntriesDialog } from "./components/competition-entries-dialog";
import { formatPrice } from "@/shared/lib/utils/price";

interface CompetitionsClientProps {
  competitions: Competition[];
}

export function CompetitionsClient({ competitions }: CompetitionsClientProps) {
  const [selectedCompetition, setSelectedCompetition] =
    useState<Competition | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [entriesDialogOpen, setEntriesDialogOpen] = useState(false);
  const [selectedCompetitionForEntries, setSelectedCompetitionForEntries] =
    useState<string | null>(null);

  const handleEditClick = (competition: Competition) => {
    setSelectedCompetition(competition);
    setDialogOpen(true);
  };

  const handleAddClick = () => {
    setSelectedCompetition(null);
    setDialogOpen(true);
  };

  const handleViewEntriesClick = (competitionId: string) => {
    setSelectedCompetitionForEntries(competitionId);
    setEntriesDialogOpen(true);
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

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Competitions</h1>
        <Button onClick={handleAddClick}>
          <Plus className="mr-2 h-4 w-4" />
          Add Competition
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Ticket Price</TableHead>
            <TableHead>Total Tickets</TableHead>
            <TableHead>Tickets Sold</TableHead>
            <TableHead>End Date</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {competitions.map((competition) => (
            <TableRow key={competition.id}>
              <TableCell>{competition.title}</TableCell>
              <TableCell>{competition.type}</TableCell>
              <TableCell>{formatPrice(competition.ticket_price)}</TableCell>
              <TableCell>{competition.total_tickets}</TableCell>
              <TableCell>{competition.tickets_sold}</TableCell>
              <TableCell>{formatDate(competition.end_date)}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEditClick(competition)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleViewEntriesClick(competition.id)}
                  >
                    <ListFilter className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <CompetitionDialog
        competition={selectedCompetition}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />

      {selectedCompetitionForEntries && (
        <CompetitionEntriesDialog
          competitionId={selectedCompetitionForEntries}
          open={entriesDialogOpen}
          onOpenChange={setEntriesDialogOpen}
        />
      )}
    </div>
  );
}
