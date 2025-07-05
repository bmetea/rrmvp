import { fetchCompetitionsServer } from "@/domains/competitions/services/competition.service";
import HeroCarousel from "./HeroCarousel";

export default async function Hero() {
  const competitions = await fetchCompetitionsServer();
  // Serialize dates for client component
  const safeCompetitions = competitions.map((c) => ({
    ...c,
    start_date:
      c.start_date instanceof Date ? c.start_date.toISOString() : c.start_date,
    end_date:
      c.end_date instanceof Date ? c.end_date.toISOString() : c.end_date,
  }));
  return <HeroCarousel competitions={safeCompetitions} />;
}
