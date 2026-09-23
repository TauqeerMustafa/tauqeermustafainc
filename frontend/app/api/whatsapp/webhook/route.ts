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
 * SCRIPTED LEAD FLOW
 * ──────────────────
 * A stranger's first message is answered with the interactive list in
 * lib/wa-flow, and each tap after that is answered with the step its id names.
 * Keyword rules still handle everyone already in a conversation. See
 * `handleAutoReply` for the order the three take.
 *
 * WHY THIS TALKS TO lib/wa-store DIRECTLY
 * ───────────────────────────────────────
 * It must NOT persist by fetching /api/whatsapp/messages: proxy.ts gates every
 * /api/whatsapp/* route behind an admin bearer token, and a server-to-server
 * fetch carries none — so those writes returned 401 and were silently dropped.
 * The store is import-only, so the auth gate still protects real clients.
 */
import { NextResponse } from "next/server";
import { appSecrets } from "@/lib/wa-accounts";
import { createHmac, timingSafeEqual } from "node:crypto";
import { getChannelDepartment } from "@/lib/wa-numbers";
import {
  appendMessage,
  updateMessageStatus,
  type WAMessage,
} from "@/lib/wa-store";

const GRAPH_URL = "https://graph.facebook.com/v20.0";

// ─── GET: webhook verification handshake ─────────────────────────────────────
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const mode      = searchParams.get("hub.mode");
  const token     = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  const { verifyTokens } = await import("@/lib/wa-accounts");
  const expectedTokens = verifyTokens();
  if (expectedTokens.length === 0) {
    console.error("[webhook] WEBHOOK_VERIFY_TOKEN is not set — cannot verify");
    return new Response("Forbidden", { status: 403 });
  }

  if (mode === "subscribe" && token && expectedTokens.includes(token)) {
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
  const secrets = appSecrets();
  if (secrets.length === 0) {
    // WHATSAPP_APP_SECRET is optional in Meta Cloud API when webhook URL is protected by verify token
    console.warn("[webhook] No WHATSAPP_APP_SECRET configured — accepting webhook payload");
    return true;
  }
  if (!header || !header.startsWith("sha256=")) return false;

  for (const secret of secrets) {
    const expected = "sha256=" + createHmac("sha256", secret).update(raw).digest("hex");
    const a = Buffer.from(expected);
    const b = Buffer.from(header);
    if (a.length === b.length) {
      try {
        if (timingSafeEqual(a, b)) return true;
      } catch {}
    }
  }
  return false;
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
      const entryWabaId = String(entry?.id || "").trim();
      for (const change of entry?.changes ?? []) {
        const value    = change?.value;
        const messages = value?.messages ?? [];
        const rawPhoneId   = String(value?.metadata?.phone_number_id || "").trim();
        const displayPhone = String(value?.metadata?.display_phone_number || "").trim();
        // The number this event arrived on. If Meta sends WABA ID 1083562997861778 or Phone ID 1034864159583818,
        // it belongs to Line 3.
        const phoneId      = rawPhoneId || (entryWabaId === "1083562997861778" ? "1034864159583818" : "");
        const channel      = phoneId || displayPhone || entryWabaId || "";

        for (const msg of messages) {
          const from    = msg.from;         // sender number (digits only)
          const msgType = msg.type;         // "text" | "image" | "audio" | "contacts" | "location" | "unsupported" | ...
          const msgId   = msg.id ?? `msg_${from}_${msg.timestamp ?? ""}`;
          const name    = value?.contacts?.find(
            (c: { wa_id?: string; profile?: { name?: string } }) => c.wa_id === from
          )?.profile?.name;

          // Non-text messages carry no .text.body. Pull whatever text they do
          // have (caption, reaction emoji, button title, location label, error summary, contact name)
          // so the inbox never has to render a blank bubble.
          const media = msg?.image ?? msg?.video ?? msg?.audio ?? msg?.document ?? msg?.sticker;
          const location = msg?.location;
          const contactsRaw = Array.isArray(msg?.contacts) ? msg.contacts : [];
          const systemRaw = msg?.system;
          const orderRaw = msg?.order;
          const errorsRaw = Array.isArray(msg?.errors) ? msg.errors : [];

          // Contacts parsing
          const contactsData = contactsRaw.map((c: any) => {
            const formattedName =
              c?.name?.formatted_name ||
              [c?.name?.first_name, c?.name?.last_name].filter(Boolean).join(" ") ||
              "Contact";
            const phones = (c?.phones || []).map((p: any) => String(p?.phone || p?.wa_id || "")).filter(Boolean);
            const emails = (c?.emails || []).map((e: any) => String(e?.email || "")).filter(Boolean);
            const org = c?.org?.company || c?.org?.title || undefined;
            return { name: formattedName, phones, emails, org };
          });

          // Unsupported / error handling
          let errorDetails: string | undefined;
          let errorCode: number | undefined;
          let unsupportedReason: string | undefined;
          if (msgType === "unsupported" || errorsRaw.length > 0) {
            const firstErr = errorsRaw[0];
            errorCode = firstErr?.code ? Number(firstErr.code) : undefined;
            const errTitle = firstErr?.title || "Unsupported message type";
            errorDetails = firstErr?.error_data?.details || firstErr?.message || errTitle;

            const lower = `${errTitle} ${errorDetails}`.toLowerCase();
            const otpMatch = `${errTitle} ${errorDetails} ${systemRaw?.body || ""} ${msg?.text?.body || ""}`.match(/\b([0-9]{4,8})\b/);
            if (lower.includes("call") || errorCode === 131053) {
              unsupportedReason = "Missed WhatsApp Voice/Video Call";
            } else if (lower.includes("ephemeral") || lower.includes("disappearing")) {
              unsupportedReason = "Disappearing / Ephemeral Message notification";
            } else if (lower.includes("poll")) {
              unsupportedReason = "WhatsApp Poll or Vote";
            } else if (lower.includes("otp") || lower.includes("auth") || lower.includes("verification")) {
              unsupportedReason = otpMatch
                ? `External Authentication / OTP verification notice (Code: ${otpMatch[1]})`
                : "External Authentication / OTP verification notice";
            } else if (errorDetails && errorDetails !== "Message type is not supported") {
              unsupportedReason = `Unsupported message format (${errorDetails})`;
            } else {
              unsupportedReason = `Unsupported message format${errorCode ? ` (Code ${errorCode})` : ""}`;
            }
          }

          // Structured location
          const locationData = location
            ? {
                name: location.name || undefined,
                address: location.address || undefined,
                latitude: typeof location.latitude === "number" ? location.latitude : Number(location.latitude) || undefined,
                longitude: typeof location.longitude === "number" ? location.longitude : Number(location.longitude) || undefined,
                url: location.url || undefined,
              }
            : undefined;

          // Structured system
          const systemData = systemRaw
            ? {
                body: systemRaw.body || undefined,
                type: systemRaw.type || undefined,
              }
            : undefined;

          // Compute readable display text for inbox previews and search
          let text =
            msg?.text?.body ??
            media?.caption ??
            msg?.reaction?.emoji ??
            msg?.button?.text ??
            msg?.interactive?.button_reply?.title ??
            msg?.interactive?.list_reply?.title ??
            "";

          if (!text) {
            if (contactsData.length > 0) {
              const primary = contactsData[0];
              text = `👤 Contact: ${primary.name}${primary.phones?.length ? ` (${primary.phones[0]})` : ""}`;
            } else if (locationData) {
              text = `📍 Location: ${[locationData.name, locationData.address].filter(Boolean).join(", ") || `${locationData.latitude}, ${locationData.longitude}`}`;
            } else if (msg?.interactive?.nfm_reply) {
              text = `📋 Form response received (WhatsApp Flow)`;
            } else if (systemData) {
              text = `⚙️ System: ${systemData.body || systemData.type || "System update"}`;
            } else if (orderRaw) {
              text = `🛒 Order: ${orderRaw.product_items?.length || 1} item(s)`;
            } else if (unsupportedReason) {
              const codeInReason = unsupportedReason.match(/\b([0-9]{4,8})\b/);
              text = codeInReason
                ? `🔐 OTP Verification Code: ${codeInReason[1]} (${unsupportedReason})`
                : `⚠️ ${unsupportedReason}`;
            }
          }

          // What the contact TAPPED, as opposed to what the button said. Titles
          // are copy and get reworded; ids are stable, so this is what a scripted
          // flow branches on.
          const choiceId =
            msg?.interactive?.button_reply?.id ??
            msg?.interactive?.list_reply?.id ??
            msg?.button?.payload ??
            null;

          // Department attribution: prioritize explicit Line 3, 4, 6 IDs or executive tags
          // Detect explicit keyword routing if user explicitly mentions executive desk
          const isDirectFromText = /\[?(executive|direct\s*desk)\]?/i.test(text);

          const dept: "general" | "support" | "direct" = isDirectFromText
            ? "direct"
            : getChannelDepartment(phoneId || displayPhone || channel);

          console.log(`[webhook] Message from ${from} on ${channel} (dept: ${dept}, ${msgType}): ${text.slice(0, 100)}`);

          const storedMessage: WAMessage = {
            id: msgId,
            from,
            to: channel,
            jid: `${from}@s.whatsapp.net`,
            channel,
            department: dept,
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
            ...(errorDetails ? { errorDetails } : {}),
            ...(errorCode ? { errorCode } : {}),
            ...(unsupportedReason ? { unsupportedReason } : {}),
            ...(contactsData.length ? { contactsData } : {}),
            ...(locationData ? { locationData } : {}),
            ...(systemData ? { systemData } : {}),
          };

          // Persist directly to the store for inbox viewing.
          await appendMessage(storedMessage);
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

