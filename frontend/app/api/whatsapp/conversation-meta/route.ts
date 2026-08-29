/**
 * Per-conversation metadata store (deal status, notes, tags, archive/pin flags,
 * and the last-read timestamp that drives unread counts).
 *
 * Keyed by the customer's number. Keys written while two business numbers were
 * supported look like `${ourNumberId}::${customerNumber}`; those are collapsed to
 * the bare customer number on read and rewritten once, so existing deal statuses
 * and notes survive the removal of the second number.
 *
 *   GET    /api/whatsapp/conversation-meta            → Record<key, ConvMeta>
 *   PUT    /api/whatsapp/conversation-meta            → merge { key, patch }
 *   DELETE /api/whatsapp/conversation-meta?key=<key>  → remove one conversation
 *
 * Storage: Upstash Redis (KV) when configured, otherwise a no-op.
 */
import { NextResponse } from "next/server";
import { getKV, checkKVConfigured, KEYS } from "@/lib/kv";

export type ConvMeta = {
  dealStatus?: string;
  notes?: string;
  archived?: boolean;
  pinned?: boolean;
  lastReadAt?: string;
  name?: string;
  tags?: string[];
};

type MetaMap = Record<string, ConvMeta>;

/** Drop the legacy `<ourNumberId>::` prefix, leaving the customer number. */
function normalizeKey(key: string): string {
  const i = key.lastIndexOf("::");
  return i === -1 ? key : key.slice(i + 2);
}

/**
 * Collapse legacy keys onto their bare customer number. If the same customer had
 * state under both key shapes, the legacy entry is the older one, so the already
 * normalized entry wins.
 */
function normalizeMap(map: MetaMap): { map: MetaMap; changed: boolean } {
  const out: MetaMap = {};
  let changed = false;
  // Legacy keys first so normalized ones overwrite them.
  const entries = Object.entries(map).sort(
    (a, b) => Number(b[0].includes("::")) - Number(a[0].includes("::"))
  );
  for (const [key, value] of entries) {
    const nk = normalizeKey(key);
    if (nk !== key) changed = true;
    out[nk] = { ...(out[nk] || {}), ...value };
  }
  return { map: out, changed };
}

export async function GET() {
  if (!checkKVConfigured()) return NextResponse.json({ success: true, data: {} });
  try {
    const stored = (await getKV()!.get<MetaMap>(KEYS.conversations)) || {};
    const { map, changed } = normalizeMap(stored);
    // One-time migration: persist the collapsed shape so this only happens once.
    if (changed) await getKV()!.set(KEYS.conversations, map);
    return NextResponse.json({ success: true, data: map });
  } catch (error) {
    console.error("[conversation-meta] GET error:", error);
    return NextResponse.json({ success: false, error: String(error), data: {} }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  if (!checkKVConfigured()) return NextResponse.json({ success: true, notice: "KV not configured" });
  try {
    const { key, patch } = await request.json();
    if (!key || typeof key !== "string") {
      return NextResponse.json({ success: false, error: "key is required" }, { status: 400 });
    }
    const stored = (await getKV()!.get<MetaMap>(KEYS.conversations)) || {};
    const { map } = normalizeMap(stored);
    const k = normalizeKey(key);
    map[k] = { ...(map[k] || {}), ...(patch || {}) };
    await getKV()!.set(KEYS.conversations, map);
    return NextResponse.json({ success: true, data: map[k] });
  } catch (error) {
    console.error("[conversation-meta] PUT error:", error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  if (!checkKVConfigured()) return NextResponse.json({ success: true, notice: "KV not configured" });
  try {
    const key = new URL(request.url).searchParams.get("key");
    if (!key) return NextResponse.json({ success: false, error: "key is required" }, { status: 400 });
    const stored = (await getKV()!.get<MetaMap>(KEYS.conversations)) || {};
    const { map } = normalizeMap(stored);
    delete map[normalizeKey(key)];
    await getKV()!.set(KEYS.conversations, map);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[conversation-meta] DELETE error:", error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}

