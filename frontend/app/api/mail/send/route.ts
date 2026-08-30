import { NextResponse } from "next/server";
import { sendOpenEmailMessage } from "@/lib/openemail";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { accountId, fromAddress, toAddress, subject, content } = body;

    if (!accountId || !toAddress || !subject || !content) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const payload = {
      to: [toAddress],
      subject: subject,
      body: content,
      // OpenEmail API might not need fromAddress if mailbox handles it, but include if necessary
    };

    const resData = await sendOpenEmailMessage(accountId, payload);

    return NextResponse.json({ success: true, data: resData });
  } catch (error: any) {
    console.error("Mail send error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
