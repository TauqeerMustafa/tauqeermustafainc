/**
 * GET  /api/whatsapp/qr     — current login QR (data URL) + status.
 * POST /api/whatsapp/qr     — force logout / regenerate a fresh QR.
 */
import { proxyToWA } from "@/lib/wa";

export async function GET() {
  return proxyToWA("/admin-api/qr");
}

export async function POST() {
  return proxyToWA("/admin-api/logout", { method: "POST" });
}
