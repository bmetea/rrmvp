import { verifyWebhook } from "@clerk/nextjs/webhooks";
import { NextRequest } from "next/server";
import { db } from "@/db";

export async function POST(req: NextRequest) {
  try {
    const evt = await verifyWebhook(req);

    // Handle user events
    if (evt.type === "user.created" || evt.type === "user.updated") {
      const {
        id,
        email_addresses,
        first_name,
        last_name,
        image_url,
        username,
      } = evt.data;

      // Get the primary email
      const primaryEmail = email_addresses?.find(
        (email) => email.id === evt.data.primary_email_address_id
      )?.email_address;

      if (!primaryEmail) {
        throw new Error("No primary email found");
      }

      // Insert or update user in database
      await db
        .insertInto("users")
        .values({
          clerk_id: id,
          email: primaryEmail,
          first_name: first_name || null,
          last_name: last_name || null,
          image_url: image_url || null,
          username: username || null,
          created_at: new Date(),
          updated_at: new Date(),
        } as any)
        .onConflict((oc) =>
          oc.column("clerk_id").doUpdateSet({
            email: primaryEmail,
            first_name: first_name || null,
            last_name: last_name || null,
            image_url: image_url || null,
            username: username || null,
            updated_at: new Date(),
          })
        )
        .execute();

      console.log(
        `User ${id} ${
          evt.type === "user.created" ? "created" : "updated"
        } in database`
      );
    }

    return new Response("Webhook received", { status: 200 });
  } catch (err) {
    console.error("Error processing webhook:", err);
    return new Response("Error processing webhook", { status: 400 });
  }
}
