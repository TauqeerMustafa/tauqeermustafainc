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
      (host.includes("tauqeermustafa.tech") || host.includes(".tech") || host === "tech"
        ? "tech"
        : host.includes("qorlune") || host.endsWith(".co.uk")
        ? "qorlune"
        : "com");

    function getMsgAddresses(msg: any): string[] {
      const addrs: string[] = [];
      const extract = (val: any) => {
        if (!val) return;
        if (typeof val === "string") {
          const m = val.match(/[^\s<>,;:]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+/g);
          if (m) addrs.push(...m.map((s) => s.replace(/^[<"']+|[>"']+$/g, "").toLowerCase()));
        } else if (Array.isArray(val)) {
          val.forEach(extract);
        } else if (typeof val === "object") {
          if (val.address) extract(val.address);
          if (val.email) extract(val.email);
          for (const k of Object.keys(val)) {
            if (typeof val[k] === "string" || typeof val[k] === "object") {
              extract(val[k]);
            }
          }
        }
      };
      extract(msg.from);
      extract(msg.to);
      extract(msg.cc);
      extract(msg.bcc);
      extract(msg.envelope);
      extract(msg.envelopeTo);
      extract(msg.envelope_to);
      extract(msg.envelopeFrom);
      extract(msg.envelope_from);
      extract(msg.recipient);
      extract(msg.deliveredTo);
      extract(msg.delivered_to);
      extract(msg.headers?.to);
      extract(msg.headers?.from);
      extract(msg.headers?.["delivered-to"]);
      extract(msg.headers?.["x-original-to"]);
      extract(msg.headers?.["envelope-to"]);
      if (typeof msg.raw === "string") {
        extract(msg.raw);
      }
      return addrs;
    }

    const filteredMessages = rawList.filter((msg: any) => {
      if (effectiveDomain === "all") return true;
      const addrs = getMsgAddresses(msg);
      if (addrs.length === 0) return true; // Keep system/bounce messages
      if (effectiveDomain === "tech") {
        return addrs.some(
          (a) =>
            a.endsWith(".tech") ||
            a.includes("tauqeermustafa.tech") ||
            a.includes("theqorlune.tech") ||
            a.includes("qorlune.tech"),
        );
      }
      if (effectiveDomain === "com") {
        const hasCom = addrs.some(
          (a) =>
            a.endsWith("@tauqeermustafa.com") ||
            a.endsWith("@tauqeerm.com") ||
            a.endsWith("@tm.com") ||
            a.includes("tauqeermustafa.com"),
        );
        if (hasCom) return true;
        const hasOtherTenant = addrs.some(
          (a) =>
            a.endsWith("@qorlune.co.uk") ||
            a.endsWith("@qorlune.com") ||
            a.endsWith("@tauqeermustafa.tech") ||
            a.endsWith(".tech"),
        );
        // Retain unrouted/catch-all messages so arbitrary or misspelled inboxes never get dropped
        return !hasOtherTenant;
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
