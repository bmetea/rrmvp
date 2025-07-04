import { clerkMiddleware } from "@clerk/nextjs/server";
import { logger } from "./app/lib/logger";
import { NextResponse } from "next/server";
import type { NextRequest, NextFetchEvent } from "next/server";

// Create a middleware that combines logging and Clerk authentication
const middleware = async (req: NextRequest, event: NextFetchEvent) => {
  const startTime = Date.now();
  const requestId = req.headers.get("x-request-id") || crypto.randomUUID();

  // Add request context to logger
  logger.addContext({
    requestId,
    path: req.nextUrl.pathname,
    method: req.method,
  });

  try {
    // Execute Clerk middleware
    const response = await clerkMiddleware()(req, event);
    const duration = Date.now() - startTime;

    logger.info("Request completed", {
      duration,
      statusCode: response instanceof NextResponse ? response.status : 200,
    });

    return response;
  } catch (error) {
    const duration = Date.now() - startTime;

    logger.error("Request failed", {
      error: error instanceof Error ? error.message : "Unknown error",
      duration,
    });

    throw error;
  }
};

export default middleware;

export const config = {
  matcher: [
    // Skip Next.js internals, all static files, and allow Apple Pay association file
    "/((?!_next|.well-known/apple-developer-merchantid-domain-association|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Protect all API routes except webhooks
    "/api/((?!webhooks).*)",
    // Protect all tRPC routes
    "/trpc/(.*)",
  ],
};
