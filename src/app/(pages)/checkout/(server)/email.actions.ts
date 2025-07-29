import { readFile } from "fs/promises";
import { join } from "path";
import { sendEmail } from "@/shared/lib/email";
import { getOrderDetails } from "../(data)/orders";

interface TemplateWinningTicket {
  ticket_number: number;
  prize: {
    name: string;
    is_wallet_credit: boolean;
    credit_amount: number | null;
  };
}

interface TemplateCompetitionEntry {
  title: string;
  ticket_price: string;
  has_tickets: boolean;
  tickets: number[];
  has_winning_tickets: boolean;
  winning_tickets: TemplateWinningTicket[];
  is_wallet_credit_prize: boolean;
}

interface SimpleTemplateData {
  order_id: string;
  formatted_date: string;
  total_tickets: number;
  currency_symbol: string;
  formatted_total: string;
  payment_breakdown: {
    formatted_payment_method: string;
    is_hybrid_payment: boolean;
    formatted_wallet_amount?: string;
    formatted_card_amount?: string;
  };
  order_summary?: any;
  has_competition_entries: boolean;
  competition_entries: TemplateCompetitionEntry[];
  has_winning_tickets: boolean;
}

// Robust Mustache-style template engine
function populateTemplate(template: string, data: any): string {
  let result = template;

  // Process template in multiple passes for better reliability

  // 1. First pass: Handle array sections {{#array}}...{{/array}}
  result = processArraySections(result, data);

  // 2. Second pass: Handle boolean conditionals
  result = processConditionals(result, data);

  // 3. Final pass: Replace simple variables
  result = processVariables(result, data);

  return result;
}

function processArraySections(template: string, data: any): string {
  // Find array sections and process them
  return template.replace(
    /\{\{#([^}]+?)\}\}([\s\S]*?)\{\{\/\1\}\}/g,
    (match, sectionKey, content) => {
      const sectionData = getNestedValue(data, sectionKey.trim());

      if (Array.isArray(sectionData) && sectionData.length > 0) {
        return sectionData
          .map((item) => {
            // Handle primitive values (numbers, strings) vs objects
            if (typeof item === "object" && item !== null) {
              // For objects, merge with parent data
              return populateTemplate(content, { ...data, ...item });
            } else {
              // For primitives, pass the item directly as the context
              return populateTemplate(content, item);
            }
          })
          .join("");
      } else if (sectionData && typeof sectionData === "object") {
        // Single object, not an array
        return populateTemplate(content, { ...data, ...sectionData });
      } else if (sectionData) {
        // Truthy value, render content
        return populateTemplate(content, data);
      }

      return ""; // Falsy value, don't render
    }
  );
}

function processConditionals(template: string, data: any): string {
  // Handle boolean conditionals that aren't arrays
  return template.replace(
    /\{\{#([^}]+?)\}\}([\s\S]*?)\{\{\/\1\}\}/g,
    (match, sectionKey, content) => {
      const sectionData = getNestedValue(data, sectionKey.trim());

      if (sectionData) {
        return populateTemplate(content, data);
      }

      return "";
    }
  );
}

function processVariables(template: string, data: any): string {
  // Replace simple variables {{variable}} and {{.}} for array items
  return template.replace(/\{\{([^}#\/]+?)\}\}/g, (match, key) => {
    const trimmedKey = key.trim();

    // Handle {{.}} for current array item
    if (trimmedKey === ".") {
      return String(data);
    }

    const value = getNestedValue(data, trimmedKey);
    return value !== undefined && value !== null ? String(value) : "";
  });
}

function getNestedValue(obj: any, path: string): any {
  if (!path || !obj) return obj;

  return path.split(".").reduce((current, key) => {
    if (current === null || current === undefined) return undefined;
    return current[key];
  }, obj);
}

function formatPrice(amount: number): string {
  return (amount / 100).toFixed(2);
}

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatPaymentMethod(method: string): string {
  switch (method) {
    case "hybrid":
      return "Wallet Credit + Card";
    case "wallet":
      return "Wallet Credit Only";
    case "card":
      return "Card Payment";
    default:
      return method;
  }
}

export async function sendOrderCompletionEmail(orderId: string): Promise<void> {
  try {
    // Get simplified order details
    const orderData = await getOrderDetails(orderId);
    if (!orderData) {
      throw new Error(`Order not found: ${orderId}`);
    }

    // Read the HTML template
    const templatePath = join(
      process.cwd(),
      "src/app/(pages)/checkout/(templates)/order_complete.html"
    );
    const template = await readFile(templatePath, "utf-8");

    // Get currency symbol
    const currencySymbol =
      orderData.currency === "GBP" ? "£" : orderData.currency;

    // Process competition entries for template
    const processedEntries: TemplateCompetitionEntry[] =
      orderData.competition_entries.map((entry) => {
        const hasWinningTickets = entry.winning_tickets.length > 0;
        const isWalletCreditPrize = entry.winning_tickets.some(
          (ticket) => ticket.prize.is_wallet_credit
        );

        return {
          title: entry.title,
          ticket_price: formatPrice(entry.ticket_price),
          has_tickets: entry.tickets.length > 0,
          tickets: entry.tickets,
          has_winning_tickets: hasWinningTickets,
          winning_tickets: entry.winning_tickets.map((ticket) => ({
            ticket_number: ticket.ticket_number,
            prize: {
              name: ticket.prize.name,
              is_wallet_credit: ticket.prize.is_wallet_credit,
              credit_amount: ticket.prize.credit_amount,
            },
          })),
          is_wallet_credit_prize: isWalletCreditPrize,
        };
      });

    // Check if there are any winning tickets across all entries
    const hasAnyWinningTickets = orderData.competition_entries.some(
      (entry) => entry.winning_tickets.length > 0
    );

    // Transform order data for template
    const templateData: SimpleTemplateData = {
      order_id: orderData.order_id,
      formatted_date: formatDate(orderData.order_date),
      total_tickets: orderData.total_tickets,
      currency_symbol: currencySymbol,
      formatted_total: formatPrice(orderData.total_amount),
      payment_breakdown: {
        formatted_payment_method: formatPaymentMethod(orderData.payment_method),
        is_hybrid_payment: orderData.payment_method === "hybrid",
        formatted_wallet_amount: formatPrice(
          orderData.payment_breakdown.wallet_amount
        ),
        formatted_card_amount: formatPrice(
          orderData.payment_breakdown.card_amount
        ),
      },
      order_summary: orderData.order_summary,
      has_competition_entries: orderData.competition_entries.length > 0,
      competition_entries: processedEntries,
      has_winning_tickets: hasAnyWinningTickets,
    };

    // Populate the template
    const populatedHtml = populateTemplate(template, templateData);

    // Create subject line with win indication
    const subject = hasAnyWinningTickets
      ? `🏆 Order Complete - You Won! - ${orderId}`
      : `✅ Order Complete - ${orderId}`;

    await sendEmail({
      to: orderData.email,
      subject,
      htmlBody: populatedHtml,
      textBody: `Order ${orderId} has been completed successfully. Total: ${currencySymbol}${formatPrice(
        orderData.total_amount
      )}. ${
        hasAnyWinningTickets ? "Congratulations on your wins! " : ""
      }Thank you for your purchase!`,
    });

    console.log(
      `✅ Order completion email sent for order ${orderId} to ${orderData.email}`
    );
  } catch (error) {
    console.error(
      `❌ Failed to send order completion email for order ${orderId}:`,
      error
    );
    // Don't throw error to avoid breaking the checkout flow
  }
}
