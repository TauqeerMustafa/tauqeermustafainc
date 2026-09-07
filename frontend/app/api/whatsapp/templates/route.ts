/**
 * GET    /api/whatsapp/templates
 * POST   /api/whatsapp/templates
 * DELETE /api/whatsapp/templates
 * Saved message templates (Upstash Redis when configured, otherwise defaults)
 */
import { NextResponse } from "next/server";
import { getKV, checkKVConfigured, KEYS } from "@/lib/kv";

/**
 * Canned messages an admin sends by hand from the inbox.
 *
 * House rules for this copy: no emojis, no invented prices, and no promise the
 * business does not keep. They are about the three things we actually sell —
 * cybersecurity consulting, financial compliance, and SEO and AdSense management
 * — not the web-and-app-studio wording that used to sit here. Square brackets
 * mark what the sender fills in before sending.
 */
const DEFAULT_TEMPLATES = [
  {
    name: "qualify_new_lead",
    text: "Thanks for getting in touch.\n\nSo this reaches the right person first time, send these three lines in one message:\n\n1. Company name and website\n2. Your name and role\n3. The outcome you want, in your own words\n\nA voice note is fine if it is quicker. Once I have those I will come back with what the work would involve.",
  },
  {
    name: "security_review_scope",
    text: "Here is what a security review covers.\n\nWe map how customer and payment data actually moves through your business, find where it is exposed, and hand back a fix list in priority order. You get a written report and a walkthrough call. There is no tooling to buy from us.\n\nTo scope it I need: roughly how many staff handle customer data, whether you take payments online, and who owns IT decisions.\n\nTypical review runs [DURATION] once we start.",
  },
  {
    name: "compliance_review_scope",
    text: "Here is what the compliance work covers.\n\nWe put the controls, records and reporting in place that a business your size is expected to have, so that when an auditor, a bank or an investor asks, the answer is already written down. You get the control set written down, the gaps named, and a plan with dates.\n\nTo scope it I need: your financial year end, who keeps the books today, and whether any audit or filing deadline is already fixed.",
  },
  {
    name: "seo_audit_scope",
    text: "Here is what the SEO and AdSense work covers.\n\nWe start with the traffic you already have and the spend you already make. You get a written audit that names what is worth keeping, what to stop, and what to fix first, then monthly management reported in enquiries rather than impressions.\n\nTo scope it I need: your website, read access to Analytics and Search Console, and your current monthly ad spend if any.\n\nIf the numbers say the spend is not worth keeping, we will say so.",
  },
  {
    name: "proposal_sent",
    text: "Your proposal is sent.\n\nIt is with [EMAIL] and covers scope, what you get, the price, and the dates. Please check the spam folder if it is not in the inbox.\n\nThe price holds for [VALIDITY]. If anything in the scope reads wrong, say which line and I will redo it rather than argue it.\n\nHappy to walk through it on a call if that is easier.",
  },
  {
    name: "follow_up",
    text: "Following up on [SUBJECT].\n\nIs this still something you want to move on? A yes or a no both help me plan.\n\nIf it is a matter of timing, tell me the month that works and I will come back to you then instead of chasing.",
  },
  {
    name: "meeting_confirmed",
    text: "Call confirmed for [DATE] at [TIME] Pakistan time.\n\nJoining link: [LINK]\n\nWhat we will get through:\n\n1. Where you are now and what is going wrong\n2. What the work would cover, and what it would not\n3. Dates and price\n\nIf something comes up, send a message here and we will move it. No need to apologise for it.",
  },
  {
    name: "careers_reply",
    text: "Thanks for applying.\n\nApplications are read here, not by a filter. Send these in one message and it goes into the queue properly:\n\n1. Your name, city, and the role you are after\n2. Your CV as a PDF\n3. One thing you have built, fixed or written, and what your part in it was\n\nWe take interns and paid staff. The written terms for both are on the site.\n\nYou will hear back either way.",
  },
  {
    name: "payment_due",
    text: "Invoice [INVOICE_NUMBER] for [PERIOD] is now due.\n\nAmount and payment details are on the invoice sent to [EMAIL]. Due date is [DATE].\n\nIf a date further out works better for your cash flow, say so and we will set one rather than send reminders.\n\nWork carries on as normal in the meantime.",
  },
  {
    name: "engagement_complete",
    text: "That completes the work on [ENGAGEMENT].\n\nWhat you now have: [DELIVERABLES]. Everything is written down so it does not live in one person's head.\n\nWe are on hand for questions on it until [SUPPORT_UNTIL]. After that, ongoing work is a separate arrangement, and only worth it if there is something to do.\n\nIf the results were useful, a written line about it helps us more than anything else. Either way, thank you for the work.",
  },
  {
    name: "hours",
    text: "Monday to Saturday, 09:00 to 18:00 Pakistan time. Sunday is closed.\n\nAnything sent outside those hours waits until the next working day.\n\nIf it cannot wait, send the word urgent and it is flagged in this inbox.",
  },
  {
    name: "not_a_fit",
    text: "Having read what you sent, this is not work we should take on.\n\n[REASON]\n\nRather than stretch to fit it, here is what I would do in your position: [SUGGESTION]\n\nIf the situation changes, or another piece of it comes up, write here and I will look again.",
  },
];

