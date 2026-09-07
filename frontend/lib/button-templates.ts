/**
 * Presets for the admin composer's interactive-button message.
 *
 * WHAT THESE ARE
 * ──────────────
 * Not automation. A person picks one from a dropdown in the Send tab, it loads
 * the header, body, footer and up to three button titles into the form, and they
 * edit it before it goes anywhere. So the copy here has to be worth sending
 * as-is, and has to be honest about what the business will actually do.
 *
 * WHAT WAS WRONG WITH THE SET THIS REPLACES
 * ─────────────────────────────────────────
 * It described a web and mobile app studio, which is the wrong business
 * entirely, in emoji-covered copy. It quoted prices nobody charges ("Mobile Apps
 * - From $5,000"), invented a reputation ("Trusted by 100+ clients worldwide"),
 * and promised reply times no one had agreed to keep ("within 2-4 hours", "High
 * Priority: 2-4 hours"). Every line of that would have had to be walked back by
 * whoever pressed send.
 *
 * HOUSE RULES — the same three as lib/wa-flow and the auto-reply rules
 * ───────────────────────────────────────────────────────────────────
 * 1. No emojis. Decorative characters read as noise on a business number, and
 *    several still render as boxes on older Androids.
 * 2. No prices. What the work costs depends on scope. A number sent from a
 *    preset is one somebody then has to argue their way out of.
 * 3. No promise a person has to keep. Working hours are a fact and can be
 *    stated. A reply time is a guess, and a missed one costs more than the vague
 *    version was ever worth. Describe the work; do not rank it.
 *
 * FORMATTING AND LIMITS
 * ─────────────────────
 * Meta rejects the whole message on any overlong field: header 60, footer 60,
 * body 1024, button title 20, at most three buttons. `*bold*` renders in the
 * body; it does NOT render in button titles or in the header (which WhatsApp
 * bolds by itself), so those stay plain.
 *
 * `header` doubles as the label in the composer's dropdown, which is why each
 * one reads as a description of the situation rather than a slogan.
 *
 * [SQUARE_BRACKETS] mark the one or two things the sender fills in.
 */

export type ButtonTemplate = {
  /** Stable key for the composer's <select>. Never shown to the contact. */
  name: string;
  /** Bolded by WhatsApp above the body. Also the dropdown label. Max 60. */
  header: string;
  /** Max 1024. `*bold*` renders here. */
  body: string;
  /** Max 60, plain text. Required so the composer always has something to load. */
  footer: string;
  /** Meta accepts three; the composer takes the first three. Max 20 each. */
  buttons: string[];
};

