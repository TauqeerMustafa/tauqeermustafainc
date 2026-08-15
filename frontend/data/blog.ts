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
  {
    slug: "cloud-cost-optimization-without-engineering-overhead",
    title: "Cloud Cost Optimization Without Adding Engineering Overhead",
    category: "Cloud Engineering",
    date: "June 22, 2026",
    excerpt:
      "Most cloud cost reduction strategies look good in a spreadsheet but fail when they require constant manual intervention from the engineering team.",
    coverImage:
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1600&q=80",
    coverAlt: "Cloud infrastructure dashboard showing metrics",
    tags: ["Cloud", "Cost Optimization", "Infrastructure", "AWS"],
    body: [
      {
        type: "p",
        text: "Most cloud cost reduction plans fail not because the recommendations are wrong, but because they require ongoing manual work the team doesn't actually have capacity to sustain. A consultant produces a report identifying twenty percent waste across oversized instances, unattached volumes, and zombie resources. The engineering team implements a few quick wins, then six months later the same waste is back because nobody owns the process of checking for it continuously. Sustainable cost optimization isn't about finding waste once — it's about building systems that prevent waste from accumulating in the first place.",
      },
      {
        type: "h2",
        text: "Start with tagging, not rightsizing",
      },
      {
        type: "p",
        text: "The highest-value first step in cloud cost work is enforcing consistent resource tagging across every environment. Without tags, spend is an opaque line item that nobody feels accountable for. With tags — team, project, environment, cost center — spend becomes attributable, which means teams can actually see the cost of their decisions and make different tradeoffs. Rightsizing an instance saves money this month. Tagging infrastructure creates the visibility that prevents waste from reappearing every quarter, because the team that owns the resource sees its cost and has both the context and the authority to act on it.",
      },
      {
        type: "img",
        src: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1400&q=80",
        alt: "Cost analytics and financial dashboard",
        caption: "Cost visibility by team and project enables informed tradeoff decisions.",
      },
      {
        type: "h2",
        text: "Automate the cleanup, not the analysis",
      },
      {
        type: "p",
        text: "Automated analysis tools generate lists of optimization opportunities — idle instances, old snapshots, unattached volumes. The problem is that acting on those lists requires manual review, because the context for whether a resource is genuinely unused lives in someone's head, not in a tag or a metric. A better automation target is the cleanup itself, with guardrails. Set a policy: untagged resources get flagged after seven days and terminated after thirty. Snapshots older than ninety days get archived to cheaper storage automatically unless explicitly tagged for long-term retention. The automation doesn't decide what's waste — the tagging policy does — but it removes the ongoing manual burden of executing the cleanup.",
      },
      {
        type: "quote",
        text: "Sustainable cost optimization isn't about finding waste once. It's about building systems that prevent waste from accumulating in the first place.",
      },
      {
        type: "h2",
        text: "Reserve capacity for stable workloads only",
      },
      {
        type: "p",
        text: "Reserved instances and savings plans offer meaningful discounts, but only if the commitment matches actual stable usage. Teams often over-commit based on current usage peaks, then get stuck paying for capacity they no longer need when a project winds down or traffic patterns shift. A safer approach: reserve capacity only for the baseline load that's been stable for at least three months, and leave the variable portion on-demand. The discount is smaller, but the flexibility is worth it, because cloud costs that can't flex down when usage drops are nearly as problematic as costs that weren't optimized at all.",
      },
      {
        type: "img",
        src: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1400&q=80",
        alt: "Cloud infrastructure monitoring dashboard",
        caption: "Reserve commitments should track proven baseline load, not projected peaks.",
      },
      {
        type: "h2",
        text: "Budget alerts are useless without ownership",
      },
      {
        type: "p",
        text: "Most organizations set budget alerts that email a distribution list nobody actually monitors. A better pattern: tag-based budgets with team-specific alerts that route to the people who can actually act. When the web-platform team gets an alert that their tagged resources are trending toward 120 percent of budget, they have both the context to understand why and the authority to decide what to do about it — scale down a non-production environment, defer a planned migration, or accept the overage as a justified tradeoff. Cost control that relies on a central infrastructure team to enforce caps across every project scales poorly and generates friction. Cost control that gives each team visibility and ownership scales naturally as the organization grows.",
      },
      {
        type: "p",
        text: "None of these patterns require exotic tooling or a dedicated FinOps team from day one. They require treating cost as an engineering concern, not a finance concern, and building the same kind of automated guardrails around spend that mature teams already build around security, performance, and reliability. The teams that manage cloud costs successfully aren't the ones running the most sophisticated analysis. They're the ones who made cost visibility automatic, cleanup policy-driven, and ownership clear.",
      },
    ],
  },
  {
    slug: "designing-apis-for-long-term-maintenance",
    title: "Designing APIs for Long-Term Maintenance, Not Just Launch Day",
    category: "Engineering",
    date: "June 8, 2026",
    excerpt:
      "The API design that's easiest to ship quickly is rarely the one that's easiest to support three years later when half the team has turned over.",
    coverImage:
      "https://images.unsplash.com/photo-1555949963-aa79dcee981c?auto=format&fit=crop&w=1600&q=80",
    coverAlt: "API documentation and code on screen",
    tags: ["API Design", "Engineering", "Architecture", "Maintenance"],
    body: [
      {
        type: "p",
        text: "API design decisions made under deadline pressure tend to optimize for shipping the first version quickly, which is understandable, but those decisions accumulate as long-term maintenance burden the moment other teams start depending on the API. A field name that made sense in context when it was written becomes ambiguous once five other similar-sounding fields exist. A query parameter that worked fine for the initial use case breaks down when a second client needs slightly different filtering logic. An endpoint that returned a flat list becomes a performance problem when the dataset grows from hundreds of items to tens of thousands. The API that's easy to ship isn't always the API that's easy to live with.",
      },
      {
        type: "h2",
        text: "Design for the second client, not the first",
      },
      {
        type: "p",
        text: "The first client of a new API is usually the team that built it, which means they have all the context about what each field means, what the performance characteristics are, and how to work around the rough edges. The second client has none of that context. Designing for the second client means writing the API as if the first consumer will be someone who's never spoken to you: explicit field names, structured error responses, pagination from day one even if the dataset is currently small, and documentation that doesn't assume the reader already understands the domain model. That discipline catches ambiguity and missing functionality early, before the API becomes load-bearing for multiple teams and breaking changes become expensive.",
      },
      {
        type: "img",
        src: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1400&q=80",
        alt: "Developer reviewing API specifications",
        caption: "API contracts designed for clarity reduce integration friction across teams.",
      },
      {
        type: "h2",
        text: "Explicit versioning beats implicit compatibility guesses",
      },
      {
        type: "p",
        text: "Many teams avoid API versioning early on because it feels like premature complexity, and instead rely on a promise to maintain backward compatibility indefinitely. That works until a change is genuinely needed — a security fix, a data model correction, or a performance improvement — that can't be made without breaking someone. At that point the team either ships the breaking change and deals with the fallout, or avoids making the change and accumulates technical debt. Explicit versioning from the start, even if version 2 never ships, establishes the expectation that APIs can evolve, and gives the team a clean path forward when a necessary breaking change eventually arrives.",
      },
      {
        type: "quote",
        text: "The API that's easy to ship isn't always the API that's easy to live with. Design for the second client, the one who doesn't have your context.",
      },
      {
        type: "h2",
        text: "Error responses should be actionable, not cryptic",
      },
      {
        type: "p",
        text: "Generic error responses like 'Bad Request' or 'Invalid Input' are fast to implement and nearly useless to debug. An actionable error response tells the client exactly what was wrong and, if possible, how to fix it: which field failed validation, what constraint was violated, whether retrying will help or if the request is fundamentally malformed. This isn't just a developer experience nicety — it's a support load reducer. When a client integration breaks, and the logs show a clear error message identifying the specific problem, the integration team can fix it themselves. When the logs show only a 400 status code with no detail, they open a support ticket, and someone on the API team spends an hour digging through server logs to figure out what the client already could have known if the error had been explicit.",
      },
      {
        type: "img",
        src: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1400&q=80",
        alt: "Code review and debugging session",
        caption: "Structured error responses with actionable detail reduce support burden.",
      },
      {
        type: "h2",
        text: "Pagination and filtering aren't optional",
      },
      {
        type: "p",
        text: "It's tempting to skip pagination when the dataset is small — returning a flat array of fifty items is simpler than building a cursor-based pagination system. But once clients depend on that endpoint, adding pagination later is a breaking change. The same is true for filtering and sorting: if the initial use case doesn't need it, it's easy to defer, but the moment a second use case does need it, the API is already committed to a contract that doesn't support it cleanly. Building these capabilities from the start, even if the first client doesn't use them, future-proofs the API for the use cases that will inevitably arrive once the endpoint is stable and other teams start building on it.",
      },
      {
        type: "p",
        text: "None of this requires exotic tooling or heavyweight process. It requires treating API design as a commitment the team is making to future maintainers and future consumers, not just a task to check off before launch. The APIs that age well are the ones where someone thought carefully about the second client, the third use case, and the change that won't be avoidable in two years, and designed with enough flexibility to accommodate those without forcing a disruptive migration.",
      },
    ],
  },
  {
    slug: "effective-onboarding-for-remote-engineering-teams",
    title: "What Effective Onboarding Looks Like for Remote Engineering Teams",
    category: "Culture",
    date: "May 24, 2026",
    excerpt:
      "Remote onboarding that works doesn't replicate the in-office experience online. It requires a fundamentally different structure.",
    coverImage:
      "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&w=1600&q=80",
    coverAlt: "Remote team video conference meeting",
    tags: ["Remote Work", "Onboarding", "Culture", "Team Building"],
    body: [
      {
        type: "p",
        text: "Most remote onboarding programs fail not because the company didn't try, but because they tried to replicate in-office onboarding online — the same presentations, the same schedule, the same assumption that proximity creates context. In an office, a new engineer absorbs information passively: they overhear a conversation about a production incident, they see which meetings people actually pay attention to versus which ones they multi-task through, they notice who gets pulled into urgent decisions and who doesn't. Remote work doesn't offer that passive absorption. Information that would have been ambient in an office has to be made explicit, and onboarding has to be structured around that reality instead of pretending the gap doesn't exist.",
      },
      {
        type: "h2",
        text: "Front-load documentation, not meetings",
      },
      {
        type: "p",
        text: "The instinct is to schedule the new hire into a dozen intro meetings in their first week — meeting the team, meeting adjacent teams, meeting leadership. Those meetings feel productive in the moment but they're terrible for information retention, especially when the new person has no context yet for why any of it matters. A better structure: spend the first few days reading. Architecture docs, incident postmortems, decision records, recent project retrospectives. Then schedule the meetings as working sessions where the new hire can ask questions about what they've already read. The meetings become far more valuable because the new person actually has enough context to ask good questions, and the reading sticks because it gets reinforced through conversation.",
      },
      {
        type: "img",
        src: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&w=1400&q=80",
        alt: "Documentation and knowledge base on laptop",
        caption: "Written onboarding material gives new hires referenceable context that meetings don't.",
      },
      {
        type: "h2",
        text: "Pair programming teaches context, not just code",
      },
      {
        type: "p",
        text: "The most effective remote onboarding tool is structured pair programming with different team members over the first few weeks. Not just for the technical learning, though that matters, but because pairing is where new hires see how decisions actually get made: how much testing is expected before a pull request goes up, what 'good enough' looks like versus 'needs more iteration', which tradeoffs the team makes routinely and which ones require broader discussion. That kind of team context is nearly impossible to document, and it's exactly the information a new remote hire has no natural way to absorb. Pairing makes it explicit.",
      },
      {
        type: "quote",
        text: "Remote work doesn't offer passive absorption of context. Information that would have been ambient in an office has to be made explicit, and onboarding has to be structured around that reality.",
      },
      {
        type: "h2",
        text: "Assign a low-stakes first project",
      },
      {
        type: "p",
        text: "The worst first project for a new hire is one that's on the critical path with a tight deadline. The best first project is one that's useful if it ships but not disruptive if it takes longer than expected, touches multiple parts of the codebase so the new person gets familiar with the architecture, and can be broken into small reviewable chunks so they get frequent feedback rather than working in isolation for two weeks before discovering they misunderstood the requirements. The goal isn't to extract maximum productivity in week one — it's to build confidence and context so by week six the new hire is genuinely effective rather than just busy.",
      },
      {
        type: "img",
        src: "https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=1400&q=80",
        alt: "Engineer working remotely on laptop",
        caption: "A well-scoped first project builds confidence and system familiarity without deadline pressure.",
      },
      {
        type: "h2",
        text: "Check in more frequently early, then taper off",
      },
      {
        type: "p",
        text: "In an office, it's easy to see when a new hire is stuck — they're visibly not making progress, or they're hesitant to ask questions. Remote, that visibility doesn't exist, which means explicit check-ins matter more. Daily for the first week, every other day for the next few weeks, then weekly once the new hire is demonstrably unblocked. The check-ins don't have to be long, but they need to be consistent, and the manager needs to explicitly ask 'what's blocking you that I can help with' rather than assuming the new person will volunteer it unprompted. Remote work requires defaulting to over-communication early, then scaling it back once trust and context are established.",
      },
      {
        type: "p",
        text: "Remote onboarding that works doesn't try to simulate the office experience. It acknowledges that remote work requires different structures, more deliberate documentation, and more explicit check-ins, and it treats those differences as design constraints rather than deficiencies. The teams that onboard remote hires well are the ones that stopped trying to replicate what used to work in-person and instead built something purpose-fit for the constraints of distributed work.",
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
