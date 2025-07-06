"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Card } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Separator } from "@/shared/components/ui/separator";
import { ScrollArea } from "@/shared/components/ui/scroll-area";
import { CheckCircle2, Gift, Ticket, XCircle } from "lucide-react";
import { formatPrice } from "@/shared/lib/utils/price";

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

interface PurchaseSummary {
  paymentMethod: "wallet" | "card" | "hybrid";
  walletAmount?: number;
  cardAmount?: number;
  results: PurchaseResult[];
  paymentStatus: "success" | "error";
  paymentMessage?: string;
}

export default function CheckoutSummaryPage() {
  const searchParams = useSearchParams();
  const [purchaseSummary, setPurchaseSummary] =
    useState<PurchaseSummary | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Get summary data from URL state
    const summaryData = searchParams.get("summary");
    if (summaryData) {
      try {
        const decodedSummary = JSON.parse(decodeURIComponent(summaryData));
        setPurchaseSummary(decodedSummary);
      } catch (error) {
        console.error("Error parsing summary data:", error);
        router.push("/competitions");
      }
    } else {
      router.push("/competitions");
    }
  }, [searchParams, router]);

  if (!purchaseSummary) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900" />
      </div>
    );
  }

  const totalTickets = purchaseSummary.results.reduce(
    (sum, result) => sum + result.ticketNumbers.length,
    0
  );
  const totalWinningTickets = purchaseSummary.results.reduce(
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
    router.push("/user/my-entries");
  };

  const handleContinueShopping = () => {
    router.push("/competitions");
  };

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      <Card className="p-6">
        <div className="flex flex-col items-center mb-6">
          {purchaseSummary.paymentStatus === "success" ? (
            <CheckCircle2 className="h-16 w-16 text-green-500 mb-4" />
          ) : (
            <XCircle className="h-16 w-16 text-red-500 mb-4" />
          )}
          <h1 className="text-2xl font-bold text-center mb-2">
            {purchaseSummary.paymentStatus === "success"
              ? "Purchase Complete!"
              : "Purchase Failed"}
          </h1>
          {purchaseSummary.paymentMessage && (
            <p className="text-muted-foreground text-center">
              {purchaseSummary.paymentMessage}
            </p>
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-muted/50 rounded-lg p-4">
            <h2 className="font-semibold mb-2">Payment Details</h2>
            <p className="text-sm text-muted-foreground">
              {purchaseSummary.paymentMethod === "wallet" &&
                "Paid using wallet credit"}
              {purchaseSummary.paymentMethod === "card" &&
                `Paid of ${formatPrice(
                  purchaseSummary.cardAmount!
                )} using card`}
              {purchaseSummary.paymentMethod === "hybrid" &&
                `Paid of ${formatPrice(
                  purchaseSummary.walletAmount!
                )} using wallet + ${formatPrice(
                  purchaseSummary.cardAmount!
                )} using card`}
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Ticket className="h-5 w-5 text-blue-500" />
                <span className="font-medium">Total Tickets:</span>
              </div>
              <span className="text-lg font-bold">{totalTickets}</span>
            </div>

            {totalWinningTickets > 0 && (
              <div className="flex justify-between items-center">
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

          <Separator />

          <div className="space-y-4">
            <h2 className="font-semibold">Purchase Details</h2>
            <ScrollArea className="h-[300px] rounded-md border p-4">
              {purchaseSummary.results.map((result, index) => (
                <div key={result.entryId} className="mb-6 last:mb-0">
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
                  {index < purchaseSummary.results.length - 1 && (
                    <Separator className="my-4" />
                  )}
                </div>
              ))}
            </ScrollArea>
          </div>

          <div className="flex justify-between gap-4 pt-4">
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
        </div>
      </Card>
    </div>
  );
}
