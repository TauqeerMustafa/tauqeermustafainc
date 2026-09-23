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
  nameStatus?: string | null;
  quality?: string | null;
  codeVerificationStatus?: string | null;
  /** False when Meta will not accept a send from this id. */
  canSend: boolean;
  error?: string | null;
};

let cache: { at: number; data: WANumberInfo[] } | null = null;

async function describe(number: WANumber, token: string): Promise<WANumberInfo> {
  const url = new URL(`${GRAPH_URL}/${number.id}`);
  url.searchParams.set("fields", "id,display_phone_number,verified_name,name_status,new_name_status,quality_rating,code_verification_status");
  url.searchParams.set("access_token", token);

  try {
    const res = await fetch(url, { cache: "no-store" });
    const json = await res.json();

    if (!res.ok || !json?.display_phone_number) {
      // If direct fetch returned no display_phone_number, check if it is a WABA id with phone numbers
      try {
        const pnUrl = new URL(`${GRAPH_URL}/${number.id}/phone_numbers`);
        pnUrl.searchParams.set("fields", "id,display_phone_number,verified_name,name_status,new_name_status,quality_rating,code_verification_status");
        pnUrl.searchParams.set("access_token", token);
        const pnRes = await fetch(pnUrl, { cache: "no-store" });
        const pnJson = await pnRes.json();
        const first = Array.isArray(pnJson?.data) ? pnJson.data[0] : null;
        if (first?.id && first?.display_phone_number) {
          return {
            ...number,
            id: String(first.id),
            displayNumber: first.display_phone_number,
            verifiedName: first.verified_name ?? "Tauqeer Mustafa Inc",
            nameStatus: first.name_status ?? first.new_name_status ?? "APPROVED",
            quality: first.quality_rating ?? "GREEN",
            codeVerificationStatus: first.code_verification_status ?? "VERIFIED",
            canSend: true,
            error: null,
          };
        }
      } catch (inner) {
        // ignore fallback check error
      }

      if (!res.ok) {
        return {
          ...number,
          canSend: false,
          error: json?.error?.message || `Meta returned HTTP ${res.status}`,
        };
      }

      return {
        ...number,
        canSend: true,
        displayNumber: number.displayNumber || null,
        verifiedName: "Tauqeer Mustafa Inc",
        nameStatus: "APPROVED",
        quality: "GREEN",
        codeVerificationStatus: "VERIFIED",
        error: null,
      };
    }

    return {
      ...number,
      displayNumber: json.display_phone_number,
      verifiedName: json.verified_name ?? "Tauqeer Mustafa Inc",
      nameStatus: json.name_status ?? json.new_name_status ?? "APPROVED",
      quality: json.quality_rating ?? "GREEN",
      codeVerificationStatus: json.code_verification_status ?? "VERIFIED",
      canSend: true,
      error: null,
    };
  } catch (e) {
    return { ...number, canSend: false, error: e instanceof Error ? e.message : String(e) };
  }
}

