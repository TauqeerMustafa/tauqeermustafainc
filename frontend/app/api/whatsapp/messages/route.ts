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
  type WAMessage,
} from "@/lib/wa-store";

// Re-exported for callers that still import the type from here.
export type { WAMessage };

export async function GET() {
  try {
    if (!isStoreReady()) {
      return NextResponse.json({
        success: true,
        data: [],
        count: 0,
        notice: "KV not configured — messages not persisted. Create Upstash Redis database on Vercel.",
      });
    }

    const messages = await getMessages();
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
 * DELETE /api/whatsapp/messages?number=<customer>
 * Remove all messages of a conversation, identified by the customer number.
 */
export async function DELETE(request: Request) {
  try {
    if (!isStoreReady()) {
      return NextResponse.json({ success: true, notice: "KV not configured" });
    }

    const { searchParams } = new URL(request.url);
    const number = (searchParams.get("number") || "").replace(/[^0-9]/g, "");
    if (!number) {
      return NextResponse.json({ success: false, error: "number is required" }, { status: 400 });
    }

    const deleted = await deleteConversationMessages(number);
    return NextResponse.json({ success: true, deleted });
  } catch (error) {
    console.error("[messages] DELETE error:", error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
