import { CompetitionList } from "@/shared/components/sections/CompetitionList";
import { fetchCompetitionsServer } from "@/(pages)/competitions/(server)/competition.service";

export const dynamic = "force-dynamic";

export default async function CompetitionsPage() {
  const competitions = await fetchCompetitionsServer();

  return (
    <main>
      <CompetitionList
        competitions={competitions}
        title="Explore Prizes"
      />
    </main>
  );
}
