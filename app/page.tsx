import Hero from "@/components/sections/Hero";
import HowItWorks from "@/components/sections/HowItWorks";
import AboutSection from "@/components/sections/AboutSection";
import PrizesSection from "@/components/sections/PrizesSection";
import Competitions from "@/components/sections/Competitions";
import { CompetitionCard } from "@/components/ui/competition-card";
import { fetchCompetitionsServer } from "@/app/services/competitionService";

export default async function Home() {
  const competitions = await fetchCompetitionsServer();

  return (
    <main>
      <Hero />
      {/* <PrizesSection /> */}
      <Competitions>
        {competitions.map((competition) => (
          <CompetitionCard
            key={competition.id.toString()}
            competition={competition}
          />
        ))}
      </Competitions>
      <HowItWorks />
      <AboutSection />
    </main>
  );
}
