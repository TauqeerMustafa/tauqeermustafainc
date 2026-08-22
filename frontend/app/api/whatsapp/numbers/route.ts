/**
 * GET /api/whatsapp/numbers — list the WhatsApp Business numbers this app can
 * send from, so the admin UI can offer a "Send from" selector.
 *
 * Each entry is verified against Meta before being offered: an id that Meta
 * cannot load — or can load but has no display_phone_number, e.g. a WABA id
 * pasted into the phone-number slot — is returned with usable: false and a
 * reason, so the UI can label it instead of letting a send fail cryptically.
 *
 * Verification is cached in-process; if Meta is unreachable we fail OPEN
 * (usable: true) so a Graph hiccup can never hide the working primary number.
 * Use /api/whatsapp/diagnose for the full report.
 */
import { NextResponse } from "next/server";
import { getWaNumbers, type WaNumber } from "@/lib/wa-numbers";

const GRAPH_URL = "https://graph.facebook.com/v20.0";
const TTL_MS = 10 * 60 * 1000;

export type CheckedWaNumber = WaNumber & {
  usable: boolean;
  displayNumber?: string | null;
  reason?: string;
};

const cache = new Map<string, { at: number; value: Omit<CheckedWaNumber, keyof WaNumber> }>();

async function verify(id: string, token: string): Promise<Omit<CheckedWaNumber, keyof WaNumber>> {
  const hit = cache.get(id);
  if (hit && Date.now() - hit.at < TTL_MS) return hit.value;

  let value: Omit<CheckedWaNumber, keyof WaNumber>;
  try {
    const url = new URL(`${GRAPH_URL}/${id}`);
    url.searchParams.set("fields", "id,display_phone_number,verified_name");
    url.searchParams.set("access_token", token);
    const res = await fetch(url, { cache: "no-store" });
    const json = await res.json();

    if (!res.ok) {
      value = { usable: false, reason: json?.error?.message || `Meta returned HTTP ${res.status}` };
    } else if (!json?.display_phone_number) {
      value = {
        usable: false,
        reason:
          "Meta can load this id but it has no phone number attached — it is not a WhatsApp sending number. Add and verify the number in WhatsApp Manager → Phone Numbers, then use its id.",
      };
    } else {
      value = { usable: true, displayNumber: json.display_phone_number };
    }
  } catch {
    // Network/Graph failure — do not punish a number we simply could not reach.
    return { usable: true };
  }

  cache.set(id, { at: Date.now(), value });
  return value;
}

export async function GET() {
  const numbers = getWaNumbers();
  const token = process.env.WHATSAPP_TOKEN?.trim();

  // No token: nothing can be verified, so report the config as-is.
  if (!token) {
    return NextResponse.json({
      success: true,
      data: numbers.map((n) => ({ ...n, usable: true })),
    });
  }

  const data: CheckedWaNumber[] = await Promise.all(
    numbers.map(async (n) => ({ ...n, ...(await verify(n.id, token)) }))
  );

  return NextResponse.json({ success: true, data });
}
