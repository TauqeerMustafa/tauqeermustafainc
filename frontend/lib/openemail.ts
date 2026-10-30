/**
 * Server-only open.email REST client. Holds OPENEMAIL_API_KEY — never import
 * into a client component; go through the /api/mail/* routes instead.
 *
 * Supports Dual Domain Routing:
 * 1. OPENEMAIL_TECH_API_KEY: Handles all employee mailboxes on qorlune.com
 * 2. OPENEMAIL_COM_API_KEY: Dedicated scoped key for executive qorlune.com
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

// Qorlune primary account (holds @qorlune.co.uk & @qorlune.com mailboxes)
export const OPENEMAIL_QORLUNE_API_KEY =
  process.env.OPENEMAIL_QORLUNE_API_KEY ||
  process.env.OPENEMAIL_TECH_API_KEY ||
  "oek_QvxyNrk1tAOyYzAlisEuyRa5mP3LRxSJmaZc_vaJ7es";

// Tauqeer Mustafa primary account (holds @tauqeermustafa.com & @tauqeermustafa.tech mailboxes)
export const OPENEMAIL_TAUQEER_API_KEY =
  process.env.OPENEMAIL_TAUQEER_API_KEY ||
  process.env.OPENEMAIL_COM_API_KEY ||
  "oek_vLhzeeO6fO_owBMaIIkLLzFPAWezb9I-f5H7isSGYug";

// Backwards compatibility aliases
export const OPENEMAIL_TECH_API_KEY = OPENEMAIL_QORLUNE_API_KEY;
export const OPENEMAIL_COM_API_KEY = OPENEMAIL_TAUQEER_API_KEY;

function authHeaders(json = false, customToken?: string): HeadersInit {
  const token = customToken || OPENEMAIL_TECH_API_KEY;
  if (!token) throw new Error("OPENEMAIL_API_KEY is missing");
  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36",
    Accept: "application/json",
  };
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

export async function fetchOpenEmailMailboxes(domain?: string) {
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

  const d = (domain || "").toLowerCase().trim();
  const isTech = d === "tech" || d.includes("tauqeermustafa.tech") || d.endsWith(".tech");
  const isQorlune = d === "qorlune" || d.includes("qorlune") || d.endsWith(".co.uk") || d === "co.uk" || d === "qor";
  const isCom = !isTech && !isQorlune;

  const promises: Promise<any>[] = [];
  if (isQorlune) {
    promises.push(
      oeFetch(`/identities`, undefined, OPENEMAIL_QORLUNE_API_KEY),
      oeFetch(`/routes?limit=100`, undefined, OPENEMAIL_QORLUNE_API_KEY),
    );
  } else {
    // Both .tech and .com live on OPENEMAIL_TAUQEER_API_KEY
    promises.push(
      oeFetch(`/identities`, undefined, OPENEMAIL_TAUQEER_API_KEY),
      oeFetch(`/routes?limit=100`, undefined, OPENEMAIL_TAUQEER_API_KEY),
    );
  }

  const results = await Promise.allSettled(promises);
  const allIdentities: any[] = [];
  const allRoutes: any[] = [];

  for (const res of results) {
    if (res.status === "fulfilled" && res.value) {
      if (Array.isArray(res.value?.routes)) {
        allRoutes.push(...res.value.routes);
      } else {
        allIdentities.push(...extractList(res.value));
      }
    }
  }

  const seen = new Set<string>();
  const merged: any[] = [];

  // 1. Process routes
  for (const r of allRoutes) {
    const addr = String(r.address || "").toLowerCase().trim();
    if (!addr || addr.startsWith("*")) continue; // NEVER show wildcard catch-all in compose dropdown

    if (isTech) {
      if (!addr.endsWith("@tauqeermustafa.tech")) continue;
    } else if (isCom) {
      if (
        !addr.endsWith("@tauqeermustafa.com") &&
        !addr.endsWith("@tauqeerm.com") &&
        !addr.endsWith("@tm.com")
      ) continue;
    } else if (isQorlune) {
      if (!addr.endsWith("@qorlune.co.uk") && !addr.endsWith("@qorlune.com")) continue;
    }

    if (!seen.has(addr)) {
      seen.add(addr);
      merged.push({
        id: r.mailboxId || "01M17137MJNRTDR5N92QCAND0P",
        primaryAddress: addr,
      });
    }
  }

  // 2. Process identities
  for (const i of allIdentities) {
    const addr = String(i.primaryAddress || i.email || "").toLowerCase().trim();
    if (!addr || addr.startsWith("*")) continue;

    if (isTech) {
      if (!addr.endsWith("@tauqeermustafa.tech")) continue;
    } else if (isCom) {
      if (
        !addr.endsWith("@tauqeermustafa.com") &&
        !addr.endsWith("@tauqeerm.com") &&
        !addr.endsWith("@tm.com")
      ) continue;
    } else if (isQorlune) {
      if (!addr.endsWith("@qorlune.co.uk") && !addr.endsWith("@qorlune.com")) continue;
    }

    if (!seen.has(addr)) {
      seen.add(addr);
      merged.push({
        id: i.id || "01M17137MJNRTDR5N92QCAND0P",
        primaryAddress: addr,
      });
    }
  }

  // Priority sorting per portal
  merged.sort((a, b) => {
    const aP = a.primaryAddress.toLowerCase();
    const bP = b.primaryAddress.toLowerCase();
    if (isTech) {
      if (aP.startsWith("info@")) return -1;
      if (bP.startsWith("info@")) return 1;
      if (aP.startsWith("admin@")) return -1;
      if (bP.startsWith("admin@")) return 1;
    } else if (isCom) {
      if (aP.startsWith("admin@")) return -1;
      if (bP.startsWith("admin@")) return 1;
      if (aP.startsWith("contact@")) return -1;
      if (bP.startsWith("contact@")) return 1;
      if (aP.startsWith("sales@")) return -1;
      if (bP.startsWith("sales@")) return 1;
    } else {
      if (aP.startsWith("sales@")) return -1;
      if (bP.startsWith("sales@")) return 1;
      if (aP.startsWith("support@")) return -1;
      if (bP.startsWith("support@")) return 1;
      if (aP.startsWith("admin@")) return -1;
      if (bP.startsWith("admin@")) return 1;
    }
    return aP.localeCompare(bP);
  });

  return { mailboxes: merged };
}

export interface MessageListOptions {
  limit?: number;
  state?: "active" | "live" | "expunged";
  order?: string;
  cursor?: string;
}

export async function fetchOpenEmailMessages(mailboxId: string, opts: MessageListOptions = {}) {
  const params = new URLSearchParams();
  params.set("limit", String(opts.limit ?? 100));
  if (opts.state) { const normState = opts.state === "active" ? "live" : opts.state; params.set("state", normState); }
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
  const fromAddr = (input.from || "").toLowerCase().trim();
  const isComOrTech = fromAddr.endsWith(".com") || fromAddr.endsWith(".tech");
  const token = isComOrTech ? OPENEMAIL_COM_API_KEY : OPENEMAIL_TECH_API_KEY;

  const save = input.save === false ? "" : "?save=true";
  const path = `/mailboxes/${mailboxId}/send${save}`;

  const asEmails = (list?: string[]) => (list ?? []).filter(Boolean).map((email) => ({ email }));
  const base: Record<string, unknown> = {
    from: { email: input.from, ...(input.fromName ? { name: input.fromName } : {}) },
    subject: input.subject,
  };
  if (input.text) base.text = input.text;
  if (input.html) {
    base.html = input.html;
    if (!input.text) {
      base.text = input.html.replace(/<[^>]*>?/gm, "").trim();
    }
  } else if (input.text) {
    const escaped = input.text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\n/g, "<br/>");
    base.html = `<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 14px; line-height: 1.6; color: #111827;">${escaped}</div>`;
  }
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
