import { NextResponse } from "next/server";
import { fetchOpenEmailMailboxes } from "@/lib/openemail";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const data = await fetchOpenEmailMailboxes();
    const mailboxes = (data.mailboxes || [])
      .filter((m: any) => m.primaryAddress)
      .map((m: any) => ({ id: m.id, primaryAddress: m.primaryAddress }));
    return NextResponse.json({ mailboxes });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
