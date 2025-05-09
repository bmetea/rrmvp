"use client";

import { useEffect, useState } from "react";
import { Prize } from "@/types/prize";
import { PrizeCard } from "@/components/ui/prize-card";
import WinPrizes from "@/components/sections/WinPrizes";
import { fetchPrizes } from "@/app/services/prizeService";

export default function PrizesPage() {
  const [prizes, setPrizes] = useState<Prize[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadPrizes = async () => {
      try {
        const data = await fetchPrizes();
        setPrizes(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    void loadPrizes();
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
        {prizes?.map((prize) => (
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
