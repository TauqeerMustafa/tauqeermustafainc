/**
 * "Send me back where I was" for the portal sign-in flow.
 *
 * The guards used to redirect an expired session to the bare login path, and the
 * login form always landed on the portal dashboard — so following a deep link
 * (a task, an applicant, a lead) and hitting an expired session lost the link.
 * The guard now records the path it turned away and the form honours it.
 *
 * Everything is validated against the portal's own namespace before it is used:
 * a `next` value is attacker-controllable (it rides in the URL), so an
 * unchecked one is an open redirect. Only same-origin absolute paths inside the
 * portal are accepted; anything else falls back to the dashboard.
 */

import { PORTAL_HOME_PATH, PORTAL_LOGIN_PATH, type PortalId } from "@/lib/rbac";

export const RETURN_TO_PARAM = "next";

/** `/admin/login` → `/admin`. The portal's URL namespace. */
function portalBase(portal: PortalId): string {
  return PORTAL_LOGIN_PATH[portal].replace(/\/login$/, "");
}

/**
 * True when `target` is a safe in-portal destination: a single-slash absolute
 * path inside this portal, and not the login page itself (which would loop).
 */
export function isSafeReturnTo(target: string, portal: PortalId): boolean {
  // Reject protocol-relative ("//evil.com"), scheme-carrying, and backslash
  // forms before any path comparison — browsers normalise "\\" to "/".
  if (!target.startsWith("/") || target.startsWith("//") || target.startsWith("/\\")) return false;
  if (target.includes("\\")) return false;

  const path = target.split(/[?#]/)[0];
  const base = portalBase(portal);
  if (path !== base && !path.startsWith(`${base}/`)) return false;
  return path !== PORTAL_LOGIN_PATH[portal];
}

/** The login URL to send someone to, remembering where they were headed. */
export function loginUrlWithReturnTo(portal: PortalId, target: string | null | undefined): string {
  const login = PORTAL_LOGIN_PATH[portal];
  if (!target || !isSafeReturnTo(target, portal)) return login;
  return `${login}?${RETURN_TO_PARAM}=${encodeURIComponent(target)}`;
}

/** Where a fresh sign-in should land: the remembered path, or the dashboard. */
export function returnToOrHome(search: string, portal: PortalId): string {
  const target = new URLSearchParams(search).get(RETURN_TO_PARAM);
  return target && isSafeReturnTo(target, portal) ? target : PORTAL_HOME_PATH[portal];
}

/** Current path + query, for the guard to hand to the login page. */
export function currentLocationPath(): string {
  if (typeof window === "undefined") return "";
  return `${window.location.pathname}${window.location.search}`;
}