export const BUTTON_TEMPLATES: ButtonTemplate[] = [
  {
    name: "route_enquiry",
    header: "Which service is this about",
    body:
      "Thanks for writing in.\n\n" +
      "So this reaches whoever handles it, which of the three is closest?\n\n" +
      "1. *Cybersecurity* — where customer and payment data is exposed\n" +
      "2. *Financial compliance* — controls, records and reporting\n" +
      "3. *SEO and AdSense* — traffic and spend that is not producing enquiries\n\n" +
      "Nothing is lost if you pick the wrong one.",
    footer: "Mon to Sat, 09:00 to 18:00 Pakistan time",
    buttons: ["Cybersecurity", "Compliance", "SEO and AdSense"],
  },
  {
    name: "security_review_start",
    header: "Cybersecurity review",
    body:
      "We map how customer and payment data actually moves through your business, name what is " +
      "exposed, and hand back a fix list in priority order. Nothing in it is tooling you have to " +
      "buy from us.\n\n" +
      "Which of these is closest?",
    footer: "One tap, then a few details",
    buttons: ["Want a review", "Something happened", "Talk to someone"],
  },
  {
    name: "compliance_start",
    header: "Financial compliance",
    body:
      "We put in place the controls, records and reporting a business your size is expected to " +
      "have, so that when an auditor, a bank or an investor asks, the answer is already written " +
      "down.\n\n" +
      "Which of these is closest?",
    footer: "One tap, then a few details",
    buttons: ["Set up controls", "Audit is coming", "Talk to someone"],
  },
  {
    name: "seo_start",
    header: "SEO and AdSense",
    body:
      "We start with the traffic you already have and the spend you already make, and report in " +
      "enquiries rather than impressions. If the figures say a campaign is not worth keeping, that " +
      "is what the report says.\n\n" +
      "Which of these is closest?",
    footer: "One tap, then a few details",
    buttons: ["Grow the traffic", "Fix the ad spend", "Talk to someone"],
  },
  {
    name: "details_needed",
    header: "A few details",
    body:
      "To put this in front of the right person, three lines in one message:\n\n" +
      "1. *Company* — name and website\n" +
      "2. *You* — name and role\n" +
      "3. *Outcome* — what you want to be different\n\n" +
      "A voice note is fine if that is quicker.",
    footer: "Send it whenever suits you",
    buttons: ["Sending now", "Rather have a call", "Talk to someone"],
  },
  {
    name: "arrange_call",
    header: "Arrange a call",
    body:
      "Happy to talk it through.\n\n" +
      "Send a number to ring and *two times* that work for you, and we will confirm one of them.\n\n" +
      "There is nothing to prepare. We will ask what you want to be different, and say plainly " +
      "whether we are the right people for it.",
    footer: "Mon to Sat, 09:00 to 18:00 Pakistan time",
    buttons: ["Send my times", "Call me instead", "Keep it on chat"],
  },
  {
    name: "proposal_sent",
    header: "Your proposal",
    body:
      "The proposal for *[SCOPE]* has been sent to [EMAIL].\n\n" +
      "It sets out what is included, what is not, the order the work runs in, and a fixed price.\n\n" +
      "Read it and come back with anything that looks wrong. Scope is easier to change now than " +
      "halfway through.",
    footer: "Valid for 30 days",
    buttons: ["I have questions", "Happy to proceed", "Send it again"],
  },
  {
    name: "invoice_due",
    header: "An invoice is due",
    body:
      "Invoice *[NUMBER]* is due on *[DATE]*.\n\n" +
      "The amount and the payment details are on the invoice itself.\n\n" +
      "If anything on it does not match what we agreed, say so and we will reissue it rather than " +
      "leave it to be argued about later.",
    footer: "Bank transfer or card",
    buttons: ["Paid already", "Send the invoice", "Question on it"],
  },
  {
    name: "work_complete",
    header: "Work is complete",
    body:
      "*[SCOPE]* is finished and handed over.\n\n" +
      "What you have now: [DELIVERABLES].\n\n" +
      "Have a look and tell us what needs another pass. Changes inside the agreed scope are part " +
      "of the job, not a new one.",
    footer: "Support runs for 30 days",
    buttons: ["Looks right", "Needs a change", "Question on it"],
  },
  {
    name: "careers_reply",
    header: "Working with us",
    body:
      "Interns and staff both start on a paid trial engagement: a fixed period of real work, with " +
      "the terms, the targets and the pay written down before the first day.\n\n" +
      "To apply, send:\n\n" +
      "1. *Your CV* as a PDF\n" +
      "2. *The role* you are applying for\n" +
      "3. *The city* you are in\n\n" +
      "Written work or a portfolio helps if you have any.",
    footer: "Every application gets an answer",
    buttons: ["Sending my CV", "Ask about a role", "Talk to someone"],
  },
  {
    name: "not_a_fit",
    header: "Not the right fit",
    body:
      "Thanks for the detail. This is not work we should take on: [REASON]\n\n" +
      "We would rather say so now than bill you to find out.\n\n" +
      "If the scope changes, or you want the name of someone who does this properly, ask and we " +
      "will send one.",
    footer: "The door stays open",
    buttons: ["Suggest someone", "Different project", "Understood"],
  },
];