/**
 * Bumped when the shipped templates above change in a way a running deployment
 * should pick up. See `currentTemplates` for what "should" means here.
 */
const TEMPLATES_VERSION = 3;

/** Every template name this file has ever seeded, for the upgrade check below. */
const SHIPPED_NAMES = new Set([
  ...DEFAULT_TEMPLATES.map((t) => t.name),
  // The first seed: emoji-covered copy for a web-and-app studio we are not.
  "welcome_new_lead",
  "quote_sent",
  "project_started",
  "payment_reminder",
  "milestone_complete",
  "project_delivered",
  "meeting_reminder",
  "out_of_office",
  "thank_you",
  "support_ticket",
]);

/**
 * Marks only a seeded set carries, for deployments seeded before the fingerprint
 * key below existed. The emoji pattern catches the first seed; the phrases catch
 * the second, which had no emojis at all — which is exactly why an emoji-only
 * check could never fire on a v2 to v3 bump, and why the stored copy would have
 * stayed stale.
 */
const SEED_TELLS: RegExp[] = [
  /[\u{1F000}-\u{1FAFF}\u{2190}-\u{2BFF}\u{FE0F}\u{2600}-\u{27BF}]/u,
  /in the order that reduces risk fastest/i,
  /routine rather than a scramble/i,
  /usually answered within a few hours/i,
];

/** One canned message. `name` is the key an admin picks it by in the inbox. */
type Template = { name: string; text: string };

type KVClient = NonNullable<ReturnType<typeof getKV>>;

/**
 * Field-by-field print of a template set, so "unchanged" is an exact comparison
 * rather than a guess about the copy. JSON because it quotes each field: a text
 * that happens to contain the separator cannot make two different sets match.
 */
function templatesPrint(templates: Template[]): string {
  return JSON.stringify((templates ?? []).map((t) => [t?.name, t?.text]));
}

/**
 * Wrapped in an object on purpose. Upstash stores a string argument as-is but
 * runs JSON.parse on every read, so a bare print string would come back as a
 * parsed ARRAY and never match the string compared against it — leaving this
 * check permanently "mismatched" and useless. An object round-trips as an object.
 * Same reasoning as `SeedPrint` in lib/wa-store.
 */
type SeedPrint = { print?: string };

/** Write the shipped set and record exactly what was written. */
async function seedTemplates(kv: KVClient): Promise<Template[]> {
  await kv.set(KEYS.templates, DEFAULT_TEMPLATES);
  await kv.set(KEYS.templatesVersion, TEMPLATES_VERSION);
  await kv.set(KEYS.templatesSeed, { print: templatesPrint(DEFAULT_TEMPLATES) } satisfies SeedPrint);
  return DEFAULT_TEMPLATES;
}

