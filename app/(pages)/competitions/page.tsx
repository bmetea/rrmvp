import Competitions from "@/components/sections/Competitions";
import { CompetitionCard } from "@/components/ui/competition-card";
import { fetchCompetitionsServer } from "@/app/services/competitionService";
import type { DB } from "@/db/types";

type CompetitionWithPrizes = {
  id: string;
  title: string;
  description: string;
  start_date: Date;
  end_date: Date;
  status: string;
  type:string;
  ticket_price: number;
  total_tickets: number;
  tickets_sold: number;
  media_info: {
    images: string[];
    thumbnail: string;
  } | null;
};

export default async function CompetitionsPage() {
  const competitions = await fetchCompetitionsServer();

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
