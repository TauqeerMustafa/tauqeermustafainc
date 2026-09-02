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

export const DEFAULT_RULES: AutoReplyRule[] = [
  {
    id: "welcome",
    keyword: "hi, hello, hey, salam, assalam o alaikum, assalamualaikum",
    mode: "contains",
    reply:
      "👋 *Welcome to Tauqeer Mustafa Inc!*\n\nThank you for reaching out. How can we help you today?\n\nQuick options:\n• Reply *services* to see what we offer\n• Reply *pricing* for our rates\n• Reply *contact* to speak with our team\n• Reply *hours* for business hours",
    enabled: true,
  },
  {
    id: "services",
    keyword: "services, what do you do, what do you offer, products",
    mode: "contains",
    reply:
      "🚀 *Our Services*\n\nWe specialize in:\n\n✓ *Web Development* - Custom websites & web apps\n✓ *Mobile Apps* - iOS & Android development\n✓ *UI/UX Design* - Beautiful, user-friendly interfaces\n✓ *E-commerce* - Online stores & payment integration\n✓ *API Development* - Backend systems & integrations\n\nReply *pricing* for rates or *contact* to discuss your project!",
    enabled: true,
  },
  {
    id: "pricing",
    keyword: "price, pricing, cost, how much, rates, budget, quote",
    mode: "contains",
    reply:
      "💰 *Pricing & Quotes*\n\nOur pricing is tailored to your specific needs:\n\n📱 *Mobile Apps* - Starting from $5,000\n🌐 *Websites* - Starting from $2,000\n🎨 *Design Projects* - Starting from $1,000\n⚡ *Hourly Rate* - $50-150/hour\n\nEvery project is unique! Share your requirements and we'll send you a detailed quote within 24 hours.\n\nReady to start? Reply *yes* or send us your project details!",
    enabled: true,
  },
  {
    id: "hours",
    keyword: "hours, timing, open, schedule, available, when",
    mode: "contains",
    reply:
      "🕒 *Business Hours*\n\n📅 Monday - Friday: 9:00 AM - 6:00 PM (PKT)\n📅 Saturday: 10:00 AM - 4:00 PM (PKT)\n📅 Sunday: Closed\n\n⚡ *Response Time*\nWe typically respond within 2-4 hours during business hours.\n\nFor urgent matters, reply *urgent* and we'll prioritize your request!",
    enabled: true,
  },
  {
    id: "contact",
    keyword: "contact, reach, call, email, phone, speak, talk",
    mode: "contains",
    reply:
      "📞 *Get in Touch*\n\n*Tauqeer Mustafa Inc*\n\n📧 Email: contact@tauqeermustafa.tech\n🌐 Website: https://tauqeermustafa.tech\n💼 LinkedIn: tauqeer-mustafa\n\n*Prefer a call?*\nSend us your best time and phone number, and we'll call you within 24 hours!\n\nOr simply continue chatting here - we're here to help! 💬",
    enabled: true,
  },
  {
    id: "portfolio",
    keyword: "portfolio, work, projects, examples, past work, cases",
    mode: "contains",
    reply:
      "🎨 *Our Portfolio*\n\nWe've built amazing projects for clients worldwide!\n\n✨ Check out our work:\n👉 https://tauqeermustafa.tech\n\nOur specialties:\n• E-commerce platforms\n• SaaS applications\n• Mobile apps (iOS & Android)\n• Corporate websites\n• Custom integrations\n\nInterested in something similar? Reply *yes* and let's discuss your vision!",
    enabled: true,
  },
  {
    id: "urgent",
    keyword: "urgent, emergency, asap, immediately, now, critical",
    mode: "contains",
    reply:
      "🚨 *Urgent Request Received*\n\nWe've flagged your message as HIGH PRIORITY.\n\nA team member will respond within the next 30 minutes during business hours.\n\nIf this is outside business hours, we'll contact you first thing in the morning.\n\nPlease share:\n1️⃣ Brief description of the issue\n2️⃣ Your contact number\n3️⃣ Best time to reach you\n\nThank you for your patience! 🙏",
    enabled: true,
  },
  {
    id: "thanks",
    keyword: "thank, thanks, appreciate, grateful",
    mode: "contains",
    reply:
      "😊 You're very welcome!\n\nIs there anything else we can help you with?\n\n• Reply *services* to see what we offer\n• Reply *pricing* for rates\n• Reply *contact* to get in touch\n\nWe're here whenever you need us! 💙",
    enabled: true,
  },
];

/** Rules as stored, seeding defaults on first read. */
export async function getRules(): Promise<AutoReplyRule[]> {
  const kv = getKV();
  if (!kv) return DEFAULT_RULES;

  const stored = await kv.get<AutoReplyRule[]>(KEYS.rules);
  if (!stored || stored.length === 0) {
    await kv.set(KEYS.rules, DEFAULT_RULES);
    return DEFAULT_RULES;
  }
  return stored;
}

export async function setRules(rules: AutoReplyRule[]): Promise<boolean> {
  const kv = getKV();
  if (!kv) return false;
  await kv.set(KEYS.rules, rules);
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
