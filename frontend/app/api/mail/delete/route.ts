import { NextResponse } from "next/server";
import { deleteOpenEmailMessage } from "@/lib/openemail";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const { mailbox, id } = await request.json();
    if (!mailbox || !id) {
      return NextResponse.json({ error: "Missing mailbox or message id" }, { status: 400 });
    }
    const data = await deleteOpenEmailMessage(mailbox, id);
    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
