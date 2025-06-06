import Competitions from "@/components/sections/Competitions";
import { CompetitionCard } from "@/components/ui/competition-card";
import { fetchCompetitionsServer } from "@/app/services/competitionService";
import type { DB } from "@/db/types";

type CompetitionWithPrizes = DB["competitions"] & {
  prizes: DB["competition_prizes"][];
  media_info?: {
    images: string[];
    thumbnail: string;
  };
  total_tickets: number;
  tickets_sold: number;
  end_date: string | Date;
};

export default async function CompetitionsPage() {
  const competitions = await fetchCompetitionsServer();

  return (
    <main>
      <Competitions>
        {competitions.map((competition) => (
          <CompetitionCard
            key={competition.id.toString()}
            competition={competition as CompetitionWithPrizes}
          />
        ))}
      </Competitions>
    </main>
  );
}
