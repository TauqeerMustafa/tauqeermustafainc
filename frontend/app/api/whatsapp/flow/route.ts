/**
 * GET  /api/whatsapp/flow ? list current programmatic bot flow steps (defaults or KV custom)
 * PUT  /api/whatsapp/flow ? update and save programmatic bot flow steps
 * POST /api/whatsapp/flow ? actions (e.g. action: "reset")
 */
import { NextResponse } from "next/server";
import {
  DEFAULT_STEPS,
  getFlowSteps,
  saveFlowSteps,
  resetFlowSteps,
  type FlowStep,
} from "@/lib/wa-flow";
import { getKV, KEYS } from "@/lib/kv";

export async function GET() {
  try {
    const kv = getKV();
    let isCustom = false;
    if (kv) {
      const custom = await kv.get<FlowStep[]>(KEYS.flow);
      if (Array.isArray(custom) && custom.length > 0) {
        isCustom = true;
      }
    }

    const steps = await getFlowSteps();
    return NextResponse.json({
      success: true,
      data: steps,
      isCustom,
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
    const { steps } = body as { steps: FlowStep[] };

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

    const saved = await saveFlowSteps(steps);
    return NextResponse.json({
      success: true,
      message: saved ? "Flow saved successfully" : "Flow updated in-memory (KV not configured)",
      data: steps,
      isCustom: true,
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

    if (action === "reset") {
      await resetFlowSteps();
      return NextResponse.json({
        success: true,
        message: "Bot flow reset to defaults",
        data: DEFAULT_STEPS,
        isCustom: false,
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
