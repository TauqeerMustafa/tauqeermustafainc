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

// ─── GET: predefined templates + live Meta status ────────────────────────────
export async function GET() {
  const { token, wabaId } = config();

  // Always return our predefined library so the UI can render even before setup.
  const base = META_TEMPLATES.map((t) => ({ ...t, status: "NOT_SUBMITTED" as string }));

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
      `${GRAPH_URL}/${wabaId}/message_templates?fields=name,status,category,language&limit=200`,
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

    // Map live status by template name
    const liveStatus = new Map<string, string>();
    for (const tpl of json?.data ?? []) {
      if (tpl?.name) liveStatus.set(tpl.name, tpl.status ?? "UNKNOWN");
    }

    const data = META_TEMPLATES.map((t) => ({
      ...t,
      status: liveStatus.get(t.name) ?? "NOT_SUBMITTED",
    }));

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
    // Duplicate name = already submitted; treat as a soft success
    const msg = json?.error?.message || "Submit failed";
    const alreadyExists = /already exists|same name/i.test(msg);
    return { name: def.name, ok: alreadyExists, status: alreadyExists ? "ALREADY_SUBMITTED" : "ERROR", error: alreadyExists ? undefined : msg };
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
