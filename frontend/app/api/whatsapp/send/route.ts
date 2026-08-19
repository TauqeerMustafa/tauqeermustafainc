/**
 * POST /api/whatsapp/send
 * Sends a WhatsApp message via Meta Cloud API (Graph API v20).
 *
 * Env vars (set in Vercel):
 *   WHATSAPP_TOKEN          – permanent system-user or temp access token
 *   WHATSAPP_PHONE_NUMBER_ID – the numeric Phone Number ID from the app dashboard
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

export async function POST(request: Request) {
  const token = process.env.WHATSAPP_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;

  if (!token || !phoneNumberId) {
    return NextResponse.json(
      { success: false, error: "WHATSAPP_TOKEN or WHATSAPP_PHONE_NUMBER_ID not configured" },
      { status: 500 }
    );
  }

  try {
    const body = await request.json();
    const { type, to, message, headerText, bodyText, footerText, buttons, template, templateText, metaTemplateName, templateVars } = body;

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

      case "buttons": {
        if (!bodyText || !Array.isArray(buttons) || buttons.length === 0) {
          return NextResponse.json(
            { success: false, error: "bodyText and buttons[] are required" },
            { status: 400 }
          );
        }
        // Meta interactive buttons (up to 3). Button ids must be unique, ≤256 chars.
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
        const def = META_TEMPLATES.find((t) => t.name === metaTemplateName);
        if (!def) {
          return NextResponse.json(
            { success: false, error: `Unknown template: ${metaTemplateName}` },
            { status: 400 }
          );
        }
        const vars: string[] = Array.isArray(templateVars) ? templateVars.map(String) : [];
        const components = buildSendComponents(def, vars);
        payload = {
          messaging_product: "whatsapp",
          to: recipient,
          type: "template",
          template: {
            name: def.name,
            language: { code: def.language },
            ...(components.length ? { components } : {}),
          },
        };
        break;
      }

      default:
        return NextResponse.json(
          { success: false, error: "Invalid type. Use: text | buttons | template" },
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
        if (def) {
          const vars: string[] = Array.isArray(templateVars) ? templateVars.map(String) : [];
          const rendered = def.body.replace(/\{\{\s*(\d+)\s*\}\}/g, (_, n) => vars[Number(n) - 1] ?? `{{${n}}}`);
          metaBody = [def.header, rendered, def.footer].filter(Boolean).join("\n\n");
        }
      }

      const storedMessage = {
        id: messageId,
        from: phoneNumberId,
        to: recipient,
        jid: `${recipient}@s.whatsapp.net`,
        type: type === "buttons" ? "interactive" : type === "meta_template" ? "template" : type,
        body:
          type === "text"
            ? message
            : type === "buttons"
              ? buttonsBody
              : type === "meta_template"
                ? metaBody
                : templateText || template,
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
