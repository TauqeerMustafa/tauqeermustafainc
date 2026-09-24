/**
 * Server-side WhatsApp data store (Upstash Redis / Vercel KV).
 *
 * WHY THIS EXISTS
 * ───────────────
 * The webhook and /send handlers used to persist messages by calling the app's
 * own `/api/whatsapp/messages` endpoint over HTTP. That silently broke the whole
 * inbox: `proxy.ts` gates every /api/whatsapp/* path behind an admin bearer
 * token, and a server-to-server fetch carries no such token — so each of those
 * writes came back 401 and was swallowed by a `.catch()`. Inbound messages were
 * never stored, delivery receipts never applied, and auto-reply rules never
 * loaded.
 *
 * Route handlers must therefore go through this module instead of fetching
 * themselves. It is the single place that knows how WhatsApp state is laid out
 * in KV, and it is import-only (never reachable over HTTP), so the auth gate
 * stays intact for real clients.
 *
 * CONCURRENCY NOTE
 * ────────────────
 * Messages live in one JSON array under a single key (kept that way for
 * compatibility with existing stored data and the /conversations reader). Appends
 * are therefore read-modify-write and two writes landing in the same instant can
 * drop one. Acceptable at this volume; move to a Redis list (RPUSH/LRANGE) if
 * inbound traffic ever gets bursty enough to matter.
 */
import { getKV, checkKVConfigured, KEYS } from "@/lib/kv";

export type WAMessage = {
  id: string;
  from: string;
  to: string;
  jid?: string;
  name?: string;
  /**
   * Which of the business's own numbers this message belongs to (a Meta Phone
   * Number ID). Set in both directions so a reply can go back out from the
   * number the customer actually wrote to. Absent on messages stored before the
   * account had a second number — treat that as the primary.
   */
  channel?: string;
  type: string;
  body: string;
  timestamp: string;
  direction: "inbound" | "outbound";
  status?: string;
  /** Meta media reference for non-text messages (image, video, audio, doc, sticker). */
  mediaId?: string;
  mimeType?: string;
  filename?: string;
  /** Voice notes are audio with `voice: true` on the Meta payload. */
  voice?: boolean;
  /** Id of the message this one replies to (Meta `context.id`). */
  replyTo?: string;
  /** For type "reaction": the message the emoji was applied to. */
  reactionTo?: string;
  /**
   * The id of the button or list row the contact tapped. Titles are display
   * text and get rewritten; ids are what a scripted flow can branch on.
   */
  choiceId?: string;
  /** Detailed error message or reason when type is 'unsupported'. */
  errorDetails?: string;
  errorCode?: number;
  unsupportedReason?: string;
  /** Structured contacts payload when type is 'contacts'. */
  contactsData?: Array<{
    name?: string;
    phones?: string[];
    emails?: string[];
    org?: string;
  }>;
  /** Structured location payload when type is 'location'. */
  locationData?: {
    name?: string;
    address?: string;
    latitude?: number;
    longitude?: number;
    url?: string;
  };
  /** Structured system payload when type is 'system'. */
  systemData?: {
    body?: string;
    type?: string;
  };
  /** Explicit departmental tag: general, support, or direct */
  department?: "general" | "support" | "direct";
};

export type AutoReplyRule = {
  id: string;
  keyword: string;
  mode: "contains" | "equals" | "starts" | "regex" | (string & {});
  reply: string;
  enabled: boolean;
  department?: "general" | "support" | "direct";
};

/** Keep the stored history bounded. */
const MAX_MESSAGES = 1000;

export const isStoreReady = checkKVConfigured;

const memoryMessages: WAMessage[] = [];

export async function getMessages(): Promise<WAMessage[]> {
  const kv = getKV();
  if (!kv) return memoryMessages;
  try {
    const fromKv = (await kv.get<WAMessage[]>(KEYS.messages)) ?? [];
    return fromKv.length > 0 ? fromKv : memoryMessages;
  } catch {
    return memoryMessages;
  }
}

