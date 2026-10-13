import { NextResponse } from "next/server";
import { appConfig } from "@/config/app";
import { resolveStaffOrCustomerQuery } from "@/lib/omni-resolver";
import { sendOpenEmailMessage } from "@/lib/openemail";

const NOTIFICATIONS_MAILBOX_ID = "01M1TEFW41Y9FDR3SHCY0053CS"; // notifications@qorlune.com

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

const DEPARTMENT_DESTINATIONS: Record<string, string> = {
  "General inquiries": "info@qorlune.com",
  "Customer support": "support@qorlune.com",
  "Sales & new business": "sales@qorlune.com",
  "Partnerships": "business@qorlune.com",
  "Marketing & press": "marketing@qorlune.com",
  "Careers": "careers@qorlune.com",
  "Billing & invoices": "billing@qorlune.com",
  "Legal & privacy": "legal@qorlune.com",
};

  const detailLines = [
    body.department ? `Department: ${body.department}` : null,
    body.subject ? `Subject: ${body.subject}` : null,
    body.service ? `Service: ${body.service}` : null,
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

    // 🤖 Trigger OmniAssistant Auto-Reply & Resolution in background
    (async () => {
      try {
        if (payload.email && typeof payload.email === "string") {
          const analysis = await resolveStaffOrCustomerQuery({
            text: String(body.message || ""),
            senderName: String(body.fullName || ""),
            channel: "contact_form",
            extraData: { service: body.service },
          });

          await sendOpenEmailMessage(NOTIFICATIONS_MAILBOX_ID, {
            from: "notifications@qorlune.com",
            fromName: "Qorlune LLC",
            to: [payload.email],
            subject: `We have received your inquiry: ${body.service || "General Inquiry"}`,
            text: analysis.replyText,
          });
          console.log(`[contact] Auto-reply dispatched to ${payload.email}`);

          const targetDeptEmail = body.department ? DEPARTMENT_DESTINATIONS[String(body.department)] : null;
          if (targetDeptEmail) {
            await sendOpenEmailMessage(NOTIFICATIONS_MAILBOX_ID, {
              from: "notifications@qorlune.com",
              fromName: "Qorlune LLC — Website Dispatch",
              to: [targetDeptEmail],
              subject: `[New Inquiry] ${body.department} — ${body.fullName || "Inquiry"}`,
              text: `New website inquiry for ${body.department}:\n\nFrom: ${body.fullName} (${payload.email})\nCompany: ${body.company || "N/A"}\nPhone: ${body.phone || "N/A"}\nService: ${body.service || "N/A"}\nSubject: ${body.subject || "N/A"}\n\nMessage:\n${body.message}\n`,
            });
            console.log(`[contact] Department copy dispatched to ${targetDeptEmail}`);
          }
        }
      } catch (autoErr) {
        console.error("[contact] Failed to dispatch auto-reply email:", autoErr);
      }
    })();

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
