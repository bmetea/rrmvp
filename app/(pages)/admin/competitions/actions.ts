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
    min_ticket_percentage: string;
    max_ticket_percentage: string;
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
        min_ticket_percentage: formData.min_ticket_percentage,
        max_ticket_percentage: formData.max_ticket_percentage,
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
        "competition_prizes.min_ticket_percentage",
        "competition_prizes.max_ticket_percentage",
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
          min_ticket_percentage: prize.min_ticket_percentage,
          max_ticket_percentage: prize.max_ticket_percentage,
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
      .execute();

    if (prizes.length === 0) {
      throw new Error("No prizes found for this competition");
    }

    // Generate winning ticket numbers for each prize
    const totalTickets = competition.total_tickets;
    const usedTicketNumbers = new Set<string>();

    for (const prize of prizes) {
      const winningTicketNumbers: string[] = [];
      const ticketsToGenerate = prize.total_quantity;

      // Calculate the range for this prize based on percentage
      const minTicket = Math.floor(
        (parseFloat(prize.min_ticket_percentage) / 100) * totalTickets
      );
      const maxTicket = Math.floor(
        (parseFloat(prize.max_ticket_percentage) / 100) * totalTickets
      );

      // Generate unique winning ticket numbers within the specified range
      while (winningTicketNumbers.length < ticketsToGenerate) {
        const ticketNumber =
          Math.floor(Math.random() * (maxTicket - minTicket + 1)) + minTicket;
        const ticketString = ticketNumber.toString().padStart(6, "0");

        if (!usedTicketNumbers.has(ticketString)) {
          usedTicketNumbers.add(ticketString);
          winningTicketNumbers.push(ticketString);
        }
      }

      // Update the prize with winning ticket numbers
      await db
        .updateTable("competition_prizes")
        .set({
          winning_ticket_numbers: winningTicketNumbers,
          updated_at: new Date(),
        })
        .where("id", "=", prize.id)
        .execute();
    }

    // Revalidate all competition-related paths
    revalidatePath("/");
    revalidatePath("/competitions");
    revalidatePath(`/competitions/${competitionId}`, "page");
    revalidatePath("/admin/competitions");

    // Revalidate the competitions tag
    revalidateTag("competitions");

    return { success: true, message: "Winning tickets computed successfully" };
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

export async function clearWinningTicketsAction(competitionId: string) {
  try {
    // Clear winning ticket numbers for all prizes in the competition
    await db
      .updateTable("competition_prizes")
      .set({
        winning_ticket_numbers: null,
        updated_at: new Date(),
      })
      .where("competition_id", "=", competitionId)
      .execute();

    // Revalidate all competition-related paths
    revalidatePath("/");
    revalidatePath("/competitions");
    revalidatePath(`/competitions/${competitionId}`, "page");
    revalidatePath("/admin/competitions");

    // Revalidate the competitions tag
    revalidateTag("competitions");

    return { success: true, message: "Winning tickets cleared successfully" };
  } catch (error) {
    console.error("Failed to clear winning tickets:", error);
    return { success: false, error: "Failed to clear winning tickets" };
  }
}
