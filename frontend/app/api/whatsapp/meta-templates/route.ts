/**
 * GET  /api/whatsapp/meta-templates — list our predefined templates annotated
 *                                     with their live approval status from Meta.
 * POST /api/whatsapp/meta-templates — push predefined template(s) to Meta.
 *                                     Body: { name?: string, all?: boolean }
 *
 * WHY POST IS NOT JUST "CREATE"
 * ─────────────────────────────
 * It used to be, and that quietly froze the copy. Meta rejects a second create
 * for a name it already holds, and this route read that rejection as success
 * ("ALREADY_SUBMITTED"), so every later rewrite of lib/meta-templates went
 * nowhere: the admin pressed the button, saw a green message, and Meta carried on
 * sending the original wording forever.
 *
 * So POST now reconciles instead. For each definition:
 *   • not at Meta yet        → create it
 *   • at Meta, copy matches  → skip, report UP_TO_DATE. Meta caps edits per
 *                              template per month, so a no-op edit is a wasted one
 *   • at Meta, copy differs  → POST /{template_id} with { components } only.
 *                              name, language and category are fixed at creation
 *                              and Meta rejects an attempt to change them
 *   • PENDING or IN_APPEAL   → refuse; Meta will not accept an edit mid-review
 *
 * An accepted edit puts the template back into review, and the previously
 * approved wording keeps being delivered until the new one clears — which is what
 * the per-result `note` tells the admin, so nobody concludes the change failed.
 *
 * Env vars:
 *   WHATSAPP_TOKEN                 – access token with whatsapp_business_management
 *   WHATSAPP_BUSINESS_ACCOUNT_ID   – the WABA ID (NOT the phone number ID)
 */
import { NextResponse } from "next/server";
import { META_TEMPLATES, buildCreateComponents, type MetaTemplateDef } from "@/lib/meta-templates";

const GRAPH_URL = "https://graph.facebook.com/v20.0";

import { usableAccounts } from "@/lib/wa-accounts";
function config(request?: Request) {
  const slotParam = request ? new URL(request.url).searchParams.get("slot") : null;
  const slot = slotParam ? parseInt(slotParam, 10) : 1;
  const account = usableAccounts().find(a => a.slot === slot) || usableAccounts()[0];
  return {
    token: account?.token,
    wabaId: account?.wabaId,
  };
}

// ─── GET: predefined templates + live Meta status + Meta-only approved ───────

/** Parse a Meta template's components array into our MetaTemplateDef shape. */
function parseMetaComponents(components: unknown[]): {
  header?: string;
  body: string;
  bodyExample?: string[];
  footer?: string;
  buttons?: string[];
} {
  let header: string | undefined;
  let body = "";
  let bodyExample: string[] | undefined;
  let footer: string | undefined;
  let buttons: string[] | undefined;

  for (const raw of components ?? []) {
    const c = raw as Record<string, any>;
    const t = String(c?.type || "").toUpperCase();
    if (t === "HEADER" && String(c?.format || "").toUpperCase() === "TEXT") {
      header = c.text;
    } else if (t === "BODY") {
      body = c.text ?? "";
      const ex = c?.example?.body_text?.[0];
      if (Array.isArray(ex)) bodyExample = ex.map(String);
    } else if (t === "FOOTER") {
      footer = c.text;
    } else if (t === "BUTTONS" && Array.isArray(c?.buttons)) {
      buttons = c.buttons.map((b: any) => b?.text).filter(Boolean);
    }
  }
  return { header, body, bodyExample, footer, buttons };
}

