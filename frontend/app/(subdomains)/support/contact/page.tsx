import type { Metadata } from "next";
import Link from "next/link";
import {
  PhoneCall,
  Mail,
  MessageSquare,
  Ticket,
  MapPin,
  Clock,
  ExternalLink,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";
import { PageHero, Section } from "@/components/home/ui";

export const metadata: Metadata = {
  title: "Direct Contact & Emergency Hotline | TMI Helpdesk",
  description:
    "24/7 emergency dispatch line, official departmental email routing, WhatsApp concierge, and corporate contact directory.",
};

const DEPARTMENTS = [
  {
    name: "Technical Support & Engineering",
    email: "support@tauqeermustafa.tech",
    sla: "< 1-4 hours",
    desc: "System troubleshooting, bug triage, API webhooks, and cloud infrastructure.",
  },
  {
    name: "Corporate Billing & Treasury",
    email: "billing@tauqeermustafa.tech",
    sla: "< 12 hours",
    desc: "Invoice settlement, IBFT wire confirmations, Raast transfers, and contractor payouts.",
  },
  {
    name: "Client Account Management",
    email: "clients@tauqeermustafa.tech",
    sla: "< 24 hours",
    desc: "Portal onboarding, active project deliverables, contract scope, and sprint reviews.",
  },
  {
    name: "Legal, Privacy & Compliance",
    email: "legal@tauqeermustafa.tech",
    sla: "< 48 hours",
    desc: "Mutual NDAs, Data Processing Agreements (GDPR), SOC2 reports, and corporate governance.",
  },
];

export default function ContactDirectoryPage() {
  return (
    <div className="min-h-screen bg-canvas text-ink">
      <PageHero
        eyebrow="Multichannel Dispatch // Helpdesk Routing"
        title="Support Contact Directory"
        description="Direct channels for enterprise clients, partners, and systems operators. 24/7 emergency hotline, departmental routing, and live concierge."
      >
        <Link
          href="/support"
          className="inline-flex items-center gap-2 border border-line bg-surface px-5 py-2.5 font-mono text-xs font-bold uppercase tracking-wider text-ink hover:border-action hover:text-action transition"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Helpdesk</span>
        </Link>
      </PageHero>

      <Section className="bg-canvas py-10 sm:py-14">
        <div className="max-w-5xl mx-auto space-y-10">
          {/* Emergency Hotline Hero Card */}
          <div className="bg-rose-500/5 border border-rose-500/30 p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-rose-500 text-white shrink-0 mt-1">
                <PhoneCall size={24} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 bg-rose-500/10 px-2 py-0.5 border border-rose-500/20">
                    P1 Priority Escalation
                  </span>
                  <span className="font-mono text-xs text-ink-muted">15-60 min SLA</span>
                </div>
                <h2 className="text-xl font-bold uppercase text-ink mt-1">
                  24/7 Production Emergency Hotline
                </h2>
                <p className="text-xs text-ink-muted mt-1 max-w-lg">
                  Immediate voice bridge with our on-call systems commander for critical outages, security breaches, or system failures.
                </p>
              </div>
            </div>

            <a
              href="tel:+9233356701199"
              className="px-6 py-3 bg-rose-600 text-white font-mono text-xs font-bold uppercase hover:bg-rose-700 transition flex items-center gap-2 shrink-0"
            >
              <PhoneCall size={14} />
              <span>Call +92 333 56701199</span>
            </a>
          </div>

          {/* 2 Primary Messaging Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* WhatsApp Card */}
            <div className="bg-surface border border-line p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 mb-3">
                  <MessageSquare size={20} />
                  <span className="font-mono text-xs font-bold uppercase tracking-wider">
                    Corporate WhatsApp Desk
                  </span>
                </div>
                <h3 className="text-lg font-bold text-ink mb-1">Direct WhatsApp Concierge</h3>
                <p className="text-xs text-ink-muted leading-relaxed">
                  Fast, asynchronous messaging for active client requests, status checks, and design approvals.
                </p>
              </div>
              <a
                href="https://wa.me/message/TJILSTIMLJHVK1"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-600 text-white font-mono text-xs font-bold uppercase hover:bg-emerald-700 transition"
              >
                <span>Message via WhatsApp</span>
                <ExternalLink size={12} />
              </a>
            </div>

            {/* Ticket Desk Card */}
            <div className="bg-surface border border-line p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-action mb-3">
                  <Ticket size={20} />
                  <span className="font-mono text-xs font-bold uppercase tracking-wider">
                    Formal Enterprise Ticket
                  </span>
                </div>
                <h3 className="text-lg font-bold text-ink mb-1">Tracked Support Ticket</h3>
                <p className="text-xs text-ink-muted leading-relaxed">
                  Open a ticket with auto-generated reference ID, audit trail, and contractual SLA tracking.
                </p>
              </div>
              <Link
                href="/support/ticket"
                className="mt-6 inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-action text-on-action font-mono text-xs font-bold uppercase hover:bg-action-strong transition"
              >
                <span>Open Ticket Terminal</span>
                <ArrowRight size={13} />
              </Link>
            </div>
          </div>

          {/* Department Inboxes */}
          <div>
            <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-ink mb-4">
              Official Department Email Routing
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {DEPARTMENTS.map((dept) => (
                <div key={dept.name} className="bg-surface border border-line p-5 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-bold text-sm text-ink">{dept.name}</h4>
                      <span className="font-mono text-[10px] text-action font-bold uppercase">
                        SLA: {dept.sla}
                      </span>
                    </div>
                    <p className="text-xs text-ink-muted leading-relaxed mb-3">{dept.desc}</p>
                  </div>
                  <a
                    href={`mailto:${dept.email}`}
                    className="font-mono text-xs font-bold text-action hover:underline flex items-center gap-1.5"
                  >
                    <Mail size={12} />
                    <span>{dept.email}</span>
                  </a>
                </div>
              ))}
            </div>
          </div>

          {/* Global Operating Hours & Locations */}
          <div className="bg-surface border border-line p-6 grid grid-cols-1 md:grid-cols-2 gap-6 text-xs font-mono">
            <div className="flex items-start gap-3">
              <Clock className="h-5 w-5 text-action shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-ink uppercase block mb-1">Operating Hours & Coverage</span>
                <p className="text-ink-muted">Critical (P1): 24 hours / 7 days / 365 days</p>
                <p className="text-ink-muted">Standard (P2-P4): Monday &ndash; Saturday, 08:00 &ndash; 22:00 PKT</p>
                <p className="text-ink-muted">Corporate Office: Monday &ndash; Friday, 09:00 &ndash; 18:00 PKT</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-action shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-ink uppercase block mb-1">Registered Headquarters</span>
                <p className="text-ink-muted">Tauqeer Mustafa Inc.</p>
                <p className="text-ink-muted">Karachi, Sindh, Pakistan</p>
                <p className="text-ink-muted">Corporate Registry &bull; Verified Business Entity</p>
              </div>
            </div>
          </div>
        </div>
      </Section>
    </div>
  );
}
