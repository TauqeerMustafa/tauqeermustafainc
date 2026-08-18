/**
 * GET /api/whatsapp/rules
 * PUT /api/whatsapp/rules
 * Auto-reply rules storage (Upstash Redis)
 */
import { NextResponse } from "next/server";
import { kv, KEYS } from "@/lib/kv";

const DEFAULT_RULES = [
  {
    id: "welcome",
    keyword: "hi, hello, hey, salam, assalam o alaikum",
    mode: "contains",
    reply: "👋 Welcome to Tauqeer Mustafa Inc! Thanks for reaching out. A team member will reply shortly.",
    enabled: true,
  },
];

export async function GET() {
  try {
    let rules = await kv.get<any[]>(KEYS.rules);

    // Initialize with defaults if empty
    if (!rules || rules.length === 0) {
      rules = DEFAULT_RULES;
      await kv.set(KEYS.rules, rules);
    }

    return NextResponse.json({
      success: true,
      data: rules,
    });
  } catch (error) {
    console.error("[rules] GET error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to load rules" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { rules } = body;

    if (!Array.isArray(rules)) {
      return NextResponse.json(
        { success: false, error: "Rules must be an array" },
        { status: 400 }
      );
    }

    await kv.set(KEYS.rules, rules);
    return NextResponse.json({
      success: true,
      message: "Rules saved successfully",
    });
  } catch (error) {
    console.error("[rules] PUT error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to save rules" },
      { status: 500 }
    );
  }
}
