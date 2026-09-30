import { NextResponse } from "next/server";
import { resolveStaffOrCustomerQuery } from "@/lib/omni-resolver";
import { sendOpenEmailMessage } from "@/lib/openemail";

const DEFAULT_MAILBOX_ID = "01M1TEFW41Y9FDR3SHCY0053CS"; // notifications@tauqeermustafa.tech

/**
 * POST /api/mail/inbound
 * Inbound Email Webhook & Automated Resolution Handler
 *
 * Compatible with open.email webhooks, SMTP relays, forwarders, and direct JSON triggers.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();

    const from = String(body.from || body.sender || body.fromAddress || "").trim();
    const name = String(body.fromName || body.name || from.split("@")[0] || "User").trim();
    const subject = String(body.subject || "Support Query").trim();
    const message = String(body.text || body.content || body.message || body.html || "").trim();
    const mailboxId = String(body.mailboxId || body.mailbox || DEFAULT_MAILBOX_ID).trim();
    const autoReply = Boolean(body.autoReply ?? true);

    if (!from || !message) {
      return NextResponse.json(
        { success: false, error: "Missing required fields: 'from' and message body ('text')." },
        { status: 400 }
      );
    }

    console.log(`[mail/inbound] Inbound email from: ${from} | Subject: "${subject}"`);

    // 1. Run OmniAssistant Diagnostic & Resolution Engine
    const analysis = await resolveStaffOrCustomerQuery({
      text: `${subject}\n\n${message}`,
      senderName: name,
      channel: "email",
      extraData: { subject, from },
    });

    let replied = false;
    let replyError: string | undefined;

    // 2. Dispatch automated email reply with resolution
    if (autoReply && analysis.replyText) {
      try {
        await sendOpenEmailMessage(mailboxId, {
          from: "notifications@tauqeermustafa.tech",
          fromName: "Tauqeer Mustafa Inc Support Desk",
          to: [from],
          subject: subject.toLowerCase().startsWith("re:") ? subject : `Re: ${subject}`,
          text: analysis.replyText,
        });
        replied = true;
        console.log(`[mail/inbound] Automated resolution sent to ${from}`);
      } catch (err: any) {
        replyError = err?.message || String(err);
        console.error(`[mail/inbound] Failed to dispatch email reply:`, err);
      }
    }

    return NextResponse.json({
      success: true,
      sender: { name, email: from },
      subject,
      category: analysis.category,
      diagnosis: analysis.diagnosis,
      actionTaken: analysis.actionTaken,
      replyText: analysis.replyText,
      emailDetails: analysis.emailDetails,
      autoReplied: replied,
      replyError,
    });
  } catch (error) {
    console.error("[mail/inbound] Error:", error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
