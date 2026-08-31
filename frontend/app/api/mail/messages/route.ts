import { NextResponse } from "next/server";
import { fetchOpenEmailMessages } from "@/lib/openemail";
import { assertMailboxAccess, mailErrorStatus, resolveMailUser } from "@/lib/mail-auth";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const mailbox = searchParams.get("mailbox");
    const state = searchParams.get("state");
    const cursor = searchParams.get("cursor") || undefined;

    if (!mailbox) {
      return NextResponse.json({ error: "Missing mailbox id" }, { status: 400 });
    }

    const user = await resolveMailUser(request);
    await assertMailboxAccess(user, mailbox);

    const data = await fetchOpenEmailMessages(mailbox, {
      state: state === "expunged" ? "expunged" : undefined,
      cursor,
    });

    return NextResponse.json({
      messages: data.messages || [],
      nextCursor: data.nextCursor ?? null,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: mailErrorStatus(error) },
    );
  }
}
