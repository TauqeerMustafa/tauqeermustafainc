/**
 * GET /api/whatsapp/numbers — list the WhatsApp Business numbers this app can
 * send from, so the admin UI can offer a "Send from" selector.
 */
import { NextResponse } from "next/server";
import { getWaNumbers } from "@/lib/wa-numbers";

export async function GET() {
  const data = getWaNumbers();
  return NextResponse.json({ success: true, data });
}
