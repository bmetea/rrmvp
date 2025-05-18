"use client";

import PrizePage from "@/components/layout/PrizePage";
import { Prize } from "@/types/prize";

interface PrizePageClientProps {
  prize: Prize;
}

export default function PrizePageClient({ prize }: PrizePageClientProps) {
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
