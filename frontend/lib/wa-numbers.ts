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
  /** Optional human display phone number e.g. +92 335 6701199 */
  displayNumber?: string | null;
};

/**
 * Line 1: Tauqeer Mustafa Inc | PK (+92 335 6701199)
 */
export const DEFAULT_PK_ID = "1239592269240963";
export const ALIAS_PK_ID = "1363415125370805";

/**
 * Line 2: Tauqeer Mustafa Inc | SL (+386 65 743 712 - Slovenia)
 */
export const DEFAULT_SL_ID = "1245811661959729";
export const ALIAS_SL_ID = "1485319076722009";

/**
 * Line 3: Tauqeer Mustafa Inc | NL (+31 97058026144 - Netherlands 1)
 */
export const DEFAULT_NL_PRIMARY_ID = "1401823986336958";
export const ALIAS_NL_PRIMARY_ID = "2663451950739498";

/**
 * Line 4: Tauqeer Mustafa Inc | NL (+31 97058026143 - Netherlands 2)
 */
export const DEFAULT_NL_SECONDARY_ID = "1339948289200329";
export const ALIAS_NL_SECONDARY_ID = "1739099617324219";

/**
 * Line 5: Tauqeer Mustafa Inc | US (+1 555-431-6671 - United States 1)
 */
export const DEFAULT_US_PRIMARY_ID = "1385974501255442";
export const ALIAS_US_PRIMARY_ID = "1083562997861778";

/**
 * Line 6: Tauqeer Mustafa Inc | US (+1 555-434-0459 - United States 2)
 */
export const DEFAULT_US_SECONDARY_ID = "1291624014041103";
export const ALIAS_US_SECONDARY_ID = "1034864159583818";

/**
 * Line 7: Tauqeer Mustafa Inc | UK (+44 7575 376078)
 */
export const DEFAULT_LINE7_ID = "1964540454233744";
export const ALIAS_UK_ID = "1318810581311680";
export const UK_WABA_ID = "1854430365722527";

