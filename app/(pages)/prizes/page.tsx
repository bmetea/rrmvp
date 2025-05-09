"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import Image from "next/image";
import { Prize, PrizeResponse } from "@/types/prize";

export default function PrizesPage() {
  const [prizes, setPrizes] = useState<Prize[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPrizes = async () => {
      try {
        const response = await fetch(
          "http://localhost:1337/api/prizes?populate=media",
          {
            headers: {
              Authorization:
                "Bearer ab1990dafb1a6308641f4b25675f227f4c107841d301954d01f1650f54c4234ce31ae51b00aef4cb775b0c6f5a252996b2ac1d5dd0107ed5ee955f79689df1d118a20bb411e64b82d372d71ff5726e4b5f734517485bf035bec908797a3a33f1394c6bff6d30603a38bfbb2c422a6c8d2d9e679f3ae168b6edf8e6bbe5d8a6e6",
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch prizes");
        }

        const data: PrizeResponse = await response.json();
        setPrizes(data.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchPrizes();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500">Error: {error}</div>
      </div>
    );
  }

  return (
    <main>
      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-5xl font-bold mb-6">Explore our prizes</h2>
            <div className="flex flex-wrap justify-center gap-3 mb-8">
              <button className="px-4 py-2 rounded-full border border-gray-300 bg-white text-gray-700 font-medium hover:bg-gray-100 transition">
                All
              </button>
              <button className="px-4 py-2 rounded-full border border-gray-300 bg-white text-gray-700 font-medium hover:bg-gray-100 transition">
                Cosmetic Enhancement
              </button>
              <button className="px-4 py-2 rounded-full border border-gray-300 bg-white text-gray-700 font-medium hover:bg-gray-100 transition">
                Haircare & Skincare
              </button>
              <button className="px-4 py-2 rounded-full border border-gray-300 bg-white text-gray-700 font-medium hover:bg-gray-100 transition">
                Cash
              </button>
              <button className="px-4 py-2 rounded-full border border-gray-300 bg-white text-gray-700 font-medium hover:bg-gray-100 transition">
                Instant Win
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {prizes.map((prize) => {
              const soldPercentage = Math.round(
                (prize.ticketsSold / prize.ticketsTotal) * 100
              );

              return (
                <Card
                  key={prize.id}
                  className="relative flex flex-col justify-between"
                >
                  {/* Top Banner */}
                  <div className="absolute top-0 left-0 w-full flex items-center bg-[#E19841] text-white text-sm font-medium px-4 py-2 rounded-t-lg z-10">
                    <span className="mr-2">
                      <svg
                        width="18"
                        height="18"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
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
                    {prize.live ? "Live now" : "Coming soon"}
                  </div>
                  <CardHeader className="text-center pt-8 pb-0">
                    <div className="relative w-full h-48 mb-4">
                      <Image
                        src={
                          prize.media?.[0]?.formats?.small?.url
                            ? `http://localhost:1337${prize.media[0].formats.small.url}`
                            : "/placeholder.png"
                        }
                        alt={prize.media?.[0]?.alternativeText || prize.title}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="rounded-lg object-cover"
                        quality={75}
                      />
                    </div>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-2">
                    <span className="inline-block bg-gray-100 text-gray-700 text-xs font-medium rounded px-2 py-1 mb-1 self-start">
                      Cosmetic Enhancement
                    </span>
                    <h3 className="text-lg font-semibold mb-1 text-left">
                      {prize.title}
                    </h3>
                    <p className="text-gray-600 text-sm mb-2 text-left">
                      {prize.subtitle}
                    </p>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex -space-x-2">
                        <Image
                          src={`https://avatar.iran.liara.run/public/${prize.id}-1`}
                          alt="winner1"
                          width={24}
                          height={24}
                          className="rounded-full border-2 border-white"
                        />
                        <Image
                          src={`https://avatar.iran.liara.run/public/${prize.id}-2`}
                          alt="winner2"
                          width={24}
                          height={24}
                          className="rounded-full border-2 border-white"
                        />
                        <Image
                          src={`https://avatar.iran.liara.run/public/${prize.id}-3`}
                          alt="winner3"
                          width={24}
                          height={24}
                          className="rounded-full border-2 border-white"
                        />
                      </div>
                      <span className="text-xs text-gray-500">
                        {prize.ticketsSold}+ tickets sold
                      </span>
                    </div>
                    <Progress
                      value={soldPercentage}
                      className="mb-1"
                      aria-label={`${soldPercentage}% of tickets sold for ${prize.title}`}
                    />
                    <p className="text-right text-xs text-gray-500 mb-2">
                      {soldPercentage}% sold
                    </p>
                  </CardContent>
                  <CardFooter>
                    <Link href={`/prizes/${prize.slug}`} className="w-full">
                      <Button className="w-full bg-indigo-600 hover:bg-indigo-700 flex items-center justify-center gap-2">
                        <svg
                          width="20"
                          height="20"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <path
                            d="M6 6h15l-1.5 9h-13z"
                            stroke="#fff"
                            strokeWidth="2"
                            strokeLinejoin="round"
                          />
                          <circle cx="9" cy="20" r="1" fill="#fff" />
                          <circle cx="18" cy="20" r="1" fill="#fff" />
                        </svg>
                        Enter now →
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </main>
  );
}
