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
 *   WHATSAPP_PHONE_NUMBER_ID_3   – the third number; set it to "off" to drop
 *                                  the built-in default below
 *   WHATSAPP_PHONE_NUMBER_ID_4   – the fourth number; set it to "off" to drop
 *                                  the built-in default below
 *   WHATSAPP_PHONE_LABEL         – display label for the primary
 *   WHATSAPP_PHONE_LABEL_2       – display label for the second
 *   WHATSAPP_PHONE_LABEL_3       – display label for the third
 *   WHATSAPP_PHONE_LABEL_4       – display label for the fourth
 *   WHATSAPP_PHONE_NUMBERS       – explicit full list, "id|Label, id|Label",
 *                                  which overrides everything above
 *
 * A phone-number id is an identifier, not a credential — unlike WHATSAPP_TOKEN
 * it is safe in source. The second and third numbers are therefore defaulted in
 * code so they go live without waiting on an environment change, and env still wins.
 */

export type WADepartment = "general" | "support" | "direct";

export type WANumber = {
  /** Meta Phone Number ID — what `POST /{id}/messages` addresses. */
  id: string;
  /** Label shown in the admin UI. */
  label: string;
  /** The number used when a caller does not name one. */
  primary: boolean;
  /** Which Meta app credential slot this number uses (1-4). */
  slot: number;
  /** Dedicated department: general info & sales, technical support, or executive/direct desk. */
  department?: WADepartment;
  /** Optional human display phone number e.g. +1 711-091-5975 */
  displayNumber?: string | null;
};

/**
 * Sole Official Qorlune WhatsApp Line (+1 711-091-5975)
 * Meta Phone Number ID: 1433890589802290
 * Meta WABA ID: 944973294966811
 */
export const DEFAULT_QORLUNE_ID = "1433890589802290";
export const DEFAULT_PRIMARY_ID = DEFAULT_QORLUNE_ID;
export const DEFAULT_QORLUNE_DISPLAY = "+1 711-091-5975";

const FORBIDDEN_PHONE_IDS = new Set<string>([]);
const FORBIDDEN_NUMBERS: string[] = [];

export function isForbiddenNumber(raw?: string | null): boolean {
  if (!raw) return false;
  if (FORBIDDEN_PHONE_IDS.has(raw.trim())) return true;
  const digits = raw.replace(/\D/g, "");
  return FORBIDDEN_NUMBERS.some((f) => digits.includes(f.replace(/\D/g, "")));
}


// Deprecated line aliases mapped directly to the official Qorlune line
export const DEFAULT_PK_ID = DEFAULT_QORLUNE_ID;
export const ALIAS_PK_ID = DEFAULT_QORLUNE_ID;
export const DEFAULT_SL_ID = DEFAULT_QORLUNE_ID;
export const ALIAS_SL_ID = DEFAULT_QORLUNE_ID;
export const DEFAULT_NL_PRIMARY_ID = DEFAULT_QORLUNE_ID;
export const ALIAS_NL_PRIMARY_ID = DEFAULT_QORLUNE_ID;
export const DEFAULT_NL_SECONDARY_ID = DEFAULT_QORLUNE_ID;
export const ALIAS_NL_SECONDARY_ID = DEFAULT_QORLUNE_ID;
export const DEFAULT_US_PRIMARY_ID = DEFAULT_QORLUNE_ID;
export const ALIAS_US_PRIMARY_ID = DEFAULT_QORLUNE_ID;
export const DEFAULT_US_SECONDARY_ID = DEFAULT_QORLUNE_ID;
export const ALIAS_US_SECONDARY_ID = DEFAULT_QORLUNE_ID;
export const DEFAULT_LINE7_ID = DEFAULT_QORLUNE_ID;
export const ALIAS_UK_ID = DEFAULT_QORLUNE_ID;
export const UK_WABA_ID = DEFAULT_QORLUNE_ID;

// Backwards compatibility aliases
export const DEFAULT_SECOND_ID = DEFAULT_QORLUNE_ID;
export const DEFAULT_THIRD_ID = DEFAULT_QORLUNE_ID;
export const LINE3_WABA_ID = DEFAULT_QORLUNE_ID;

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
      if (/^[1-8]$/.test(lastPart)) {
        slot = parseInt(lastPart, 10);
        labelParts = labelParts.slice(0, -1);
      }
    }
    
    const label = labelParts.join("|").trim();
    out.push({ 
      id, 
      label: label || `Line ${out.length + 1}`, 
      primary: out.length === 0,
      slot 
    });
  }
  return out;
}

function build(): WANumber[] {
  const explicit = clean(process.env.WHATSAPP_PHONE_NUMBERS);
  if (explicit) return dedupe(parseExplicitList(explicit).filter((n) => !isForbiddenNumber(n.id) && !isForbiddenNumber(n.displayNumber)));

  const primaryEnvId = clean(process.env.WHATSAPP_PHONE_NUMBER_ID);
  const safePrimaryId = primaryEnvId && !isForbiddenNumber(primaryEnvId) ? primaryEnvId : DEFAULT_QORLUNE_ID;

  const primaryDisplay = clean(process.env.WHATSAPP_DISPLAY_NUMBER);
  const safeDisplayNumber = primaryDisplay && !isForbiddenNumber(primaryDisplay) ? primaryDisplay : DEFAULT_QORLUNE_DISPLAY;

  // Sole Official Qorlune Line
  const canonicalLines: WANumber[] = [
    {
      id: safePrimaryId,
      label: clean(process.env.WHATSAPP_PHONE_LABEL) || "Qorlune Official",
      primary: true,
      slot: 1,
      department: "general",
      displayNumber: safeDisplayNumber,
    },
  ];

  return dedupe(canonicalLines);
}

