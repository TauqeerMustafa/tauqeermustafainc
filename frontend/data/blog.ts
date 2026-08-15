export type BodyBlock =
  | { type: "p"; text: string }
  | { type: "h2"; text: string }
  | { type: "h3"; text: string }
  | { type: "quote"; text: string; attribution?: string }
  | { type: "img"; src: string; alt: string; caption?: string };

export type BlogPost = {
  slug: string;
  title: string;
  category: string;
  date: string;
  excerpt: string;
  coverImage: string;
  coverAlt: string;
  tags: string[];
  body: BodyBlock[];
};

export const blogPosts: BlogPost[] = [
  {
    slug: "planning-secure-web-platforms",
    title: "How Enterprise Teams Should Plan Secure Web Platforms",
    category: "Engineering",
    date: "August 1, 2026",
    excerpt:
      "A practical framework for aligning architecture, access control, performance, and long-term maintainability before development begins.",
    coverImage:
      "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1600&q=80",
    coverAlt: "Server infrastructure and network cables",
    tags: ["Architecture", "Security", "Web Platforms", "Engineering"],
    body: [
      {
        type: "p",
        text: "Secure web platforms start with a question most teams skip: who owns this system once it's live, and what does responsible operation actually look like day to day? Skipping that conversation is the single most common reason platforms end up secure on paper but fragile in production. Teams default to technology choices — framework debates, database engines, hosting providers — without first settling ownership, boundaries, and operational expectations.",
      },
      {
        type: "h2",
        text: "Start with ownership, not architecture",
      },
      {
        type: "p",
        text: "Before any diagram gets drawn, the team needs clear answers to three questions: which service owns which data, who is accountable for each system component in production, and what the deployment cadence will realistically be. These aren't process formalities. A platform that deploys once a week behaves very differently from one that deploys twenty times a day, and the tooling, testing discipline, and rollback strategy need to match the cadence the team actually intends to run — not the aspirational version that looks good in a planning doc.",
      },
      {
        type: "h2",
        text: "Define data boundaries before writing code",
      },
      {
        type: "p",
        text: "Data boundaries mean knowing precisely which service owns which data, and which services are merely consumers through a defined interface. When this isn't explicit, engineers default to the path of least resistance: a service reaches directly into another service's database because it's faster than building a proper API. Within a year, nobody can safely change a schema without breaking three unrelated features. Authentication in particular tends to get bolted on as an afterthought — implemented differently in three services because there was never a single decision point. The fix, centralizing identity behind one well-tested service, is straightforward to design on a whiteboard and genuinely painful to retrofit once five endpoints have grown their own bespoke session handling.",
      },
      {
        type: "img",
        src: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1400&q=80",
        alt: "System architecture diagram on a monitor",
        caption: "Explicit service boundaries are the foundation of a maintainable platform.",
      },
      {
        type: "h2",
        text: "Performance is a design input, not an afterthought",
      },
      {
        type: "p",
        text: "Caching strategy, database indexing, and API contracts all shape how a system behaves under real load. It's tempting to treat performance as a problem to solve later — once the product has traction. But by then the API contracts are public, other teams depend on them, and even minor changes require coordinated migrations. A platform designed with pagination, rate limits, and cache headers from day one rarely needs a painful performance rewrite eighteen months in. One that wasn't usually does, right around the time the business can least afford the distraction.",
      },
      {
        type: "quote",
        text: "The strongest plans connect technical constraints to business outcomes so every delivery decision has a clear reason, and every stakeholder understands the tradeoffs being made on their behalf.",
      },
      {
        type: "h2",
        text: "Document decisions while they're still reversible",
      },
      {
        type: "p",
        text: "One practical way to maintain discipline is to write a short architecture decision record for each major choice — a paragraph explaining what was decided, what alternatives were considered, and what would have to change for the decision to be revisited. Six months into a project, when a new engineer asks why authentication lives where it does, the answer shouldn't depend on someone's memory of a conversation that happened in a meeting nobody wrote down. A small, consistently maintained set of decision records turns tribal knowledge into something the whole team can reference, which matters enormously as a platform outlives its original founding engineers.",
      },
      {
        type: "img",
        src: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1400&q=80",
        alt: "Engineers reviewing system design documentation",
        caption: "Architecture decisions recorded early save significant rework later.",
      },
      {
        type: "p",
        text: "None of this requires exotic technology or an unusually large team. It requires discipline about sequencing: settle ownership and boundaries first, let architecture follow from those boundaries, and treat performance and security as design inputs rather than final checklist items. Teams that internalize this sequence spend less time firefighting a year into a platform's life, because most of what would have become an incident was caught on a whiteboard instead of in a postmortem.",
      },
    ],
  },
  {
    slug: "incident-response-tabletop-exercises",
    title: "Why Most Incident Response Plans Fail Their First Real Test",
    category: "Cybersecurity",
    date: "July 18, 2026",
    excerpt:
      "Tabletop exercises expose the gap between a documented playbook and a team's actual ability to respond under pressure.",
    coverImage:
      "https://images.unsplash.com/photo-1563986768494-4dee2763ff3f?auto=format&fit=crop&w=1600&q=80",
    coverAlt: "Security operations center with monitors",
    tags: ["Incident Response", "Cybersecurity", "Risk Management", "Operations"],
    body: [
      {
        type: "p",
        text: "Most incident response plans read well on paper and fall apart the moment a real decision has to be made under time pressure. The document itself is rarely the problem — most teams can produce a competent-looking playbook with severity tiers, escalation paths, and communication templates. The problem is that a document has never been tested against the specific, awkward realities of an actual incident: the one engineer who knows the legacy billing system is on vacation, the on-call phone number in the runbook is two jobs out of date, or the process for taking a system offline assumes an authority structure that quietly changed six months ago.",
      },
      {
        type: "h2",
        text: "What tabletop exercises actually expose",
      },
      {
        type: "p",
        text: "A tabletop exercise forces the plan to answer specific questions: who has authority to take a system offline, who talks to customers, and how fast can logs actually be pulled. These aren't abstract questions when you're running a live simulation. Someone has to actually attempt to pull the logs — and if that turns out to require access nobody currently has, or a query that takes forty minutes to run against an unindexed table, that's a real finding, not a hypothetical one. The value comes specifically from forcing people to attempt the mechanics of response, not just discuss them in the abstract.",
      },
      {
        type: "img",
        src: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1400&q=80",
        alt: "Team in a war room during a security exercise",
        caption: "Simulated incidents reveal the gaps that real pressure exposes.",
      },
      {
        type: "h2",
        text: "The uncomfortable scenarios are the valuable ones",
      },
      {
        type: "p",
        text: "The exercises that produce the most value are the uncomfortable ones — where a key person is unreachable or a critical system has no clear owner listed anywhere. It's tempting to run a tabletop where everyone who matters is present and cooperative, because it feels productive. But that version teaches the team very little, because real incidents rarely happen when everyone is conveniently available. A better exercise deliberately removes the most senior or most knowledgeable person from the room partway through and asks: what happens now?",
      },
      {
        type: "quote",
        text: "Real incidents rarely happen when everyone is conveniently available. The person who knows the system is on vacation. The escalation contact changed jobs. The backup restore has never been tested end to end.",
      },
      {
        type: "h2",
        text: "The gaps that almost always surface",
      },
      {
        type: "p",
        text: "Teams consistently discover that escalation contact lists are outdated, communication templates don't exist, and backup restore processes have never been tested end to end. Escalation contact lists rot quietly — updating them isn't anyone's explicit job, and nothing forces the update until an incident happens and the list fails. Communication templates suffer a similar fate: everyone assumes someone else drafted the customer-facing status page language. Backup restores are the most dangerous gap of all. A backup that has never been restored is not actually a backup — it's an assumption, and assumptions are exactly what a tabletop exercise is designed to surface.",
      },
      {
        type: "img",
        src: "https://images.unsplash.com/photo-1614064641938-3bbee52942c7?auto=format&fit=crop&w=1400&q=80",
        alt: "Cybersecurity monitoring dashboard",
        caption: "Monitoring visibility is only useful if the team knows how to act on what it shows.",
      },
      {
        type: "h2",
        text: "Cadence matters more than polish",
      },
      {
        type: "p",
        text: "Running tabletop exercises twice a year, with findings tracked to closure, turns an incident response plan from a document into a capability the team can actually rely on. A single elaborate exercise run once and never repeated teaches the team something, but org charts change, systems get replaced, and the findings slowly become irrelevant. Twice a year is frequent enough to keep pace with normal organizational change. The organizations that handle real incidents calmly aren't the ones with the most detailed documentation — they're the ones who've already made their mistakes in a low-stakes simulation.",
      },
    ],
  },
  {
    slug: "ai-automation-that-improves-operations",
    title: "AI Automation That Actually Improves Operations",
    category: "Automation",
    date: "July 3, 2026",
    excerpt:
      "What to automate first, how to measure value, and why responsible rollout matters for internal AI systems.",
    coverImage:
      "https://images.unsplash.com/photo-1677442135703-1787eea5ce01?auto=format&fit=crop&w=1600&q=80",
    coverAlt: "Abstract AI neural network visualization",
    tags: ["AI", "Automation", "Operations", "Strategy"],
    body: [
      {
        type: "p",
        text: "Useful automation starts with repetitive, measurable workflows where quality can be evaluated consistently. The appeal of AI automation often leads teams toward the most visible or most exciting use case rather than the most tractable one. A workflow is a good automation candidate not because it looks impressive in a demo, but because its inputs are well-defined, its outputs can be checked against a clear standard, and enough historical examples exist to build and validate a system against. Customer support ticket triage, invoice data extraction, and first-pass code review comments tend to be strong starting points precisely because they're unglamorous and well-bounded.",
      },
      {
        type: "h2",
        text: "Start with the boring workflow",
      },
      {
        type: "p",
        text: "The best first automation target is the one your team does most often, hates the most, and has the most consistent definition of 'done' for. It's almost never the one that appears in the board presentation. It's the support queue that gets triaged the same way three hundred times a week, or the weekly report that pulls from the same five sources in the same format every Friday. These workflows are boring precisely because they're already well-understood — which makes them ideal for automation. The failure modes are known, the edge cases are documented somewhere, and the team can immediately tell when the system gets it wrong.",
      },
      {
        type: "img",
        src: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1400&q=80",
        alt: "Data workflow and analytics dashboard",
        caption: "Well-bounded workflows with measurable outputs are the safest starting point for automation.",
      },
      {
        type: "h2",
        text: "Why the first release needs a human checkpoint",
      },
      {
        type: "p",
        text: "Shipping an automated workflow without a human checkpoint is a common and expensive mistake. It treats the system's first version as if it were already proven, when in practice the first version is a hypothesis about how well the automation will actually perform against real, messy, production data. A human-in-the-loop design — where the system proposes an action and a person confirms or corrects it — does two things at once: it protects the business from early-stage mistakes, and it generates exactly the labeled correction data needed to improve the system over time.",
      },
      {
        type: "quote",
        text: "A support triage system that gets used a thousand times a day but routes twenty percent of tickets incorrectly isn't a success story. It's a liability quietly accumulating in the background.",
      },
      {
        type: "h2",
        text: "Narrow beats broad every time",
      },
      {
        type: "p",
        text: "Teams that succeed with internal AI systems start narrow: one workflow, one team, one clear metric — rather than a broad rollout across the whole organization at once. Broad rollouts feel efficient because they promise to capture value everywhere simultaneously, but they also multiply the number of edge cases, stakeholders, and failure modes the team has to manage at once, right when the system is least mature and least trusted. A narrow rollout lets the team build genuine expertise in one context, fix the failure modes that actually show up in practice, and use that hard-won experience to expand deliberately rather than reactively.",
      },
      {
        type: "img",
        src: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=1400&q=80",
        alt: "AI and machine learning concept visualization",
        caption: "Controlled rollout builds the trust and data quality that scaled automation requires.",
      },
      {
        type: "h2",
        text: "Measure what the automation actually changes",
      },
      {
        type: "p",
        text: "Measuring value means tracking more than adoption. Response accuracy, escalation rate, and time saved per task tell a more honest story than usage counts alone. Adoption numbers are seductive because they're easy to report and always trend upward once a tool is mandated — but they say nothing about whether the tool is actually good. Escalation rate — how often a human has to override or correct the automated decision — is a far more honest signal. Tracking it over time shows whether the system is actually improving or just becoming more deeply embedded in the workflow without getting any better. Set a threshold before you launch. If escalation rate stays above it after the first month, that's a data point that demands a response, not an asterisk in the review meeting.",
      },
    ],
  },
];

/** Extract plain text from rich body for reading time calculation */
export function blogReadingTime(body: BodyBlock[]): string {
  const text = body
    .filter((b): b is { type: "p" | "h2" | "h3" | "quote"; text: string } =>
      ["p", "h2", "h3", "quote"].includes(b.type)
    )
    .map((b) => b.text)
    .join(" ");
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.round(words / 200));
  return `${minutes} min read`;
}
