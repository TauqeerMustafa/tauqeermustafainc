/**
 * GET  /api/whatsapp/meta-templates — list our predefined templates annotated
 *                                     with their live approval status from Meta.
 * POST /api/whatsapp/meta-templates — submit predefined template(s) to Meta for
 *                                     approval. Body: { name?: string, all?: boolean }
 *
 * Env vars:
 *   WHATSAPP_TOKEN                 – access token with whatsapp_business_management
 *   WHATSAPP_BUSINESS_ACCOUNT_ID   – the WABA ID (NOT the phone number ID)
 */
import { NextResponse } from "next/server";
import { META_TEMPLATES, buildCreateComponents, type MetaTemplateDef } from "@/lib/meta-templates";

const GRAPH_URL = "https://graph.facebook.com/v20.0";

function config() {
  return {
    token: process.env.WHATSAPP_TOKEN,
    wabaId: process.env.WHATSAPP_BUSINESS_ACCOUNT_ID,
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
  const { token, wabaId } = config();

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

// ─── POST: submit predefined template(s) to Meta for approval ────────────────
async function submitOne(token: string, wabaId: string, def: MetaTemplateDef) {
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
      ok: alreadyExists,
      status: alreadyExists ? "ALREADY_SUBMITTED" : "ERROR",
      error: alreadyExists ? undefined : detailMsg,
      metaError: {
        message: err.message,
        code: err.code,
        error_subcode: err.error_subcode,
        error_user_title: err.error_user_title,
        error_user_msg: err.error_user_msg,
      },
    };
  }

  return { name: def.name, ok: true, status: json?.status || "PENDING", id: json?.id };
}

export async function POST(request: Request) {
  const { token, wabaId } = config();
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

    // Submit sequentially — Meta rate-limits bursts of template creation.
    const results = [];
    for (const def of toSubmit) {
      results.push(await submitOne(token, wabaId, def));
    }

    const submitted = results.filter((r) => r.ok).length;
    return NextResponse.json({
      success: true,
      submitted,
      total: results.length,
      results,
      message: `Submitted ${submitted}/${results.length} template(s) to Meta. Approval usually takes a few minutes to a few hours.`,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to submit templates" },
      { status: 500 }
    );
  }
}
