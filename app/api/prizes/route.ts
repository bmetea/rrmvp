import { NextResponse } from "next/server";
import { PrizeResponse } from "@/types/prize";

const API_URL = "https://whimsical-leader-0be11697b0.strapiapp.com/api";
const API_TOKEN =
  "57f819fc7d9be9ee629cbc12a5657d83fc39a1a96f0aa4967d3deed537acb8b4edd45f1ef07cb8a10d1add1c4944aed1403c4cee2d9df6b051b1545966758e7ef96a8a29dd6a6bc1b0bdba07016fb3a74608851b9ed857ca6c58d2f867f02eddd650fdbdb475ebfd91a2c1afe933a5f37d09c16544a1e6eb5f1e3a730a8d295a";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
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
    return NextResponse.json(
      { error: "Failed to fetch prizes" },
      { status: response.status }
    );
  }

  const data: PrizeResponse = await response.json();
  return NextResponse.json(data.data, {
    headers: {
      "Cache-Control": "no-cache, no-store, must-revalidate",
      Pragma: "no-cache",
      Expires: "0",
    },
  });
}
