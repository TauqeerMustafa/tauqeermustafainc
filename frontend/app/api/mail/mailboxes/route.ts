import { NextResponse } from "next/server";
import { allowedMailboxes, mailErrorStatus, resolveMailUser } from "@/lib/mail-auth";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const user = await resolveMailUser(request);
    const url = new URL(request.url);
    const domain = url.searchParams.get("domain");
    const mailboxes = await allowedMailboxes(user, domain, request);
    return NextResponse.json({ mailboxes });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: mailErrorStatus(error) },
    );
  }
}
