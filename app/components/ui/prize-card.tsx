"use client";

import Link from "next/link";
import Image from "next/image";
import { Prize } from "@/types/prize";
import { ShoppingCart } from "lucide-react";
import { generateAvatar } from "@/lib/utils/avatar";

interface PrizeCardProps {
  prize: Prize;
  category: string;
}

export function PrizeCard({ prize, category }: PrizeCardProps) {
  const soldPercentage = Math.round(
    (prize.ticketsSold / prize.ticketsTotal) * 100
  );

  return (
    <div className="bg-white dark:bg-neutral-900 rounded-2xl outline outline-1 outline-neutral-100 dark:outline-neutral-800 flex flex-col justify-between items-start overflow-hidden w-full max-w-full md:w-96 md:max-w-96 md:min-w-80 h-full">
      {/* Banner */}
      <div
        className="w-full flex items-center justify-center gap-2 py-1 md:py-2"
        style={{ backgroundColor: "#E19841" }}
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
        <span className="text-neutral-900 dark:text-white text-sm font-semibold leading-tight md:text-lg md:leading-relaxed">
          {prize.live ? "Live now" : "Coming soon"}
        </span>
      </div>
      {/* Image */}
      <div className="w-full h-20 relative md:h-60">
        <Image
          src={prize.media?.[0]?.formats?.small?.url}
          alt={prize.media?.[0]?.alternativeText || prize.title}
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
        <span className="p-1 bg-orange-100 dark:bg-orange-900 rounded text-[10px] font-semibold text-neutral-900 dark:text-white leading-none md:px-4 md:py-1 md:text-sm md:leading-tight">
          {category}
        </span>
        <div className="w-full flex flex-col items-start gap-1 md:gap-2">
          <div className="w-full text-neutral-900 dark:text-white text-base md:text-2xl font-medium leading-normal">
            {prize.title}
          </div>
          <div className="w-full text-zinc-800 dark:text-zinc-200 text-sm md:text-base font-normal leading-normal">
            {prize.subtitle}
          </div>
        </div>
        {/* Avatars and winners - desktop only */}
        <div className="hidden md:inline-flex justify-start items-center gap-2 w-full">
          <div className="flex items-center">
            {Array.from({ length: 3 }, (_, i) => (
              <Image
                key={`winner-${i + 1}`}
                src={generateAvatar(`${prize.id}-${i + 1}`)}
                alt={`winner${i + 1}`}
                width={32}
                height={32}
                className="w-8 h-8 rounded-full border-2 border-white -ml-2 first:ml-0"
                loading="lazy"
                fetchPriority="low"
              />
            ))}
          </div>
          <div className="text-zinc-800 dark:text-zinc-200 text-sm font-normal leading-tight">
            {prize.ticketsSold}+ recent winners
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
            <div className="text-zinc-800 dark:text-zinc-200 text-sm font-normal leading-tight">
              {soldPercentage}% sold
            </div>
          </div>
          {/* Buttons */}
          <div className="w-full flex items-center gap-6">
            <div className="p-3 bg-indigo-900 rounded-[200px] outline outline-2 outline-offset-[-2px] outline-indigo-900 flex justify-center items-center gap-3">
              <ShoppingCart className="w-5 h-5 text-white" />
            </div>
            <Link href={`/prizes/${prize.slug}`} className="flex-1">
              <div className="w-full px-6 py-3 bg-indigo-900 rounded-[200px] outline outline-2 outline-offset-[-2px] outline-indigo-900 flex justify-center items-center gap-2 cursor-pointer">
                <span className="text-white text-base font-semibold leading-normal">
                  Enter now
                </span>
                <svg
                  width="24"
                  height="24"
                  fill="none"
                  viewBox="0 0 24 24"
                  className="w-6 h-6"
                >
                  <path
                    d="M5 12h14M13 6l6 6-6 6"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </Link>
          </div>
        </div>
        {/* Button always at the bottom */}
        <div className="w-full pt-2 flex flex-col items-start gap-2 mt-auto">
          <Link href={`/prizes/${prize.slug}`} className="w-full">
            <div className="w-full px-5 py-2 bg-indigo-900 rounded-[200px] outline outline-2 outline-offset-[-2px] outline-indigo-900 flex justify-center items-center gap-2 cursor-pointer">
              <span className="text-white text-sm font-semibold leading-tight">
                Enter now
              </span>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
