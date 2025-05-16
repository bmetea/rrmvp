import WinPrizes from "@/components/sections/WinPrizes";
import { PrizeCard } from "@/components/ui/prize-card";
import { fetchPrizesServer } from "@/app/services/prizeService";

export default async function PrizesPage() {
  const prizes = await fetchPrizesServer();

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
