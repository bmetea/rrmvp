import {
  fetchCompetitionPrizesServer,
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

  const competition: CompetitionWithPrizes = await fetchCompetitionPrizesServer(
    id
  );

  if (!competition) {
    notFound();
  }

  const mediaInfo = competition.media_info as {
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
      content: competition.description || "No additional details available.",
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
    <CompetitionPage
      competition_id={id}
      image={
        mediaInfo?.thumbnail || mediaInfo?.images?.[0] || "/placeholder.jpg"
      }
      title={competition.title}
      subtitle={`${competition.type} Competition`}
      ticketsSold={Number(competition.tickets_sold)}
      totalTickets={Number(competition.total_tickets)}
      ticketPrice={Number(competition.ticket_price)}
      accordionSections={accordionSections}
      prizes={competition.prizes.map((prize) => ({
        id: String(prize.id),
        name: prize.product.name,
        description: prize.product.description,
        market_value: Number(prize.product.market_value),
        media_info: prize.product.media_info as { images?: string[] } | null,
      }))}
    />
  );
}
