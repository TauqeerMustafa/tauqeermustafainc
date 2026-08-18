/**
 * GET /api/whatsapp/rules
 * PUT /api/whatsapp/rules
 * Auto-reply rules storage
 *
 * Storage: In production, use a database. For now, returns default rule.
 */
import { NextResponse } from "next/server";

const DEFAULT_RULES = [
  {
    id: "welcome",
    keyword: "hi, hello, hey, salam, assalam o alaikum",
    mode: "contains",
    reply: "👋 Welcome to Tauqeer Mustafa Inc! Thanks for reaching out. A team member will reply shortly.",
    enabled: true,
  },
];

// TODO: Replace with real storage (database, Vercel KV, etc.)
export async function GET() {
  return NextResponse.json({
    success: true,
    data: DEFAULT_RULES,
  });
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { rules } = body;

    // TODO: Save to database
    // For now, just acknowledge
    return NextResponse.json({
      success: true,
      message: "Rules saved (in-memory only — add database persistence)",
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to save rules" },
      { status: 500 }
    );
  }
}
