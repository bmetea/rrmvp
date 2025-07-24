"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Card } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Separator } from "@/shared/components/ui/separator";
import { ScrollArea } from "@/shared/components/ui/scroll-area";
import { CheckCircle2, Gift, Ticket, XCircle, Star } from "lucide-react";
import { formatPrice } from "@/shared/lib/utils/price";
import { useAnalytics } from "@/shared/hooks";
import {
  getCompetitionEntryById,
  CompetitionEntry,
} from "@/app/(pages)/user/(server)/entry.service";
import { EntryCard } from "@/app/(pages)/user/(components)/EntryCard";

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
  const [entryData, setEntryData] = useState<CompetitionEntry[]>([]);
  const [isLoadingEntries, setIsLoadingEntries] = useState(false);
  const router = useRouter();
  const { trackPurchase, trackPageView } = useAnalytics();

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

  // Fetch entry data when purchase summary is loaded
  useEffect(() => {
    const fetchEntryData = async () => {
      if (!purchaseSummary || purchaseSummary.paymentStatus !== "success") {
        return;
      }

      setIsLoadingEntries(true);
      try {
        const entryPromises = purchaseSummary.results.map(async (result) => {
          const entryResponse = await getCompetitionEntryById(result.entryId);
          return entryResponse.success ? entryResponse.entry : null;
        });

        const entries = await Promise.all(entryPromises);
        const validEntries = entries.filter(
          (entry): entry is CompetitionEntry => entry !== null
        );
        setEntryData(validEntries);
      } catch (error) {
        console.error("Error fetching entry data:", error);
      } finally {
        setIsLoadingEntries(false);
      }
    };

    fetchEntryData();
  }, [purchaseSummary]);

  // Track purchase analytics when summary loads
  useEffect(() => {
    if (purchaseSummary && purchaseSummary.paymentStatus === "success") {
      try {
        // Get original cart items from sessionStorage
        const storedItems = sessionStorage.getItem("checkout_items");
        if (storedItems) {
          const originalItems = JSON.parse(storedItems);

          // Calculate total revenue
          const totalRevenue =
            (purchaseSummary.walletAmount || 0) +
            (purchaseSummary.cardAmount || 0);

          // Convert cart items to analytics format
          const analyticsItems = originalItems.map((item: any) => ({
            competitionId: item.competition.id,
            competitionTitle: item.competition.title,
            competitionType: item.competition.type,
            price: item.competition.ticket_price,
            quantity: item.quantity,
            ticketPrice: item.competition.ticket_price,
          }));

          // Generate order ID from entry IDs or use timestamp
          const orderIds = purchaseSummary.results.map(
            (result) => result.entryId
          );
          const orderId =
            orderIds.length > 0 ? orderIds.join("-") : `order_${Date.now()}`;

          // Track the purchase
          trackPurchase({
            orderId,
            revenue: totalRevenue,
            currency: "GBP",
            paymentMethod: purchaseSummary.paymentMethod,
            items: analyticsItems,
            walletAmount: purchaseSummary.walletAmount,
            cardAmount: purchaseSummary.cardAmount,
          });

          // Clear the stored items after tracking
          sessionStorage.removeItem("checkout_items");
        }
      } catch (error) {
        console.error("Error tracking purchase analytics:", error);
      }
    }
  }, [purchaseSummary, trackPurchase]);

  // Track enhanced page view for checkout summary
  useEffect(() => {
    if (purchaseSummary) {
      const totalTickets = purchaseSummary.results.reduce(
        (sum, result) => sum + result.ticketNumbers.length,
        0
      );
      const totalWinningTickets = purchaseSummary.results.reduce(
        (sum, result) => sum + result.winningTickets.length,
        0
      );
      const totalRevenue =
        (purchaseSummary.walletAmount || 0) + (purchaseSummary.cardAmount || 0);

      trackPageView("/checkout/summary", {
        payment_status: purchaseSummary.paymentStatus,
        payment_method: purchaseSummary.paymentMethod,
        total_revenue: totalRevenue / 100, // Convert to pounds
        wallet_amount: (purchaseSummary.walletAmount || 0) / 100,
        card_amount: (purchaseSummary.cardAmount || 0) / 100,
        total_tickets: totalTickets,
        total_winning_tickets: totalWinningTickets,
        competitions_count: purchaseSummary.results.length,
        page_type: "checkout_summary",
      });
    }
  }, [purchaseSummary, trackPageView]);

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
    <div className="container max-w-6xl mx-auto py-8 px-2 sm:px-4">
      <div className="lg:grid lg:grid-cols-3 lg:gap-8">
        {/* Main content */}
        <div className="lg:col-span-2">
          <Card className="p-3 sm:p-6">
            <div className="flex flex-col items-start mb-6 w-full">
              {purchaseSummary.paymentStatus === "success" ? (
                totalWinningTickets > 0 ? (
                  // Winning message
                  <div className="flex flex-col items-start gap-2 w-full">
                    <Star className="w-12 h-12 text-amber-500 fill-amber-500" />
                    <div className="flex flex-col items-start gap-2 w-full">
                      <h1 className="text-[34px] font-medium text-gray-900 leading-tight">
                        Congratulations!
                      </h1>
                      <p className="text-base text-gray-700 leading-6">
                        You have <span className="font-bold">WON</span> one of
                        our instant win prizes!
                      </p>
                    </div>
                  </div>
                ) : (
                  // No winning message
                  <div className="flex flex-col items-start gap-2 w-full">
                    <h1 className="text-[34px] font-medium text-gray-900 leading-tight">
                      Better luck next time..
                    </h1>
                    <p className="text-base text-gray-700 leading-6">
                      Unfortunately, you didn't win this time. Enter another
                      competition to try your luck again.
                    </p>
                  </div>
                )
              ) : (
                // Error state
                <div className="flex flex-col items-center w-full">
                  <XCircle className="h-16 w-16 text-red-500 mb-4" />
                  <h1 className="text-2xl font-bold text-center mb-2">
                    Purchase Failed
                  </h1>
                  {purchaseSummary.paymentMessage && (
                    <p className="text-muted-foreground text-center">
                      {purchaseSummary.paymentMessage}
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className="space-y-6">
              <div className="space-y-4">
                {isLoadingEntries ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
                    <span className="ml-2 text-muted-foreground">
                      Loading entry details...
                    </span>
                  </div>
                ) : entryData.length > 0 ? (
                  <div className="space-y-4 max-h-[500px] overflow-y-auto">
                    {entryData.map((entry) => (
                      <EntryCard key={entry.id} entry={entry} />
                    ))}
                  </div>
                ) : (
                  // Fallback to basic display if entry data couldn't be loaded
                  <ScrollArea className="h-[300px] rounded-md border p-4">
                    {purchaseSummary.results.map((result, index) => (
                      <div key={result.entryId} className="mb-6 last:mb-0">
                        <h3 className="font-semibold mb-2">
                          Entry {index + 1}
                        </h3>
                        <div className="space-y-2 text-sm">
                          <p className="text-muted-foreground font-mono text-xs">
                            Entry ID: {result.entryId}
                          </p>
                          <p>
                            Tickets: {formatTicketNumbers(result.ticketNumbers)}
                          </p>
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
                )}
              </div>

              <div className="flex flex-col sm:flex-row justify-between gap-4 pt-4">
                <Button
                  variant="outline"
                  className="flex-1 w-full sm:w-auto"
                  onClick={handleContinueShopping}
                >
                  Continue Shopping
                </Button>
                <Button
                  className="flex-1 w-full sm:w-auto"
                  onClick={handleViewEntries}
                >
                  View My Entries
                </Button>
              </div>
            </div>
          </Card>
        </div>

        {/* Desktop: Order Summary Sidebar */}
        <div className="hidden lg:block">
          <Card className="p-8">
            <div className="space-y-6">
              <h2 className="text-3xl font-medium text-gray-900">
                Order Summary
              </h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-base font-semibold text-gray-900">
                    Quantity
                  </span>
                  <span className="text-sm text-gray-700">{totalTickets}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-base font-semibold text-gray-900">
                    Total cost
                  </span>
                  <span className="text-sm text-gray-700">
                    {formatPrice(
                      (purchaseSummary.walletAmount || 0) +
                        (purchaseSummary.cardAmount || 0)
                    )}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-base font-semibold text-gray-900">
                    Payment method
                  </span>
                  <span className="text-sm text-gray-700">
                    {purchaseSummary.paymentMethod === "wallet" &&
                      "Wallet credit"}
                    {purchaseSummary.paymentMethod === "card" && "Card payment"}
                    {purchaseSummary.paymentMethod === "hybrid" &&
                      "Wallet + Card"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-base font-semibold text-gray-900">
                    Date
                  </span>
                  <span className="text-sm text-gray-700">
                    {new Date().toLocaleDateString("en-GB", {
                      weekday: "short",
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Mobile: Order Summary */}
      <div className="lg:hidden mt-6">
        <Card className="p-8">
          <div className="space-y-6">
            <h2 className="text-3xl font-medium text-gray-900">
              Order Summary
            </h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-base font-semibold text-gray-900">
                  Quantity
                </span>
                <span className="text-sm text-gray-700">{totalTickets}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-base font-semibold text-gray-900">
                  Total cost
                </span>
                <span className="text-sm text-gray-700">
                  {formatPrice(
                    (purchaseSummary.walletAmount || 0) +
                      (purchaseSummary.cardAmount || 0)
                  )}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-base font-semibold text-gray-900">
                  Payment method
                </span>
                <span className="text-sm text-gray-700">
                  {purchaseSummary.paymentMethod === "wallet" &&
                    "Wallet credit"}
                  {purchaseSummary.paymentMethod === "card" && "Card payment"}
                  {purchaseSummary.paymentMethod === "hybrid" &&
                    "Wallet + Card"}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-base font-semibold text-gray-900">
                  Date
                </span>
                <span className="text-sm text-gray-700">
                  {new Date().toLocaleDateString("en-GB", {
                    weekday: "short",
                    day: "numeric",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
