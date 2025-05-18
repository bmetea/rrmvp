import Hero from "@/components/sections/Hero";
import HowItWorks from "@/components/sections/HowItWorks";
import AboutSection from "@/components/sections/AboutSection";
import PrizesSection from "@/components/sections/PrizesSection";

export default function Home() {
  return (
    <main>
      <Hero />
      <PrizesSection />
      <HowItWorks />
      <AboutSection />
    </main>
  );
}
