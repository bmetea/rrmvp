"use client";

import Link from "next/link";
import Image from "next/image";
import { generateAvatar } from "@/shared/lib/utils/avatar";
import { Competition } from "@/(pages)/competitions/(server)/competition.service";
import { ArrowRight, Clock } from "lucide-react";
import { formatPrice } from "@/shared/lib/utils/price";
import { Progress } from "@/shared/components/ui/progress";

function formatEndDate(dateString: string | Date) {
  const date =
    typeof dateString === "string" ? new Date(dateString) : dateString;
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

  return (
    <Link href={`/competitions/${competition.id}`} className="block h-full">
      <div className="bg-white rounded-2xl outline outline-2 outline-[#E19841] flex flex-col justify-between items-start overflow-hidden w-full max-w-full md:w-96 md:max-w-96 md:min-w-80 h-full transition-all cursor-pointer">
        {/* Banner */}
        <div
          className="w-full flex items-center justify-center gap-2 py-2"
          style={{ backgroundColor: isActive ? "#E19841" : "#6B7280" }}
        >
          <Clock className="w-4 h-4 md:w-5 md:h-5" />
          <span className="text-neutral-900 text-[14px] md:text-[16px] leading-[150%] font-semibold font-open-sans">
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
            {/* Progress bar - visible on both mobile and desktop */}
            <div className="flex flex-col gap-2 w-full">
              {/* Progress section */}
              <div className="w-full">
                {/* Mobile: simplified labels */}
                <div className="flex justify-between text-[10px] md:text-xs mb-1">
                  <span className="text-gray-500 truncate">
                    {competition.total_tickets && competition.tickets_sold
                      ? `${
                          Number(competition.total_tickets) -
                          Number(competition.tickets_sold)
                        } Left`
                      : "Available"}
                  </span>
                  <span className="text-gray-500 text-right">
                    {competition.tickets_sold && competition.total_tickets
                      ? `${competition.tickets_sold}/${competition.total_tickets}`
                      : ""}
                  </span>
                </div>
                <Progress
                  value={soldPercentage}
                  className="h-1.5 md:h-3 [&>div]:bg-[#3D2C8D] bg-gray-200 rounded-full"
                  ariaLabel={`Competition progress: ${soldPercentage}% sold`}
                />
                <div className="text-gray-500 font-bold text-[10px] md:text-xs mt-0.5 md:mt-1 text-center md:text-right">
                  {soldPercentage}% sold
                </div>
              </div>
            </div>
            <div className="w-full px-3 py-1.5 md:px-5 md:py-2 bg-[#3D2C8D] hover:bg-[#3D2C8D]/90 rounded-[200px] outline outline-2 outline-offset-[-2px] outline-[#3D2C8D] flex justify-center items-center gap-1 md:gap-2 cursor-pointer transition">
              <span className="text-white text-[14px] md:text-[16px] leading-[150%] font-semibold font-open-sans">
                Enter for{" "}
                {(competition.ticket_price || 0) === 0
                  ? "FREE"
                  : formatPrice(competition.ticket_price || 0)}
              </span>
              <ArrowRight className="w-4 h-4 md:w-5 md:h-5 text-white" />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
