/**
 * GET    /api/whatsapp/templates
 * POST   /api/whatsapp/templates
 * DELETE /api/whatsapp/templates
 * Saved message templates (Upstash Redis)
 */
import { NextResponse } from "next/server";
import { kv, KEYS } from "@/lib/kv";

const DEFAULT_TEMPLATES = [
  { name: "hours", text: "🕒 We're open Mon–Sat, 9am–6pm (PKT). We'll get back to you soon!" },
  { name: "thanks", text: "🙏 Thank you for contacting Tauqeer Mustafa Inc. Have a great day!" },
];

export async function GET() {
  try {
    let templates = await kv.get<any[]>(KEYS.templates);

    // Initialize with defaults if empty
    if (!templates || templates.length === 0) {
      templates = DEFAULT_TEMPLATES;
      await kv.set(KEYS.templates, templates);
    }

    return NextResponse.json({
      success: true,
      data: templates,
    });
  } catch (error) {
    console.error("[templates] GET error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to load templates" },
      { status: 500 }
    );
  }
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

    const templates = (await kv.get<any[]>(KEYS.templates)) || [];

    // Check if template exists, update or add
    const existingIndex = templates.findIndex((t) => t.name === name);
    if (existingIndex >= 0) {
      templates[existingIndex] = { name, text };
    } else {
      templates.push({ name, text });
    }

    await kv.set(KEYS.templates, templates);
    return NextResponse.json({
      success: true,
      message: "Template saved successfully",
    });
  } catch (error) {
    console.error("[templates] POST error:", error);
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

    const templates = (await kv.get<any[]>(KEYS.templates)) || [];
    const filtered = templates.filter((t) => t.name !== name);

    await kv.set(KEYS.templates, filtered);
    return NextResponse.json({
      success: true,
      message: "Template deleted successfully",
    });
  } catch (error) {
    console.error("[templates] DELETE error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete template" },
      { status: 500 }
    );
  }
}
