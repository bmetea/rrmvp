"use client";

import Image from "next/image";
import { useState } from "react";
import { Ticket } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export default function CompetitionDetail({ competitionWithPrizes }) {
  const [ticketCount, setTicketCount] = useState(25);
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

  return (
    <div className="max-w-lg mx-auto bg-white dark:bg-[#18181b] rounded-2xl shadow-lg overflow-hidden text-black dark:text-white p-0">
      {/* Image */}
      <div className="relative w-full aspect-[16/9]">
        <Image
          src={image}
          alt={competitionWithPrizes.title}
          fill
          className="object-cover"
        />
      </div>
      {/* End date/time banner */}
      <div className="flex items-center gap-2 mt-4 ml-4">
        <span className="bg-[#f3f3f3] dark:bg-[#232326] text-[#E19841] px-4 py-1 rounded-full flex items-center text-sm font-semibold">
          <Ticket className="w-4 h-4 mr-1" /> {formattedEndDate} {formattedTime}
        </span>
      </div>
      {/* Title */}
      <div className="px-6 mt-4">
        <h1 className="text-3xl font-extrabold leading-tight mb-2">
          {competitionWithPrizes.title}
        </h1>
      </div>
      {/* Ticket price */}
      <div className="px-6 flex items-end gap-3 mb-2">
        <span className="text-[#E19841] text-2xl font-extrabold">
          £{ticketPrice.toFixed(2)}
        </span>
      </div>
      {/* Sold vs available metrics */}
      <div className="px-6 mb-2">
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
      {/* Quick ticket selector */}
      <div className="px-6 mt-4 mb-2">
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
      <div className="px-6 mt-2 mb-2">
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
      <div className="px-6 mt-2 mb-2">
        <div className="bg-gray-100 dark:bg-[#232326] text-[#E19841] rounded-lg px-4 py-2 font-bold text-center">
          x {ticketCount} Tickets: £{totalPrice}
        </div>
      </div>
      {/* Add to basket button */}
      <div className="px-6 mt-4 mb-6">
        <button className="w-full bg-[#E19841] hover:bg-[#D18A33] text-black font-extrabold text-lg py-4 rounded-xl transition-colors">
          Add To Basket
        </button>
      </div>
    </div>
  );
}
