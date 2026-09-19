/**
 * Server-only auth + per-mailbox authorization for the `/api/mail/*` BFF routes.
 *
 * Those routes talk to open.email with an org-wide server key, so `/mailboxes`
 * lists EVERY user's mailbox. Without scoping, any caller could read, send from,
 * or delete anyone's mail — so each route runs every request through here to:
 *   1. require a valid portal session (Bearer token, validated against /auth/me), and
 *   2. restrict non-admins to the single mailbox whose primaryAddress is their own
 *      account email. Admins keep full cross-mailbox access (the Webmail switcher).
 *
 * Never import this into a client component: it reads request headers and calls
 * the backend, and it pulls in the OPENEMAIL-keyed lib transitively.
 */
import { fetchOpenEmailMailboxes } from "@/lib/openemail";

export class MailAuthError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.name = "MailAuthError";
    this.status = status;
  }
}

export interface MailUser {
  email: string;
  role: string;
  isAdmin: boolean;
  openemailAddress?: string;
  openemailMailboxId?: string;
}

export interface Mailbox {
  id: string;
  primaryAddress: string;
}

/** Validate the caller's Bearer token against the backend and return who they are. */
export async function resolveMailUser(request: Request): Promise<MailUser> {
  let token = "";
  const match = /^Bearer\s+(.+)$/i.exec(request.headers.get("authorization") || "");
  if (match?.[1]) {
    token = match[1].trim();
  } else {
    try {
      const url = new URL(request.url);
      const queryToken = url.searchParams.get("token");
      if (queryToken) token = queryToken.trim();
    } catch {}

    if (!token) {
      const cookieHeader = request.headers.get("cookie") || "";
      const cookieMatch = /(?:^|;\s*)(?:token|auth_token|access_token)=([^;]+)/.exec(cookieHeader);
      if (cookieMatch?.[1]) {
        token = decodeURIComponent(cookieMatch[1].trim());
      }
    }
  }

  if (!token) throw new MailAuthError(401, "Sign in to access mail.");

  const apiBase = process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, "");
  if (!apiBase) throw new MailAuthError(500, "Auth backend is not configured.");

  let res: Response;
  try {
    res = await fetch(`${apiBase}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
  } catch {
    throw new MailAuthError(503, "Could not verify your session.");
  }
  if (!res.ok) throw new MailAuthError(401, "Your session has expired — sign in again.");

  const body = await res.json().catch(() => null);
  const data = body?.data ?? body ?? {};
  const email = String(data.email ?? "").toLowerCase().trim();
  const role = String(data.role ?? "");
  const openemailAddress =
    typeof data.openemailAddress === "string" ? data.openemailAddress.toLowerCase().trim() : undefined;
  const openemailMailboxId =
    typeof data.openemailMailboxId === "string" ? data.openemailMailboxId.trim() : undefined;

  if (!email) throw new MailAuthError(401, "Your session has expired — sign in again.");
  return { email, role, isAdmin: role === "admin", openemailAddress, openemailMailboxId };
}

/** Mailboxes this user may see: all valid ones for admins, own address/mailbox only otherwise. */
export async function allowedMailboxes(user: MailUser): Promise<Mailbox[]> {
  const data = await fetchOpenEmailMailboxes();
  const all: Mailbox[] = (data.mailboxes || [])
    .filter((m: { primaryAddress?: string }) => m.primaryAddress)
    .map((m: { id: string; primaryAddress: string }) => ({
      id: m.id,
      primaryAddress: m.primaryAddress,
    }));
  if (user.isAdmin) return all;
  return all.filter((m) => {
    const addr = m.primaryAddress.toLowerCase().trim();
    if (addr === user.email) return true;
    if (user.openemailAddress && addr === user.openemailAddress) return true;
    if (user.openemailMailboxId && m.id === user.openemailMailboxId) return true;
    return false;
  });
}

/** Resolve + authorize one mailbox id, throwing 403 when it is out of the user's scope. */
export async function assertMailboxAccess(user: MailUser, mailboxId: string): Promise<Mailbox> {
  const mb = (await allowedMailboxes(user)).find((m) => m.id === mailboxId);
  if (!mb) throw new MailAuthError(403, "You do not have access to that mailbox.");
  return mb;
}

/** Map a thrown error to the HTTP status the route should return. */
export function mailErrorStatus(error: unknown): number {
  return error instanceof MailAuthError ? error.status : 500;
}