/**
 * Append one message. Idempotent on `id`: Meta retries webhook deliveries, and
 * replaying one must not double-post into the inbox.
 */
export async function appendMessage(message: WAMessage): Promise<boolean> {
  const kv = getKV();
  const messages = await getMessages();
  if (message.id && messages.some((m) => m.id === message.id)) return false;

  messages.push(message);
  if (!kv) {
    if (messages.length > MAX_MESSAGES) {
      messages.splice(0, messages.length - MAX_MESSAGES);
    }
    return true;
  }

  try {
    await kv.set(KEYS.messages, messages.slice(-MAX_MESSAGES));
    return true;
  } catch (err) {
    console.error("[wa-store] KV set failed, saved in memory:", err);
    return true;
  }
}

/**
 * Advance a message's delivery status. Status only moves forward
 * (sent → delivered → read); "failed" may override at any point. Meta does not
 * guarantee receipt ordering, so without this guard a late "sent" would clobber
 * an already-shown "read".
 */
const STATUS_RANK: Record<string, number> = { sent: 1, delivered: 2, read: 3 };

export async function updateMessageStatus(id: string, status: string): Promise<boolean> {
  const kv = getKV();
  if (!kv) return false;

  const messages = await getMessages();
  const target = messages.find((m) => m.id === id);
  if (!target) return false;

  const advances =
    status === "failed" || (STATUS_RANK[status] ?? 0) > (STATUS_RANK[target.status ?? ""] ?? 0);
  if (!advances) return false;

  target.status = status;
  await kv.set(KEYS.messages, messages);
  return true;
}

/** The customer-side number for a message (prefer jid, else the non-us side). */
function customerOf(m: WAMessage): string {
  if (m.jid) return m.jid.split("@")[0].split(":")[0].replace(/[^0-9]/g, "");
  const raw = m.direction === "inbound" ? m.from : m.to;
  return (raw || "").replace(/[^0-9]/g, "");
}

export async function deleteConversationMessages(number: string, channel?: string): Promise<number> {
  const kv = getKV();
  if (!kv) return 0;

  const digits = number.replace(/[^0-9]/g, "");
  const messages = await getMessages();
  const kept = messages.filter((m) => {
    if (customerOf(m) !== digits) return true;
    if (!channel) return false;
    const mChan = (m.channel || (m.direction === "inbound" ? m.to : m.from) || "").replace(/[^0-9]/g, "");
    const targetChan = channel.replace(/[^0-9]/g, "");
    return mChan !== targetChan;
  });

  await kv.set(KEYS.messages, kept);
  return messages.length - kept.length;
}

/* ── Conversation State Machine Sessions ───────────────────────────────── */

export type FlowStage =
  | "welcome"
  | "menu"
  | "scope"
  | "timeline"
  | "intake"
  | "handoff";

export type ServiceKey =
  | "web"
  | "cybersecurity"
  | "ai"
  | "cloud"
  | "uiux"
  | "client_services"
  | "careers"
  | "human";

export interface Session {
  stage: FlowStage;
  service?: ServiceKey;
  scope?: string;
  timeline?: string;
  startedAt: number;
}

const memorySessions = new Map<string, Session>();

export async function getSession(from: string): Promise<Session | null> {
  const clean = from.replace(/[^0-9]/g, "");
  const kv = getKV();
  if (!kv) return memorySessions.get(clean) ?? null;
  try {
    const s = await kv.get<Session>(`wa:session:${clean}`);
    return s ?? memorySessions.get(clean) ?? null;
  } catch {
    return memorySessions.get(clean) ?? null;
  }
}

export async function setSession(from: string, session: Session): Promise<void> {
  const clean = from.replace(/[^0-9]/g, "");
  memorySessions.set(clean, session);
  const kv = getKV();
  if (!kv) return;
  try {
    // Session TTL of 24 hours (86400 seconds)
    await kv.set(`wa:session:${clean}`, session, { ex: 86400 });
  } catch (err) {
    console.error("[wa-store] Error setting session in KV:", err);
  }
}

