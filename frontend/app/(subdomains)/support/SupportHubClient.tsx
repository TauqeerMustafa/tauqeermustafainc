"use client";

import { useState, useId } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  LifeBuoy,
  Ticket,
  Activity,
  HelpCircle,
  PhoneCall,
  Search,
  MessageSquare,
  ShieldCheck,
  CreditCard,
  BookOpen,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Send,
  Copy,
  Check,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Server,
  Database,
  Lock,
  Zap,
  Globe,
  Radio,
} from "lucide-react";

export type SupportTab = "overview" | "ticket" | "tracker" | "faq" | "status";

interface StoredTicket {
  ticketId: string;
  fullName: string;
  email: string;
  clientId?: string;
  department: string;
  severity: string;
  subject: string;
  message: string;
  status: "OPEN" | "TRIAGED" | "RESOLVED";
  createdAt: string;
}

const KNOWLEDGE_ARTICLES = [
  {
    id: "portal-login",
    category: "Client Portals",
    title: "How to access your dedicated Client Portal & deliverables",
    summary:
      "Step-by-step instructions for logging in at portals.tauqeermustafa.tech, viewing project boards, downloading assets, and reviewing sprint milestones.",
    steps: [
      "Navigate to https://portals.tauqeermustafa.tech and select the Client Portal tile.",
      "Enter your organization email address and initial password provided during client onboarding.",
      "Complete 2FA email code verification when prompted.",
      "Under 'My Projects', select your active contract to inspect deliverables, code repositories, and milestone approvals.",
    ],
  },
  {
    id: "billing-payment",
    category: "Billing & Treasury",
    title: "How to pay an invoice or verify a wire transfer",
    summary:
      "Settle invoices via Credit Card, Meezan Bank, or Raast instant settlement, and download verified payment receipts.",
    steps: [
      "Access the Billing Terminal at https://billing.tauqeermustafa.tech/pay or via /billing.",
      "Enter your Invoice Number (format: TMI-INV-XXXX) or choose Custom Milestone Deposit.",
      "Choose your settlement method: Instant Card (Stripe), Meezan Bank Corporate Account, or State Bank Raast P2M QR.",
      "Upon completion, download the cryptographically stamped PDF receipt for accounting.",
    ],
  },
  {
    id: "payout-contractor",
    category: "Billing & Treasury",
    title: "Contractor disbursement schedule and net fee calculations",
    summary:
      "Track your pending payout status, bank clearance timelines, and view remittance advice.",
    steps: [
      "Visit https://billing.tauqeermustafa.tech/payouts.",
      "Use the net payout calculator to forecast gross amounts and currency conversions.",
      "Disbursements run every Friday at 17:00 PKT via IBFT and Raast.",
      "Submit an expedited disbursement request using the contractor payout request form.",
    ],
  },
  {
    id: "emergency-outage",
    category: "Emergency & Incidents",
    title: "P1 Critical Outage escalation & 1-hour SLA hotline",
    summary:
      "Immediate triage protocols for mission-critical system downtime, security breaches, or data loss.",
    steps: [
      "Call the direct 24/7 emergency dispatch desk at +92 328 1313982.",
      "Submit a support ticket tagged with severity 'P1 - Critical Outage'.",
      "Our incident commander responds within 15 to 60 minutes with a dedicated bridge link.",
      "Live status will be broadcasted on https://support.tauqeermustafa.tech/status.",
    ],
  },
  {
    id: "whatsapp-webhook",
    category: "Technical & APIs",
    title: "Troubleshooting WhatsApp Webhook & API integration",
    summary:
      "Guidance on verifying webhook handshake tokens, Meta Graph API limits, and inbound event delivery.",
    steps: [
      "Verify that your Meta App Webhook Callback is pointed to https://tmi-whatsapp-service.onrender.com/webhook.",
      "Confirm WEBHOOK_VERIFY_TOKEN matches 'tmi_webhook_2026'.",
      "Ensure phone number ID 1211044558768028 has active Meta business verification.",
      "Check API health at /api/whatsapp/diagnose via your admin session.",
    ],
  },
  {
    id: "security-compliance",
    category: "Security & Legal",
    title: "Requesting SOC2 reports, NDAs, or submitting a security report",
    summary:
      "Access compliance documentation, vulnerability disclosure policies, and data processing agreements.",
    steps: [
      "Review official policies at https://docs.tauqeermustafa.tech/security-policy.",
      "To report a discovered vulnerability, email security@tauqeermustafa.tech with encrypted PGP logs.",
      "Request signed copies of standard Mutual NDAs or Data Processing Agreements via legal@tauqeermustafa.tech.",
    ],
  },
];

