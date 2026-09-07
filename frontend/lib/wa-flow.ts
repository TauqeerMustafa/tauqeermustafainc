/**
 * The scripted WhatsApp conversation for a new lead.
 *
 * WHAT IT IS
 * ──────────
 * A tree of steps. The first message a stranger gets is an interactive LIST — one
 * tap tells us which of the three service lines they are here about, instead of
 * asking them to type "services" and hoping. Everything after that is interactive
 * REPLY BUTTONS (Meta caps those at three, which is why the list carries the wide
 * first choice and the buttons carry the narrow follow-ups).
 *
 * THREE RULES THE COPY FOLLOWS
 * ────────────────────────────
 * 1. No emojis. Decorative characters read as noise on a business number and
 *    several of them still render as boxes on older Androids.
 * 2. No prices. What the work costs depends on scope, and a number sent by an
 *    automation is one a human then has to argue their way out of.
 * 3. No promise a person has to keep. "Answered within a few hours", "called
 *    within a week", "ahead of everything else in this inbox" — an automation
 *    cannot know any of that, and a missed promise costs more than a vague one
 *    was ever worth. Stating the working hours is a fact; stating a reply time
 *    is a guess. Same for superlatives: describe the work, do not rank it.
 *
 * Bold (*asterisks*) renders in message bodies, so it is used to label the lines
 * of a list where that makes a wall of text scannable. It does NOT render in
 * button titles, list row titles or row descriptions — those stay plain.
 *
 * WHY IT NEEDS NO STORED STATE
 * ────────────────────────────
 * Each choice carries the id of the step it leads to, and the webhook receives
 * that id back in `interactive.list_reply.id` / `button_reply.id`. So "where are
 * we in the flow" is answered by the tap itself — there is no per-contact cursor
 * in KV to go stale, and a contact who scrolls up and taps an old button gets the
 * answer that button always gave.
 *
 * Titles are display copy and are trimmed to Meta's limits at build time: list
 * row title 24 chars, row description 72, button title 20, header/footer 60.
 * Ids are NOT copy — renaming a title must never change an id, or taps arriving
 * from messages already on people's phones stop resolving.
 */

import { getKV, KEYS } from "@/lib/kv";

export type FlowChoice = {
  /** Stable id sent to Meta and returned on tap. Never reword these. */
  id: string;
  title: string;
  description?: string;
  /** Step this tap leads to. */
  next: string;
};

export type FlowStep =
  | {
      kind: "list";
      id: string;
      header?: string;
      body: string;
      footer?: string;
      /** Label on the button that opens the list, e.g. "Choose a service". */
      button: string;
      sections: { title: string; rows: FlowChoice[] }[];
    }
  | {
      kind: "buttons";
      id: string;
      header?: string;
      body: string;
      footer?: string;
      /** Meta accepts at most three. */
      buttons: FlowChoice[];
    }
  | { kind: "text"; id: string; body: string };

/** Where a brand-new conversation starts. */
export const FLOW_ENTRY = "start";

const HOURS = "Monday to Saturday, 09:00 to 18:00 Pakistan time";

/**
 * Asking for company, person and outcome in one message is deliberate: those are
 * the three fields a lead row cannot be opened without (see the lead-generation
 * playbook, "Intake"), so one reply is enough to put the enquiry in the pipeline.
 * Bold labels rather than bare numbers because this arrives as the second message
 * in a row and needs to be skimmable, not read.
 */
const DETAILS_ASK =
  "Three lines, one message:\n\n" +
  "1. *Company* — name and website\n" +
  "2. *You* — name and role\n" +
  "3. *Outcome* — what you want to be different\n\n" +
  "A voice note is fine if that is quicker.";

