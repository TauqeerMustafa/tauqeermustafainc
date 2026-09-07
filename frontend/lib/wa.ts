/**
 * Server-only helper for Meta WhatsApp Cloud API.
 *
 * This module provides utility functions for the official Meta Graph API.
 * Used exclusively by /api/whatsapp/* route handlers.
 */

const GRAPH_URL = "https://graph.facebook.com/v20.0";

/** Build authorization headers for Meta Graph API calls. */
export function metaHeaders(): Record<string, string> {
  const token = process.env.WHATSAPP_TOKEN;
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

/** POST to the Meta Graph API messages endpoint. */
export async function graphPost(phoneNumberId: string, body: object) {
  const res = await fetch(`${GRAPH_URL}/${phoneNumberId}/messages`, {
    method: "POST",
    headers: metaHeaders(),
    body: JSON.stringify(body),
    cache: "no-store",
  });
  const json = await res.json();
  return { ok: res.ok, status: res.status, json };
}

/** Check whether the Meta Cloud API credentials are configured. */
export function isMetaConfigured(): boolean {
  return !!(process.env.WHATSAPP_TOKEN && process.env.WHATSAPP_PHONE_NUMBER_ID);
}
