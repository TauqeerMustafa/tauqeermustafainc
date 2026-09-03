/**
 * GET /api/whatsapp/diagnose?key=<WA_DIAGNOSE_KEY>
 *
 * Asks Meta what THIS deployment's token can actually see, so that
 *   "Object with ID '…' does not exist, cannot be loaded due to missing permissions"
 * becomes a precise answer instead of a guess.
 *
 * Reports, for EVERY configured phone-number id (see lib/wa-numbers): whether Meta
 * can load it, and if not, why — wrong id type (a WABA or profile id pasted into
 * the phone-number slot), a number that lives outside this token's WABA, or an
 * expired/under-scoped token. Also lists the ids the token CAN send from, so the
 * fix is copy-paste.
 *
 * Guarded by WA_DIAGNOSE_KEY (falling back to WEBHOOK_VERIFY_TOKEN) — there is no
 * server-side auth on /admin, so this must not be world-readable. The token
 * itself is never returned.
 *
 * Env vars: WHATSAPP_TOKEN, WHATSAPP_BUSINESS_ACCOUNT_ID, WHATSAPP_PHONE_NUMBER_ID,
 * WHATSAPP_PHONE_NUMBER_ID_2
 */
import { NextResponse } from "next/server";
import { waNumbers } from "@/lib/wa-numbers";

const GRAPH_URL = "https://graph.facebook.com/v20.0";

type Graph = { ok: boolean; status: number; json: any };

async function graphGet(path: string, token: string, fields?: string): Promise<Graph> {
  const url = new URL(`${GRAPH_URL}/${path}`);
  if (fields) url.searchParams.set("fields", fields);
  url.searchParams.set("access_token", token);
  try {
    const res = await fetch(url, { cache: "no-store" });
    return { ok: res.ok, status: res.status, json: await res.json() };
  } catch (e) {
    return { ok: false, status: 0, json: { error: { message: String(e) } } };
  }
}

/** Meta error → a sentence that says what to actually do about it. */
function explain(err: any, id: string, wabaNumbers: string[], wabaId?: string): string {
  const code = err?.code;
  const sub = err?.error_subcode;
  if (id && wabaId && id === wabaId) {
    return "This is your WhatsApp Business ACCOUNT id (WABA), not a Phone Number ID. Open WhatsApp Manager → API Setup and copy the id shown under the phone number itself.";
  }
  if (code === 190) {
    return "The access token is invalid or expired. If you generated a 24-hour test token in the App Dashboard, replace WHATSAPP_TOKEN with a permanent System User token.";
  }
  if (code === 100 && (sub === 33 || sub === undefined)) {
    return wabaNumbers.length
      ? `This token cannot see that id. It is not one of the numbers on this WhatsApp Business Account (${wabaNumbers.join(", ")}). Either the id is mistyped, or the number belongs to a different WABA than WHATSAPP_BUSINESS_ACCOUNT_ID.`
      : "This token cannot see that id, and it also cannot list any numbers on the configured WABA — so the token is most likely missing whatsapp_business_management, or the System User has not been assigned this WhatsApp Business Account as an asset.";
  }
  if (code === 200 || code === 3) {
    return "The token is missing a required permission. A sending token needs whatsapp_business_messaging; listing numbers and templates also needs whatsapp_business_management.";
  }
  return err?.message ? String(err.message) : "Unknown Meta error.";
}

/**
 * Can Meta load one id, and would `POST /{id}/messages` work? Split out of the
 * handler because there is now more than one number to answer this for.
 */
async function inspect(
  id: string,
  label: string,
  token: string,
  visibleIds: string[],
  wabaId?: string
): Promise<Record<string, unknown>> {
  const res = await graphGet(id, token, "id,display_phone_number,verified_name,quality_rating,platform_type");
  // `metadata=1` makes Graph name the node type, which is how we tell a real
  // phone number apart from a WABA / app / business id pasted into the slot.
  const meta = await graphGet(`${id}?metadata=1`, token);
  const nodeType = meta.json?.metadata?.type ?? null;

  if (!res.ok) {
    return {
      id,
      label,
      canSend: false,
      nodeType,
      metaError: res.json?.error?.message ?? `HTTP ${res.status}`,
      metaCode: res.json?.error?.code ?? null,
      fix: explain(res.json?.error, id, visibleIds, wabaId),
    };
  }

  const displayNumber = res.json?.display_phone_number ?? null;
  // Readable, but with no display number it is not a sending phone number —
  // POST /{id}/messages will fail even though GET /{id} succeeds.
  if (!displayNumber) {
    return {
      id,
      label,
      canSend: false,
      nodeType,
      inConfiguredWaba: false,
      metaError: "Readable, but Meta returns no display_phone_number for this id.",
      fix:
        `Meta can load this id, but it is not a WhatsApp phone number` +
        (nodeType ? ` — it is a "${nodeType}" object` : "") +
        `. ` +
        (visibleIds.length
          ? `The sending ids on this WhatsApp Business Account are ${visibleIds.join(", ")}. Use one of those.`
          : `No numbers are visible on the configured WABA at all.`),
    };
  }

  return {
    id,
    label,
    canSend: true,
    nodeType,
    displayNumber,
    verifiedName: res.json?.verified_name ?? null,
    quality: res.json?.quality_rating ?? null,
    inConfiguredWaba: visibleIds.includes(id),
  };
}

