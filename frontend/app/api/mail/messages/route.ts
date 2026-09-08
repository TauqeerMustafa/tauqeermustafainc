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
    const limitParam = searchParams.get("limit");
    const limit = limitParam ? Math.min(Math.max(parseInt(limitParam, 10) || 100, 1), 500) : 100;
    const order = searchParams.get("order") || undefined;

    if (!mailbox) {
      return NextResponse.json({ error: "Missing mailbox id" }, { status: 400 });
    }

    const user = await resolveMailUser(request);
    await assertMailboxAccess(user, mailbox);

    const data = await fetchOpenEmailMessages(mailbox, {
      state: state === "expunged" ? "expunged" : undefined,
      cursor,
      limit,
      order,
    });

    const rawList = Array.isArray(data)
      ? data
      : Array.isArray(data?.messages)
      ? data.messages
      : Array.isArray(data?.data)
      ? data.data
      : Array.isArray(data?.items)
      ? data.items
      : [];
    const nextCursor = data?.nextCursor ?? data?.cursor ?? data?.next_cursor ?? null;

    return NextResponse.json({
      messages: rawList,
      nextCursor,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: mailErrorStatus(error) },
    );
  }
}