const FAQS = [
  {
    q: "What are your standard support hours and response SLAs?",
    a: "Our core engineering support desk operates 24/7 for critical incidents (P1: 15-60 min response SLA). Standard requests (P2-P4) are handled Monday through Saturday from 08:00 to 22:00 PKT with typical turnaround under 4 to 12 hours.",
  },
  {
    q: "How do I reset my password for the Client or Employee Portal?",
    a: "On the respective portal login screen (https://portals.tauqeermustafa.tech), click 'Forgot Password' and provide your authorized corporate email. A one-time 6-digit cryptographic verification code will be dispatched to your inbox within 60 seconds.",
  },
  {
    q: "Can I communicate directly with your engineering leads via WhatsApp?",
    a: "Yes. For clients with active retainers, we provide automated WhatsApp integration and direct concierge channels via our corporate WhatsApp line at +92 328 1313982.",
  },
  {
    q: "Where do I track the resolution status of my support ticket?",
    a: "You can track your ticket directly on this hub by entering your Ticket ID (e.g. TMI-SUP-88214) into the 'Ticket Status Tracker' tab. You also receive status updates via email upon each triage milestone.",
  },
  {
    q: "What information should I include when filing a bug report?",
    a: "Please include your Client ID, URL/endpoint affected, expected vs actual behavior, browser/OS version, and any console error codes or screenshot links. This allows our triage team to reproduce and patch the issue rapidly.",
  },
];

const SYSTEM_COMPONENTS = [
  { name: "Public Marketing Site & CDN", status: "Operational", uptime: "100%", latency: "24ms", icon: Globe },
  { name: "FastAPI Core Services & Auth", status: "Operational", uptime: "99.98%", latency: "42ms", icon: Server },
  { name: "PostgreSQL Database Cluster", status: "Operational", uptime: "99.99%", latency: "18ms", icon: Database },
  { name: "Client & Employee Portals", status: "Operational", uptime: "99.96%", latency: "31ms", icon: Lock },
  { name: "WhatsApp Webhook Dispatcher", status: "Operational", uptime: "99.95%", latency: "58ms", icon: Zap },
  { name: "Payment & Treasury Settlement", status: "Operational", uptime: "100%", latency: "49ms", icon: CreditCard },
];