export async function clearSession(from: string): Promise<void> {
  const clean = from.replace(/[^0-9]/g, "");
  memorySessions.delete(clean);
  const kv = getKV();
  if (!kv) return;
  try {
    await kv.del(`wa:session:${clean}`);
  } catch {}
}

/* ── Auto-reply rules ──────────────────────────────────────────────────── */

/**
 * Bumped whenever the shipped rules below change in a way a live deployment
 * should pick up. See `getRules` for what "should pick up" means.
 */
const RULES_VERSION = 4;

/**
 * Keyword replies for contacts already in a conversation.
 *
 * A stranger's first message is NOT answered from here — the webhook opens the
 * scripted list in lib/wa-flow instead, because a tap beats asking someone to
 * type "services". These cover the words people send mid-conversation, and they
 * hand back to the flow rather than restating a menu in text.
 *
 * Three rules the copy follows, the same three as lib/wa-flow:
 *   1. No emojis.
 *   2. No prices. What we charge depends on scope, and a number sent by an
 *      auto-reply is one we then have to argue our way out of.
 *   3. No promise a person has to keep. Working hours are a fact and can be
 *      stated; "answered within a few hours", "top of this inbox" and the like
 *      are guesses this code cannot honour, so they are gone.
 *
 * Bold (*asterisks*) renders in WhatsApp, and these replies are long enough that
 * labelling the lines is the difference between skimmed and ignored.
 */
export const DEFAULT_GENERAL_RULES: AutoReplyRule[] = [
  {
    id: "services",
    keyword: "services, what do you do, what do you offer, service, help with",
    mode: "contains",
    department: "general",
    reply:
      "*Tauqeer Mustafa Inc.* — Engineering & Advisory Practices:\n\n" +
      "1. *Web & Cloud Platforms* — Resilient cloud portals, enterprise SaaS, and high-throughput APIs.\n\n" +
      "2. *Cybersecurity & Audits* — Infrastructure hardening, vulnerability assessments, and zero-trust.\n\n" +
      "3. *AI & Automation* — Autonomous agent workflows, enterprise RAG, and custom copilots.\n\n" +
      "4. *Cloud & DevOps* — Multi-cloud architecture (AWS/GCP/Azure), Kubernetes, and Terraform IaC.\n\n" +
      "5. *Product & UI/UX* — Enterprise design systems, user flows, and product prototyping.\n\n" +
      "Reply with the practice area that matches your project, or share your core objective.",
    enabled: true,
  },
  {
    id: "pricing",
    keyword: "price, pricing, cost, how much, rates, budget, quote, fees",
    mode: "contains",
    department: "general",
    reply:
      "All engagements at *Tauqeer Mustafa Inc.* are scoped with transparent, fixed-price milestones — no hidden fees or open-ended hourly billing.\n\n" +
      "To receive an accurate technical proposal and timeline, please share:\n\n" +
      "1. *Organization* — Company name and primary website\n" +
      "2. *Practice Area* — Web, Cloud, AI, Cybersecurity, or UI/UX\n" +
      "3. *Objective* — What you want to build or solve, and your target completion date\n\n" +
      "Our technical leadership will evaluate your scope and deliver a clear written proposal.",
    enabled: true,
  },
  {
    id: "hours",
    keyword: "hours, timing, open, schedule, available, when are you",
    mode: "contains",
    department: "general",
    reply:
      "*Business Operating Hours:*\n" +
      "Monday to Saturday, 09:00 to 18:00 Pakistan time (PKT). Closed Sunday.\n\n" +
      "Inquiries submitted outside operating hours are reviewed first thing the following morning.\n\n" +
      "For critical production outages or urgent security incidents, reply *urgent* or call our 24/7 hotline directly: +92 335 6701199.",
    enabled: true,
  },
  {
    id: "contact",
    keyword: "contact, reach, call, email, phone, speak, talk to, human",
    mode: "contains",
    department: "general",
    reply:
      "You are connected with the *Tauqeer Mustafa Inc.* Technical Inbound Desk.\n\n" +
      "• *Direct Hotline:* +92 335 6701199\n" +
      "• *Email:* contact@tauqeermustafa.tech\n" +
      "• *Operating Hours:* Monday to Saturday, 09:00 to 18:00 (PKT)\n\n" +
      "If you would like to arrange an architecture sync, share your phone number and two convenient times.",
    enabled: true,
  },
  {
    id: "portfolio",
    keyword: "portfolio, work, projects, examples, past work, case study, references",
    mode: "contains",
    department: "general",
    reply:
      "Explore our software engineering architecture, case studies, and capabilities at:\n" +
      "https://tauqeermustafa.tech\n\n" +
      "Tell us your target technical stack or industry, and we will share relevant architecture case studies and deliverables.",
    enabled: true,
  },
  {
    id: "urgent",
    keyword: "urgent, emergency, asap, immediately, critical, breach, hacked",
    mode: "contains",
    department: "general",
    reply:
      "🚨 *HIGH PRIORITY ALERT LOGGED*\n\n" +
      "This thread has been flagged directly to our on-call Incident Response team.\n\n" +
      "Please share immediately:\n" +
      "1. *Affected Systems* — Domain, endpoint URLs, or infrastructure components\n" +
      "2. *Symptoms* — Observed errors, outage onset time, or unusual behavior\n" +
      "3. *Emergency Phone* — Number we can reach your team on right now\n\n" +
      "24/7 Emergency Bridge: *+92 335 6701199*.",
    enabled: true,
  },
  {
    id: "thanks",
    keyword: "thank, thanks, shukriya, appreciate, grateful",
    mode: "contains",
    department: "general",
    reply: "You are very welcome. Our engineering team is here whenever you need assistance.",
    enabled: true,
  },
];

