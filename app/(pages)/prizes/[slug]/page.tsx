import { notFound } from "next/navigation";
import PrizePage from "@/components/layout/PrizePage";
import { fetchPrizeBySlug } from "@/app/services/prizeService";
import { Metadata } from "next";
import PrizePageClient from "./PrizePageClient";

interface PrizePageProps {
  params: {
    slug: string;
  };
}

// Generate metadata for the page
export async function generateMetadata({
  params,
}: PrizePageProps): Promise<Metadata> {
  const prize = await fetchPrizeBySlug(params.slug);

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
  const prize = await fetchPrizeBySlug(params.slug);

  if (!prize) {
    notFound();
  }

  return <PrizePageClient prize={prize} />;
}
