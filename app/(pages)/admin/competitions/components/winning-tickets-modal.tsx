"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { formatPrice } from "@/lib/utils/price";

interface WinningTicketsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  prize: any;
  phase: number;
  totalTickets: number;
  isRaffle?: boolean;
}

export function WinningTicketsModal({
  open,
  onOpenChange,
  prize,
  phase,
  totalTickets,
  isRaffle = false,
}: WinningTicketsModalProps) {
  if (!prize) return null;

  // Calculate phase boundaries
  const phase1End = Math.floor(totalTickets / 3);
  const phase2Start = phase1End + 1;
  const phase2End = Math.floor((totalTickets * 2) / 3);
  const phase3Start = phase2End + 1;
  const phase3End = totalTickets;

  const getPhaseRange = () => {
    // For raffle competitions, show the full range
    if (isRaffle) {
      return `1-${totalTickets}`;
    }

    switch (phase) {
      case 1:
        return `1-${phase1End}`;
      case 2:
        return `${phase2Start}-${phase2End}`;
      case 3:
        return `${phase3Start}-${phase3End}`;
      default:
        return "N/A";
    }
  };

  const getPhaseDescription = () => {
    if (isRaffle) {
      return "Raffle competition - full ticket range";
    }
    return `Phase ${phase}`;
  };

  const winningTickets = prize.winning_ticket_numbers || [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Winning Ticket Numbers</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <h3 className="font-medium">{prize.name}</h3>
            <p className="text-sm text-muted-foreground">
              {getPhaseDescription()} • {formatPrice(prize.market_value, false)}
            </p>
            <p className="text-xs text-muted-foreground">
              Ticket Range: {getPhaseRange()}
            </p>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">
              Winning Ticket Numbers ({winningTickets.length} total)
            </Label>
            {winningTickets.length > 0 ? (
              <div className="bg-muted p-3 rounded-md">
                <div className="flex flex-wrap gap-1">
                  {winningTickets.map((ticket: number, index: number) => (
                    <span
                      key={index}
                      className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded-md font-mono"
                    >
                      {ticket}
                    </span>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No winning tickets have been generated yet.
              </p>
            )}
          </div>

          <div className="text-xs text-muted-foreground">
            {isRaffle ? (
              <>
                <p>
                  • These ticket numbers were randomly generated across the full
                  ticket range
                </p>
                <p>• Each number is unique</p>
                <p>
                  • Winners are determined when users purchase matching ticket
                  numbers
                </p>
              </>
            ) : (
              <>
                <p>
                  • These ticket numbers were randomly generated within Phase{" "}
                  {phase}
                </p>
                <p>• Each number is unique within this phase</p>
                <p>
                  • Winners are determined when users purchase matching ticket
                  numbers
                </p>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
