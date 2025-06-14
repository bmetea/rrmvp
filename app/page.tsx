import Hero from "@/components/sections/Hero";
import HowItWorks from "@/components/sections/HowItWorks";
import AboutSection from "@/components/sections/AboutSection";
import { CompetitionList } from "@/components/sections/CompetitionList";
import { fetchCompetitionsServer } from "@/services/competitionService";

export default async function Home() {
  const competitions = await fetchCompetitionsServer();

  return (
    <main>
      <Hero />
      <CompetitionList competitions={competitions} />
      <HowItWorks />
      <AboutSection />
    </main>
  );
}
