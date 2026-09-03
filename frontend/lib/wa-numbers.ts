/**
 * Which WhatsApp numbers this deployment can send from.
 *
 * WHY THIS EXISTS
 * ───────────────
 * Every route used to read `WHATSAPP_PHONE_NUMBER_ID` directly, so the app could
 * only ever speak as one number. A second number on the same WhatsApp Business
 * Account was effectively dead: messages arriving on it were stored, but every
 * reply — including auto-replies — went back out from the FIRST number. The
 * customer saw an answer from a business they had never written to, and the
 * 24-hour service window opened on the number they DID write to went unused.
 *
 * This module is the one list of sending identities. Routes resolve an id
 * through `resolveNumberId()` rather than reading the environment themselves,
 * which also closes a smaller hole: a caller cannot push an arbitrary
 * phone-number id through our access token, because anything not on this list is
 * refused.
 *
 * CONFIGURING
 * ───────────
 *   WHATSAPP_PHONE_NUMBER_ID     – the primary number (unchanged)
 *   WHATSAPP_PHONE_NUMBER_ID_2   – the second number; set it to "off" to drop
 *                                  the built-in default below
 *   WHATSAPP_PHONE_LABEL         – display label for the primary
 *   WHATSAPP_PHONE_LABEL_2       – display label for the second
 *   WHATSAPP_PHONE_NUMBERS       – explicit full list, "id|Label, id|Label",
 *                                  which overrides everything above
 *
 * A phone-number id is an identifier, not a credential — unlike WHATSAPP_TOKEN
 * it is safe in source. The second number is therefore defaulted in code so it
 * goes live without waiting on an environment change, and env still wins.
 */

export type WANumber = {
  /** Meta Phone Number ID — what `POST /{id}/messages` addresses. */
  id: string;
  /** Label shown in the admin UI. */
  label: string;
  /** The number used when a caller does not name one. */
  primary: boolean;
};

/**
 * Second number on the account. Given as a "Phone profile ID" in WhatsApp
 * Manager; if Meta turns out to disagree that it can send,
 * `GET /api/whatsapp/diagnose` names the reason per number.
 */
const DEFAULT_SECOND_ID = "1318810581311680";

/** Vercel masks some values in previews; the sentinel means "not really set". */
const SENTINEL = "[SENSITIVE]";

function clean(raw?: string | null): string | null {
  const value = (raw ?? "").trim();
  if (!value || value === SENTINEL) return null;
  return value;
}

/** An id slot holding "off" / "none" / "-" means there is no such number. */
function isDisabled(value: string): boolean {
  return ["off", "none", "false", "-", "0"].includes(value.toLowerCase());
}

/** `WHATSAPP_PHONE_NUMBERS` — "id|Label, id|Label". Label optional. */
function parseExplicitList(raw: string): WANumber[] {
  const out: WANumber[] = [];
  for (const entry of raw.split(",")) {
    const [idPart, ...labelParts] = entry.split("|");
    const id = (idPart ?? "").trim();
    if (!id || isDisabled(id)) continue;
    const label = labelParts.join("|").trim();
    out.push({ id, label: label || `Number ${out.length + 1}`, primary: out.length === 0 });
  }
  return out;
}

function build(): WANumber[] {
  const explicit = clean(process.env.WHATSAPP_PHONE_NUMBERS);
  if (explicit) return dedupe(parseExplicitList(explicit));

  const primaryId = clean(process.env.WHATSAPP_PHONE_NUMBER_ID);
  const secondRaw = clean(process.env.WHATSAPP_PHONE_NUMBER_ID_2);
  const secondId = secondRaw ? (isDisabled(secondRaw) ? null : secondRaw) : DEFAULT_SECOND_ID;

  const numbers: WANumber[] = [];
  if (primaryId && !isDisabled(primaryId)) {
    numbers.push({
      id: primaryId,
      label: clean(process.env.WHATSAPP_PHONE_LABEL) || "Primary number",
      primary: true,
    });
  }
  if (secondId) {
    numbers.push({
      id: secondId,
      label: clean(process.env.WHATSAPP_PHONE_LABEL_2) || "Second number",
      // With no primary configured, the second number has to carry the traffic
      // rather than leaving the integration dead.
      primary: numbers.length === 0,
    });
  }
  return dedupe(numbers);
}

/** Same id twice (e.g. env duplicating the default) must not appear twice. */
function dedupe(numbers: WANumber[]): WANumber[] {
  const seen = new Set<string>();
  const out: WANumber[] = [];
  for (const n of numbers) {
    if (seen.has(n.id)) continue;
    seen.add(n.id);
    // First survivor is the primary, whatever the input claimed.
    out.push({ ...n, primary: out.length === 0 });
  }
  return out;
}

let cached: WANumber[] | null = null;

/**
 * Every number this deployment may send from, primary first. Resolved once per
 * server instance — the same lazy read `lib/kv.ts` uses, because on Vercel these
 * values are injected at request time rather than at module init.
 */
export function waNumbers(): WANumber[] {
  if (!cached) cached = build();
  return cached;
}

/** The default sender, or null when nothing is configured at all. */
export function primaryNumberId(): string | null {
  return waNumbers().find((n) => n.primary)?.id ?? waNumbers()[0]?.id ?? null;
}

export function isKnownNumber(id: string | null | undefined): boolean {
  const value = (id ?? "").trim();
  return !!value && waNumbers().some((n) => n.id === value);
}

/** Label for an id — falls back to the id so the UI never renders blank. */
export function labelFor(id: string | null | undefined): string {
  const value = (id ?? "").trim();
  return waNumbers().find((n) => n.id === value)?.label ?? value ?? "";
}

export type ResolvedNumber =
  | { ok: true; id: string }
  | { ok: false; error: string };

/**
 * Turn a requested sender into an id we are willing to send from.
 *
 * No request → the primary. A request naming a configured number → that number.
 * A request naming anything else → refused, so an admin token cannot be used to
 * send as a number this deployment was never given.
 */
export function resolveNumberId(requested?: string | null): ResolvedNumber {
  const numbers = waNumbers();
  if (numbers.length === 0) {
    return {
      ok: false,
      error:
        "No WhatsApp sender is configured. Set WHATSAPP_PHONE_NUMBER_ID (and WHATSAPP_PHONE_NUMBER_ID_2 for the second number).",
    };
  }

  const wanted = (requested ?? "").trim();
  if (!wanted) return { ok: true, id: primaryNumberId() as string };

  if (!isKnownNumber(wanted)) {
    return {
      ok: false,
      error: `Unknown sender number: ${wanted}. Configured numbers are ${numbers
        .map((n) => n.id)
        .join(", ")}.`,
    };
  }
  return { ok: true, id: wanted };
}
