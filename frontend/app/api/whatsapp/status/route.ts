/**
 * GET /api/whatsapp/status — WhatsApp Business API connection status.
 * Since we use the official Meta Cloud API (not Baileys), the connection
 * is always "open" as long as the token + at least one phone number ID are
 * configured. `numbers` lists every sender this deployment has; `phoneNumberId`
 * is kept as the primary for callers that predate the second number.
 */
import { NextResponse } from "next/server";
import { waNumbers } from "@/lib/wa-numbers";

export async function GET() {
  const accounts = usableAccounts();
  const numbers = waNumbers();

  if (accounts.length === 0 || numbers.length === 0) {
    return NextResponse.json({
      success: true,
      status: "disconnected",
      reason: accounts.length === 0
        ? "No usable WhatsApp app credentials (WHATSAPP_TOKEN) configured."
        : "No sending number is configured. Set WHATSAPP_PHONE_NUMBER_ID.",
      numbers: [],
    });
  }

  return NextResponse.json({
    success: true,
    status: "connected",
    provider: "meta_cloud_api",
    phoneNumberId: numbers.find((n) => n.primary)?.id ?? numbers[0].id,
    numbers,
  });
}
