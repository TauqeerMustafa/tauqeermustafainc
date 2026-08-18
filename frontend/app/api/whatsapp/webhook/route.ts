/**
 * GET  /api/whatsapp/webhook  — Meta webhook verification (subscribe handshake)
 * POST /api/whatsapp/webhook  — Receive incoming WhatsApp messages
 *
 * Env vars:
 *   WEBHOOK_VERIFY_TOKEN  – any string you chose when registering the webhook in Meta
 *   WHATSAPP_TOKEN        – used for auto-reply sends (optional; auto-reply disabled if absent)
 *   WHATSAPP_PHONE_NUMBER_ID – used for auto-reply sends
 */
import { NextResponse } from "next/server";

const GRAPH_URL = "https://graph.facebook.com/v20.0";

// ─── GET: webhook verification handshake ─────────────────────────────────────
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const mode      = searchParams.get("hub.mode");
  const token     = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  if (mode === "subscribe" && token === process.env.WEBHOOK_VERIFY_TOKEN) {
    console.log("[webhook] Verification successful");
    return new Response(challenge ?? "", { status: 200 });
  }

  console.warn("[webhook] Verification failed — token mismatch or wrong mode");
  return new Response("Forbidden", { status: 403 });
}

// ─── POST: incoming message events ───────────────────────────────────────────
export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Walk the standard Meta webhook envelope
    for (const entry of body?.entry ?? []) {
      for (const change of entry?.changes ?? []) {
        const value    = change?.value;
        const messages = value?.messages ?? [];

        for (const msg of messages) {
          const from    = msg.from;         // sender number (digits only)
          const msgType = msg.type;         // "text" | "image" | "audio" | ...
          const text    = msg?.text?.body ?? "";
          const msgId   = msg.id ?? `msg_${Date.now()}`;
          const name    = value?.contacts?.find((c: any) => c.wa_id === from)?.profile?.name;

          console.log(`[webhook] Message from ${from} (${msgType}): ${text.slice(0, 100)}`);

          // Store the inbound message
          const storedMessage = {
            id: msgId,
            from,
            to: value?.metadata?.phone_number_id || "",
            jid: `${from}@s.whatsapp.net`,
            name: name || from,
            type: msgType,
            body: text,
            timestamp: new Date().toISOString(),
            direction: "inbound" as const,
            status: "received",
          };

          // Persist to KV (fire-and-forget)
          fetch(`${new URL(request.url).origin}/api/whatsapp/messages`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(storedMessage),
          }).catch((e) => console.error("[webhook] Failed to persist message:", e));

          // Simple auto-reply: mirror the keyword engine from the Baileys bot.
          // Only fires if token + phoneId are configured.
          await handleAutoReply(from, text);
        }
      }
    }

    // Meta requires a fast 200 ACK — always return it
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("[webhook] Error processing message:", error);
    // Still return 200 so Meta doesn't retry endlessly
    return NextResponse.json({ success: true }, { status: 200 });
  }
}

// ─── Auto-reply helper ────────────────────────────────────────────────────────
async function handleAutoReply(to: string, incomingText: string) {
  const token         = process.env.WHATSAPP_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  if (!token || !phoneNumberId || !incomingText) return;

  const lower = incomingText.toLowerCase().trim();

  // Default welcome rule (mirrors the Baileys bot default)
  const greetings = ["hi", "hello", "hey", "salam", "assalam o alaikum"];
  const isGreeting = greetings.some((g) => lower.includes(g));

  if (isGreeting) {
    const reply =
      "👋 Welcome to Tauqeer Mustafa Inc! Thanks for reaching out. " +
      "A team member will reply shortly. Reply *menu* to see options.";
    await sendText(token, phoneNumberId, to, reply);
  }
}

async function sendText(token: string, phoneNumberId: string, to: string, text: string) {
  try {
    await fetch(`${GRAPH_URL}/${phoneNumberId}/messages`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to,
        type: "text",
        text: { body: text, preview_url: false },
      }),
    });
  } catch (e) {
    console.error("[webhook] Auto-reply failed:", e);
  }
}
