"use client";

import { useEffect, useState } from "react";
import { Prize, PrizeResponse } from "@/types/prize";
import { PrizeCard } from "@/components/ui/prize-card";
import WinPrizes from "@/components/sections/WinPrizes";

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
      <WinPrizes>
        {prizes.map((prize) => (
          <PrizeCard
            key={prize.id}
            prize={prize}
            category="Cosmetic Enhancement"
          />
        ))}
      </WinPrizes>
    </main>
  );
}
