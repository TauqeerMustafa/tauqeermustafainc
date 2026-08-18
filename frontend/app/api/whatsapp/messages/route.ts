/**
 * GET /api/whatsapp/messages
 * Returns all stored messages (received via webhook + sent via /send)
 *
 * Storage: Upstash Redis (KV) when configured, otherwise empty
 */
import { NextResponse } from "next/server";
import { kv, KEYS, isKVConfigured } from "@/lib/kv";

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
    if (!isKVConfigured) {
      return NextResponse.json({
        success: true,
        data: [],
        count: 0,
        notice: "KV not configured — messages not persisted. Create Upstash Redis database on Vercel.",
      });
    }

    const messages = (await kv!.get<WAMessage[]>(KEYS.messages)) || [];
    return NextResponse.json({
      success: true,
      data: messages,
      count: messages.length,
    });
  } catch (error) {
    console.error("[messages] GET error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to load messages", detail: String(error) },
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
    if (!isKVConfigured) {
      console.warn("[messages] POST: KV not configured, message not persisted");
      return NextResponse.json({ success: true, notice: "KV not configured" });
    }

    const message: WAMessage = await request.json();
    const messages = (await kv!.get<WAMessage[]>(KEYS.messages)) || [];
    messages.push(message);

    // Keep last 1000 messages
    const trimmed = messages.slice(-1000);
    await kv!.set(KEYS.messages, trimmed);

    return NextResponse.json({ success: true, messageId: message.id });
  } catch (error) {
    console.error("[messages] POST error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to save message", detail: String(error) },
      { status: 500 }
    );
  }
}
