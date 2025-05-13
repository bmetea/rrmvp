"use client";

import { useEffect, useState } from "react";
import { Prize } from "@/types/prize";
import { PrizeCard } from "@/components/ui/prize-card";
import WinPrizes from "@/components/sections/WinPrizes";
import { fetchPrizes } from "@/app/services/prizeService";

export default function PrizesPage() {
  const [prizes, setPrizes] = useState<Prize[]>([]);

  useEffect(() => {
    const loadPrizes = async () => {
      const data = await fetchPrizes();
      setPrizes(data);
    };
    loadPrizes();
  }, []);

  return (
    <main>
      <WinPrizes>
        {prizes.map((prize) => (
          <div key={prize.id}>
            <PrizeCard prize={prize} category="Cosmetic Enhancement" />
          </div>
        ))}
      </WinPrizes>
    </main>
  );
}
