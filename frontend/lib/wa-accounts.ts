/**
 * The Meta apps this deployment sends and receives through.
 *
 * WHY THIS EXISTS
 * ───────────────
 * `lib/wa-numbers` made the *numbers* plural, but every credential stayed
 * singular: one WHATSAPP_TOKEN, one WHATSAPP_APP_SECRET, one WABA id. That holds
 * only while every number lives on one Meta app. A number belonging to a SECOND
 * app cannot be served by the first app's credentials:
 *
 *   • its webhook deliveries are signed with the second app's secret, so the
 *     X-Hub-Signature-256 check rejects them with 401 and the message is lost;
 *   • a send from it carrying the first app's token earns "Object with ID '…'
 *     does not exist, cannot be loaded due to missing permissions";
 *   • its templates live on the second app's WABA, so the template list read
 *     against the first WABA simply does not contain them.
 *
 * Credentials are therefore grouped into numbered slots. Slot 1 is the original
 * app and reads the UNSUFFIXED variables, so an existing deployment keeps
 * working with nothing added. Slot N reads the same names with `_N`:
 *
 *   WHATSAPP_TOKEN_2               – system user token from app 2's portfolio
 *   WHATSAPP_APP_SECRET_2          – app 2's secret, for signature verification
 *   WHATSAPP_BUSINESS_ACCOUNT_ID_2 – app 2's WABA id, for templates
 *   WEBHOOK_VERIFY_TOKEN_2         – optional; the handshake accepts any slot's
 *   WHATSAPP_APP_LABEL_2           – display label for the admin UI
 *
 * One webhook URL still serves every app: apps are told apart by which secret
 * verifies their signature, and replies are addressed by the number the message
 * arrived on. Which numbers belong to which slot is `lib/wa-numbers`' business.
 */

/** Slots scanned for credentials. Supports multi-region & multi-line expansion. */
export const MAX_ACCOUNTS = 8;

/** Vercel masks sensitive values in some contexts; the sentinel means "unset". */
const SENTINEL = "[SENSITIVE]";

/** Trim an env value, treating blank and Vercel's mask as absent. */
export function cleanEnv(raw?: string | null): string | null {
  const value = (raw ?? "").trim();
  if (!value || value === SENTINEL) return null;
  return value;
}

export type WAAccount = {
  /** 1-based. Slot 1 is the app that predates multi-app support. */
  slot: number;
  /** Label shown in the admin UI and in diagnostics. */
  label: string;
  /** Access token for sending as this app's numbers. */
  token: string | null;
  /** App secret, used to verify this app's webhook signatures. */
  appSecret: string | null;
  /** WhatsApp Business Account id — where this app's templates live. */
  wabaId: string | null;
  /** Verify token this app was registered with, if it has its own. */
  verifyToken: string | null;
};

/**
 * Read one slot. `process.env` is addressed with STATIC member expressions on
 * purpose: a computed key (`process.env["WHATSAPP_TOKEN_" + n]`) is not replaced
 * by the bundler, and the value can go missing depending on how the deployment
 * injects it. Verbose, but it cannot silently read undefined.
 */
