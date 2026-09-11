"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Check,
  ArrowRight,
  ShieldCheck,
  Zap,
  Building2,
  Lock,
  Globe,
  ChevronDown,
  ChevronUp,
  Sparkles,
  HelpCircle,
  Clock,
  Layers,
  Code2,
  Server,
} from "lucide-react";

import {
  PageHero,
  Section,
  SectionHeader,
  Badge,
  BadgeMuted,
  MStripe,
} from "@/components/home/ui";

type BillingCadence = "monthly" | "quarterly";

interface PricingTier {
  id: string;
  name: string;
  monthlyPrice: number;
  quarterlyPrice: number;
  isFixed?: boolean;
  fixedPriceText?: string;
  cadenceNote: string;
  badge?: string;
  featured?: boolean;
  description: string;
  deliverables: string[];
  ctaText: string;
  idealFor: string;
}

const PRICING_TIERS: PricingTier[] = [
  {
    id: "discovery-sprint",
    name: "Architecture & Discovery Sprint",
    monthlyPrice: 1500,
    quarterlyPrice: 1500,
    isFixed: true,
    fixedPriceText: "$1,500",
    cadenceNote: "fixed milestone // 2 weeks",
    description:
      "A focused, high-impact architectural deep-dive to define system specifications, database schemas, and delivery blueprints before full-scale build.",
    idealFor: "Founders, early-stage startups, and new technical ventures.",
    deliverables: [
      "Complete System Architecture & Cloud Topology",
      "Database Schema (PostgreSQL / Redis) & Entity Models",
      "API Contracts & Microservice Boundary Mapping",
      "Tech Stack & Infrastructure Cost Projections",
      "Security Threat Model & Data Privacy Review",
      "Actionable Sprint Roadmap & Backlog for Engineering",
      "14 Days Post-Delivery Clarification Support",
    ],
    ctaText: "Start Architecture Sprint",
  },
  {
    id: "dedicated-retainer",
    name: "Dedicated Engineering Retainer",
    monthlyPrice: 3500,
    quarterlyPrice: 3150,
    cadenceNote: "per month // weekly releases",
    badge: "Most Popular",
    featured: true,
    description:
      "Full-cycle dedicated engineering commitment embedded into your product team. Continuous shipping, weekly releases, and direct technical leadership.",
    idealFor: "Growing SaaS, scaling companies, and active product teams.",
    deliverables: [
      "Dedicated Senior Full-Stack Engineering (40+ hrs/wk)",
      "Next.js 16 (Turbopack) & React 19 Frontend Engineering",
      "Python (FastAPI) & Node.js Microservices Architecture",
      "Automated CI/CD Pipelines (GitHub Actions / Vercel)",
      "Weekly Production Deployments & Code Reviews",
      "Real-Time Slack & WhatsApp Engineering Channel Access",
      "Continuous Performance & Security Hardening",
      "30-Day Workmanship Warranty on All Shipped Code",
    ],
    ctaText: "Engage Dedicated Retainer",
  },
  {
    id: "enterprise-scale",
    name: "Enterprise Scale & Cloud",
    monthlyPrice: 6000,
    quarterlyPrice: 5400,
    cadenceNote: "per month // custom SLA",
    badge: "Mission-Critical",
    description:
      "Comprehensive architectural leadership and engineering team allocation for high-throughput, mission-critical platforms requiring strict SLAs.",
    idealFor: "Enterprise platforms, fintech, healthcare, and high-load architectures.",
    deliverables: [
      "Principal Architect + Dedicated Senior Engineering Team",
      "High-Availability Multi-Region Cloud Topology",
      "Zero-Downtime Database Migration & Replication",
      "SOC2, ISO27001 & GDPR Compliance Engineering",
      "24/7 Incident Response & Uptime SLA Guarantee",
      "Executive Technical Reviews & Board-Ready Architecture",
      "Bespoke AI Pipeline & LLM Agent Infrastructure",
      "Dedicated Treasury Billing & Commercial Account Manager",
    ],
    ctaText: "Engage Enterprise Team",
  },
];

