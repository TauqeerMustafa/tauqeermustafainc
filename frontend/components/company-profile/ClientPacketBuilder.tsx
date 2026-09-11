"use client";

import { useState } from "react";
import {
  Sparkles,
  Copy,
  Check,
  Share2,
  FileText,
  MessageCircle,
  Mail,
  Layers,
  ShieldCheck,
  CheckSquare,
  ExternalLink,
} from "lucide-react";
import { company } from "@/data/company";

export default function ClientPacketBuilder() {
  const [clientName, setClientName] = useState("");
  const [clientCompany, setClientCompany] = useState("");
  const [employeeName, setEmployeeName] = useState("");
  const [includeWeb, setIncludeWeb] = useState(true);
  const [includeSecurity, setIncludeSecurity] = useState(true);
  const [includeAi, setIncludeAi] = useState(true);
  const [includeCloud, setIncludeCloud] = useState(true);
  const [includeCaseStudies, setIncludeCaseStudies] = useState(true);
  const [includeLegal, setIncludeLegal] = useState(true);
  const [includeWhatsApp, setIncludeWhatsApp] = useState(true);

  const [copied, setCopied] = useState(false);

  const buildPacketText = () => {
    const greeting = clientName.trim() ? `Hi ${clientName.trim()},` : "Hello,";
    const companyRef = clientCompany.trim() ? ` for ${clientCompany.trim()}` : "";
    const sender = employeeName.trim() ? employeeName.trim() : "The TMI Engineering Team";

    let sections: string[] = [];

    sections.push(`${greeting}

Here is the customized Tauqeer Mustafa Inc. (TMI) technical capabilities and collateral package${companyRef}:

═══════════════════════════════════════════════════════
TAUQEER MUSTAFA INC. — TECHNICAL PROFILE & CAPABILITIES
"Engineering that ships. Security that holds."
Official Portal: https://tauqeermustafa.tech/company-profile
═══════════════════════════════════════════════════════`);

    sections.push(`1. EXECUTIVE SUMMARY & CREDENTIALS
• Registered UK Head Office: TMHQ, 6 Milton Rd, Harrow HA1 1XX, London, UK
• Regional Engineering Office: Islamabad, Pakistan
• SLA Reliability: 99.98% production uptime
• Direct Leadership: Lead engineer governance with 100% intellectual property transfer.`);

    let services: string[] = [];
    if (includeWeb) {
      services.push("• Web Platforms & Enterprise SaaS: Next.js 15, React 19, TypeScript, sub-100ms response architectures.");
    }
    if (includeSecurity) {
      services.push("• Cybersecurity & DevSecOps: OWASP Top 10 mitigation, zero-trust RBAC, penetration testing, and container auditing.");
    }
    if (includeAi) {
      services.push("• AI Automation & Custom RAG: Custom LLM integrations, document intelligence, and agentic workflows.");
    }
    if (includeCloud) {
      services.push("• Cloud Infrastructure & SRE: Docker, Kubernetes, AWS/GCP, automated CI/CD pipelines.");
    }

    if (services.length > 0) {
      sections.push(`2. RELEVANT TECHNICAL CAPABILITIES\n${services.join("\n")}`);
    }

    if (includeCaseStudies) {
      sections.push(`3. PROVEN TRACK RECORD & CASE HIGHLIGHTS
• Multi-Currency Checkout & Billing: Enterprise Paddle & Stripe webhook synchronization.
• High-Concurrency Cloud Systems: Optimized Next.js and PostgreSQL scaling with zero downtime.
• Enterprise Security Auditing: Comprehensive vulnerability assessments and zero-vulnerability launches.`);
    }

    if (includeLegal) {
      sections.push(`4. GOVERNANCE, SECURITY & LEGAL COMPLIANCE
• Mutual NDA: https://tauqeermustafa.tech/documents/nda
• Information Security Policy: https://tauqeermustafa.tech/documents/security-policy
• Service Level Agreement (SLA): https://tauqeermustafa.tech/documents/sla
• GDPR & Privacy Terms: https://tauqeermustafa.tech/documents/gdpr`);
    }

    if (includeWhatsApp) {
      sections.push(`5. DIRECT COMMUNICATION CHANNELS
• Sales & Inquiries WhatsApp: ${company.whatsappChannels.general.url}
• 24/7 Client Helpdesk: https://${company.whatsappChannels.support.url}
• Commercial Proposals Desk: ${company.emails.sales}
• Founder GitHub: ${company.social.github}`);
    }

    sections.push(`You can also review and download our complete 10-slide PowerPoint pitch deck and official PDF profile directly at:
👉 https://tauqeermustafa.tech/company-profile

Looking forward to connecting with your team.

Best regards,
${sender}
Tauqeer Mustafa Inc. | https://tauqeermustafa.tech`);

    return sections.join("\n\n");
  };

  const handleCopy = () => {
    const text = buildPacketText();
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenWhatsApp = () => {
    const text = buildPacketText();
    const encoded = encodeURIComponent(text);
    window.open(`https://api.whatsapp.com/send?text=${encoded}`, "_blank");
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.3fr] gap-6 items-start">
        {/* Left Column: Configuration Controls */}
        <div className="border border-adm-border bg-adm-surface p-5 space-y-5">
          <div>
            <h2 className="text-base font-bold uppercase text-adm-text flex items-center gap-2">
              <Sparkles size={16} className="text-adm-blue" />
              Client Packet Configurator
            </h2>
            <p className="text-xs text-adm-text-3 mt-0.5">
              Select modules to include in your personalized client dispatch summary.
            </p>
          </div>

          <div className="space-y-3 border-t border-adm-border pt-4">
            <div>
              <label className="block text-[11px] font-bold text-adm-text-2 mb-1">
                Client Contact Name
              </label>
              <input
                type="text"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="e.g. David"
                className="w-full border border-adm-border bg-adm-surface-2 px-3 py-1.5 text-xs text-adm-text outline-none focus:border-adm-blue"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-adm-text-2 mb-1">
                Client Company Name
              </label>
              <input
                type="text"
                value={clientCompany}
                onChange={(e) => setClientCompany(e.target.value)}
                placeholder="e.g. Nexus Tech"
                className="w-full border border-adm-border bg-adm-surface-2 px-3 py-1.5 text-xs text-adm-text outline-none focus:border-adm-blue"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-adm-text-2 mb-1">
                Your Name / Title
              </label>
              <input
                type="text"
                value={employeeName}
                onChange={(e) => setEmployeeName(e.target.value)}
                placeholder="e.g. Liam (Engineering Lead)"
                className="w-full border border-adm-border bg-adm-surface-2 px-3 py-1.5 text-xs text-adm-text outline-none focus:border-adm-blue"
              />
            </div>
          </div>

          {/* Module Selectors */}
          <div className="space-y-2 border-t border-adm-border pt-4">
            <p className="text-[11px] font-bold uppercase tracking-wider text-adm-text-2 mb-2">
              Select Included Modules
            </p>

            <label className="flex items-center gap-2 text-xs font-semibold text-adm-text cursor-pointer">
              <input
                type="checkbox"
                checked={includeWeb}
                onChange={(e) => setIncludeWeb(e.target.checked)}
                className="h-3.5 w-3.5 rounded border-adm-border text-adm-blue focus:ring-adm-blue"
              />
              <span>Web Platforms & SaaS Architecture</span>
            </label>

            <label className="flex items-center gap-2 text-xs font-semibold text-adm-text cursor-pointer">
              <input
                type="checkbox"
                checked={includeSecurity}
                onChange={(e) => setIncludeSecurity(e.target.checked)}
                className="h-3.5 w-3.5 rounded border-adm-border text-adm-blue focus:ring-adm-blue"
              />
              <span>Cybersecurity & Zero-Trust Auditing</span>
            </label>

            <label className="flex items-center gap-2 text-xs font-semibold text-adm-text cursor-pointer">
              <input
                type="checkbox"
                checked={includeAi}
                onChange={(e) => setIncludeAi(e.target.checked)}
                className="h-3.5 w-3.5 rounded border-adm-border text-adm-blue focus:ring-adm-blue"
              />
              <span>AI Integration & Intelligent Workflows</span>
            </label>

            <label className="flex items-center gap-2 text-xs font-semibold text-adm-text cursor-pointer">
              <input
                type="checkbox"
                checked={includeCloud}
                onChange={(e) => setIncludeCloud(e.target.checked)}
                className="h-3.5 w-3.5 rounded border-adm-border text-adm-blue focus:ring-adm-blue"
              />
              <span>Cloud Infrastructure & SRE (99.98% SLA)</span>
            </label>

            <label className="flex items-center gap-2 text-xs font-semibold text-adm-text cursor-pointer">
              <input
                type="checkbox"
                checked={includeCaseStudies}
                onChange={(e) => setIncludeCaseStudies(e.target.checked)}
                className="h-3.5 w-3.5 rounded border-adm-border text-adm-blue focus:ring-adm-blue"
              />
              <span>Case Studies & Track Record</span>
            </label>

            <label className="flex items-center gap-2 text-xs font-semibold text-adm-text cursor-pointer">
              <input
                type="checkbox"
                checked={includeLegal}
                onChange={(e) => setIncludeLegal(e.target.checked)}
                className="h-3.5 w-3.5 rounded border-adm-border text-adm-blue focus:ring-adm-blue"
              />
              <span>NDA, Security & Legal Compliance Links</span>
            </label>

            <label className="flex items-center gap-2 text-xs font-semibold text-adm-text cursor-pointer">
              <input
                type="checkbox"
                checked={includeWhatsApp}
                onChange={(e) => setIncludeWhatsApp(e.target.checked)}
                className="h-3.5 w-3.5 rounded border-adm-border text-adm-blue focus:ring-adm-blue"
              />
              <span>WhatsApp Direct & Helpdesk Links</span>
            </label>
          </div>
        </div>

        {/* Right Column: Live Generated Packet Preview & Actions */}
        <div className="border border-adm-border bg-adm-surface p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-adm-border pb-3">
            <div>
              <h3 className="text-sm font-bold text-adm-text">
                Live Generated Client Packet
              </h3>
              <p className="text-xs text-adm-text-3">
                Ready to dispatch via WhatsApp, Email, or client portal.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopy}
                className="btn-press flex items-center gap-1.5 bg-adm-blue px-3.5 py-1.5 text-xs font-bold text-white transition hover:opacity-90"
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
                <span>{copied ? "Copied!" : "1-Click Copy"}</span>
              </button>

              <button
                type="button"
                onClick={handleOpenWhatsApp}
                className="btn-press flex items-center gap-1.5 bg-green-600 px-3.5 py-1.5 text-xs font-bold text-white transition hover:opacity-90"
                title="Send via WhatsApp Web"
              >
                <MessageCircle size={14} />
                <span>Share to WhatsApp</span>
              </button>
            </div>
          </div>

          <div className="rounded border border-adm-border/80 bg-adm-surface-2 p-4 font-mono text-xs text-adm-text-2 leading-relaxed whitespace-pre-wrap select-all max-h-[520px] overflow-y-auto">
            {buildPacketText()}
          </div>
        </div>
      </div>
    </div>
  );
}
