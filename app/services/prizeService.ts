import { Prize, PrizeResponse } from "@/types/prize";
import { cache } from "react";

// Use NEXT_PUBLIC_ prefixed variables for client-side access
const API_URL = process.env.NEXT_PUBLIC_STRAPI_API_URL;
const API_TOKEN = process.env.NEXT_PUBLIC_STRAPI_API_TOKEN;


// Server-side fetch with caching
export const fetchPrizesServer = cache(async (): Promise<Prize[]> => {
  const url = `${API_URL}/prizes?populate=media`;
  console.log("Fetching from:", url); // Debug log

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${API_TOKEN}`,
    },
    next: { revalidate: 3600 }, // Revalidate every hour
  });

  if (!response.ok) {
    console.error(
      "Failed to fetch prizes:",
      response.status,
      response.statusText
    );
    throw new Error("Failed to fetch prizes");
  }

  const data: PrizeResponse = await response.json();
  return data.data;
});

// Client-side fetch
export const fetchPrizes = async (): Promise<Prize[]> => {
  const url = `${API_URL}/prizes?populate=media`;
  console.log("Fetching from:", url); // Debug log

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${API_TOKEN}`,
    },
    credentials: "include",
  });

  if (!response.ok) {
    console.error(
      "Failed to fetch prizes:",
      response.status,
      response.statusText
    );
    throw new Error("Failed to fetch prizes");
  }

  const data: PrizeResponse = await response.json();
  return data.data;
};

// Fetch single prize by slug with caching
export const fetchPrizeBySlug = cache(
  async (slug: string): Promise<Prize | null> => {
    const url = `${API_URL}/prizes?filters[slug][$eq]=${slug}&populate=media`;
    console.log("Fetching from:", url); // Debug log

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${API_TOKEN}`,
      },
      next: { revalidate: 3600 }, // Revalidate every hour
    });

    if (!response.ok) {
      console.error(
        "Failed to fetch prize:",
        response.status,
        response.statusText
      );
      throw new Error("Failed to fetch prize");
    }

    const data: PrizeResponse = await response.json();
    return data.data[0] || null;
  }
);
