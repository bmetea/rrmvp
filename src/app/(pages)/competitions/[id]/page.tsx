import { fetchCompetitionPrizesServer } from "@/(pages)/competitions/(server)/competition.service";
import { notFound } from "next/navigation";
import CompetitionDetail from "@/(pages)/competitions/(components)/CompetitionDetail";

export const dynamic = "force-dynamic";

interface PageProps {
  params: {
    id: string;
  };
}

export default async function CompetitionPageWrapper({ params }: PageProps) {
  const { id } = await params;
  const competitionWithPrizes = await fetchCompetitionPrizesServer(id);

  if (!competitionWithPrizes) {
    notFound();
  }

  return <CompetitionDetail competitionWithPrizes={competitionWithPrizes} />;
}
