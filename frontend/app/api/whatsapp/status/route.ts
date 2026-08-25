/**
 * GET /api/whatsapp/status — connection state of the bot (connecting/qr/open).
 */
import { proxyToWA } from "@/lib/wa";

export async function GET() {
  return proxyToWA("/admin-api/status");
}
