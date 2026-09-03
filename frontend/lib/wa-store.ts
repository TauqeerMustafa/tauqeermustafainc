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
};

export type AutoReplyRule = {
  id: string;
  keyword: string;
  mode: "contains" | "equals" | "starts" | "regex" | (string & {});
  reply: string;
  enabled: boolean;
};

/** Keep the stored history bounded. */
const MAX_MESSAGES = 1000;

export const isStoreReady = checkKVConfigured;

/* ── Messages ──────────────────────────────────────────────────────────── */

export async function getMessages(): Promise<WAMessage[]> {
  const kv = getKV();
  if (!kv) return [];
  return (await kv.get<WAMessage[]>(KEYS.messages)) ?? [];
}

/**
 * Append one message. Idempotent on `id`: Meta retries webhook deliveries, and
 * replaying one must not double-post into the inbox.
 */
export async function appendMessage(message: WAMessage): Promise<boolean> {
  const kv = getKV();
  if (!kv) return false;

  const messages = await getMessages();
  if (message.id && messages.some((m) => m.id === message.id)) return false;

  messages.push(message);
  await kv.set(KEYS.messages, messages.slice(-MAX_MESSAGES));
  return true;
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

export async function deleteConversationMessages(number: string): Promise<number> {
  const kv = getKV();
  if (!kv) return 0;

  const digits = number.replace(/[^0-9]/g, "");
  const messages = await getMessages();
  const kept = messages.filter((m) => customerOf(m) !== digits);

  await kv.set(KEYS.messages, kept);
  return messages.length - kept.length;
}

/* ── Auto-reply rules ──────────────────────────────────────────────────── */

/**
 * Bumped whenever the shipped rules below change in a way a live deployment
 * should pick up. See `getRules` for what "should pick up" means.
 */
const RULES_VERSION = 2;

/**
 * Keyword replies for contacts already in a conversation.
 *
 * A stranger's first message is NOT answered from here — the webhook opens the
 * scripted list in lib/wa-flow instead, because a tap beats asking someone to
 * type "services". These cover the words people send mid-conversation, and they
 * hand back to the flow rather than restating a menu in text.
 *
 * Two rules the copy follows: no emojis, and never name a price. What we charge
 * depends on scope, and a number sent by an auto-reply is one we then have to
 * argue our way out of.
 */
export const DEFAULT_RULES: AutoReplyRule[] = [
  {
    id: "services",
    keyword: "services, what do you do, what do you offer, service, help with",
    mode: "contains",
    reply:
      "We work in three areas:\n\n" +
      "1. Cybersecurity consulting. We review how customer and payment data moves through your business, name what is exposed, and hand back a fix list in priority order.\n\n" +
      "2. Financial compliance. Controls, records and reporting put in place so growth does not outrun your bookkeeping, and so an audit is routine.\n\n" +
      "3. SEO and AdSense management. Work on the traffic you already have and the spend you already make, reported in enquiries rather than impressions.\n\n" +
      "Tell me which one is closest to your situation, along with your company name, and the right person picks it up.",
    enabled: true,
  },
  {
    id: "pricing",
    keyword: "price, pricing, cost, how much, rates, budget, quote, fees",
    mode: "contains",
    reply:
      "Fair question, and the honest answer is that it depends on scope, so we do not quote before we understand the work.\n\n" +
      "Send these and you get a written proposal with a fixed price inside two working days:\n\n" +
      "1. Company name and website\n" +
      "2. Which of the three services you need\n" +
      "3. The outcome you want, and any deadline you are working to\n\n" +
      "If the work turns out to be smaller than you expect, we say so.",
    enabled: true,
  },
  {
    id: "hours",
    keyword: "hours, timing, open, schedule, available, when are you",
    mode: "contains",
    reply:
      "Monday to Saturday, 09:00 to 18:00 Pakistan time. Sunday is closed.\n\n" +
      "Messages sent inside those hours are usually answered within a few hours. " +
      "Anything sent outside them is answered first thing the next working morning.\n\n" +
      "If it cannot wait, send the word urgent and it goes to the top of this inbox.",
    enabled: true,
  },
  {
    id: "contact",
    keyword: "contact, reach, call, email, phone, speak, talk to, human",
    mode: "contains",
    reply:
      "You are already in the right place. A person reads this inbox, Monday to Saturday, 09:00 to 18:00 Pakistan time.\n\n" +
      "If a call is easier, send a number and two times that suit you and we will ring you.\n\n" +
      "By email: contact@tauqeermustafa.tech",
    enabled: true,
  },
  {
    id: "portfolio",
    keyword: "portfolio, work, projects, examples, past work, case study, references",
    mode: "contains",
    reply:
      "Our work and written case studies are at tauqeermustafa.tech.\n\n" +
      "Tell me which of the three services you are weighing up and I will send the closest comparable engagement, " +
      "including what it cost to run and what changed as a result.",
    enabled: true,
  },
  {
    id: "urgent",
    keyword: "urgent, emergency, asap, immediately, critical, breach, hacked",
    mode: "contains",
    reply:
      "Flagged as urgent. This is now ahead of everything else in this inbox.\n\n" +
      "Send what you can, even if it is incomplete:\n\n" +
      "1. What you are seeing, and when you first noticed it\n" +
      "2. What is affected, and whether customer or payment data is involved\n" +
      "3. A number to call you on\n\n" +
      "Keep whatever logs and alerts you already have. Do not wipe or rebuild anything before we have spoken, unless something is still actively spreading.",
    enabled: true,
  },
  {
    id: "thanks",
    keyword: "thank, thanks, shukriya, appreciate, grateful",
    mode: "contains",
    reply: "Glad to help. Anything else, send it here and someone will pick it up.",
    enabled: true,
  },
];

/** Ids of the rules this file has ever shipped, for the upgrade check below. */
const SHIPPED_RULE_IDS = new Set([
  ...DEFAULT_RULES.map((r) => r.id),
  // Retired: "welcome" now belongs to the scripted flow, not a keyword rule.
  "welcome",
]);

/** Pictographs, dingbats and variation selectors — anything decorative. */
const EMOJI = /[\u{1F000}-\u{1FAFF}\u{2190}-\u{2BFF}\u{FE0F}\u{2600}-\u{27BF}]/u;

/**
 * Rules as stored, seeding defaults on first read.
 *
 * A deployment that has been running already has the previous rules in KV, and
 * those advertised the wrong business in emoji-covered copy. Replacing them
 * blindly would throw away an admin's own wording, so an upgrade happens only
 * when the stored set is provably untouched: every id is one this file shipped,
 * and at least one reply still carries an emoji, which only the old seed did.
 * Anything hand-written is left exactly as the admin left it.
 */
export async function getRules(): Promise<AutoReplyRule[]> {
  const kv = getKV();
  if (!kv) return DEFAULT_RULES;

  const stored = await kv.get<AutoReplyRule[]>(KEYS.rules);
  if (!stored || stored.length === 0) {
    await kv.set(KEYS.rules, DEFAULT_RULES);
    await kv.set(KEYS.rulesVersion, RULES_VERSION);
    return DEFAULT_RULES;
  }

  const version = Number((await kv.get<number>(KEYS.rulesVersion)) ?? 1);
  if (version < RULES_VERSION) {
    const untouched =
      stored.every((r) => SHIPPED_RULE_IDS.has(r.id)) && stored.some((r) => EMOJI.test(r.reply));
    if (untouched) {
      await kv.set(KEYS.rules, DEFAULT_RULES);
      await kv.set(KEYS.rulesVersion, RULES_VERSION);
      console.log("[wa-store] Replaced the unedited default auto-reply rules with the current set.");
      return DEFAULT_RULES;
    }
    // Edited by hand — keep it, and stop re-checking on every read.
    await kv.set(KEYS.rulesVersion, RULES_VERSION);
  }

  return stored;
}

export async function setRules(rules: AutoReplyRule[]): Promise<boolean> {
  const kv = getKV();
  if (!kv) return false;
  await kv.set(KEYS.rules, rules);
  // The admin's own set is current by definition; never upgrade over it later.
  await kv.set(KEYS.rulesVersion, RULES_VERSION);
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
