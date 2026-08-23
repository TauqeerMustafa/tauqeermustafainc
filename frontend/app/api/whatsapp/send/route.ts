/**
 * POST /api/whatsapp/send
 * Sends a WhatsApp message via Meta Cloud API (Graph API v20).
 *
 * Env vars (set in Vercel):
 *   WHATSAPP_TOKEN             – permanent system-user or temp access token
 *   WHATSAPP_PHONE_NUMBER_ID   – the Phone Number ID to send from
 *
 * Supported body.type: text | buttons | template | meta_template | media
 */
import { NextResponse } from "next/server";
import { META_TEMPLATES, buildSendComponents } from "@/lib/meta-templates";

const GRAPH_URL = "https://graph.facebook.com/v20.0";

function metaHeaders() {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
  };
}

/** Normalize to international digits only — Meta rejects "+" prefix */
function toE164(raw: string): string {
  return raw.replace(/[^0-9]/g, "");
}

async function graphPost(phoneNumberId: string, body: object) {
  const res = await fetch(`${GRAPH_URL}/${phoneNumberId}/messages`, {
    method: "POST",
    headers: metaHeaders(),
    body: JSON.stringify(body),
    cache: "no-store",
  });
  const json = await res.json();
  return { ok: res.ok, status: res.status, json };
}

const MEDIA_KINDS = ["image", "video", "audio", "document", "sticker"] as const;
type MediaKind = (typeof MEDIA_KINDS)[number];

