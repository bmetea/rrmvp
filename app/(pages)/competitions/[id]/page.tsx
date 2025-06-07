import {
  fetchCompetitionPrizesServer,
  Competition,
  CompetitionWithPrizes,
} from "@/services/competitionService";
import { notFound } from "next/navigation";
import CompetitionPage from "@/components/layout/CompetitionPage";

interface DynamicCompetitionPageProps {
  dynamicCompetitionPageProps : Competition
}

export default async function CompetitionPageWrapper({ dynamicCompetitionPageProps }: DynamicCompetitionPageProps) {

  const competitionWithPrizes: CompetitionWithPrizes = await fetchCompetitionPrizesServer(
    dynamicCompetitionPageProps.id
  );

  if (!competitionWithPrizes) {
    notFound();
  }

  return (
    <CompetitionPage competitionWithPrizes={competitionWithPrizes} />
  );
}
