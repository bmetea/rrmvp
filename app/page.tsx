import Hero from "@/components/sections/Hero";
import HowItWorks from "@/components/sections/HowItWorks";
import AboutSection from "@/components/sections/AboutSection";
import PrizesSection from "./components/PrizesSection";
import { Suspense } from "react";
// import { FaqSection } from "@/components/sections/FaqSection";
// import { AnnouncementBanner } from "@/components/sections/AnnouncementBanner";

export default function Home() {
  return (
    <main>
      <Hero />
      <Suspense
        fallback={
          <div className="h-[60vh] w-full bg-gradient-to-b from-primary/20 to-background" />
        }
      >
        <PrizesSection />
      </Suspense>
      <HowItWorks />
      <AboutSection />
    </main>
  );
}
