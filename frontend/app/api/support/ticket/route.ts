import { NextResponse } from "next/server";
import { appConfig } from "@/config/app";
import { getKV } from "@/lib/kv";

const API_BASE_URL = appConfig.apiBaseUrl;

export async function POST(request: Request) {
  let body: Record<string, unknown>;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, message: "Invalid request payload." },
      { status: 400 }
    );
  }

  const {
    ticketId,
    fullName,
    email,
    clientId,
    department = "Technical Support",
    severity = "P3 - Standard",
    subject,
    message,
  } = body as {
    ticketId?: string;
    fullName?: string;
    email?: string;
    clientId?: string;
    department?: string;
    severity?: string;
    subject?: string;
    message?: string;
  };

  if (!fullName || !email || !subject || !message) {
    return NextResponse.json(
      { success: false, message: "Full name, email, subject, and message are required." },
      { status: 422 }
    );
  }

  const refId = ticketId || `TMI-SUP-${Math.floor(10000 + Math.random() * 90000)}`;
  const createdAt = new Date().toISOString();

  const ticketData = {
    ticketId: refId,
    fullName,
    email,
    clientId: clientId || undefined,
    department,
    severity,
    subject,
    message,
    status: "OPEN",
    createdAt,
  };

  // 1. Save to KV
  try {
    const kv = getKV();
    if (kv) {
      await kv.set(`ticket:${refId}`, JSON.stringify(ticketData), { ex: 60 * 60 * 24 * 180 });
    }
  } catch (err) {
    console.error("KV ticket error:", err);
  }

  // 2. Forward to corporate backend contact
  let forwarded = false;
  try {
    const res = await fetch(`${API_BASE_URL}/contact`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: fullName,
        email,
        company: clientId || "Support Request",
        message: `[SUPPORT TICKET: ${refId}]\nDepartment: ${department}\nSeverity: ${severity}\nSubject: ${subject}\n\n${message}`,
      }),
    });
    if (res.ok) {
      forwarded = true;
    }
  } catch {
    forwarded = false;
  }

  return NextResponse.json(
    {
      success: true,
      ticketId: refId,
      status: "OPEN",
      department,
      severity,
      createdAt,
      forwarded,
      message: `Support ticket ${refId} created successfully. Our engineering triage team has been notified.`,
    },
    { status: 201 }
  );
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id")?.trim().toUpperCase();

  if (!id) {
    return NextResponse.json({ success: false, message: "Ticket ID is required." }, { status: 400 });
  }

  const kv = getKV();
  if (kv) {
    try {
      const data = await kv.get(`ticket:${id}`);
      if (data) {
        const ticket = typeof data === "string" ? JSON.parse(data) : data;
        return NextResponse.json({ success: true, ticket });
      }
    } catch {
      // Fall through
    }
  }

  return NextResponse.json(
    { success: false, message: `Ticket "${id}" not found in live registry.` },
    { status: 404 }
  );
}
