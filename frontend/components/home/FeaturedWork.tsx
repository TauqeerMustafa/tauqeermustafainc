"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { imageLibrary } from "@/data/media";
import { ImagePlaceholder, MStripe, Reveal, Section, fadeLeft, fadeRight } from "./ui";

/* ── bg-canvas tile — BMW typography, Mastercard radius, theme-flipping ── */

const projectHighlights = [
  { label: "Authentication", detail: "SSO, MFA, role-based access control" },
  { label: "Compliance", detail: "GDPR, data encryption at rest & in transit" },
  { label: "Performance", detail: "Sub-200ms API response, 99.9% uptime" },
  { label: "Scale", detail: "Handles 10K+ concurrent users" },
];

const techStack = ["Next.js 16", "TypeScript", "FastAPI", "PostgreSQL", "Redis", "AWS", "Docker"];

export default function FeaturedWork() {
  return (
    <Section className="bg-canvas" labelledBy="featured-work-title">
      <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">

        <Reveal variant={fadeLeft} className="lg:order-1">
          <ImagePlaceholder
            src={imageLibrary.dashboard[2]}
            title="Financial services portal"
            caption="Real-time data visualization under compliance constraints."
          />
        </Reveal>

        <Reveal variant={fadeRight} className="lg:order-2">
          <MStripe />
          <p className="mt-6 font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-action">
            Case Study
          </p>
          <h2
            id="featured-work-title"
            className="mt-4 text-[34px] font-bold uppercase leading-[1.08] tracking-[-0.02em] text-ink sm:text-[42px]"
          >
            Enterprise operations platform for financial services.
          </h2>
          <p className="mt-6 text-[17px] font-light leading-[1.6] tracking-[-0.01em] text-ink-muted sm:text-[18px]">
            A secure, scalable platform for managing distributed teams, tracking compliance workflows, and
            generating audit-ready reports. Built to handle sensitive financial data with role-based access,
            real-time monitoring, and comprehensive logging. Deployed on AWS with automated backups and
            disaster recovery.
          </p>

          <dl className="mt-8 grid gap-px border border-line bg-line sm:grid-cols-2">
            {projectHighlights.map((item) => (
              <div key={item.label} className="bg-card p-5">
                <dt className="font-mono text-[11px] font-semibold uppercase tracking-[0.12em] text-action">
                  {item.label}
                </dt>
                <dd className="mt-2 text-[15px] font-light leading-[1.5] tracking-[-0.01em] text-ink">
                  {item.detail}
                </dd>
              </div>
            ))}
          </dl>

          <div className="mt-8">
            <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-muted">
              Technology Stack
            </p>
            <div className="mt-3.5 flex flex-wrap gap-2">
              {techStack.map((tech) => (
                <span
                  key={tech}
                  className="inline-flex items-center rounded-full border border-line-2 bg-surface px-3.5 py-1.5 font-mono text-[11px] font-medium uppercase tracking-[0.08em] text-ink-2"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/portfolio"
              className="group inline-flex items-center justify-center gap-2 bg-action px-7 py-3.5 font-mono text-[12px] font-bold uppercase tracking-[0.1em] text-on-action transition-colors hover:bg-action-strong focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-action"
            >
              Full Portfolio
              <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5" aria-hidden />
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-2 border-2 border-ink bg-transparent px-7 py-3.5 font-mono text-[12px] font-bold uppercase tracking-[0.1em] text-ink transition-colors hover:bg-ink hover:text-canvas focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
            >
              Discuss Your Project
            </Link>
          </div>
        </Reveal>
      </div>
    </Section>
  );
}