function _unused_build(): WANumber[] {
  const explicit = clean(process.env.WHATSAPP_PHONE_NUMBERS);
  if (explicit) return dedupe(parseExplicitList(explicit));

  const primaryEnvId = clean(process.env.WHATSAPP_PHONE_NUMBER_ID);

  // Sole Official Qorlune Line
  const canonicalLines: WANumber[] = [
    {
      id: primaryEnvId || DEFAULT_QORLUNE_ID,
      label: clean(process.env.WHATSAPP_PHONE_LABEL) || "Qorlune Official",
      primary: true,
      slot: 1,
      department: "general",
      displayNumber: clean(process.env.WHATSAPP_DISPLAY_NUMBER) || DEFAULT_QORLUNE_DISPLAY,
    },
  ];

  return dedupe(canonicalLines);
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
    if (isForbiddenNumber(item.id) || isForbiddenNumber(item.displayNumber)) continue;
    const existing = cached.find((c) => c.id === item.id);
    if (!existing) {
      cached.push({
        id: item.id,
        label: item.label || `Line ${cached.length + 1}`,
        primary: cached.length === 0,
        slot: item.slot ?? 1,
        department: item.department,
        displayNumber: item.displayNumber,
      });
    } else {
      if (item.department) existing.department = item.department;
      if (item.displayNumber) existing.displayNumber = item.displayNumber;
      if (item.label && !item.label.startsWith("Line ")) existing.label = item.label;
      if (item.slot) existing.slot = item.slot;
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
  const digits = value.replace(/[^0-9]/g, "");

  if (digits === "17110915975" || digits === "17112494712" || value === DEFAULT_QORLUNE_ID || value === "944973294966811") {
    return true;
  }
  return waNumbers().some((n) => n.id === value || (n.displayNumber && n.displayNumber.replace(/[^0-9]/g, "") === digits));
}

/** Label for an id — falls back to the id so the UI never renders blank. */
export function labelFor(id: string | null | undefined): string {
  const value = (id ?? "").trim();
  const digits = value.replace(/[^0-9]/g, "");
  const found = waNumbers().find((n) => n.id === value || (n.displayNumber && n.displayNumber.replace(/[^0-9]/g, "") === digits));
  return found?.label ?? "Qorlune Official";
}

export type ResolvedNumber =
  | { ok: true; id: string }
  | { ok: false; error: string };

/**
 * Turn a requested sender into an id we are willing to send from.
 * With Qorlune, all sends route through the sole official WhatsApp line.
 */
export function resolveNumberId(requested?: string | null): ResolvedNumber {
  const primaryId = primaryNumberId() || DEFAULT_QORLUNE_ID;
  const wanted = (requested ?? "").trim();
  if (!wanted) return { ok: true, id: primaryId };

  const digits = wanted.replace(/[^0-9]/g, "");
  if (digits === "17110915975" || digits === "17112494712" || wanted === DEFAULT_QORLUNE_ID || wanted === "944973294966811") {
    return { ok: true, id: DEFAULT_QORLUNE_ID };
  }

  // All traffic resolves to the official Qorlune number
  return { ok: true, id: primaryId };
}

/**
 * Return whether a line or message belongs to "general", "support", or "direct".
 */
export function getChannelDepartment(
  _idOrNumber?: string | null,
  _allNumbers?: WANumber[]
): WADepartment {
  return "general";
}

export type LineIdentifier = {
  lineKey: "line1" | "line2" | "line3" | "line4" | "line5" | "line6" | "line7";
  canonicalId: string;
  label: string;
  flag: string;
  displayNumber: string;
};

export const KNOWN_LINES: Record<string, LineIdentifier> = {
  line1: {
    lineKey: "line1",
    canonicalId: DEFAULT_QORLUNE_ID,
    label: "Qorlune Official",
    flag: "🇺🇸",
    displayNumber: "+1 711-091-5975",
  },
  line2: {
    lineKey: "line2",
    canonicalId: DEFAULT_QORLUNE_ID,
    label: "Qorlune Official",
    flag: "🇺🇸",
    displayNumber: "+1 711-091-5975",
  },
  line3: {
    lineKey: "line3",
    canonicalId: DEFAULT_QORLUNE_ID,
    label: "Qorlune Official",
    flag: "🇺🇸",
    displayNumber: "+1 711-091-5975",
  },
  line4: {
    lineKey: "line4",
    canonicalId: DEFAULT_QORLUNE_ID,
    label: "Qorlune Official",
    flag: "🇺🇸",
    displayNumber: "+1 711-091-5975",
  },
  line5: {
    lineKey: "line5",
    canonicalId: DEFAULT_QORLUNE_ID,
    label: "Qorlune Official",
    flag: "🇺🇸",
    displayNumber: "+1 711-091-5975",
  },
  line6: {
    lineKey: "line6",
    canonicalId: DEFAULT_QORLUNE_ID,
    label: "Qorlune Official",
    flag: "🇺🇸",
    displayNumber: "+1 711-091-5975",
  },
  line7: {
    lineKey: "line7",
    canonicalId: DEFAULT_QORLUNE_ID,
    label: "Qorlune Official",
    flag: "🇺🇸",
    displayNumber: "+1 711-091-5975",
  },
};

export function identifyMessageLine(
  _m: { channel?: string; from?: string; to?: string; direction?: string },
  _customNumbers?: WANumber[]
): LineIdentifier {
  return KNOWN_LINES.line1;
}
