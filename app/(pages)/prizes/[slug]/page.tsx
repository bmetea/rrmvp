import { notFound } from "next/navigation";
import PrizePage from "@/components/layout/PrizePage";
import { fetchPrizeBySlug } from "@/app/services/prizeService";
import { Metadata } from "next";

interface PrizePageProps {
  params: Promise<{
    slug: string;
  }>;
}

// Generate metadata for the page
export async function generateMetadata({
  params,
}: PrizePageProps): Promise<Metadata> {
  const { slug } = await params;
  const prize = await fetchPrizeBySlug(slug);

  if (!prize) {
    return {
      title: "Prize Not Found",
    };
  }

  return {
    title: prize.title,
    description: prize.subtitle,
    openGraph: {
      images: [prize.media?.[0]?.formats?.small?.url || ""],
    },
  };
}

// Enable static generation with revalidation
export const revalidate = 3600; // Revalidate every hour

export default async function PrizePageRoute({ params }: PrizePageProps) {
  const { slug } = await params;
  const prize = await fetchPrizeBySlug(slug);

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
