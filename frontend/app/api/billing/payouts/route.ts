import { NextResponse } from "next/server";
import { getKV } from "@/lib/kv";
import { appConfig } from "@/config/app";

const API_BASE_URL = appConfig.apiBaseUrl;

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, message: "Invalid payload." }, { status: 400 });
  }

  const {
    fullName,
    email,
    phone,
    department = "Engineering",
    invoiceRef,
    amount,
    currency = "PKR",
    method = "Raast Instant Transfer",
    accountTitle,
    bankName,
    accountIban,
    deliverableNotes,
  } = body as {
    fullName?: string;
    email?: string;
    phone?: string;
    department?: string;
    invoiceRef?: string;
    amount?: string | number;
    currency?: string;
    method?: string;
    accountTitle?: string;
    bankName?: string;
    accountIban?: string;
    deliverableNotes?: string;
  };

  if (!fullName || !email || !amount || !accountTitle || !accountIban) {
    return NextResponse.json(
      { success: false, message: "Full name, email, amount, and account coordinates are required." },
      { status: 422 }
    );
  }

  const reference = `TMI-PO-2026-${Date.now().toString().slice(-5)}`;
  const submittedDate = new Date().toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const accountMask = accountIban.length > 8
    ? `${bankName || "Bank"} •••• ${accountIban.slice(-4)}`
    : `${bankName || "Account"} (${accountIban})`;

  const payoutRecord = {
    reference,
    payeeName: fullName,
    email,
    phone,
    department,
    scope: invoiceRef || "Milestone Delivery & Contributor Settlement",
    amount: String(amount),
    currency,
    method,
    accountMask,
    accountTitle,
    status: "processing",
    submittedDate,
    estimatedDate: "Within 48 hours (Treasury SLA)",
    notes: deliverableNotes || "Submitted for technical lead sign-off and finance audit.",
  };

  // 1. Store in KV
  try {
    const kv = getKV();
    if (kv) {
      await kv.set(`payout:${reference}`, JSON.stringify(payoutRecord), { ex: 60 * 60 * 24 * 180 });
    }
  } catch (err) {
    console.error("KV payout save error:", err);
  }

  // 2. Notify corporate backend
  try {
    await fetch(`${API_BASE_URL}/contact`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: fullName,
        email,
        company: "Contractor Payout Queue",
        message: `[PAYOUT REQUEST: ${reference}]\nAmount: ${currency} ${amount}\nMethod: ${method}\nAccount: ${accountTitle} (${accountIban})\nDepartment: ${department}\nNotes: ${deliverableNotes || "None"}`,
      }),
    });
  } catch {
    // Non-blocking
  }

  return NextResponse.json({ success: true, payout: payoutRecord }, { status: 201 });
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const ref = searchParams.get("ref")?.trim().toUpperCase();

  if (!ref) {
    return NextResponse.json({ success: false, message: "Reference is required." }, { status: 400 });
  }

  const kv = getKV();
  if (kv) {
    try {
      const data = await kv.get(`payout:${ref}`);
      if (data) {
        const record = typeof data === "string" ? JSON.parse(data) : data;
        return NextResponse.json({ success: true, payout: record });
      }
    } catch {
      // Fall through
    }
  }

  return NextResponse.json(
    { success: false, message: `Disbursement record "${ref}" not found in live registry.` },
    { status: 404 }
  );
}