const ADDONS = [
  {
    title: "Cybersecurity & Penetration Audit",
    price: "$2,200",
    cadence: "per audit milestone",
    description:
      "Comprehensive white-box / black-box penetration testing, OWASP Top 10 vulnerability scan, and verified remediation report.",
    icon: ShieldCheck,
    href: "/billing/pay?service=Cybersecurity%20Penetration%20Audit&amount=2200",
  },
  {
    title: "AI Pipeline & LLM Agent Architecture",
    price: "$2,800",
    cadence: "fixed sprint",
    description:
      "Bespoke retrieval-augmented generation (RAG), vector database indexing, local LLM orchestration, and function calling tools.",
    icon: Sparkles,
    href: "/billing/pay?service=AI%20Pipeline%20Architecture&amount=2800",
  },
  {
    title: "Cloud & Database Migration",
    price: "$1,900",
    cadence: "fixed milestone",
    description:
      "Zero-downtime database migration to managed PostgreSQL (Supabase / AWS RDS) with automated backups and failover setup.",
    icon: Server,
    href: "/billing/pay?service=Cloud%20Database%20Migration&amount=1900",
  },
];

const COMPARISON_ROWS = [
  { feature: "Primary Engagement Model", discovery: "Fixed Scope (2 Weeks)", retainer: "Ongoing Monthly Retainer", enterprise: "Dedicated Team & SLA" },
  { feature: "Dedicated Engineering Commitment", discovery: "Full Architecture Sprint", retainer: "40+ Hours / Week", enterprise: "Multi-Engineer Allocation" },
  { feature: "Frontend Rails (Next.js 16, React 19, TypeScript)", discovery: "Scaffold & UI System", retainer: "Full Continuous Build", enterprise: "Full Build + Micro-frontends" },
  { feature: "Backend Rails (FastAPI, PostgreSQL, Redis)", discovery: "Schema & Architecture", retainer: "Full API & Data Pipeline", enterprise: "Distributed Architecture" },
  { feature: "Cloud Infrastructure (Docker, AWS, Vercel)", discovery: "Terraform / Blueprint", retainer: "Production CI/CD Automation", enterprise: "Multi-Region HA & Kubernetes" },
  { feature: "Communication Channels", discovery: "Scheduled Reviews & Email", retainer: "Direct Slack & WhatsApp", retainerBold: true, enterprise: "Dedicated VIP Desk (24/7)" },
  { feature: "Post-Launch Warranty", discovery: "14 Days", retainer: "30 Days Continuous", enterprise: "Continuous Under Active SLA" },
  { feature: "Settlement Rails", discovery: "Paddle / Wise / Meezan / Raast", retainer: "Paddle / Wise / Meezan / Raast", enterprise: "Custom Master Service Agreement" },
];

const FAQS = [
  {
    question: "How are milestone tranches and disbursements structured?",
    answer:
      "For fixed sprints, we typically work on a 50% kick-off deposit and 50% upon completed delivery and sign-off. For dedicated monthly retainers, disbursements are handled bi-weekly or monthly in advance to ensure guaranteed engineer allocation.",
  },
  {
    question: "What payment rails do you accept?",
    answer:
      "We accept international Credit/Debit cards, Apple Pay, Google Pay, and PayPal via Paddle (Merchant of Record), international USD/EUR wire transfers via Wise, direct Meezan Bank IBAN wire, and instant Pakistani State Bank Raast transfers (0% fee).",
  },
  {
    question: "What is your workmanship warranty on shipped deliverables?",
    answer:
      "Every production milestone delivered by Tauqeer Mustafa Inc. includes an unconditional 30-day workmanship warranty covering any bug fixes, edge-case remediation, or performance anomalies at zero additional fee.",
  },
  {
    question: "Can retainers be paused, adjusted, or canceled?",
    answer:
      "Yes. Retainers operate on flexible monthly agreements with a standard 14-day notice period. You can scale capacity up during intense build sprints or scale down to maintenance as your product stabilizes.",
  },
  {
    question: "Do you sign Non-Disclosure Agreements (NDAs)?",
    answer:
      "Yes. We execute mutual corporate NDAs and intellectual property assignment contracts prior to reviewing proprietary codebases, models, or sensitive internal data.",
  },
  {
    question: "Do I own 100% of the code and intellectual property?",
    answer:
      "Yes. Upon invoice settlement, 100% of intellectual property, git repositories, architecture schematics, and design assets are transferred fully and exclusively to your company.",
  },
];

