import { NextResponse } from "next/server";
import { sendOpenEmailMessage } from "@/lib/openemail";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    // `accountId` is the sending mailbox id; kept for backward compatibility.
    const mailbox = body.mailbox || body.accountId;
    const { fromAddress, fromName, toAddress, subject, content, text } = body;
    const messageText = text ?? content;

    if (!mailbox || !fromAddress || !toAddress || !subject || !messageText) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

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
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