export const DEFAULT_STEPS: FlowStep[] = [
  {
    kind: "list",
    id: "start",
    header: "Tauqeer Mustafa Inc",
    body:
      "Thanks for writing in.\n\n" +
      "Pick whichever line below is closest to why you are here and this goes to whoever handles it. " +
      "Nothing is lost if you pick the wrong one.",
    footer: "Mon to Sat, 09:00 to 18:00 Pakistan time",
    button: "Choose an option",
    sections: [
      {
        title: "Services",
        rows: [
          {
            id: "svc_security",
            title: "Cybersecurity",
            description: "Where customer and payment data is exposed",
            next: "security",
          },
          {
            id: "svc_compliance",
            title: "Financial compliance",
            description: "Controls, records and reporting",
            next: "compliance",
          },
          {
            id: "svc_seo",
            title: "SEO and AdSense",
            description: "Traffic and spend that is not producing enquiries",
            next: "seo",
          },
        ],
      },
      {
        title: "Something else",
        rows: [
          {
            id: "svc_client",
            title: "I am already a client",
            description: "Work in progress, delivery or billing",
            next: "client",
          },
          {
            id: "svc_careers",
            title: "Internship or a job",
            description: "Applying, and how the paid trial works",
            next: "careers",
          },
          {
            id: "svc_human",
            title: "Talk to someone",
            description: "Skip the questions",
            next: "human",
          },
        ],
      },
    ],
  },

  {
    kind: "buttons",
    id: "security",
    header: "Cybersecurity consulting",
    body:
      "We map how customer and payment data actually moves through your business, name what is exposed, " +
      "and hand back a fix list in priority order. Nothing in it is tooling you have to buy from us.\n\n" +
      "Which of these is closest?",
    footer: "One tap, then a few details",
    buttons: [
      { id: "sec_review", title: "Want a review", next: "details" },
      { id: "sec_incident", title: "Something happened", next: "urgent" },
      { id: "sec_talk", title: "Talk to someone", next: "human" },
    ],
  },

  {
    kind: "buttons",
    id: "compliance",
    header: "Financial compliance",
    body:
      "We put in place the controls, records and reporting a business your size is expected to have, " +
      "so that when an auditor, a bank or an investor asks, the answer is already written down.\n\n" +
      "Which of these is closest?",
    footer: "One tap, then a few details",
    buttons: [
      { id: "fin_controls", title: "Set up controls", next: "details" },
      { id: "fin_audit", title: "Audit is coming", next: "details" },
      { id: "fin_talk", title: "Talk to someone", next: "human" },
    ],
  },

  {
    kind: "buttons",
    id: "seo",
    header: "SEO and AdSense",
    body:
      "We start with the traffic you already have and the spend you already make, and report in enquiries " +
      "rather than impressions. If the figures say a campaign is not worth keeping, that is what the report says.\n\n" +
      "Which of these is closest?",
    footer: "One tap, then a few details",
    buttons: [
      { id: "seo_traffic", title: "Grow the traffic", next: "details" },
      { id: "seo_ads", title: "Fix the ad spend", next: "details" },
      { id: "seo_talk", title: "Talk to someone", next: "human" },
    ],
  },

  {
    kind: "buttons",
    id: "client",
    header: "Work in progress",
    body: "Good to hear from you. What do you need?",
    buttons: [
      { id: "cli_status", title: "Where work stands", next: "details" },
      { id: "cli_billing", title: "An invoice query", next: "details" },
      { id: "cli_talk", title: "Talk to someone", next: "human" },
    ],
  },

  {
    kind: "buttons",
    id: "careers",
    header: "Working with us",
    body:
      "Interns and staff both start on a paid trial engagement: a fixed period of real work, with the terms, " +
      "the targets and the pay written down before the first day.\n\n" +
      "What would you like to do?",
    buttons: [
      { id: "job_apply", title: "How to apply", next: "apply" },
      { id: "job_status", title: "Check my status", next: "details" },
      { id: "job_talk", title: "Talk to someone", next: "human" },
    ],
  },

  {
    kind: "text",
    id: "details",
    body: `Noted.\n\n${DETAILS_ASK}`,
  },

  {
    kind: "text",
    id: "urgent",
    body:
      "Flagged as urgent.\n\n" +
      "Send what you have, even if it is incomplete:\n\n" +
      "1. *What you are seeing*, and when it started\n" +
      "2. *What is affected* — and whether customer or payment data is involved\n" +
      "3. *A number* we can call you on\n\n" +
      "Keep the logs and alerts you already have. Do not wipe or rebuild anything before we have spoken, " +
      "unless something is still actively spreading.",
  },

  {
    kind: "text",
    id: "apply",
    body:
      "Send your CV as a PDF, with the role you are applying for and the city you are in. " +
      "Written work or a portfolio helps if you have any.\n\n" +
      "Every application is read, and gets an answer either way.",
  },

  {
    kind: "text",
    id: "human",
    body:
      `Of course.\n\nSomeone will pick this up here, ${HOURS}.\n\n` +
      "Send whatever you would like them to read first and it will be waiting.",
  },
];

export const STEPS: FlowStep[] = DEFAULT_STEPS;

const BY_ID = new Map(STEPS.map((s) => [s.id, s]));

/**
 * Every step, in the order written above. Exported so the admin composer can
 * offer the flow as a list of steps to send by hand, rather than repeating the
 * ids as string literals somewhere else and letting the two drift.
 */
export const FLOW_STEPS: readonly FlowStep[] = STEPS;

/** All choices, flattened, so a tap can be resolved without knowing its step. */
const CHOICES = new Map<string, FlowChoice>();
for (const step of STEPS) {
  const choices = step.kind === "list" ? step.sections.flatMap((s) => s.rows) : step.kind === "buttons" ? step.buttons : [];
  for (const c of choices) CHOICES.set(c.id, c);
}

export function flowStep(id?: string | null): FlowStep | null {
  return id ? BY_ID.get(id) ?? null : null;
}

/**
 * The step a tap leads to, or null if the id is not ours — an id from an older
 * revision of the flow, or a button sent by hand from the composer.
 */
export function resolveChoice(choiceId?: string | null): FlowStep | null {
  if (!choiceId) return null;
  const choice = CHOICES.get(choiceId);
  return choice ? flowStep(choice.next) : null;
}

