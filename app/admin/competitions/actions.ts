"use server";

import { db } from "@/db";
import { revalidatePath } from "next/cache";

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

    revalidatePath("/admin/competitions");
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

    revalidatePath("/admin/competitions");
    return { success: true, data: updatedCompetition };
  } catch (error) {
    console.error("Failed to update competition:", error);
    return { success: false, error: "Failed to update competition" };
  }
}