export async function POST(request: Request) {
  const token = process.env.WHATSAPP_TOKEN;

  if (!token) {
    return NextResponse.json(
      { success: false, error: "WHATSAPP_TOKEN not configured" },
      { status: 500 }
    );
  }

  try {
    const body = await request.json();
    const {
      type,
      to,
      message,
      headerText,
      bodyText,
      footerText,
      buttons,
      template,
      templateText,
      metaTemplateName,
      templateVars,
      // media
      mediaType,
      mediaId,
      mediaLink,
      caption,
      filename,
    } = body;

    const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID?.trim();
    if (!phoneNumberId) {
      return NextResponse.json(
        { success: false, error: "WHATSAPP_PHONE_NUMBER_ID is not configured" },
        { status: 500 }
      );
    }

    if (!to) {
      return NextResponse.json(
        { success: false, error: "Recipient phone number is required" },
        { status: 400 }
      );
    }

    const recipient = toE164(to);
    let payload: Record<string, unknown>;

    switch (type) {
      case "text": {
        if (!message) {
          return NextResponse.json({ success: false, error: "message is required" }, { status: 400 });
        }
        payload = {
          messaging_product: "whatsapp",
          to: recipient,
          type: "text",
          text: { body: message, preview_url: false },
        };
        break;
      }

      case "media": {
        const kind = String(mediaType || "").toLowerCase() as MediaKind;
        if (!MEDIA_KINDS.includes(kind)) {
          return NextResponse.json(
            { success: false, error: "mediaType must be one of image, video, audio, document, sticker" },
            { status: 400 }
          );
        }
        if (!mediaId && !mediaLink) {
          return NextResponse.json(
            { success: false, error: "Provide mediaId (uploaded) or mediaLink (public https URL)" },
            { status: 400 }
          );
        }
        const mediaObj: Record<string, unknown> = mediaId ? { id: mediaId } : { link: mediaLink };
        // Captions: allowed on image/video/document only. filename: document only.
        if (caption && (kind === "image" || kind === "video" || kind === "document")) {
          mediaObj.caption = String(caption);
        }
        if (kind === "document" && filename) mediaObj.filename = String(filename);
        payload = {
          messaging_product: "whatsapp",
          to: recipient,
          type: kind,
          [kind]: mediaObj,
        };
        break;
      }

      case "buttons": {
        if (!bodyText || !Array.isArray(buttons) || buttons.length === 0) {
          return NextResponse.json(
            { success: false, error: "bodyText and buttons[] are required" },
            { status: 400 }
          );
        }
        // Meta interactive reply buttons are hard-capped at 3.
        const metaButtons = buttons.slice(0, 3).map((b: string, i: number) => ({
          type: "reply",
          reply: { id: `btn_${i}`, title: String(b).slice(0, 20) },
        }));
        payload = {
          messaging_product: "whatsapp",
          to: recipient,
          type: "interactive",
          interactive: {
            type: "button",
            ...(headerText ? { header: { type: "text", text: String(headerText).slice(0, 60) } } : {}),
            body: { text: bodyText },
            ...(footerText ? { footer: { text: String(footerText).slice(0, 60) } } : {}),
            action: { buttons: metaButtons },
          },
        };
        break;
      }

      case "template": {
        // "template" here is the saved canned-message TEXT (not a Meta-approved template).
        // Send it as a plain text message so it works immediately without Meta approval.
        // NOTE: this only reaches the recipient inside the 24h customer-service window.
        const text = templateText || template;
        if (!text) {
          return NextResponse.json({ success: false, error: "template text is required" }, { status: 400 });
        }
        payload = {
          messaging_product: "whatsapp",
          to: recipient,
          type: "text",
          text: { body: text, preview_url: false },
        };
        break;
      }

      case "meta_template": {
        // Business-initiated: send a Meta-APPROVED template. This is the ONLY way
        // to message someone outside the 24h window / who never texted first.
        const vars: string[] = Array.isArray(templateVars) ? templateVars.map(String) : [];
        const def = META_TEMPLATES.find((t) => t.name === metaTemplateName);

        let templatePayload: Record<string, unknown>;
        if (def) {
          const components = buildSendComponents(def, vars);
          templatePayload = {
            name: def.name,
            language: { code: def.language },
            ...(components.length ? { components } : {}),
          };
        } else if (metaTemplateName) {
          // Approved template that lives only in Meta (not in our predefined list).
          const langCode = body.templateLanguage || "en_US";
          const components = vars.length
            ? [{ type: "body", parameters: vars.map((v) => ({ type: "text", text: v })) }]
            : [];
          templatePayload = {
            name: metaTemplateName,
            language: { code: langCode },
            ...(components.length ? { components } : {}),
          };
        } else {
          return NextResponse.json(
            { success: false, error: `Unknown template: ${metaTemplateName}` },
            { status: 400 }
          );
        }

        payload = {
          messaging_product: "whatsapp",
          to: recipient,
          type: "template",
          template: templatePayload,
        };
        break;
      }

      default:
        return NextResponse.json(
          { success: false, error: "Invalid type. Use: text | media | buttons | template | meta_template" },
          { status: 400 }
        );
    }

    const { ok, status, json: data } = await graphPost(phoneNumberId, payload);

    if (!ok) {
      const errMsg = data?.error?.message || "Meta API error";
      return NextResponse.json({ success: false, error: errMsg, detail: data }, { status });
    }

    const messageId = data?.messages?.[0]?.id ?? null;

    // Store the outbound message
    if (messageId) {
      // For button messages, compose header + body + footer so the inbox reflects what was sent
      const buttonsBody = [headerText, bodyText, footerText].filter(Boolean).join("\n\n");

      // For Meta templates, render header + variable-substituted body + footer
      let metaBody = "";
      if (type === "meta_template") {
        const def = META_TEMPLATES.find((t) => t.name === metaTemplateName);
        const vars: string[] = Array.isArray(templateVars) ? templateVars.map(String) : [];
        if (def) {
          const rendered = def.body.replace(/\{\{\s*(\d+)\s*\}\}/g, (_, n) => vars[Number(n) - 1] ?? `{{${n}}}`);
          metaBody = [def.header, rendered, def.footer].filter(Boolean).join("\n\n");
        } else {
          metaBody = `[template: ${metaTemplateName}]${vars.length ? ` ${vars.join(", ")}` : ""}`;
        }
      }

      // For media, show a readable line in the inbox
      let mediaBody = "";
      if (type === "media") {
        const kind = String(mediaType || "media");
        mediaBody = caption ? `[${kind}] ${caption}` : filename ? `[${kind}] ${filename}` : `[${kind}]`;
      }

      const storedType =
        type === "buttons" ? "interactive" : type === "meta_template" ? "template" : type === "media" ? String(mediaType || "media") : type;

      const storedBody =
        type === "text"
          ? message
          : type === "buttons"
            ? buttonsBody
            : type === "meta_template"
              ? metaBody
              : type === "media"
                ? mediaBody
                : templateText || template;

      const storedMessage = {
        id: messageId,
        from: phoneNumberId,
        to: recipient,
        jid: `${recipient}@s.whatsapp.net`,
        type: storedType,
        body: storedBody,
        timestamp: new Date().toISOString(),
        direction: "outbound" as const,
        status: "sent",
      };

      // Persist to KV (fire-and-forget, don't block response)
      fetch(`${new URL(request.url).origin}/api/whatsapp/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(storedMessage),
      }).catch((e) => console.error("[send] Failed to persist message:", e));
    }

    return NextResponse.json({ success: true, messageId, message: "Message sent successfully" });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to send message" },
      { status: 500 }
    );
  }
}
