import { NextResponse } from "next/server";

import { appConfig } from "@/config/app";

const API_BASE_URL = appConfig.apiBaseUrl;

export async function POST(request: Request) {
  let body: Record<string, unknown>;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, message: "Invalid request." },
      { status: 400 },
    );
  }

  const detailLines = [
    body.subject ? `Subject: ${body.subject}` : null,
    body.service ? `Service: ${body.service}` : null,
    body.budget ? `Budget: ${body.budget}` : null,
    body.phone ? `Phone: ${body.phone}` : null,
  ].filter(Boolean);

  const payload = {
    name: body.fullName,
    email: body.email,
    company: body.company || undefined,
    message: [...detailLines, "", body.message].filter(Boolean).join("\n"),
  };

  try {
    const response = await fetch(`${API_BASE_URL}/contact`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      return NextResponse.json(
        {
          success: false,
          message: data?.message ?? data?.detail ?? "We could not send your message.",
        },
        { status: response.status },
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: data?.message ?? "Contact form received.",
        data: data?.data ?? body,
      },
      { status: 200 },
    );
  } catch {
    // Backend unreachable (e.g. not running in this environment) - fail gracefully
    // instead of pretending the message was delivered.
    return NextResponse.json(
      {
        success: false,
        message:
          "We could not reach the server right now. Please email us directly or try again shortly.",
      },
      { status: 502 },
    );
  }
}
