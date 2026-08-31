import { NextResponse } from "next/server";
import { fetchOpenEmailMessageContent } from "@/lib/openemail";
import { assertMailboxAccess, mailErrorStatus, resolveMailUser } from "@/lib/mail-auth";

export const dynamic = "force-dynamic";

/** Keys that hold metadata, never the body — skipped by the deep-scan fallback. */
const META_KEYS = new Set([
  "id", "messageid", "threadid", "mailboxid", "inboxid", "subject", "from", "to",
  "cc", "bcc", "fromaddr", "toaddr", "date", "createdat", "receivedat", "sentat",
  "direction", "state", "labels", "label", "snippet", "preview", "filename", "url",
  "contenttype", "mimetype", "address", "email", "name", "cursor", "nextcursor",
]);

function firstString(...vals: unknown[]): string | null {
  for (const v of vals) if (typeof v === "string" && v.trim()) return v;
  return null;
}

function looksHtml(s: string): boolean {
  return /<[a-z!][\s\S]*>/i.test(s);
}

/** Collect every non-metadata string value in the payload (bounded depth). */
function collectStrings(node: unknown, out: string[], depth = 0): void {
  if (node == null || depth > 4) return;
  if (Array.isArray(node)) {
    for (const v of node) collectStrings(v, out, depth + 1);
    return;
  }
  if (typeof node === "object") {
    for (const [k, v] of Object.entries(node as Record<string, unknown>)) {
      if (typeof v === "string") {
        if (!META_KEYS.has(k.toLowerCase()) && v.trim()) out.push(v);
      } else {
        collectStrings(v, out, depth + 1);
      }
    }
  }
}

/**
 * open.email's /content response shape isn't guaranteed: the body may sit at the
 * top level, nested under content/body/message/data, or inside an html/text
 * object. Always return a *string* body — returning the object here is what
 * rendered the infamous "[object Object]" in the reader. HTML wins over text.
 */
function extractBody(data: any): { content: string; isHtml: boolean } {
  if (data == null) return { content: "", isHtml: false };
  if (typeof data === "string") return { content: data, isHtml: looksHtml(data) };

  const nested = [data.content, data.body, data.message, data.data].find(
    (v) => v && typeof v === "object",
  );
  const c = (nested ?? {}) as Record<string, any>;

  const html = firstString(
    data.html, data.htmlBody, data.bodyHtml, data.contentHtml,
    c.html, c.htmlBody, c.bodyHtml, c.contentHtml,
    data.html?.value, c.html?.value,
  );
  if (html) return { content: html, isHtml: true };

  const text = firstString(
    data.text, data.textBody, data.bodyText, data.contentText, data.plain, data.plainText,
    c.text, c.textBody, c.bodyText, c.contentText, c.plain, c.plainText,
    data.text?.value, c.text?.value,
  );
  if (text) return { content: text, isHtml: false };

  const body = firstString(data.body, c.body);
  if (body) return { content: body, isHtml: looksHtml(body) };

  // Last resort: surface the real body even if the field name is unexpected.
  const found: string[] = [];
  collectStrings(data, found);
  const htmlish = found.find(looksHtml);
  if (htmlish) return { content: htmlish, isHtml: true };
  if (found.length) {
    const longest = found.reduce((a, b) => (b.length > a.length ? b : a));
    return { content: longest, isHtml: false };
  }
  return { content: "", isHtml: false };
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    // Accept both the new `mailbox`/`id` params and the legacy accountId/messageId.
    const mailbox = searchParams.get("mailbox") || searchParams.get("accountId");
    const messageId = searchParams.get("id") || searchParams.get("messageId");

    if (!mailbox || !messageId) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 });
    }

    const user = await resolveMailUser(request);
    await assertMailboxAccess(user, mailbox);

    const data = await fetchOpenEmailMessageContent(mailbox, messageId);
    const { content, isHtml } = extractBody(data);
    const attachments = data?.attachments || data?.content?.attachments || [];

    return NextResponse.json({
      content: content || "No content available.",
      isHtml,
      attachments,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: mailErrorStatus(error) },
    );
  }
}