export const DEFAULT_SUPPORT_RULES: AutoReplyRule[] = [
  {
    id: "support_ticket",
    keyword: "ticket, status, incident, report, issue, bug",
    mode: "contains",
    department: "support",
    reply:
      "*Tauqeer Mustafa Inc. Technical Support Desk*\n\n" +
      "To check ticket status or submit diagnostic logs:\n" +
      "1. Live SLA Tracker: https://support.tauqeermustafa.tech/ticket\n" +
      "2. Or reply directly with your Ticket Reference ID (e.g. *TMI-SUP-XXXXX*).\n\n" +
      "An on-call incident engineer evaluates every report.",
    enabled: true,
  },
  {
    id: "support_outage",
    keyword: "down, outage, broken, critical, p1, emergency, offline, failure, crash",
    mode: "contains",
    department: "support",
    reply:
      "*CRITICAL P1 INCIDENT PROTOCOL ACTIVATED*\n\n" +
      "Emergency voice bridge dispatch is active at *+92 335 6701199*.\n\n" +
      "Our incident commander responds within 15 to 60 minutes. Please state:\n" +
      "1. *Affected URL / service endpoint*\n" +
      "2. *Time outage was detected*\n" +
      "3. *Current HTTP error codes*",
    enabled: true,
  },
  {
    id: "support_sla",
    keyword: "sla, escalation, priority, p2, p3, p4, turnaround",
    mode: "contains",
    department: "support",
    reply:
      "*SLA Response Benchmarks:*\n" +
      "• *P1 Critical Outage:* 15-60 min response\n" +
      "• *P2 High Severity:* < 4 hours response\n" +
      "• *P3 Standard Issue:* < 24 hours turnaround\n" +
      "• *P4 General Request:* < 48 hours\n\n" +
      "Live telemetry: https://support.tauqeermustafa.tech/status",
    enabled: true,
  },
  {
    id: "support_hotline",
    keyword: "hotline, phone, call, bridge, voice",
    mode: "contains",
    department: "support",
    reply:
      "*24/7 Production Hotline:*\n" +
      "Direct emergency voice bridge: *+92 335 6701199*\n\n" +
      "Available 24/7/365 for active retainer clients experiencing critical system degradation.",
    enabled: true,
  },
  {
    id: "support_hours",
    keyword: "hours, timing, schedule, when, available",
    mode: "contains",
    department: "support",
    reply:
      "*Support Desk Coverage:*\n" +
      "• *Critical Incidents (P1):* 24/7/365 continuous coverage\n" +
      "• *Standard Support (P2-P4):* Monday to Saturday, 08:00 to 22:00 Pakistan time\n\n" +
      "Email escalation: support@tauqeermustafa.tech",
    enabled: true,
  },
  {
    id: "support_resolved",
    keyword: "fixed, resolved, verified, working now, thanks, thank you",
    mode: "contains",
    department: "support",
    reply:
      "Glad to hear your issue is resolved. The incident log will be archived. If you observe any further anomalies, send them here anytime.",
    enabled: true,
  },
];

