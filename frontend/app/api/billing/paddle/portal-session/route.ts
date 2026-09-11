import { NextResponse } from "next/server";
import {
  createPaddleCustomerPortalSession,
  isPaddleServerConfigured,
} from "@/lib/paddle-server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, customerId } = body;

    const identifier = (customerId || email || "").trim();

    if (!identifier) {
      return NextResponse.json(
        { success: false, message: "Please provide either your client email or Paddle Customer ID." },
        { status: 400 }
      );
    }

    if (!isPaddleServerConfigured()) {
      return NextResponse.json(
        {
          success: false,
          configured: false,
          message:
            "Paddle API key (PADDLE_API_KEY) is not yet configured in server environment.",
        },
        { status: 503 }
      );
    }

    const session = await createPaddleCustomerPortalSession(identifier);

    return NextResponse.json({
      success: true,
      url: session.urls?.general?.overview,
      session,
    });
  } catch (error) {
    console.error("Error creating customer portal session:", error);
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Could not create Customer Portal session. Check customer email.",
      },
      { status: 500 }
    );
  }
}
