"use server";

import { db } from "@/db";
import { auth } from "@clerk/nextjs/server";

export interface UserTicket {
  id: string;
  ticket_number: string;
  status: string;
  purchase_date: Date;
  number_of_tickets: number;
  competition: {
    id: string;
    title: string;
    type: string;
    status: string;
    end_date: Date;
    media_info: {
      thumbnail?: string;
      images?: string[];
    } | null;
  };
}

export async function getUserTickets(): Promise<{
  success: boolean;
  tickets?: UserTicket[];
  message?: string;
}> {
  const session = await auth();

  if (!session?.userId) {
    return {
      success: false,
      message: "You must be logged in to view your tickets",
    };
  }

  try {
    // Get the user's database ID from their Clerk ID
    const user = await db
      .selectFrom("users")
      .select(["id"])
      .where("clerk_id", "=", session.userId)
      .executeTakeFirst();

    if (!user) {
      return {
        success: false,
        message: "User not found",
      };
    }

    // Fetch tickets with competition information
    const tickets = await db
      .selectFrom("tickets")
      .innerJoin("competitions", "competitions.id", "tickets.competition_id")
      .select([
        "tickets.id",
        "tickets.ticket_number",
        "tickets.status",
        "tickets.purchase_date",
        "tickets.number_of_tickets",
        "competitions.id as competition_id",
        "competitions.title",
        "competitions.type",
        "competitions.status as competition_status",
        "competitions.end_date",
        "competitions.media_info",
      ])
      .where("tickets.user_id", "=", user.id)
      .orderBy("tickets.purchase_date", "desc")
      .execute();

    // Transform the data into the expected format
    const formattedTickets: UserTicket[] = tickets.map((ticket) => ({
      id: ticket.id,
      ticket_number: ticket.ticket_number,
      status: ticket.status,
      purchase_date: ticket.purchase_date,
      number_of_tickets: ticket.number_of_tickets,
      competition: {
        id: ticket.competition_id,
        title: ticket.title,
        type: ticket.type,
        status: ticket.competition_status,
        end_date: ticket.end_date,
        media_info: ticket.media_info
          ? ((typeof ticket.media_info === "string"
              ? JSON.parse(ticket.media_info)
              : ticket.media_info) as {
              thumbnail?: string;
              images?: string[];
            })
          : null,
      },
    }));

    return {
      success: true,
      tickets: formattedTickets,
    };
  } catch (error) {
    console.error("Error fetching user tickets:", error);
    return {
      success: false,
      message: "An error occurred while fetching your tickets",
    };
  }
}

export async function fetchUserTickets(): Promise<UserTicket[]> {
  const { userId } = await auth();
  if (!userId) {
    return [];
  }

  try {
    const tickets = await db
      .selectFrom("tickets")
      .innerJoin("competitions", "tickets.competition_id", "competitions.id")
      .select([
        "tickets.id",
        "tickets.ticket_number",
        "tickets.status",
        "tickets.purchase_date",
        "tickets.number_of_tickets",
        "competitions.id as competition_id",
        "competitions.title as competition_title",
        "competitions.type as competition_type",
        "competitions.status as competition_status",
        "competitions.end_date as competition_end_date",
        "competitions.media_info as competition_media_info",
      ])
      .where("tickets.user_id", "=", userId)
      .execute();

    return tickets.map((ticket) => ({
      id: ticket.id,
      ticket_number: ticket.ticket_number,
      status: ticket.status,
      purchase_date: ticket.purchase_date,
      number_of_tickets: ticket.number_of_tickets,
      competition: {
        id: ticket.competition_id,
        title: ticket.competition_title,
        type: ticket.competition_type,
        status: ticket.competition_status,
        end_date: ticket.competition_end_date,
        media_info: ticket.competition_media_info
          ? ((typeof ticket.competition_media_info === "string"
              ? JSON.parse(ticket.competition_media_info)
              : ticket.competition_media_info) as {
              thumbnail?: string;
              images?: string[];
            })
          : null,
      },
    }));
  } catch (error) {
    console.error("Failed to fetch user tickets:", error);
    return [];
  }
}
