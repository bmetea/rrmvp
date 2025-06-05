"use client";

import WinPrizes from "@/components/sections/WinPrizes";
import { PrizeCard } from "@/components/ui/prize-card";
import { usePrizes } from "@/lib/context/prizes-context";

export default function PrizesPage() {
  const { prizes } = usePrizes();

  return (
    <main>
      <WinPrizes>
        {prizes.map((prize) => (
          <div key={prize.id}>
            <PrizeCard prize={prize} category="Cash Prize" />
          </div>
        ))}
      </WinPrizes>
    </main>
  );
}
