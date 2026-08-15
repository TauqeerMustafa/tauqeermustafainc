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
  {
    slug: "building-design-systems-that-last",
    title: "Building Design Systems That Actually Last",
    category: "Product Design",
    date: "June 12, 2026",
    excerpt:
      "Most design systems collapse under the weight of team growth. Here's how to build one that survives the second year.",
    coverImage:
      "https://images.unsplash.com/photo-1561070791-2526d30994b5?auto=format&fit=crop&w=1600&q=80",
    coverAlt: "Design system components and UI kit on screen",
    tags: ["Design Systems", "Product Design", "Frontend", "UI"],
    body: [
      {
        type: "p",
        text: "A design system is not a component library. That distinction matters enormously, because teams that conflate the two tend to build elaborate component libraries and then wonder why adoption collapses six months later. A component library is a collection of reusable UI parts. A design system is the set of decisions, constraints, and shared understanding that make those components coherent — and that enable the team to make new decisions consistently without relitigating the same visual and interaction questions every sprint.",
      },
      {
        type: "h2",
        text: "The trap: building for today's team size",
      },
      {
        type: "p",
        text: "Most design systems are designed for the team that builds them, not the team that will eventually maintain and extend them. When two designers and three engineers build the system, they can hold the implicit rules in their heads. The color token naming conventions, the spacing logic, the reasons certain components exist and others don't — it's all ambient knowledge. When that team doubles, and the new hires weren't there for any of the founding decisions, the system starts fragmenting. New components get added without respecting the existing constraints. Tokens get duplicated rather than reused. The system that was meant to enforce consistency starts generating new inconsistencies at the edges.",
      },
      {
        type: "img",
        src: "https://images.unsplash.com/photo-1558655146-d09347e92766?auto=format&fit=crop&w=1400&q=80",
        alt: "Design tokens and component documentation",
        caption: "Token naming conventions that make sense to the founding team often confuse everyone else.",
      },
      {
        type: "h2",
        text: "Foundation: decisions before components",
      },
      {
        type: "p",
        text: "Before the first component gets built, the team needs documented answers to a small set of foundational questions. What is the complete set of spacing values, and what logic governs when each is appropriate? How does the type scale work, and what should a designer reach for when none of the existing styles quite fits? What are the actual rules for color usage — not just which colors exist, but which colors are appropriate for interactive elements, which for backgrounds, which for status states? These decisions seem tedious to document when the team is small enough to just ask someone. They become essential when the person to ask is no longer around, or is managing four projects at once, or just joined last week.",
      },
      {
        type: "quote",
        text: "The best design systems are opinionated. They make it easier to do the right thing than the wrong one, and they make the rules visible enough that new contributors can understand them without a guided tour.",
      },
      {
        type: "h2",
        text: "What actually breaks systems over time",
      },
      {
        type: "p",
        text: "Three things kill design systems reliably. The first is undocumented exceptions. Every system accumulates places where the standard pattern didn't quite work, and someone built a one-off. If that exception isn't documented — why it exists, under what circumstances it's appropriate — it becomes the seed of a parallel system. The second is ownership ambiguity. When nobody is clearly responsible for the design system, everyone treats it as someone else's problem to keep consistent. Changes accumulate, decisions drift, and the system quietly becomes descriptive rather than prescriptive. The third is treating the system as finished. A design system that isn't actively maintained will be actively ignored.",
      },
      {
        type: "img",
        src: "https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=1400&q=80",
        alt: "Team reviewing component designs",
        caption: "Systems that survive require active ownership, not just initial construction.",
      },
      {
        type: "p",
        text: "The systems that last are boring to describe. Clear token naming. Documented decision rationale. One owner with explicit responsibility for consistency. A lightweight contribution process so the system can grow without becoming a bureaucratic bottleneck. Regular reviews to prune components that nobody actually uses. None of it is glamorous. All of it is the reason the system is still useful two years later.",
      },
    ],
  },
  {
    slug: "cloud-cost-control-before-it-becomes-a-problem",
    title: "Cloud Cost Control Before It Becomes a Problem",
    category: "Cloud Engineering",
    date: "May 20, 2026",
    excerpt:
      "Cloud bills surprise teams because the visibility wasn't built in from the start. Here's how to build it in.",
    coverImage:
      "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1600&q=80",
    coverAlt: "Cloud server infrastructure with blue lighting",
    tags: ["Cloud", "AWS", "Cost Optimization", "Infrastructure"],
    body: [
      {
        type: "p",
        text: "Cloud cost surprises are almost always a visibility problem, not a spending problem. The money was being spent for weeks or months before the invoice arrived and someone noticed the number. Untagged resources accumulating in a sandbox account. A misconfigured autoscaling group running at peak capacity overnight. A data transfer charge nobody knew was occurring because the architecture review that would have caught it happened at the wrong level of abstraction. The fix in each of these cases isn't spending less — it's knowing what you're spending and why, in time to make a decision before the bill lands.",
      },
      {
        type: "h2",
        text: "Tagging is the prerequisite for everything else",
      },
      {
        type: "p",
        text: "A cloud cost control strategy that doesn't start with tagging is building on sand. Tags are how you answer the questions that matter: which team owns this resource, which product does it serve, which environment is it in? Without that metadata, a cost dashboard shows you total spend but can't tell you whether the finance team's reporting service or the product team's API gateway drove last month's increase. You end up with a spreadsheet exercise, cross-referencing resource IDs against Slack messages and gut memory, trying to reconstruct attribution after the fact. Enforce tagging at provisioning time, with automated policy checks that flag or block untagged resources before they run for a single hour.",
      },
      {
        type: "img",
        src: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1400&q=80",
        alt: "Infrastructure cost analytics dashboard",
        caption: "Spend attribution by team and environment makes cost conversations concrete rather than political.",
      },
      {
        type: "h2",
        text: "Budgets and alerts are not optional",
      },
      {
        type: "p",
        text: "Every environment should have a budget with an alert threshold before any infrastructure is provisioned in it. This is not a financial control measure — it's an operational one. A budget alert that fires at 80% of the expected monthly spend is a signal that something changed. Either usage grew as expected and the budget needs updating, or something unexpected is running, or a misconfiguration is generating cost. In any case, you want to know in the third week of the month, not on the first day of the next one. The alert doesn't have to trigger a PagerDuty incident. A Slack notification to the team is sufficient. The goal is awareness while there's still time to act.",
      },
      {
        type: "quote",
        text: "A budget alert that fires at 80% of the expected monthly spend is an operational signal, not a financial complaint. Something changed — and you want to know while there's still time to respond.",
      },
      {
        type: "h2",
        text: "Reserved capacity: commit to what you know",
      },
      {
        type: "p",
        text: "Reserved instances and savings plans are consistently the highest-leverage cost optimization for teams running stable workloads. A one-year commitment on capacity you know you'll need can cut that portion of the bill by 30 to 40 percent. The objection teams raise — what if we need to change? — is usually misplaced. The question isn't whether the workload will change at all; it's whether a meaningful portion of the baseline capacity will still be needed. For most production services, the answer is yes. Start conservative: commit to 60% of current baseline, leave the rest on-demand, and revisit quarterly as usage patterns become clearer. That approach captures most of the savings with very little commitment risk.",
      },
      {
        type: "img",
        src: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1400&q=80",
        alt: "Cloud infrastructure planning session",
        caption: "Reserved capacity decisions are most confident when made against 90 days of actual usage data.",
      },
      {
        type: "p",
        text: "None of this requires a dedicated FinOps team or a purpose-built cost management platform. It requires three things: a tagging policy enforced from day one, budget alerts on every environment, and a quarterly 30-minute review of spend by service and team. Teams that do those three things consistently rarely get surprised by their cloud bill. Teams that skip them usually get surprised at the worst possible time.",
      },
    ],
  },
  {
    slug: "what-good-api-design-actually-looks-like",
    title: "What Good API Design Actually Looks Like in Production",
    category: "Engineering",
    date: "April 30, 2026",
    excerpt:
      "APIs are long-lived commitments. The decisions made at v1 are still being worked around at v3. Here's how to make fewer of those mistakes.",
    coverImage:
      "https://images.unsplash.com/photo-1516116216624-53e697fedbea?auto=format&fit=crop&w=1600&q=80",
    coverAlt: "Code on a screen showing API endpoints",
    tags: ["API Design", "Engineering", "Backend", "Best Practices"],
    body: [
      {
        type: "p",
        text: "APIs are long-lived commitments. A decision made when building v1 of an endpoint — how it's named, what it returns, how it handles errors, what it does with fields that don't yet exist — is a decision that external consumers will build against. Once external code depends on a behavior, changing that behavior has a cost, even if the original behavior was wrong, underspecified, or simply a placeholder that was never meant to be permanent. The teams that treat API design as implementation detail tend to be the same teams doing painful v2 migrations two years later.",
      },
      {
        type: "h2",
        text: "Name things for what they mean, not how they work",
      },
      {
        type: "p",
        text: "The most durable API naming decisions are semantic, not structural. An endpoint named /users/{id}/activate means something clearly to a consumer who doesn't know anything about your internal implementation. An endpoint named /users/{id}/set_active_flag tells the consumer about your database column and will feel wrong the moment the implementation changes. The same principle applies to fields. A field called created_timestamp_unix is a leaky implementation detail — it tells the consumer which format the database uses. A field called created_at with a documented ISO 8601 format is a clean contract that can survive a storage migration.",
      },
      {
        type: "img",
        src: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1400&q=80",
        alt: "Developer working on backend API code",
        caption: "Semantic naming decouples your API contract from your implementation details.",
      },
      {
        type: "h2",
        text: "Error responses are part of the contract",
      },
      {
        type: "p",
        text: "Most API design attention goes to the happy path. The error path gets whatever seemed reasonable at the time — usually a different shape depending on which engineer wrote that endpoint, using HTTP status codes inconsistently and returning error messages that are useful for debugging but meaningless for programmatic handling. A consumer who wants to display a useful error message to their user, or retry on specific failure conditions, or route errors to different handlers, needs a consistent, structured error response. That means one error shape across all endpoints, machine-readable error codes distinct from HTTP status codes, and a message that's human-readable but not the only information a consumer has to work with.",
      },
      {
        type: "quote",
        text: "A consumer shouldn't have to parse an English error message to decide whether to retry a request. Error codes are part of the API contract — treat them with the same care as field names.",
      },
      {
        type: "h2",
        text: "Versioning: when and how",
      },
      {
        type: "p",
        text: "API versioning is a policy decision, not a technical one. The technical mechanisms — URL path versioning, header versioning, parameter versioning — are all defensible. The policy question is: what constitutes a breaking change, and how much notice do consumers get before one is deployed? Additive changes — new optional fields, new endpoints, new optional parameters — are generally safe to ship without a version bump if the contract is clear that consumers should ignore fields they don't recognize. Removing fields, changing field types, changing error shapes, changing authentication requirements — these are breaking changes and require a versioned path and a deprecation window. Writing that policy down before you have consumers is far easier than reconstructing it retroactively when the first consumer complains about a broken integration.",
      },
      {
        type: "img",
        src: "https://images.unsplash.com/photo-1504639725590-34d0984388bd?auto=format&fit=crop&w=1400&q=80",
        alt: "API documentation and testing interface",
        caption: "API versioning policy should be documented before the first external consumer goes live.",
      },
      {
        type: "p",
        text: "The teams with the cleanest API histories are not the ones with the most elaborate versioning strategies. They're the ones who asked, before shipping each endpoint, whether the name would still make sense when the implementation changed, whether the error shape was consistent with the rest of the API, and whether a consumer could reasonably build against this contract without knowing anything about the internals. Those three questions, asked consistently at review time, eliminate most of the technical debt that API v2s exist to clean up.",
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
