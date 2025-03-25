import { NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";

export const dynamic = "force-dynamic";

// A faulty API route to test Sentry's error monitoring
export async function GET() {
  try {
    throw new Error("Sentry Example API Route Error");
    return NextResponse.json({ data: "Testing Sentry Error..." });
  } catch (error) {
    // Capture the error in Sentry
    Sentry.captureException(error);

    // Return error response
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
