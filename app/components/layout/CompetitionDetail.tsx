"use client";

import Image from "next/image";
import { useState } from "react";
import { Ticket, ChevronDown, ChevronUp } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { CompetitionPrizeDetail } from "./CompetitionPrizeDetail";

export default function CompetitionDetail({ competitionWithPrizes }) {
  const [ticketCount, setTicketCount] = useState(25);
  const [expandedPrize, setExpandedPrize] = useState(null);
  const ticketPrice = competitionWithPrizes.ticket_price;
  const oldPrice = ticketPrice * 2; // Placeholder for old price logic
  const totalTickets = competitionWithPrizes.total_tickets;
  const ticketsSold = competitionWithPrizes.tickets_sold;
  const ticketsLeft = totalTickets - ticketsSold;
  const progress = Math.round((ticketsSold / totalTickets) * 100);
  const endDate = new Date(competitionWithPrizes.end_date);
  const formattedEndDate = endDate.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
  });
  const formattedTime = endDate.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  });
  const image =
    competitionWithPrizes.media_info?.thumbnail || "/images/placeholder.jpg";
  const quickSelect = [1, 3, 5, 10, 25, 50];
  const discounts = { 3: "-5%", 5: "-10%", 10: "-10%", 25: "-15%", 50: "-20%" };
  const maxTickets = 2500;
  const savings = ((oldPrice - ticketPrice) * ticketCount).toFixed(2);
  const totalPrice = (ticketPrice * ticketCount).toFixed(2);
  const prizes = competitionWithPrizes.prizes || [];

  return (
    <div className="flex flex-col lg:flex-row gap-8 max-w-5xl mx-auto py-8 px-2">
      {/* Left: Image */}
      <div className="w-full lg:w-1/2 flex-shrink-0 flex items-center justify-center">
        <div className="relative w-full aspect-square max-w-lg rounded-2xl overflow-hidden shadow-lg bg-white dark:bg-[#18181b]">
          <Image
            src={image}
            alt={competitionWithPrizes.title}
            fill
            className="object-cover"
          />
        </div>
      </div>
      {/* Right: Details */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center">
        <div className="bg-white dark:bg-[#18181b] rounded-2xl shadow-lg text-black dark:text-white p-6 flex flex-col gap-4">
          {/* End date/time banner */}
          <div className="flex items-center gap-2">
            <span className="bg-[#f3f3f3] dark:bg-[#232326] text-[#E19841] px-4 py-1 rounded-full flex items-center text-sm font-semibold">
              <Ticket className="w-4 h-4 mr-1" /> {formattedEndDate}{" "}
              {formattedTime}
            </span>
          </div>
          {/* Title */}
          <h1 className="text-[45px] md:text-[89px] leading-[120%] md:leading-[90%] font-extrabold mb-1">
            {competitionWithPrizes.title}
          </h1>
          {/* Ticket price */}
          <div className="flex items-end gap-3 mb-2">
            <span className="text-[#E19841] text-[25px] md:text-[35px] leading-[140%] font-extrabold">
              £{ticketPrice.toFixed(2)}
            </span>
          </div>
          {/* Sold vs available metrics */}
          <div>
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
              className="h-4 bg-gray-200 dark:bg-[#232326] rounded-full"
            />
            <div className="text-[#E19841] font-bold text-sm mt-1">
              {progress} %
            </div>
          </div>
          {/* Entry route buttons (placeholder, not functional) */}
          <div className="flex gap-2 mt-2">
            <button className="bg-[#232326] text-white px-4 py-2 rounded-lg font-bold text-sm border border-[#444] dark:border-[#333]">
              Online
            </button>
            <button className="bg-transparent text-gray-400 px-4 py-2 rounded-lg font-bold text-sm border border-[#444] dark:border-[#333] cursor-not-allowed">
              Free Entry Route
            </button>
          </div>
          {/* Quick ticket selector */}
          <div>
            <label className="block font-bold mb-1">Select Tickets</label>
            <div className="grid grid-cols-3 gap-2">
              {quickSelect.map((num) => (
                <button
                  key={num}
                  onClick={() => setTicketCount(num)}
                  className={`w-full px-4 py-2 rounded-lg font-bold text-lg border-2 transition-colors
                    ${
                      ticketCount === num
                        ? "bg-[#E19841] text-black border-[#E19841]"
                        : "bg-gray-100 dark:bg-[#232326] text-black dark:text-white border-gray-100 dark:border-[#232326]"
                    }
                  `}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>
          {/* Slider for number of tickets */}
          <div>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min={1}
                max={maxTickets}
                value={ticketCount}
                onChange={(e) => setTicketCount(Number(e.target.value))}
                className="w-full accent-[#E19841]"
              />
              <span className="bg-gray-100 dark:bg-[#232326] px-3 py-1 rounded-lg font-bold text-lg text-black dark:text-white">
                {ticketCount}
              </span>
            </div>
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>1</span>
              <span>{maxTickets}</span>
            </div>
          </div>
          {/* Total price calculator */}
          <div>
            <div className="bg-gray-100 dark:bg-[#232326] text-[#E19841] rounded-lg px-4 py-2 font-bold text-center">
              x {ticketCount} Tickets: £{totalPrice}
            </div>
          </div>
          {/* Max tickets info */}
          <div className="text-sm text-gray-500 dark:text-gray-400 font-semibold">
            Maximum tickets per user: {maxTickets}
          </div>
          {/* Add to basket button */}
          <div>
            <button className="w-full bg-[#E19841] hover:bg-[#D18A33] text-black font-extrabold text-lg py-4 rounded-xl transition-colors">
              Add To Basket
            </button>
          </div>
          {/* Prizes Accordion */}
          <div className="mt-8">
            <h2 className="text-[35px] md:text-[47px] leading-[140%] md:leading-[130%] font-bold mb-4">
              Prizes
            </h2>
            <div className="flex flex-col gap-3">
              {prizes.map((prize, idx) => {
                const isOpen = expandedPrize === idx;
                return (
                  <div
                    key={prize.id}
                    className={`rounded-xl shadow border border-gray-200 dark:border-[#232326] bg-gray-50 dark:bg-[#18181b] transition-all`}
                  >
                    <div className="flex items-center p-3 gap-3">
                      <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-white dark:bg-[#232326] border border-gray-200 dark:border-[#232326]">
                        <Image
                          src={
                            prize.product.media_info?.images?.[0] ||
                            "/images/placeholder.jpg"
                          }
                          alt={prize.product.name}
                          width={64}
                          height={64}
                          className="object-cover w-full h-full"
                        />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-[20px] md:text-[25px] leading-[150%] font-bold">
                          {prize.product.name}
                        </h3>
                        <div className="inline-block mt-1 px-2 py-0.5 rounded bg-[#E5F3FF] text-[#0094FF] text-[12px] leading-[150%] font-bold">
                          To Be Won
                        </div>
                      </div>
                      <button
                        className={`ml-2 rounded-r-xl px-3 py-3 flex items-center justify-center bg-[#0094FF] hover:bg-[#E19841] transition-colors`}
                        onClick={() => setExpandedPrize(isOpen ? null : idx)}
                        aria-label={isOpen ? "Collapse" : "Expand"}
                        type="button"
                      >
                        {isOpen ? (
                          <ChevronUp className="text-white" />
                        ) : (
                          <ChevronDown className="text-white" />
                        )}
                      </button>
                    </div>
                    {isOpen && (
                      <CompetitionPrizeDetail
                        winningTickets={prize.winning_ticket_numbers || []}
                        claimedTickets={prize.claimed_winning_tickets || []}
                        description={
                          prize.product.description || "No description."
                        }
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
