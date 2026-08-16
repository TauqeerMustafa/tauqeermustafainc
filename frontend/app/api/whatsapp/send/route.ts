/**
 * POST /api/whatsapp/send
 * Proxy to WA service for sending WhatsApp messages
 */

import { NextResponse } from "next/server";

const WA_SERVICE_URL = process.env.WA_SERVICE_URL || "http://localhost:3001";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { type, to, message, bodyText, footerText, buttons, template, language, components } = body;

    if (!to) {
      return NextResponse.json(
        { success: false, error: "Recipient phone number is required" },
        { status: 400 }
      );
    }

    let endpoint = "";
    let payload: any = { to };

    // Route to correct WA service endpoint based on message type
    switch (type) {
      case "text":
        endpoint = "/send/text";
        if (!message) {
          return NextResponse.json(
            { success: false, error: "Message text is required" },
            { status: 400 }
          );
        }
        payload.message = message;
        break;

      case "buttons":
        endpoint = "/send/buttons";
        if (!bodyText || !buttons || buttons.length === 0) {
          return NextResponse.json(
            { success: false, error: "Body text and buttons are required" },
            { status: 400 }
          );
        }
        payload.bodyText = bodyText;
        payload.footerText = footerText;
        payload.buttons = buttons;
        break;

      case "template":
        endpoint = "/send/template";
        if (!template) {
          return NextResponse.json(
            { success: false, error: "Template name is required" },
            { status: 400 }
          );
        }
        payload.template = template;
        payload.language = language || "en_US";
        if (components) payload.components = components;
        break;

      default:
        return NextResponse.json(
          { success: false, error: "Invalid message type. Use: text, buttons, or template" },
          { status: 400 }
        );
    }

    // Forward request to WA service
    const response = await fetch(`${WA_SERVICE_URL}${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { success: false, error: data.error || "Failed to send message", detail: data.detail },
        { status: response.status }
      );
    }

    // Store sent message
    const storeResponse = await fetch(`${request.url.replace("/send", "/messages")}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: data.messageId || `msg_${Date.now()}`,
        from: "admin",
        to,
        type,
        body: message || bodyText || `Template: ${template}`,
        timestamp: new Date().toISOString(),
        direction: "outbound",
        status: "sent",
      }),
    });

    return NextResponse.json({
      success: true,
      messageId: data.messageId,
      message: "Message sent successfully",
    });
  } catch (error) {
    console.error("Error sending WhatsApp message:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to send message",
      },
      { status: 500 }
    );
  }
}
