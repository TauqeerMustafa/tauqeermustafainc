/**
 * GET /api/whatsapp/conversations — message history grouped per contact.
 */
import { proxyToWA } from "@/lib/wa";

export async function GET() {
  return proxyToWA("/admin-api/conversations");
}
