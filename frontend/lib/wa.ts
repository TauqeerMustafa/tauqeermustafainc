/**
 * Server-only helper to talk to the WhatsApp bot service (Baileys).
 * Used exclusively by the /api/whatsapp/* route handlers — never import this
 * into a client component (it reads the secret ADMIN_API_KEY).
 */
import { NextResponse } from "next/server";

const WA_SERVICE_URL = process.env.WA_SERVICE_URL || "http://localhost:3001";
const ADMIN_API_KEY = process.env.ADMIN_API_KEY || "";

/** Fetch a path on the WA service, injecting the API key + JSON headers. */
export function waFetch(path: string, init: RequestInit = {}) {
  return fetch(`${WA_SERVICE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(ADMIN_API_KEY ? { "x-api-key": ADMIN_API_KEY } : {}),
      ...(init.headers || {}),
    },
    cache: "no-store",
  });
}

/**
 * Proxy a request to the WA service and mirror its JSON response + status.
 * Returns a friendly 502 if the bot service is unreachable.
 */
export async function proxyToWA(path: string, init?: RequestInit) {
  try {
    const res = await waFetch(path, init);
    const contentType = res.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) {
      const text = await res.text();
      return NextResponse.json(
        {
          success: false,
          error: "Bot service returned a non-JSON response. Is it running?",
          detail: text.slice(0, 200),
        },
        { status: 502 }
      );
    }
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json(
      {
        success: false,
        error: `Cannot reach the WhatsApp bot service at ${WA_SERVICE_URL}. Start it or check WA_SERVICE_URL.`,
      },
      { status: 502 }
    );
  }
}