export async function GET() {
  const { token, wabaId } = config(request);

  // Always return our predefined library so the UI can render even before setup.
  const base = META_TEMPLATES.map((t) => ({ ...t, status: "NOT_SUBMITTED" as string, source: "predefined" as string }));

  if (!token || !wabaId) {
    return NextResponse.json({
      success: true,
      data: base,
      configured: false,
      notice:
        "Set WHATSAPP_BUSINESS_ACCOUNT_ID (your WABA ID) to submit templates and read their approval status.",
    });
  }

  try {
    const res = await fetch(
      `${GRAPH_URL}/${wabaId}/message_templates?fields=name,status,category,language,components&limit=250`,
      { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" }
    );
    const json = await res.json();

    if (!res.ok) {
      return NextResponse.json({
        success: true,
        data: base,
        configured: true,
        notice: json?.error?.message || "Could not read template status from Meta.",
      });
    }

    // Index live templates from Meta by name.
    const live = new Map<string, any>();
    for (const tpl of json?.data ?? []) {
      if (tpl?.name) live.set(tpl.name, tpl);
    }

    // 1) Our predefined templates, annotated with live status.
    const predefinedNames = new Set(META_TEMPLATES.map((t) => t.name));
    const data: Record<string, unknown>[] = META_TEMPLATES.map((t) => ({
      ...t,
      status: live.get(t.name)?.status ?? "NOT_SUBMITTED",
      source: "predefined",
    }));

    // 2) Meta-only templates (created directly in Meta / not in our list) —
    //    surface them automatically so they can be viewed and sent.
    for (const [name, tpl] of live) {
      if (predefinedNames.has(name)) continue;
      const parsed = parseMetaComponents(tpl?.components ?? []);
      data.push({
        name,
        category: (tpl?.category as string) || "MARKETING",
        language: (tpl?.language as string) || "en_US",
        ...parsed,
        status: tpl?.status ?? "UNKNOWN",
        source: "meta",
      });
    }

    // Approved first, then pending/other, then not-submitted.
    const rank = (s: string) => (s === "APPROVED" ? 0 : s === "NOT_SUBMITTED" ? 2 : 1);
    data.sort((a, b) => rank(String(a.status).toUpperCase()) - rank(String(b.status).toUpperCase()));

    return NextResponse.json({ success: true, data, configured: true });
  } catch (error) {
    return NextResponse.json({
      success: true,
      data: base,
      configured: true,
      notice: `Error reading Meta template status: ${String(error)}`,
    });
  }
}

// ─── POST: create or edit predefined template(s) at Meta ─────────────────────

type LiveTemplate = { id: string; status: string; components: unknown[] };

/** One template's outcome. `note` is the sentence the admin UI shows on success. */
type SubmitResult = {
  name: string;
  ok: boolean;
  status: string;
  id?: string;
  note?: string;
  error?: string;
  metaError?: Record<string, unknown>;
};

/** Statuses Meta will not accept an edit for. */
const UNEDITABLE = new Set(["PENDING", "IN_APPEAL", "PENDING_DELETION", "DELETED"]);

/**
 * Comparable print of a template's visible copy. Both sides are run through
 * `parseMetaComponents` first, so what is compared is the header/body/footer/
 * buttons that would actually be delivered — not Meta's component ordering, and
 * not the `example` block, which Meta rewrites on its own.
 */
function copyPrint(components: unknown[]): string {
  const p = parseMetaComponents(components ?? []);
  return JSON.stringify([p.header ?? "", p.body, p.footer ?? "", p.buttons ?? []]);
}

/** One read of every template on the account, indexed by name. */
async function fetchLiveTemplates(token: string, wabaId: string): Promise<Map<string, LiveTemplate>> {
  const out = new Map<string, LiveTemplate>();
  const res = await fetch(
    // `id` is asked for explicitly: it is the edit endpoint's address, and relying
    // on Graph to include it by default when `fields` is set is not worth the risk.
    `${GRAPH_URL}/${wabaId}/message_templates?fields=id,name,status,components&limit=250`,
    { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" }
  );
  const json = await res.json();
  if (!res.ok) return out; // fall through to create, which reports the real error

  for (const tpl of json?.data ?? []) {
    if (!tpl?.name) continue;
    out.set(tpl.name, {
      id: String(tpl.id ?? ""),
      status: String(tpl.status ?? "UNKNOWN").toUpperCase(),
      components: tpl.components ?? [],
    });
  }
  return out;
}

const metaErrorOf = (err: Record<string, any>) => ({
  message: err.message,
  code: err.code,
  error_subcode: err.error_subcode,
  error_user_title: err.error_user_title,
  error_user_msg: err.error_user_msg,
});

/** Push new wording onto a template Meta already holds. */
async function editOne(token: string, def: MetaTemplateDef, live: LiveTemplate): Promise<SubmitResult> {
  const components = buildCreateComponents(def);

  if (copyPrint(components) === copyPrint(live.components)) {
    return { name: def.name, ok: true, status: "UP_TO_DATE", note: "Meta already has this wording." };
  }
  if (UNEDITABLE.has(live.status)) {
    return {
      name: def.name,
      ok: false,
      status: "ERROR",
      error: `Meta has this template as ${live.status}, and a template cannot be edited while it is in that state. Try again once the review finishes.`,
    };
  }
  if (!live.id) {
    return { name: def.name, ok: false, status: "ERROR", error: "Meta returned no template id, so it cannot be edited." };
  }

  const res = await fetch(`${GRAPH_URL}/${live.id}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    // Only components: name, language and category are immutable after creation.
    body: JSON.stringify({ components }),
    cache: "no-store",
  });
  const json = await res.json();

  if (!res.ok) {
    const err = json?.error || {};
    return {
      name: def.name,
      ok: false,
      status: "ERROR",
      error: err.error_user_msg || err.error_user_title || err.message || "Edit failed",
      metaError: metaErrorOf(err),
    };
  }

  return {
    name: def.name,
    ok: true,
    status: "UPDATED",
    id: live.id,
    note: "New wording sent to Meta. It goes back into review, and the old wording keeps sending until it is approved.",
  };
}

async function submitOne(
  token: string,
  wabaId: string,
  def: MetaTemplateDef,
  live?: LiveTemplate
): Promise<SubmitResult> {
  if (live) return editOne(token, def, live);

  const payload = {
    name: def.name,
    language: def.language,
    category: def.category,
    // Let Meta re-classify instead of hard-failing when it disagrees with our category.
    allow_category_change: true,
    components: buildCreateComponents(def),
  };

  const res = await fetch(`${GRAPH_URL}/${wabaId}/message_templates`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
    cache: "no-store",
  });
  const json = await res.json();

  if (!res.ok) {
    const err = json?.error || {};
    // Meta's top-level `message` is generic ("Invalid parameter"); the useful text
    // is in error_user_msg / error_user_title / error_subcode.
    const detailMsg = err.error_user_msg || err.error_user_title || err.message || "Submit failed";
    const combined = `${err.message ?? ""} ${err.error_user_title ?? ""} ${err.error_user_msg ?? ""}`;
    const alreadyExists = /already exists|same name|existing template/i.test(combined);
    return {
      name: def.name,
      ok: false,
      status: "ERROR",
      // Not a success. It means the list read above missed this template, so the
      // new wording has NOT reached Meta — reporting it as fine is how the copy
      // silently went stale before.
      error: alreadyExists
        ? "Meta already has a template with this name but it was not in the list read back, so the wording could not be updated. Reload and try again."
        : detailMsg,
      metaError: metaErrorOf(err),
    };
  }

  return { name: def.name, ok: true, status: json?.status || "PENDING", id: json?.id, note: "Submitted to Meta — awaiting approval." };
}

export async function POST(request: Request) {
  const { token, wabaId } = config(request);
  if (!token || !wabaId) {
    return NextResponse.json(
      {
        success: false,
        error:
          "WHATSAPP_BUSINESS_ACCOUNT_ID is not set. Add your WABA ID (WhatsApp Business Account ID) in Vercel env vars — it's shown in Meta → WhatsApp Manager next to your phone number.",
      },
      { status: 400 }
    );
  }

  let body: { name?: string; all?: boolean } = {};
  try {
    body = await request.json();
  } catch {
    // empty body is allowed
  }

  try {
    let toSubmit: MetaTemplateDef[];
    if (body.all) {
      toSubmit = META_TEMPLATES;
    } else if (body.name) {
      const def = META_TEMPLATES.find((t) => t.name === body.name);
      if (!def) {
        return NextResponse.json({ success: false, error: `Unknown template: ${body.name}` }, { status: 404 });
      }
      toSubmit = [def];
    } else {
      return NextResponse.json({ success: false, error: "Provide { name } or { all: true }" }, { status: 400 });
    }

    // One list read for the whole batch, so each definition knows whether it is a
    // create or an edit without a round trip of its own.
    const live = await fetchLiveTemplates(token, wabaId);

    // Then sequentially — Meta rate-limits bursts of template writes.
    const results: SubmitResult[] = [];
    for (const def of toSubmit) {
      results.push(await submitOne(token, wabaId, def, live.get(def.name)));
    }

    const count = (s: string) => results.filter((r) => r.status === s).length;
    const created = results.filter((r) => r.ok && r.status !== "UPDATED" && r.status !== "UP_TO_DATE").length;
    const updated = count("UPDATED");
    const unchanged = count("UP_TO_DATE");
    const failed = results.filter((r) => !r.ok).length;

    const parts = [
      created ? `${created} submitted` : "",
      updated ? `${updated} updated` : "",
      unchanged ? `${unchanged} already current` : "",
      failed ? `${failed} failed` : "",
    ].filter(Boolean);

    return NextResponse.json({
      success: true,
      // `submitted` kept for callers that read it; it now counts every write that
      // reached Meta, whether a create or an edit.
      submitted: created + updated,
      created,
      updated,
      unchanged,
      failed,
      total: results.length,
      results,
      message:
        (parts.length ? parts.join(", ") : "Nothing to do") +
        (created || updated
          ? ". Anything sent to Meta goes into review, and the previously approved wording keeps sending until the new one is approved."
          : "."),
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to submit templates" },
      { status: 500 }
    );
  }
}
