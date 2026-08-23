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
  /** Meta media reference for non-text messages (image, video, audio, doc, sticker). */
  mediaId?: string;
  mimeType?: string;
  filename?: string;
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

/**
 * PATCH /api/whatsapp/messages
 * Update a stored message's delivery status by id (used by the webhook for
 * Meta delivery/read receipts). Status only advances forward:
 * sent → delivered → read, with "failed" able to override at any point.
 */
export async function PATCH(request: Request) {
  try {
    if (!isKVConfigured) {
      return NextResponse.json({ success: true, notice: "KV not configured" });
    }

    const { id, status } = await request.json();
    if (!id || !status) {
      return NextResponse.json({ success: false, error: "id and status are required" }, { status: 400 });
    }

    const rank: Record<string, number> = { sent: 1, delivered: 2, read: 3 };
    const messages = (await kv!.get<WAMessage[]>(KEYS.messages)) || [];
    let changed = false;

    for (const m of messages) {
      if (m.id !== id) continue;
      const advance = status === "failed" || (rank[status] ?? 0) > (rank[m.status ?? ""] ?? 0);
      if (advance) {
        m.status = status;
        changed = true;
      }
      break;
    }

    if (changed) await kv!.set(KEYS.messages, messages);
    return NextResponse.json({ success: true, changed });
  } catch (error) {
    console.error("[messages] PATCH error:", error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}

/**
 * DELETE /api/whatsapp/messages?number=<customer>
 * Remove all messages of a conversation, identified by the customer number.
 */
export async function DELETE(request: Request) {
  try {
    if (!isKVConfigured) {
      return NextResponse.json({ success: true, notice: "KV not configured" });
    }

    const { searchParams } = new URL(request.url);
    const number = (searchParams.get("number") || "").replace(/[^0-9]/g, "");
    if (!number) {
      return NextResponse.json({ success: false, error: "number is required" }, { status: 400 });
    }

    // The customer number for a message (prefer jid, else the non-us side).
    const customerOf = (m: WAMessage) => {
      if (m.jid) return m.jid.split("@")[0].split(":")[0].replace(/[^0-9]/g, "");
      const raw = m.direction === "inbound" ? m.from : m.to;
      return (raw || "").replace(/[^0-9]/g, "");
    };

    const messages = (await kv!.get<WAMessage[]>(KEYS.messages)) || [];
    const kept = messages.filter((m) => customerOf(m) !== number);

    await kv!.set(KEYS.messages, kept);
    return NextResponse.json({ success: true, deleted: messages.length - kept.length });
  } catch (error) {
    console.error("[messages] DELETE error:", error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
