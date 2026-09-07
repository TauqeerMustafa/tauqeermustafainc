import { NextResponse } from "next/server";
import { deleteOpenEmailMessage } from "@/lib/openemail";
import { assertMailboxAccess, mailErrorStatus, resolveMailUser } from "@/lib/mail-auth";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const { mailbox, id } = await request.json();
    if (!mailbox || !id) {
      return NextResponse.json({ error: "Missing mailbox or message id" }, { status: 400 });
    }

    const user = await resolveMailUser(request);
    await assertMailboxAccess(user, mailbox);

    const data = await deleteOpenEmailMessage(mailbox, id);
    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: mailErrorStatus(error) },
    );
  }
}
