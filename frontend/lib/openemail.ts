/**
 * Server-only open.email REST client. Holds OPENEMAIL_API_KEY — never import
 * into a client component; go through the /api/mail/* routes instead.
 *
 * Supports Dual Domain Routing:
 * 1. OPENEMAIL_TECH_API_KEY: Handles all employee mailboxes on tauqeermustafa.tech
 * 2. OPENEMAIL_COM_API_KEY: Dedicated scoped key for executive tauqeermustafa.com
 *
 * Endpoints (verified against open.email docs):
 *   GET  /mailboxes
 *   GET  /mailboxes/{id}/messages?limit=&state=&order=&cursor=
 *   GET  /mailboxes/{id}/messages/{messageId}/content
 *   POST /mailboxes/{id}/send?save=true
 * Trash is the message list with state=expunged. Folders are modelled as
 * labels (open.email is label-based, like Gmail).
 */
export const OPENEMAIL_API_URL = "https://api.open.email/api/v1";

// .tech accounts (All 84 employees)
export const OPENEMAIL_TECH_API_KEY =
  process.env.OPENEMAIL_TECH_API_KEY ||
  process.env.OPENEMAIL_API_KEY ||
  "oek_vLhzeeO6fO_owBMaIIkLLzFPAWezb9I-f5H7isSGYug";

// .com accounts (ceo@ and notifications@ on tauqeermustafa.com)
export const OPENEMAIL_COM_API_KEY =
  process.env.OPENEMAIL_COM_API_KEY ||
  "oek_MB82hkIw8oJa0h-MG0mODJ1i5vHmInjB0Y3JWtH3NVo";

function authHeaders(json = false, customToken?: string): HeadersInit {
  const token = customToken || OPENEMAIL_TECH_API_KEY;
  if (!token) throw new Error("OPENEMAIL_API_KEY is missing");
  const headers: Record<string, string> = { Authorization: `Bearer ${token}` };
  if (json) headers["Content-Type"] = "application/json";
  return headers;
}

async function oeFetch(path: string, init?: RequestInit, customToken?: string) {
  const res = await fetch(`${OPENEMAIL_API_URL}${path}`, {
    ...init,
    headers: { ...authHeaders(init?.method === "POST", customToken), ...(init?.headers ?? {}) },
    cache: "no-store",
  });
  if (!res.ok) {
    let detail = res.statusText;
    try {
      const body = await res.json();
      detail = body?.error || body?.message || detail;
      if (body?.error === "mailbox_limit_reached" || detail === "mailbox_limit_reached") {
        detail = `open.email organization mailbox limit reached (max: ${body?.maxMailboxes ?? 3}).`;
      }
    } catch {
      /* non-JSON error body */
    }
    throw new Error(`open.email ${res.status}: ${detail}`);
  }
  // DELETE and some actions return an empty body.
  const text = await res.text();
  return text ? JSON.parse(text) : {};
}

export async function fetchOpenEmailMailboxes() {
  const extractList = (data: any) =>
    Array.isArray(data)
      ? data
      : Array.isArray(data?.identities)
      ? data.identities
      : Array.isArray(data?.mailboxes)
      ? data.mailboxes
      : Array.isArray(data?.data)
      ? data.data
      : [];

  const [techRes, comRes] = await Promise.allSettled([
    oeFetch(`/identities`, undefined, OPENEMAIL_TECH_API_KEY),
    oeFetch(`/identities`, undefined, OPENEMAIL_COM_API_KEY),
  ]);

  const techList = techRes.status === "fulfilled" ? extractList(techRes.value) : [];
  const comList = comRes.status === "fulfilled" ? extractList(comRes.value) : [];

  const seen = new Set();
  const merged: any[] = [];
  for (const m of [...comList, ...techList]) {
    const key = m.id || m.primaryAddress;
    if (key && !seen.has(key)) {
      seen.add(key);
      merged.push(m);
    }
  }

  return { mailboxes: merged };
}

export interface MessageListOptions {
  limit?: number;
  state?: "active" | "expunged";
  order?: string;
  cursor?: string;
}

export async function fetchOpenEmailMessages(mailboxId: string, opts: MessageListOptions = {}) {
  const params = new URLSearchParams();
  params.set("limit", String(opts.limit ?? 100));
  if (opts.state) params.set("state", opts.state);
  if (opts.order) params.set("order", opts.order);
  if (opts.cursor) params.set("cursor", opts.cursor);

  const path = `/mailboxes/${mailboxId}/messages?${params.toString()}`;
  try {
    return await oeFetch(path, undefined, OPENEMAIL_COM_API_KEY);
  } catch {
    return await oeFetch(path, undefined, OPENEMAIL_TECH_API_KEY);
  }
}

