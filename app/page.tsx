import Hero from "@/components/sections/Hero";
import HowItWorks from "@/components/sections/HowItWorks";
import AboutSection from "@/components/sections/AboutSection";
import Competitions from "@/components/sections/Competitions";
import { CompetitionCard } from "@/components/ui/competition-card";
import { fetchCompetitionsServer } from "@/services/competitionService";

export default async function Home() {
  const competitions = await fetchCompetitionsServer();

  return (
    <main>
      <Hero />
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
