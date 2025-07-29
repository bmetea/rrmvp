import { db } from "../../../../../db";

interface WinningTicket {
  competition_id: string;
  competition_entry_id: string;
  ticket_number: number;
  prize: {
    name: string;
    media_info: any;
    is_wallet_credit: boolean;
    credit_amount: number | null;
  };
}

interface CompetitionEntry {
  competition_id: string;
  entry_id: string;
  title: string;
  ticket_price: number;
  tickets: number[];
  winning_tickets: WinningTicket[];
}

interface SimpleOrderDetails {
  order_id: string;
  userId: string;
  email: string;
  order_date: string;
  timestamp: string;
  total_amount: number;
  currency: string;
  payment_method: string;
  payment_breakdown: {
    wallet_amount: number;
    card_amount: number;
  };
  total_tickets: number;
  order_summary?: any; // This might contain competition details
  competition_entries: CompetitionEntry[];
}

export async function getOrderDetails(
  orderId: string
): Promise<SimpleOrderDetails | null> {
  try {
    // Get order basic info with user email
    const order = await db
      .selectFrom("orders")
      .innerJoin("users", "users.id", "orders.user_id")
      .select([
        "orders.id as order_id",
        "orders.user_id",
        "orders.total_amount",
        "orders.currency",
        "orders.payment_amount",
        "orders.wallet_amount",
        "orders.total_tickets",
        "orders.created_at",
        "orders.order_summary",
        "users.email",
      ])
      .where("orders.id", "=", orderId)
      .executeTakeFirst();

    if (!order) {
      return null;
    }

    // Get competition entries data
    const competitionEntries = await db
      .selectFrom("competition_entries as ce")
      .innerJoin("competitions as c", "ce.competition_id", "c.id")
      .select([
        "c.id as competition_id",
        "ce.id as entry_id",
        "c.title",
        "ce.tickets",
        "c.ticket_price",
      ])
      .where("ce.order_id", "=", orderId)
      .execute();

    // Get winning tickets data if any
    const winningTickets = await db
      .selectFrom("competition_entries as ce")
      .innerJoin("winning_tickets as wt", "ce.id", "wt.competition_entry_id")
      .innerJoin("competition_prizes as cp", "wt.prize_id", "cp.id")
      .innerJoin("products as p", "cp.product_id", "p.id")
      .select([
        "wt.competition_id",
        "wt.competition_entry_id",
        "wt.ticket_number",
        "p.name",
        "p.media_info",
        "p.is_wallet_credit",
        "p.credit_amount",
      ])
      .where("ce.order_id", "=", orderId)
      .execute();

    // Group winning tickets by competition entry
    const winningTicketsByEntry = winningTickets.reduce((acc, ticket) => {
      if (!acc[ticket.competition_entry_id]) {
        acc[ticket.competition_entry_id] = [];
      }
      acc[ticket.competition_entry_id].push({
        competition_id: ticket.competition_id,
        competition_entry_id: ticket.competition_entry_id,
        ticket_number: ticket.ticket_number,
        prize: {
          name: ticket.name,
          media_info: ticket.media_info,
          is_wallet_credit: ticket.is_wallet_credit,
          credit_amount: ticket.credit_amount,
        },
      });
      return acc;
    }, {} as Record<string, WinningTicket[]>);

    // Combine competition entries with their winning tickets
    const entriesWithWinnings: CompetitionEntry[] = competitionEntries.map(
      (entry) => ({
        competition_id: entry.competition_id,
        entry_id: entry.entry_id,
        title: entry.title,
        ticket_price: entry.ticket_price,
        tickets: entry.tickets || [],
        winning_tickets: winningTicketsByEntry[entry.entry_id] || [],
      })
    );

    // Calculate payment breakdown
    const walletAmount = order.wallet_amount || 0;
    const totalPayment = order.payment_amount || order.total_amount;
    const cardAmount = totalPayment - walletAmount;

    const paymentMethod =
      walletAmount > 0 && cardAmount > 0
        ? "hybrid"
        : walletAmount > 0
        ? "wallet"
        : "card";

    return {
      order_id: order.order_id,
      userId: order.user_id,
      email: order.email,
      order_date: order.created_at.toISOString(),
      timestamp: order.created_at.toISOString(),
      total_amount: order.total_amount,
      currency: order.currency,
      payment_method: paymentMethod,
      payment_breakdown: {
        wallet_amount: walletAmount,
        card_amount: cardAmount,
      },
      total_tickets: order.total_tickets,
      order_summary: order.order_summary,
      competition_entries: entriesWithWinnings,
    };
  } catch (error) {
    console.error("Error fetching order details:", error);
    throw error;
  }
}
