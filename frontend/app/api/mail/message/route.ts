import { NextResponse } from "next/server";
import { fetchOpenEmailMessage } from "@/lib/openemail";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const accountId = searchParams.get("accountId");
    const messageId = searchParams.get("messageId");

    if (!accountId || !messageId) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 });
    }

    const messageData = await fetchOpenEmailMessage(accountId, messageId);

    // openemail structure might have htmlBody or textBody
    return NextResponse.json({
      content: messageData.htmlBody || messageData.textBody || messageData.body || "No content available.",
    });
  } catch (error: any) {
    console.error("Message fetch error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
