"use client";

import { notFound } from "next/navigation";
import PrizePage from "@/components/layout/PrizePage";
import { usePrizes } from "@/lib/context/prizes-context";
import { use } from "react";

interface PrizePageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default function PrizePageRoute({ params }: PrizePageProps) {
  const { slug } = use(params);
  const { prizes } = usePrizes();
  const prize = prizes.find((p) => p.slug === slug);

  if (!prize) {
    notFound();
  }

  return (
    <PrizePage
      image={prize.media?.[0]?.formats?.small?.url || ""}
      title={prize.title}
      subtitle={prize.subtitle}
      ticketsSold={Math.round((prize.ticketsSold / prize.ticketsTotal) * 100)}
      accordionSections={prize.accordionSections || []}
      prize={prize}
    />
  );
}
