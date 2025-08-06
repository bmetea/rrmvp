"use client";

import Image from "next/image";
import { useState, useEffect, Suspense } from "react";
import { Ticket, ChevronDown, ChevronUp, ArrowRight } from "lucide-react";
import { Progress } from "@/shared/components/ui/progress";
import { useCart } from "@/shared/lib/context/cart-context";
import { formatPrice } from "@/shared/lib/utils/price";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/shared/components/ui/accordion";
import { Button } from "@/shared/components/ui/button";
import { useAnalytics } from "@/shared/hooks";
import dynamic from "next/dynamic";
import { ChunkErrorBoundary } from "@/shared/lib/utils/chunk-retry";

// Dynamic imports for heavy components to reduce initial chunk size
const ReactMarkdown = dynamic(() => import("react-markdown"), {
  loading: () => <div className="animate-pulse bg-gray-200 h-20 rounded"></div>,
  ssr: false,
});

const remarkGfm = dynamic(() => import("remark-gfm"), {
  ssr: false,
});

// Import carousel directly for LCP optimization - don't dynamic import the main image
import CompetitionImageCarousel from "./CompetitionImageCarousel";

const CompetitionPrizeDetail = dynamic(
  () =>
    import("./CompetitionPrizeListDetail").then((mod) => ({
      default: mod.CompetitionPrizeDetail,
    })),
  {
    loading: () => (
      <div className="animate-pulse bg-gray-200 h-40 rounded"></div>
    ),
    ssr: false,
  }
);

// Loading component for markdown content
function MarkdownLoader({ children }: { children: string }) {
  const [remarkGfmPlugin, setRemarkGfmPlugin] = useState<any>(null);

  useEffect(() => {
    import("remark-gfm").then((plugin) => {
      setRemarkGfmPlugin(() => plugin.default);
    });
  }, []);

  if (!remarkGfmPlugin) {
    return <div className="animate-pulse bg-gray-200 h-20 rounded"></div>;
  }

  return (
    <ReactMarkdown remarkPlugins={[remarkGfmPlugin]}>{children}</ReactMarkdown>
  );
}

