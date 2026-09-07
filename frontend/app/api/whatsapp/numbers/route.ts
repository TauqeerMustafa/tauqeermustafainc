/**
 * GET /api/whatsapp/numbers — the numbers this deployment can send from.
 *
 * The admin UI needs two things the environment alone cannot give it: which
 * numbers exist, and what each one actually IS on WhatsApp.
 *
 * Graph is asked at most once every few minutes per server instance.
 * Also automatically discovers numbers from configured WABAs in Meta.
 *
 * Admin-gated by proxy.ts like every other /api/whatsapp/* route.
 */
import { NextResponse } from "next/server";
import { accountAt, usableAccounts } from "@/lib/wa-accounts";
import { waNumbers, registerKnownNumbers, type WANumber } from "@/lib/wa-numbers";

const GRAPH_URL = "https://graph.facebook.com/v20.0";
const TTL_MS = 2 * 60 * 1000;

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
  const fresh = new URL(request.url).searchParams.get("refresh") === "1";
  if (!fresh && cache && Date.now() - cache.at < TTL_MS) {
    return NextResponse.json({ success: true, data: cache.data, cached: true });
  }

  const configured = waNumbers();
  const accounts = usableAccounts();
  const discoveredMap = new Map<string, WANumberInfo>();

  // 1. Fetch phone numbers directly from all configured WABAs in Meta
  for (const account of accounts) {
    if (!account.token || !account.wabaId) continue;
    try {
      const url = new URL(`${GRAPH_URL}/${account.wabaId}/phone_numbers`);
      url.searchParams.set("fields", "id,display_phone_number,verified_name,quality_rating,code_verification_status");
      url.searchParams.set("access_token", account.token);

      const res = await fetch(url, { cache: "no-store" });
      const json = await res.json();

      if (res.ok && Array.isArray(json?.data)) {
        for (const item of json.data) {
          if (!item.id) continue;
          // primary is corrected below after the full list is built
          discoveredMap.set(item.id, {
            id: String(item.id),
            label: item.verified_name || item.display_phone_number || `Line ${discoveredMap.size + 1}`,
            primary: false,
            slot: account.slot,
            displayNumber: item.display_phone_number ?? null,
            verifiedName: item.verified_name ?? null,
            quality: item.quality_rating ?? null,
            canSend: true,
            error: null,
          });
        }
      }
    } catch (e) {
      console.error(`[numbers] Failed to fetch WABA numbers for slot ${account.slot}:`, e);
    }
  }

  // 2. Also inspect any explicitly configured numbers from waNumbers()
  for (const n of configured) {
    if (discoveredMap.has(n.id)) {
      const existing = discoveredMap.get(n.id)!;
      if (n.label && n.label !== "Primary number" && n.label !== "Second number") {
        existing.label = n.label;
      }
      continue;
    }

    const account = accountAt(n.slot ?? 1);
    const token = account.token?.trim();
    if (!token || token === "[SENSITIVE]") {
      discoveredMap.set(n.id, {
        ...n,
        canSend: false,
        error: `Token for this number's app (Slot ${account.slot}) is not configured.`,
      });
      continue;
    }

    const described = await describe(n, token);
    discoveredMap.set(n.id, described);
  }

  const resultList = Array.from(discoveredMap.values());

  // 3. Fix the primary flag: the number configured as WHATSAPP_PHONE_NUMBER_ID
  //    is always primary, regardless of Meta's WABA response order.
  //    Fall back to the first entry only if nothing matches.
  const configuredPrimaryId = configured.find((n) => n.primary)?.id;
  for (const n of resultList) {
    n.primary = configuredPrimaryId ? n.id === configuredPrimaryId : false;
  }
  if (resultList.length > 0 && !resultList.some((n) => n.primary)) {
    resultList[0].primary = true;
  }

  // Register all discovered numbers so resolveNumberId accepts them
  registerKnownNumbers(resultList);

  cache = { at: Date.now(), data: resultList };
  return NextResponse.json({ success: true, data: resultList });
}

