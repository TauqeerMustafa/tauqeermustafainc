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
          const msgId   = msg.id ?? `msg_${Date.now()}`;
          const name    = value?.contacts?.find((c: any) => c.wa_id === from)?.profile?.name;

          // Non-text messages carry no .text.body. Pull whatever text they do
          // have (caption, reaction emoji, button title, location label) so the
          // inbox never has to render a blank bubble.
          const media = msg?.image ?? msg?.video ?? msg?.audio ?? msg?.document ?? msg?.sticker;
          const location = msg?.location;
          const text =
            msg?.text?.body ??
            media?.caption ??
            msg?.reaction?.emoji ??
            msg?.button?.text ??
            msg?.interactive?.button_reply?.title ??
            msg?.interactive?.list_reply?.title ??
            (location
              ? [location.name, location.address].filter(Boolean).join(", ") ||
                `${location.latitude}, ${location.longitude}`
              : "");

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
            // Keep the media reference so the attachment can be retrieved later
            // (Meta media ids stay valid for a limited window).
            ...(media?.id ? { mediaId: media.id } : {}),
            ...(media?.mime_type ? { mimeType: media.mime_type } : {}),
            ...(msg?.document?.filename ? { filename: msg.document.filename } : {}),
          };

          // Persist to KV
          await fetch(`${new URL(request.url).origin}/api/whatsapp/messages`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(storedMessage),
          }).catch((e) => console.error("[webhook] Failed to persist message:", e));

          // Simple auto-reply: keyword-matching engine for automated responses.
          // Only fires if token + phoneId are configured.
          await handleAutoReply(request.url, from, text, msgId);
        }

        // Delivery / read receipts for our OUTBOUND messages → drive tick status.
        // Meta sends value.statuses = [{ id, status: sent|delivered|read|failed }]
        for (const st of value?.statuses ?? []) {
          const id = st?.id;
          const status = st?.status;
          if (!id || !status) continue;
          await fetch(`${new URL(request.url).origin}/api/whatsapp/messages`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id, status }),
          }).catch((e) => console.error("[webhook] Failed to update status:", e));
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
async function handleAutoReply(requestUrl: string, to: string, incomingText: string, msgId: string) {
  const token         = process.env.WHATSAPP_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  if (!token || !phoneNumberId || !incomingText) return;

  const lower = incomingText.toLowerCase().trim();

  try {
    // Fetch saved auto-reply rules from the API
    const origin = new URL(requestUrl).origin;
    const rulesRes = await fetch(`${origin}/api/whatsapp/rules`);
    if (!rulesRes.ok) {
      console.error("[webhook] Failed to fetch rules, using default");
      return;
    }

    const rulesData = await rulesRes.json();
    const rules = rulesData.data || [];

    // Check each enabled rule
    for (const rule of rules) {
      if (!rule.enabled) continue;

      const keywords = rule.keyword.split(',').map((k: string) => k.trim().toLowerCase());
      let matched = false;

      if (rule.mode === "contains") {
        matched = keywords.some((kw: string) => lower.includes(kw));
      } else if (rule.mode === "equals") {
        matched = keywords.some((kw: string) => lower === kw);
      } else if (rule.mode === "starts") {
        matched = keywords.some((kw: string) => lower.startsWith(kw));
      } else if (rule.mode === "regex") {
        // Advanced: the keyword field is a regular expression (case-insensitive).
        try {
          matched = new RegExp(rule.keyword, "i").test(incomingText);
        } catch {
          console.warn(`[webhook] Invalid regex in rule ${rule.id}: ${rule.keyword}`);
        }
      }

      if (matched) {
        await sendText(token, phoneNumberId, to, rule.reply, requestUrl, msgId);
        break; // Only send first matching rule
      }
    }
  } catch (error) {
    console.error("[webhook] Auto-reply error:", error);
  }
}

async function sendText(token: string, phoneNumberId: string, to: string, text: string, requestUrl: string, msgId: string) {
  try {
    // Send read receipt
    await fetch(`${GRAPH_URL}/${phoneNumberId}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ messaging_product: "whatsapp", status: "read", message_id: msgId }),
    });

    // Send reply
    const res = await fetch(`${GRAPH_URL}/${phoneNumberId}/messages`, {
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
    const data = await res.json();
    const messageId = data?.messages?.[0]?.id;

    if (messageId) {
      const storedMessage = {
        id: messageId,
        from: phoneNumberId,
        to,
        jid: `${to}@s.whatsapp.net`,
        type: "text",
        body: text,
        timestamp: new Date().toISOString(),
        direction: "outbound" as const,
        status: "sent",
      };
      await fetch(`${new URL(requestUrl).origin}/api/whatsapp/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(storedMessage),
      });
    }
  } catch (e) {
    console.error("[webhook] Auto-reply failed:", e);
  }
}