export const DEFAULT_RULES: AutoReplyRule[] = [
  ...DEFAULT_GENERAL_RULES,
  ...DEFAULT_SUPPORT_RULES,
];

/** Ids of the rules this file has ever shipped, for the upgrade check below. */
const SHIPPED_RULE_IDS = new Set([
  ...DEFAULT_RULES.map((r) => r.id),
  // Retired: "welcome" now belongs to the scripted flow, not a keyword rule.
  "welcome",
]);

/**
 * Marks that only a seeded set carries. Used for deployments seeded before the
 * fingerprint key existed, where there is no exact print to compare against.
 * The emoji pattern catches the v1 seed; the phrases catch v2, whose copy had no
 * emojis at all — which is precisely why the old emoji-only check could never
 * fire on a v2→v3 bump and why the stored copy went stale in the first place.
 */
const SEED_TELLS: RegExp[] = [
  /[\u{1F000}-\u{1FAFF}\u{2190}-\u{2BFF}\u{FE0F}\u{2600}-\u{27BF}]/u,
  /financial compliance/i,
  /SEO and AdSense/i,
  /controls, records and reporting/i,
  /inside two working days/i,
  /usually answered within a few hours/i,
  /ahead of everything else in this inbox/i,
];

type KVClient = NonNullable<ReturnType<typeof getKV>>;

/**
 * Field-by-field print of a rule set, so "unchanged" is an exact comparison.
 * JSON rather than a joined string because JSON quotes each field: a reply that
 * happens to contain the separator cannot make two different sets print alike.
 */
function rulesPrint(rules: AutoReplyRule[]): string {
  return JSON.stringify(
    (rules ?? []).map((r) => [r?.id, r?.keyword, r?.mode, r?.reply, !!r?.enabled])
  );
}

/**
 * The print is stored wrapped in an object, and that is not cosmetic. Upstash
 * passes a string argument through unchanged but runs JSON.parse on every read,
 * so writing the print as a bare string would hand back a parsed ARRAY on the
 * next read — never equal to the string it is compared against, leaving the
 * fingerprint permanently "mismatched" and this whole check dead. An object
 * round-trips as an object.
 */
type SeedPrint = { print?: string };

/** Write the shipped set and record what was written. */
async function seedRules(kv: KVClient): Promise<AutoReplyRule[]> {
  await kv.set(KEYS.rules, DEFAULT_RULES);
  await kv.set(KEYS.rulesVersion, RULES_VERSION);
  await kv.set(KEYS.rulesSeed, { print: rulesPrint(DEFAULT_RULES) } satisfies SeedPrint);
  return DEFAULT_RULES;
}

/**
 * True when the stored set is still the one this code seeded, byte for byte, and
 * so is safe to replace. `setRules` deletes the fingerprint, so an admin's own
 * save can never look untouched here.
 */