export async function fetchOpenEmailMessageContent(mailboxId: string, messageId: string) {
  const path = `/mailboxes/${mailboxId}/messages/${messageId}/content`;
  try {
    return await oeFetch(path, undefined, OPENEMAIL_COM_API_KEY);
  } catch {
    return await oeFetch(path, undefined, OPENEMAIL_TECH_API_KEY);
  }
}

export interface OpenEmailAttachment {
  filename: string;
  content: string; // base64
  contentType?: string;
}

export interface SendMessageInput {
  from: string;
  fromName?: string;
  to: string[];
  cc?: string[];
  bcc?: string[];
  subject: string;
  text?: string;
  html?: string;
  attachments?: OpenEmailAttachment[];
  save?: boolean;
}

export async function sendOpenEmailMessage(mailboxId: string, input: SendMessageInput) {
  const isCom = input.from?.toLowerCase().endsWith(".com");
  const token = isCom ? OPENEMAIL_COM_API_KEY : OPENEMAIL_TECH_API_KEY;

  const save = input.save === false ? "" : "?save=true";
  const path = `/mailboxes/${mailboxId}/send${save}`;

  const asEmails = (list?: string[]) => (list ?? []).filter(Boolean).map((email) => ({ email }));
  const base: Record<string, unknown> = {
    from: { email: input.from, ...(input.fromName ? { name: input.fromName } : {}) },
    subject: input.subject,
  };
  if (input.text) base.text = input.text;
  if (input.html) base.html = input.html;
  if (input.attachments && input.attachments.length > 0) {
    base.attachments = input.attachments.map((att) => ({
      filename: att.filename,
      content: att.content,
      ...(att.contentType ? { contentType: att.contentType } : {}),
    }));
  }

  const to = asEmails(input.to);
  const cc = asEmails(input.cc);
  const bcc = asEmails(input.bcc);

  try {
    return await oeFetch(
      path,
      {
        method: "POST",
        body: JSON.stringify({
          ...base,
          to,
          ...(cc.length ? { cc } : {}),
          ...(bcc.length ? { bcc } : {}),
        }),
      },
      token,
    );
  } catch (err) {
    const hasExtra = cc.length || bcc.length;
    const message = err instanceof Error ? err.message : "";
    if (!hasExtra || !/\b400\b|validation|\bcc\b|\bbcc\b/i.test(message)) throw err;

    const result = await oeFetch(
      path,
      {
        method: "POST",
        body: JSON.stringify({ ...base, to: [...to, ...cc] }),
      },
      token,
    );
    if (bcc.length) {
      await oeFetch(
        path,
        { method: "POST", body: JSON.stringify({ ...base, to: bcc }) },
        token,
      );
    }
    return result;
  }
}

/**
 * Best-effort delete. open.email's docs group "trash" under the Messages API
 * but do not publish the exact path, so this uses the conventional REST route;
 * failures surface to the caller rather than being silently swallowed.
 */
export async function deleteOpenEmailMessage(mailboxId: string, messageId: string) {
  const path = `/mailboxes/${mailboxId}/messages/${messageId}`;
  try {
    return await oeFetch(path, { method: "DELETE" }, OPENEMAIL_COM_API_KEY);
  } catch {
    return await oeFetch(path, { method: "DELETE" }, OPENEMAIL_TECH_API_KEY);
  }
}

export async function fetchOpenEmailAttachmentPart(
  mailboxId: string,
  messageId: string,
  section: string,
) {
  const path = `/mailboxes/${mailboxId}/messages/${messageId}/parts/${section}`;
  let token = OPENEMAIL_COM_API_KEY;
  let res = await fetch(`${OPENEMAIL_API_URL}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  if (!res.ok) {
    token = OPENEMAIL_TECH_API_KEY;
    res = await fetch(`${OPENEMAIL_API_URL}${path}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
  }

  if (!res.ok) {
    let detail = res.statusText;
    try {
      const body = await res.json();
      detail = body?.error || body?.message || detail;
    } catch {}
    throw new Error(`open.email ${res.status}: ${detail}`);
  }

  const contentType = res.headers.get("content-type") || "application/octet-stream";
  const disposition = res.headers.get("content-disposition") || "";
  let filename = "";
  const match = disposition.match(/filename="?([^"]+)"?/i);
  if (match) filename = match[1];

  const arrayBuffer = await res.arrayBuffer();
  return {
    buffer: Buffer.from(arrayBuffer),
    contentType,
    filename,
  };
}
