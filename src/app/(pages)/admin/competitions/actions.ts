"use server";

import { db } from "@/db";
import { revalidatePath, revalidateTag } from "next/cache";

export async function createCompetitionAction(formData: FormData) {
  try {
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const type = formData.get("type") as string;
    const ticket_price = parseInt(formData.get("ticket_price") as string);
    const total_tickets = parseInt(formData.get("total_tickets") as string);
    const start_date = new Date(formData.get("start_date") as string);
    const end_date = new Date(formData.get("end_date") as string);
    const status = formData.get("status") as string;
    const media_info_string = formData.get("media_info") as string;
    const media_info = media_info_string ? JSON.parse(media_info_string) : null;

    const newCompetition = await db
      .insertInto("competitions")
      .values({
        title,
        description,
        type,
        ticket_price,
        total_tickets,
        start_date,
        end_date,
        status,
        media_info,
        tickets_sold: 0,
        created_at: new Date(),
        updated_at: new Date(),
      })
      .returningAll()
      .executeTakeFirst();

    if (!newCompetition) {
      throw new Error("Failed to create competition");
    }

    // Revalidate all competition-related paths
    revalidatePath("/");
    revalidatePath("/competitions");
    revalidatePath("/competitions/[id]", "page");
    revalidatePath("/admin/competitions");

    // Revalidate the competitions tag
    revalidateTag("competitions");

    return { success: true, data: newCompetition };
  } catch (error) {
    console.error("Failed to create competition:", error);
    return { success: false, error: "Failed to create competition" };
  }
}

export async function updateCompetitionAction(id: string, formData: FormData) {
  try {
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const type = formData.get("type") as string;
    const ticket_price = parseInt(formData.get("ticket_price") as string);
    const total_tickets = parseInt(formData.get("total_tickets") as string);
    const start_date = new Date(formData.get("start_date") as string);
    const end_date = new Date(formData.get("end_date") as string);
    const status = formData.get("status") as string;
    const media_info_string = formData.get("media_info") as string;
    const media_info = media_info_string ? JSON.parse(media_info_string) : null;

    // Check if prizes are locked (have winning tickets computed)
    const prizesWithWinningTickets = await db
      .selectFrom("competition_prizes")
      .select("winning_ticket_numbers")
      .where("competition_id", "=", id)
      .where("winning_ticket_numbers", "is not", null)
      .execute();

    const isPrizesLocked = prizesWithWinningTickets.some(
      (prize) =>
        prize.winning_ticket_numbers &&
        Array.isArray(prize.winning_ticket_numbers) &&
        prize.winning_ticket_numbers.length > 0
    );

    // If prizes are locked, prevent updates to ticket_price and total_tickets
    if (isPrizesLocked) {
      // Get current competition data to preserve ticket_price and total_tickets
      const currentCompetition = await db
        .selectFrom("competitions")
        .select(["ticket_price", "total_tickets"])
        .where("id", "=", id)
        .executeTakeFirst();

      if (!currentCompetition) {
        throw new Error("Competition not found");
      }

      const updatedCompetition = await db
        .updateTable("competitions")
        .set({
          title,
          description,
          type,
          ticket_price: currentCompetition.ticket_price, // Preserve original value
          total_tickets: currentCompetition.total_tickets, // Preserve original value
          start_date,
          end_date,
          status,
          media_info,
          updated_at: new Date(),
        })
        .where("id", "=", id)
        .returningAll()
        .executeTakeFirst();

      if (!updatedCompetition) {
        throw new Error("Failed to update competition");
      }

      // Revalidate all competition-related paths
      revalidatePath("/");
      revalidatePath("/competitions");
      revalidatePath(`/competitions/${id}`, "page");
      revalidatePath("/admin/competitions");

      // Revalidate the competitions tag
      revalidateTag("competitions");

      return {
        success: true,
        data: updatedCompetition,
        warning:
          "Ticket price and total tickets were not updated because prizes are locked",
      };
    }

    // Normal update when prizes are not locked
    const updatedCompetition = await db
      .updateTable("competitions")
      .set({
        title,
        description,
        type,
        ticket_price,
        total_tickets,
        start_date,
        end_date,
        status,
        media_info,
        updated_at: new Date(),
      })
      .where("id", "=", id)
      .returningAll()
      .executeTakeFirst();

    if (!updatedCompetition) {
      throw new Error("Failed to update competition");
    }

    // Revalidate all competition-related paths
    revalidatePath("/");
    revalidatePath("/competitions");
    revalidatePath(`/competitions/${id}`, "page");
    revalidatePath("/admin/competitions");

    // Revalidate the competitions tag
    revalidateTag("competitions");

    return { success: true, data: updatedCompetition };
  } catch (error) {
    console.error("Failed to update competition:", error);
    return { success: false, error: "Failed to update competition" };
  }
}

