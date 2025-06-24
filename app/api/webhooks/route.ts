import { verifyWebhook } from "@clerk/nextjs/webhooks";
import { db } from "@/db";
import { createWallet } from "@/services/walletService";
import { NextResponse, NextRequest } from "next/server";

interface NewUser {
  clerk_id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  image_url: string | null;
  username: string | null;
}

interface UpdatedUser {
  email: string;
  first_name: string | null;
  last_name: string | null;
  image_url: string | null;
  username: string | null;
}

async function createUser(user: NewUser) {
  // First create the user
  const createdUser = await db
    .insertInto("users")
    .values(user)
    .returningAll()
    .executeTakeFirstOrThrow();

  // Then create a wallet for the user using their database ID
  const walletResult = await createWallet(createdUser.id);

  if (!walletResult.success) {
    // If wallet creation fails, we should handle this appropriately
    // For now, we'll just log the error
    console.error(
      `Failed to create wallet for user ${createdUser.id}: ${walletResult.message}`
    );
  }

  return createdUser;
}

async function updateUser(clerkId: string, userData: UpdatedUser) {
  const updatedUser = await db
    .updateTable("users")
    .set(userData)
    .where("clerk_id", "=", clerkId)
    .returningAll()
    .executeTakeFirstOrThrow();

  return updatedUser;
}

export async function POST(req: NextRequest) {
  try {
    const evt = await verifyWebhook(req);

    const eventType = evt.type;

    if (eventType === "user.created") {
      const {
        id,
        email_addresses,
        first_name,
        last_name,
        image_url,
        username,
      } = evt.data;

      const primaryEmail = email_addresses[0]?.email_address;

      if (!primaryEmail) {
        return NextResponse.json(
          { error: "No primary email found" },
          { status: 400 }
        );
      }

      const newUser: NewUser = {
        clerk_id: id,
        email: primaryEmail,
        first_name,
        last_name,
        image_url,
        username,
      };

      await createUser(newUser);

      return NextResponse.json({ message: "User created successfully" });
    }

    if (eventType === "user.updated") {
      const {
        id,
        email_addresses,
        first_name,
        last_name,
        image_url,
        username,
      } = evt.data;

      const primaryEmail = email_addresses[0]?.email_address;

      if (!primaryEmail) {
        return NextResponse.json(
          { error: "No primary email found" },
          { status: 400 }
        );
      }

      const updatedUserData: UpdatedUser = {
        email: primaryEmail,
        first_name,
        last_name,
        image_url,
        username,
      };

      await updateUser(id, updatedUserData);

      return NextResponse.json({ message: "User updated successfully" });
    }

    return NextResponse.json({ message: "Webhook processed" });
  } catch (err) {
    console.error("Error processing webhook:", err);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 400 }
    );
  }
}
