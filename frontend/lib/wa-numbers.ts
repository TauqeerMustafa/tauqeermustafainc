/**
 * Which WhatsApp numbers this deployment can send from.
 *
 * Line 1: Qorlune Official (+1 711-091-5975) - Slot 1 (qorlune.co.uk)
 * Line 2: Tauqeer Mustafa (+92 335 6701199) - Slot 2 (tauqeermustafa.com)
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
 * Line 1: Official Qorlune WhatsApp Line (+1 711-091-5975)
 * Meta Phone Number ID: 1433890589802290
 * Meta WABA ID: 944973294966811
 */
export const DEFAULT_QORLUNE_ID = "1433890589802290";
export const DEFAULT_PRIMARY_ID = DEFAULT_QORLUNE_ID;
export const DEFAULT_QORLUNE_DISPLAY = "+1 711-091-5975";

/**
 * Line 2: Tauqeer Mustafa Direct Line (+92 335 6701199)
 * Used on: tauqeermustafa.com
 */
export const DEFAULT_PK_ID = "1239592269240963";
export const ALIAS_PK_ID = "1363415125370805";
export const DEFAULT_TAUQEER_ID = DEFAULT_PK_ID;
export const DEFAULT_TAUQEER_DISPLAY = "+92 335 6701199";

const FORBIDDEN_PHONE_IDS = new Set<string>([]);
const FORBIDDEN_NUMBERS: string[] = [];

export function isForbiddenNumber(raw?: string | null): boolean {
  if (!raw) return false;
  if (FORBIDDEN_PHONE_IDS.has(raw.trim())) return true;
  const digits = raw.replace(/\D/g, "");
  return FORBIDDEN_NUMBERS.some((f) => digits.includes(f.replace(/\D/g, "")));
}

// Deprecated line aliases
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
export const DEFAULT_SECOND_ID = DEFAULT_TAUQEER_ID;
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

  const secondEnvId = clean(process.env.WHATSAPP_PHONE_NUMBER_ID_2);
  const safeSecondId = secondEnvId && !isForbiddenNumber(secondEnvId) ? secondEnvId : DEFAULT_PK_ID;

  const secondDisplay = clean(process.env.WHATSAPP_DISPLAY_NUMBER_2);
  const safeSecondDisplay = secondDisplay && !isForbiddenNumber(secondDisplay) ? secondDisplay : DEFAULT_TAUQEER_DISPLAY;

  // Canonical lines: Line 1 (Qorlune) + Line 2 (Tauqeer Mustafa)
  const canonicalLines: WANumber[] = [
    {
      id: safePrimaryId,
      label: clean(process.env.WHATSAPP_PHONE_LABEL) || "Qorlune Official",
      primary: true,
      slot: 1,
      department: "general",
      displayNumber: safeDisplayNumber,
    },
    {
      id: safeSecondId,
      label: clean(process.env.WHATSAPP_PHONE_LABEL_2) || "Tauqeer Mustafa (tauqeermustafa.com)",
      primary: false,
      slot: 2,
      department: "direct",
      displayNumber: safeSecondDisplay,
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
    out.push({ ...n, primary: out.length === 0 });
  }
  return out;
}

let cached: WANumber[] | null = null;

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

export function primaryNumberId(): string | null {
  return waNumbers().find((n) => n.primary)?.id ?? waNumbers()[0]?.id ?? null;
}

export function isKnownNumber(id: string | null | undefined): boolean {
  const value = (id ?? "").trim();
  if (!value) return false;
  const digits = value.replace(/[^0-9]/g, "");

  if (
    digits === "17110915975" ||
    digits === "17112494712" ||
    value === DEFAULT_QORLUNE_ID ||
    value === "944973294966811" ||
    value === DEFAULT_PK_ID ||
    value === ALIAS_PK_ID ||
    digits.includes("3356701199") ||
    digits.includes("3335670119")
  ) {
    return true;
  }
  return waNumbers().some((n) => n.id === value || (n.displayNumber && n.displayNumber.replace(/[^0-9]/g, "") === digits));
}

export function labelFor(id: string | null | undefined): string {
  const value = (id ?? "").trim();
  const digits = value.replace(/[^0-9]/g, "");
  const found = waNumbers().find((n) => n.id === value || (n.displayNumber && n.displayNumber.replace(/[^0-9]/g, "") === digits));
  if (found) return found.label;
  if (digits.includes("3356701199") || digits.includes("3335670119") || value === DEFAULT_PK_ID) {
    return "Tauqeer Mustafa";
  }
  return "Qorlune Official";
}

export type ResolvedNumber =
  | { ok: true; id: string }
  | { ok: false; error: string };

export function resolveNumberId(requested?: string | null): ResolvedNumber {
  const primaryId = primaryNumberId() || DEFAULT_QORLUNE_ID;
  const wanted = (requested ?? "").trim();
  if (!wanted) return { ok: true, id: primaryId };

  const digits = wanted.replace(/[^0-9]/g, "");
  if (
    digits === "17110915975" ||
    digits === "17112494712" ||
    wanted === DEFAULT_QORLUNE_ID ||
    wanted === "944973294966811" ||
    wanted === "line1" ||
    wanted.toLowerCase().includes("qorlune")
  ) {
    return { ok: true, id: DEFAULT_QORLUNE_ID };
  }

  if (
    digits.includes("3356701199") ||
    digits.includes("3335670119") ||
    wanted === DEFAULT_PK_ID ||
    wanted === ALIAS_PK_ID ||
    wanted === "line2" ||
    wanted.toLowerCase().includes("tauqeer")
  ) {
    return { ok: true, id: DEFAULT_PK_ID };
  }

  const found = waNumbers().find((n) => n.id === wanted || (n.displayNumber && n.displayNumber.replace(/[^0-9]/g, "") === digits));
  if (found) return { ok: true, id: found.id };

  return { ok: true, id: primaryId };
}

