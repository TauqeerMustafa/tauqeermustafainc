/**
 * GET /api/whatsapp/messages
 * Returns stored messages (received via webhook + sent via /send)
 *
 * Storage: In production, use a database. For now, this is a stub that returns
 * empty until you add persistence (Vercel KV, Postgres, etc.)
 */
import { NextResponse } from "next/server";

// TODO: Replace with real storage (database, Redis, file system with persistent disk)
// For now, return empty so the UI doesn't crash
export async function GET() {
  return NextResponse.json({
    success: true,
    data: [],
    count: 0,
  });
}
