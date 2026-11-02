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

    const rawList: any[] = Array.isArray(data)
      ? data
      : Array.isArray(data?.messages)
      ? data.messages
      : Array.isArray(data?.data)
      ? data.data
      : Array.isArray(data?.items)
      ? data.items
      : [];
    const nextCursor = data?.nextCursor ?? data?.cursor ?? data?.next_cursor ?? null;

    const host = (
      request.headers.get("x-portal-domain") ||
      request.headers.get("x-forwarded-host") ||
      request.headers.get("host") ||
      ""
    ).toLowerCase();
    const domainParam = searchParams.get("domain")?.toLowerCase().trim();
    const effectiveDomain =
      domainParam ||
      (host.includes("tauqeermustafa.tech") || host === "tech"
        ? "tech"
        : host.includes("qorlune") || host.endsWith(".co.uk")
        ? "qorlune"
        : "com");

    function getMsgAddresses(msg: any): string[] {
      const addrs: string[] = [];
      const extract = (val: any) => {
        if (!val) return;
        if (typeof val === "string") {
          const m = val.match(/[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+/g);
          if (m) addrs.push(...m.map((s) => s.toLowerCase()));
        } else if (Array.isArray(val)) {
          val.forEach(extract);
        } else if (typeof val === "object") {
          if (val.address) extract(val.address);
          if (val.email) extract(val.email);
        }
      };
      extract(msg.from);
      extract(msg.to);
      extract(msg.cc);
      extract(msg.bcc);
      extract(msg.envelope);
      extract(msg.headers?.to);
      extract(msg.headers?.from);
      return addrs;
    }

    const filteredMessages = rawList.filter((msg: any) => {
      const addrs = getMsgAddresses(msg);
      if (addrs.length === 0) return true; // Keep system/bounce messages
      if (effectiveDomain === "tech") {
        return addrs.some((a) => a.endsWith("@tauqeermustafa.tech"));
      }
      if (effectiveDomain === "com") {
        return addrs.some(
          (a) =>
            a.endsWith("@tauqeermustafa.com") ||
            a.endsWith("@tauqeerm.com") ||
            a.endsWith("@tm.com")
        );
      }
      if (effectiveDomain === "qorlune") {
        return addrs.some((a) => a.endsWith("@qorlune.co.uk") || a.endsWith("@qorlune.com"));
      }
      return true;
    });

    return NextResponse.json({
      messages: filteredMessages,
      nextCursor,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: mailErrorStatus(error) },
    );
  }
}
