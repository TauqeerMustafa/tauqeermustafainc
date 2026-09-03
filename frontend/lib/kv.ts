/**
 * Upstash Redis client for WhatsApp data storage.
 *
 * Setup:
 * 1. Go to vercel.com/dashboard → your project → Storage → Create Database → Upstash Redis
 * 2. Vercel automatically adds KV_REST_API_URL and KV_REST_API_TOKEN to your env
 * 3. Deploy — no manual env var setup needed
 *
 * Uses lazy initialization so that sensitive env vars injected at runtime
 * (not available at build/module-init time on Vercel) are picked up correctly.
 */

import { Redis } from "@upstash/redis";

let _kv: Redis | null = null;
let _checked = false;

/** Returns the Redis client, or null if not configured. Evaluated lazily at request time. */
export function getKV(): Redis | null {
  if (_checked) return _kv;
  _checked = true;

  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;

  if (!url || !token || url === "[SENSITIVE]" || token === "[SENSITIVE]") {
    _kv = null;
    return null;
  }

  try {
    _kv = new Redis({ url, token });
  } catch {
    _kv = null;
  }

  return _kv;
}

/** Check at request time whether KV is available. */
export function checkKVConfigured(): boolean {
  return getKV() !== null;
}

// Backwards-compatible exports used by existing routes
export const kv = null as Redis | null; // DEPRECATED — use getKV()
export const isKVConfigured = false;    // DEPRECATED — use checkKVConfigured()

// Storage keys
export const KEYS = {
  messages: "whatsapp:messages",
  rules: "whatsapp:rules",
  // Which revision of the shipped auto-reply rules a deployment has taken. See
  // getRules() in lib/wa-store: it upgrades an untouched set, never an edited one.
  rulesVersion: "whatsapp:rules:version",
  templates: "whatsapp:templates",
  // Same idea as rulesVersion, for the canned messages seeded by
  // /api/whatsapp/templates: an untouched default set is upgraded, an edited one
  // is left alone.
  templatesVersion: "whatsapp:templates:version",
  conversations: "whatsapp:conversations",
};
