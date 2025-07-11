"use client";

import Image from "next/image";
import { useState } from "react";
import { Ticket, ChevronDown, ChevronUp } from "lucide-react";
import { Progress } from "@/shared/components/ui/progress";
import { CompetitionPrizeDetail } from "./CompetitionPrizeDetail";
import { useCart } from "@/shared/lib/context/cart-context";
import { formatPrice } from "@/shared/lib/utils/price";
import Link from "next/link";
import CompetitionImageCarousel from "./CompetitionImageCarousel";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

// Main component implementation
function CompetitionDetailImpl({ competitionWithPrizes }) {
  const [ticketCount, setTicketCount] = useState(25);
  const [expandedPrize, setExpandedPrize] = useState(null);
  const { addItem } = useCart();
  const ticketPrice = competitionWithPrizes.ticket_price || 0;
  const oldPrice = ticketPrice * 2; // Placeholder for old price logic
  const totalTickets = competitionWithPrizes.total_tickets;
  const ticketsSold = competitionWithPrizes.tickets_sold;
  const ticketsLeft = totalTickets - ticketsSold;
  const progress = Math.round((ticketsSold / totalTickets) * 100);
  const endDate = new Date(competitionWithPrizes.end_date);
  const formattedEndDate = endDate.toLocaleString("en-GB", {
    month: "short",
    day: "numeric",
  });
  const formattedTime = endDate.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const quickSelect = [5, 10, 15, 20, 25, 50];
  const maxTickets = 2500;
  const totalPrice = ticketPrice * ticketCount;
  const prizes = competitionWithPrizes.prizes || [];

  return (
    <div className="max-w-7xl mx-auto py-4 lg:py-8 px-4">
      {/* Mobile Layout */}
      <div className="lg:hidden">
        {/* Competition Image Carousel */}
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
        <div className="bg-white dark:bg-[#18181b] rounded-xl shadow-lg p-4">
          {/* Progress Bar */}
          <div className="mb-4">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-gray-500 dark:text-gray-300">
                {ticketsLeft} Tickets Left
              </span>
              <span className="text-gray-500 dark:text-gray-300">
                {ticketsSold}/{totalTickets}
              </span>
            </div>
            <Progress
              value={progress}
              className="h-3 [&>div]:bg-[#9F68FF] bg-gray-200 dark:bg-[#232326] rounded-full"
            />
            <div className="text-gray-500 dark:text-gray-300 font-bold text-xs mt-0.5">
              {progress}%
            </div>
          </div>

          {/* Quick Ticket Selection */}
          <div className="mb-4">
            <label className="block font-bold text-sm mb-2">
              Select Tickets
            </label>
            <div className="grid grid-cols-3 gap-2">
              {quickSelect.map((num) => (
                <button
                  key={`quick-select-${num}`}
                  onClick={() => setTicketCount(num)}
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
                onChange={(e) => setTicketCount(Number(e.target.value))}
                className="w-full accent-[#E19841]"
              />
              <span className="bg-gray-100 dark:bg-[#232326] px-3 py-1 rounded-lg font-bold text-base text-black dark:text-white min-w-[60px] text-center">
                {ticketCount}
              </span>
            </div>
          </div>

          {/* Total Price */}
          <div className="mb-4">
            <div className="bg-[#F7F7F7] dark:bg-[#232326] rounded-lg px-6 py-4 text-center">
              <p className="font-['Crimson_Pro'] text-[22px] leading-[1.11em] font-medium text-[#151515] dark:text-white mb-1">
                {formatPrice(totalPrice)}
              </p>
              <p className="font-['Open_Sans'] text-[14px] leading-[1.5em] text-[#151515] dark:text-white">
                {ticketCount} Tickets at {formatPrice(ticketPrice)} each
              </p>
            </div>
          </div>

          {/* Add to Cart Button */}
          <button
            className="w-full btn-cta-lg mb-3"
            onClick={() => addItem(competitionWithPrizes, ticketCount)}
          >
            Add To Cart
          </button>

          {/* Free Postal Entry */}
          <Link
            href="/free-postal-entry"
            className="block text-center text-cta hover:text-cta-hover"
          >
            Free Postal Entry Available
          </Link>
        </div>

        {/* Mobile Prizes Section - Hidden for raffle competitions */}
        {competitionWithPrizes.type?.toLowerCase().trim() !== "raffle" &&
          prizes.length > 0 && (
            <div className="border-t border-gray-200 dark:border-[#232326] pt-6">
              <h2 className="text-xl font-bold mb-4">Available Prizes</h2>
              <div className="space-y-3">
                {prizes.map((prize, idx) => (
                  <div
                    key={`${prize.id}-${prize.product?.id || idx}`}
                    className="rounded-lg border border-gray-200 dark:border-[#232326] bg-gray-50 dark:bg-[#18181b] overflow-hidden"
                  >
                    <div className="flex items-center p-3 gap-3">
                      <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-white dark:bg-[#232326] border border-gray-200 dark:border-[#232326]">
                        <Image
                          src={
                            prize.product?.media_info?.images?.[0] ||
                            "/images/placeholder.jpg"
                          }
                          alt={prize.product?.name || "Prize"}
                          width={64}
                          height={64}
                          className="object-cover w-full h-full"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base font-bold mb-1 truncate">
                          {prize.product?.name || "Prize"}
                        </h3>
                        <div className="flex items-center gap-2">
                          <div className="inline-block px-2 py-0.5 rounded bg-[#E5F3FF] text-[#0094FF] text-xs font-bold">
                            {
                              (prize.winning_ticket_numbers || []).filter(
                                (t) =>
                                  !(
                                    prize.claimed_winning_tickets || []
                                  ).includes(t)
                              ).length
                            }{" "}
                            to Win!
                          </div>
                          <div className="text-xs text-gray-500">
                            {(prize.claimed_winning_tickets || []).length}/
                            {prize.total_quantity}
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
                      <CompetitionPrizeDetail
                        winningTickets={prize.winning_ticket_numbers || []}
                        claimedTickets={prize.claimed_winning_tickets || []}
                        description={
                          prize.product.description ||
                          "No description available."
                        }
                        totalPrizes={prize.total_quantity}
                      />
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
            {/* Competition Image Carousel */}
            <CompetitionImageCarousel
              images={competitionWithPrizes.media_info?.images || []}
              title={competitionWithPrizes.title}
            />
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            {/* Main Content Card */}
            <div className="bg-white dark:bg-[#18181b] rounded-2xl shadow-lg p-6">
              {/* Title and End Date */}
              <div className="mb-6">
                <div className="mb-2">
                  <span className="inline-flex items-center justify-center gap-2 bg-[#F4E8D1] px-4 py-1 rounded font-['Open_Sans'] text-[14px] font-semibold leading-[21px] text-[#151515]">
                    Ends {formattedEndDate}
                  </span>
                </div>
                <h1 className="font-['Crimson_Pro'] text-[45px] font-medium text-[#151515] dark:text-white">
                  {competitionWithPrizes.title}
                </h1>
              </div>

              {/* Progress Bar */}
              <div className="mb-4">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-500 dark:text-gray-300">
                    {ticketsLeft} Tickets Left
                  </span>
                  <span className="text-gray-500 dark:text-gray-300">
                    {ticketsSold}/{totalTickets}
                  </span>
                </div>
                <Progress
                  value={progress}
                  className="h-3 [&>div]:bg-[#9F68FF] bg-gray-200 dark:bg-[#232326] rounded-full"
                />
                <div className="text-gray-500 dark:text-gray-300 font-bold text-xs mt-0.5">
                  {progress}%
                </div>
              </div>

              {/* Quick Ticket Selection */}
              <div className="mb-4">
                <label className="block font-bold text-sm mb-2">
                  Select Tickets
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {quickSelect.map((num) => (
                    <button
                      key={`quick-select-${num}`}
                      onClick={() => setTicketCount(num)}
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
                    onChange={(e) => setTicketCount(Number(e.target.value))}
                    className="w-full accent-[#E19841]"
                  />
                  <span className="bg-gray-100 dark:bg-[#232326] px-4 py-2 rounded-lg font-bold text-lg text-black dark:text-white min-w-[80px] text-center">
                    {ticketCount}
                  </span>
                </div>
              </div>

              {/* Total Price */}
              <div className="mb-6">
                <div className="bg-[#F7F7F7] dark:bg-[#232326] rounded-lg px-6 py-4 text-center">
                  <p className="font-['Crimson_Pro'] text-[22px] leading-[1.11em] font-medium text-[#151515] dark:text-white mb-1">
                    {formatPrice(totalPrice)}
                  </p>
                  <p className="font-['Open_Sans'] text-[14px] leading-[1.5em] text-[#151515] dark:text-white">
                    {ticketCount} Tickets at {formatPrice(ticketPrice)} each
                  </p>
                </div>
              </div>

              {/* Add to Cart Button */}
              <button
                className="w-full btn-cta-lg mb-6"
                onClick={() => addItem(competitionWithPrizes, ticketCount)}
              >
                Add To Cart
              </button>

              {/* Free Postal Entry */}
              <Link
                href="/free-postal-entry"
                className="block text-center text-cta hover:text-cta-hover font-medium"
              >
                Free Postal Entry Available
              </Link>
            </div>
          </div>
        </div>

        {/* Full Width Prize Section - Hidden for raffle competitions */}
        {competitionWithPrizes.type?.toLowerCase().trim() !== "raffle" &&
          prizes.length > 0 && (
            <div className="bg-white dark:bg-[#18181b] rounded-2xl shadow-lg p-6">
              <h2 className="text-2xl font-bold mb-6">Available Prizes</h2>
              <div className="space-y-4">
                {prizes.map((prize, idx) => (
                  <div
                    key={`${prize.id}-${prize.product?.id || idx}`}
                    className="rounded-xl border border-gray-200 dark:border-[#232326] bg-gray-50 dark:bg-[#18181b] overflow-hidden"
                  >
                    <div className="flex items-center p-4 gap-4">
                      <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-white dark:bg-[#232326] border border-gray-200 dark:border-[#232326]">
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
                        <h3 className="text-xl font-bold mb-2">
                          {prize.product?.name || "Prize"}
                        </h3>
                        <div className="flex items-center gap-2">
                          <div className="inline-block px-3 py-1 rounded bg-[#E5F3FF] text-[#0094FF] text-sm font-bold">
                            {
                              (prize.winning_ticket_numbers || []).filter(
                                (t) =>
                                  !(
                                    prize.claimed_winning_tickets || []
                                  ).includes(t)
                              ).length
                            }{" "}
                            to Win!
                          </div>
                          <div className="text-sm text-gray-500">
                            {(prize.claimed_winning_tickets || []).length}/
                            {prize.total_quantity}
                          </div>
                        </div>
                      </div>
                      <button
                        className="ml-2 p-3 rounded-lg bg-[#E19841] hover:bg-[#D18A33] text-black transition-colors"
                        onClick={() =>
                          setExpandedPrize(expandedPrize === idx ? null : idx)
                        }
                        aria-label={
                          expandedPrize === idx ? "Collapse" : "Expand"
                        }
                      >
                        {expandedPrize === idx ? (
                          <ChevronUp className="w-6 h-6" />
                        ) : (
                          <ChevronDown className="w-6 h-6" />
                        )}
                      </button>
                    </div>
                    {expandedPrize === idx && (
                      <CompetitionPrizeDetail
                        winningTickets={prize.winning_ticket_numbers || []}
                        claimedTickets={prize.claimed_winning_tickets || []}
                        description={
                          prize.product.description ||
                          "No description available."
                        }
                        totalPrizes={prize.total_quantity}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
      </div>

      {/* Competition Details Section - Visible on both mobile and desktop */}
      <div className="bg-white dark:bg-[#18181b] rounded-lg shadow-md p-4 mt-8">
        <h2 className="text-xl font-bold mb-3">Competition Details</h2>
        <div className="prose prose-zinc dark:prose-invert prose-sm max-w-none">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {competitionWithPrizes.description ||
              "No description available for this competition. Please check the prize details below for more information."}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
}

// Client wrapper component
export default function CompetitionDetail(props) {
  return <CompetitionDetailImpl {...props} />;
}
