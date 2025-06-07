"use client";

import { PrizeCard } from "@/components/ui/prize-card";
import WinPrizes from "@/components/sections/WinPrizes";
import { usePrizes } from "@/lib/context/prizes-context";

export default function PrizesSection() {
  const { prizes } = usePrizes();

  return (
    <WinPrizes>
      {prizes.map((prize) => (
        <PrizeCard
          key={prize.id}
          prize={prize}
          category="Cash Prize"
        />
      ))}
    </WinPrizes>
  );
}
