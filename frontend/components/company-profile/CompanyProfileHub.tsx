"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Download,
  Presentation,
  FileText,
  Building,
  ShieldCheck,
  Sparkles,
  Layers,
  Phone,
  MessageCircle,
  ExternalLink,
  CheckCircle2,
  Globe2,
  Copy,
  Check,
  Share2,
  BookOpen,
  Award,
  Users,
  Briefcase,
  Code,
  FolderArchive,
  Contact,
} from "lucide-react";
import { company } from "@/data/company";
import { companyMetrics, downloadableCollateral } from "@/data/company-profile";
import SlideDeckViewer from "./SlideDeckViewer";
import SourcesRegistry from "./SourcesRegistry";
import OutreachTemplates from "./OutreachTemplates";
import ClientPacketBuilder from "./ClientPacketBuilder";
import { generatePptxDeck } from "@/lib/profile-exports/generatePptx";
import {
  generateCompanyProfilePdf,
  generateExecutiveOnePagerPdf,
} from "@/lib/profile-exports/generatePdf";
import {
  generateBrandKitZip,
  generateDocxProposal,
  generateVCard,
} from "@/lib/profile-exports/generateBrandKit";

interface CompanyProfileHubProps {
  isEmployeePortal?: boolean;
}

export default function CompanyProfileHub({
  isEmployeePortal = false,
}: CompanyProfileHubProps) {
  const [activeTab, setActiveTab] = useState<
    | "deck"
    | "overview"
    | "services"
    | "sources"
    | "outreach"
    | "builder"
    | "downloads"
  >("deck");

  const [downloadingType, setDownloadingType] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  const handleDownload = async (type: string) => {
    setDownloadingType(type);
    try {
      if (type === "pptx") {
        await generatePptxDeck();
      } else if (type === "pdf") {
        generateCompanyProfilePdf();
      } else if (type === "onepager") {
        generateExecutiveOnePagerPdf();
      } else if (type === "docx") {
        generateDocxProposal();
      } else if (type === "brandkit") {
        await generateBrandKitZip();
      } else if (type === "vcard") {
        generateVCard();
      }
    } catch (err) {
      console.error(`Error generating ${type}:`, err);
    } finally {
      setDownloadingType(null);
    }
  };

  const handleCopyProfileUrl = () => {
    const url = typeof window !== "undefined" ? window.location.href : "https://portals.tauqeermustafa.tech/employees/company-profile";
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const tabs = [
    { id: "deck", label: "Interactive Presentation Deck", icon: Layers },
    { id: "overview", label: "Executive Overview & Stats", icon: Building },
    { id: "services", label: "Core Capabilities & Stack", icon: Code },
    { id: "sources", label: "Verified Sources & Channels", icon: ShieldCheck },
    ...(isEmployeePortal
      ? [
          { id: "outreach", label: "Client Outreach Scripts", icon: MessageCircle },
          { id: "builder", label: "Client Packet Builder", icon: Sparkles },
        ]
      : []),
    { id: "downloads", label: "Downloads & Collateral Vault", icon: Download },
  ] as const;

  return (
    <div className="flex flex-col gap-6">
      {/* Top Hero Banner */}
      <div className="relative overflow-hidden border border-adm-border bg-gradient-to-br from-[#0d1117] via-[#161b22] to-[#0d1117] p-6 text-white sm:p-8">
        {/* Accent Bar */}
        <div className="absolute start-0 top-0 h-1 w-full bg-gradient-to-r from-blue-600 via-sky-400 to-indigo-500" />

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-3 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1 bg-blue-500/20 border border-blue-400/30 px-2.5 py-0.5 text-[11px] font-mono font-bold uppercase tracking-wider text-sky-400">
                Official Corporate Profile
              </span>
              <span className="inline-flex items-center gap-1 bg-zinc-800 border border-zinc-700 px-2.5 py-0.5 text-[11px] font-mono text-zinc-300">
                UK Registered Entity • Est. {company.founded}
              </span>
            </div>

            <h1 className="text-2xl font-extrabold uppercase tracking-tight text-white sm:text-3xl lg:text-4xl">
              {company.name}
            </h1>

            <p className="text-sm sm:text-base font-medium text-zinc-300 leading-relaxed">
              {company.tagline}
            </p>

            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed max-w-2xl">
              {company.description}
            </p>
          </div>

          {/* Quick Action Button Box */}
          <div className="flex flex-col sm:flex-row lg:flex-col gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => handleDownload("pptx")}
              disabled={downloadingType === "pptx"}
              className="btn-press flex items-center justify-center gap-2 bg-blue-600 px-5 py-2.5 text-xs font-bold text-white transition hover:bg-blue-500 disabled:opacity-50 shadow-lg"
            >
              <Download size={15} />
              <span>{downloadingType === "pptx" ? "Generating..." : "Download PPTX Deck"}</span>
            </button>

            <button
              type="button"
              onClick={() => handleDownload("pdf")}
              disabled={downloadingType === "pdf"}
              className="btn-press flex items-center justify-center gap-2 border border-zinc-700 bg-zinc-800 px-5 py-2.5 text-xs font-bold text-white transition hover:bg-zinc-700 disabled:opacity-50"
            >
              <FileText size={15} className="text-red-400" />
              <span>{downloadingType === "pdf" ? "Generating..." : "Download PDF Profile"}</span>
            </button>

            <button
              type="button"
              onClick={handleCopyProfileUrl}
              className="flex items-center justify-center gap-2 border border-zinc-700/80 bg-zinc-900/60 px-5 py-2 text-xs font-medium text-zinc-300 transition hover:text-white"
            >
              {copiedLink ? <Check size={14} className="text-green-400" /> : <Share2 size={14} />}
              <span>{copiedLink ? "Link Copied!" : "Copy Shareable Link"}</span>
            </button>
          </div>
        </div>

        {/* Metric Strip */}
        <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 border-t border-zinc-800 pt-6">
          {companyMetrics.map((m, idx) => (
            <div key={idx} className="space-y-0.5">
              <span className="block text-lg sm:text-xl font-extrabold text-white">
                {m.value}
              </span>
              <span className="block text-[11px] font-mono uppercase tracking-wider text-sky-400 font-semibold">
                {m.label}
              </span>
              <span className="block text-[10px] text-zinc-400 leading-tight">
                {m.description}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Tab Rail */}
      <div className="flex flex-wrap gap-1 border-b border-adm-border pb-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-xs font-bold transition ${
                isActive
                  ? "border-adm-blue bg-adm-blue-light text-adm-blue"
                  : "border-transparent text-adm-text-2 hover:bg-adm-surface-2 hover:text-adm-text"
              }`}
            >
              <Icon size={15} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: PRESENTATION DECK */}
      {activeTab === "deck" && (
        <div className="space-y-6">
          <SlideDeckViewer onExportPptx={() => handleDownload("pptx")} />
        </div>
      )}

      {/* TAB 2: EXECUTIVE OVERVIEW */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Mission & Vision */}
            <div className="border border-adm-border bg-adm-surface p-6 space-y-4">
              <div className="flex items-center gap-2 text-adm-blue">
                <Building size={18} />
                <h3 className="text-sm font-bold uppercase tracking-wider text-adm-text">
                  Corporate Mission & Vision
                </h3>
              </div>

              <div>
                <h4 className="text-xs font-bold uppercase text-adm-text-3 font-mono">
                  Mission
                </h4>
                <p className="mt-1 text-sm text-adm-text leading-relaxed">
                  {company.mission}
                </p>
              </div>

              <div className="border-t border-adm-border pt-3">
                <h4 className="text-xs font-bold uppercase text-adm-text-3 font-mono">
                  Vision
                </h4>
                <p className="mt-1 text-sm text-adm-text leading-relaxed">
                  {company.vision}
                </p>
              </div>
            </div>

            {/* Operating Principles */}
            <div className="border border-adm-border bg-adm-surface p-6 space-y-4">
              <div className="flex items-center gap-2 text-adm-blue">
                <ShieldCheck size={18} />
                <h3 className="text-sm font-bold uppercase tracking-wider text-adm-text">
                  Delivery Discipline
                </h3>
              </div>

              <ul className="space-y-3 text-xs text-adm-text leading-relaxed">
                <li className="flex items-start gap-2">
                  <CheckCircle2 size={15} className="text-adm-blue shrink-0 mt-0.5" />
                  <span>
                    <strong>Technical Depth First:</strong> We analyze constraints, risks, and technical tradeoffs before writing code.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 size={15} className="text-adm-blue shrink-0 mt-0.5" />
                  <span>
                    <strong>Security as an Engineering Discipline:</strong> Secure defaults, adversarial modeling, and OWASP compliance built into every sprint.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 size={15} className="text-adm-blue shrink-0 mt-0.5" />
                  <span>
                    <strong>100% Intellectual Property Transfer:</strong> You own the code, databases, design assets, and deployment pipelines outright.
                  </span>
                </li>
              </ul>
            </div>
          </div>

          {/* Registered Offices Grid */}
          <div className="border border-adm-border bg-adm-surface p-6 space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-adm-text flex items-center gap-2">
              <Globe2 size={18} className="text-adm-blue" />
              Registered Offices & Operations
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {company.offices.map((office, idx) => (
                <div
                  key={idx}
                  className="rounded border border-adm-border bg-adm-surface-2 p-4 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs uppercase tracking-wider text-adm-blue">
                      {office.label}
                    </span>
                    <span className="text-[11px] font-mono text-adm-text-3">
                      {office.city}
                    </span>
                  </div>
                  <p className="text-xs text-adm-text font-medium">{office.address}</p>
                  <a
                    href={office.mapEmbedUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-adm-blue hover:underline pt-1"
                  >
                    <span>View Map & Verification</span>
                    <ExternalLink size={12} />
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: CORE CAPABILITIES & TECH STACK */}
      {activeTab === "services" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              {
                title: "Web Platforms & Enterprise SaaS",
                tag: "High-Throughput",
                desc: "Modern Next.js 15, React 19, TypeScript, and Supabase platforms engineered for sub-100ms response times globally.",
                stack: ["Next.js", "React 19", "TypeScript", "Tailwind CSS", "Node.js"],
              },
              {
                title: "Cybersecurity & DevSecOps",
                tag: "Zero-Trust",
                desc: "Penetration testing, adversarial threat modeling, OWASP Top 10 mitigation, and automated container vulnerability audits.",
                stack: ["OWASP", "Pen Testing", "TLS 1.3", "RBAC", "CI/CD Scanning"],
              },
              {
                title: "AI Workflows & RAG Systems",
                tag: "Intelligent Logic",
                desc: "Custom LLM integrations, retrieval-augmented generation (RAG), vector databases, and automated document processing pipelines.",
                stack: ["LLMs", "RAG", "Python / FastAPI", "Embeddings", "Automation"],
              },
              {
                title: "Cloud Infrastructure & SRE",
                tag: "99.98% SLA",
                desc: "Resilient Kubernetes, Docker, AWS/GCP architecture, multi-region failover, and high-concurrency database pooling.",
                stack: ["Docker", "Kubernetes", "AWS ECS", "PostgreSQL", "Redis"],
              },
              {
                title: "Enterprise Product Systems",
                tag: "WCAG 2.1 AA",
                desc: "Comprehensive design systems, conversion architectures, fluid typography, and accessible multi-tenant interfaces.",
                stack: ["Design Tokens", "Figma", "Framer Motion", "Accessible UI"],
              },
              {
                title: "FinTech & Payment Systems",
                tag: "Multi-Currency",
                desc: "Paddle Node SDK, Stripe webhooks, subscription lifecycle management, tax compliance, and automated ledger reconciliation.",
                stack: ["Paddle SDK", "Stripe API", "Webhooks", "Billing Portal"],
              },
            ].map((service, idx) => (
              <div
                key={idx}
                className="border border-adm-border bg-adm-surface p-5 space-y-3 flex flex-col justify-between hover:border-adm-blue transition"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider bg-adm-blue-light text-adm-blue px-2 py-0.5">
                      {service.tag}
                    </span>
                    <span className="text-xs font-mono text-adm-text-3">0{idx + 1}</span>
                  </div>
                  <h3 className="text-sm font-bold text-adm-text">{service.title}</h3>
                  <p className="text-xs text-adm-text-3 leading-relaxed">{service.desc}</p>
                </div>

                <div className="border-t border-adm-border pt-3">
                  <p className="text-[10px] font-mono uppercase text-adm-text-3 font-semibold mb-1.5">
                    Technologies:
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {service.stack.map((tech, tIdx) => (
                      <span
                        key={tIdx}
                        className="rounded border border-adm-border bg-adm-surface-2 px-1.5 py-0.5 text-[10px] font-mono text-adm-text-2"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: VERIFIED SOURCES & CREDENTIALS */}
      {activeTab === "sources" && <SourcesRegistry />}

      {/* TAB 5: CLIENT OUTREACH SCRIPTS (EMPLOYEE ONLY) */}
      {activeTab === "outreach" && isEmployeePortal && <OutreachTemplates />}

      {/* TAB 6: CLIENT PACKET BUILDER (EMPLOYEE ONLY) */}
      {activeTab === "builder" && isEmployeePortal && <ClientPacketBuilder />}

      {/* TAB 7: DOWNLOADS & COLLATERAL VAULT */}
      {activeTab === "downloads" && (
        <div className="space-y-6">
          <div className="border border-adm-border bg-adm-surface p-5">
            <h2 className="text-base font-bold uppercase text-adm-text">
              Official Collateral & Export Center
            </h2>
            <p className="text-xs text-adm-text-3 mt-0.5">
              Download presentation decks, official profile documents, Word proposals, media kits, and contact cards.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {downloadableCollateral.map((item) => (
              <div
                key={item.id}
                className="border border-adm-border bg-adm-surface p-5 space-y-4 flex flex-col justify-between hover:border-adm-blue transition"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold uppercase px-2 py-0.5 bg-adm-surface-2 text-adm-text border border-adm-border">
                      {item.format}
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-adm-blue bg-adm-blue-light px-2 py-0.5">
                      {item.badge}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-adm-text">{item.title}</h3>
                  <p className="text-xs text-adm-text-3 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="border-t border-adm-border pt-4 flex items-center justify-between">
                  <span className="text-xs font-mono text-adm-text-3">
                    Size: {item.fileSize}
                  </span>

                  <button
                    type="button"
                    onClick={() => handleDownload(item.type)}
                    disabled={downloadingType === item.type}
                    className="btn-press flex items-center gap-1.5 bg-adm-blue px-4 py-1.5 text-xs font-bold text-white transition hover:opacity-90 disabled:opacity-50"
                  >
                    <Download size={13} />
                    <span>
                      {downloadingType === item.type ? "Generating..." : `Download ${item.format}`}
                    </span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
