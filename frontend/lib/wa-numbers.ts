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
 * Fallback id for the primary number (General Inquiries & Sales).
 */
const DEFAULT_PRIMARY_ID = "1239592269240963";

/**
 * Fallback id for the second number (Line 2 - UK Support Desk).
 */
const DEFAULT_SECOND_ID = "1318810581311680";

/**
 * Fallback id for the third number (Line 3 - US Desk: 1034864159583818).
 */
const DEFAULT_THIRD_ID = "1034864159583818";

/**
 * Fallback id for Line 4 (Tauqeer Mustafa Inc | NL - Desk 1: 2663451950739498).
 */
const DEFAULT_NL_PRIMARY_ID = "2663451950739498";

/**
 * Fallback id for Line 5 (Tauqeer Mustafa Inc | NL - Desk 2: 1739099617324219).
 */
const DEFAULT_NL_SECONDARY_ID = "1739099617324219";

/**
 * Fallback id for Line 6 (Tauqeer Mustafa Inc | SL: 1485319076722009).
 */
const DEFAULT_SL_ID = "1485319076722009";

/**
 * Fallback id for Line 7 (Sandbox / Test Line: 1291624014041103).
 */
const DEFAULT_SANDBOX_ID = "1291624014041103";

/**
 * Known WABA ID associated with Line 3 (1083562997861778).
 */
