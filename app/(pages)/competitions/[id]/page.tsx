import {
  fetchCompetitionPrizesServer,
  CompetitionWithPrizes,
} from "@/services/competitionService";
import { notFound } from "next/navigation";
import CompetitionPage from "@/components/layout/CompetitionPage";

interface PageProps {
  params: {
    id: string;
  };
}

export default async function CompetitionPageWrapper({ params }: PageProps) {
  const competitionWithPrizes = await fetchCompetitionPrizesServer(params.id);

  if (!competitionWithPrizes) {
    notFound();
  }

  return <CompetitionPage competitionWithPrizes={competitionWithPrizes} />;
}
