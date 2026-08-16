/**
 * POST /api/whatsapp/send
 * Proxy to the WhatsApp bot service. Routes by message type to the matching
 * /send/* endpoint. The bot service records the outbound message itself.
 */
import { NextResponse } from "next/server";
import { waFetch } from "@/lib/wa";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { type, to, message, bodyText, footerText, buttons, template } = body;

    if (!to) {
      return NextResponse.json(
        { success: false, error: "Recipient phone number is required" },
        { status: 400 }
      );
    }

    let endpoint = "";
    let payload: Record<string, unknown> = { to };

    switch (type) {
      case "text":
        if (!message) {
          return NextResponse.json({ success: false, error: "Message text is required" }, { status: 400 });
        }
        endpoint = "/send/text";
        payload.message = message;
        break;

      case "buttons":
        if (!bodyText || !Array.isArray(buttons) || buttons.length === 0) {
          return NextResponse.json({ success: false, error: "Body text and buttons are required" }, { status: 400 });
        }
        endpoint = "/send/buttons";
        payload = { to, bodyText, footerText, buttons };
        break;

      case "template":
        if (!template) {
          return NextResponse.json({ success: false, error: "Template (saved message) name is required" }, { status: 400 });
        }
        endpoint = "/send/template";
        payload.template = template;
        break;

      default:
        return NextResponse.json(
          { success: false, error: "Invalid message type. Use: text, buttons, or template" },
          { status: 400 }
        );
    }

    const response = await waFetch(endpoint, { method: "POST", body: JSON.stringify(payload) });
    const contentType = response.headers.get("content-type") || "";

    if (!contentType.includes("application/json")) {
      const text = await response.text();
      return NextResponse.json(
        { success: false, error: "Bot service returned an invalid response. Is it running?", detail: text.slice(0, 200) },
        { status: 502 }
      );
    }

    const data = await response.json();
    if (!response.ok) {
      return NextResponse.json(
        { success: false, error: data.error || "Failed to send message", detail: data.detail },
        { status: response.status }
      );
    }

    return NextResponse.json({ success: true, messageId: data.messageId, message: "Message sent successfully" });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to send message" },
      { status: 500 }
    );
  }
}
