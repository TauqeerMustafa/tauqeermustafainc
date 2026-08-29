/**
 * GET /api/whatsapp/status — WhatsApp Business API connection status.
 * Since we use the official Meta Cloud API (not Baileys), the connection
 * is always "open" as long as the token + phone number ID are configured.
 */
import { NextResponse } from "next/server";

export async function GET() {
  const token = process.env.WHATSAPP_TOKEN;
  const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;

  if (!token || !phoneId) {
    return NextResponse.json({
      success: true,
      status: "disconnected",
      reason: "WHATSAPP_TOKEN or WHATSAPP_PHONE_NUMBER_ID not configured in environment variables.",
    });
  }

  return NextResponse.json({
    success: true,
    status: "connected",
    provider: "meta_cloud_api",
    phoneNumberId: phoneId,
  });
}
