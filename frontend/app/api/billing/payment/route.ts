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
    clientName,
    clientEmail,
    amount,
    currency = "USD",
    service = "Technical Services",
    projectRef,
    method = "card",
    senderBank,
    bankRef,
    bankNotes,
    cardLast4,
  } = body as {
    clientName?: string;
    clientEmail?: string;
    amount?: number;
    currency?: string;
    service?: string;
    projectRef?: string;
    method?: string;
    senderBank?: string;
    bankRef?: string;
    bankNotes?: string;
    cardLast4?: string;
  };

  if (!clientName || !clientEmail || !amount || Number(amount) <= 0) {
    return NextResponse.json(
      { success: false, message: "Client name, email, and valid amount are required." },
      { status: 422 }
    );
  }

  const txId = `TMI-TXN-${Date.now().toString().slice(-6)}`;
  const timestamp = new Date().toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const receipt = {
    transactionId: txId,
    invoiceNumber: projectRef || `DEP-${Date.now().toString().slice(-5)}`,
    clientName,
    clientEmail,
    amount: Number(amount),
    currency,
    service,
    method:
      method === "card"
        ? `Card (•••• ${cardLast4 || "4242"})`
        : method === "bank"
        ? `Direct Bank Transfer (${senderBank || "Meezan Bank"})`
        : "Wise Multi-Currency Wire",
    status: method === "bank" ? "PENDING_RECONCILIATION" : "PENDING_VERIFICATION",
    timestamp,
    referenceNote: bankRef ? `Bank RRN / Ref: ${bankRef}` : undefined,
    bankNotes: bankNotes || undefined,
  };

  // 1. Store in KV if available
  try {
    const kv = getKV();
    if (kv) {
      await kv.set(`payment:${txId}`, JSON.stringify(receipt), { ex: 60 * 60 * 24 * 365 });
    }
  } catch (err) {
    console.error("KV payment save error:", err);
  }

  // 2. Forward notification to corporate backend
  try {
    await fetch(`${API_BASE_URL}/contact`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: clientName,
        email: clientEmail,
        company: "Billing & Treasury Settlement",
        message: `[PAYMENT RECEIPT: ${txId}]\nAmount: ${currency} ${amount}\nMethod: ${receipt.method}\nStatus: ${receipt.status}\nReference: ${receipt.invoiceNumber}`,
      }),
    });
  } catch {
    // Non-blocking if backend is offline
  }

  return NextResponse.json({ success: true, receipt }, { status: 201 });
}

import { resolveAuthUser } from "@/lib/server-auth";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const invoice = searchParams.get("invoice")?.trim().toUpperCase();
  const txId = searchParams.get("txId")?.trim().toUpperCase();
  const email = searchParams.get("email")?.trim().toLowerCase();

  const user = await resolveAuthUser(request);
  const kv = getKV();

  const canAccess = (clientEmail?: string) => {
    if (user && (user.isAdmin || user.role === "manager" || user.role === "admin")) return true;
    if (email && clientEmail && clientEmail.toLowerCase() === email) return true;
    if (user && clientEmail && clientEmail.toLowerCase() === user.email.toLowerCase()) return true;
    return false;
  };

  if (txId && kv) {
    try {
      const data = await kv.get(`payment:${txId}`);
      if (data) {
        const receipt = typeof data === "string" ? JSON.parse(data) : data;
        if (!canAccess(receipt?.clientEmail)) {
          return NextResponse.json(
            { success: false, message: "Access denied. Provide your client email to view this receipt." },
            { status: 403 }
          );
        }
        return NextResponse.json({ success: true, receipt });
      }
    } catch {
      // Fall through to 404
    }
  }

  if (invoice && kv) {
    try {
      const data = await kv.get(`invoice:${invoice}`);
      if (data) {
        const inv = typeof data === "string" ? JSON.parse(data) : data;
        if (!canAccess(inv?.clientEmail)) {
          return NextResponse.json(
            { success: false, message: "Access denied. Provide your client email to view this invoice." },
            { status: 403 }
          );
        }
        return NextResponse.json({ success: true, invoice: inv });
      }
    } catch {
      // Fall through to 404
    }
  }

  return NextResponse.json(
    { success: false, message: "Record not found in live registry." },
    { status: 404 }
  );
}
