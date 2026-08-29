/**
 * GET  /api/whatsapp/qr — Not applicable for Meta Cloud API.
 * POST /api/whatsapp/qr — Not applicable for Meta Cloud API.
 *
 * The QR-code login flow was used by Baileys (unofficial library).
 * With the official Meta Cloud API, authentication is handled via
 * permanent system-user tokens configured in environment variables.
 * These endpoints now return a friendly message explaining this.
 */
import { NextResponse } from "next/server";

const RESPONSE = {
  success: true,
  provider: "meta_cloud_api",
  message:
    "QR code login is not needed. You are using the official Meta WhatsApp Business Cloud API. " +
    "Authentication is handled via the WHATSAPP_TOKEN environment variable configured in Vercel.",
};

export async function GET() {
  return NextResponse.json(RESPONSE);
}

export async function POST() {
  return NextResponse.json(RESPONSE);
}