export async function addCompetitionPrizeAction(
  competitionId: string,
  formData: {
    product_id: string;
    total_quantity: number;
    phase: number;
    prize_group: string;
    is_instant_win: boolean;
  }
) {
  try {
    const prize = await db
      .insertInto("competition_prizes")
      .values({
        competition_id: competitionId,
        product_id: formData.product_id,
        total_quantity: formData.total_quantity,
        available_quantity: formData.total_quantity,
        phase: formData.phase,
        prize_group: formData.prize_group,
        is_instant_win: formData.is_instant_win,
        won_quantity: 0,
        created_at: new Date(),
        updated_at: new Date(),
      })
      .returningAll()
      .executeTakeFirst();

    if (!prize) {
      throw new Error("Failed to add prize");
    }

    // Revalidate all competition-related paths
    revalidatePath("/");
    revalidatePath("/competitions");
    revalidatePath(`/competitions/${competitionId}`, "page");
    revalidatePath("/admin/competitions");

    // Revalidate the competitions tag
    revalidateTag("competitions");

    return { success: true, data: prize };
  } catch (error) {
    console.error("Failed to add prize:", error);
    return { success: false, error: "Failed to add prize" };
  }
}

export async function deleteCompetitionPrizeAction(prizeId: string) {
  try {
    const prize = await db
      .deleteFrom("competition_prizes")
      .where("id", "=", prizeId)
      .returningAll()
      .executeTakeFirst();

    if (!prize) {
      throw new Error("Failed to delete prize");
    }

    // Revalidate all competition-related paths
    revalidatePath("/");
    revalidatePath("/competitions");
    revalidatePath(`/competitions/${prize.competition_id}`, "page");
    revalidatePath("/admin/competitions");

    // Revalidate the competitions tag
    revalidateTag("competitions");

    return { success: true, data: prize };
  } catch (error) {
    console.error("Failed to delete prize:", error);
    return { success: false, error: "Failed to delete prize" };
  }
}

export async function fetchProductsAction() {
  try {
    const products = await db
      .selectFrom("products")
      .select([
        "id",
        "name",
        "sub_name",
        "market_value",
        "description",
        "media_info",
        "is_wallet_credit",
        "credit_amount",
      ])
      .orderBy("created_at", "desc")
      .execute();

    return { success: true, data: products };
  } catch (error) {
    console.error("Failed to fetch products:", error);
    return { success: false, error: "Failed to fetch products" };
  }
}

export async function searchProductsAction(searchTerm: string) {
  try {
    const products = await db
      .selectFrom("products")
      .select([
        "id",
        "name",
        "sub_name",
        "market_value",
        "description",
        "media_info",
        "is_wallet_credit",
        "credit_amount",
      ])
      .where("name", "ilike", `%${searchTerm}%`)
      .orderBy("created_at", "desc")
      .execute();

    return { success: true, data: products };
  } catch (error) {
    console.error("Failed to search products:", error);
    return { success: false, error: "Failed to search products" };
  }
}

export async function updateCompetitionPrizeAction(
  prizeId: string,
  data: { total_quantity: number }
) {
  try {
    // First get the current won_quantity
    const currentPrize = await db
      .selectFrom("competition_prizes")
      .select("won_quantity")
      .where("id", "=", prizeId)
      .executeTakeFirst();

    if (!currentPrize) {
      throw new Error("Prize not found");
    }

    await db
      .updateTable("competition_prizes")
      .set({
        total_quantity: data.total_quantity,
        available_quantity: data.total_quantity - currentPrize.won_quantity,
        updated_at: new Date(),
      })
      .where("id", "=", prizeId)
      .executeTakeFirst();

    return {
      success: true,
      data: {
        total_quantity: data.total_quantity,
        available_quantity: data.total_quantity - currentPrize.won_quantity,
      },
    };
  } catch (error) {
    console.error("Failed to update competition prize:", error);
    return { success: false, error: "Failed to update competition prize" };
  }
}

