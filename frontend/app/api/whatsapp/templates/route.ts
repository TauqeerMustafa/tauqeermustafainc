/**
 * GET    /api/whatsapp/templates
 * POST   /api/whatsapp/templates
 * DELETE /api/whatsapp/templates
 * Saved message templates (canned responses)
 *
 * Storage: In production, use a database. For now, returns defaults.
 */
import { NextResponse } from "next/server";

const DEFAULT_TEMPLATES = [
  { name: "hours", text: "🕒 We're open Mon–Sat, 9am–6pm (PKT). We'll get back to you soon!" },
  { name: "thanks", text: "🙏 Thank you for contacting Tauqeer Mustafa Inc. Have a great day!" },
];

// TODO: Replace with real storage
export async function GET() {
  return NextResponse.json({
    success: true,
    data: DEFAULT_TEMPLATES,
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, text } = body;

    if (!name || !text) {
      return NextResponse.json(
        { success: false, error: "Name and text required" },
        { status: 400 }
      );
    }

    // TODO: Save to database
    return NextResponse.json({
      success: true,
      message: "Template saved (in-memory only — add database persistence)",
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to save template" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const name = searchParams.get("name");

    if (!name) {
      return NextResponse.json(
        { success: false, error: "Template name required" },
        { status: 400 }
      );
    }

    // TODO: Delete from database
    return NextResponse.json({
      success: true,
      message: "Template deleted (in-memory only — add database persistence)",
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to delete template" },
      { status: 500 }
    );
  }
}
