"use client";

import Link from "next/link";
import Image from "next/image";
import { generateAvatar } from "@/shared/lib/utils/avatar";
import { Competition } from "@/(pages)/competitions/(server)/competition.service";
import { ArrowRight } from "lucide-react";

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
        return "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200";
      case "cash":
        return "bg-pink-100 dark:bg-pink-900 text-pink-800 dark:text-pink-200";
      case "haircare & skincare":
      case "haircare":
      case "skincare":
        return "bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200";
      case "cosmetic enhancement":
      case "cosmetic":
        return "bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200";
      case "automated draw":
      case "draw":
        return "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200";
      default:
        return "bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200";
    }
  };

  return (
    <div className="bg-white dark:bg-neutral-900 rounded-2xl outline outline-1 outline-neutral-100 dark:outline-neutral-800 flex flex-col justify-between items-start overflow-hidden w-full max-w-full md:w-96 md:max-w-96 md:min-w-80 h-full">
      {/* Banner */}
      <div
        className="w-full flex items-center justify-center gap-2 py-1 md:py-2"
        style={{ backgroundColor: isActive ? "#E19841" : "#6B7280" }}
      >
        <span className="w-5 h-5 flex items-center justify-center md:w-6 md:h-6">
          <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
            <path
              d="M12 8V12L14.5 13.5"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="2"
            />
          </svg>
        </span>
        <span className="text-neutral-900 dark:text-white text-[16px] md:text-[18px] leading-[150%] font-semibold">
          {`Ends: ${new Date(competition.end_date).toLocaleDateString(
            undefined,
            { month: "long", day: "numeric" }
          )}`}
        </span>
      </div>
      {/* Image */}
      <div className="w-full h-20 relative md:h-60">
        <Image
          src={competition.media_info?.images?.[0] || "/images/placeholder.jpg"}
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
        <span className={`p-1 rounded text-[12px] leading-[150%] font-semibold md:px-4 md:py-1 md:text-[14px] ${getTagStyling(competition.type)}`}>
          {competition.type}
        </span>
        <div className="w-full flex flex-col items-start gap-1 md:gap-2">
          <h3 className="w-full text-neutral-900 dark:text-white text-[20px] md:text-[25px] leading-[150%] font-bold">
            {competition.title}
          </h3>
        </div>
        {/* Avatars and winners - desktop only */}
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
          <div className="text-zinc-800 dark:text-zinc-200 text-[14px] leading-[150%] font-normal">
            {competition.tickets_sold != null
              ? `${Number(competition.tickets_sold)}+ tickets sold`
              : "No tickets sold yet"}
          </div>
        </div>
        {/* Progress bar - desktop only */}
        <div className="hidden md:flex flex-col gap-6 w-full">
          <div className="w-full h-5 flex items-center gap-3">
            <div className="flex-1 h-2 relative rounded-lg">
              <div className="absolute left-0 top-0 w-full h-2 bg-neutral-200 rounded-full" />
              <div
                className="absolute left-0 top-0 h-2 bg-purple-500 rounded-full"
                style={{ width: `${soldPercentage}%` }}
              />
            </div>
            <div className="text-zinc-800 dark:text-zinc-200 text-[14px] leading-[150%] font-normal">
              {soldPercentage}% sold
            </div>
          </div>
        </div>
        {/* Button */}
        <div className="w-full pt-2 flex flex-col items-start gap-2 mt-auto">
          <Link href={`/competitions/${competition.id}`} className="w-full">
            <div className="w-full px-5 py-2 bg-indigo-900 rounded-[200px] outline outline-2 outline-offset-[-2px] outline-indigo-900 flex justify-center items-center gap-2 cursor-pointer transition hover:bg-accent">
              <span className="text-white text-[16px] leading-[150%] font-semibold">
                Enter Now
              </span>
              <ArrowRight className="w-6 h-6 text-white" />
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
