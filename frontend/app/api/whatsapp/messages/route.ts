/**
 * GET /api/whatsapp/messages
 * Returns all stored messages (received via webhook + sent via /send)
 *
 * Storage: Upstash Redis (KV)
 */
import { NextResponse } from "next/server";
import { kv, KEYS } from "@/lib/kv";

export type WAMessage = {
  id: string;
  from: string;
  to: string;
  jid?: string;
  name?: string;
  type: string;
  body: string;
  timestamp: string;
  direction: "inbound" | "outbound";
  status?: string;
};

export async function GET() {
  try {
    const messages = (await kv.get<WAMessage[]>(KEYS.messages)) || [];
    return NextResponse.json({
      success: true,
      data: messages,
      count: messages.length,
    });
  } catch (error) {
    console.error("[messages] GET error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to load messages" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/whatsapp/messages
 * Internal: called by webhook + send routes to persist a message
 */
export async function POST(request: Request) {
  try {
    const message: WAMessage = await request.json();
    const messages = (await kv.get<WAMessage[]>(KEYS.messages)) || [];
    messages.push(message);

    // Keep last 1000 messages (prevent unbounded growth)
    const trimmed = messages.slice(-1000);
    await kv.set(KEYS.messages, trimmed);

    return NextResponse.json({ success: true, messageId: message.id });
  } catch (error) {
    console.error("[messages] POST error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to save message" },
      { status: 500 }
    );
  }
}
