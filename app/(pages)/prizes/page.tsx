"use client";

import { useEffect, useState } from "react";
import { Prize, PrizeResponse } from "@/types/prize";
import { PrizeCard } from "@/components/ui/prize-card";

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
            {prizes.map((prize) => (
              <PrizeCard
                key={prize.id}
                prize={prize}
                category="Cosmetic Enhancement"
              />
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