function readSlot(slot: number): WAAccount {
  const primaryToken =
    process.env.WHATSAPP_TOKEN ||
    process.env.WHATSAPP_ACCESS_TOKEN ||
    process.env.META_ACCESS_TOKEN ||
    process.env.WHATSAPP_SYSTEM_USER_TOKEN;
  const primarySecret = process.env.WHATSAPP_APP_SECRET || process.env.META_APP_SECRET;

  const raw =
    slot === 1
      ? {
          token: primaryToken,
          appSecret: primarySecret,
          wabaId: process.env.WHATSAPP_BUSINESS_ACCOUNT_ID || "1363415125370805",
          verifyToken: process.env.WEBHOOK_VERIFY_TOKEN,
          label: process.env.WHATSAPP_APP_LABEL || "Line 1 (PK)",
        }
      : slot === 2
        ? {
            token: process.env.WHATSAPP_TOKEN_2 || primaryToken,
            appSecret: process.env.WHATSAPP_APP_SECRET_2 || primarySecret,
            wabaId:
              !process.env.WHATSAPP_BUSINESS_ACCOUNT_ID_2 ||
              process.env.WHATSAPP_BUSINESS_ACCOUNT_ID_2 === "1854430365722527"
                ? "1485319076722009"
                : process.env.WHATSAPP_BUSINESS_ACCOUNT_ID_2,
            verifyToken: process.env.WEBHOOK_VERIFY_TOKEN_2,
            label: process.env.WHATSAPP_APP_LABEL_2 || "Line 2 (SL)",
          }
      : slot === 3
        ? {
            token: process.env.WHATSAPP_TOKEN_3 || process.env.WHATSAPP_TOKEN_2 || primaryToken,
            appSecret: process.env.WHATSAPP_APP_SECRET_3 || process.env.WHATSAPP_APP_SECRET_2 || primarySecret,
            wabaId:
              !process.env.WHATSAPP_BUSINESS_ACCOUNT_ID_3 ||
              process.env.WHATSAPP_BUSINESS_ACCOUNT_ID_3 === "1083562997861778"
                ? "2663451950739498"
                : process.env.WHATSAPP_BUSINESS_ACCOUNT_ID_3,
            verifyToken: process.env.WEBHOOK_VERIFY_TOKEN_3,
            label: process.env.WHATSAPP_APP_LABEL_3 || "Line 3 (NL 1)",
          }
      : slot === 4
        ? {
            token: process.env.WHATSAPP_TOKEN_4 || primaryToken,
            appSecret: process.env.WHATSAPP_APP_SECRET_4 || primarySecret,
            wabaId: process.env.WHATSAPP_BUSINESS_ACCOUNT_ID_4 || "1739099617324219",
            verifyToken: process.env.WEBHOOK_VERIFY_TOKEN_4,
            label: process.env.WHATSAPP_APP_LABEL_4 || "Line 4 (NL 2)",
          }
      : slot === 5
        ? {
            token: process.env.WHATSAPP_TOKEN_5 || primaryToken,
            appSecret: process.env.WHATSAPP_APP_SECRET_5 || primarySecret,
            wabaId: process.env.WHATSAPP_BUSINESS_ACCOUNT_ID_5 || "1083562997861778",
            verifyToken: process.env.WEBHOOK_VERIFY_TOKEN_5,
            label: process.env.WHATSAPP_APP_LABEL_5 || "Line 5 (US 1)",
          }
      : slot === 6
        ? {
            token: process.env.WHATSAPP_TOKEN_6 || primaryToken,
            appSecret: process.env.WHATSAPP_APP_SECRET_6 || primarySecret,
            wabaId: process.env.WHATSAPP_BUSINESS_ACCOUNT_ID_6 || "1034864159583818",
            verifyToken: process.env.WEBHOOK_VERIFY_TOKEN_6,
            label: process.env.WHATSAPP_APP_LABEL_6 || "Line 6 (US 2)",
          }
      : slot === 7
        ? {
            token: process.env.WHATSAPP_TOKEN_7 || primaryToken,
            appSecret: process.env.WHATSAPP_APP_SECRET_7 || primarySecret,
            wabaId: process.env.WHATSAPP_BUSINESS_ACCOUNT_ID_7,
            verifyToken: process.env.WEBHOOK_VERIFY_TOKEN_7,
            label: process.env.WHATSAPP_APP_LABEL_7 || "Line 7",
          }
        : {
            token: process.env.WHATSAPP_TOKEN_8 || primaryToken,
            appSecret: process.env.WHATSAPP_APP_SECRET_8 || primarySecret,
            wabaId: process.env.WHATSAPP_BUSINESS_ACCOUNT_ID_8,
            verifyToken: process.env.WEBHOOK_VERIFY_TOKEN_8,
            label: process.env.WHATSAPP_APP_LABEL_8 || "Line 8",
          };

  return {
    slot,
    label: cleanEnv(raw.label) || (slot === 1 ? "App 1" : `App ${slot}`),
    token: cleanEnv(raw.token),
    appSecret: cleanEnv(raw.appSecret),
    wabaId: cleanEnv(raw.wabaId),
    verifyToken: cleanEnv(raw.verifyToken),
  };
}

let cached: WAAccount[] | null = null;

/**
 * Every credential slot, slot 1 first. Slot 1 is always present even when
 * empty — it is what error messages point at — and higher slots appear only
 * once something is set on them, so a single-app deployment reports one app.
 *
 * Resolved once per server instance, lazily, because these values arrive at
 * request time rather than at module init on Vercel.
 */
export function waAccounts(): WAAccount[] {
  if (cached) return cached;
  const out = [readSlot(1)];
  for (let slot = 2; slot <= MAX_ACCOUNTS; slot++) {
    const account = readSlot(slot);
    if (account.token || account.appSecret || account.wabaId || account.verifyToken) {
      out.push(account);
    }
  }
  cached = out;
  return out;
}

/** One slot by number. Higher slots fall back to slot 1 credentials if unset. */
export function accountAt(slot: number): WAAccount {
  const primary = waAccounts()[0];
  const acc = waAccounts().find((a) => a.slot === slot);
  if (!acc) return primary;
  return {
    ...acc,
    token: acc.token || primary?.token || null,
    appSecret: acc.appSecret || primary?.appSecret || null,
    wabaId: acc.wabaId || primary?.wabaId || null,
  };
}

/** Slots that can actually reach Meta. */
export function usableAccounts(): WAAccount[] {
  return waAccounts().filter((a) => !!a.token);
}

/** Every app secret configured, for verifying a webhook from any of the apps. */
export function appSecrets(): string[] {
  return waAccounts()
    .map((a) => a.appSecret)
    .filter((s): s is string => !!s);
}

/** Every verify token configured, for the subscribe handshake of any app. */
export function verifyTokens(): string[] {
  return waAccounts()
    .map((a) => a.verifyToken)
    .filter((t): t is string => !!t);
}
