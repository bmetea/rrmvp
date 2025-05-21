import { verifyWebhook } from "@clerk/nextjs/webhooks";
import { NextRequest } from "next/server";
import { db } from "@/db";
import type { NewUser } from "@/db/types";

export async function POST(req: NextRequest) {
  try {
    const evt = await verifyWebhook(req);

    // Handle user events
    if (evt.type === "user.created") {
      // Get the primary email
      const primaryEmail = evt.data.email_addresses?.find(
        (email) => email.id === evt.data.primary_email_address_id
      )?.email_address;

      if (!primaryEmail) {
        throw new Error("No primary email found");
      }

      // Create new user data
      const newUser:NewUser = {
        clerk_id: evt.data.id,
        email: primaryEmail,
        first_name: evt.data.first_name || null,
        last_name: evt.data.last_name || null,
        image_url: evt.data.image_url || null,
        username: evt.data.username || null,
      } ;

      // Create user in database
      const createdUser = await createUser(newUser);
      console.log(`User ${createdUser.clerk_id} created in database`);
    }

    return new Response("Webhook received", { status: 200 });
  } catch (err) {
    console.error("Error processing webhook:", err);
    return new Response("Error processing webhook", { status: 400 });
  }
}

async function createUser(user: NewUser) {
  return await db
    .insertInto("users")
    .values(user)
    .returningAll()
    .executeTakeFirstOrThrow();
}
