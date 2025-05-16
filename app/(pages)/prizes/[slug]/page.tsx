import { notFound } from "next/navigation";
import { Suspense } from "react";
import PrizePage from "@/components/layout/PrizePage";
import { fetchPrizeBySlug } from "@/app/services/prizeService";
import PrizePageLoading from "./loading";
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

// Enable dynamic rendering with caching
export const dynamic = "force-dynamic";
export const fetchCache = "force-cache";

async function PrizeContent({ slug }: { slug: string }) {
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

export default async function PrizePageRoute({ params }: PrizePageProps) {
  const { slug } = await params;

  return (
    <Suspense fallback={<PrizePageLoading />}>
      <PrizeContent slug={slug} />
    </Suspense>
  );
}
