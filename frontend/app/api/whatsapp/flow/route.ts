/**
 * GET  /api/whatsapp/flow ? list current programmatic bot flow steps (defaults or KV custom)
 * PUT  /api/whatsapp/flow ? update and save programmatic bot flow steps
 * POST /api/whatsapp/flow ? actions (e.g. action: "reset")
 */
import { NextResponse } from "next/server";
import {
  getFlowSteps,
  saveFlowSteps,
  resetFlowSteps,
  getFlowKey,
  getDefaultSteps,
  type FlowStep,
} from "@/lib/wa-flow";
import { getKV } from "@/lib/kv";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const dept = searchParams.get("department") as "general" | "support" | null;
    const kv = getKV();
    let isCustom = false;
    const key = getFlowKey(dept || undefined);
    if (kv) {
      const custom = await kv.get<FlowStep[]>(key);
      if (Array.isArray(custom) && custom.length > 0) {
        isCustom = true;
      }
    }

    const steps = await getFlowSteps(dept || undefined);
    return NextResponse.json({
      success: true,
      data: steps,
      isCustom,
      department: dept || "general",
    });
  } catch (error) {
    console.error("[flow] GET error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to load flow steps", detail: String(error) },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { steps, department } = body as { steps: FlowStep[]; department?: "general" | "support" };

    if (!Array.isArray(steps) || steps.length === 0) {
      return NextResponse.json(
        { success: false, error: "Steps must be a non-empty array" },
        { status: 400 }
      );
    }

    for (const step of steps) {
      if (!step.id || !step.kind || !step.body) {
        return NextResponse.json(
          { success: false, error: "Step missing required id, kind, or body" },
          { status: 400 }
        );
      }
    }

    const saved = await saveFlowSteps(steps, department);
    return NextResponse.json({
      success: true,
      message: saved ? "Flow saved successfully" : "Flow updated in-memory (KV not configured)",
      data: steps,
      isCustom: true,
      department: department || "general",
    });
  } catch (error) {
    console.error("[flow] PUT error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to save flow steps", detail: String(error) },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const action = body?.action;
    const department = body?.department as "general" | "support" | undefined;

    if (action === "reset") {
      await resetFlowSteps(department);
      return NextResponse.json({
        success: true,
        message: `Bot flow reset to defaults (${department || "general"})`,
        data: getDefaultSteps(department),
        isCustom: false,
        department: department || "general",
      });
    }

    return NextResponse.json({ success: false, error: "Unknown action" }, { status: 400 });
  } catch (error) {
    console.error("[flow] POST error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to perform flow action", detail: String(error) },
      { status: 500 }
    );
  }
}