// Main component implementation
function CompetitionDetailImpl({ competitionWithPrizes }: any) {
  const [ticketCount, setTicketCount] = useState(5);
  const [expandedPrize, setExpandedPrize] = useState<number | null>(null);
  const { addItem } = useCart();
  const { trackCompetitionViewed, trackEvent } = useAnalytics();

  const ticketPrice = competitionWithPrizes.ticket_price || 0;
  const isFreeCompetition = ticketPrice === 0;
  const totalTickets = competitionWithPrizes.total_tickets;
  const ticketsSold = competitionWithPrizes.tickets_sold;
  const ticketsLeft = totalTickets - ticketsSold;
  const progress = Math.round((ticketsSold / totalTickets) * 100);
  const endDate = new Date(competitionWithPrizes.end_date);
  const formattedEndDate = endDate.toLocaleString("en-GB", {
    month: "short",
    day: "numeric",
  });

  // Match original logic
  const quickSelect = [5, 10, 25, 50, 100, 250];
  const maxTickets = Math.min(ticketsLeft, 1000);
  const effectiveTicketCount = isFreeCompetition ? 1 : ticketCount;
  const totalPrice = effectiveTicketCount * ticketPrice;
  const prizes = competitionWithPrizes.prizes || [];

  // State for quiz modal (matching original)
  const [quizOpen, setQuizOpen] = useState(false);
  const [quizAnswer, setQuizAnswer] = useState<string>("");
  const [quizError, setQuizError] = useState<string>("");
  const [pendingAddToCart, setPendingAddToCart] = useState(false);

  // Track competition view
  useEffect(() => {
    trackCompetitionViewed(
      competitionWithPrizes.id,
      competitionWithPrizes.title
    );
  }, [
    competitionWithPrizes.id,
    competitionWithPrizes.title,
    trackCompetitionViewed,
  ]);

  function handleQuizSubmit() {
    if (!quizAnswer) {
      setQuizError("Please select an answer");
      return;
    }

    // Check if answer is correct (hardcoded like in original)
    if (quizAnswer === "London") {
      setQuizOpen(false);
      setQuizError("");

      // Track successful quiz completion
      trackEvent("Competition Quiz Completed", {
        competition_id: competitionWithPrizes.id,
        competition_title: competitionWithPrizes.title,
        answer: quizAnswer,
        success: true,
      });

      setTimeout(() => {
        addItem(competitionWithPrizes, effectiveTicketCount);
        setPendingAddToCart(false);
      }, 100);
    } else {
      setQuizError("Sorry, that is incorrect. Please try again.");

      // Track failed quiz attempt
      trackEvent("Competition Quiz Failed", {
        competition_id: competitionWithPrizes.id,
        competition_title: competitionWithPrizes.title,
        answer: quizAnswer,
        success: false,
      });
    }
  }

  function handleAddToCartClick() {
    // Track entry attempt
    trackEvent("Competition Entry Initiated", {
      competition_id: competitionWithPrizes.id,
      competition_title: competitionWithPrizes.title,
      ticket_count: effectiveTicketCount,
      total_price: totalPrice / 100,
      competition_type: competitionWithPrizes.type,
      is_free_competition: isFreeCompetition,
    });

    if (competitionWithPrizes.type?.toLowerCase().trim() === "raffle") {
      setQuizOpen(true);
      setPendingAddToCart(true);
    } else {
      addItem(competitionWithPrizes, effectiveTicketCount);
    }
  }

  // Track ticket quantity changes (only for paid competitions)
  const handleTicketCountChange = (newCount: number) => {
    if (!isFreeCompetition) {
      setTicketCount(newCount);
      trackEvent("Competition Ticket Quantity Changed", {
        competition_id: competitionWithPrizes.id,
        previous_count: ticketCount,
        new_count: newCount,
        price_difference: ((newCount - ticketCount) * ticketPrice) / 100,
      });
    }
  };

  return (
    <ChunkErrorBoundary>
      <div className="max-w-7xl mx-auto py-4 lg:py-8 px-4">
        {/* Mobile Layout */}
        <div className="lg:hidden">
          {/* Competition Image Carousel - No Suspense for LCP optimization */}
          <div className="mb-4">
            <CompetitionImageCarousel
              images={competitionWithPrizes.media_info?.images || []}
              title={competitionWithPrizes.title}
            />
          </div>

          {/* Title and End Date */}
          <div className="mb-4">
            <div className="mb-2">
              <span className="inline-flex items-center justify-center gap-2 bg-[#F4E8D1] px-4 py-1 rounded font-['Open_Sans'] text-[14px] font-semibold leading-[21px] text-[#151515]">
                Ends {formattedEndDate}
              </span>
            </div>
            <h1 className="font-['Crimson_Pro'] text-[34px] font-medium text-[#151515]">
              {competitionWithPrizes.title}
            </h1>
          </div>

          {/* Mobile Content Card */}
          <div className="bg-white rounded-xl shadow-lg p-4">
            {/* Progress Bar */}
            <div className="mb-4">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-gray-500">
                  {ticketsLeft} Tickets Left
                </span>
                <span className="text-gray-500">
                  {ticketsSold}/{totalTickets}
                </span>
              </div>
              <Progress
                value={progress}
                className="h-3 [&>div]:bg-[#9F68FF] bg-gray-200 rounded-full"
              />
              <div className="text-gray-500 font-bold text-xs mt-0.5">
                {progress}%
              </div>
            </div>

            {/* Ticket Selection - Only show for paid competitions */}
            {!isFreeCompetition && (
              <>
                {/* Quick Ticket Selection */}
                <div className="mb-4">
                  <label className="block font-bold text-sm mb-2">
                    Select Tickets
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {quickSelect.map((num) => (
                      <button
                        key={`quick-select-${num}`}
                        onClick={() => handleTicketCountChange(num)}
                        className={`w-full h-[56px] font-['Open_Sans'] text-[16px] font-semibold leading-[24px] transition-colors
                          ${
                            ticketCount === num
                              ? "bg-[#151515] text-white border-[#151515]"
                              : "bg-[#F7F7F7] text-[#151515] border border-[#313131]"
                          }
                          rounded-lg flex items-center justify-center`}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom Ticket Input */}
                <div className="mb-4">
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min={1}
                      max={maxTickets}
                      value={ticketCount}
                      onChange={(e) =>
                        handleTicketCountChange(Number(e.target.value))
                      }
                      className="w-full accent-[#E19841]"
                    />
                    <span className="bg-gray-100 px-3 py-1 rounded-lg font-bold text-base text-black min-w-[60px] text-center">
                      {ticketCount}
                    </span>
                  </div>
                </div>

                {/* Total Price */}
                <div className="mb-4">
                  <div className="bg-[#F7F7F7] rounded-lg px-6 py-4 text-center">
                    <p className="font-['Crimson_Pro'] text-[22px] leading-[1.11em] font-medium text-[#151515] mb-1">
                      {formatPrice(totalPrice)}
                    </p>
                    <p className="font-['Open_Sans'] text-[14px] leading-[1.5em] text-[#151515]">
                      {effectiveTicketCount} Tickets at{" "}
                      {formatPrice(ticketPrice)} each
                    </p>
                  </div>
                </div>
              </>
            )}

            {/* Free Competition Info */}
            {isFreeCompetition && (
              <div className="mb-4">
                <div className="bg-[#F7F7F7] rounded-lg px-6 py-4 text-center">
                  <p className="font-['Crimson_Pro'] text-[22px] leading-[1.11em] font-medium text-[#151515] mb-1">
                    Free Entry
                  </p>
                  <p className="font-['Open_Sans'] text-[14px] leading-[1.5em] text-[#151515]">
                    1 Free Entry
                  </p>
                </div>
              </div>
            )}

            {/* Add to Cart Button (Mobile) */}
            <Button
              className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-[#3D2C8D] hover:bg-[#3D2C8D]/90 rounded-[200px] outline outline-2 outline-offset-[-2px] outline-[#3D2C8D] font-open-sans font-semibold text-[16px] leading-6 text-white transition"
              style={{
                fontWeight: 600,
                fontFamily: "Open Sans, sans-serif",
                lineHeight: "24px",
              }}
              onClick={handleAddToCartClick}
            >
              <span
                style={{
                  fontWeight: 600,
                  fontFamily: "Open Sans, sans-serif",
                  fontSize: 16,
                  lineHeight: "24px",
                }}
              >
                Enter now
              </span>
              <ArrowRight className="w-5 h-5 text-white" />
            </Button>

            {/* Free Postal Entry */}
            <Link
              href="/free-postal-entry"
              className="block text-center text-cta hover:text-cta-hover mt-4"
              onClick={() =>
                trackEvent("Free Postal Entry Clicked", {
                  competition_id: competitionWithPrizes.id,
                  competition_title: competitionWithPrizes.title,
                  location: "mobile_competition_detail",
                })
              }
            >
              Free Postal Entry Available
            </Link>
          </div>

          {/* Mobile Prizes Section - Hidden for raffle competitions */}
          {competitionWithPrizes.type?.toLowerCase().trim() !== "raffle" &&
            prizes.length > 0 && (
              <div className="border-t border-gray-200 pt-6">
                <h2 className="text-xl font-bold mb-4">Available Prizes</h2>
                <div className="space-y-3">
                  {prizes.map((prize: any, idx: number) => (
                    <div
                      key={`${prize.id}-${prize.product?.id || idx}`}
                      className="rounded-xl border border-gray-200 bg-gray-50 overflow-hidden"
                    >
                      <div className="flex items-center p-4 gap-4">
                        <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-white border border-gray-200">
                          <Image
                            src={
                              prize.product?.media_info?.images?.[0] ||
                              "/images/placeholder.jpg"
                            }
                            alt={prize.product?.name || "Prize"}
                            width={80}
                            height={80}
                            className="object-cover w-full h-full"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-['Crimson_Pro'] text-xl sm:text-2xl lg:text-[35px] font-medium text-[#151515] mb-2 leading-tight">
                            {prize.product?.name || "Prize"}
                          </h3>
                          <div className="flex items-center gap-2">
                            <div className="inline-flex items-center justify-center gap-1 px-3 py-1 sm:px-4 sm:gap-1 bg-[#E19841] rounded-lg">
                              <div className="font-['Crimson_Pro'] text-lg sm:text-xl lg:text-[22px] font-medium text-[#151515] break-words">
                                {
                                  (prize.winning_ticket_numbers || []).filter(
                                    (t: number) =>
                                      !(
                                        prize.claimed_winning_tickets || []
                                      ).includes(t)
                                  ).length
                                }
                              </div>
                              <div className="font-['Open_Sans'] text-sm sm:text-base lg:text-[18px] font-normal leading-[1.5] text-[#313131] break-words">
                                to be won
                              </div>
                            </div>
                          </div>
                        </div>
                        <button
                          className="ml-2 p-2 rounded-lg bg-[#E19841] hover:bg-[#D18A33] text-black transition-colors"
                          onClick={() =>
                            setExpandedPrize(expandedPrize === idx ? null : idx)
                          }
                          aria-label={
                            expandedPrize === idx ? "Collapse" : "Expand"
                          }
                        >
                          {expandedPrize === idx ? (
                            <ChevronUp className="w-5 h-5" />
                          ) : (
                            <ChevronDown className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                      {expandedPrize === idx && (
                        <Suspense
                          fallback={
                            <div className="animate-pulse bg-gray-200 h-40 rounded m-4"></div>
                          }
                        >
                          <CompetitionPrizeDetail
                            winningTickets={prize.winning_ticket_numbers || []}
                            claimedTickets={prize.claimed_winning_tickets || []}
                            description={
                              prize.product.description ||
                              "No description available."
                            }
                            totalPrizes={prize.total_quantity}
                            prizeName={prize.product?.name || "Prize"}
                            isWalletCredit={
                              prize.product?.is_wallet_credit || false
                            }
                          />
                        </Suspense>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
        </div>

        {/* Desktop Two-Column Layout */}
        <div className="hidden lg:flex lg:flex-col gap-8">
          <div className="grid grid-cols-2 gap-8">
            {/* Left Column */}
            <div>
              {/* Competition Image Carousel - No Suspense for LCP optimization */}
              <CompetitionImageCarousel
                images={competitionWithPrizes.media_info?.images || []}
                title={competitionWithPrizes.title}
              />
            </div>

            {/* Right Column */}
            <div className="space-y-8">
              {/* Main Content Card */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                {/* Title and End Date */}
                <div className="mb-6">
                  <div className="mb-2">
                    <span className="inline-flex items-center justify-center gap-2 bg-[#F4E8D1] px-4 py-1 rounded font-['Open_Sans'] text-[14px] font-semibold leading-[21px] text-[#151515]">
                      Ends {formattedEndDate}
                    </span>
                  </div>
                  <h1 className="font-['Crimson_Pro'] text-[45px] font-medium text-[#151515]">
                    {competitionWithPrizes.title}
                  </h1>
                </div>

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-500">
                      {ticketsLeft} Tickets Left
                    </span>
                    <span className="text-gray-500">
                      {ticketsSold}/{totalTickets}
                    </span>
                  </div>
                  <Progress
                    value={progress}
                    className="h-3 [&>div]:bg-[#9F68FF] bg-gray-200 rounded-full"
                  />
                  <div className="text-gray-500 font-bold text-xs mt-0.5">
                    {progress}%
                  </div>
                </div>

                {/* Ticket Selection - Only show for paid competitions */}
                {!isFreeCompetition && (
                  <>
                    {/* Quick Ticket Selection */}
                    <div className="mb-4">
                      <label className="block font-bold text-sm mb-2">
                        Select Tickets
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {quickSelect.map((num) => (
                          <button
                            key={`quick-select-${num}`}
                            onClick={() => handleTicketCountChange(num)}
                            className={`w-full h-[56px] font-['Open_Sans'] text-[16px] font-semibold leading-[24px] transition-colors
                              ${
                                ticketCount === num
                                  ? "bg-[#151515] text-white border-[#151515]"
                                  : "bg-[#F7F7F7] text-[#151515] border border-[#313131]"
                              }
                              rounded-lg flex items-center justify-center`}
                          >
                            {num}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Custom Ticket Input */}
                    <div className="mb-6">
                      <div className="flex items-center gap-4">
                        <input
                          type="range"
                          min={1}
                          max={maxTickets}
                          value={ticketCount}
                          onChange={(e) =>
                            handleTicketCountChange(Number(e.target.value))
                          }
                          className="w-full accent-[#E19841]"
                        />
                        <span className="bg-gray-100 px-4 py-2 rounded-lg font-bold text-lg text-black min-w-[80px] text-center">
                          {ticketCount}
                        </span>
                      </div>
                    </div>

                    {/* Total Price */}
                    <div className="mb-6">
                      <div className="bg-[#F7F7F7] rounded-lg px-6 py-4 text-center">
                        <p className="font-['Crimson_Pro'] text-[22px] leading-[1.11em] font-medium text-[#151515] mb-1">
                          {formatPrice(totalPrice)}
                        </p>
                        <p className="font-['Open_Sans'] text-[14px] leading-[1.5em] text-[#151515]">
                          {effectiveTicketCount} Tickets at{" "}
                          {formatPrice(ticketPrice)} each
                        </p>
                      </div>
                    </div>
                  </>
                )}

                {/* Free Competition Info (Desktop) */}
                {isFreeCompetition && (
                  <div className="mb-6">
                    <div className="bg-[#F7F7F7] rounded-lg px-6 py-4 text-center">
                      <p className="font-['Crimson_Pro'] text-[22px] leading-[1.11em] font-medium text-[#151515] mb-1">
                        Free Entry
                      </p>
                      <p className="font-['Open_Sans'] text-[14px] leading-[1.5em] text-[#151515]">
                        1 Free Entry
                      </p>
                    </div>
                  </div>
                )}

                {/* Add to Cart Button (Desktop) */}
                <Button
                  className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-[#3D2C8D] hover:bg-[#3D2C8D]/90 rounded-[200px] outline outline-2 outline-offset-[-2px] outline-[#3D2C8D] font-open-sans font-semibold text-[16px] leading-6 text-white transition"
                  style={{
                    fontWeight: 600,
                    fontFamily: "Open Sans, sans-serif",
                    lineHeight: "24px",
                  }}
                  onClick={handleAddToCartClick}
                >
                  <span
                    style={{
                      fontWeight: 600,
                      fontFamily: "Open Sans, sans-serif",
                      fontSize: 16,
                      lineHeight: "24px",
                    }}
                  >
                    Enter now
                  </span>
                  <ArrowRight className="w-5 h-5 text-white" />
                </Button>

                {/* Free Postal Entry */}
                <Link
                  href="/free-postal-entry"
                  className="block text-center text-cta hover:text-cta-hover font-medium mt-4"
                  onClick={() =>
                    trackEvent("Free Postal Entry Clicked", {
                      competition_id: competitionWithPrizes.id,
                      competition_title: competitionWithPrizes.title,
                      location: "desktop_competition_detail",
                    })
                  }
                >
                  Free Postal Entry Available
                </Link>
              </div>
            </div>
          </div>

          {/* Full Width Prize Section - Hidden for raffle competitions */}
          {competitionWithPrizes.type?.toLowerCase().trim() !== "raffle" &&
            prizes.length > 0 && (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h2 className="text-2xl font-bold mb-6">Available Prizes</h2>
                <div className="space-y-4">
                  {prizes.map((prize: any, idx: number) => (
                    <div
                      key={`${prize.id}-${prize.product?.id || idx}`}
                      className="rounded-xl border border-gray-200 bg-gray-50 overflow-hidden"
                    >
                      <div className="flex items-center p-4 gap-4">
                        <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-white border border-gray-200">
                          <Image
                            src={
                              prize.product?.media_info?.images?.[0] ||
                              "/images/placeholder.jpg"
                            }
                            alt={prize.product?.name || "Prize"}
                            width={80}
                            height={80}
                            className="object-cover w-full h-full"
                          />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-['Crimson_Pro'] text-xl sm:text-2xl lg:text-[35px] font-medium text-[#151515] mb-2 leading-tight">
                            {prize.product?.name || "Prize"}
                          </h3>
                          <div className="flex items-center gap-2">
                            <div className="inline-flex items-center justify-center gap-1 px-3 py-1 sm:px-4 sm:gap-1 bg-[#E19841] rounded-lg">
                              <div className="font-['Crimson_Pro'] text-lg sm:text-xl lg:text-[22px] font-medium text-[#151515] break-words">
                                {
                                  (prize.winning_ticket_numbers || []).filter(
                                    (t: number) =>
                                      !(
                                        prize.claimed_winning_tickets || []
                                      ).includes(t)
                                  ).length
                                }
                              </div>
                              <div className="font-['Open_Sans'] text-sm sm:text-base lg:text-[18px] font-normal leading-[1.5] text-[#313131] break-words">
                                to be won
                              </div>
                            </div>
                          </div>
                        </div>
                        <button
                          className="ml-2 p-2 rounded-lg bg-[#E19841] hover:bg-[#D18A33] text-black transition-colors"
                          onClick={() =>
                            setExpandedPrize(expandedPrize === idx ? null : idx)
                          }
                          aria-label={
                            expandedPrize === idx ? "Collapse" : "Expand"
                          }
                        >
                          {expandedPrize === idx ? (
                            <ChevronUp className="w-5 h-5" />
                          ) : (
                            <ChevronDown className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                      {expandedPrize === idx && (
                        <Suspense
                          fallback={
                            <div className="animate-pulse bg-gray-200 h-40 rounded m-4"></div>
                          }
                        >
                          <CompetitionPrizeDetail
                            winningTickets={prize.winning_ticket_numbers || []}
                            claimedTickets={prize.claimed_winning_tickets || []}
                            description={
                              prize.product.description ||
                              "No description available."
                            }
                            totalPrizes={prize.total_quantity}
                            prizeName={prize.product?.name || "Prize"}
                            isWalletCredit={
                              prize.product?.is_wallet_credit || false
                            }
                          />
                        </Suspense>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
        </div>

        {/* Quiz Dialog - matches original exactly */}
        {competitionWithPrizes.type?.toLowerCase().trim() === "raffle" && (
          <Dialog
            open={quizOpen}
            onOpenChange={(open) => {
              setQuizOpen(open);
              if (!open) setQuizError("");
            }}
          >
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Skill-based Question</DialogTitle>
              </DialogHeader>
              <div className="mb-4">Where is Big Ben?</div>
              <div className="flex flex-col gap-2 mb-2">
                {["London", "Paris", "Rome", "Berlin"].map((option) => (
                  <Button
                    key={option}
                    variant={quizAnswer === option ? "default" : "outline"}
                    onClick={() => setQuizAnswer(option)}
                    className="w-full"
                  >
                    {option}
                  </Button>
                ))}
              </div>
              {quizError && (
                <div className="text-destructive text-sm mb-2">{quizError}</div>
              )}
              <Button
                className="w-full mt-2"
                onClick={handleQuizSubmit}
                disabled={!quizAnswer}
              >
                Submit
              </Button>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </ChunkErrorBoundary>
  );
}

// Client wrapper component - simplified since we have error boundaries at higher levels
export default function CompetitionDetailOptimized(props: any) {
  return <CompetitionDetailImpl {...props} />;
}
