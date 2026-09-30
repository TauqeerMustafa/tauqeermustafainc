/**
 * /api/whatsapp/messages — client-facing message store API.
 *
 * The admin panel reads and mutates the WhatsApp inbox through here (allowed by
 * proxy.ts with an admin bearer token). All the actual KV logic — idempotent
 * append, forward-only status ranking, conversation delete — lives in
 * lib/wa-store so the webhook and /send handlers share exactly one
 * implementation. This route is a thin HTTP wrapper over it.
 */
import { NextResponse } from "next/server";
import {
  isStoreReady,
  getMessages,
  appendMessage,
  updateMessageStatus,
  deleteConversationMessages,
  deleteMessageById,
  deleteMessagesByIds,
  purgeMessages,
  type WAMessage,
} from "@/lib/wa-store";

import { identifyMessageLine } from "@/lib/wa-numbers";

// Re-exported for callers that still import the type from here.
export type { WAMessage };

export async function GET(request: Request) {
  try {
    if (!isStoreReady()) {
      return NextResponse.json({
        success: true,
        data: [],
        count: 0,
        notice: "KV not configured — messages not persisted. Create Upstash Redis database on Vercel.",
      });
    }

    const { searchParams } = new URL(request.url);
    const channelParam = (searchParams.get("channel") || searchParams.get("line") || "").trim();

    let messages = await getMessages();

    if (channelParam && channelParam !== "all") {
      messages = messages.filter((m) => {
        const line = identifyMessageLine(m);
        if (channelParam.startsWith("line")) {
          return line.lineKey === channelParam;
        }
        return line.canonicalId === channelParam || m.channel === channelParam;
      });
    }

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
 * Persist a message. Idempotent on id (see wa-store.appendMessage).
 */
export async function POST(request: Request) {
  try {
    if (!isStoreReady()) {
      console.warn("[messages] POST: KV not configured, message not persisted");
      return NextResponse.json({ success: true, notice: "KV not configured" });
    }

    const message: WAMessage = await request.json();
    const stored = await appendMessage(message);
    return NextResponse.json({ success: true, messageId: message.id, stored });
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
 * Update a stored message's delivery status by id. Status only advances forward:
 * sent → delivered → read, with "failed" able to override at any point.
 */
export async function PATCH(request: Request) {
  try {
    if (!isStoreReady()) {
      return NextResponse.json({ success: true, notice: "KV not configured" });
    }

    const { id, status } = await request.json();
    if (!id || !status) {
      return NextResponse.json({ success: false, error: "id and status are required" }, { status: 400 });
    }

    const changed = await updateMessageStatus(id, status);
    return NextResponse.json({ success: true, changed });
  } catch (error) {
    console.error("[messages] PATCH error:", error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}

/**
 * DELETE /api/whatsapp/messages
 * Programmatic deletion:
 *  - Delete single message: ?id=<msgId> or body { id }
 *  - Delete bulk messages: ?ids=<id1,id2> or body { ids: [...] }
 *  - Delete conversation: ?number=<customer> or body { number }
 *  - Purge failed/old: ?purge=failed
 */
export async function DELETE(request: Request) {
  try {
    if (!isStoreReady()) {
      return NextResponse.json({ success: true, notice: "KV not configured" });
    }

    const { searchParams } = new URL(request.url);
    let body: Record<string, any> = {};
    try {
      body = await request.json();
    } catch {}

    const id = (searchParams.get("id") || body.id || "").trim();
    const idsParam = searchParams.get("ids");
    const ids: string[] = Array.isArray(body.ids)
      ? body.ids.map(String)
      : idsParam
      ? idsParam.split(",").map((s) => s.trim()).filter(Boolean)
      : [];

    const number = (searchParams.get("number") || body.number || "").replace(/[^0-9]/g, "");
    const channel = searchParams.get("channel") || body.channel || undefined;
    const purge = (searchParams.get("purge") || body.purge || "").trim();

    // 1. Single message deletion
    if (id) {
      const deleted = await deleteMessageById(id);
      return NextResponse.json({ success: true, mode: "single", id, deleted });
    }

    // 2. Bulk messages deletion
    if (ids.length > 0) {
      const count = await deleteMessagesByIds(ids);
      return NextResponse.json({ success: true, mode: "bulk", count, requested: ids.length });
    }

    // 3. Purge failed messages
    if (purge === "failed") {
      const purged = await purgeMessages({ failedOnly: true });
      return NextResponse.json({ success: true, mode: "purge_failed", purged });
    }

    // 4. Conversation deletion by phone number
    if (number) {
      const deleted = await deleteConversationMessages(number, channel);
      return NextResponse.json({ success: true, mode: "conversation", number, deleted });
    }

    return NextResponse.json(
      {
        success: false,
        error: "Missing delete criteria. Specify 'id', 'ids', 'number', or 'purge=failed'.",
      },
      { status: 400 }
    );
  } catch (error) {
    console.error("[messages] DELETE error:", error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
