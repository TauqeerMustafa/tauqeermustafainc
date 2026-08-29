/**
 * GET /api/whatsapp/conversations — message history grouped per contact.
 *
 * Previously this proxied to a Baileys bot server. Now it derives
 * conversations directly from the stored messages in Upstash Redis (KV),
 * which is the same store the webhook + send routes already use.
 */
import { NextResponse } from "next/server";
import { isStoreReady, getMessages, type WAMessage } from "@/lib/wa-store";

export type Conversation = {
  jid: string;
  name: string;
  lastMessage: string;
  lastTimestamp: string;
  unreadCount: number;
};

export async function GET() {
  if (!isStoreReady()) {
    return NextResponse.json({
      success: true,
      data: [],
      notice: "KV not configured — no conversations available.",
    });
  }

  try {
    const messages = await getMessages();

    // Group messages by customer number
    const convMap = new Map<string, { name: string; messages: WAMessage[] }>();

    for (const msg of messages) {
      // Determine the customer number (not our own phone number id)
      const customerNumber =
        msg.direction === "inbound" ? msg.from : msg.to;
      const jid = msg.jid || `${customerNumber}@s.whatsapp.net`;
      const key = customerNumber.replace(/[^0-9]/g, "");

      if (!key) continue;

      if (!convMap.has(key)) {
        convMap.set(key, {
          name: msg.name || key,
          messages: [],
        });
      }

      const conv = convMap.get(key)!;
      conv.messages.push(msg);
      // Use the most informative name available
      if (msg.name && msg.name !== key) {
        conv.name = msg.name;
      }
    }

    // Build conversation list sorted by last activity
    const conversations: Conversation[] = [];
    for (const [key, conv] of convMap) {
      const sorted = conv.messages.sort(
        (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
      const last = sorted[0];
      conversations.push({
        jid: `${key}@s.whatsapp.net`,
        name: conv.name,
        lastMessage: last.body || `[${last.type}]`,
        lastTimestamp: last.timestamp,
        unreadCount: 0,
      });
    }

    // Sort by most recent first
    conversations.sort(
      (a, b) => new Date(b.lastTimestamp).getTime() - new Date(a.lastTimestamp).getTime()
    );

    return NextResponse.json({ success: true, data: conversations });
  } catch (error) {
    console.error("[conversations] GET error:", error);
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}