export function getChannelDepartment(
  idOrNumber?: string | null,
  allNumbers?: WANumber[]
): WADepartment {
  const val = (idOrNumber ?? "").trim();
  const digits = val.replace(/[^0-9]/g, "");
  if (digits.includes("3356701199") || digits.includes("3335670119") || val === DEFAULT_PK_ID) {
    return "direct";
  }
  const match = (allNumbers || waNumbers()).find((n) => n.id === val || (n.displayNumber && n.displayNumber.replace(/[^0-9]/g, "") === digits));
  return match?.department ?? "general";
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
    canonicalId: DEFAULT_PK_ID,
    label: "Tauqeer Mustafa",
    flag: "🇵🇰",
    displayNumber: "+92 335 6701199",
  },
  line3: {
    lineKey: "line3",
    canonicalId: DEFAULT_QORLUNE_ID,
    label: "Qorlune Support",
    flag: "🇺🇸",
    displayNumber: "+1 711-091-5975",
  },
  line4: {
    lineKey: "line4",
    canonicalId: DEFAULT_QORLUNE_ID,
    label: "Qorlune Direct",
    flag: "🇺🇸",
    displayNumber: "+1 711-091-5975",
  },
  line5: {
    lineKey: "line5",
    canonicalId: DEFAULT_QORLUNE_ID,
    label: "Qorlune Operations",
    flag: "🇺🇸",
    displayNumber: "+1 711-091-5975",
  },
  line6: {
    lineKey: "line6",
    canonicalId: DEFAULT_QORLUNE_ID,
    label: "Qorlune VIP",
    flag: "🇺🇸",
    displayNumber: "+1 711-091-5975",
  },
  line7: {
    lineKey: "line7",
    canonicalId: DEFAULT_QORLUNE_ID,
    label: "Qorlune Global",
    flag: "🇺🇸",
    displayNumber: "+1 711-091-5975",
  },
};

export function identifyMessageLine(
  m: { channel?: string; from?: string; to?: string; direction?: string; jid?: string },
  customNumbers?: WANumber[]
): LineIdentifier {
  const ch = (m.channel || "").trim();
  const chDigits = ch.replace(/[^0-9]/g, "");

  // 1. Explicit business channel / Meta Phone Number ID (Most reliable)
  if (
    ch === DEFAULT_PK_ID ||
    ch === ALIAS_PK_ID ||
    chDigits === "1239592269240963" ||
    chDigits === "1363415125370805" ||
    chDigits.includes("3356701199") ||
    chDigits.includes("3335670119")
  ) {
    return KNOWN_LINES.line2;
  }

  if (
    ch === DEFAULT_QORLUNE_ID ||
    ch === "944973294966811" ||
    chDigits === "1433890589802290" ||
    chDigits === "944973294966811" ||
    chDigits.includes("17110915975") ||
    chDigits.includes("7110915975") ||
    chDigits.includes("17112494712") ||
    chDigits.includes("7112494712")
  ) {
    return KNOWN_LINES.line1;
  }

  // 2. Direction-aware business phone inspection when channel is omitted:
  // Outbound: business is `from`. Inbound: business is `to`.
  const bizNumber = (m.direction === "outbound" ? m.from : m.to) || "";
  const bizDigits = bizNumber.replace(/[^0-9]/g, "");

  if (
    bizNumber === DEFAULT_PK_ID ||
    bizNumber === ALIAS_PK_ID ||
    bizDigits === "1239592269240963" ||
    bizDigits === "1363415125370805" ||
    bizDigits.includes("3356701199") ||
    bizDigits.includes("3335670119")
  ) {
    return KNOWN_LINES.line2;
  }

  if (
    bizNumber === DEFAULT_QORLUNE_ID ||
    bizDigits === "1433890589802290" ||
    bizDigits === "944973294966811" ||
    bizDigits.includes("17110915975") ||
    bizDigits.includes("7110915975") ||
    bizDigits.includes("17112494712") ||
    bizDigits.includes("7112494712")
  ) {
    return KNOWN_LINES.line1;
  }

  // 3. Check customNumbers if provided
  if (customNumbers && customNumbers.length > 0) {
    for (const num of customNumbers) {
      const numDigits = (num.id || "").replace(/[^0-9]/g, "");
      const dispDigits = (num.displayNumber || "").replace(/[^0-9]/g, "");
      if (
        ch === num.id ||
        (numDigits && chDigits === numDigits) ||
        (dispDigits && chDigits === dispDigits) ||
        bizNumber === num.id ||
        (numDigits && bizDigits === numDigits) ||
        (dispDigits && bizDigits === dispDigits)
      ) {
        const slotKey = `line${num.slot || 1}`;
        if (KNOWN_LINES[slotKey]) return KNOWN_LINES[slotKey];
        return {
          lineKey: (slotKey as any) || "line1",
          canonicalId: num.id,
          label: num.label || `Line ${num.slot || 1}`,
          flag: num.slot === 2 ? "🇵🇰" : "🇺🇸",
          displayNumber: num.displayNumber || num.id,
        };
      }
    }
  }

  // Default fallback is Qorlune Line 1
  return KNOWN_LINES.line1;
}
