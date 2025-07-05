import { CompetitionList } from "@/shared/components/sections/CompetitionList";
import { fetchCompetitionsServer } from "@/domains/competitions/services/competition.service";

export const dynamic = "force-dynamic";

export default async function CompetitionsPage() {
  const competitions = await fetchCompetitionsServer();

  return (
    <main>
      <CompetitionList
        competitions={competitions}
        title="Explore Prizes"
        showFilters={true}
      />
    </main>
  );
}
