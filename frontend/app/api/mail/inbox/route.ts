import { NextResponse } from "next/server";
import { fetchOpenEmailMailboxes, fetchOpenEmailMessages } from "@/lib/openemail";

export async function GET() {
  try {
    const mailboxesData = await fetchOpenEmailMailboxes();
    const mailboxes = mailboxesData.mailboxes || [];
    
    if (mailboxes.length === 0) {
      return NextResponse.json({ error: "No OpenEmail mailboxes found" }, { status: 404 });
    }

    const firstMailbox = mailboxes[0];
    const messagesData = await fetchOpenEmailMessages(firstMailbox.id);

    return NextResponse.json({
      account: {
        accountId: firstMailbox.id,
        primaryEmailAddress: firstMailbox.primaryAddress || firstMailbox.id,
      },
      messages: messagesData.messages || [],
    });
  } catch (error: any) {
    console.error("Mail fetch error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