// Backwards compatibility aliases
export const DEFAULT_PRIMARY_ID = DEFAULT_PK_ID;
export const DEFAULT_SECOND_ID = DEFAULT_SL_ID;
export const DEFAULT_THIRD_ID = DEFAULT_NL_PRIMARY_ID;
export const LINE3_WABA_ID = DEFAULT_US_PRIMARY_ID;

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
  if (explicit) return dedupe(parseExplicitList(explicit));

  const line1Id = clean(process.env.WHATSAPP_PHONE_NUMBER_ID) || DEFAULT_PK_ID;
  const line2Id = clean(process.env.WHATSAPP_PHONE_NUMBER_ID_2) || DEFAULT_SL_ID;
  const line3Id = clean(process.env.WHATSAPP_PHONE_NUMBER_ID_3) || DEFAULT_NL_PRIMARY_ID;
  const line4Id = clean(process.env.WHATSAPP_PHONE_NUMBER_ID_4) || DEFAULT_NL_SECONDARY_ID;
  const line5Id = clean(process.env.WHATSAPP_PHONE_NUMBER_ID_5) || DEFAULT_US_PRIMARY_ID;
  const line6Id = clean(process.env.WHATSAPP_PHONE_NUMBER_ID_6) || DEFAULT_US_SECONDARY_ID;
  const line7Id = clean(process.env.WHATSAPP_PHONE_NUMBER_ID_7) || DEFAULT_LINE7_ID;

  const numbers: WANumber[] = [
    {
      id: line1Id,
      label: clean(process.env.WHATSAPP_PHONE_LABEL) || "Line 1 (PK)",
      primary: true,
      slot: 1,
      department: "general",
      displayNumber: clean(process.env.WHATSAPP_DISPLAY_NUMBER) || "+92 335 6701199",
    },
    {
      id: line2Id,
      label: clean(process.env.WHATSAPP_PHONE_LABEL_2) || "Line 2 (SL)",
      primary: false,
      slot: 2,
      department: "general",
      displayNumber: clean(process.env.WHATSAPP_DISPLAY_NUMBER_2) || "+386 65 743 712",
    },
    {
      id: line3Id,
      label: clean(process.env.WHATSAPP_PHONE_LABEL_3) || "Line 3 (NL 1)",
      primary: false,
      slot: 3,
      department: "general",
      displayNumber: clean(process.env.WHATSAPP_DISPLAY_NUMBER_3) || "+31 97058026144",
    },
    {
      id: line4Id,
      label: clean(process.env.WHATSAPP_PHONE_LABEL_4) || "Line 4 (NL 2)",
      primary: false,
      slot: 4,
      department: "general",
      displayNumber: clean(process.env.WHATSAPP_DISPLAY_NUMBER_4) || "+31 97058026143",
    },
    {
      id: line5Id,
      label: clean(process.env.WHATSAPP_PHONE_LABEL_5) || "Line 5 (US 1)",
      primary: false,
      slot: 5,
      department: "general",
      displayNumber: clean(process.env.WHATSAPP_DISPLAY_NUMBER_5) || "+1 555-431-6671",
    },
    {
      id: line6Id,
      label: clean(process.env.WHATSAPP_PHONE_LABEL_6) || "Line 6 (US 2)",
      primary: false,
      slot: 6,
      department: "general",
      displayNumber: clean(process.env.WHATSAPP_DISPLAY_NUMBER_6) || "+1 555-434-0459",
    },
    {
      id: line7Id,
      label: clean(process.env.WHATSAPP_PHONE_LABEL_7) || "Line 7 (UK)",
      primary: false,
      slot: 7,
      department: "general",
      displayNumber: clean(process.env.WHATSAPP_DISPLAY_NUMBER_7) || "+44 7575 376078",
    },
  ];

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
  if (
    value === DEFAULT_PK_ID ||
    value === ALIAS_PK_ID ||
    value === DEFAULT_SL_ID ||
    value === DEFAULT_NL_PRIMARY_ID ||
    value === DEFAULT_NL_SECONDARY_ID ||
    value === DEFAULT_US_PRIMARY_ID ||
    value === DEFAULT_US_SECONDARY_ID ||
    value === DEFAULT_LINE7_ID ||
    value === ALIAS_UK_ID ||
    value === UK_WABA_ID ||
    value === "1964540454233744" ||
    value === "1318810581311680" ||
    value === "1854430365722527" ||
    value === "1363415125370805" ||
    value === "1239592269240963" ||
    value === "1485319076722009" ||
    value === "1245811661959729" ||
    value === "2663451950739498" ||
    value === "1401823986336958" ||
    value === "1739099617324219" ||
    value === "1339948289200329" ||
    value === "1083562997861778" ||
    value === "1385974501255442" ||
    value === "1034864159583818" ||
    value === "1291624014041103"
  ) {
    return true;
  }
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
        "No WhatsApp sender is configured. Set WHATSAPP_PHONE_NUMBER_ID (and WHATSAPP_PHONE_NUMBER_ID_2 or WHATSAPP_PHONE_NUMBER_ID_3).",
    };
  }

  const wanted = (requested ?? "").trim();
  if (!wanted) return { ok: true, id: primaryNumberId() as string };

  // Map any incoming WABA ID to its canonical sending Phone Number ID
  if (wanted === "1363415125370805") return { ok: true, id: "1239592269240963" };
  if (wanted === "1485319076722009") return { ok: true, id: "1245811661959729" };
  if (wanted === "2663451950739498") return { ok: true, id: "1401823986336958" };
  if (wanted === "1739099617324219") return { ok: true, id: "1339948289200329" };
  if (wanted === "1083562997861778") return { ok: true, id: "1385974501255442" };
  if (wanted === "1034864159583818") return { ok: true, id: "1291624014041103" };
  if (wanted === "1854430365722527") return { ok: true, id: "1318810581311680" };

  if (
    wanted === DEFAULT_PK_ID ||
    wanted === DEFAULT_SL_ID ||
    wanted === DEFAULT_NL_PRIMARY_ID ||
    wanted === DEFAULT_NL_SECONDARY_ID ||
    wanted === DEFAULT_US_PRIMARY_ID ||
    wanted === DEFAULT_US_SECONDARY_ID ||
    wanted === DEFAULT_LINE7_ID ||
    wanted === ALIAS_UK_ID ||
    wanted === UK_WABA_ID ||
    wanted === "1964540454233744" ||
    wanted === "1318810581311680" ||
    wanted === "1854430365722527" ||
    wanted === "1239592269240963" ||
    wanted === "1245811661959729" ||
    wanted === "1401823986336958" ||
    wanted === "1339948289200329" ||
    wanted === "1385974501255442" ||
    wanted === "1291624014041103"
  ) {
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
 * Return whether a line or message belongs to "general", "support", or "direct".
 * All 6 active numbers run unified programmatic messages as requested.
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
    canonicalId: DEFAULT_PK_ID,
    label: "Line 1 (PK)",
    flag: "🇵🇰",
    displayNumber: "+92 335 6701199",
  },
  line2: {
    lineKey: "line2",
    canonicalId: DEFAULT_SL_ID,
    label: "Line 2 (SL)",
    flag: "🇸🇮",
    displayNumber: "+386 65 743 712",
  },
  line3: {
    lineKey: "line3",
    canonicalId: DEFAULT_NL_PRIMARY_ID,
    label: "Line 3 (NL 1)",
    flag: "🇳🇱",
    displayNumber: "+31 97058026144",
  },
  line4: {
    lineKey: "line4",
    canonicalId: DEFAULT_NL_SECONDARY_ID,
    label: "Line 4 (NL 2)",
    flag: "🇳🇱",
    displayNumber: "+31 97058026143",
  },
  line5: {
    lineKey: "line5",
    canonicalId: DEFAULT_US_PRIMARY_ID,
    label: "Line 5 (US 1)",
    flag: "🇺🇸",
    displayNumber: "+1 555-431-6671",
  },
  line6: {
    lineKey: "line6",
    canonicalId: DEFAULT_US_SECONDARY_ID,
    label: "Line 6 (US 2)",
    flag: "🇺🇸",
    displayNumber: "+1 555-434-0459",
  },
  line7: {
    lineKey: "line7",
    canonicalId: DEFAULT_LINE7_ID,
    label: "Line 7 (UK)",
    flag: "🇬🇧",
    displayNumber: "+44 7575 376078",
  },
};

