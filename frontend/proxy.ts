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

/**
 * Path prefixes that already resolve on the portals host and must NOT be
 * rewritten under /client. The four portals each own a real namespace
 * (see frontend/config/portals.ts), plus /portals is the chooser itself.
 * `/management` was missing from this list, so https://portals…/management/login
 * rewrote to /client/management/login and 404'd.
 */
const PORTAL_PREFIXES = ["/portals", "/admin", "/employees", "/management", "/client"];

const MAIN_SITE_EXACT_PATHS = new Set([
  "/about",
  "/services",
  "/pricing",
  "/portfolio",
  "/careers",
  "/blog",
  "/contact",
  "/success-story",
]);

function isMainSitePath(pathname: string): boolean {
  if (MAIN_SITE_EXACT_PATHS.has(pathname)) return true;
  return (
    pathname.startsWith("/services/") ||
    pathname.startsWith("/portfolio/") ||
    pathname.startsWith("/careers/") ||
    pathname.startsWith("/blog/") ||
    pathname.startsWith("/success-story/")
  );
}

function unauthorized(status: number, error: string) {
  return NextResponse.json({ success: false, error }, { status });
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const url = request.nextUrl.clone();
  const hostname = request.headers.get("host") || "";

  // 0. Static assets, logos, icons, fonts, and public files must never be rewritten by subdomain routing
  if (
    pathname.startsWith("/_next") ||
    pathname === "/favicon.ico" ||
    pathname === "/icon.png" ||
    pathname === "/logo.png" ||
    pathname === "/apple-touch-icon.png" ||
    pathname === "/robots.txt" ||
    pathname === "/sitemap.xml" ||
    /\.(?:png|jpg|jpeg|svg|gif|webp|avif|ico|woff|woff2|ttf|eot|css|js|map|webmanifest|apk)$/i.test(pathname)
  ) {
    if (!pathname.startsWith("/api/whatsapp")) {
      return NextResponse.next();
    }
  }

  // 1. Handle subdomain routing and cross-domain redirects
  if (!pathname.startsWith("/api")) {
    const search = request.nextUrl.search;

    // Cross-subdomain redirect: When a visitor on any subdomain (e.g. portals, docs, support, billing)
    // requests main website pages (e.g. /company-profile, /about, /pricing), redirect cleanly to main domain.
    if (
      !hostname.includes("localhost") &&
      !hostname.includes("127.0.0.1") &&
      hostname !== "tauqeermustafa.tech" &&
      hostname !== "www.tauqeermustafa.tech"
    ) {
      if (isMainSitePath(pathname)) {
        return NextResponse.redirect(`https://tauqeermustafa.tech${pathname}${search}`);
      }
    }

    // Redirect main domain paths to subdomains
    if (hostname === "tauqeermustafa.tech" || hostname === "www.tauqeermustafa.tech") {

      // Policy and legal redirects directly to docs subdomain
      if (pathname === "/privacy") {
        return NextResponse.redirect(`https://docs.tauqeermustafa.tech/privacy${search}`);
      }
      if (pathname === "/terms") {
        return NextResponse.redirect(`https://docs.tauqeermustafa.tech/terms${search}`);
      }
      if (pathname === "/cookies") {
        return NextResponse.redirect(`https://docs.tauqeermustafa.tech/cookies${search}`);
      }
      if (pathname === "/accessibility") {
        return NextResponse.redirect(`https://docs.tauqeermustafa.tech/accessibility${search}`);
      }
      if (pathname.startsWith("/legal/")) {
        const docSlug = pathname.replace(/^\/legal\//, "");
        return NextResponse.redirect(`https://docs.tauqeermustafa.tech/${docSlug}${search}`);
      }
      if (pathname === "/docs" || pathname.startsWith("/docs/")) {
        const docPath = pathname.replace(/^\/docs/, "");
        return NextResponse.redirect(`https://docs.tauqeermustafa.tech${docPath || "/"}${search}`);
      }

      // On main domain, redirect billing, payments, and payouts directly to billing subdomain
      if (pathname === "/pay" || pathname === "/payment" || pathname === "/payments") {
        return NextResponse.redirect(`https://billing.tauqeermustafa.tech/pay${search}`);
      }
      if (pathname === "/payouts" || pathname === "/payout") {
        return NextResponse.redirect(`https://billing.tauqeermustafa.tech/payouts${search}`);
      }
      if (pathname === "/policies" || pathname === "/payment-policy" || pathname === "/refund-policy") {
        return NextResponse.redirect(`https://billing.tauqeermustafa.tech/policies${search}`);
      }
      if (pathname === "/billing" || pathname.startsWith("/billing/")) {
        const billingPath = pathname.replace(/^\/billing/, "");
        return NextResponse.redirect(`https://billing.tauqeermustafa.tech${billingPath || "/"}${search}`);
      }

      // Customer Support & Helpdesk redirects
      if (pathname === "/support" || pathname.startsWith("/support/")) {
        const supportPath = pathname.replace(/^\/support/, "");
        return NextResponse.redirect(`https://support.tauqeermustafa.tech${supportPath || "/"}${search}`);
      }
      if (pathname === "/help" || pathname.startsWith("/help/")) {
        const newPath = pathname.replace(/^\/help/, "");
        return NextResponse.redirect(`https://support.tauqeermustafa.tech${newPath || "/"}${search}`);
      }
      if (pathname === "/ticket" || pathname === "/tickets") {
        return NextResponse.redirect(`https://support.tauqeermustafa.tech/ticket${search}`);
      }
      if (pathname === "/status") {
        return NextResponse.redirect(`https://support.tauqeermustafa.tech/status${search}`);
      }
      if (pathname === "/faq" || pathname === "/faqs") {
        return NextResponse.redirect(`https://support.tauqeermustafa.tech/faq${search}`);
      }

      // Community Network redirects
      if (pathname === "/community" || pathname.startsWith("/community/")) {
        const newPath = pathname.replace(/^\/community/, "");
        return NextResponse.redirect(`https://community.tauqeermustafa.tech${newPath || "/"}${search}`);
      }

      // TMI Portals App redirects (app.tauqeermustafa.tech)
      if (pathname === "/app" || pathname.startsWith("/app/")) {
        const appPath = pathname.replace(/^\/app/, "");
        return NextResponse.redirect(`https://app.tauqeermustafa.tech${appPath || "/"}${search}`);
      }
      if (pathname === "/download" || pathname === "/apk") {
        return NextResponse.redirect(`https://app.tauqeermustafa.tech${search}`);
      }

      // Secure Portals Suite redirects (portals.tauqeermustafa.tech)
      // Disallow serving admin, employees, management, client or chooser directly on main domain
      if (pathname === "/company-profile" || pathname.startsWith("/company-profile/")) {
        return NextResponse.redirect(`https://portals.tauqeermustafa.tech/employees/company-profile${search}`);
      }
      if (pathname === "/admin" || pathname.startsWith("/admin/")) {
        return NextResponse.redirect(`https://portals.tauqeermustafa.tech${pathname}${search}`);
      }
      if (pathname === "/employees" || pathname.startsWith("/employees/")) {
        return NextResponse.redirect(`https://portals.tauqeermustafa.tech${pathname}${search}`);
      }
      if (pathname === "/management" || pathname.startsWith("/management/")) {
        return NextResponse.redirect(`https://portals.tauqeermustafa.tech${pathname}${search}`);
      }
      if (pathname === "/client" || pathname.startsWith("/client/")) {
        return NextResponse.redirect(`https://portals.tauqeermustafa.tech${pathname}${search}`);
      }
      if (pathname === "/portals" || pathname.startsWith("/portals/")) {
        return NextResponse.redirect(`https://portals.tauqeermustafa.tech${pathname}${search}`);
      }
      if (pathname === "/login") {
        return NextResponse.redirect(`https://portals.tauqeermustafa.tech/portals${search}`);
      }
      if (pathname === "/dashboard") {
        return NextResponse.redirect(`https://portals.tauqeermustafa.tech${search}`);
      }
    }

    // Local dev fallbacks for removed legacy paths when not on main domain
    if (pathname === "/privacy") {
      url.pathname = "/docs/privacy";
      return NextResponse.rewrite(url);
    }
    if (pathname === "/terms") {
      url.pathname = "/docs/terms";
      return NextResponse.rewrite(url);
    }
    if (pathname === "/cookies") {
      url.pathname = "/docs/cookies";
      return NextResponse.rewrite(url);
    }
    if (pathname === "/accessibility") {
      url.pathname = "/docs/accessibility";
      return NextResponse.rewrite(url);
    }
    if (pathname.startsWith("/legal/")) {
      const docSlug = pathname.replace(/^\/legal\//, "");
      url.pathname = `/docs/${docSlug}`;
      return NextResponse.rewrite(url);
    }
    if (pathname === "/pay" || pathname === "/payment" || pathname === "/payments") {
      url.pathname = "/billing/pay";
      return NextResponse.rewrite(url);
    }
    if (pathname === "/payouts" || pathname === "/payout") {
      url.pathname = "/billing/payouts";
      return NextResponse.rewrite(url);
    }
    if (pathname === "/help" || pathname.startsWith("/help/")) {
      const newPath = pathname.replace(/^\/help/, "");
      url.pathname = `/support${newPath || ""}`;
      return NextResponse.rewrite(url);
    }

    if (hostname.includes("support.tauqeermustafa.tech") || hostname.includes("help.tauqeermustafa.tech")) {
      if (pathname === "/") {
        url.pathname = "/support";
        return NextResponse.rewrite(url);
      }
      if (pathname === "/ticket" || pathname === "/tickets") {
        url.pathname = "/support/ticket";
        return NextResponse.rewrite(url);
      }
      if (pathname === "/status") {
        url.pathname = "/support/status";
        return NextResponse.rewrite(url);
      }
      if (pathname === "/faq" || pathname === "/faqs") {
        url.pathname = "/support/faq";
        return NextResponse.rewrite(url);
      }
      if (pathname === "/contact") {
        url.pathname = "/support/contact";
        return NextResponse.rewrite(url);
      }
      if (!pathname.startsWith("/support")) {
        url.pathname = `/support${pathname}`;
        return NextResponse.rewrite(url);
      }
    }

    if (hostname.includes("billing.tauqeermustafa.tech")) {
      if (pathname === "/") {
        url.pathname = "/billing";
        return NextResponse.rewrite(url);
      }
      if (pathname === "/pay") {
        url.pathname = "/billing/pay";
        return NextResponse.rewrite(url);
      }
      if (pathname === "/payouts" || pathname === "/payout") {
        url.pathname = "/billing/payouts";
        return NextResponse.rewrite(url);
      }
      if (pathname === "/policies" || pathname === "/payment-policy" || pathname === "/refund-policy") {
        url.pathname = "/billing/policies";
        return NextResponse.rewrite(url);
      }
      if (pathname === "/portal" || pathname === "/customer-portal") {
        url.pathname = "/billing/portal";
        return NextResponse.rewrite(url);
      }
      if (!pathname.startsWith("/billing")) {
        url.pathname = `/billing${pathname}`;
        return NextResponse.rewrite(url);
      }
    }

    if (hostname.includes("docs.tauqeermustafa.tech")) {
      if (pathname === "/") {
        url.pathname = "/docs";
        return NextResponse.rewrite(url);
      }
      if (pathname.startsWith("/legal/")) {
        url.pathname = pathname.replace(/^\/legal/, "/docs");
        return NextResponse.rewrite(url);
      }
      if (!pathname.startsWith("/docs")) {
        url.pathname = `/docs${pathname}`;
        return NextResponse.rewrite(url);
      }
    }

    if (hostname.includes("portals.tauqeermustafa.tech")) {
      if (pathname === "/") {
        url.pathname = "/portals";
        return NextResponse.rewrite(url);
      }
      if (pathname === "/company-profile" || pathname.startsWith("/company-profile/")) {
        url.pathname = "/employees/company-profile";
        return NextResponse.rewrite(url);
      }
      if (!PORTAL_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`))) {
        url.pathname = `/client${pathname}`;
        return NextResponse.rewrite(url);
      }
    }

    if (hostname.includes("community.tauqeermustafa.tech") && !pathname.startsWith("/community")) {
      url.pathname = `/community${pathname === "/" ? "" : pathname}`;
      return NextResponse.rewrite(url);
    }

    if (hostname.includes("app.tauqeermustafa.tech")) {
      if (pathname === "/" || pathname === "/download" || pathname === "/apk") {
        url.pathname = "/app";
        return NextResponse.rewrite(url);
      }
      if (PORTAL_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`))) {
        return NextResponse.next();
      }
      if (pathname.startsWith("/app")) {
        return NextResponse.next();
      }
      return NextResponse.redirect(`https://www.tauqeermustafa.tech${pathname}${request.nextUrl.search}`);
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
    "/((?!_next/static|_next/image|favicon.ico|icon.png|logo.png|apple-touch-icon.png|sitemap.xml|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif|ico|bmp|tiff|woff|woff2|ttf|eot|css|js|webmanifest|apk)).*)",
  ],
};
