import Hero from "@/shared/components/sections/Hero";
import HowItWorks from "@/shared/components/sections/HowItWorks";
import AboutSection from "@/shared/components/sections/AboutSection";
import { CompetitionList } from "@/shared/components/sections/CompetitionList";
import { fetchCompetitionsServer } from "@/(pages)/competitions/(server)/competition.service";

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
