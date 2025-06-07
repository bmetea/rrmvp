import Competitions from "@/components/sections/Competitions";
import { CompetitionCard } from "@/components/ui/competition-card";
import { fetchCompetitionsServer, Competition } from "@/services/competitionService";


export default async function CompetitionsPage() {
  const competitions: Competition[] = await fetchCompetitionsServer();

  return (
    <main>
      <Competitions>
        {competitions.map((competition) => (
          <CompetitionCard
            key={competition.id.toString()}
            competition={competition}
          />
        ))}
      </Competitions>
    </main>
  );
}
