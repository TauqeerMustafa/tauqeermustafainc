/**
 * GET /api/whatsapp/messages
 * Proxies to the WhatsApp bot service, which is the single source of truth
 * for message history (JSON-file backed on the bot's persistent disk).
 */
import { proxyToWA } from "@/lib/wa";

export async function GET() {
  return proxyToWA("/admin-api/messages");
}
