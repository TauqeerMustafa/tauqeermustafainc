import { NextResponse } from "next/server";
import { deleteOpenEmailMessage } from "@/lib/openemail";
import { assertMailboxAccess, mailErrorStatus, resolveMailUser } from "@/lib/mail-auth";

export const dynamic = "force-dynamic";

async function handleDelete(request: Request) {
  try {
    let body: Record<string, any> = {};
    const { searchParams } = new URL(request.url);

    try {
      body = await request.json();
    } catch {}

    const mailbox = body.mailbox || searchParams.get("mailbox");
    const id = body.id || searchParams.get("id");
    const ids: string[] = Array.isArray(body.ids)
      ? body.ids.map(String)
      : searchParams.get("ids")
      ? searchParams.get("ids")!.split(",").map((s) => s.trim()).filter(Boolean)
      : id
      ? [id]
      : [];

    if (!mailbox || ids.length === 0) {
      return NextResponse.json(
        { error: "Missing required 'mailbox' and at least one message 'id' or 'ids' array" },
        { status: 400 }
      );
    }

    const user = await resolveMailUser(request);
    await assertMailboxAccess(user, mailbox);

    // Delete single or bulk messages
    const results = await Promise.allSettled(
      ids.map((msgId) => deleteOpenEmailMessage(mailbox, msgId))
    );

    const successful = results.filter((r) => r.status === "fulfilled").length;
    const failed = results.filter((r) => r.status === "rejected").length;

    return NextResponse.json({
      success: true,
      mode: ids.length > 1 ? "bulk" : "single",
      totalRequested: ids.length,
      successful,
      failed,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: mailErrorStatus(error) }
    );
  }
}

export async function POST(request: Request) {
  return handleDelete(request);
}

export async function DELETE(request: Request) {
  return handleDelete(request);
}
