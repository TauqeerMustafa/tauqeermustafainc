/**
 * GET    /api/whatsapp/templates          — list saved canned messages.
 * POST   /api/whatsapp/templates          — create/update one ({ name, text }).
 * DELETE /api/whatsapp/templates?name=xyz  — remove one by name.
 */
import { NextResponse } from "next/server";
import { proxyToWA } from "@/lib/wa";

export async function GET() {
  return proxyToWA("/admin-api/templates");
}

export async function POST(request: Request) {
  const body = await request.text();
  return proxyToWA("/admin-api/templates", { method: "POST", body });
}

export async function DELETE(request: Request) {
  const name = new URL(request.url).searchParams.get("name");
  if (!name) {
    return NextResponse.json({ success: false, error: "name query param is required" }, { status: 400 });
  }
  return proxyToWA(`/admin-api/templates/${encodeURIComponent(name)}`, { method: "DELETE" });
}
