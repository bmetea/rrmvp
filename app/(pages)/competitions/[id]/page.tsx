import {
  fetchCompetitionPrizesServer,
  Competition,
  CompetitionWithPrizes,
} from "@/services/competitionService";
import { notFound } from "next/navigation";
import CompetitionPage from "@/components/layout/CompetitionPage";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function CompetitionPageWrapper({ params }: PageProps) {
  const { id } = await params;

  const competitionWithPrizes: CompetitionWithPrizes = await fetchCompetitionPrizesServer(
    id
  );

  if (!competitionWithPrizes) {
    notFound();
  }

  const mediaInfo = competitionWithPrizes.media_info as {
    images?: string[];
    thumbnail?: string;
  } | null;

  const accordionSections = [
    {
      label: "How to Enter",
      content:
        "Purchase tickets for a chance to win this amazing prize. The more tickets you buy, the better your chances of winning!",
      important: null,
    },
    {
      label: "Prize Details",
      content: competitionWithPrizes.description || "No additional details available.",
      important: null,
    },
    {
      label: "Terms and Conditions",
      content:
        "By entering this competition, you agree to our terms and conditions. The winner will be selected at random from all valid entries.",
      important:
        "Please ensure you read and understand all terms before entering.",
    },
  ];

  return (
    <CompetitionPage competitionWithPrizes={competitionWithPrizes} />
  );
}
