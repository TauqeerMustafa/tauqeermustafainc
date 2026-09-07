/**
 * Server-only open.email REST client. Holds OPENEMAIL_API_KEY — never import
 * into a client component; go through the /api/mail/* routes instead.
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

function authHeaders(json = false): HeadersInit {
  const token = process.env.OPENEMAIL_API_KEY;
  if (!token) throw new Error("OPENEMAIL_API_KEY is missing");
  const headers: Record<string, string> = { Authorization: `Bearer ${token}` };
  if (json) headers["Content-Type"] = "application/json";
  return headers;
}

async function oeFetch(path: string, init?: RequestInit) {
  const res = await fetch(`${OPENEMAIL_API_URL}${path}`, {
    ...init,
    headers: { ...authHeaders(init?.method === "POST"), ...(init?.headers ?? {}) },
    cache: "no-store",
  });
  if (!res.ok) {
    let detail = res.statusText;
    try {
      const body = await res.json();
      detail = body?.error || body?.message || detail;
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
  const data = await oeFetch(`/identities`);
  return { mailboxes: data.identities || [] };
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
  return oeFetch(`/mailboxes/${mailboxId}/messages?${params.toString()}`);
}

export async function fetchOpenEmailMessageContent(mailboxId: string, messageId: string) {
  return oeFetch(`/mailboxes/${mailboxId}/messages/${messageId}/content`);
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
  save?: boolean;
}

export async function sendOpenEmailMessage(mailboxId: string, input: SendMessageInput) {
  // open.email validates addresses under `email` (NOT `address`) — sending
  // `address` returns `400 validation_failed` on body.from.email / body.to.0.email.
  // Body text goes in `text`/`html` (a `body` field is silently ignored).
  const save = input.save === false ? "" : "?save=true";
  const path = `/mailboxes/${mailboxId}/send${save}`;

  const asEmails = (list?: string[]) => (list ?? []).filter(Boolean).map((email) => ({ email }));
  const base: Record<string, unknown> = {
    from: { email: input.from, ...(input.fromName ? { name: input.fromName } : {}) },
    subject: input.subject,
  };
  if (input.text) base.text = input.text;
  if (input.html) base.html = input.html;

  const to = asEmails(input.to);
  const cc = asEmails(input.cc);
  const bcc = asEmails(input.bcc);

  try {
    return await oeFetch(path, {
      method: "POST",
      body: JSON.stringify({
        ...base,
        to,
        ...(cc.length ? { cc } : {}),
        ...(bcc.length ? { bcc } : {}),
      }),
    });
  } catch (err) {
    // Some accounts 400 on `cc`/`bcc` as unknown fields. Rather than lose the
    // message, retry: fold Cc into To (Cc isn't secret anyway) and deliver Bcc
    // as a separate blind send so those recipients stay hidden from the others.
    const hasExtra = cc.length || bcc.length;
    const message = err instanceof Error ? err.message : "";
    if (!hasExtra || !/\b400\b|validation|\bcc\b|\bbcc\b/i.test(message)) throw err;

    const result = await oeFetch(path, {
      method: "POST",
      body: JSON.stringify({ ...base, to: [...to, ...cc] }),
    });
    if (bcc.length) {
      await oeFetch(path, { method: "POST", body: JSON.stringify({ ...base, to: bcc }) });
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
  return oeFetch(`/mailboxes/${mailboxId}/messages/${messageId}`, { method: "DELETE" });
}
