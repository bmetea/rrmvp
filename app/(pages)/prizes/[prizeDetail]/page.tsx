"use client";

import { notFound } from "next/navigation";
import { Prize } from "@/types/prize";
import { useSearchParams } from "next/navigation";
import PrizePage from "@/components/layout/PrizePage";

export default function PrizeDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const searchParams = useSearchParams();
  const prizeData = searchParams?.get("data");

  let prize: Prize | null = null;
  if (prizeData) {
    try {
      prize = JSON.parse(decodeURIComponent(prizeData));
    } catch (error) {
      console.error("Error parsing prize data:", error);
    }
  }

  if (!prize) {
    notFound();
  }

  // Transform prize data to match PrizePage props
  const image = prize.media?.[0]?.formats?.medium?.url
    ? `http://localhost:1337${prize.media[0].formats.medium.url}`
    : "/placeholder.png";

  const accordionSections =
    prize.accordionSections?.map((section) => ({
      label: section.label,
      content: <div dangerouslySetInnerHTML={{ __html: section.content }} />,
    })) || [];

  return (
    <PrizePage
      image={image}
      title={prize.title}
      subtitle={prize.subtitle}
      ticketsSold={Math.round((prize.ticketsSold / prize.ticketsTotal) * 100)}
      accordionSections={accordionSections}
    />
  );
}
