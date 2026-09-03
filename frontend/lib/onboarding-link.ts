/**
 * Turns a job application (a `contact_messages` row of kind `job`) into an
 * onboarding action: a link from Admin → Messages straight to a prefilled
 * create-user form in Admin → Users.
 *
 * The applicants are exactly the messages the careers form writes — name and a
 * personal email sit on the row — so hiring one should not mean retyping what
 * they already sent. The users page reads these params on mount and opens the
 * drawer with the welcome-credentials flow ready to go.
 */

import { appConfig } from "@/config/app";

export const ONBOARD_PARAM = "onboard";

/** Deep link to a prefilled create-user drawer for this applicant. */
export function onboardHref(name: string, personalEmail: string): string {
  const params = new URLSearchParams({ [ONBOARD_PARAM]: "1", name, email: personalEmail });
  return `/admin/users?${params.toString()}`;
}

/**
 * A suggested company mailbox address, `firstname@<company-host>` — only a
 * starting point the admin edits, since the account email is what open.email
 * provisions the mailbox at. Falls back to blank if the name yields nothing.
 */
export function suggestCompanyEmail(name: string): string {
  let host = "tauqeermustafa.tech";
  try {
    host = new URL(appConfig.siteUrl).host;
  } catch {
    // Keep the fallback host.
  }
  const first = name.trim().split(/\s+/)[0]?.toLowerCase().replace(/[^a-z0-9]/g, "") ?? "";
  return first ? `${first}@${host}` : "";
}

/**
 * `suggestCompanyEmail`, kept unique against addresses already in play —
 * `ali@host`, then `ali2@host`, `ali3@host`. Two hires who share a first name
 * are common enough that a silent collision (a 409 mid-run) is worse than a
 * numbered address the admin can see and edit before anything is created.
 * Returns "" when the name yields no usable local part.
 */
export function uniqueCompanyEmail(name: string, taken: Iterable<string>): string {
  const base = suggestCompanyEmail(name);
  if (!base) return "";

  const used = new Set(Array.from(taken, (value) => value.trim().toLowerCase()));
  if (!used.has(base.toLowerCase())) return base;

  const [local, host] = base.split("@");
  for (let suffix = 2; suffix < 100; suffix += 1) {
    const candidate = `${local}${suffix}@${host}`;
    if (!used.has(candidate.toLowerCase())) return candidate;
  }
  return "";
}

export interface OnboardPrefill {
  name: string;
  personalEmail: string;
}

/** Read onboarding params off a query string, or null if this is not one. */
export function readOnboardPrefill(search: string): OnboardPrefill | null {
  const params = new URLSearchParams(search);
  if (params.get(ONBOARD_PARAM) !== "1") return null;
  const name = params.get("name")?.trim() ?? "";
  const personalEmail = params.get("email")?.trim() ?? "";
  if (!name && !personalEmail) return null;
  return { name, personalEmail };
}
