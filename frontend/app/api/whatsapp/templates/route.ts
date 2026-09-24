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
 * cybersecurity consulting, cloud systems, web platforms, and AI automation.
 * Square brackets mark what the sender fills in before sending.
 */
const DEFAULT_TEMPLATES = [
  {
    name: "qualify_new_lead",
    text: "Welcome to Tauqeer Mustafa Inc.\n\nTo connect you with the appropriate technical practice, please share three details in one message:\n\n1. Company name and primary website\n2. Your name and role\n3. The core objective or milestone you need engineered\n\nA text or voice brief works equally well. Our technical leads review every submission.",
  },
  {
    name: "web_platform_scope",
    text: "Here is an overview of our Web & Cloud Platform practice.\n\nWe engineer modern cloud-native web portals, SaaS platforms, and high-throughput API microservices with robust security, automated testing, and CI/CD.\n\nTo prepare a technical architecture proposal, please share:\n• Target user personas and scale\n• Key integrations and existing database tech stack\n• Desired launch window or MVP milestone",
  },
  {
    name: "security_review_scope",
    text: "Here is what our Cybersecurity Assessment covers.\n\nWe map your end-to-end data and transaction flows, identify vulnerabilities and misconfigurations across your perimeter, and provide an actionable, prioritized remediation matrix with direct remediation guidance.\n\nTo scope this engagement: roughly how many users/endpoints are in scope, whether customer or financial data is stored, and any specific compliance standards required (e.g. SOC 2, ISO 27001).",
  },
  {
    name: "ai_automation_scope",
    text: "Here is what our AI & Automation practice covers.\n\nWe architect and deploy production-grade AI systems: autonomous agent workflows, enterprise RAG knowledge search, and custom copilots integrated directly into your production databases and tools.\n\nTo scope your AI initiative: what repetitive workflow or data repository are you looking to automate, and what existing software tools need to be connected?",
  },
  {
    name: "cloud_devops_scope",
    text: "Here is what our Cloud Architecture & DevOps practice covers.\n\nWe design, migrate, and optimize resilient multi-cloud infrastructure on AWS, GCP, and Azure. Deliverables include Kubernetes cluster orchestration, Terraform IaC, automated zero-downtime deployment pipelines, and observability telemetry.\n\nTo scope your infrastructure: what cloud provider do you currently use, and what is your target uptime or scaling requirement?",
  },
  {
    name: "proposal_sent",
    text: "Your engineering proposal for [SCOPE] has been sent to [EMAIL].\n\nIt sets out technical architecture, phased milestones, deliverables schedule, and a fixed investment price. Scope is defined clearly with no hidden fees.\n\nOur principal engineers are standing by if you would like to schedule an architecture walkthrough call.",
  },
  {
    name: "follow_up",
    text: "Following up regarding [SUBJECT].\n\nIf you are ready to proceed with your engineering milestones, we can confirm resource availability and kickoff dates. If your timeline has shifted, no problem at all — let us know when it makes sense to reconnect.",
  },
  {
    name: "meeting_confirmed",
    text: "Technical Discovery Call confirmed for [DATE] at [TIME] Pakistan time.\n\nMeeting link: [LINK]\n\nAgenda:\n1. Technical scope, current architecture, and constraints\n2. Proposed solution approach and milestone roadmap\n3. Budget, timeline, and deliverables\n\nIf your schedule changes, simply reply here and we will coordinate an alternative time.",
  },
  {
    name: "careers_reply",
    text: "Thank you for your interest in joining Tauqeer Mustafa Inc.\n\nOur engineering leadership evaluates all applications directly. Please provide:\n1. Your name, city, and primary role/focus\n2. Your CV / resume (PDF format)\n3. A link to your GitHub profile, portfolio, or a complex system you built\n\nWe will review your background and respond directly.",
  },
  {
    name: "payment_due",
    text: "Milestone invoice [INVOICE_NUMBER] for [MILESTONE] is due for settlement on [DATE].\n\nBanking details and payment wire instructions are attached to the invoice sent to [EMAIL].\n\nIf you have any questions or require vendor onboarding paperwork, reply directly to this thread.",
  },
  {
    name: "engagement_complete",
    text: "Production handover for [ENGAGEMENT] is complete.\n\nDelivered artifacts: [DELIVERABLES]. All code repositories, infrastructure configurations, and architectural documentation have been transferred to your team.\n\nYour 30-day post-launch warranty and hypercare period is now active. Thank you for your partnership.",
  },
  {
    name: "hours",
    text: "Operating hours: Monday to Saturday, 09:00 to 18:00 Pakistan time (PKT).\n\nInquiries received outside business hours are prioritized on the next business morning.\n\nFor critical outages or active security incidents, reply 'urgent' to alert our on-call response team.",
  },
  {
    name: "not_a_fit",
    text: "Thank you for sharing your project specifications. After technical review, we have determined that this specific requirement falls outside our core architectural focus: [REASON].\n\nWe commit exclusively to engagements where our team can deliver exceptional, world-class execution.\n\nIf you would like a referral to a vetted specialist in this domain, we are happy to introduce you.",
  },
];

/**
 * Bumped when the shipped templates above change in a way a running deployment
 * should pick up. See `currentTemplates` for what "should" means here.
 */
const TEMPLATES_VERSION = 4;

/** Every template name this file has ever seeded, for the upgrade check below. */
const SHIPPED_NAMES = new Set([
  ...DEFAULT_TEMPLATES.map((t) => t.name),
  "compliance_review_scope",
  "seo_audit_scope",
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
 * key below existed.
 */
const SEED_TELLS: RegExp[] = [
  /[\u{1F000}-\u{1FAFF}\u{2190}-\u{2BFF}\u{FE0F}\u{2600}-\u{27BF}]/u,
  /financial compliance/i,
  /SEO and AdSense/i,
  /controls, records and reporting/i,
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

