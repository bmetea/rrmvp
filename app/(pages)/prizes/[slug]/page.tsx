import { notFound } from "next/navigation";
import PrizePage from "@/components/layout/PrizePage";
import { fetchPrizesServer } from "@/app/services/prizeService";

interface PrizePageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function PrizePageRoute({ params }: PrizePageProps) {
  const { slug } = await params;
  const prizes = await fetchPrizesServer();
  const prize = prizes.find((p) => p.slug === slug);

  if (!prize) {
    notFound();
  }

  return (
    <PrizePage
      image={prize.media?.[0]?.formats?.small?.url}
      title={prize.title}
      subtitle={prize.subtitle}
      ticketsSold={Math.round((prize.ticketsSold / prize.ticketsTotal) * 100)}
      accordionSections={prize.accordionSections || []}
      prize={prize}
    />
  );
}
