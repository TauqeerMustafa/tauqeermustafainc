/**
 * GET /api/whatsapp/diagnose?key=<WA_DIAGNOSE_KEY>
 *
 * Asks Meta what THIS deployment can actually see, including a KV message
 * channel audit for debugging inbox separation issues.
 *
 * Guarded by WA_DIAGNOSE_KEY (falling back to WEBHOOK_VERIFY_TOKEN).
 */
import { NextResponse } from "next/server";
import { waNumbers } from "@/lib/wa-numbers";
import { usableAccounts, WAAccount } from "@/lib/wa-accounts";
import { getMessages } from "@/lib/wa-store";

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

function explain(err: any, id: string, wabaNumbers: string[], wabaId?: string): string {
  const code = err?.code;
  const sub = err?.error_subcode;
  if (id && wabaId && id === wabaId) {
    return "This is your WhatsApp Business ACCOUNT id (WABA), not a Phone Number ID. Open WhatsApp Manager -> API Setup and copy the id shown under the phone number itself.";
  }
  if (code === 190) {
    return "The access token is invalid or expired. Replace WHATSAPP_TOKEN with a permanent System User token.";
  }
  if (code === 100 && (sub === 33 || sub === undefined)) {
    return wabaNumbers.length
      ? `This token cannot see that id. It is not one of the numbers on this WhatsApp Business Account (${wabaNumbers.join(", ")}).`
      : "This token cannot see that id, and it also cannot list any numbers on the configured WABA.";
  }
  if (code === 200 || code === 3) {
    return "The token is missing a required permission (whatsapp_business_messaging / whatsapp_business_management).";
  }
  return err?.message ? String(err.message) : "Unknown Meta error.";
}

async function inspect(
  id: string,
  label: string,
  token: string,
  visibleIds: string[],
  wabaId?: string
): Promise<Record<string, unknown>> {
  const res = await graphGet(id, token, "id,display_phone_number,verified_name,quality_rating,platform_type");
  const meta = await graphGet(`${id}?metadata=1`, token);
  const nodeType = meta.json?.metadata?.type ?? null;

  if (!res.ok) {
    return {
      id, label, canSend: false, nodeType,
      metaError: res.json?.error?.message ?? `HTTP ${res.status}`,
      metaCode: res.json?.error?.code ?? null,
      fix: explain(res.json?.error, id, visibleIds, wabaId),
    };
  }

  const displayNumber = res.json?.display_phone_number ?? null;
  if (!displayNumber) {
    return {
      id, label, canSend: false, nodeType, inConfiguredWaba: false,
      metaError: "Readable, but Meta returns no display_phone_number for this id.",
      fix: `Not a WhatsApp phone number` + (nodeType ? ` (it is a "${nodeType}" object)` : "") +
        `. Valid ids: ${visibleIds.join(", ") || "none visible"}`,
    };
  }

  return {
    id, label, canSend: true, nodeType, displayNumber,
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
      { success: false, error: "Set WA_DIAGNOSE_KEY (or WEBHOOK_VERIFY_TOKEN) to protect this endpoint." },
      { status: 503 }
    );
  }
  if (key !== secret) {
    return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
  }

  const slotParam = new URL(request.url).searchParams.get("slot");
  const slot = slotParam ? parseInt(slotParam, 10) : 1;
  const account = usableAccounts().find((a: WAAccount) => a.slot === slot) || usableAccounts()[0];
  const token = account?.token?.trim();
  const wabaId = account?.wabaId?.trim();
  const configured = waNumbers().filter(n => (n.slot ?? 1) === (account?.slot ?? 1));

  if (!token) {
    return NextResponse.json({
      success: false,
      verdict: "WHATSAPP_TOKEN is not set in this environment. Nothing can send.",
      configured,
    });
  }

  const dbg = await graphGet(`debug_token?input_token=${encodeURIComponent(token)}`, token);
  const d = dbg.json?.data ?? {};
  const expiresAt = Number(d?.expires_at ?? 0);
  const tokenInfo = {
    type: d?.type ?? "unknown",
    appId: d?.app_id ?? null,
    application: d?.application ?? null,
    isValid: d?.is_valid ?? null,
    expires: expiresAt === 0 ? "never (permanent)" : new Date(expiresAt * 1000).toISOString(),
    expired: expiresAt !== 0 && expiresAt * 1000 < Date.now(),
    scopes: d?.scopes ?? d?.granular_scopes?.map((g: any) => g?.scope) ?? null,
  };

  let wabaError: string | null = null;
  let wabaNumbers: Array<Record<string, unknown>> = [];
  let subscribedApps: Array<Record<string, unknown>> = [];
  if (wabaId) {
    const res = await graphGet(
      `${wabaId}/phone_numbers`,
      token,
      "id,display_phone_number,verified_name,quality_rating,code_verification_status,platform_type"
    );
    if (res.ok) wabaNumbers = res.json?.data ?? [];
    else wabaError = explain(res.json?.error, "", [], wabaId);

    const subRes = await graphGet(`${wabaId}/subscribed_apps`, token);
    if (subRes.ok) subscribedApps = subRes.json?.data ?? [];
  } else {
    wabaError = "WHATSAPP_BUSINESS_ACCOUNT_ID is not set.";
  }
  const visibleIds = wabaNumbers.map((n) => String(n.id));

  const checks = await Promise.all(
    configured.map((n) => inspect(n.id, n.label, token, visibleIds, wabaId))
  );
  const check = checks[0] ?? null;
  const sendable = checks.filter((c) => c.canSend);
  const broken = checks.filter((c) => !c.canSend);

  const verdict = tokenInfo.expired
    ? "Token EXPIRED. Replace WHATSAPP_TOKEN with a permanent System User token."
    : configured.length === 0
      ? "No phone number configured. Set WHATSAPP_PHONE_NUMBER_ID."
      : broken.length === 0
        ? `All ${checks.length} configured number(s) are reachable.`
        : sendable.length === 0
          ? "None of the configured numbers can be used. See checks[].fix."
          : `${sendable.length} of ${checks.length} numbers work. See checks[].fix for the rest.`;

  // KV message channel audit — shows what channel values are actually stored
  // for every message, so we can debug Line-2 inbox separation issues.
  let messagesAudit: Record<string, unknown> = { error: "KV not configured" };
  try {
    const allMessages = await getMessages();
    const channelCounts: Record<string, number> = {};
    for (const m of allMessages) {
      const ch = m.channel || "(none/primary)";
      channelCounts[ch] = (channelCounts[ch] ?? 0) + 1;
    }
    const recent = allMessages.slice(-15).map((m) => ({
      id: m.id,
      direction: m.direction,
      from: m.from,
      to: m.to,
      channel: m.channel ?? null,
      body: (m.body ?? "").slice(0, 60),
      timestamp: m.timestamp,
    }));
    messagesAudit = {
      total: allMessages.length,
      byChannel: channelCounts,
      last15: recent,
    };
  } catch (e) {
    messagesAudit = { error: String(e) };
  }

  return NextResponse.json({
    success: sendable.length > 0 && !tokenInfo.expired,
    verdict,
    token: tokenInfo,
    waba: { id: wabaId ?? null, error: wabaError, numbers: wabaNumbers, subscribedApps },
    configured,
    checks,
    check,
    usableIds: visibleIds,
    messages: messagesAudit,
  });
}
