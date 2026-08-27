import type { Metadata } from "next";
import {
  Award,
  BarChart3,
  Cloud,
  Code2,
  Globe,
  Lock,
  Rocket,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";

import {
  Card,
  ImagePlaceholder,
  PageHero,
  PrimaryButton,
  Section,
  SectionHeader,
} from "@/components/home/ui";
import { IconFrame } from "@/components/home/IconFrame";
import { buildMetadata } from "@/lib/metadata";

export const metadata: Metadata = buildMetadata({
  title: "Our Success Story",
  description:
    "From a focused engineering practice in 2020 to a globally recognized technology consultancy — the TMI story from 2020 to today.",
  path: "/success-story",
  image:
    "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1600&q=80",
});

/* ─────────────────────────────────────────────────────────────────────
   DATA
───────────────────────────────────────────────────────────────────── */

const milestones = [
  {
    year: "2020",
    eyebrow: "Foundation & Resilience",
    title: "Building through the storm.",
    body: "While the pandemic reshaped every industry, TMI doubled down on its engineering discipline. We consolidated our core service offerings — web development, cybersecurity, and cloud infrastructure — and made the deliberate decision to serve clients remotely across time zones. That year we completed eleven engagements across Pakistan, the UK, and the Middle East, proving that disciplined remote delivery was not a compromise but a competitive advantage. Our team grew from a core of three to eight full-time engineers.",
    icon: Rocket,
    stat: { label: "Engagements completed", value: "11" },
    tags: ["Remote delivery", "Cybersecurity", "Cloud migration"],
    side: "left",
  },
  {
    year: "2021",
    eyebrow: "International Expansion",
    title: "First enterprise retainers and a transatlantic footprint.",
    body: "2021 was the year TMI moved from project-based work into long-term retainer partnerships. We signed our first three enterprise clients — a UK-based fintech, a healthcare software company in Canada, and a logistics platform in the UAE — each requiring ongoing security reviews, infrastructure support, and feature delivery. We formalized our Penetration Testing practice and hired our first dedicated cloud architect. Revenue grew 180 % year-on-year, and client retention held at 100 %.",
    icon: Globe,
    stat: { label: "Revenue growth YoY", value: "180%" },
    tags: ["Fintech", "Healthcare", "Penetration testing", "Retainers"],
    side: "right",
  },
  {
    year: "2022",
    eyebrow: "Product & Platform Scale",
    title: "From features to full platforms.",
    body: "The 2022 mandate from our clients was clear: stop shipping features and start owning platforms. We re-organized our delivery model around product squads — pairing a tech lead, a security engineer, and a DevOps specialist on every engagement — and launched four greenfield SaaS platforms for clients in e-commerce, edtech, and professional services. We also completed our most complex penetration test to date for a 12-country retail group, uncovering 47 critical vulnerabilities before their regulatory audit. The team reached 20 people.",
    icon: Code2,
    stat: { label: "Critical vulnerabilities found & resolved", value: "47" },
    tags: ["SaaS platforms", "Product squads", "Compliance audits"],
    side: "left",
  },
  {
    year: "2023",
    eyebrow: "AI & Automation Era",
    title: "Embedding intelligence into every layer.",
    body: "As large language models moved from research labs to production, TMI moved fast. We built our AI & Machine Learning practice, delivering intelligent document processing, customer-facing chatbots, and predictive analytics pipelines for six clients before the year was out. Alongside AI work, we launched a compliance and auditing service line covering GDPR, SOC 2, and ISO 27001 gap assessments — a direct response to increasing regulatory scrutiny from our enterprise base. We completed 34 engagements across 14 countries in a single calendar year.",
    icon: Sparkles,
    stat: { label: "Countries served in 2023", value: "14" },
    tags: ["AI & ML", "LLM integration", "GDPR", "SOC 2", "ISO 27001"],
    side: "right",
  },
  {
    year: "2024",
    eyebrow: "Global Recognition",
    title: "A globally recognized practice.",
    body: "2024 marked our transition from a high-performing boutique to a recognized global consultancy. We were engaged by our first Fortune 500 client — a multinational manufacturing group requiring a full cloud re-architecture and a zero-trust security rollout across 8 data centers. We formalized our Data Engineering capability and delivered a real-time analytics platform handling over 2 billion events per month for a media company in Singapore. Our team crossed 40 specialists, distributed across Pakistan, the UK, and the UAE. Client NPS reached 78.",
    icon: Award,
    stat: { label: "Client NPS score", value: "78" },
    tags: ["Fortune 500", "Zero-trust", "Data engineering", "Real-time analytics"],
    side: "left",
  },
  {
    year: "2025 – Present",
    eyebrow: "Strategic Maturity",
    title: "Enterprise-grade at every scale.",
    body: "Today TMI operates across ten service lines, serving clients in 20+ countries with a team of 50+ engineers, security specialists, and consultants. Our multi-disciplinary squads deliver end-to-end: from ideation and architecture through secure delivery and ongoing operations. We have signed multi-year strategic partnerships in the financial services, government technology, and global logistics sectors, and our AI practice has become one of our fastest-growing units. The next chapter — a dedicated research and development lab — begins this year.",
    icon: TrendingUp,
    stat: { label: "Countries served today", value: "20+" },
    tags: ["50+ team", "Multi-year partnerships", "R&D lab", "10 service lines"],
    side: "right",
  },
];

const keyStats = [
  { label: "Years in operation",        value: "19+",  icon: Award },
  { label: "Countries served",          value: "20+",  icon: Globe },
  { label: "Engagements completed",     value: "200+", icon: BarChart3 },
  { label: "Team members",              value: "50+",  icon: Users },
  { label: "Client retention rate",     value: "97%",  icon: ShieldCheck },
  { label: "Security audits delivered", value: "80+",  icon: Lock },
  { label: "Cloud platforms managed",   value: "35+",  icon: Cloud },
  { label: "AI solutions deployed",     value: "18+",  icon: Zap },
];

const principles = [
  {
    title: "Discipline compounds",
    description:
      "Every decision — architecture, security posture, team structure — has been made with a five-year lens, not the next sprint.",
    icon: TrendingUp,
  },
  {
    title: "Retention over acquisition",
    description:
      "97 % of our growth comes from expanded relationships with existing clients, not a constant sales motion. We earn long-term trust.",
    icon: Users,
  },
  {
    title: "Security is not a feature",
    description:
      "Since 2020, every engagement has included a security review checkpoint. No product leaves our hands without it.",
    icon: ShieldCheck,
  },
];

/* ─────────────────────────────────────────────────────────────────────
   PAGE
───────────────────────────────────────────────────────────────────── */

export default function SuccessStoryPage() {
  return (
    <>
      <PageHero
        eyebrow="Success Story"
        title="Six years. Twenty countries. One standard."
        description="From a focused engineering practice navigating a global pandemic to a multi-disciplinary technology consultancy serving Fortune 500 companies — this is the TMI story from 2020 to today."
        image="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1600&q=80"
        imageTitle="TMI growth journey"
        imageCaption="Founded 2006 · Accelerated 2020–present"
      >
        <PrimaryButton href="/contact">Work with us</PrimaryButton>
      </PageHero>

      {/* ── Key stats banner ── */}
      <Section className="bg-canvas" labelledBy="success-stats">
        <h2 id="success-stats" className="sr-only">Company statistics</h2>
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-4 lg:grid-cols-8">
          {keyStats.map((stat) => (
            <div key={stat.label} className="flex flex-col items-center text-center">
              <stat.icon className="h-5 w-5 text-ink-muted" aria-hidden />
              <p className="mt-3 text-3xl font-semibold tracking-tight text-ink">
                {stat.value}
              </p>
              <p className="mt-1 text-xs leading-4 text-zinc-400">{stat.label}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* ── Chapter intro ── */}
      <Section className="bg-canvas" labelledBy="story-intro">
        <div className="mx-auto max-w-3xl text-center">
          <p className="font-mono text-[11px] font-semibold uppercase tracking-widest text-ink">
            The journey
          </p>
          <h2
            id="story-intro"
            className="mt-4 text-balance text-3xl font-semibold leading-tight text-ink sm:text-4xl"
          >
            A year-by-year account of how we grew.
          </h2>
          <p className="mt-5 text-base leading-7 text-ink-muted sm:text-lg">
            Growth at TMI has never been accidental. Each year introduced a new constraint, a new
            market, or a new discipline — and we built to meet it. What follows is an honest account
            of how the company evolved from 2020 to today.
          </p>
        </div>
      </Section>

      {/* ── Timeline ── */}
      <Section className="bg-surface" labelledBy="success-timeline">
        <h2 id="success-timeline" className="sr-only">Timeline</h2>

        <div className="relative">
          {/* Centre spine — visible on lg only */}
          <div
            className="absolute left-1/2 top-0 hidden h-full w-px -translate-x-1/2 bg-line lg:block"
            aria-hidden
          />

          <div className="space-y-16">
            {milestones.map((m) => (
              <div
                key={m.year}
                className={`relative grid gap-8 lg:grid-cols-2 lg:items-start ${
                  m.side === "right" ? "lg:[&>*:first-child]:order-2" : ""
                }`}
              >
                {/* Year badge on spine */}
                <div
                  className="absolute left-1/2 top-0 hidden -translate-x-1/2 -translate-y-1 lg:flex"
                  aria-hidden
                >
                  <span className="inline-flex items-center border border-ink bg-canvas px-3 py-1 font-mono text-[11px] font-semibold uppercase tracking-widest text-ink">
                    {m.year}
                  </span>
                </div>

                {/* Content card */}
                <div className={m.side === "right" ? "lg:pl-12" : "lg:pr-12"}>
                  <article className="border border-line bg-canvas p-7 shadow-[0_1px_2px_rgba(17,24,39,0.04),0_18px_48px_rgba(17,24,39,0.05)]">
                    {/* Mobile year badge */}
                    <span className="mb-4 inline-flex items-center border border-ink px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-widest text-ink lg:hidden">
                      {m.year}
                    </span>

                    <div className="flex items-start gap-4">
                      <IconFrame icon={m.icon} />
                      <div>
                        <p className="font-mono text-[11px] font-semibold uppercase tracking-widest text-ink">
                          {m.eyebrow}
                        </p>
                        <h3 className="mt-1 text-xl font-semibold text-ink">{m.title}</h3>
                      </div>
                    </div>

                    <p className="mt-5 text-sm leading-7 text-ink-muted">{m.body}</p>

                    {/* Tags */}
                    <div className="mt-5 flex flex-wrap gap-2">
                      {m.tags.map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center border border-line bg-surface px-2.5 py-1 text-xs font-medium text-ink"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </article>
                </div>

                {/* Stat callout */}
                <div
                  className={`flex items-start ${
                    m.side === "right" ? "lg:justify-end lg:pr-12" : "lg:justify-start lg:pl-12"
                  }`}
                >
                  <div className="border-l-4 border-ink bg-canvas p-6 shadow-[0_1px_2px_rgba(17,24,39,0.04),0_8px_24px_rgba(17,24,39,0.06)]">
                    <p className="font-mono text-5xl font-semibold leading-none tracking-tight text-ink">
                      {m.stat.value}
                    </p>
                    <p className="mt-2 text-sm text-ink-muted">{m.stat.label}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* ── What made it work ── */}
      <Section className="bg-canvas" labelledBy="success-principles">
        <SectionHeader
          id="success-principles"
          eyebrow="What made it work"
          title="Three principles behind consistent growth."
          description="The story above reads as a series of milestones, but beneath it are operating principles that have held since the start."
        />
        <div className="mt-14 grid gap-6 lg:grid-cols-3">
          {principles.map((p) => (
            <Card key={p.title}>
              <IconFrame icon={p.icon} />
              <h3 className="mt-6 text-xl font-semibold text-ink">{p.title}</h3>
              <p className="mt-4 text-base leading-7 text-ink-muted">{p.description}</p>
            </Card>
          ))}
        </div>
      </Section>

      {/* ── Image break ── */}
      <Section className="bg-surface" labelledBy="success-image">
        <h2 id="success-image" className="sr-only">Team at work</h2>
        <ImagePlaceholder
          src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&w=1600&q=80"
          title="The team behind the results"
          caption="50+ engineers, security specialists, and consultants across three continents."
        />
      </Section>

      {/* ── CTA ── */}
      <Section className="bg-canvas" labelledBy="success-cta">
        <div className="mx-auto max-w-3xl text-center">
          <p className="font-mono text-[11px] font-semibold uppercase tracking-widest text-ink-muted">
            What&apos;s next
          </p>
          <h2
            id="success-cta"
            className="mt-4 text-balance text-3xl font-semibold leading-tight text-ink sm:text-4xl"
          >
            The next chapter starts with your project.
          </h2>
          <p className="mt-5 text-base leading-7 text-zinc-400 sm:text-lg">
            Whether you need a security review, a platform built from scratch, or a team to own
            your cloud infrastructure, TMI brings the same discipline that has driven six years of
            continuous growth to every engagement.
          </p>
          <div className="mt-8">
            <PrimaryButton href="/contact">Start a conversation</PrimaryButton>
          </div>
        </div>
      </Section>
    </>
  );
}
