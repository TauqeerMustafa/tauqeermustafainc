/**
 * GET /api/whatsapp/rules — list auto-reply rules.
 * PUT /api/whatsapp/rules — replace the full rule set ({ rules: [...] }).
 */
import { proxyToWA } from "@/lib/wa";

export async function GET() {
  return proxyToWA("/admin-api/rules");
}

export async function PUT(request: Request) {
  const body = await request.text();
  return proxyToWA("/admin-api/rules", { method: "PUT", body });
}
