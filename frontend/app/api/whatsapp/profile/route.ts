/**
 * GET  /api/whatsapp/profile — Read live WhatsApp Business Profile and name_status from Meta
 * POST /api/whatsapp/profile — Push verified company profile details (about, description, websites, address) to Meta
 *
 * Gated by proxy.ts with admin credentials.
 */
import { NextResponse } from "next/server";
import { accountAt } from "@/lib/wa-accounts";
import { company } from "@/data/company";
import { waNumbers } from "@/lib/wa-numbers";

const GRAPH_URL = "https://graph.facebook.com/v20.0";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const phoneNumberId = searchParams.get("phoneNumberId")?.trim();
    const slotNum = Number(searchParams.get("slot")) || 1;

    if (!phoneNumberId) {
      return NextResponse.json({ success: false, error: "phoneNumberId is required" }, { status: 400 });
    }

    const account = accountAt(slotNum);
    const token = account.token?.trim();
    if (!token) {
      return NextResponse.json({ success: false, error: `Token for slot ${slotNum} is not configured.` }, { status: 400 });
    }

    // 1. Query phone number details including name_status
    const phoneUrl = new URL(`${GRAPH_URL}/${phoneNumberId}`);
    phoneUrl.searchParams.set("fields", "id,display_phone_number,verified_name,name_status,new_name_status,code_verification_status,quality_rating");
    phoneUrl.searchParams.set("access_token", token);

    const phoneRes = await fetch(phoneUrl, { cache: "no-store" });
    const phoneData = await phoneRes.json();

    // 2. Query whatsapp_business_profile
    const profUrl = new URL(`${GRAPH_URL}/${phoneNumberId}/whatsapp_business_profile`);
    profUrl.searchParams.set("fields", "about,address,description,email,profile_picture_url,websites,vertical");
    profUrl.searchParams.set("access_token", token);

    const profRes = await fetch(profUrl, { cache: "no-store" });
    const profData = await profRes.json();

    return NextResponse.json({
      success: true,
      phone: phoneData,
      profile: profData?.data?.[0] || profData,
    });
  } catch (error) {
    console.error("[profile] GET error:", error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { phoneNumberId, slot = 1, pin } = body;

    if (!phoneNumberId) {
      return NextResponse.json({ success: false, error: "phoneNumberId is required" }, { status: 400 });
    }

    const numDef = waNumbers().find((n) => n.id === phoneNumberId);
    const slotNum = Number(slot) || numDef?.slot || 1;
    const account = accountAt(slotNum);
    const token = account.token?.trim() || accountAt(1).token?.trim();

    if (!token) {
      return NextResponse.json({ success: false, error: `WhatsApp access token for Slot ${slotNum} is not configured.` }, { status: 400 });
    }

    const results: Record<string, any> = {};

    // 1. If PIN provided, re-register with Cloud API to bind latest approved certificate
    if (pin && String(pin).trim().length >= 6) {
      const regRes = await fetch(`${GRAPH_URL}/${phoneNumberId}/register`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          pin: String(pin).trim(),
        }),
      });
      results.registration = await regRes.json();
    }

    // 2. Push company profile to Meta whatsapp_business_profile
    const profilePayload = {
      messaging_product: "whatsapp",
      about: `${company.name} • ${company.tagline}`.slice(0, 139),
      address: company.hq,
      description: company.description.slice(0, 512),
      email: company.email,
      websites: [company.website],
      vertical: "PROF_SERVICES",
    };

    const updateRes = await fetch(`${GRAPH_URL}/${phoneNumberId}/whatsapp_business_profile`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(profilePayload),
    });

    const updateData = await updateRes.json();
    results.profileUpdate = updateData;

    if (!updateRes.ok) {
      return NextResponse.json({
        success: false,
        error: updateData?.error?.message || "Failed to update business profile on Meta.",
        details: results,
      }, { status: updateRes.status });
    }

    return NextResponse.json({
      success: true,
      message: "WhatsApp Business Profile successfully refreshed and synchronized with Meta Cloud API!",
      details: results,
    });
  } catch (error) {
    console.error("[profile] POST error:", error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
