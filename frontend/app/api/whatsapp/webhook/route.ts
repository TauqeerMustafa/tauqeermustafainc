/**
 * GET  /api/whatsapp/webhook  — Meta webhook verification (subscribe handshake)
 * POST /api/whatsapp/webhook  — Receive incoming WhatsApp messages + delivery receipts
 *
 * Env vars:
 *   WEBHOOK_VERIFY_TOKEN     – any string you chose when registering the webhook in Meta
 *   WHATSAPP_APP_SECRET      – Meta app secret; enables X-Hub-Signature-256 verification (optional but recommended)
 *   WHATSAPP_TOKEN           – used for auto-reply sends (auto-reply disabled if absent)
 *   WHATSAPP_PHONE_NUMBER_ID – the default sender; see lib/wa-numbers
 *
 * MORE THAN ONE NUMBER
 * ────────────────────
 * One webhook serves every number on the WhatsApp Business Account, and each
 * event names the number it arrived on in `value.metadata.phone_number_id`. That
 * id is stored on the message and used as the sender for the auto-reply, so a
 * customer who writes to the second number is answered by the second number —
 * previously every reply went out from whatever `WHATSAPP_PHONE_NUMBER_ID` held.
 *
 * WHY THIS TALKS TO lib/wa-store DIRECTLY
 * ───────────────────────────────────────
 * It must NOT persist by fetching /api/whatsapp/messages: proxy.ts gates every
 * /api/whatsapp/* route behind an admin bearer token, and a server-to-server
 * fetch carries none — so those writes returned 401 and were silently dropped.
 * The store is import-only, so the auth gate still protects real clients.
 */
import { NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "node:crypto";
import { isKnownNumber, primaryNumberId } from "@/lib/wa-numbers";
import {
  appendMessage,
  updateMessageStatus,
  getRules,
  matchRule,
  type WAMessage,
} from "@/lib/wa-store";

const GRAPH_URL = "https://graph.facebook.com/v20.0";

// ─── GET: webhook verification handshake ─────────────────────────────────────
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const mode      = searchParams.get("hub.mode");
  const token     = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  const expected = process.env.WEBHOOK_VERIFY_TOKEN;
  if (!expected) {
    console.error("[webhook] WEBHOOK_VERIFY_TOKEN is not set — cannot verify");
    return new Response("Forbidden", { status: 403 });
  }

  if (mode === "subscribe" && token === expected) {
    console.log("[webhook] Verification successful");
    return new Response(challenge ?? "", { status: 200 });
  }

  console.warn("[webhook] Verification failed — token mismatch or wrong mode");
  return new Response("Forbidden", { status: 403 });
}

// ─── Signature verification ──────────────────────────────────────────────────
/**
 * Verify Meta's X-Hub-Signature-256 header against the raw request body.
 * Returns true when no app secret is configured (verification opt-in), so an
 * unconfigured deployment still receives messages — but logs the gap.
 */
