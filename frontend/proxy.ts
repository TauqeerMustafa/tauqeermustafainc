/**
 * Server-side auth gate for the WhatsApp API (Next.js 16 "proxy", formerly
 * middleware). The /api/whatsapp/* route handlers are a BFF proxy that read
 * customer conversations from KV and call the Meta Graph API with server-only
 * secrets — they must never be reachable without an authenticated admin.
 *
 * The admin session token lives in the browser (localStorage, sent by the
 * client as `Authorization: Bearer <token>`). We validate it the same way the
 * UI does — by asking the backend who it belongs to — and require role
 * "admin". Runs on the Node.js runtime by default, so backend fetch is fine.
 *
 * Admin *pages* are not gated here: the token is in localStorage and invisible
 * to the proxy on a navigation request, and the pages carry no data on their
 * own (AdminGuard handles the UI redirect). Locking down the data API is what
 * actually closes the leak.
 */
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Endpoints under /api/whatsapp that must stay open to unauthenticated callers:
//   webhook  — Meta calls it; authenticated by WEBHOOK_VERIFY_TOKEN / signature
//   diagnose — ops endpoint, guarded by its own WA_DIAGNOSE_KEY
const OPEN_PATHS = ["/api/whatsapp/webhook", "/api/whatsapp/diagnose"];

function unauthorized(status: number, error: string) {
  return NextResponse.json({ success: false, error }, { status });
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const url = request.nextUrl.clone();
  const hostname = request.headers.get("host") || "";

  // 1. Handle subdomain routing (but ignore API routes)
  if (!pathname.startsWith("/api") && !pathname.startsWith("/admin")) {
    if (hostname.includes("portals.tauqeermustafa.tech") && !pathname.startsWith("/client")) {
      url.pathname = `/client${pathname === "/" ? "" : pathname}`;
      return NextResponse.rewrite(url);
    }

    if (hostname.includes("community.tauqeermustafa.tech") && !pathname.startsWith("/community")) {
      url.pathname = `/community${pathname === "/" ? "" : pathname}`;
      return NextResponse.rewrite(url);
    }
  }

  // 2. Handle WhatsApp API auth gating
  if (pathname.startsWith("/api/whatsapp")) {
    if (OPEN_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`))) {
      return NextResponse.next();
    }

    const match = /^Bearer\s+(.+)$/i.exec(request.headers.get("authorization") || "");
    const token = match?.[1]?.trim();
    if (!token) return unauthorized(401, "Unauthorized");

    const apiBase = process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, "");
    if (!apiBase) return unauthorized(500, "Auth backend not configured");

    try {
      const res = await fetch(`${apiBase}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      });
      if (!res.ok) return unauthorized(401, "Unauthorized");
      const body = await res.json().catch(() => null);
      const role = body?.data?.role ?? body?.role;
      if (role !== "admin") return unauthorized(403, "Forbidden");
    } catch {
      return unauthorized(503, "Auth check failed");
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
