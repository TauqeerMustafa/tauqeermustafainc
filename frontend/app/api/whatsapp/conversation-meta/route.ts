/**
 * Per-conversation metadata store (deal status, notes, tags, archive/pin flags,
 * and the last-read timestamp that drives unread counts).
 *
 * Keyed by `${ourNumberId}::${customerNumber}` so the two business numbers keep
 * fully independent conversation state.
 *
 *   GET    /api/whatsapp/conversation-meta            → Record<key, ConvMeta>
 *   PUT    /api/whatsapp/conversation-meta            → merge { key, patch }
 *   DELETE /api/whatsapp/conversation-meta?key=<key>  → remove one conversation
 *
 * Storage: Upstash Redis (KV) when configured, otherwise a no-op.
 */
import { NextResponse } from "next/server";
import { kv, KEYS, isKVConfigured } from "@/lib/kv";

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

export async function GET() {
  if (!isKVConfigured) return NextResponse.json({ success: true, data: {} });
  try {
    const map = (await kv!.get<MetaMap>(KEYS.conversations)) || {};
    return NextResponse.json({ success: true, data: map });
  } catch (error) {
    console.error("[conversation-meta] GET error:", error);
    return NextResponse.json({ success: false, error: String(error), data: {} }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  if (!isKVConfigured) return NextResponse.json({ success: true, notice: "KV not configured" });
  try {
    const { key, patch } = await request.json();
    if (!key || typeof key !== "string") {
      return NextResponse.json({ success: false, error: "key is required" }, { status: 400 });
    }
    const map = (await kv!.get<MetaMap>(KEYS.conversations)) || {};
    map[key] = { ...(map[key] || {}), ...(patch || {}) };
    await kv!.set(KEYS.conversations, map);
    return NextResponse.json({ success: true, data: map[key] });
  } catch (error) {
    console.error("[conversation-meta] PUT error:", error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  if (!isKVConfigured) return NextResponse.json({ success: true, notice: "KV not configured" });
  try {
    const key = new URL(request.url).searchParams.get("key");
    if (!key) return NextResponse.json({ success: false, error: "key is required" }, { status: 400 });
    const map = (await kv!.get<MetaMap>(KEYS.conversations)) || {};
    delete map[key];
    await kv!.set(KEYS.conversations, map);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[conversation-meta] DELETE error:", error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
