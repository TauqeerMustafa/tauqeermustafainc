/**
 * GET /api/whatsapp/numbers — the numbers this deployment can send from.
 *
 * The admin UI needs two things the environment alone cannot give it: which
 * numbers exist, and what each one actually IS on WhatsApp. A Phone Number ID is
 * unreadable to a human, so each configured id is looked up on Graph for its
 * display number and verified business name, and `canSend` says whether Meta will
 * accept a message from it at all.
 *
 * Graph is asked at most once every few minutes per server instance: the admin
 * inbox polls, and the sender list changes about as often as a deployment does.
 * A Graph failure is not fatal — the configured list is still returned, with
 * `error` naming the reason, so the picker keeps working when Meta is down.
 *
 * Admin-gated by proxy.ts like every other /api/whatsapp/* route.
 */
import { NextResponse } from "next/server";
import { waNumbers, type WANumber } from "@/lib/wa-numbers";

const GRAPH_URL = "https://graph.facebook.com/v20.0";
const TTL_MS = 5 * 60 * 1000;

export type WANumberInfo = WANumber & {
  /** The number as a person would read it, e.g. "+92 300 1234567". */
  displayNumber?: string | null;
  verifiedName?: string | null;
  quality?: string | null;
  /** False when Meta will not accept a send from this id. */
  canSend: boolean;
  error?: string | null;
};

let cache: { at: number; data: WANumberInfo[] } | null = null;

async function describe(number: WANumber, token: string): Promise<WANumberInfo> {
  const url = new URL(`${GRAPH_URL}/${number.id}`);
  url.searchParams.set("fields", "id,display_phone_number,verified_name,quality_rating");
  url.searchParams.set("access_token", token);

  try {
    const res = await fetch(url, { cache: "no-store" });
    const json = await res.json();

    if (!res.ok) {
      return {
        ...number,
        canSend: false,
        error: json?.error?.message || `Meta returned HTTP ${res.status}`,
      };
    }
    // Readable but with no display number means it is not a sending phone number
    // — most often a WABA or profile id pasted into a phone-number slot. GET
    // succeeds, POST /{id}/messages does not.
    if (!json?.display_phone_number) {
      return {
        ...number,
        canSend: false,
        error:
          "Meta can read this id but returns no phone number for it, so it cannot send. Check it against WhatsApp Manager → API Setup, or call /api/whatsapp/diagnose.",
      };
    }
    return {
      ...number,
      displayNumber: json.display_phone_number,
      verifiedName: json.verified_name ?? null,
      quality: json.quality_rating ?? null,
      canSend: true,
      error: null,
    };
  } catch (e) {
    return { ...number, canSend: false, error: e instanceof Error ? e.message : String(e) };
  }
}

export async function GET(request: Request) {
  const numbers = waNumbers();
  const token = process.env.WHATSAPP_TOKEN?.trim();

  if (!token || token === "[SENSITIVE]") {
    return NextResponse.json({
      success: true,
      data: numbers.map((n) => ({ ...n, canSend: false, error: "WHATSAPP_TOKEN is not configured." })),
    });
  }

  const fresh = new URL(request.url).searchParams.get("refresh") === "1";
  if (!fresh && cache && Date.now() - cache.at < TTL_MS) {
    return NextResponse.json({ success: true, data: cache.data, cached: true });
  }

  const data = await Promise.all(numbers.map((n) => describe(n, token)));
  cache = { at: Date.now(), data };

  return NextResponse.json({ success: true, data });
}
