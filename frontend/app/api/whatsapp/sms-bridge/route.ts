import { NextResponse } from "next/server";
import { appendMessage, type WAMessage } from "@/lib/wa-store";
import { verifyTokens } from "@/lib/wa-accounts";

/**
 * POST /api/whatsapp/sms-bridge
 *
 * Inbound SMS & OTP Webhook Bridge.
 * Allows receiving incoming cellular SMS / 2FA OTP codes directly into the WhatsApp Inbox
 * without delinking or deregistering your phone number from WhatsApp Cloud API.
 *
 * Supported Integrations:
 * - Android SMS Forwarder Apps (e.g. "SMS Forwarder", "MacroDroid", "Tasker")
 * - GSM Modems / Hardware SIM Gateways
 * - Twilio / Vonage Inbound Webhooks
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();

    // 1. Optional Security Token Validation
    const expectedTokens = verifyTokens();
    const providedSecret =
      body.secret ||
      body.token ||
      request.headers.get("x-sms-bridge-token") ||
      request.headers.get("x-verify-token");

    // If expected tokens exist and user sent a token, verify it
    if (expectedTokens.length > 0 && providedSecret) {
      if (!expectedTokens.includes(providedSecret)) {
        return NextResponse.json({ error: "Unauthorized token" }, { status: 401 });
      }
    }

    // 2. Extract Fields (supports multiple forwarder app payload schemas)
    const sender = String(body.from || body.sender || body.phone || body.originatingAddress || "SMS Gateway").trim();
    const rawText = String(body.body || body.message || body.text || body.content || "").trim();
    const channel = String(body.channel || body.sim || body.slot || "Line 1 (PK)").trim();
    const timestamp = body.timestamp ? new Date(body.timestamp).toISOString() : new Date().toISOString();

    if (!rawText) {
      return NextResponse.json({ error: "Message body is required" }, { status: 400 });
    }

    // 3. Extract OTP if present
    const otpMatch = rawText.match(/\b([0-9]{4,8})\b/);
    const otpCode = otpMatch ? otpMatch[1] : null;

    // 4. Construct WAMessage object
    const cleanFrom = sender.replace(/[^0-9+]/g, "") || sender;
    const msgId = `sms_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

    const message: WAMessage = {
      id: msgId,
      from: cleanFrom,
      to: "admin",
      type: "text",
      body: `📱 [Cellular SMS] ${rawText}`,
      timestamp,
      direction: "inbound",
      status: "delivered",
      channel: channel,
      department: "general",
    };

    // 5. Append directly to WhatsApp message store
    await appendMessage(message);

    console.log(`[sms-bridge] Inbound SMS from ${cleanFrom} stored. OTP: ${otpCode || "None"}`);

    return NextResponse.json({
      success: true,
      messageId: msgId,
      extractedOtp: otpCode,
      message: "SMS successfully forwarded to WhatsApp Admin Inbox",
    });
  } catch (error) {
    console.error("[sms-bridge] Error processing inbound SMS:", error);
    return NextResponse.json(
      { error: "Internal server error", detail: String(error) },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    status: "active",
    endpoint: "/api/whatsapp/sms-bridge",
    instructions: "Send POST requests with JSON: { from: '+1...', body: 'Your code is 123456' }",
  });
}