export const LINE3_WABA_ID = "1083562997861778";

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

  const primaryRaw = clean(process.env.WHATSAPP_PHONE_NUMBER_ID);
  const primaryId = primaryRaw ? (isDisabled(primaryRaw) ? null : primaryRaw) : DEFAULT_PRIMARY_ID;

  const secondRaw = clean(process.env.WHATSAPP_PHONE_NUMBER_ID_2);
  const secondId = secondRaw ? (isDisabled(secondRaw) ? null : secondRaw) : DEFAULT_SECOND_ID;

  const thirdRaw = clean(process.env.WHATSAPP_PHONE_NUMBER_ID_3);
  let thirdId = thirdRaw ? (isDisabled(thirdRaw) ? null : thirdRaw) : DEFAULT_THIRD_ID;

  let fourthRaw = clean(process.env.WHATSAPP_PHONE_NUMBER_ID_4);
  if (fourthRaw === "1083562997861778" || fourthRaw === "1034864159583818") {
    if (!thirdRaw || thirdRaw === DEFAULT_THIRD_ID) {
      thirdId = "1034864159583818";
    }
    fourthRaw = DEFAULT_NL_PRIMARY_ID;
  }
  const fourthId = fourthRaw ? (isDisabled(fourthRaw) ? null : fourthRaw) : DEFAULT_NL_PRIMARY_ID;

  const fifthRaw = clean(process.env.WHATSAPP_PHONE_NUMBER_ID_5);
  const fifthId = fifthRaw ? (isDisabled(fifthRaw) ? null : fifthRaw) : DEFAULT_NL_SECONDARY_ID;

  const sixthRaw = clean(process.env.WHATSAPP_PHONE_NUMBER_ID_6);
  const sixthId = sixthRaw ? (isDisabled(sixthRaw) ? null : sixthRaw) : DEFAULT_SL_ID;

  const seventhRaw = clean(process.env.WHATSAPP_PHONE_NUMBER_ID_7);
  const seventhId = seventhRaw ? (isDisabled(seventhRaw) ? null : seventhRaw) : DEFAULT_SANDBOX_ID;

  const numbers: WANumber[] = [];
  if (primaryId && !isDisabled(primaryId)) {
    numbers.push({
      id: primaryId,
      label: clean(process.env.WHATSAPP_PHONE_LABEL) || "Line 1",
      primary: true,
      slot: 1,
      department: "general",
      displayNumber: clean(process.env.WHATSAPP_DISPLAY_NUMBER) || "+92 335 6701199",
    });
  }
  if (secondId) {
    const hasDedicatedSlot2Token = Boolean(clean(process.env.WHATSAPP_TOKEN_2));
    numbers.push({
      id: secondId,
      label: clean(process.env.WHATSAPP_PHONE_LABEL_2) || "Line 2",
      primary: numbers.length === 0,
      slot: hasDedicatedSlot2Token ? 2 : 1,
      department: "support",
      displayNumber: clean(process.env.WHATSAPP_DISPLAY_NUMBER_2) || "+44 7575 376078",
    });
  }
  if (thirdId) {
    const hasDedicatedSlot3Token = Boolean(clean(process.env.WHATSAPP_TOKEN_3));
    const hasDedicatedSlot2Token = Boolean(clean(process.env.WHATSAPP_TOKEN_2));
    numbers.push({
      id: thirdId,
      label: clean(process.env.WHATSAPP_PHONE_LABEL_3) || "Line 3",
      primary: numbers.length === 0,
      slot: hasDedicatedSlot3Token ? 3 : (hasDedicatedSlot2Token ? 2 : 1),
      department: "direct",
      displayNumber: clean(process.env.WHATSAPP_DISPLAY_NUMBER_3) || null,
    });
  }
  if (fourthId) {
    const hasDedicatedSlot4Token = Boolean(clean(process.env.WHATSAPP_TOKEN_4));
    numbers.push({
      id: fourthId,
      label: clean(process.env.WHATSAPP_PHONE_LABEL_4) || "Line 4",
      primary: numbers.length === 0,
      slot: hasDedicatedSlot4Token ? 4 : 1,
      department: "direct",
      displayNumber: clean(process.env.WHATSAPP_DISPLAY_NUMBER_4) || null,
    });
  }
  if (fifthId) {
    const hasDedicatedSlot5Token = Boolean(clean(process.env.WHATSAPP_TOKEN_5));
    numbers.push({
      id: fifthId,
      label: clean(process.env.WHATSAPP_PHONE_LABEL_5) || "Line 5",
      primary: numbers.length === 0,
      slot: hasDedicatedSlot5Token ? 5 : 1,
      department: "support",
      displayNumber: clean(process.env.WHATSAPP_DISPLAY_NUMBER_5) || null,
    });
  }
  if (sixthId) {
    const hasDedicatedSlot6Token = Boolean(clean(process.env.WHATSAPP_TOKEN_6));
    numbers.push({
      id: sixthId,
      label: clean(process.env.WHATSAPP_PHONE_LABEL_6) || "Line 6",
      primary: numbers.length === 0,
      slot: hasDedicatedSlot6Token ? 6 : 1,
      department: "direct",
      displayNumber: clean(process.env.WHATSAPP_DISPLAY_NUMBER_6) || null,
    });
  }
  if (seventhId) {
    const hasDedicatedSlot7Token = Boolean(clean(process.env.WHATSAPP_TOKEN_7));
    numbers.push({
      id: seventhId,
      label: clean(process.env.WHATSAPP_PHONE_LABEL_7) || "Line 7",
      primary: numbers.length === 0,
      slot: hasDedicatedSlot7Token ? 7 : 1,
      department: "support",
      displayNumber: clean(process.env.WHATSAPP_DISPLAY_NUMBER_7) || null,
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
    value === DEFAULT_PRIMARY_ID ||
    value === DEFAULT_SECOND_ID ||
    value === DEFAULT_THIRD_ID ||
    value === DEFAULT_NL_PRIMARY_ID ||
    value === DEFAULT_NL_SECONDARY_ID ||
    value === DEFAULT_SL_ID ||
    value === DEFAULT_SANDBOX_ID ||
    value === "1318810581311680" ||
    value === "1291624014041103" ||
    value === "1083562997861778" ||
    value === "2663451950739498" ||
    value === "1739099617324219" ||
    value === "1485319076722009"
  ) {
    return true;
  }
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
        "No WhatsApp sender is configured. Set WHATSAPP_PHONE_NUMBER_ID (and WHATSAPP_PHONE_NUMBER_ID_2 or WHATSAPP_PHONE_NUMBER_ID_3).",
    };
  }

  const wanted = (requested ?? "").trim();
  if (!wanted) return { ok: true, id: primaryNumberId() as string };

  if (
    wanted === DEFAULT_PRIMARY_ID ||
    wanted === DEFAULT_PRIMARY_ID ||
    wanted === DEFAULT_SECOND_ID ||
    wanted === DEFAULT_THIRD_ID ||
    wanted === DEFAULT_NL_PRIMARY_ID ||
    wanted === DEFAULT_NL_SECONDARY_ID ||
    wanted === DEFAULT_SL_ID ||
    wanted === DEFAULT_SANDBOX_ID ||
    wanted === "1318810581311680" ||
    wanted === "1291624014041103" ||
    wanted === "1083562997861778" ||
    wanted === "2663451950739498" ||
    wanted === "1739099617324219" ||
    wanted === "1485319076722009"
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
 */
export function getChannelDepartment(
  idOrNumber?: string | null,
  allNumbers?: WANumber[]
): WADepartment {
  if (!idOrNumber) return "general";
  const cleanId = idOrNumber.trim();
  if (!cleanId) return "general";
  const lower = cleanId.toLowerCase();
  const digits = cleanId.replace(/[^0-9]/g, "");

  // 1. Line 3 (Direct / Executive US): Phone ID 1034864159583818, WABA ID 1083562997861778
  if (
    cleanId === "1034864159583818" ||
    cleanId === "1083562997861778" ||
    cleanId === DEFAULT_THIRD_ID ||
    cleanId === LINE3_WABA_ID ||
    lower.includes("line 3") ||
    lower.includes("line3") ||
    lower.includes("direct") ||
    lower.includes("executive") ||
    lower.includes("priority")
  ) {
    return "direct";
  }

  // 2. Line 4 (Tauqeer Mustafa Inc | NL - Desk 1): Phone ID 2663451950739498
  if (
    cleanId === "2663451950739498" ||
    cleanId === DEFAULT_NL_PRIMARY_ID ||
    lower.includes("line 4") ||
    lower.includes("line4") ||
    lower.includes("nl 1") ||
    lower.includes("nl-1")
  ) {
    return "direct";
  }

  // 3. Line 5 (Tauqeer Mustafa Inc | NL - Desk 2): Phone ID 1739099617324219
  if (
    cleanId === "1739099617324219" ||
    cleanId === DEFAULT_NL_SECONDARY_ID ||
    lower.includes("line 5") ||
    lower.includes("line5") ||
    lower.includes("nl 2") ||
    lower.includes("nl-2")
  ) {
    return "support";
  }

  // 4. Line 6 (Tauqeer Mustafa Inc | SL): Phone ID 1485319076722009
  if (
    cleanId === "1485319076722009" ||
    cleanId === DEFAULT_SL_ID ||
    lower.includes("line 6") ||
    lower.includes("line6") ||
    lower.includes("sl")
  ) {
    return "direct";
  }

  // 5. Line 2 (Support UK): Phone ID 1318810581311680 (+44 7575 376078)
  if (
    cleanId === "1318810581311680" ||
    cleanId === DEFAULT_SECOND_ID ||
    digits === "447575376078" ||
    cleanId.includes("447575376078") ||
    lower.includes("line 2") ||
    lower.includes("line2") ||
    lower.includes("support")
  ) {
    return "support";
  }

  // 6. Line 1 (General / Sales PK): Phone ID 1239592269240963 (+92 335 6701199)
  const primary = primaryNumberId();
  if (primary && cleanId === primary) return "general";
  if (
    cleanId === DEFAULT_PRIMARY_ID ||
    digits === "923356701199" ||
    digits === "9233356701199" ||
    lower.includes("line 1") ||
    lower.includes("line1") ||
    lower.includes("sales") ||
    lower.includes("general")
  ) {
    return "general";
  }

  // 7. Line 7 (Test Sandbox): Phone ID 1291624014041103
  if (cleanId === "1291624014041103" || cleanId === DEFAULT_SANDBOX_ID || lower.includes("line 7") || lower.includes("line7") || lower.includes("sandbox")) {
    return "support";
  }

  const nums = allNumbers || waNumbers();

  // 8. Match against configured or discovered numbers list
  const num = nums.find((n) => {
    if (n.id === cleanId) return true;
    const nDigits = n.id.replace(/[^0-9]/g, "");
    if (digits && nDigits && digits === nDigits) return true;
    if (n.displayNumber) {
      if (n.displayNumber === cleanId) return true;
      const dDigits = n.displayNumber.replace(/[^0-9]/g, "");
      if (digits && dDigits && digits === dDigits) return true;
    }
    return false;
  });

  if (num) {
    if (num.department) return num.department;
    if (num.primary) return "general";
    if (num.id === DEFAULT_THIRD_ID || num.id === "1034864159583818" || num.id === "1083562997861778" || num.slot === 3) return "direct";
    if (num.id === DEFAULT_NL_PRIMARY_ID || num.id === "2663451950739498" || num.slot === 4) return "direct";
    if (num.id === DEFAULT_NL_SECONDARY_ID || num.id === "1739099617324219" || num.slot === 5) return "support";
    if (num.id === DEFAULT_SL_ID || num.id === "1485319076722009" || num.slot === 6) return "direct";
    if (num.slot === 2 || num.id === "1318810581311680") return "support";
    if (num.slot === 7 || num.id === DEFAULT_SANDBOX_ID || num.id === "1291624014041103") return "support";
  }

  return "general";
}
