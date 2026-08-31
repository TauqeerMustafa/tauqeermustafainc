import { NextResponse } from "next/server";
import { fetchOpenEmailMessageContent } from "@/lib/openemail";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    // Accept both the new `mailbox`/`id` params and the legacy accountId/messageId.
    const mailbox = searchParams.get("mailbox") || searchParams.get("accountId");
    const messageId = searchParams.get("id") || searchParams.get("messageId");

    if (!mailbox || !messageId) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 });
    }

    const data = await fetchOpenEmailMessageContent(mailbox, messageId);
    const content = data.html || data.htmlBody || data.text || data.textBody || data.body || "";

    return NextResponse.json({
      content: content || "No content available.",
      isHtml: Boolean(data.html || data.htmlBody),
      attachments: data.attachments || [],
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
