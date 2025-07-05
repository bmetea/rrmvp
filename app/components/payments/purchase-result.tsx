"use client";

import { CheckCircle2, Gift, Ticket } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useRouter } from "next/navigation";

interface PurchaseResult {
  competitionId: string;
  success: boolean;
  message: string;
  entryId: string;
  ticketNumbers: number[];
  winningTickets: Array<{
    ticketNumber: number;
    prizeId: string;
  }>;
}

interface PurchaseResultProps {
  isOpen: boolean;
  onClose: () => void;
  results: PurchaseResult[];
  paymentMethod: "wallet" | "card" | "hybrid";
  walletAmount?: number;
  cardAmount?: number;
}

export function PurchaseResult({
  isOpen,
  onClose,
  results,
  paymentMethod,
  walletAmount = 0,
  cardAmount = 0,
}: PurchaseResultProps) {
  const router = useRouter();

  const totalTickets = results.reduce(
    (sum, result) => sum + result.ticketNumbers.length,
    0
  );
  const totalWinningTickets = results.reduce(
    (sum, result) => sum + result.winningTickets.length,
    0
  );

  const formatTicketNumbers = (tickets: number[]) => {
    if (tickets.length <= 5) {
      return tickets.map((t) => `#${t}`).join(", ");
    }
    return `#${tickets[0]} - #${tickets[tickets.length - 1]} (${
      tickets.length
    } total)`;
  };

  const handleViewEntries = () => {
    router.push("/profile");
    onClose();
  };

  const handleContinueShopping = () => {
    router.push("/competitions");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh]">
        <DialogHeader>
          <div className="flex items-center justify-center mb-4">
            <CheckCircle2 className="h-12 w-12 text-green-500" />
          </div>
          <DialogTitle className="text-center text-2xl">
            Purchase Successful!
          </DialogTitle>
          <DialogDescription className="text-center">
            {paymentMethod === "wallet" && "Paid using wallet credit"}
            {paymentMethod === "card" && "Paid using card"}
            {paymentMethod === "hybrid" &&
              `Paid £${(walletAmount / 100).toFixed(2)} using wallet + £${(
                cardAmount / 100
              ).toFixed(2)} using card`}
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <Ticket className="h-5 w-5 text-blue-500" />
              <span className="font-medium">Total Tickets Purchased:</span>
            </div>
            <span className="text-lg font-bold">{totalTickets}</span>
          </div>

          {totalWinningTickets > 0 && (
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <Gift className="h-5 w-5 text-green-500" />
                <span className="font-medium">Winning Tickets:</span>
              </div>
              <span className="text-lg font-bold text-green-500">
                {totalWinningTickets}
              </span>
            </div>
          )}
        </div>

        <Separator className="my-4" />

        <ScrollArea className="max-h-[300px] pr-4">
          {results.map((result, index) => (
            <div key={result.entryId} className="mb-6">
              <h3 className="font-semibold mb-2">Entry {index + 1}</h3>
              <div className="space-y-2 text-sm">
                <p>Tickets: {formatTicketNumbers(result.ticketNumbers)}</p>
                {result.winningTickets.length > 0 && (
                  <p className="text-green-600 font-medium">
                    🎉 Winning tickets:{" "}
                    {formatTicketNumbers(
                      result.winningTickets.map((w) => w.ticketNumber)
                    )}
                  </p>
                )}
              </div>
              {index < results.length - 1 && <Separator className="my-4" />}
            </div>
          ))}
        </ScrollArea>

        <div className="flex justify-between gap-4 mt-6">
          <Button
            variant="outline"
            className="flex-1"
            onClick={handleContinueShopping}
          >
            Continue Shopping
          </Button>
          <Button className="flex-1" onClick={handleViewEntries}>
            View My Entries
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
