import { NextResponse } from "next/server";
import { appConfig } from "@/config/app";
import { resolveStaffOrCustomerQuery } from "@/lib/omni-resolver";
import { sendOpenEmailMessage } from "@/lib/openemail";

const NOTIFICATIONS_MAILBOX_ID = "01M1TEFW41Y9FDR3SHCY0053CS"; // notifications@qorlune.co.uk

const API_BASE_URL = appConfig.apiBaseUrl;

const DEPARTMENT_DESTINATIONS: Record<string, string> = {
  "General inquiries": "info@qorlune.co.uk",
  "Customer support": "support@qorlune.co.uk",
  "Sales & new business": "sales@qorlune.co.uk",
  "Partnerships": "business@qorlune.co.uk",
  "Marketing & press": "marketing@qorlune.co.uk",
  "Careers": "careers@qorlune.co.uk",
  "Billing & invoices": "billing@qorlune.co.uk",
  "Legal & privacy": "legal@qorlune.co.uk",
};

export async function POST(request: Request) {
  let body: Record<string, unknown>;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, message: "Invalid request payload." },
      { status: 400 },
    );
  }

  const detailLines = [
    body.department ? `Department: ${body.department}` : null,
    body.subject ? `Subject: ${body.subject}` : null,
    body.service ? `Service: ${body.service}` : null,
    body.phone ? `Phone: ${body.phone}` : null,
  ].filter(Boolean);

  const payload = {
    name: body.fullName || "Website Visitor",
    email: body.email,
    company: body.company || undefined,
    message: [...detailLines, "", body.message || ""].filter(Boolean).join("\n"),
  };

  // 1. Try FastAPI backend persistence (non-blocking)
  try {
    await fetch(`${API_BASE_URL}/contact`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }).catch(() => null);
  } catch {
    // Non-blocking: FastAPI might be offline in serverless mode
  }

  // 2. 🤖 Dispatch OpenEmail Auto-Reply & Department Notification
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
          from: "notifications@qorlune.co.uk",
          fromName: "Qorlune LLC",
          to: [payload.email],
          subject: `We have received your inquiry: ${body.service || body.subject || "General Inquiry"}`,
          text: analysis.replyText,
        }).catch((err) => console.warn("[contact] auto-reply email warn:", err));

        const targetDeptEmail = body.department ? DEPARTMENT_DESTINATIONS[String(body.department)] : "info@qorlune.co.uk";
        await sendOpenEmailMessage(NOTIFICATIONS_MAILBOX_ID, {
          from: "notifications@qorlune.co.uk",
          fromName: "Qorlune LLC — Inbound Contact",
          to: [targetDeptEmail, "sales@qorlune.co.uk"],
          subject: `[Website Inquiry] ${body.department || "General"} — ${body.fullName || "Visitor"}`,
          text: `New website inquiry:\n\nFrom: ${body.fullName} (${payload.email})\nCompany: ${body.company || "N/A"}\nPhone: ${body.phone || "N/A"}\nService: ${body.service || "N/A"}\nSubject: ${body.subject || "N/A"}\n\nMessage:\n${body.message || "N/A"}\n`,
        }).catch((err) => console.warn("[contact] department dispatch warn:", err));
      }
    } catch (autoErr) {
      console.error("[contact] Email dispatch error:", autoErr);
    }
  })();

  return NextResponse.json(
    {
      success: true,
      message: "Thank you. Your message has been received and our team will get back to you shortly.",
      data: body,
    },
    { status: 200 },
  );
}
