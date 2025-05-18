import { PrizeCard } from "@/components/ui/prize-card";
import WinPrizes from "@/components/sections/WinPrizes";
import { fetchPrizesServer } from "@/app/services/prizeService";

export default async function PrizesSection() {
  const prizes = await fetchPrizesServer();

  return (
    <WinPrizes>
      {prizes.map((prize) => (
        <PrizeCard
          key={prize.id}
          prize={prize}
          category="Cosmetic Enhancement"
        />
      ))}
    </WinPrizes>
  );
}
