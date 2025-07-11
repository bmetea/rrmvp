"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Card } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { CheckCircle2, XCircle } from "lucide-react";
import { formatPrice } from "@/shared/lib/utils/price";
import { useAnalytics } from "@/shared/hooks/use-analytics";

interface TicketResult {
  competitionId: string;
  competitionTitle: string;
  ticketNumbers: number[];
  winningTickets: number[];
}

interface PurchaseSummary {
  paymentMethod: "wallet" | "card" | "hybrid";
  walletAmount?: number;
  cardAmount?: number;
  results: TicketResult[];
  paymentStatus: "success" | "failed";
  paymentMessage?: string;
}

export default function CheckoutSummaryPage() {
  const searchParams = useSearchParams();
  const [purchaseSummary, setPurchaseSummary] =
    useState<PurchaseSummary | null>(null);
  const router = useRouter();
  const { trackPurchase } = useAnalytics();

  useEffect(() => {
    // Get summary data from URL state
    const summaryData = searchParams.get("summary");
    if (summaryData) {
      try {
        const decodedSummary = JSON.parse(decodeURIComponent(summaryData));
        setPurchaseSummary(decodedSummary);

        // Track purchase completion if successful
        if (
          decodedSummary.paymentStatus === "success" &&
          decodedSummary.results?.length > 0
        ) {
          const orderId = `order_${Date.now()}`;
          const totalRevenue =
            (decodedSummary.walletAmount || 0) +
            (decodedSummary.cardAmount || 0);

          const purchaseItems = decodedSummary.results.map(
            (result: TicketResult) => ({
              competitionId: result.competitionId,
              competitionTitle: result.competitionTitle,
              competitionType: "competition",
              price: totalRevenue / decodedSummary.results.length, // Distribute price evenly
              quantity: result.ticketNumbers.length,
              ticketPrice:
                totalRevenue /
                decodedSummary.results.reduce(
                  (sum: number, r: TicketResult) =>
                    sum + r.ticketNumbers.length,
                  0
                ),
            })
          );

          trackPurchase({
            orderId,
            revenue: totalRevenue,
            currency: "GBP",
            paymentMethod: decodedSummary.paymentMethod,
            items: purchaseItems,
            walletAmount: decodedSummary.walletAmount,
            cardAmount: decodedSummary.cardAmount,
          });
        }
      } catch (error) {
        console.error("Error parsing summary data:", error);
        router.push("/competitions");
      }
    } else {
      router.push("/competitions");
    }
  }, [searchParams, router, trackPurchase]);

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

          {purchaseSummary.paymentStatus === "success" && (
            <>
              <div className="bg-muted/50 rounded-lg p-4">
                <h2 className="font-semibold mb-2">Summary</h2>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">
                      Total Tickets:
                    </span>
                    <p className="font-medium">{totalTickets}</p>
                  </div>
                  {totalWinningTickets > 0 && (
                    <div>
                      <span className="text-muted-foreground">
                        Winning Tickets:
                      </span>
                      <p className="font-medium text-green-600">
                        {totalWinningTickets}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <h2 className="font-semibold">Your Entries</h2>
                {purchaseSummary.results.map((result, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <h3 className="font-medium mb-2">
                      {result.competitionTitle}
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">
                          Ticket Numbers:
                        </span>
                        <p className="font-mono">
                          {formatTicketNumbers(result.ticketNumbers)}
                        </p>
                      </div>
                      {result.winningTickets.length > 0 && (
                        <div>
                          <span className="text-muted-foreground">
                            Winning Tickets:
                          </span>
                          <p className="font-mono text-green-600">
                            {formatTicketNumbers(result.winningTickets)}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          <div className="flex flex-col gap-3 pt-4">
            {purchaseSummary.paymentStatus === "success" && (
              <Button onClick={handleViewEntries} className="w-full">
                View My Entries
              </Button>
            )}
            <Button
              variant="outline"
              onClick={handleContinueShopping}
              className="w-full"
            >
              Continue Shopping
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
