"use client";

import Link from "next/link";
import Image from "next/image";
import { generateAvatar } from "@/shared/lib/utils/avatar";
import { Competition } from "@/(pages)/competitions/(server)/competition.service";
import { ArrowRight, Clock } from "lucide-react";
import { formatPrice } from "@/shared/lib/utils/price";

function formatEndDate(dateString: string | Date) {
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
  const day = date.getDate();
  const month = date.toLocaleString("en-GB", { month: "long" });
  return `${day} ${month}`;
}

export function CompetitionCard({ competition }: { competition: Competition }) {
  const soldPercentage =
    competition.tickets_sold != null && competition.total_tickets != null
      ? Math.round(
          (Number(competition.tickets_sold) /
            Number(competition.total_tickets)) *
            100
        )
      : 0;
  const isActive =
    competition.status === "active" &&
    new Date(competition.end_date).getTime() > new Date().getTime();

  // Function to get tag styling based on competition type
  const getTagStyling = (type: string) => {
    const typeValue = type?.toLowerCase() || "";

    switch (typeValue) {
      case "instant_win":
      case "instant win":
        return "bg-[#D7FFD5] text-[#151515] border-[#D7FFD5]";
      case "cash":
        return "bg-[#FFF2E5] text-[#151515] border-[#FFF2E5]";
      case "haircare & skincare":
      case "haircare":
      case "skincare":
        return "bg-[#F3E8FF] text-[#151515] border-[#F3E8FF]";
      case "cosmetic enhancement":
      case "cosmetic":
        return "bg-[#FFF4E1] text-[#151515] border-[#FFF4E1]";
      case "automated draw":
      case "draw":
        return "bg-[#E3F2FD] text-[#151515] border-[#E3F2FD]";
      default:
        return "bg-[#FFF4E1] text-[#151515] border-[#FFF4E1]";
    }
  };

  return (
    <Link href={`/competitions/${competition.id}`} className="block h-full">
      <div className="bg-white rounded-2xl outline outline-2 outline-[#E19841] flex flex-col justify-between items-start overflow-hidden w-full max-w-full md:w-96 md:max-w-96 md:min-w-80 h-full transition-all cursor-pointer">
        {/* Banner */}
        <div
          className="w-full flex items-center justify-center gap-2 py-1 md:py-2"
          style={{ backgroundColor: isActive ? "#E19841" : "#6B7280" }}
        >
          <Clock className="w-5 h-5 md:w-6 md:h-6" />
          <span className="text-neutral-900 text-[16px] md:text-[18px] leading-[150%] font-semibold font-open-sans">
            {`Ends: ${formatEndDate(competition.end_date)}`}
          </span>
        </div>
        {/* Image */}
        <div className="w-full aspect-square relative">
          <Image
            src={
              competition.media_info?.images?.[0] || "/images/placeholder.jpg"
            }
            alt={competition.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover"
            quality={75}
            priority
            fetchPriority="high"
          />
        </div>
        {/* Content */}
        <div className="w-full p-3 flex flex-col items-start gap-2 md:p-6 md:gap-4 flex-1">
          <span
            className={`p-1 rounded text-[12px] leading-[150%] font-semibold md:px-4 md:py-1 md:text-[14px] ${getTagStyling(
              competition.type
            )}`}
          >
            {competition.type}
          </span>
          <div className="w-full flex flex-col items-start gap-1 md:gap-2">
            <h3 className="w-full font-['Crimson_Pro'] text-lg sm:text-xl md:text-[22px] font-medium text-[#151515] leading-tight">
              {competition.title}
            </h3>
          </div>
          {/* Avatars and winners - desktop only - TEMPORARILY HIDDEN */}
          {false && (
            <div className="hidden md:inline-flex justify-start items-center gap-2 w-full">
              <div className="flex items-center">
                {Array.from({ length: 3 }, (_, i) => (
                  <Image
                    key={`winner-${i + 1}`}
                    src={generateAvatar(`${competition.id}-${i + 1}`)}
                    alt={`winner${i + 1}`}
                    width={32}
                    height={32}
                    className="w-8 h-8 rounded-full border-2 border-white -ml-2 first:ml-0"
                    loading="lazy"
                    fetchPriority="low"
                  />
                ))}
              </div>
              <div className="text-zinc-800 text-[14px] leading-[150%] font-normal">
                {competition.tickets_sold != null
                  ? `${Number(competition.tickets_sold)}+ tickets sold`
                  : "No tickets sold yet"}
              </div>
            </div>
          )}

          {/* Button */}
          <div className="w-full pt-2 flex flex-col items-start gap-2 mt-auto">
            {/* Progress bar - desktop only - positioned above button */}
            <div className="hidden md:flex flex-col gap-2 w-full">
              {/* Ticket Price */}
              <div className="text-center">
                <span className="text-zinc-800 text-2xl font-bold">
                  {(competition.ticket_price || 0) === 0 
                    ? "FREE" 
                    : formatPrice(competition.ticket_price || 0)
                  }
                </span>
              </div>
              <div className="w-full h-5 flex items-center gap-3">
                <div className="flex-1 h-2 relative rounded-lg">
                  <div className="absolute left-0 top-0 w-full h-2 bg-neutral-200 rounded-full" />
                  <div
                    className="absolute left-0 top-0 h-2 bg-[#3D2C8D] rounded-full"
                    style={{ width: `${soldPercentage}%` }}
                  />
                </div>
                <div className="text-zinc-800 text-[14px] leading-[150%] font-normal">
                  {soldPercentage}% sold
                </div>
              </div>
            </div>
            <div className="w-full px-5 py-2 bg-[#3D2C8D] hover:bg-[#3D2C8D]/90 rounded-[200px] outline outline-2 outline-offset-[-2px] outline-[#3D2C8D] flex justify-center items-center gap-2 cursor-pointer transition">
              <span className="text-white text-[16px] leading-[150%] font-semibold font-open-sans">
                Enter Now
              </span>
              <ArrowRight className="w-5 h-5 text-white" />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
