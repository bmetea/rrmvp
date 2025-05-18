import { Metadata } from "next";
import { fetchPrizeBySlug } from "@/app/services/prizeService";

interface PrizePageProps {
  params: Promise<{
    slug: string;
  }>;
}

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
