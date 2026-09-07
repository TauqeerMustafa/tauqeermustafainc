/**
 * GET /api/whatsapp/rules — list auto-reply rules (seeds defaults on first read)
 * PUT /api/whatsapp/rules — replace the rule set
 *
 * Rule storage + the DEFAULT_RULES seed live in lib/wa-store so the webhook's
 * auto-reply engine and this admin API always agree on shape and defaults.
 */
import { NextResponse } from "next/server";
import { isStoreReady, getRules, setRules, DEFAULT_RULES, type AutoReplyRule } from "@/lib/wa-store";

export async function GET() {
  try {
    if (!isStoreReady()) {
      return NextResponse.json({
        success: true,
        data: DEFAULT_RULES,
        notice: "Using default rules — KV not configured",
      });
    }

    const rules = await getRules();
    return NextResponse.json({ success: true, data: rules });
  } catch (error) {
    console.error("[rules] GET error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to load rules", detail: String(error) },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { rules } = body as { rules: AutoReplyRule[] };

    if (!Array.isArray(rules)) {
      return NextResponse.json({ success: false, error: "Rules must be an array" }, { status: 400 });
    }

    if (!isStoreReady()) {
      return NextResponse.json({ success: true, notice: "KV not configured — rules not persisted" });
    }

    await setRules(rules);
    return NextResponse.json({ success: true, message: "Rules saved successfully" });
  } catch (error) {
    console.error("[rules] PUT error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to save rules", detail: String(error) },
      { status: 500 }
    );
  }
}
