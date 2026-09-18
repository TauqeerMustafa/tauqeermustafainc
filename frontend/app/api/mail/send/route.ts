import { NextResponse } from "next/server";
import { sendOpenEmailMessage } from "@/lib/openemail";
import { assertMailboxAccess, mailErrorStatus, resolveMailUser } from "@/lib/mail-auth";

export const dynamic = "force-dynamic";

/** Accept a comma/semicolon-separated string, an array, or nothing → clean list. */
function toList(value: unknown): string[] {
  if (Array.isArray(value)) return value.map((v) => String(v).trim()).filter(Boolean);
  if (typeof value === "string") return value.split(/[,;]/).map((v) => v.trim()).filter(Boolean);
  return [];
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    // `accountId` is the sending mailbox id; kept for backward compatibility.
    const mailbox = body.mailbox || body.accountId;
    const { fromName, subject, content, text, attachments } = body;
    const rawText = typeof text === "string" ? text.trim() : typeof content === "string" ? content.trim() : "";

    // `to` may arrive as an array or a string; `toAddress` is the legacy single field.
    const to = toList(body.to ?? body.toAddress);
    const cc = toList(body.cc);
    const bcc = toList(body.bcc);

    // Process attachments if provided
    let cleanAttachments: Array<{ filename: string; content: string; contentType?: string }> | undefined;
    if (Array.isArray(attachments)) {
      cleanAttachments = attachments
        .filter((a) => a && typeof a.filename === "string" && typeof a.content === "string")
        .map((a) => ({
          filename: a.filename.trim(),
          content: a.content.trim(),
          ...(typeof a.contentType === "string" ? { contentType: a.contentType.trim() } : {}),
        }));
    }

    const hasAttachments = Boolean(cleanAttachments && cleanAttachments.length > 0);
    if (!mailbox || to.length === 0 || !subject || (!rawText && !hasAttachments)) {
      return NextResponse.json(
        { error: "Missing required fields: recipients, subject, and message text or an attachment are required" },
        { status: 400 },
      );
    }

    const messageText = rawText || (hasAttachments ? "[Attached files]" : "");

    const user = await resolveMailUser(request);
    const mb = await assertMailboxAccess(user, mailbox);
    // The sender is always the authorized mailbox, never a client-supplied value,
    // so a caller can't send "as" a mailbox they don't own.
    const fromAddress = mb.primaryAddress;

    const data = await sendOpenEmailMessage(mailbox, {
      from: fromAddress,
      fromName,
      to,
      cc,
      bcc,
      subject,
      text: messageText,
      attachments: cleanAttachments,
      save: true,
    });

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: mailErrorStatus(error) },
    );
  }
}
