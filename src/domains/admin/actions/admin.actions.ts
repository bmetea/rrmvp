"use server";

import { clerkClient } from "@clerk/nextjs/server";
import { auth } from "@clerk/nextjs/server";

export async function isUserAdmin(): Promise<boolean> {
  try {
    const { userId } = await auth();

    if (!userId) {
      return false;
    }

    const client = await clerkClient();
    const user = await client.users.getUser(userId);

    // Check if the user has admin flag in privateMetadata
    return user.privateMetadata?.admin === "true";
  } catch (error) {
    console.error("Error checking admin status:", error);
    return false;
  }
}

export async function getUserMetadata() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return null;
    }

    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    return user.privateMetadata;
  } catch (error) {
    console.error("Error fetching user metadata:", error);
    return null;
  }
}