/** True when this id belongs to the flow at all (used to skip keyword rules). */
export function isFlowChoice(choiceId?: string | null): boolean {
  return !!choiceId && CHOICES.has(choiceId);
}

// ─── Dynamic / Editable Flow (Backed by Upstash KV) ──────────────────────────

/**
 * Fetches current flow steps: returns customized steps if saved in KV,
 * or falls back to built-in DEFAULT_STEPS.
 */
export async function getFlowSteps(): Promise<FlowStep[]> {
  const kv = getKV();
  if (kv) {
    try {
      const custom = await kv.get<FlowStep[]>(KEYS.flow);
      if (Array.isArray(custom) && custom.length > 0) {
        return custom;
      }
    } catch (e) {
      console.error("[wa-flow] Failed to load custom flow from KV:", e);
    }
  }
  return [...DEFAULT_STEPS];
}

/** Saves customized flow steps into Upstash KV. */
export async function saveFlowSteps(steps: FlowStep[]): Promise<boolean> {
  const kv = getKV();
  if (!kv) return false;
  try {
    await kv.set(KEYS.flow, steps);
    return true;
  } catch (e) {
    console.error("[wa-flow] Failed to save custom flow to KV:", e);
    return false;
  }
}

/** Resets custom flow in Upstash KV back to built-in defaults. */
export async function resetFlowSteps(): Promise<boolean> {
  const kv = getKV();
  if (!kv) return false;
  try {
    await kv.del(KEYS.flow);
    return true;
  } catch (e) {
    console.error("[wa-flow] Failed to reset flow in KV:", e);
    return false;
  }
}

/** Fetches a single step by ID, honoring custom copy if stored in KV. */
export async function getEffectiveFlowStep(id?: string | null): Promise<FlowStep | null> {
  if (!id) return null;
  const steps = await getFlowSteps();
  return steps.find((s) => s.id === id) ?? flowStep(id);
}

/** Resolves the step a choice tap leads to, honoring custom copy if stored in KV. */
export async function resolveEffectiveChoice(choiceId?: string | null): Promise<FlowStep | null> {
  if (!choiceId) return null;
  const steps = await getFlowSteps();
  for (const step of steps) {
    const choices =
      step.kind === "list"
        ? step.sections.flatMap((s) => s.rows)
        : step.kind === "buttons"
        ? step.buttons
        : [];
    const choice = choices.find((c) => c.id === choiceId);
    if (choice) {
      return steps.find((s) => s.id === choice.next) ?? flowStep(choice.next);
    }
  }
  return resolveChoice(choiceId);
}

// ─── Rendering ───────────────────────────────────────────────────────────────

const cut = (s: string, n: number) => (s.length > n ? s.slice(0, n) : s);

/**
 * Graph payload for one step. Meta rejects the whole message on any overlong
 * field, so every limit is enforced here rather than trusted to the copy above.
 */
export function stepPayload(step: FlowStep, to: string): Record<string, unknown> {
  const base = { messaging_product: "whatsapp", to, recipient_type: "individual" };

  if (step.kind === "text") {
    return { ...base, type: "text", text: { body: cut(step.body, 4096), preview_url: false } };
  }

  const shell = {
    ...(step.header ? { header: { type: "text", text: cut(step.header, 60) } } : {}),
    body: { text: cut(step.body, 1024) },
    ...(step.footer ? { footer: { text: cut(step.footer, 60) } } : {}),
  };

  if (step.kind === "buttons") {
    return {
      ...base,
      type: "interactive",
      interactive: {
        type: "button",
        ...shell,
        action: {
          buttons: step.buttons.slice(0, 3).map((b) => ({
            type: "reply",
            reply: { id: b.id, title: cut(b.title, 20) },
          })),
        },
      },
    };
  }

  // A list may hold ten rows in total, across at most ten sections.
  let budget = 10;
  const sections = step.sections
    .map((sec) => {
      const rows = sec.rows.slice(0, Math.max(0, budget)).map((r) => ({
        id: r.id,
        title: cut(r.title, 24),
        ...(r.description ? { description: cut(r.description, 72) } : {}),
      }));
      budget -= rows.length;
      return { title: cut(sec.title, 24), rows };
    })
    .filter((s) => s.rows.length > 0);

  return {
    ...base,
    type: "interactive",
    interactive: {
      type: "list",
      ...shell,
      action: { button: cut(step.button, 20), sections },
    },
  };
}

/**
 * What the step looks like in the admin inbox. The interactive part of a message
 * is not readable back from Meta, so the choices are spelled out here — otherwise
 * an admin reading the thread sees a question with no visible options and cannot
 * tell what the customer was offered.
 */
export function stepTranscript(step: FlowStep): string {
  if (step.kind === "text") return step.body;

  const choices =
    step.kind === "buttons"
      ? step.buttons.map((b) => `- ${b.title}`)
      : step.sections.flatMap((s) => s.rows.map((r) => `- ${r.title}`));

  return [step.header, step.body, step.footer, `[${step.kind === "list" ? step.button : "Buttons"}]`, ...choices]
    .filter(Boolean)
    .join("\n");
}
