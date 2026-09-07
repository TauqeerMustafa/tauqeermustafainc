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
    const { fromName, subject, content, text } = body;
    const messageText = text ?? content;

    // `to` may arrive as an array or a string; `toAddress` is the legacy single field.
    const to = toList(body.to ?? body.toAddress);
    const cc = toList(body.cc);
    const bcc = toList(body.bcc);

    if (!mailbox || to.length === 0 || !subject || !messageText) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

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
