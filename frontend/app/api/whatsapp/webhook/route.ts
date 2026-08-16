/**
 * POST /api/whatsapp/webhook
 * Receives WhatsApp message events and stores them
 * This endpoint should be called by the WA service webhook handler
 */

import { NextResponse } from "next/server";

// In-memory store (same reference as messages route)
import { messagesStore } from "../messages/route";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Extract message data from Meta webhook format
    if (body.entry) {
      for (const entry of body.entry) {
        for (const change of entry.changes || []) {
          const { value } = change;

          if (value.messages) {
            for (const msg of value.messages) {
              // Store inbound message
              messagesStore.push({
                id: msg.id,
                from: msg.from,
                to: value.metadata?.display_phone_number || "unknown",
                type: msg.type,
                body: msg.text?.body || msg.interactive?.button_reply?.title || `[${msg.type}]`,
                timestamp: new Date(parseInt(msg.timestamp) * 1000).toISOString(),
                direction: "inbound",
              });

              console.log(`📨 Stored WhatsApp message from ${msg.from}`);
            }
          }

          if (value.statuses) {
            for (const status of value.statuses) {
              // Update message status if it exists
              const msg = messagesStore.find((m) => m.id === status.id);
              if (msg) {
                msg.status = status.status;
              }
            }
          }
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error processing webhook:", error);
    return NextResponse.json(
      { success: false, error: "Failed to process webhook" },
      { status: 500 }
    );
  }
}

// Verification endpoint for Meta
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  const VERIFY_TOKEN = process.env.WEBHOOK_VERIFY_TOKEN || "tmi_webhook_2026";

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    console.log("✅ Webhook verified");
    return new NextResponse(challenge, { status: 200 });
  }

  return NextResponse.json({ error: "Verification failed" }, { status: 403 });
}