export async function fetchCompetitionWithPrizesAction(competitionId: string) {
  try {
    const competition = await db
      .selectFrom("competitions")
      .selectAll()
      .where("id", "=", competitionId)
      .executeTakeFirst();

    if (!competition) {
      throw new Error("Competition not found");
    }

    const prizes = await db
      .selectFrom("competition_prizes")
      .innerJoin("products", "products.id", "competition_prizes.product_id")
      .select([
        "competition_prizes.id",
        "competition_prizes.phase",
        "competition_prizes.total_quantity",
        "competition_prizes.prize_group",
        "competition_prizes.is_instant_win",
        "competition_prizes.winning_ticket_numbers",
        "products.id as product_id",
        "products.name",
        "products.sub_name",
        "products.market_value",
        "products.description",
      ])
      .where("competition_prizes.competition_id", "=", competitionId)
      .orderBy("competition_prizes.phase", "asc")
      .execute();

    return {
      success: true,
      data: {
        ...competition,
        prizes: prizes.map((prize) => ({
          id: prize.id,
          phase: prize.phase,
          total_quantity: prize.total_quantity,
          prize_group: prize.prize_group,
          is_instant_win: prize.is_instant_win,
          winning_ticket_numbers: prize.winning_ticket_numbers,
          product: {
            id: prize.product_id,
            name: prize.name,
            sub_name: prize.sub_name,
            market_value: prize.market_value,
            description: prize.description,
          },
        })),
      },
    };
  } catch (error) {
    console.error("Failed to fetch competition with prizes:", error);
    return { success: false, error: "Failed to fetch competition with prizes" };
  }
}