/**
 * True when the stored set is still the one this file seeded, and so is safe to
 * replace. POST and DELETE drop the fingerprint, so an admin's own save can never
 * look untouched here.
 */
async function isUntouchedSeed(kv: KVClient, stored: Template[]): Promise<boolean> {
  const print = (await kv.get<SeedPrint>(KEYS.templatesSeed))?.print;
  if (print) return templatesPrint(stored) === print;

  return (
    stored.every((t) => SHIPPED_NAMES.has(t?.name)) &&
    stored.some((t) => SEED_TELLS.some((tell) => tell.test(String(t?.text ?? ""))))
  );
}

/**
 * Templates as stored, seeding on first read and upgrading a set nobody edited.
 *
 * A running deployment already holds an earlier seed in KV, so rewriting the
 * array above would not reach it on its own. Replacing it blindly would throw
 * away an admin's own wording, so the swap happens only when the stored set is
 * provably the untouched seed — see `isUntouchedSeed`.
 */
async function currentTemplates(): Promise<Template[]> {
  const kv = getKV()!;
  const stored = await kv.get<Template[]>(KEYS.templates);
  if (!stored || stored.length === 0) return seedTemplates(kv);

  const version = Number((await kv.get<number>(KEYS.templatesVersion)) ?? 1);
  if (version >= TEMPLATES_VERSION) return stored;

  if (await isUntouchedSeed(kv, stored)) {
    console.log("[templates] Replaced the unedited default templates with the current set.");
    return seedTemplates(kv);
  }

  // Edited by hand — keep it, and stop re-checking on every read.
  await kv.set(KEYS.templatesVersion, TEMPLATES_VERSION);
  return stored;
}

export async function GET() {
  try {
    if (!checkKVConfigured()) {
      return NextResponse.json({
        success: true,
        data: DEFAULT_TEMPLATES,
        notice: "Using default templates — KV not configured",
      });
    }

    return NextResponse.json({
      success: true,
      data: await currentTemplates(),
    });
  } catch (error) {
    console.error("[templates] GET error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to load templates", detail: String(error) },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, text } = body;

    if (!name || !text) {
      return NextResponse.json(
        { success: false, error: "Name and text required" },
        { status: 400 }
      );
    }

    if (!checkKVConfigured()) {
      return NextResponse.json({
        success: true,
        notice: "KV not configured — template not persisted",
      });
    }

    const templates = (await getKV()!.get<Template[]>(KEYS.templates)) || [];

    // Check if template exists, update or add
    const existingIndex = templates.findIndex((t) => t.name === name);
    if (existingIndex >= 0) {
      templates[existingIndex] = { name, text };
    } else {
      templates.push({ name, text });
    }

    await getKV()!.set(KEYS.templates, templates);
    // The admin's own set is current by definition; never upgrade over it later.
    await getKV()!.set(KEYS.templatesVersion, TEMPLATES_VERSION);
    await getKV()!.del(KEYS.templatesSeed);
    return NextResponse.json({
      success: true,
      message: "Template saved successfully",
    });
  } catch (error) {
    console.error("[templates] POST error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to save template", detail: String(error) },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const name = searchParams.get("name");

    if (!name) {
      return NextResponse.json(
        { success: false, error: "Template name required" },
        { status: 400 }
      );
    }

    if (!checkKVConfigured()) {
      return NextResponse.json({
        success: true,
        notice: "KV not configured — template not deleted",
      });
    }

    const templates = (await getKV()!.get<Template[]>(KEYS.templates)) || [];
    const filtered = templates.filter((t) => t.name !== name);

    await getKV()!.set(KEYS.templates, filtered);
    // A deletion is an edit: stamp the version and drop the seed fingerprint so
    // the upgrade path never puts the removed template back.
    await getKV()!.set(KEYS.templatesVersion, TEMPLATES_VERSION);
    await getKV()!.del(KEYS.templatesSeed);
    return NextResponse.json({
      success: true,
      message: "Template deleted successfully",
    });
  } catch (error) {
    console.error("[templates] DELETE error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete template", detail: String(error) },
      { status: 500 }
    );
  }
}

