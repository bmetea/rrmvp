import { verifyWebhook } from "@clerk/nextjs/webhooks";
import { db } from "@/db";
import { createWallet } from "@/(pages)/user/(server)/wallet.service";
import { NextResponse, NextRequest } from "next/server";
import { analytics } from "@/shared/lib/klaviyo";
import { logger } from "@/shared/lib/logger";

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
  try {
    // First check if a user with this email already exists
    const existingUser = await db
      .selectFrom("users")
      .selectAll()
      .where("email", "=", user.email)
      .executeTakeFirst();

    if (existingUser) {
      // Log the duplicate email attempt
      logger.error("Duplicate email sign-up attempt", {
        clerkId: user.clerk_id,
        email: user.email,
        existingClerkId: existingUser.clerk_id,
        existingUserId: existingUser.id,
        signupMethod: "social_login_duplicate",
      });

      return {
        success: false,
        error: "DUPLICATE_EMAIL",
        message: "A user with this email address already exists",
        existingUser,
      };
    }

    // Create the user
    const createdUser = await db
      .insertInto("users")
      .values(user)
      .returningAll()
      .executeTakeFirstOrThrow();

    // Then create a wallet for the user using their database ID
    const walletResult = await createWallet(createdUser.id);

    if (!walletResult.success) {
      // If wallet creation fails, we should handle this appropriately
      logger.error("Failed to create wallet for new user", {
        userId: createdUser.id,
        clerkId: user.clerk_id,
        email: user.email,
        walletError: walletResult.message,
      });
    }

    // Track user sign-up in analytics
    try {
      await analytics.track("Account Created", {
        userId: user.clerk_id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        signup_date: new Date().toISOString(),
        signup_method: "clerk",
        username: user.username,
      });
    } catch (error) {
      logger.error("Failed to track sign-up analytics", {
        clerkId: user.clerk_id,
        email: user.email,
        error: error instanceof Error ? error.message : String(error),
      });
    }

    return {
      success: true,
      user: createdUser,
    };
  } catch (error) {
    // Log any unexpected database errors
    logger.errorWithStack("Unexpected error during user creation", error, {
      clerkId: user.clerk_id,
      email: user.email,
    });

    return {
      success: false,
      error: "DATABASE_ERROR",
      message: "Failed to create user due to database error",
    };
  }
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
        logger.warn("User creation webhook received without primary email", {
          clerkId: id,
          emailAddresses: email_addresses,
        });
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

      const result = await createUser(newUser);

      if (!result.success) {
        if (result.error === "DUPLICATE_EMAIL") {
          return NextResponse.json(
            {
              error: "User with this email already exists",
              message: result.message,
            },
            { status: 409 } // Conflict status code
          );
        }

        return NextResponse.json(
          {
            error: "Failed to create user",
            message: result.message,
          },
          { status: 500 }
        );
      }

      logger.info("User created successfully", {
        clerkId: id,
        email: primaryEmail,
        userId: result.user.id,
      });

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
        logger.warn("User update webhook received without primary email", {
          clerkId: id,
          emailAddresses: email_addresses,
        });
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

      logger.info("User updated successfully", {
        clerkId: id,
        email: primaryEmail,
      });

      return NextResponse.json({ message: "User updated successfully" });
    }

    return NextResponse.json({ message: "Webhook processed" });
  } catch (err) {
    logger.errorWithStack("Error processing webhook", err);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 400 }
    );
  }
}
