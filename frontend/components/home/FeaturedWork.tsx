"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle } from "lucide-react";

import { imageLibrary } from "@/data/media";
import { ImagePlaceholder, Reveal, Section, fadeLeft, fadeRight } from "./ui";

const projectHighlights = [
  { label: "Authentication", detail: "SSO, MFA, role-based access control" },
  { label: "Compliance", detail: "GDPR, data encryption at rest & in transit" },
  { label: "Performance", detail: "Sub-200ms API response, 99.9% uptime" },
  { label: "Scale", detail: "Handles 10K+ concurrent users" },
];

const techStack = ["Next.js 16", "TypeScript", "FastAPI", "PostgreSQL", "Redis", "AWS", "Docker"];

export default function FeaturedWork() {
  return (
    /* White canvas tile */
    <Section className="bg-[#ffffff]" labelledBy="featured-work-title">
      <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">

        <Reveal variant={fadeLeft} className="lg:order-1">
          <div className="relative overflow-hidden rounded-[24px]" style={{ boxShadow: "rgba(0,0,0,0.15) 0px 8px 40px, rgba(0,0,0,0.08) 0px 2px 12px" }}>
            <ImagePlaceholder
              src={imageLibrary.dashboard[2]}
              title="Financial services portal — real-time data visualization"
              caption=""
            />
            <div className="absolute left-4 top-4 flex flex-wrap gap-2">
              <span className="rounded-full border border-white/30 bg-black/50 px-3 py-1.5 text-[12px] font-semibold text-white backdrop-blur-md">
                Enterprise Platform
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#34c759] px-3 py-1.5 text-[12px] font-semibold text-white">
                <CheckCircle className="h-3 w-3" aria-hidden />
                Live in Production
              </span>
            </div>
          </div>
        </Reveal>

        <Reveal variant={fadeRight} className="lg:order-2">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#0066cc]/20 bg-[#0066cc]/5 px-3 py-1.5">
            <span className="text-[13px] font-semibold leading-[1.38] tracking-[-0.224px] text-[#0066cc]">
              Case Study
            </span>
          </div>
          <h2 id="featured-work-title" className="mt-5 text-[40px] font-semibold leading-[1.1] tracking-[-0.5px] text-[#1d1d1f] sm:text-[44px]">
            Enterprise operations platform for financial services.
          </h2>
          <p className="mt-6 text-[17px] leading-[1.47] tracking-[-0.374px] text-[#6e6e73]">
            A secure, scalable platform for managing distributed teams, tracking compliance workflows, and
            generating audit-ready reports. Built to handle sensitive financial data with role-based access,
            real-time monitoring, and comprehensive logging. Deployed on AWS with automated backups and
            disaster recovery.
          </p>

          <div className="mt-8 grid grid-cols-2 gap-4">
            {projectHighlights.map((item) => (
              <div key={item.label} className="rounded-[14px] border border-[#d2d2d7] bg-[#f5f5f7] p-4">
                <dt className="text-[14px] font-semibold leading-[1.29] tracking-[-0.224px] text-[#0066cc]">{item.label}</dt>
                <dd className="mt-1.5 text-[15px] leading-[1.4] tracking-[-0.224px] text-[#1d1d1f]">{item.detail}</dd>
              </div>
            ))}
          </div>

          <div className="mt-6">
            <p className="text-[14px] font-semibold leading-[1.29] tracking-[-0.224px] text-[#86868b]">Technology Stack</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {techStack.map((tech) => (
                <span key={tech} className="inline-flex items-center rounded-full border border-[#d2d2d7] bg-white px-3 py-1.5 text-[14px] font-medium leading-[1.29] tracking-[-0.224px] text-[#1d1d1f] shadow-sm">
                  {tech}
                </span>
              ))}
            </div>
          </div>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/portfolio"
              className="apple-press inline-flex items-center justify-center gap-2 rounded-full bg-[#0066cc] px-6 py-3 text-[17px] font-semibold leading-[1.29] tracking-[-0.374px] text-white shadow-lg shadow-[#0066cc]/25 transition-all hover:bg-[#0055b3] hover:shadow-xl hover:shadow-[#0066cc]/30 sm:w-auto"
            >
              View Full Portfolio <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
            <Link
              href="/contact"
              className="apple-press inline-flex items-center justify-center gap-2 rounded-full border-2 border-[#d2d2d7] bg-transparent px-6 py-3 text-[17px] font-semibold leading-[1.29] tracking-[-0.374px] text-[#1d1d1f] transition-all hover:border-[#1d1d1f] hover:bg-[#f5f5f7] sm:w-auto"
            >
              Discuss Your Project
            </Link>
          </div>
        </Reveal>
      </div>
    </Section>
  );
}