export function identifyMessageLine(
  m: { channel?: string; from?: string; to?: string; direction?: string },
  customNumbers?: WANumber[]
): LineIdentifier {
  const ch = (m.channel || "").trim();
  const chDigits = ch.replace(/[^0-9]/g, "");

  const bizSide = (m.direction === "inbound" ? m.to : m.from) || "";
  const bizDigits = (bizSide || "").replace(/[^0-9]/g, "");

  const candidates = [
    ch,
    chDigits,
    bizSide,
    bizDigits,
    (m.to || "").replace(/[^0-9]/g, ""),
    (m.from || "").replace(/[^0-9]/g, ""),
  ].filter(Boolean);

  const matchesAny = (set: string[]) => candidates.some((c) => set.includes(c));

  if (matchesAny(["1964540454233744", "1318810581311680", "1854430365722527", "447575376078"])) return KNOWN_LINES.line7;
  if (matchesAny(["1034864159583818", "1291624014041103", "15554340459"])) return KNOWN_LINES.line6;
  if (matchesAny(["1083562997861778", "1385974501255442", "15554316671"])) return KNOWN_LINES.line5;
  if (matchesAny(["1739099617324219", "1339948289200329", "3197058026143"])) return KNOWN_LINES.line4;
  if (matchesAny(["2663451950739498", "1401823986336958", "3197058026144"])) return KNOWN_LINES.line3;
  if (matchesAny(["1485319076722009", "1245811661959729", "38665743712"])) return KNOWN_LINES.line2;
  if (matchesAny(["1363415125370805", "1239592269240963", "923356701199"])) return KNOWN_LINES.line1;

  if (customNumbers && customNumbers.length > 0) {
    for (const num of customNumbers) {
      const numDigits = (num.id || "").replace(/[^0-9]/g, "");
      const dispDigits = (num.displayNumber || "").replace(/[^0-9]/g, "");
      if (
        candidates.some(
          (c) => c === num.id || (numDigits && c === numDigits) || (dispDigits && c === dispDigits)
        )
      ) {
        const slotKey = `line${num.slot || 1}`;
        if (KNOWN_LINES[slotKey]) return KNOWN_LINES[slotKey];
        return {
          lineKey: (slotKey as any) || "line1",
          canonicalId: num.id,
          label: num.label || `Line ${num.slot || 1}`,
          flag: "📱",
          displayNumber: num.displayNumber || num.id,
        };
      }
    }
  }

  // Default to Line 1 (primary)
  return KNOWN_LINES.line1;
}