export async function GET(request: Request) {
  const secret = process.env.WA_DIAGNOSE_KEY?.trim() || process.env.WEBHOOK_VERIFY_TOKEN;
  const key = new URL(request.url).searchParams.get("key");
  if (!secret) {
    return NextResponse.json(
      { success: false, error: "Set WA_DIAGNOSE_KEY (or WEBHOOK_VERIFY_TOKEN) so this endpoint can be protected." },
      { status: 503 }
    );
  }
  if (key !== secret) {
    return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
  }

  const token = process.env.WHATSAPP_TOKEN?.trim();
  const wabaId = process.env.WHATSAPP_BUSINESS_ACCOUNT_ID?.trim();
  const configured = waNumbers();

  if (!token) {
    return NextResponse.json({
      success: false,
      verdict: "WHATSAPP_TOKEN is not set in this environment. Nothing can send.",
      configured,
    });
  }

  // ── 1. What kind of token is this, and is it still alive? ──────────────────
  const dbg = await graphGet(`debug_token?input_token=${encodeURIComponent(token)}`, token);
  const d = dbg.json?.data ?? {};
  const expiresAt = Number(d?.expires_at ?? 0);
  const tokenInfo = {
    type: d?.type ?? "unknown",
    appId: d?.app_id ?? null,
    application: d?.application ?? null,
    isValid: d?.is_valid ?? null,
    // 0 means "never expires" — that is what a System User token looks like.
    expires: expiresAt === 0 ? "never (permanent)" : new Date(expiresAt * 1000).toISOString(),
    expired: expiresAt !== 0 && expiresAt * 1000 < Date.now(),
    scopes: d?.scopes ?? d?.granular_scopes?.map((g: any) => g?.scope) ?? null,
  };

  // ── 2. Which numbers does the configured WABA actually expose? ─────────────
  let wabaError: string | null = null;
  let wabaNumbers: Array<Record<string, unknown>> = [];
  if (wabaId) {
    const res = await graphGet(
      `${wabaId}/phone_numbers`,
      token,
      "id,display_phone_number,verified_name,quality_rating,code_verification_status,platform_type"
    );
    if (res.ok) wabaNumbers = res.json?.data ?? [];
    else wabaError = explain(res.json?.error, "", [], wabaId);
  } else {
    wabaError = "WHATSAPP_BUSINESS_ACCOUNT_ID is not set, so the list of available numbers cannot be fetched.";
  }
  const visibleIds = wabaNumbers.map((n) => String(n.id));

  // ── 3. Can Meta load each id we are configured to send from? ───────────────
  const checks = await Promise.all(
    configured.map((n) => inspect(n.id, n.label, token, visibleIds, wabaId))
  );
  // The primary, kept under its old key so existing callers keep working.
  const check = checks[0] ?? null;

  const sendable = checks.filter((c) => c.canSend);
  const broken = checks.filter((c) => !c.canSend);

  const verdict = tokenInfo.expired
    ? "The access token has EXPIRED. Replace WHATSAPP_TOKEN with a permanent System User token, then redeploy."
    : configured.length === 0
      ? "No phone number is configured. Set WHATSAPP_PHONE_NUMBER_ID."
      : broken.length === 0
        ? `All ${checks.length} configured number(s) are reachable — sending should work.`
        : sendable.length === 0
          ? "None of the configured numbers can be used. See checks[].fix."
          : `${sendable.length} of ${checks.length} configured numbers work. See checks[].fix for the rest.`;

  return NextResponse.json({
    success: sendable.length > 0 && !tokenInfo.expired,
    verdict,
    token: tokenInfo,
    waba: { id: wabaId ?? null, error: wabaError, numbers: wabaNumbers },
    configured,
    checks,
    check,
    // The ids this token really can send from — paste one of these into
    // WHATSAPP_PHONE_NUMBER_ID / WHATSAPP_PHONE_NUMBER_ID_2 if a check failed.
    usableIds: visibleIds,
  });
}
