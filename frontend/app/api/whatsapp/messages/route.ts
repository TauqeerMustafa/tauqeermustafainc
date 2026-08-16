/**
 * GET /api/whatsapp/messages
 * Fetches all WhatsApp conversation messages stored in the WA service
 */

import { NextResponse } from "next/server";

const WA_SERVICE_URL = process.env.WA_SERVICE_URL || "http://localhost:3001";

// In-memory store for messages (replace with database in production)
let messagesStore: Array<{
  id: string;
  from: string;
  to: string;
  type: string;
  body: string;
  timestamp: string;
  direction: "inbound" | "outbound";
  status?: string;
}> = [];

export async function GET() {
  try {
    // Return stored messages sorted by timestamp descending
    const sortedMessages = [...messagesStore].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    return NextResponse.json({
      success: true,
      data: sortedMessages,
      count: sortedMessages.length,
    });
  } catch (error) {
    console.error("Error fetching WhatsApp messages:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch messages" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Store incoming message from webhook
    if (body.direction === "inbound") {
      messagesStore.push({
        id: body.id || `msg_${Date.now()}`,
        from: body.from,
        to: body.to,
        type: body.type || "text",
        body: body.body,
        timestamp: body.timestamp || new Date().toISOString(),
        direction: "inbound",
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error storing message:", error);
    return NextResponse.json(
      { success: false, error: "Failed to store message" },
      { status: 500 }
    );
  }
}

// Export the messages store for use by webhook
export { messagesStore };
