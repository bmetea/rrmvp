import { db } from "@/db";
import { DB, Competitions, CompetitionPrizes } from "@/db/types";
import { cache } from "react";

type CompetitionWithPrizes = Competitions & {
  prizes: CompetitionPrizes[];
};

// Server-side fetch with caching
export const fetchCompetitionsServer = cache(
  async (): Promise<CompetitionWithPrizes[]> => {
    const competitions = (await db
      .selectFrom("competitions")
      .selectAll()
      .where("status", "=", "active")
      .where("end_date", ">", new Date())
      .execute()) as Competitions[];

    // Fetch prizes for each competition
    const competitionsWithPrizes = await Promise.all(
      competitions.map(async (competition) => {
        const prizes = (await db
          .selectFrom("competition_prizes")
          .selectAll()
          .where("competition_id", "=", competition.id)
          .execute()) as CompetitionPrizes[];

        return {
          ...competition,
          prizes,
        } as CompetitionWithPrizes;
      })
    );

    return competitionsWithPrizes;
  }
);

// Client-side fetch
export const fetchCompetitions = async (): Promise<CompetitionWithPrizes[]> => {
  const competitions = (await db
    .selectFrom("competitions")
    .selectAll()
    .where("status", "=", "active")
    .where("end_date", ">", new Date())
    .execute()) as Competitions[];

  // Fetch prizes for each competition
  const competitionsWithPrizes = await Promise.all(
    competitions.map(async (competition) => {
      const prizes = (await db
        .selectFrom("competition_prizes")
        .selectAll()
        .where("competition_id", "=", competition.id)
        .execute()) as CompetitionPrizes[];

      return {
        ...competition,
        prizes,
      } as CompetitionWithPrizes;
    })
  );

  return competitionsWithPrizes;
};

// Fetch single competition by ID with caching
export const fetchCompetitionById = cache(
  async (id: string): Promise<CompetitionWithPrizes | null> => {
    const competition = (await db
      .selectFrom("competitions")
      .selectAll()
      .where("id", "=", id)
      .executeTakeFirst()) as Competitions | undefined;

    if (!competition) {
      return null;
    }

    const prizes = (await db
      .selectFrom("competition_prizes")
      .selectAll()
      .where("competition_id", "=", id)
      .execute()) as CompetitionPrizes[];

    return {
      ...competition,
      prizes,
    } as CompetitionWithPrizes;
  }
);

// Fetch competitions by type
export const fetchCompetitionsByType = cache(
  async (
    type: DB["competitions"]["type"]
  ): Promise<CompetitionWithPrizes[]> => {
    const competitions = (await db
      .selectFrom("competitions")
      .selectAll()
      .where("type", "=", type)
      .where("status", "=", "active")
      .where("end_date", ">", new Date())
      .execute()) as Competitions[];

    const competitionsWithPrizes = await Promise.all(
      competitions.map(async (competition) => {
        const prizes = (await db
          .selectFrom("competition_prizes")
          .selectAll()
          .where("competition_id", "=", competition.id)
          .execute()) as CompetitionPrizes[];

        return {
          ...competition,
          prizes,
        } as CompetitionWithPrizes;
      })
    );

    return competitionsWithPrizes;
  }
);

// Fetch active instant win competitions with available prizes
export const fetchActiveInstantWinCompetitions = cache(
  async (): Promise<CompetitionWithPrizes[]> => {
    const competitions = (await db
      .selectFrom("competitions as c")
      .innerJoin("competition_prizes as cp", "c.id", "cp.competition_id")
      .selectAll("c")
      .where("c.type", "=", "instant_win")
      .where("c.status", "=", "active")
      .where("c.end_date", ">", new Date())
      .where("cp.available_quantity", ">", 0)
      .distinct()
      .execute()) as Competitions[];

    const competitionsWithPrizes = await Promise.all(
      competitions.map(async (competition) => {
        const prizes = (await db
          .selectFrom("competition_prizes")
          .selectAll()
          .where("competition_id", "=", competition.id)
          .where("available_quantity", ">", 0)
          .execute()) as CompetitionPrizes[];

        return {
          ...competition,
          prizes,
        } as CompetitionWithPrizes;
      })
    );

    return competitionsWithPrizes;
  }
);
