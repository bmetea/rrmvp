"use client";

import { useEffect, useState } from "react";
import { Prize } from "@/types/prize";
import { PrizeCard } from "@/components/ui/prize-card";
import WinPrizes from "@/components/sections/WinPrizes";
import { fetchPrizes } from "@/app/services/prizeService";
import { useRouter } from "next/navigation";

export default function PrizesPage() {
  const [prizes, setPrizes] = useState<Prize[]>([]);
  const router = useRouter();

  useEffect(() => {
    const loadPrizes = async () => {
      const data = await fetchPrizes();
      setPrizes(data);
    };
    loadPrizes();
  }, []);

  const handlePrizeClick = (prize: Prize) => {
    // Encode the prize data as a URL-safe string
    const prizeData = encodeURIComponent(JSON.stringify(prize));
    router.push(`/prizes/${prize.slug}?data=${prizeData}`);
  };

  return (
    <main>
      <WinPrizes>
        {prizes.map((prize) => (
          <div
            key={prize.id}
            onClick={() => handlePrizeClick(prize)}
            className="cursor-pointer"
          >
            <PrizeCard prize={prize} category="Cosmetic Enhancement" />
          </div>
        ))}
      </WinPrizes>
    </main>
  );
}
