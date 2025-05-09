import { Prize, PrizeResponse } from "@/types/prize";

const API_URL = "http://localhost:1337/api";
const API_TOKEN =
  "ab1990dafb1a6308641f4b25675f227f4c107841d301954d01f1650f54c4234ce31ae51b00aef4cb775b0c6f5a252996b2ac1d5dd0107ed5ee955f79689df1d118a20bb411e64b82d372d71ff5726e4b5f734517485bf035bec908797a3a33f1394c6bff6d30603a38bfbb2c422a6c8d2d9e679f3ae168b6edf8e6bbe5d8a6e6";

export async function fetchPrizes(): Promise<Prize[]> {
  const response = await fetch(`${API_URL}/prizes?populate=media`, {
    headers: {
      Authorization: `Bearer ${API_TOKEN}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch prizes");
  }

  const data: PrizeResponse = await response.json();
  return data.data;
}