export async function computeWinningTicketsAction(competitionId: string) {
  try {
    // Get the competition and its prizes
    const competition = await db
      .selectFrom("competitions")
      .selectAll()
      .where("id", "=", competitionId)
      .executeTakeFirst();

    if (!competition) {
      throw new Error("Competition not found");
    }

    if (competition.type !== "instant_win") {
      throw new Error(
        "Winning tickets can only be computed for instant win competitions"
      );
    }

    const prizes = await db
      .selectFrom("competition_prizes")
      .selectAll()
      .where("competition_id", "=", competitionId)
      .orderBy("phase", "asc")
      .execute();

    if (prizes.length === 0) {
      throw new Error("No prizes found for this competition");
    }

    // Calculate phase boundaries
    const totalTickets = competition.total_tickets;
    const phase1End = Math.floor(totalTickets / 3);
    const phase2Start = phase1End + 1;
    const phase2End = Math.floor((totalTickets * 2) / 3);
    const phase3Start = phase2End + 1;
    const phase3End = totalTickets;

    // Group prizes by phase
    const prizesByPhase = prizes.reduce((acc, prize) => {
      if (!acc[prize.phase]) {
        acc[prize.phase] = [];
      }
      acc[prize.phase].push(prize);
      return acc;
    }, {} as Record<number, typeof prizes>);

    // Generate winning ticket numbers for each phase
    for (const [phase, phasePrizes] of Object.entries(prizesByPhase)) {
      const phaseNum = parseInt(phase);

      // Calculate phase boundaries
      let phaseStart: number, phaseEnd: number;

      switch (phaseNum) {
        case 1:
          phaseStart = 1;
          phaseEnd = phase1End;
          break;
        case 2:
          phaseStart = phase2Start;
          phaseEnd = phase2End;
          break;
        case 3:
          phaseStart = phase3Start;
          phaseEnd = phase3End;
          break;
        default:
          throw new Error(`Invalid phase number: ${phaseNum}`);
      }

      // Calculate total winning tickets for this phase
      const phaseTotalWinningTickets = phasePrizes.reduce(
        (sum, prize) => sum + prize.total_quantity,
        0
      );

      // Validate that we don't exceed the phase ticket range
      const phaseTicketRange = phaseEnd - phaseStart + 1;
      if (phaseTotalWinningTickets > phaseTicketRange) {
        throw new Error(
          `Phase ${phaseNum} has ${phaseTotalWinningTickets} winning tickets but only ${phaseTicketRange} tickets available in range ${phaseStart}-${phaseEnd}`
        );
      }

      // Generate unique winning ticket numbers for this phase
      const usedTicketNumbers = new Set<number>();

      for (const prize of phasePrizes) {
        const winningTicketNumbers: number[] = [];
        const ticketsToGenerate = prize.total_quantity;

        // Generate unique winning ticket numbers within the phase range
        while (winningTicketNumbers.length < ticketsToGenerate) {
          const ticketNumber =
            Math.floor(Math.random() * (phaseEnd - phaseStart + 1)) +
            phaseStart;

          if (!usedTicketNumbers.has(ticketNumber)) {
            usedTicketNumbers.add(ticketNumber);
            winningTicketNumbers.push(ticketNumber);
          }
        }

        // Sort the winning ticket numbers for consistency
        winningTicketNumbers.sort((a, b) => a - b);

        // Insert winning tickets into the new table
        const winningTicketData = winningTicketNumbers.map((ticketNumber) => ({
          competition_id: competitionId,
          prize_id: prize.id,
          ticket_number: ticketNumber,
          status: "available" as const,
        }));

        await db
          .insertInto("winning_tickets")
          .values(winningTicketData)
          .execute();

        // Update the prize with winning ticket numbers (for backward compatibility)
        await db
          .updateTable("competition_prizes")
          .set({
            winning_ticket_numbers: winningTicketNumbers,
            updated_at: new Date(),
          })
          .where("id", "=", prize.id)
          .execute();
      }
    }

    // Revalidate all competition-related paths
    revalidatePath("/");
    revalidatePath("/competitions");
    revalidatePath(`/competitions/${competitionId}`, "page");
    revalidatePath("/admin/competitions");

    // Revalidate the competitions tag
    revalidateTag("competitions");

    return {
      success: true,
      message:
        "Winning tickets computed successfully using phase-based distribution",
      data: {
        totalTickets,
        phase1Range: `1-${phase1End}`,
        phase2Range: `${phase2Start}-${phase2End}`,
        phase3Range: `${phase3Start}-${phase3End}`,
        prizesByPhase: Object.keys(prizesByPhase).map((phase) => ({
          phase: parseInt(phase),
          totalPrizes: prizesByPhase[parseInt(phase)].length,
          totalWinningTickets: prizesByPhase[parseInt(phase)].reduce(
            (sum, prize) => sum + prize.total_quantity,
            0
          ),
        })),
      },
    };
  } catch (error) {
    console.error("Failed to compute winning tickets:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to compute winning tickets",
    };
  }
}

export async function clearWinningTicketsAction(
  competitionId: string,
  prizeId?: string // Made optional to support clearing all tickets
): Promise<{ success: boolean; message: string }> {
  try {
    return await db.transaction().execute(async (trx) => {
      if (prizeId) {
        // Single prize clearing logic
        const prize = await trx
          .selectFrom("competition_prizes")
          .select(["winning_ticket_numbers", "claimed_winning_tickets"])
          .where("id", "=", prizeId)
          .executeTakeFirst();

        if (!prize) {
          return {
            success: false,
            message: "Prize not found",
          };
        }

        // Reset winning tickets in the winning_tickets table
        await trx
          .deleteFrom("winning_tickets")
          .where("competition_id", "=", competitionId)
          .where("prize_id", "=", prizeId)
          .execute();

        // Reset the prize's winning ticket numbers
        await trx
          .updateTable("competition_prizes")
          .set({
            winning_ticket_numbers: null,
            claimed_winning_tickets: null,
          })
          .where("id", "=", prizeId)
          .execute();

        return {
          success: true,
          message: "Successfully cleared winning tickets for the prize",
        };
      } else {
        // Clear all winning tickets for the competition
        await trx
          .deleteFrom("winning_tickets")
          .where("competition_id", "=", competitionId)
          .execute();

        // Reset all prizes' winning ticket numbers
        await trx
          .updateTable("competition_prizes")
          .set({
            winning_ticket_numbers: null,
            claimed_winning_tickets: null,
          })
          .where("competition_id", "=", competitionId)
          .execute();

        return {
          success: true,
          message:
            "Successfully cleared all winning tickets for the competition",
        };
      }
    });
  } catch (error) {
    console.error("Error clearing winning tickets:", error);
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to clear winning tickets",
    };
  }
}