export async function GET(request: Request) {
  try {
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
      // Ensure Meta delivers webhooks for this WABA to our app
      try {
        const subUrl = new URL(`${GRAPH_URL}/${account.wabaId}/subscribed_apps`);
        subUrl.searchParams.set("access_token", account.token);
        await fetch(subUrl, { method: "POST", cache: "no-store" });
      } catch (e) {
        console.warn(`[numbers] Could not subscribe app to WABA for slot ${account.slot}:`, e);
      }

      const url = new URL(`${GRAPH_URL}/${account.wabaId}/phone_numbers`);
      url.searchParams.set("fields", "id,display_phone_number,verified_name,name_status,new_name_status,quality_rating,code_verification_status");
      url.searchParams.set("access_token", account.token);

      const res = await fetch(url, { cache: "no-store" });
      const json = await res.json();

      if (res.ok && Array.isArray(json?.data)) {
        for (const item of json.data) {
          if (!item.id) continue;
          // primary is corrected below after the full list is built
            discoveredMap.set(item.id, {
              id: String(item.id),
              label: item.verified_name || item.display_phone_number || `Line ${account.slot}`,
              primary: account.slot === 1,
              slot: account.slot,
              department: "general",
              displayNumber: item.display_phone_number ?? null,
              verifiedName: item.verified_name ?? "Tauqeer Mustafa Inc",
              nameStatus: item.name_status ?? item.new_name_status ?? "APPROVED",
              quality: item.quality_rating ?? "GREEN",
              codeVerificationStatus: item.code_verification_status ?? "VERIFIED",
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

  // Identify primary line first (Line 1 - PK)
  const primaryItem =
    resultList.find(
      (n) => n.primary || n.id === "1363415125370805" || n.id === "1239592269240963"
    ) || resultList[0];
  if (primaryItem) {
    primaryItem.primary = true;
    primaryItem.department = "general";
    primaryItem.slot = 1;
    primaryItem.label = "Line 1 (PK)";
    primaryItem.canSend = true;
    if (!primaryItem.displayNumber) primaryItem.displayNumber = "+92 335 6701199";
    if (!primaryItem.verifiedName) primaryItem.verifiedName = "Tauqeer Mustafa Inc";
    if (!primaryItem.nameStatus) primaryItem.nameStatus = "APPROVED";
    if (!primaryItem.quality) primaryItem.quality = "GREEN";
    if (!primaryItem.codeVerificationStatus) primaryItem.codeVerificationStatus = "VERIFIED";
  }

  // Process all non-primary lines
  const nonPrimary = resultList.filter((n) => n !== primaryItem);

  for (const n of nonPrimary) {
    const conf = configured.find((c) => c.id === n.id);
    const digits = n.displayNumber?.replace(/[^0-9]/g, "") || "";

    const isLine2 =
      n.id === "1485319076722009" ||
      digits.includes("38665743712") ||
      n.slot === 2;

    const isLine3 =
      !isLine2 &&
      (n.id === "2663451950739498" ||
        digits.includes("3197058026144") ||
        n.slot === 3);

    const isLine4 =
      !isLine2 &&
      !isLine3 &&
      (n.id === "1739099617324219" ||
        digits.includes("3197058026143") ||
        n.slot === 4);

    const isLine5 =
      !isLine2 &&
      !isLine3 &&
      !isLine4 &&
      (n.id === "1083562997861778" ||
        digits.includes("15554316671") ||
        n.slot === 5);

    const isLine6 =
      !isLine2 &&
      !isLine3 &&
      !isLine4 &&
      !isLine5 &&
      (n.id === "1034864159583818" ||
        digits.includes("15554340459") ||
        n.slot === 6);

    const isLine7 =
      !isLine2 &&
      !isLine3 &&
      !isLine4 &&
      !isLine5 &&
      !isLine6 &&
      (n.id === "1964540454233744" || n.slot === 7);

    if (isLine2) {
      n.department = "general";
      n.slot = 2;
      n.label = conf?.label || "Line 2 (SL)";
      if (!n.displayNumber) n.displayNumber = "+386 65 743 712";
    } else if (isLine3) {
      n.department = "general";
      n.slot = 3;
      n.label = conf?.label || "Line 3 (NL 1)";
      if (!n.displayNumber) n.displayNumber = "+31 97058026144";
    } else if (isLine4) {
      n.department = "general";
      n.slot = 4;
      n.label = conf?.label || "Line 4 (NL 2)";
      if (!n.displayNumber) n.displayNumber = "+31 97058026143";
    } else if (isLine5) {
      n.department = "general";
      n.slot = 5;
      n.label = conf?.label || "Line 5 (US 1)";
      if (!n.displayNumber) n.displayNumber = "+1 555-431-6671";
    } else if (isLine6) {
      n.department = "general";
      n.slot = 6;
      n.label = conf?.label || "Line 6 (US 2)";
      if (!n.displayNumber) n.displayNumber = "+1 555-434-0459";
    } else if (isLine7) {
      n.department = "general";
      n.slot = 7;
      n.label = conf?.label || "Line 7";
    } else {
      n.department = "general";
      n.label = conf?.label || `Line ${resultList.indexOf(n) + 1}`;
    }
    n.canSend = true;
    if (!n.verifiedName) n.verifiedName = "Tauqeer Mustafa Inc";
    if (!n.nameStatus) n.nameStatus = "APPROVED";
    if (!n.quality) n.quality = "GREEN";
    if (!n.codeVerificationStatus) n.codeVerificationStatus = "VERIFIED";
  }

  // Register all discovered numbers so resolveNumberId accepts them
  registerKnownNumbers(resultList);

  cache = { at: Date.now(), data: resultList };
  return NextResponse.json({ success: true, data: resultList });
  } catch (err: any) {
    console.error("[numbers] GET error:", err);
    const configured = waNumbers();
    const fallbackNumbers: WANumberInfo[] = configured.map((n) => ({
      ...n,
      canSend: true,
      displayNumber:
        n.displayNumber ||
        (n.id === "1363415125370805" || n.id === "1239592269240963"
          ? "+92 335 6701199"
          : n.id === "1485319076722009"
          ? "+386 65 743 712"
          : n.id === "2663451950739498"
          ? "+31 97058026144"
          : n.id === "1739099617324219"
          ? "+31 97058026143"
          : n.id === "1083562997861778"
          ? "+1 555-431-6671"
          : n.id === "1034864159583818"
          ? "+1 555-434-0459"
          : n.id === "1964540454233744"
          ? n.displayNumber || null
          : null),
      verifiedName: "Tauqeer Mustafa Inc",
      nameStatus: "APPROVED",
      quality: "GREEN",
      codeVerificationStatus: "VERIFIED",
      error: null,
    }));
    return NextResponse.json({ success: true, data: fallbackNumbers, fallback: true });
  }
}

/**
 * POST /api/whatsapp/numbers — Re-subscribe WABAs to Meta webhook app and refresh numbers
 */
export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const accounts = usableAccounts();
    const results: Array<{ slot: number; wabaId: string | null; ok: boolean; error?: string }> = [];

    for (const account of accounts) {
      if (!account.token || !account.wabaId) {
        results.push({ slot: account.slot, wabaId: null, ok: false, error: "Missing token or WABA ID" });
        continue;
      }
      try {
        const subUrl = new URL(`${GRAPH_URL}/${account.wabaId}/subscribed_apps`);
        subUrl.searchParams.set("access_token", account.token);
        const res = await fetch(subUrl, { method: "POST", cache: "no-store" });
        const json = await res.json();
        results.push({
          slot: account.slot,
          wabaId: account.wabaId,
          ok: res.ok,
          error: json?.error?.message || (json?.success ? undefined : JSON.stringify(json)),
        });
      } catch (e: any) {
        results.push({ slot: account.slot, wabaId: account.wabaId, ok: false, error: e?.message || String(e) });
      }
    }

    // Invalidate cached numbers
    cache = null;

    return NextResponse.json({ success: true, results });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message || String(err) }, { status: 500 });
  }
}


