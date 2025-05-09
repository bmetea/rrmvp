import Hero from "@/components/sections/Hero";
import WinPrizes from "@/components/sections/WinPrizes";
import HowItWorks from "@/components/sections/HowItWorks";
import AboutSection from "@/components/sections/AboutSection";
// import { FaqSection } from "@/components/sections/FaqSection";
// import { AnnouncementBanner } from "@/components/sections/AnnouncementBanner";

export default function Home() {
  return (
    <main>
      <Hero />
      <WinPrizes />
      <HowItWorks />
      <AboutSection />
    </main>
  );
}
