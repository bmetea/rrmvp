import { db } from "@/db";
import { DB, Competitions, CompetitionPrizes, Products } from "@/db/types";
import { cache } from "react";

type CompetitionWithPrizes = Competitions & {
  prizes: CompetitionPrizes[];
};

type CompetitionWithPrizesAndProducts = Competitions & {
  prizes: (CompetitionPrizes & {
    product: Products;
  })[];
};

export const fetchCompetitionsServer = cache(async () => {
  const competitions = await db
    .selectFrom("competitions")
    .select([
      "id",
      "title",
      "description",
      "start_date",
      "end_date",
      "type",
      "ticket_price",
      "total_tickets",
      "tickets_sold",
      "status",
      "media_info"
    ])
    .where("competitions.status", "=", "active")
    .where("competitions.end_date", ">", new Date())
    .execute();
  return competitions;
});

// Server-side fetch with caching
// export const fetchCompetitionPrizesServer = cache(
//   async (): Promise<CompetitionWithPrizes[]> => {
//     const competitions = await db
//       .selectFrom("competitions")
//       .leftJoin(
//         "competition_prizes",
//         "competitions.id",
//         "competition_prizes.id"
//       )
//       .leftJoin("products", "competition_prizes.product_id", "products.id")
//       .selectAll()
//       .where("competitions.status", "=", "active")
//       .where("competitions.end_date", ">", new Date())
//       .execute();

//     return competitionsWithPrizes;
//   }
// );

// Server-side fetch with caching
// export const fetchCompetitionsServer = cache(
//   async (): Promise<CompetitionWithPrizes[]> => {
//     const competitions = await db
//       .selectFrom("competitions")
//       .selectAll()
//       .where("status", "=", "active")
//       .where("end_date", ">", new Date())
//       .execute();

//     // Fetch prizes for each competition
//     const competitionsWithPrizes = await Promise.all(
//       competitions.map(async (competition) => {
//         const prizes = (await db
//           .selectFrom("competition_prizes")
//           .selectAll()
//           .where("competition_id", "=", competition.id)
//           .execute()) as CompetitionPrizes[];

//         return {
//           ...competition,
//           prizes,
//         };
//       })
//     );

//     return competitionsWithPrizes;
//   }
// );

// // Fetch single competition by ID with caching
// export const fetchCompetitionById = cache(
//   async (id: string): Promise<CompetitionWithPrizes | null> => {
//     const competition = (await db
//       .selectFrom("competitions")
//       .selectAll()
//       .where("id", "=", id)
//       .executeTakeFirst()) as Competitions | undefined;

//     if (!competition) {
//       return null;
//     }

//     const prizes = (await db
//       .selectFrom("competition_prizes")
//       .selectAll()
//       .where("competition_id", "=", id)
//       .execute()) as CompetitionPrizes[];

//     return {
//       ...competition,
//       prizes,
//     } as CompetitionWithPrizes;
//   }
// );