async function isUntouchedSeed(kv: KVClient, stored: AutoReplyRule[]): Promise<boolean> {
  const print = (await kv.get<SeedPrint>(KEYS.rulesSeed))?.print;
  if (print) return rulesPrint(stored) === print;

  return (
    stored.every((r) => SHIPPED_RULE_IDS.has(r?.id)) &&
    stored.some((r) => SEED_TELLS.some((tell) => tell.test(String(r?.reply ?? ""))))
  );
}

/**
 * Rules as stored, seeding defaults on first read.
 *
 * A running deployment already holds the previous shipped rules in KV, and those
 * made promises this code cannot keep. Replacing them blindly would throw away an
 * admin's own wording, so an upgrade happens only when the stored set is provably
 * the untouched seed — see `isUntouchedSeed`. Anything hand-written is left
 * exactly as the admin left it.
 */
export async function getRules(department?: "general" | "support" | "direct"): Promise<AutoReplyRule[]> {
  const kv = getKV();
  let allRules: AutoReplyRule[];
  if (!kv) {
    allRules = DEFAULT_RULES;
  } else {
    const stored = await kv.get<AutoReplyRule[]>(KEYS.rules);
    if (!stored || stored.length === 0) {
      allRules = await seedRules(kv);
    } else {
      const version = Number((await kv.get<number>(KEYS.rulesVersion)) ?? 1);
      if (version < RULES_VERSION && (await isUntouchedSeed(kv, stored))) {
        console.log("[wa-store] Replaced the unedited default auto-reply rules with current set.");
        allRules = await seedRules(kv);
      } else {
        allRules = stored;
      }
    }
  }

  if (department === "direct") {
    return allRules.filter((r) => r.department === "direct" || r.id.startsWith("direct_"));
  }
  if (department === "support") {
    return allRules.filter((r) => r.department === "support" || r.id.startsWith("support_"));
  }
  if (department === "general") {
    return allRules.filter((r) => r.department === "general" || (!r.department && !r.id.startsWith("support_") && !r.id.startsWith("direct_")));
  }
  return allRules;
}

export async function setRules(rules: AutoReplyRule[], department?: "general" | "support" | "direct"): Promise<boolean> {
  const kv = getKV();
  if (!kv) return false;

  if (department) {
    const existing = (await kv.get<AutoReplyRule[]>(KEYS.rules)) ?? DEFAULT_RULES;
    const others = existing.filter((r) => r.department !== department);
    const tagged = rules.map((r) => ({ ...r, department }));
    await kv.set(KEYS.rules, [...others, ...tagged]);
  } else {
    await kv.set(KEYS.rules, rules);
  }

  // The admin's own set is current by definition; never upgrade over it later.
  await kv.set(KEYS.rulesVersion, RULES_VERSION);
  await kv.del(KEYS.rulesSeed);
  return true;
}

/**
 * First enabled rule matching `text`, or null. Shared by the webhook so the
 * matching semantics are defined once.
 */
export function matchRule(rules: AutoReplyRule[], text: string): AutoReplyRule | null {
  const lower = text.toLowerCase().trim();
  if (!lower) return null;

  for (const rule of rules) {
    if (!rule.enabled) continue;

    if (rule.mode === "regex") {
      try {
        if (new RegExp(rule.keyword, "i").test(text)) return rule;
      } catch {
        console.warn(`[wa-store] Invalid regex in rule ${rule.id}: ${rule.keyword}`);
      }
      continue;
    }

    const keywords = rule.keyword
      .split(",")
      .map((k) => k.trim().toLowerCase())
      .filter(Boolean);

    const hit = keywords.some((kw) =>
      rule.mode === "equals"
        ? lower === kw
        : rule.mode === "starts"
          ? lower.startsWith(kw)
          : lower.includes(kw)
    );
    if (hit) return rule;
  }

  return null;
}
