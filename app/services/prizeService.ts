import { Prize, PrizeResponse } from "@/types/prize";
import { cache } from "react";

const API_URL = "https://whimsical-leader-0be11697b0.strapiapp.com/api";
const API_TOKEN =
  "57f819fc7d9be9ee629cbc12a5657d83fc39a1a96f0aa4967d3deed537acb8b4edd45f1ef07cb8a10d1add1c4944aed1403c4cee2d9df6b051b1545966758e7ef96a8a29dd6a6bc1b0bdba07016fb3a74608851b9ed857ca6c58d2f867f02eddd650fdbdb475ebfd91a2c1afe933a5f37d09c16544a1e6eb5f1e3a730a8d295a";

// Server-side fetch with caching
export const fetchPrizesServer = cache(async (): Promise<Prize[]> => {
  const response = await fetch(`${API_URL}/prizes?populate=media`, {
    headers: {
      Authorization: `Bearer ${API_TOKEN}`,
      "Cache-Control": "no-cache, no-store, must-revalidate",
      Pragma: "no-cache",
      Expires: "0",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch prizes");
  }

  const data: PrizeResponse = await response.json();
  return data.data;
});

// Client-side fetch
export const fetchPrizes = async (): Promise<Prize[]> => {
  const response = await fetch("/api/prizes", {
    cache: "no-store",
    headers: {
      "Cache-Control": "no-cache, no-store, must-revalidate",
      Pragma: "no-cache",
      Expires: "0",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch prizes");
  }

  return response.json();
};

// Fetch single prize by slug with caching
export const fetchPrizeBySlug = cache(
  async (slug: string): Promise<Prize | null> => {
    const response = await fetch(
      `${API_URL}/prizes?filters[slug][$eq]=${slug}&populate=media`,
      {
        headers: {
          Authorization: `Bearer ${API_TOKEN}`,
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
        cache: "no-store",
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch prize");
    }

    const data: PrizeResponse = await response.json();
    return data.data[0] || null;
  }
);
