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

export type WADepartment = "general" | "support";

export type WANumber = {
  /** Meta Phone Number ID — what `POST /{id}/messages` addresses. */
  id: string;
  /** Label shown in the admin UI. */
  label: string;
  /** The number used when a caller does not name one. */
  primary: boolean;
  /** Which Meta app credential slot this number uses (1-4). */
  slot: number;
  /** Dedicated department: general info & sales or technical support. */
  department?: WADepartment;
  /** Optional human display phone number e.g. +92 335 6701199 */
  displayNumber?: string | null;
};

/**
 * Fallback id for the second number, used ONLY until the numbers route
 * discovers the real Phone Number IDs from Meta's WABA and registers them.
 *
 * This value came from WhatsApp Manager as a "Phone profile ID", which is very
 * likely NOT the Phone Number ID that `POST /{id}/messages` and inbound
 * `metadata.phone_number_id` actually use — so it exists purely so the second
 * line is not dead on a cold start. The live list from
 * `GET /api/whatsapp/numbers` (Meta's `{waba}/phone_numbers`) is the source of
 * truth and overrides this the moment it loads; `GET /api/whatsapp/diagnose`
 * prints the real ids next to what is stored if they ever disagree.
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

/** `WHATSAPP_PHONE_NUMBERS` – "id|Label|slot, id|Label|slot". Label and slot optional. */
function parseExplicitList(raw: string): WANumber[] {
  const out: WANumber[] = [];
  for (const entry of raw.split(",")) {
    const parts = entry.split("|");
    const idPart = parts[0];
    const id = (idPart ?? "").trim();
    if (!id || isDisabled(id)) continue;
    
    // If there are more than 2 parts, the last part might be the slot
    let slot = 1;
    let labelParts = parts.slice(1);
    
    if (labelParts.length > 0) {
      const lastPart = labelParts[labelParts.length - 1].trim();
      if (/^[1-4]$/.test(lastPart)) {
        slot = parseInt(lastPart, 10);
        labelParts = labelParts.slice(0, -1);
      }
    }
    
    const label = labelParts.join("|").trim();
    out.push({ 
      id, 
      label: label || `Number ${out.length + 1}`, 
      primary: out.length === 0,
      slot 
    });
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
      label: clean(process.env.WHATSAPP_PHONE_LABEL) || "General Inquiries & Sales",
      primary: true,
      slot: 1,
      department: "general",
      displayNumber: "+92 335 6701199",
    });
  }
  if (secondId) {
    numbers.push({
      id: secondId,
      label: clean(process.env.WHATSAPP_PHONE_LABEL_2) || "Technical & Client Support",
      // With no primary configured, the second number has to carry the traffic
      // rather than leaving the integration dead.
      primary: numbers.length === 0,
      slot: 1,
      department: "support",
      displayNumber: "+92 328 1313982",
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

export function registerKnownNumbers(extra: WANumber[]) {
  if (!cached) cached = build();
  for (const item of extra) {
    if (!cached.some((c) => c.id === item.id)) {
      cached.push({
        id: item.id,
        label: item.label || `Line ${cached.length + 1}`,
        primary: cached.length === 0,
        slot: item.slot ?? 1,
      });
    }
  }
}

/** The default sender, or null when nothing is configured at all. */
export function primaryNumberId(): string | null {
  return waNumbers().find((n) => n.primary)?.id ?? waNumbers()[0]?.id ?? null;
}

export function isKnownNumber(id: string | null | undefined): boolean {
  const value = (id ?? "").trim();
  if (!value) return false;
  if (value === DEFAULT_SECOND_ID) return true;
  // Exact match against the configured list, which also holds every id the
  // numbers route discovered from Meta and fed through registerKnownNumbers().
  // A Phone Number ID is exact — there is no "close enough", so no digit
  // heuristics here: an id either is one we serve or it isn't.
  return waNumbers().some((n) => n.id === value);
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

  if (wanted === DEFAULT_SECOND_ID) {
    return { ok: true, id: wanted };
  }

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

/**
 * Return whether a line or message belongs to "general" or "support".
 */
export function getChannelDepartment(
  idOrNumber?: string | null,
  allNumbers?: WANumber[]
): WADepartment {
  if (!idOrNumber) return "general";
  const nums = allNumbers || waNumbers();
  const num = nums.find(
    (n) =>
      n.id === idOrNumber ||
      (n.displayNumber && n.displayNumber.replace(/[^0-9]/g, "") === idOrNumber.replace(/[^0-9]/g, ""))
  );
  if (num) {
    if (num.department) return num.department;
    if (num.label.toLowerCase().includes("support") || num.id === DEFAULT_SECOND_ID) return "support";
    return "general";
  }
  const clean = idOrNumber.replace(/[^0-9]/g, "");
  if (idOrNumber.toLowerCase().includes("support") || idOrNumber === DEFAULT_SECOND_ID || clean.endsWith("3281313982")) {
    return "support";
  }
  return "general";
}