function signatureValid(raw: string, header: string | null): boolean {
  const secret = process.env.WHATSAPP_APP_SECRET;
  if (!secret) {
    console.warn("[webhook] WHATSAPP_APP_SECRET unset — skipping signature check");
    return true;
  }
  if (!header || !header.startsWith("sha256=")) return false;

  const expected = "sha256=" + createHmac("sha256", secret).update(raw).digest("hex");
  const a = Buffer.from(expected);
  const b = Buffer.from(header);
  if (a.length !== b.length) return false;
  try {
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

// ─── POST: incoming message events ───────────────────────────────────────────
export async function POST(request: Request) {
  try {
    // Read the RAW body first — signature is computed over the exact bytes Meta
    // sent, so we cannot re-serialize a parsed object.
    const raw = await request.text();

    if (!signatureValid(raw, request.headers.get("x-hub-signature-256"))) {
      console.warn("[webhook] Invalid signature — rejecting");
      return NextResponse.json({ error: "invalid signature" }, { status: 401 });
    }

    const body = JSON.parse(raw);

    // Walk the standard Meta webhook envelope
    for (const entry of body?.entry ?? []) {
      for (const change of entry?.changes ?? []) {
        const value    = change?.value;
        const messages = value?.messages ?? [];
        // The number this event arrived on. One webhook serves the whole WABA,
        // so this — not the environment — decides who replies.
        const channel  = String(value?.metadata?.phone_number_id || "");

        for (const msg of messages) {
          const from    = msg.from;         // sender number (digits only)
          const msgType = msg.type;         // "text" | "image" | "audio" | ...
          const msgId   = msg.id ?? `msg_${from}_${msg.timestamp ?? ""}`;
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

          // What the contact TAPPED, as opposed to what the button said. Titles
          // are copy and get reworded; ids are stable, so this is what a scripted
          // flow branches on.
          const choiceId =
            msg?.interactive?.button_reply?.id ??
            msg?.interactive?.list_reply?.id ??
            msg?.button?.payload ??
            null;

          console.log(`[webhook] Message from ${from} on ${channel} (${msgType}): ${text.slice(0, 100)}`);

          const storedMessage: WAMessage = {
            id: msgId,
            from,
            to: channel,
            jid: `${from}@s.whatsapp.net`,
            channel,
            name: name || from,
            type: msgType,
            body: text,
            timestamp: new Date().toISOString(),
            direction: "inbound",
            status: "received",
            // Keep the media reference so the attachment can be retrieved later
            // (Meta media ids stay valid for a limited window).
            ...(media?.id ? { mediaId: media.id } : {}),
            ...(media?.mime_type ? { mimeType: media.mime_type } : {}),
            ...(msg?.document?.filename ? { filename: msg.document.filename } : {}),
            // A voice note is audio with `voice: true`; the inbox plays it inline
            // rather than offering it as a file.
            ...(msg?.audio?.voice ? { voice: true } : {}),
            // Threading: `context.id` is the message being replied to, and a
            // reaction names the message it was applied to.
            ...(msg?.context?.id ? { replyTo: String(msg.context.id) } : {}),
            ...(msg?.reaction?.message_id ? { reactionTo: String(msg.reaction.message_id) } : {}),
            ...(choiceId ? { choiceId: String(choiceId) } : {}),
          };

          // Persist directly to the store. `appendMessage` is idempotent on id;
          // it returns false when this delivery is a Meta retry of one we've
          // already seen — in which case we must NOT auto-reply again.
          const stored = await appendMessage(storedMessage);

          if (stored) {
            await handleAutoReply(from, text, msgId, channel);
          }
        }

        // Delivery / read receipts for our OUTBOUND messages → drive tick status.
        // Meta sends value.statuses = [{ id, status: sent|delivered|read|failed }]
        for (const st of value?.statuses ?? []) {
          const id = st?.id;
          const status = st?.status;
          if (!id || !status) continue;
          await updateMessageStatus(id, status).catch((e) =>
            console.error("[webhook] Failed to update status:", e)
          );
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
/**
 * Answer on the same number the message came in on.
 *
 * `channel` is whatever Meta put in `value.metadata.phone_number_id`. It is
 * checked against the configured list before use: an unrecognised id would be a
 * number this deployment was never set up for, and sending to it would only earn
 * a Graph error, so fall back to the primary instead.
 */
async function handleAutoReply(to: string, incomingText: string, msgId: string, channel: string) {
  const token         = process.env.WHATSAPP_TOKEN;
  const phoneNumberId = isKnownNumber(channel) ? channel : primaryNumberId();
  if (!token || !phoneNumberId || !incomingText) return;

  if (channel && channel !== phoneNumberId) {
    console.warn(
      `[webhook] Message arrived on unconfigured number ${channel} — replying from ${phoneNumberId}. ` +
        "Add it to WHATSAPP_PHONE_NUMBERS so replies go out from the right number."
    );
  }

  try {
    const rule = matchRule(await getRules(), incomingText);
    if (rule) {
      await sendText(token, phoneNumberId, to, rule.reply, msgId);
    }
  } catch (error) {
    console.error("[webhook] Auto-reply error:", error);
  }
}

async function sendText(
  token: string,
  phoneNumberId: string,
  to: string,
  text: string,
  msgId: string
) {
  try {
    // Mark the triggering message as read (blue ticks on the customer side).
    await fetch(`${GRAPH_URL}/${phoneNumberId}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ messaging_product: "whatsapp", status: "read", message_id: msgId }),
    }).catch(() => {});

    // Send the reply
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
      await appendMessage({
        id: messageId,
        from: phoneNumberId,
        to,
        jid: `${to}@s.whatsapp.net`,
        channel: phoneNumberId,
        type: "text",
        body: text,
        timestamp: new Date().toISOString(),
        direction: "outbound",
        status: "sent",
      });
    } else {
      console.error("[webhook] Auto-reply send returned no message id:", data);
    }
  } catch (e) {
    console.error("[webhook] Auto-reply failed:", e);
  }
}