export default function PricingClient() {
  const [cadence, setCadence] = useState<BillingCadence>("monthly");
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const toggleFaq = (idx: number) => {
    setOpenFaq((prev) => (prev === idx ? null : idx));
  };

  return (
    <>
      {/* Precision Hero */}
      <PageHero
        eyebrow="Commercial Terms // Engineering Retainers"
        title="Predictable investment. High-velocity engineering."
        description="Transparent milestone sprints and dedicated engineering retainers designed for high-growth tech companies, founders, and enterprise platforms."
        image="https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1600&q=80"
        imageTitle="Transparent Corporate Engineering"
        imageCaption="Clear tranches, decoupled treasury settlements, and 30-day workmanship warranties."
      >
        <Badge>Paddle Merchant of Record</Badge>
        <BadgeMuted>30-Day Workmanship Warranty</BadgeMuted>
        <BadgeMuted>100% IP Ownership</BadgeMuted>
      </PageHero>

      {/* Main Pricing Cards Section */}
      <Section className="bg-surface" labelledBy="pricing-plans">
        <div className="flex flex-col items-center text-center max-w-2xl mx-auto mb-10">
          <MStripe />
          <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-action mt-4">
            Engagement Tiers
          </p>
          <h2 id="pricing-plans" className="text-3xl sm:text-4xl font-bold uppercase tracking-tight text-ink mt-2">
            Select your delivery model
          </h2>
          <p className="text-sm sm:text-base text-ink-muted font-light leading-relaxed mt-2">
            Choose a fixed discovery sprint or embed a dedicated engineering retainer into your team.
          </p>

          {/* Cadence Toggle Switch */}
          <div className="mt-8 inline-flex items-center p-1 border border-line bg-card">
            <button
              type="button"
              onClick={() => setCadence("monthly")}
              className={`px-5 py-2 font-mono text-xs font-bold uppercase tracking-wider transition cursor-pointer ${
                cadence === "monthly"
                  ? "bg-action text-on-action"
                  : "text-ink-muted hover:text-ink"
              }`}
            >
              Monthly Retainer
            </button>
            <button
              type="button"
              onClick={() => setCadence("quarterly")}
              className={`px-5 py-2 font-mono text-xs font-bold uppercase tracking-wider transition cursor-pointer flex items-center gap-1.5 ${
                cadence === "quarterly"
                  ? "bg-action text-on-action"
                  : "text-ink-muted hover:text-ink"
              }`}
            >
              <span>Quarterly</span>
              <span className="bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[9px] px-1.5 py-0.2 uppercase font-bold">
                Save 10%
              </span>
            </button>
          </div>
        </div>

        {/* 3 Pricing Cards Grid */}
        <div className="grid gap-6 lg:grid-cols-3 items-stretch">
          {PRICING_TIERS.map((tier) => {
            const priceVal =
              tier.isFixed
                ? tier.fixedPriceText
                : cadence === "quarterly"
                ? `$${tier.quarterlyPrice.toLocaleString()}`
                : `$${tier.monthlyPrice.toLocaleString()}`;

            const calculatedAmount =
              tier.isFixed
                ? tier.monthlyPrice
                : cadence === "quarterly"
                ? tier.quarterlyPrice * 3
                : tier.monthlyPrice;

            const ctaUrl = `/billing/pay?service=${encodeURIComponent(
              tier.name
            )}&amount=${calculatedAmount}`;

            return (
              <div
                key={tier.id}
                className={`relative border flex flex-col justify-between p-8 sm:p-10 transition ${
                  tier.featured
                    ? "border-action bg-canvas shadow-xl ring-1 ring-action"
                    : "border-line bg-card hover:border-action/40"
                }`}
              >
                {tier.featured && (
                  <span className="absolute -top-3 left-8 bg-action text-white font-mono text-[10px] font-bold uppercase tracking-[0.14em] px-3 py-1">
                    {tier.badge}
                  </span>
                )}

                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold uppercase text-ink tracking-tight">
                      {tier.name}
                    </h3>
                    {!tier.featured && tier.badge && (
                      <span className="font-mono text-[9px] font-bold uppercase bg-surface border border-line text-ink-muted px-2 py-0.5">
                        {tier.badge}
                      </span>
                    )}
                  </div>

                  <div className="mt-6 flex items-baseline gap-2">
                    <span className="text-4xl sm:text-5xl font-bold tracking-tight text-ink">
                      {priceVal}
                    </span>
                    <span className="font-mono text-[11px] text-ink-muted uppercase">
                      // {tier.cadenceNote}
                    </span>
                  </div>

                  {cadence === "quarterly" && !tier.isFixed && (
                    <span className="inline-block mt-1 font-mono text-[10px] text-emerald-600 dark:text-emerald-400 font-bold uppercase">
                      Billed quarterly ($
                      {(tier.quarterlyPrice * 3).toLocaleString()} total &bull; Save $
                      {((tier.monthlyPrice - tier.quarterlyPrice) * 3).toLocaleString()})
                    </span>
                  )}

                  <p className="mt-4 text-xs sm:text-sm text-ink-muted font-light leading-relaxed">
                    {tier.description}
                  </p>

                  <div className="mt-6 pt-6 border-t border-line">
                    <span className="font-mono text-[10px] uppercase tracking-wider text-ink-muted block mb-1">
                      Ideal For:
                    </span>
                    <span className="font-mono text-xs font-bold text-ink block">
                      {tier.idealFor}
                    </span>
                  </div>

                  <div className="mt-6 space-y-3">
                    <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-action block">
                      Key Scope Deliverables:
                    </span>
                    <ul className="space-y-2.5">
                      {tier.deliverables.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2.5 text-xs text-ink-muted">
                          <Check size={14} className="text-action shrink-0 mt-0.5" />
                          <span className="leading-snug">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="mt-10 pt-6 border-t border-line">
                  <Link
                    href={ctaUrl}
                    className={`w-full py-3.5 px-4 font-mono text-xs font-bold uppercase tracking-[0.12em] flex items-center justify-center gap-2 transition ${
                      tier.featured
                        ? "bg-action text-white hover:bg-action-strong"
                        : "border border-line bg-surface text-ink hover:border-action hover:text-action"
                    }`}
                  >
                    <span>{tier.ctaText}</span>
                    <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        {/* Specialized Scoped Add-ons */}
        <div className="mt-16 pt-12 border-t border-line">
          <div className="mb-8">
            <span className="font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-action">
              Specialized Modules // Fixed-Bid Sprints
            </span>
            <h3 className="mt-2 text-2xl font-bold uppercase text-ink">
              Targeted Technical Add-ons
            </h3>
            <p className="mt-1 text-sm text-ink-muted font-light">
              Add specialized capabilities to your retainer or execute them as standalone milestones.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {ADDONS.map((addon) => {
              const Icon = addon.icon;
              return (
                <div
                  key={addon.title}
                  className="border border-line bg-card p-6 flex flex-col justify-between hover:border-action/40 transition"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <div className="p-2.5 border border-line bg-surface text-action">
                        <Icon size={18} />
                      </div>
                      <span className="text-xl font-bold text-ink">{addon.price}</span>
                    </div>

                    <h4 className="mt-4 text-base font-bold text-ink uppercase">
                      {addon.title}
                    </h4>
                    <span className="font-mono text-[10px] text-ink-muted uppercase block mt-0.5">
                      // {addon.cadence}
                    </span>
                    <p className="mt-2.5 text-xs text-ink-muted font-light leading-relaxed">
                      {addon.description}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-line">
                    <Link
                      href={addon.href}
                      className="inline-flex items-center gap-1.5 font-mono text-xs font-bold uppercase tracking-wider text-action hover:underline"
                    >
                      <span>Engage Module</span>
                      <ArrowRight size={12} />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Custom SOW Proposal Banner */}
        <div className="mt-14 border border-line bg-canvas p-8 sm:p-12 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <span className="font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-action">
              Custom Statement of Work (SOW)
            </span>
            <h3 className="mt-2 text-2xl font-bold uppercase text-ink">
              Need custom enterprise architecture or a formal RFP review?
            </h3>
            <p className="mt-2 text-sm text-ink-muted font-light leading-relaxed">
              We engineer custom enterprise solutions under fixed-bid or milestone-based contracts. Mutual NDA executed prior to discovery.
            </p>
          </div>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 bg-action text-white px-6 py-3.5 font-mono text-xs font-bold uppercase tracking-wider hover:bg-action-strong transition shrink-0"
          >
            <span>Request Scoped Proposal</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      </Section>

      {/* Feature Comparison Matrix */}
      <Section className="bg-canvas border-t border-line" labelledBy="comparison-matrix">
        <SectionHeader
          id="comparison-matrix"
          eyebrow="Capability Breakdown"
          title="Compare engagement tiers"
          description="Detailed deliverables and commitments across our standard service packages."
        />

        <div className="mt-12 overflow-x-auto border border-line bg-surface">
          <table className="w-full text-left border-collapse text-xs font-mono">
            <thead>
              <tr className="border-b border-line bg-card">
                <th className="p-4 sm:p-5 font-bold uppercase text-ink text-sm">Capability / Deliverable</th>
                <th className="p-4 sm:p-5 font-bold uppercase text-ink">Discovery ($1.5k)</th>
                <th className="p-4 sm:p-5 font-bold uppercase text-action">Retainer ($3.5k/mo)</th>
                <th className="p-4 sm:p-5 font-bold uppercase text-ink">Enterprise ($6k/mo)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line text-ink-muted">
              {COMPARISON_ROWS.map((row, idx) => (
                <tr key={idx} className="hover:bg-canvas/50 transition">
                  <td className="p-4 sm:p-5 font-bold text-ink">{row.feature}</td>
                  <td className="p-4 sm:p-5">{row.discovery}</td>
                  <td className={`p-4 sm:p-5 ${row.retainerBold ? "font-bold text-action" : "text-ink"}`}>
                    {row.retainer}
                  </td>
                  <td className="p-4 sm:p-5">{row.enterprise}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      {/* Commercial Settlement Rails */}
      <Section className="bg-surface border-t border-line" labelledBy="settlement-rails">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-5 space-y-4">
            <span className="font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-action">
              Institutional Settlement Rails
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold uppercase text-ink">
              Global B2B invoicing with zero friction.
            </h2>
            <p className="text-sm text-ink-muted font-light leading-relaxed">
              We provide seamless cross-border settlement rails. Whether paying via Paddle (Cards/Apple Pay), wiring international USD via Wise, or settling in PKR via Raast, all invoices are tax-compliant with formal commercial receipts.
            </p>
            <div className="pt-4">
              <Link
                href="/billing"
                className="inline-flex items-center gap-1.5 font-mono text-xs font-bold uppercase tracking-wider text-action hover:underline"
              >
                <span>Visit Treasury & Billing Portal</span>
                <ArrowRight size={13} />
              </Link>
            </div>
          </div>

          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="border border-line bg-card p-6 space-y-2.5">
              <div className="flex items-center gap-2 font-mono text-xs font-bold uppercase text-action">
                <Globe size={16} />
                <span>Paddle Merchant of Record</span>
              </div>
              <p className="text-xs text-ink-muted font-light leading-relaxed">
                Instant card checkout, Apple Pay, Google Pay, and PayPal with automatic tax calculation and instant PDF invoices.
              </p>
            </div>

            <div className="border border-line bg-card p-6 space-y-2.5">
              <div className="flex items-center gap-2 font-mono text-xs font-bold uppercase text-action">
                <Globe size={16} />
                <span>Wise Multi-Currency Wire</span>
              </div>
              <p className="text-xs text-ink-muted font-light leading-relaxed">
                Direct local clearing in USD (ACH), EUR (SEPA), and GBP (BACS) with zero foreign exchange markups.
              </p>
            </div>

            <div className="border border-line bg-card p-6 space-y-2.5">
              <div className="flex items-center gap-2 font-mono text-xs font-bold uppercase text-action">
                <Zap size={16} />
                <span>Raast Instant Clearance (PKR)</span>
              </div>
              <p className="text-xs text-ink-muted font-light leading-relaxed">
                Zero fee, real-time PKR settlements directly to Meezan Bank with automated transaction reconciliation.
              </p>
            </div>

            <div className="border border-line bg-card p-6 space-y-2.5">
              <div className="flex items-center gap-2 font-mono text-xs font-bold uppercase text-action">
                <Lock size={16} />
                <span>30-Day Workmanship Warranty</span>
              </div>
              <p className="text-xs text-ink-muted font-light leading-relaxed">
                All delivered codebases include a full 30-day post-launch warranty covering any bugs or defect remediation.
              </p>
            </div>
          </div>
        </div>
      </Section>

      {/* Commercial FAQ Accordion */}
      <Section className="bg-canvas border-t border-line" labelledBy="pricing-faq">
        <SectionHeader
          id="pricing-faq"
          eyebrow="Commercial FAQ"
          title="Frequently Asked Questions"
          description="Everything you need to know about milestone governance, billing schedules, and engineering delivery."
        />

        <div className="mt-12 max-w-3xl mx-auto space-y-3">
          {FAQS.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                className="border border-line bg-surface transition overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(idx)}
                  className="w-full p-6 text-left flex items-center justify-between gap-4 cursor-pointer"
                >
                  <span className="text-sm sm:text-base font-bold text-ink uppercase tracking-tight flex items-center gap-2.5">
                    <span className="font-mono text-action text-xs">0{idx + 1} //</span>
                    <span>{faq.question}</span>
                  </span>
                  {isOpen ? (
                    <ChevronUp className="h-4 w-4 text-action shrink-0" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-ink-muted shrink-0" />
                  )}
                </button>

                {isOpen && (
                  <div className="px-6 pb-6 pt-1 border-t border-line/50 text-xs sm:text-sm text-ink-muted font-light leading-relaxed pl-12 animate-in fade-in duration-150">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Bottom Contact Prompt */}
        <div className="mt-14 text-center">
          <p className="text-xs font-mono text-ink-muted">
            Have custom contract requirements or need an RFP review?
          </p>
          <div className="mt-3 flex items-center justify-center gap-4">
            <Link
              href="/contact"
              className="inline-flex items-center gap-1.5 font-mono text-xs font-bold uppercase tracking-wider text-action hover:underline"
            >
              <span>Speak with Treasury & Technical Sales</span>
              <ArrowRight size={13} />
            </Link>
          </div>
        </div>
      </Section>
    </>
  );
}
