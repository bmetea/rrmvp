import Hero from "@/components/sections/Hero";
import WinPrizes from "@/components/sections/WinPrizes";
import HowItWorks from "@/components/sections/HowItWorks";
import AboutSection from "@/components/sections/AboutSection";
import { PrizeCard } from "@/components/ui/prize-card";
import { fetchPrizesServer } from "@/app/services/prizeService";
// import { FaqSection } from "@/components/sections/FaqSection";
// import { AnnouncementBanner } from "@/components/sections/AnnouncementBanner";

export default async function Home() {
  const prizes = await fetchPrizesServer();

  return (
    <main>
      <Hero />
      <WinPrizes>
        {prizes.map((prize) => (
          <PrizeCard
            key={prize.id}
            prize={prize}
            category="Cosmetic Enhancement"
          />
        ))}
      </WinPrizes>
      <HowItWorks />
      <AboutSection />
    </main>
  );
}
