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
 * NO EMOJIS. The copy is what a consultancy selling security, compliance and
 * paid-search work would actually write; decorative characters read as noise on a
 * business number and several of them render as boxes on older Androids.
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
 */
const DETAILS_ASK =
  "Send these three lines in one message and the right person picks it up from there:\n\n" +
  "1. Company name and website\n" +
  "2. Your name and role\n" +
  "3. The outcome you want, in your own words\n\n" +
  "A voice note works just as well if it is quicker.";

const STEPS: FlowStep[] = [
  {
    kind: "list",
    id: "start",
    header: "Tauqeer Mustafa Inc",
    body:
      "Thanks for writing in. So this reaches the right person first time, tell me what it is about.\n\n" +
      "We work in three areas: cybersecurity consulting, financial compliance, and SEO and AdSense management. " +
      "If none of those is why you are here, there are options for that too.",
    footer: "A person reads every reply",
    button: "Choose an option",
    sections: [
      {
        title: "Services",
        rows: [
          {
            id: "svc_security",
            title: "Cybersecurity",
            description: "Customer or payment data with nobody accountable for it",
            next: "security",
          },
          {
            id: "svc_compliance",
            title: "Financial compliance",
            description: "Records and controls outgrowing informal bookkeeping",
            next: "compliance",
          },
          {
            id: "svc_seo",
            title: "SEO and AdSense",
            description: "Traffic or ad spend that is not turning into enquiries",
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
            description: "Status, delivery or billing on work in progress",
            next: "client",
          },
          {
            id: "svc_careers",
            title: "Internship or a job",
            description: "Applications, the trial programme, and what it pays",
            next: "careers",
          },
          {
            id: "svc_human",
            title: "Just talk to someone",
            description: "Skip the questions and reach a person",
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
      "We look at how customer and payment data actually moves through your business, name what is exposed, " +
      "and hand back a fix list in the order that reduces risk fastest. No tooling you have to buy from us.\n\n" +
      "Which of these is closest to where you are?",
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
      "We put the controls, records and reporting in place that a growing business is expected to have, " +
      "so an audit, a bank or an investor asking questions is routine rather than a scramble.\n\n" +
      "Which of these is closest to where you are?",
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
      "We work with the traffic you already have and the spend you already make, and report on enquiries " +
      "rather than impressions. If the numbers say the spend is not worth keeping, we say that.\n\n" +
      "Which of these is closest to where you are?",
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
    header: "Existing work",
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
      "We take on interns and staff through a paid trial engagement: a fixed trial period on real work, " +
      "with the terms, targets and what it pays written down before you start.\n\n" +
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
    body: `Noted, thank you.\n\n${DETAILS_ASK}`,
  },

  {
    kind: "text",
    id: "urgent",
    body:
      "Understood. This is flagged as urgent and will be picked up ahead of everything else in this inbox.\n\n" +
      "Send what you can now, even if it is incomplete:\n\n" +
      "1. What you are seeing, and when you first noticed it\n" +
      "2. What is affected, and whether customer or payment data is involved\n" +
      "3. A number to call you on\n\n" +
      "Keep any logs and alerts you already have. Do not wipe or rebuild anything before we have spoken, " +
      "unless something is still actively spreading.",
  },

  {
    kind: "text",
    id: "apply",
    body:
      "Send your CV here as a PDF, along with the role you are applying for and the city you are in. " +
      "Written work or a portfolio helps if you have any.\n\n" +
      "Applications are read in order and you get an answer either way. " +
      `Shortlisted candidates are called within a week, ${HOURS}.`,
  },

  {
    kind: "text",
    id: "human",
    body:
      `Of course. A person will reply here, ${HOURS}.\n\n` +
      "Send whatever you would like them to read first and it will be waiting for them.",
  },
];

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
