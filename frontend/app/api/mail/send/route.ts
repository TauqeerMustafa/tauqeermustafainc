import { NextResponse } from "next/server";
import { sendOpenEmailMessage } from "@/lib/openemail";
import { assertMailboxAccess, mailErrorStatus, resolveMailUser } from "@/lib/mail-auth";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    // `accountId` is the sending mailbox id; kept for backward compatibility.
    const mailbox = body.mailbox || body.accountId;
    const { fromName, toAddress, subject, content, text } = body;
    const messageText = text ?? content;

    if (!mailbox || !toAddress || !subject || !messageText) {
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
      to: [toAddress],
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