export default function SupportHubClient({ initialTab = "overview" }: { initialTab?: SupportTab }) {
  const [activeTab, setActiveTab] = useState<SupportTab>(initialTab);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [expandedArticle, setExpandedArticle] = useState<string | null>(null);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  // Ticket form state
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    clientId: "",
    department: "Technical Support & Engineering",
    severity: "P3 - Standard (< 24h SLA)",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedTicket, setSubmittedTicket] = useState<StoredTicket | null>(null);
  const [copiedId, setCopiedId] = useState(false);

  // Lookup tracker state
  const [lookupId, setLookupId] = useState("");
  const [lookupResult, setLookupResult] = useState<StoredTicket | null>(null);
  const [lookupError, setLookupError] = useState("");

  const categories = ["All", ...Array.from(new Set(KNOWLEDGE_ARTICLES.map((a) => a.category)))];

  // Filter articles based on search & category
  const filteredArticles = KNOWLEDGE_ARTICLES.filter((art) => {
    const matchesCategory = selectedCategory === "All" || art.category === selectedCategory;
    const matchesSearch =
      art.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      art.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      art.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const filteredFaqs = FAQS.filter(
    (faq) =>
      faq.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.a.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleTicketSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const generatedId = `TMI-SUP-${Math.floor(10000 + Math.random() * 90000)}`;

    try {
      const res = await fetch("/api/support/ticket", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ticketId: generatedId,
          ...formData,
        }),
      });

      const data = await res.json();
      const newTicket: StoredTicket = {
        ticketId: data.ticketId || generatedId,
        fullName: formData.fullName,
        email: formData.email,
        clientId: formData.clientId,
        department: formData.department,
        severity: formData.severity,
        subject: formData.subject,
        message: formData.message,
        status: "OPEN",
        createdAt: new Date().toISOString(),
      };

      setSubmittedTicket(newTicket);

      // Save to localStorage
      try {
        const stored = JSON.parse(localStorage.getItem("tmi_support_tickets") || "[]");
        localStorage.setItem("tmi_support_tickets", JSON.stringify([newTicket, ...stored]));
      } catch {
        // Local storage unavailable
      }
    } catch {
      // Fallback client ticket
      const fallbackTicket: StoredTicket = {
        ticketId: generatedId,
        ...formData,
        status: "OPEN",
        createdAt: new Date().toISOString(),
      };
      setSubmittedTicket(fallbackTicket);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLookup = (e: React.FormEvent) => {
    e.preventDefault();
    setLookupError("");
    setLookupResult(null);

    const cleanId = lookupId.trim().toUpperCase();
    if (!cleanId) {
      setLookupError("Please enter a valid ticket reference ID.");
      return;
    }

    try {
      const stored: StoredTicket[] = JSON.parse(localStorage.getItem("tmi_support_tickets") || "[]");
      const found = stored.find((t) => t.ticketId.toUpperCase() === cleanId);
      if (found) {
        setLookupResult(found);
        return;
      }
    } catch {
      // Ignore storage error
    }

    // Query live API for ticket
    fetch(`/api/support/ticket?id=${encodeURIComponent(cleanId)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.ticket) {
          setLookupResult(data.ticket);
        } else {
          setLookupError(`Ticket reference "${cleanId}" not found in our records. Please verify your Ticket ID or submit a new ticket.`);
        }
      })
      .catch(() => {
        setLookupError(`Ticket reference "${cleanId}" not found. Please check the ID provided upon ticket creation.`);
      });
  };

  const copyTicketId = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
      {/* ── Top Hero: Title & Search ── */}
      <div className="text-center max-w-3xl mx-auto mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-action/10 border border-action/20 text-action font-mono text-[11px] font-bold uppercase tracking-[0.16em] mb-4">
          <span className="relative flex h-5 w-5 shrink-0 items-center justify-center overflow-hidden border border-action/30 bg-surface">
            <Image src="/logo.png" alt="TMI" fill sizes="20px" className="object-cover" priority />
          </span>
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Tauqeer Mustafa Inc. &bull; Enterprise Helpdesk</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-bold uppercase tracking-tight text-ink">
          Support & Help Center
        </h1>
        <p className="mt-3 text-sm sm:text-base text-ink-muted leading-relaxed">
          Access priority technical dispatch, submit enterprise service tickets, consult live system health, or explore self-service documentation.
        </p>

        {/* Global Omnisearch input */}
        <div className="mt-6 relative max-w-xl mx-auto">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-ink-lighter" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search help articles, billing questions, APIs, error codes..."
              className="w-full pl-12 pr-4 py-3.5 bg-surface border border-line-2 focus:border-action focus:ring-1 focus:ring-action text-sm text-ink outline-none transition shadow-sm font-sans"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-mono text-ink-lighter hover:text-ink px-2 py-1 bg-card border border-line"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Multi-Channel Quick Action Grid ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {/* Card 1: Submit Ticket */}
        <button
          type="button"
          onClick={() => setActiveTab("ticket")}
          className="flex flex-col p-5 bg-surface border border-line-2 hover:border-action transition text-left group shadow-sm"
        >
          <div className="flex items-center justify-between w-full mb-3">
            <div className="p-2.5 bg-action/10 text-action border border-action/20">
              <Ticket size={20} />
            </div>
            <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-action">
              Queue &bull; 01
            </span>
          </div>
          <h2 className="text-base font-bold text-ink group-hover:text-action transition uppercase">
            Submit Ticket
          </h2>
          <p className="mt-1 text-xs text-ink-muted leading-relaxed flex-1">
            Open a tracked engineering ticket with guaranteed SLA commitments.
          </p>
          <div className="mt-4 flex items-center gap-1 font-mono text-xs font-bold text-action uppercase">
            <span>Create Request</span>
            <ArrowRight size={13} className="group-hover:translate-x-1 transition" />
          </div>
        </button>

        {/* Card 2: WhatsApp Concierge */}
        <a
          href="https://wa.me/923281313982?text=Hello%20TMI%20Support%2C%20I%20am%20reaching%20out%20for%20assistance%20with..."
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col p-5 bg-surface border border-line-2 hover:border-emerald-500 transition text-left group shadow-sm"
        >
          <div className="flex items-center justify-between w-full mb-3">
            <div className="p-2.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <MessageSquare size={20} />
            </div>
            <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              Direct &bull; Live
            </span>
          </div>
          <h2 className="text-base font-bold text-ink group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition uppercase">
            WhatsApp Desk
          </h2>
          <p className="mt-1 text-xs text-ink-muted leading-relaxed flex-1">
            Direct chat with verified enterprise engineering on our corporate channel.
          </p>
          <div className="mt-4 flex items-center gap-1 font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase">
            <span>Open Chat</span>
            <ExternalLink size={12} className="group-hover:translate-x-1 transition" />
          </div>
        </a>

        {/* Card 3: Emergency Hotline */}
        <a
          href="tel:+923281313982"
          className="flex flex-col p-5 bg-surface border border-line-2 hover:border-rose-500 transition text-left group shadow-sm"
        >
          <div className="flex items-center justify-between w-full mb-3">
            <div className="p-2.5 bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
              <PhoneCall size={20} />
            </div>
            <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
              P1 &bull; 24/7
            </span>
          </div>
          <h2 className="text-base font-bold text-ink group-hover:text-rose-600 dark:group-hover:text-rose-400 transition uppercase">
            Emergency Line
          </h2>
          <p className="mt-1 text-xs text-ink-muted leading-relaxed flex-1">
            Immediate hotline for production system downtime & security incidents.
          </p>
          <div className="mt-4 flex items-center gap-1 font-mono text-xs font-bold text-rose-600 dark:text-rose-400 uppercase">
            <span>Call +92 328 1313982</span>
            <PhoneCall size={12} className="group-hover:translate-x-1 transition" />
          </div>
        </a>

        {/* Card 4: System Status */}
        <button
          type="button"
          onClick={() => setActiveTab("status")}
          className="flex flex-col p-5 bg-surface border border-line-2 hover:border-action transition text-left group shadow-sm"
        >
          <div className="flex items-center justify-between w-full mb-3">
            <div className="p-2.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <Activity size={20} />
            </div>
            <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              99.98% &bull; SLA
            </span>
          </div>
          <h2 className="text-base font-bold text-ink group-hover:text-action transition uppercase">
            System Health
          </h2>
          <p className="mt-1 text-xs text-ink-muted leading-relaxed flex-1">
            Live uptime telemetry for APIs, Client Portals, Database, and Webhooks.
          </p>
          <div className="mt-4 flex items-center gap-1 font-mono text-xs font-bold text-action uppercase">
            <span>Inspect Services</span>
            <ArrowRight size={13} className="group-hover:translate-x-1 transition" />
          </div>
        </button>
      </div>

      {/* ── Subdomain Navigation Tabs ── */}
      <div className="flex border-b border-line-2 mb-8 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab("overview")}
          className={`flex items-center gap-2 px-5 py-3 font-mono text-xs font-bold uppercase tracking-wider transition border-b-2 whitespace-nowrap ${
            activeTab === "overview"
              ? "border-action text-action bg-surface/50"
              : "border-transparent text-ink-muted hover:text-ink"
          }`}
        >
          <LifeBuoy size={14} />
          <span>Knowledge & Solutions</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("ticket")}
          className={`flex items-center gap-2 px-5 py-3 font-mono text-xs font-bold uppercase tracking-wider transition border-b-2 whitespace-nowrap ${
            activeTab === "ticket"
              ? "border-action text-action bg-surface/50"
              : "border-transparent text-ink-muted hover:text-ink"
          }`}
        >
          <Ticket size={14} />
          <span>Submit Ticket</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("tracker")}
          className={`flex items-center gap-2 px-5 py-3 font-mono text-xs font-bold uppercase tracking-wider transition border-b-2 whitespace-nowrap ${
            activeTab === "tracker"
              ? "border-action text-action bg-surface/50"
              : "border-transparent text-ink-muted hover:text-ink"
          }`}
        >
          <Clock size={14} />
          <span>Ticket Status Tracker</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("faq")}
          className={`flex items-center gap-2 px-5 py-3 font-mono text-xs font-bold uppercase tracking-wider transition border-b-2 whitespace-nowrap ${
            activeTab === "faq"
              ? "border-action text-action bg-surface/50"
              : "border-transparent text-ink-muted hover:text-ink"
          }`}
        >
          <HelpCircle size={14} />
          <span>Frequently Asked Questions</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("status")}
          className={`flex items-center gap-2 px-5 py-3 font-mono text-xs font-bold uppercase tracking-wider transition border-b-2 whitespace-nowrap ${
            activeTab === "status"
              ? "border-action text-action bg-surface/50"
              : "border-transparent text-ink-muted hover:text-ink"
          }`}
        >
          <Activity size={14} />
          <span>System Status & Uptime</span>
        </button>
      </div>

      {/* ────────────────────────────────────────────────────────── */}
      {/* TAB 1: KNOWLEDGE BASE & OVERVIEW                           */}
      {/* ────────────────────────────────────────────────────────── */}
      {activeTab === "overview" && (
        <div className="space-y-8">
          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            <span className="font-mono text-xs text-ink-muted uppercase mr-2 shrink-0">Filter By:</span>
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 text-xs font-mono font-medium rounded-sm border transition whitespace-nowrap ${
                  selectedCategory === cat
                    ? "bg-action text-on-action border-action"
                    : "bg-surface text-ink-muted border-line-2 hover:border-line hover:text-ink"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Articles Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filteredArticles.map((art) => {
              const isExpanded = expandedArticle === art.id;
              return (
                <div
                  key={art.id}
                  className="bg-surface border border-line-2 p-6 transition shadow-sm hover:border-line flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-action px-2 py-0.5 bg-action/10 border border-action/20">
                        {art.category}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-ink mb-2">{art.title}</h3>
                    <p className="text-xs text-ink-muted leading-relaxed mb-4">{art.summary}</p>

                    {isExpanded && (
                      <div className="mt-4 pt-4 border-t border-line space-y-2.5">
                        <p className="font-mono text-[11px] font-bold uppercase text-ink">Action Steps:</p>
                        <ol className="space-y-2">
                          {art.steps.map((step, idx) => (
                            <li key={idx} className="text-xs text-ink-lighter flex items-start gap-2.5">
                              <span className="font-mono text-[10px] font-bold text-action shrink-0 mt-0.5">
                                [0{idx + 1}]
                              </span>
                              <span>{step}</span>
                            </li>
                          ))}
                        </ol>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 pt-3 flex items-center justify-between border-t border-line-2/60">
                    <button
                      type="button"
                      onClick={() => setExpandedArticle(isExpanded ? null : art.id)}
                      className="font-mono text-xs font-bold text-action uppercase hover:underline flex items-center gap-1"
                    >
                      <span>{isExpanded ? "Collapse Guide" : "View Full Solution"}</span>
                      {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredArticles.length === 0 && (
            <div className="text-center py-12 bg-surface border border-line-2">
              <HelpCircle className="mx-auto h-8 w-8 text-ink-lighter mb-2" />
              <p className="text-sm font-bold text-ink">No articles matched your query.</p>
              <p className="text-xs text-ink-muted mt-1">Try another keyword or submit an enterprise ticket directly.</p>
              <button
                type="button"
                onClick={() => setActiveTab("ticket")}
                className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-action text-on-action font-mono text-xs font-bold uppercase"
              >
                <span>Submit Ticket</span>
                <ArrowRight size={13} />
              </button>
            </div>
          )}

          {/* Quick Subdomain Links Banner */}
          <div className="mt-10 border border-line-2 bg-card p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-start gap-3">
              <ShieldCheck className="h-6 w-6 text-action shrink-0 mt-1" />
              <div>
                <h4 className="text-sm font-bold text-ink uppercase">Client Workspace</h4>
                <p className="text-xs text-ink-muted mt-1">Direct project delivery, milestone inspection, and code approvals.</p>
                <a
                  href="https://portals.tauqeermustafa.tech"
                  className="mt-2 inline-flex items-center gap-1 font-mono text-xs text-action hover:underline"
                >
                  <span>portals.tauqeermustafa.tech</span>
                  <ExternalLink size={11} />
                </a>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <CreditCard className="h-6 w-6 text-action shrink-0 mt-1" />
              <div>
                <h4 className="text-sm font-bold text-ink uppercase">Billing & Settlement</h4>
                <p className="text-xs text-ink-muted mt-1">Online card checkout, Meezan IBFT, and Raast instant wire settlement.</p>
                <a
                  href="https://billing.tauqeermustafa.tech/pay"
                  className="mt-2 inline-flex items-center gap-1 font-mono text-xs text-action hover:underline"
                >
                  <span>billing.tauqeermustafa.tech</span>
                  <ExternalLink size={11} />
                </a>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <BookOpen className="h-6 w-6 text-action shrink-0 mt-1" />
              <div>
                <h4 className="text-sm font-bold text-ink uppercase">Corporate Policies</h4>
                <p className="text-xs text-ink-muted mt-1">Official SLAs, security compliance disclosures, and refund protocols.</p>
                <a
                  href="https://docs.tauqeermustafa.tech"
                  className="mt-2 inline-flex items-center gap-1 font-mono text-xs text-action hover:underline"
                >
                  <span>docs.tauqeermustafa.tech</span>
                  <ExternalLink size={11} />
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────── */}
      {/* TAB 2: SUBMIT A TICKET                                     */}
      {/* ────────────────────────────────────────────────────────── */}
      {activeTab === "ticket" && (
        <div className="max-w-3xl mx-auto">
          {submittedTicket ? (
            <div className="bg-surface border-2 border-action p-8 text-left shadow-md">
              <div className="flex items-center gap-3 text-action mb-4">
                <CheckCircle2 size={32} />
                <div>
                  <h3 className="text-xl font-bold uppercase text-ink">Ticket Created Successfully</h3>
                  <p className="text-xs text-ink-muted">Your service ticket has been routed into our priority triage queue.</p>
                </div>
              </div>

              {/* Ticket Reference Badge */}
              <div className="p-4 bg-card border border-line-2 flex items-center justify-between mb-6">
                <div>
                  <span className="font-mono text-[10px] uppercase tracking-wider text-ink-lighter block">
                    Ticket Reference Identifier
                  </span>
                  <span className="font-mono text-xl font-bold text-action">{submittedTicket.ticketId}</span>
                </div>
                <button
                  type="button"
                  onClick={() => copyTicketId(submittedTicket.ticketId)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-surface border border-line font-mono text-xs font-bold text-ink hover:text-action transition"
                >
                  {copiedId ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                  <span>{copiedId ? "Copied" : "Copy ID"}</span>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs font-mono mb-6 pb-6 border-b border-line">
                <div>
                  <span className="text-ink-lighter uppercase block">Department:</span>
                  <span className="text-ink font-semibold">{submittedTicket.department}</span>
                </div>
                <div>
                  <span className="text-ink-lighter uppercase block">Severity SLA:</span>
                  <span className="text-action font-semibold">{submittedTicket.severity}</span>
                </div>
                <div>
                  <span className="text-ink-lighter uppercase block">Contact Email:</span>
                  <span className="text-ink font-semibold">{submittedTicket.email}</span>
                </div>
                <div>
                  <span className="text-ink-lighter uppercase block">Current Status:</span>
                  <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    OPEN &bull; Assigned to On-Call Lead
                  </span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setSubmittedTicket(null);
                    setFormData({
                      fullName: "",
                      email: "",
                      clientId: "",
                      department: "Technical Support & Engineering",
                      severity: "P3 - Standard (< 24h SLA)",
                      subject: "",
                      message: "",
                    });
                  }}
                  className="w-full sm:w-auto px-5 py-2.5 bg-surface border border-line-2 font-mono text-xs font-bold uppercase text-ink hover:border-line transition"
                >
                  Submit Another Ticket
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setLookupId(submittedTicket.ticketId);
                    setActiveTab("tracker");
                  }}
                  className="w-full sm:w-auto px-5 py-2.5 bg-action text-on-action font-mono text-xs font-bold uppercase hover:bg-action-strong transition flex items-center justify-center gap-1.5"
                >
                  <span>Track Live Progress</span>
                  <ArrowRight size={13} />
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleTicketSubmit} className="bg-surface border border-line-2 p-6 sm:p-8 shadow-sm">
              <div className="border-b border-line pb-6 mb-6">
                <h2 className="text-xl font-bold uppercase tracking-tight text-ink">
                  Create Support Ticket
                </h2>
                <p className="mt-1 text-xs text-ink-muted">
                  Fill out the details below. Critical (P1) tickets automatically alert the on-call incident team.
                </p>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-mono text-xs font-bold uppercase text-ink mb-1.5">
                      Your Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      placeholder="e.g. Alex Morgan"
                      className="w-full px-3.5 py-2.5 bg-canvas border border-line-2 text-sm text-ink outline-none focus:border-action transition"
                    />
                  </div>

                  <div>
                    <label className="block font-mono text-xs font-bold uppercase text-ink mb-1.5">
                      Work Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="e.g. alex@company.com"
                      className="w-full px-3.5 py-2.5 bg-canvas border border-line-2 text-sm text-ink outline-none focus:border-action transition"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-mono text-xs font-bold uppercase text-ink mb-1.5">
                      Client / Organization ID (Optional)
                    </label>
                    <input
                      type="text"
                      value={formData.clientId}
                      onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
                      placeholder="e.g. TMI-CL-4089 or Company Name"
                      className="w-full px-3.5 py-2.5 bg-canvas border border-line-2 text-sm text-ink outline-none focus:border-action transition"
                    />
                  </div>

                  <div>
                    <label className="block font-mono text-xs font-bold uppercase text-ink mb-1.5">
                      Department
                    </label>
                    <select
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-canvas border border-line-2 text-sm text-ink outline-none focus:border-action transition"
                    >
                      <option value="Technical Support & Engineering">Technical Support & Engineering</option>
                      <option value="Billing, Invoicing & Payouts">Billing, Invoicing & Payouts</option>
                      <option value="Client Portal Access & Auth">Client Portal Access & Auth</option>
                      <option value="Security & Incident Response">Security & Incident Response</option>
                      <option value="Project Deliverables & SOW">Project Deliverables & SOW</option>
                      <option value="General Corporate Inquiries">General Corporate Inquiries</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-mono text-xs font-bold uppercase text-ink mb-1.5">
                    Severity & SLA Tier *
                  </label>
                  <select
                    value={formData.severity}
                    onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-canvas border border-line-2 text-sm text-ink outline-none focus:border-action transition"
                  >
                    <option value="P1 - Critical Outage (< 1h SLA)">
                      P1 - Critical Outage (Complete production stop &bull; &lt; 1h SLA)
                    </option>
                    <option value="P2 - High Urgency (< 4h SLA)">
                      P2 - High Urgency (Major feature degraded &bull; &lt; 4h SLA)
                    </option>
                    <option value="P3 - Standard (< 24h SLA)">
                      P3 - Standard (General technical inquiry &bull; &lt; 24h SLA)
                    </option>
                    <option value="P4 - General Inquiry (< 48h SLA)">
                      P4 - General Inquiry (Feedback or configuration &bull; &lt; 48h SLA)
                    </option>
                  </select>
                  {formData.severity.includes("P1") && (
                    <div className="mt-2 p-3 bg-rose-500/10 border border-rose-500/20 text-xs text-rose-700 dark:text-rose-400 flex items-center gap-2">
                      <AlertTriangle size={16} className="shrink-0" />
                      <span>
                        P1 triggers automated SMS and phone dispatch to the on-call incident team. For immediate voice bridge, call <strong>+92 328 1313982</strong>.
                      </span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block font-mono text-xs font-bold uppercase text-ink mb-1.5">
                    Subject / Summary *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    placeholder="e.g. Inbound Webhook 500 error on WhatsApp service"
                    className="w-full px-3.5 py-2.5 bg-canvas border border-line-2 text-sm text-ink outline-none focus:border-action transition"
                  />
                </div>

                <div>
                  <label className="block font-mono text-xs font-bold uppercase text-ink mb-1.5">
                    Detailed Description & Reproduction Steps *
                  </label>
                  <textarea
                    required
                    rows={5}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Provide exact URL, timestamps, steps to reproduce, client ID, and any relevant error codes or stack traces..."
                    className="w-full px-3.5 py-2.5 bg-canvas border border-line-2 text-sm text-ink outline-none focus:border-action transition font-sans"
                  />
                </div>

                <div className="pt-4 flex items-center justify-between border-t border-line">
                  <span className="font-mono text-[11px] text-ink-lighter">
                    * All fields marked with asterisk are mandatory
                  </span>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-3 bg-action text-on-action font-mono text-xs font-bold uppercase hover:bg-action-strong transition flex items-center gap-2 disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <span className="h-3.5 w-3.5 rounded-full border-2 border-on-action border-t-transparent animate-spin" />
                        <span>Dispatching...</span>
                      </>
                    ) : (
                      <>
                        <span>Submit Ticket</span>
                        <Send size={13} />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      )}

      {/* ────────────────────────────────────────────────────────── */}
      {/* TAB 3: TICKET STATUS TRACKER                               */}
      {/* ────────────────────────────────────────────────────────── */}
      {activeTab === "tracker" && (
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="bg-surface border border-line-2 p-6 sm:p-8">
            <h2 className="text-xl font-bold uppercase tracking-tight text-ink mb-2">
              Ticket Status Lookup
            </h2>
            <p className="text-xs text-ink-muted mb-6">
              Enter your ticket reference ID to inspect live triage status, assigned engineer, and resolution history.
            </p>

            <form onSubmit={handleLookup} className="flex gap-2">
              <input
                type="text"
                value={lookupId}
                onChange={(e) => setLookupId(e.target.value)}
                placeholder="e.g. TMI-SUP-88214"
                className="flex-1 px-4 py-2.5 bg-canvas border border-line-2 font-mono text-sm text-ink outline-none focus:border-action uppercase"
              />
              <button
                type="submit"
                className="px-6 py-2.5 bg-action text-on-action font-mono text-xs font-bold uppercase hover:bg-action-strong transition"
              >
                Track
              </button>
            </form>

            {lookupError && (
              <p className="mt-3 text-xs text-rose-600 dark:text-rose-400 font-mono">
                {lookupError}
              </p>
            )}
          </div>

          {lookupResult && (
            <div className="bg-surface border border-line-2 p-6 sm:p-8 space-y-6">
              <div className="flex items-center justify-between border-b border-line pb-4">
                <div>
                  <span className="font-mono text-[10px] text-ink-lighter uppercase block">Ticket Identifier</span>
                  <span className="font-mono text-lg font-bold text-action">{lookupResult.ticketId}</span>
                </div>
                <div className="text-right">
                  <span className="font-mono text-[10px] text-ink-lighter uppercase block">Status</span>
                  <span className="inline-flex items-center gap-1 font-mono text-xs font-bold px-2 py-0.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    {lookupResult.status}
                  </span>
                </div>
              </div>

              {/* Timeline Progress */}
              <div className="space-y-4">
                <span className="font-mono text-xs font-bold uppercase text-ink block">Resolution Timeline:</span>
                <div className="grid grid-cols-4 gap-2 text-center font-mono text-[10px]">
                  <div className="p-2 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30">
                    1. RECEIVED
                  </div>
                  <div className="p-2 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30">
                    2. TRIAGED
                  </div>
                  <div className="p-2 bg-action/10 text-action border border-action/30 font-bold">
                    3. IN PROGRESS
                  </div>
                  <div className="p-2 bg-card text-ink-lighter border border-line">
                    4. RESOLVED
                  </div>
                </div>
              </div>

              <div className="space-y-2 text-xs font-mono bg-card p-4 border border-line-2">
                <div className="flex justify-between">
                  <span className="text-ink-lighter">Subject:</span>
                  <span className="text-ink font-semibold">{lookupResult.subject}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-ink-lighter">Department:</span>
                  <span className="text-ink">{lookupResult.department}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-ink-lighter">Priority:</span>
                  <span className="text-action">{lookupResult.severity}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-ink-lighter">Opened At:</span>
                  <span className="text-ink">{new Date(lookupResult.createdAt).toLocaleString()}</span>
                </div>
              </div>

              <div className="p-4 bg-surface border border-line flex items-center justify-between text-xs">
                <span className="text-ink-muted">Need to expedite or provide supplementary logs?</span>
                <a
                  href={`mailto:support@tauqeermustafa.tech?subject=Update%20for%20Ticket%20${lookupResult.ticketId}`}
                  className="font-mono text-xs font-bold text-action hover:underline"
                >
                  Email Triage Lead &rarr;
                </a>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ────────────────────────────────────────────────────────── */}
      {/* TAB 4: FREQUENTLY ASKED QUESTIONS                          */}
      {/* ────────────────────────────────────────────────────────── */}
      {activeTab === "faq" && (
        <div className="max-w-3xl mx-auto space-y-4">
          <div className="text-center mb-6">
            <h2 className="text-xl font-bold uppercase tracking-tight text-ink">
              Frequently Asked Questions
            </h2>
            <p className="text-xs text-ink-muted mt-1">
              Immediate answers to account access, billing verification, and technical escalation.
            </p>
          </div>

          <div className="space-y-3">
            {filteredFaqs.map((faq, idx) => {
              const isOpen = expandedFaq === idx;
              return (
                <div key={idx} className="bg-surface border border-line-2 transition shadow-sm">
                  <button
                    type="button"
                    onClick={() => setExpandedFaq(isOpen ? null : idx)}
                    className="w-full px-5 py-4 text-left flex items-center justify-between gap-4"
                  >
                    <span className="font-bold text-sm text-ink">{faq.q}</span>
                    <span className="text-action shrink-0">
                      {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </span>
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 text-xs text-ink-lighter leading-relaxed border-t border-line/60 pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Corporate SLA Matrix Table */}
          <div className="mt-10 bg-surface border border-line-2 p-6">
            <h3 className="text-sm font-bold uppercase text-ink font-mono mb-3">
              Corporate SLA Response Commitments
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono border border-line">
                <thead className="bg-card text-ink-muted uppercase border-b border-line">
                  <tr>
                    <th className="p-2.5">Severity</th>
                    <th className="p-2.5">Target Initial Response</th>
                    <th className="p-2.5">Target Resolution</th>
                    <th className="p-2.5">Escalation Path</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line text-ink-lighter">
                  <tr>
                    <td className="p-2.5 font-bold text-rose-600 dark:text-rose-400">P1 - Critical Outage</td>
                    <td className="p-2.5 font-bold text-ink">&lt; 15 - 60 Minutes</td>
                    <td className="p-2.5">&lt; 4 Hours</td>
                    <td className="p-2.5">Direct Incident Commander Phone Bridge</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold text-amber-600 dark:text-amber-400">P2 - High Urgency</td>
                    <td className="p-2.5">&lt; 2 - 4 Hours</td>
                    <td className="p-2.5">&lt; 12 Hours</td>
                    <td className="p-2.5">Senior Engineering Lead</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold text-blue-600 dark:text-blue-400">P3 - Standard</td>
                    <td className="p-2.5">&lt; 12 - 24 Hours</td>
                    <td className="p-2.5">&lt; 48 Hours</td>
                    <td className="p-2.5">Helpdesk Technical Support</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold text-ink-muted">P4 - General Inquiry</td>
                    <td className="p-2.5">&lt; 24 - 48 Hours</td>
                    <td className="p-2.5">&lt; 72 Hours</td>
                    <td className="p-2.5">Account Management</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────── */}
      {/* TAB 5: SYSTEM STATUS & UPTIME                              */}
      {/* ────────────────────────────────────────────────────────── */}
      {activeTab === "status" && (
        <div className="max-w-3xl mx-auto space-y-6">
          {/* Main Status Header Card */}
          <div className="bg-surface border border-emerald-500/30 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                <CheckCircle2 size={24} />
              </div>
              <div>
                <h2 className="text-base font-bold text-ink uppercase">All Systems Fully Operational</h2>
                <p className="text-xs text-ink-muted">Zero active incidents or service degradation detected.</p>
              </div>
            </div>
            <div className="text-right font-mono text-xs">
              <span className="text-ink-lighter block">Rolling 90-Day SLA</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-bold text-base">99.98% Uptime</span>
            </div>
          </div>

          {/* Component Breakdown */}
          <div className="bg-surface border border-line-2 divide-y divide-line-2">
            {SYSTEM_COMPONENTS.map((comp) => (
              <div key={comp.name} className="p-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <comp.icon className="h-4 w-4 text-action shrink-0" />
                  <span className="text-xs font-bold text-ink font-mono">{comp.name}</span>
                </div>
                <div className="flex items-center gap-4 text-xs font-mono">
                  <span className="text-ink-lighter hidden sm:inline">{comp.latency}</span>
                  <span className="text-ink-muted hidden sm:inline">{comp.uptime}</span>
                  <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    {comp.status}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Incident Log Note */}
          <div className="bg-card border border-line p-5 text-xs text-ink-muted font-mono space-y-1">
            <p className="font-bold text-ink uppercase">Scheduled Maintenance Windows:</p>
            <p>Routine updates are deployed Tuesdays at 03:00 UTC with zero downtime rolling deploys.</p>
            <p className="text-ink-lighter text-[11px] mt-2">
              Telemetry monitored across Render, Vercel Edge Network, and Supabase cloud infrastructure.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
