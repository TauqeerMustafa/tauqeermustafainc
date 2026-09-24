/**
 * GET /api/whatsapp/conversations — message history grouped per contact.
 *
 * Previously this proxied to a Baileys bot server. Now it derives
 * conversations directly from the stored messages in Upstash Redis (KV),
 * which is the same store the webhook + send routes already use.
 */
import { NextResponse } from "next/server";
import { isStoreReady, getMessages, type WAMessage } from "@/lib/wa-store";
import { identifyMessageLine } from "@/lib/wa-numbers";

export type Conversation = {
  jid: string;
  name: string;
  number: string;
  channel: string;
  lineKey: string;
  lineLabel: string;
  lastMessage: string;
  lastTimestamp: string;
  unreadCount: number;
};

export async function GET(request: Request) {
  if (!isStoreReady()) {
    return NextResponse.json({
      success: true,
      data: [],
      notice: "KV not configured — no conversations available.",
    });
  }

  try {
    const { searchParams } = new URL(request.url);
    const channelParam = (searchParams.get("channel") || searchParams.get("line") || "").trim();

    const messages = await getMessages();

    // Group messages strictly by respective WhatsApp line + customer number
    const convMap = new Map<
      string,
      {
        name: string;
        customerNumber: string;
        channel: string;
        lineKey: string;
        lineLabel: string;
        messages: WAMessage[];
      }
    >();

    for (const msg of messages) {
      const line = identifyMessageLine(msg);

      if (channelParam && channelParam !== "all") {
        if (channelParam.startsWith("line")) {
          if (line.lineKey !== channelParam) continue;
        } else if (line.canonicalId !== channelParam && msg.channel !== channelParam) {
          continue;
        }
      }

      // Determine the customer number (not our own phone number id)
      const customerNumber =
        (msg.direction === "inbound" ? msg.from : msg.to) || "";
      const cleanCustomer = customerNumber.replace(/[^0-9]/g, "");
      if (!cleanCustomer) continue;

      const groupKey = `${line.lineKey}_${cleanCustomer}`;

      if (!convMap.has(groupKey)) {
        convMap.set(groupKey, {
          name: msg.name || cleanCustomer,
          customerNumber: cleanCustomer,
          channel: line.canonicalId,
          lineKey: line.lineKey,
          lineLabel: line.label,
          messages: [],
        });
      }

      const conv = convMap.get(groupKey)!;
      conv.messages.push(msg);
      if (msg.name && msg.name !== cleanCustomer) {
        conv.name = msg.name;
      }
    }

    // Build conversation list sorted by last activity
    const conversations: Conversation[] = [];
    for (const [, conv] of convMap) {
      const sorted = conv.messages.sort(
        (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
      const last = sorted[0];
      conversations.push({
        jid: `${conv.customerNumber}@s.whatsapp.net`,
        name: conv.name,
        number: conv.customerNumber,
        channel: conv.channel,
        lineKey: conv.lineKey,
        lineLabel: conv.lineLabel,
        lastMessage: last?.body || `[${last?.type || "message"}]`,
        lastTimestamp: last?.timestamp || new Date().toISOString(),
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
