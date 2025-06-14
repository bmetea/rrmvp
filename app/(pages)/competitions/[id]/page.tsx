import { fetchCompetitionPrizesServer } from "@/services/competitionService";
import { notFound } from "next/navigation";
import CompetitionPage from "@/components/layout/CompetitionPage";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function CompetitionPageWrapper({ params }: PageProps) {
  const { id } = await params;
  const competitionWithPrizes = await fetchCompetitionPrizesServer(id);

  if (!competitionWithPrizes) {
    notFound();
  }

  return <CompetitionPage competitionWithPrizes={competitionWithPrizes} />;
}
