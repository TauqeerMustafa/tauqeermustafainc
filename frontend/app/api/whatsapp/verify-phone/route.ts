/**
 * POST /api/whatsapp/verify-phone
 *
 * Direct WhatsApp Cloud API verification and registration gateway.
 * Enables requesting OTP verification via Voice Call (to bypass carrier SMS delivery failure)
 * and registering 6-digit PIN codes directly into Meta Graph API.
 *
 * Gated by proxy.ts with admin credentials.
 */
import { NextResponse } from "next/server";
import { accountAt } from "@/lib/wa-accounts";

const GRAPH_URL = "https://graph.facebook.com/v20.0";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, phoneNumberId, slot = 1, method = "VOICE", language = "en_US", pin } = body;

    if (!phoneNumberId || typeof phoneNumberId !== "string") {
      return NextResponse.json(
        { success: false, error: "phoneNumberId is required." },
        { status: 400 }
      );
    }

    const account = accountAt(Number(slot) || 1);
    const token = account.token?.trim() || accountAt(1).token?.trim();

    if (!token) {
      return NextResponse.json(
        { success: false, error: `WHATSAPP_TOKEN for Slot ${slot} is not configured.` },
        { status: 400 }
      );
    }

    const cleanId = phoneNumberId.trim();

    // 1. Check Phone Status
    if (action === "status") {
      const url = new URL(`${GRAPH_URL}/${cleanId}`);
      url.searchParams.set("fields", "id,display_phone_number,verified_name,quality_rating,code_verification_status");
      url.searchParams.set("access_token", token);

      const res = await fetch(url, { cache: "no-store" });
      const json = await res.json();

      if (!res.ok) {
        return NextResponse.json(
          {
            success: false,
            error: json?.error?.message || `Meta returned HTTP ${res.status}`,
            code: json?.error?.code,
          },
          { status: res.status }
        );
      }

      return NextResponse.json({
        success: true,
        data: {
          id: json.id,
          displayNumber: json.display_phone_number ?? null,
          verifiedName: json.verified_name ?? null,
          quality: json.quality_rating ?? null,
          codeVerificationStatus: json.code_verification_status ?? "UNKNOWN",
        },
      });
    }

    // 2. Request OTP Code (Voice Call / SMS)
    if (action === "request_code") {
      const codeMethod = (method || "VOICE").toUpperCase() === "SMS" ? "SMS" : "VOICE";
      const res = await fetch(`${GRAPH_URL}/${cleanId}/request_code`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code_method: codeMethod,
          language: language || "en_US",
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        const err = json?.error;
        let advice = "Unable to request OTP code from Meta.";

        if (err?.code === 133010 || err?.error_subcode === 2207001) {
          advice = "Phone number is already registered or rate-limited. Wait 15 minutes before requesting again.";
        } else if (err?.code === 133004) {
          advice = "This number is currently active on personal/business WhatsApp mobile app. Open WhatsApp on phone -> Settings -> Account -> Delete Account first.";
        } else if (err?.code === 133005) {
          advice = "Two-step verification is enabled on this number. Use your existing 6-digit two-step PIN in the register action.";
        } else if (err?.message) {
          advice = err.message;
        }

        return NextResponse.json(
          {
            success: false,
            error: advice,
            metaError: err?.message,
            code: err?.code,
            subcode: err?.error_subcode,
          },
          { status: res.status }
        );
      }

      return NextResponse.json({
        success: true,
        method: codeMethod,
        message:
          codeMethod === "VOICE"
            ? "Meta is initiating a voice call to your phone. Answer to receive your 6-digit OTP code."
            : "Verification code requested via SMS.",
      });
    }

    // 3. Register with 6-Digit OTP / PIN
    if (action === "register") {
      if (!pin || String(pin).trim().length < 6) {
        return NextResponse.json(
          { success: false, error: "A 6-digit OTP or PIN is required." },
          { status: 400 }
        );
      }

      const res = await fetch(`${GRAPH_URL}/${cleanId}/register`, {
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

      const json = await res.json();

      if (!res.ok) {
        const err = json?.error;
        let advice = "Verification failed.";

        if (err?.code === 133006) {
          advice = "Incorrect 6-digit OTP code or PIN. Please double-check and try again.";
        } else if (err?.code === 133008) {
          advice = "OTP code has expired. Request a new code using Voice Call.";
        } else if (err?.message) {
          advice = err.message;
        }

        return NextResponse.json(
          {
            success: false,
            error: advice,
            metaError: err?.message,
            code: err?.code,
          },
          { status: res.status }
        );
      }

      return NextResponse.json({
        success: true,
        message: "Phone number successfully verified and registered with WhatsApp Cloud API!",
      });
    }

    return NextResponse.json(
      { success: false, error: `Invalid action: "${action}". Supported: request_code, register, status.` },
      { status: 400 }
    );
  } catch (error) {
    console.error("[verify-phone] Error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error", detail: String(error) },
      { status: 500 }
    );
  }
}
