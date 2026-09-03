/**
 * POST /api/whatsapp/send
 * Sends a WhatsApp message via Meta Cloud API (Graph API v20).
 *
 * Env vars (set in Vercel):
 *   WHATSAPP_TOKEN             – permanent system-user or temp access token
 *   WHATSAPP_PHONE_NUMBER_ID   – the default Phone Number ID to send from
 *   WHATSAPP_PHONE_NUMBER_ID_2 – a second number on the same WABA (optional)
 *
 * Supported body.type: text | buttons | list | template | meta_template | media | reaction
 *
 * `list` sends an interactive list — up to ten choices in one tap, which is how
 * a first message can offer more than the three a button row allows. Pass
 * `flowStep: "<id>"` to send a step of the scripted lead flow (lib/wa-flow)
 * word-for-word, or `listRows[]` + `listButton` to compose one by hand.
 *
 * Any type may carry `replyTo` (a Meta message id) to post as a threaded reply,
 * and `from` (a configured Phone Number ID) to choose which of the business's
 * numbers it is sent as. `from` is checked against lib/wa-numbers rather than
 * passed to Meta as given, so an admin token cannot send as a number this
 * deployment was never configured with. Omit it and the primary number is used.
 */
import { NextResponse } from "next/server";
import { META_TEMPLATES, buildSendComponents } from "@/lib/meta-templates";
import { flowStep, stepPayload, stepTranscript } from "@/lib/wa-flow";
import { resolveNumberId } from "@/lib/wa-numbers";
import { appendMessage, type WAMessage } from "@/lib/wa-store";

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
      markReadMessageId,
      // threading + reactions
      replyTo,
      emoji,
      reactionTo,
      voice,
      // which of the business's numbers this goes out as
      from,
      phoneNumberId: requestedPhoneNumberId,
      // interactive list
      listRows,
      listButton,
      listTitle,
      /** Send a step of the scripted lead flow verbatim — see lib/wa-flow. */
      flowStep: flowStepId,
    } = body;

    // The sender is chosen by the caller but validated here — see lib/wa-numbers.
    const sender = resolveNumberId(from ?? requestedPhoneNumberId);
    if (!sender.ok) {
      // A bad `from` is the caller's mistake (400); nothing configured at all is
      // the deployment's (500).
      const status = from || requestedPhoneNumberId ? 400 : 500;
      return NextResponse.json({ success: false, error: sender.error }, { status });
    }
    const phoneNumberId = sender.id;

    if (!to) {
      return NextResponse.json(
        { success: false, error: "Recipient phone number is required" },
        { status: 400 }
      );
    }

    const recipient = toE164(to);
    let payload: Record<string, unknown>;
    // Set when the message came from the scripted flow, so the inbox can show
    // the options that were offered instead of a bare question.
    let flowTranscript = "";

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

      case "reaction": {
        // Emoji reactions ride their own message type; an empty emoji removes one.
        const target = reactionTo || replyTo;
        if (!target) {
          return NextResponse.json(
            { success: false, error: "reactionTo (the message id being reacted to) is required" },
            { status: 400 }
          );
        }
        payload = {
          messaging_product: "whatsapp",
          to: recipient,
          type: "reaction",
          reaction: { message_id: String(target), emoji: emoji == null ? "" : String(emoji) },
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
        // Meta interactive reply buttons are hard-capped at 3. A button may be
        // given as plain text, or as { id, title } when the id has to mean
        // something — the webhook branches on the id, never on the title.
        const metaButtons = buttons.slice(0, 3).map((b: string | { id?: string; title?: string }, i: number) => {
          const title = typeof b === "string" ? b : String(b?.title ?? "");
          const id = typeof b === "string" ? `btn_${i}` : String(b?.id || `btn_${i}`);
          return { type: "reply", reply: { id: id.slice(0, 256), title: title.slice(0, 20) } };
        });
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

      case "list": {
        // An interactive list: one tap picks from up to ten rows, which is how a
        // first message can offer more than the three choices a button row holds.
        // Pass `flowStep` to send a step of the scripted lead flow (lib/wa-flow)
        // — that is the wording customers get from the webhook, so a test send
        // and the real thing cannot drift apart.
        if (flowStepId) {
          const step = flowStep(String(flowStepId));
          if (!step) {
            return NextResponse.json(
              { success: false, error: `Unknown flow step: ${flowStepId}` },
              { status: 400 }
            );
          }
          payload = stepPayload(step, recipient);
          flowTranscript = stepTranscript(step);
          break;
        }

        if (!bodyText || !Array.isArray(listRows) || listRows.length === 0) {
          return NextResponse.json(
            { success: false, error: "bodyText and listRows[] are required (or pass flowStep)" },
            { status: 400 }
          );
        }
        const rows = listRows
          .slice(0, 10)
          .map((r: string | { id?: string; title?: string; description?: string }, i: number) => {
            const title = typeof r === "string" ? r : String(r?.title ?? "");
            const id = typeof r === "string" ? `row_${i}` : String(r?.id || `row_${i}`);
            const description = typeof r === "string" ? "" : String(r?.description ?? "");
            return {
              id: id.slice(0, 200),
              title: title.slice(0, 24),
              ...(description ? { description: description.slice(0, 72) } : {}),
            };
          })
          .filter((r) => r.title);
        if (rows.length === 0) {
          return NextResponse.json({ success: false, error: "listRows[] have no titles" }, { status: 400 });
        }
        payload = {
          messaging_product: "whatsapp",
          to: recipient,
          type: "interactive",
          interactive: {
            type: "list",
            ...(headerText ? { header: { type: "text", text: String(headerText).slice(0, 60) } } : {}),
            body: { text: String(bodyText).slice(0, 1024) },
            ...(footerText ? { footer: { text: String(footerText).slice(0, 60) } } : {}),
            action: {
              button: String(listButton || "Choose an option").slice(0, 20),
              sections: [{ title: String(listTitle || "Options").slice(0, 24), rows }],
            },
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
          {
            success: false,
            error: "Invalid type. Use: text | media | buttons | list | template | meta_template | reaction",
          },
          { status: 400 }
        );
    }

    // Threaded reply. Meta accepts `context` on plain and media messages; a
    // reaction already names its target and a template reply is rejected, so
    // those are left alone.
    if (replyTo && (type === "text" || type === "media")) {
      payload.context = { message_id: String(replyTo) };
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
        type === "buttons" || type === "list"
          ? "interactive"
          : type === "meta_template"
            ? "template"
            : type === "media"
              ? String(mediaType || "media")
              : type;

      const storedBody =
        type === "text"
          ? message
          : type === "buttons"
            ? buttonsBody
            : type === "list"
              ? flowTranscript || [headerText, bodyText, footerText].filter(Boolean).join("\n\n")
              : type === "meta_template"
                ? metaBody
                : type === "media"
                  ? mediaBody
                  : type === "reaction"
                    ? String(emoji ?? "")
                    : templateText || template;

      const storedMessage: WAMessage = {
        id: messageId,
        from: phoneNumberId,
        to: recipient,
        jid: `${recipient}@s.whatsapp.net`,
        // Which of our numbers this went out as. `from` already carries it for
        // outbound, but the inbox needs one field that means the same thing in
        // both directions — otherwise a reply can leave from the wrong number.
        channel: phoneNumberId,
        type: storedType,
        body: storedBody,
        timestamp: new Date().toISOString(),
        direction: "outbound",
        status: "sent",
        // Keep the media reference so the inbox can play/preview what we sent
        // instead of showing a bare "[audio]" placeholder.
        ...(type === "media" && mediaId ? { mediaId: String(mediaId) } : {}),
        ...(type === "media" && filename ? { filename: String(filename) } : {}),
        ...(type === "media" && voice ? { voice: true } : {}),
        ...(replyTo ? { replyTo: String(replyTo) } : {}),
        ...(type === "reaction" ? { reactionTo: String(reactionTo || replyTo || "") } : {}),
      };

      // Persist directly to the store — going through /api/whatsapp/messages
      // over HTTP would hit the admin auth gate in proxy.ts (401) and be dropped.
      await appendMessage(storedMessage).catch((e) =>
        console.error("[send] Failed to persist message:", e)
      );
    }

    if (markReadMessageId) {
      await graphPost(phoneNumberId, {
        messaging_product: "whatsapp",
        status: "read",
        message_id: markReadMessageId,
      }).catch((e) => console.error("[send] Failed to send read receipt:", e));
    }

    return NextResponse.json({ success: true, messageId, message: "Message sent successfully" });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to send message" },
      { status: 500 }
    );
  }
}
