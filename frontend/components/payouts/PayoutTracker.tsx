"use client";

import { useState } from "react";
import {
  Search,
  CheckCircle2,
  Clock,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  Copy,
  Check,
} from "lucide-react";

interface PayoutRecord {
  reference: string;
  payeeName: string;
  department: string;
  scope: string;
  amount: string;
  currency: string;
  method: string;
  accountMask: string;
  status: "disbursed" | "processing" | "review" | "on_hold";
  submittedDate: string;
  disbursedDate?: string;
  estimatedDate?: string;
  rrn?: string;
  notes?: string;
}

const MOCK_PAYOUTS: Record<string, PayoutRecord> = {
  "TMI-PO-2026-091": {
    reference: "TMI-PO-2026-091",
    payeeName: "Muhammad T*** M***",
    department: "Enterprise Web Development",
    scope: "Milestone 2 Delivery & Core Architecture",
    amount: "185,000",
    currency: "PKR",
    method: "Raast Instant Transfer",
    accountMask: "Meezan Bank •••• 4821",
    status: "disbursed",
    submittedDate: "Sep 02, 2026",
    disbursedDate: "Sep 04, 2026 at 14:22 PKT",
    rrn: "RST-984210398214",
    notes: "Successfully settled via State Bank Raast Gateway. Zero deductions applied.",
  },
  "TMI-PO-2026-098": {
    reference: "TMI-PO-2026-098",
    payeeName: "David K*** S***",
    department: "AI & Machine Learning",
    scope: "LLM Fine-Tuning & Evaluation Pipeline",
    amount: "1,450",
    currency: "USD",
    method: "Wise Multi-Currency Wire",
    accountMask: "Wise Account •••• 9104",
    status: "processing",
    submittedDate: "Sep 06, 2026",
    estimatedDate: "Sep 09, 2026 (Before 18:00 UTC)",
    notes: "Approved by finance lead. Queued for international batch dispatch.",
  },
  "TMI-PO-2026-104": {
    reference: "TMI-PO-2026-104",
    payeeName: "Ayesha R***",
    department: "Cybersecurity & Audit",
    scope: "API Vulnerability Assessment & Compliance Report",
    amount: "95,000",
    currency: "PKR",
    method: "Direct 1LINK Bank Wire",
    accountMask: "Habib Bank Limited •••• 1152",
    status: "review",
    submittedDate: "Sep 08, 2026",
    estimatedDate: "Sep 10, 2026",
    notes: "Deliverable verification in progress by technical project lead.",
  },
};

export default function PayoutTracker() {
  const [query, setQuery] = useState("");
  const [activeRef, setActiveRef] = useState<string | null>(null);
  const [result, setResult] = useState<PayoutRecord | null>(null);
  const [searched, setSearched] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleSearch = (codeToSearch?: string) => {
    const term = (codeToSearch ?? query).trim().toUpperCase();
    if (!term) return;

    setSearched(true);
    setActiveRef(term);

    const found = MOCK_PAYOUTS[term];
    if (found) {
      setResult(found);
    } else {
      if (term.startsWith("TMI-PO") || term.startsWith("INV-")) {
        setResult({
          reference: term,
          payeeName: "Verified Contributor",
          department: "Consulting & Services",
          scope: "Deliverable Milestone Settlement",
          amount: "—",
          currency: "USD/PKR",
          method: "Direct Electronic Transfer",
          accountMask: "Verified Banking Rail",
          status: "review",
          submittedDate: "Recent Cycle",
          estimatedDate: "Within standard 48h SLA",
          notes: "Your payout request is recorded in our ledger. Compliance check underway.",
        });
      } else {
        setResult(null);
      }
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full">
      {/* Search Bar */}
      <div className="border border-line-2 bg-surface p-6 sm:p-8">
        <div className="flex flex-col gap-2">
          <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-action">
            Live Settlement Lookup
          </span>
          <h3 className="text-xl font-bold uppercase tracking-tight text-ink sm:text-2xl">
            Track Disbursement Status
          </h3>
          <p className="text-sm font-light leading-relaxed text-ink-muted">
            Enter your Payout Reference Number (e.g.{" "}
            <code className="bg-canvas px-1.5 py-0.5 text-xs font-mono font-bold text-ink">
              TMI-PO-2026-091
            </code>
            ) or invoice code to check real-time settlement status.
          </p>
        </div>

        {/* Input & Action */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSearch();
          }}
          className="mt-6 flex flex-col gap-3 sm:flex-row"
        >
          <div className="relative flex-1">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-ink/40"
            />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Enter Payout Reference (e.g. TMI-PO-2026-091)"
              className="w-full border border-line-2 bg-card py-3.5 pl-11 pr-4 font-mono text-sm uppercase text-ink outline-none transition focus:border-action focus:ring-1 focus:ring-action placeholder:normal-case placeholder:font-sans placeholder:text-ink/40"
            />
          </div>
          <button
            type="submit"
            className="inline-flex min-h-12 items-center justify-center gap-2 bg-action px-7 font-mono text-[11px] font-bold uppercase tracking-[0.12em] text-on-action transition hover:bg-action-strong active:scale-[0.98]"
          >
            <span>Verify Status</span>
            <ArrowRight size={15} />
          </button>
        </form>

        {/* Quick Sample Queries */}
        <div className="mt-4 flex flex-wrap items-center gap-2 pt-2 border-t border-line/60">
          <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-ink/45">
            Sample References:
          </span>
          {["TMI-PO-2026-091", "TMI-PO-2026-098", "TMI-PO-2026-104"].map((code) => (
            <button
              key={code}
              type="button"
              onClick={() => {
                setQuery(code);
                handleSearch(code);
              }}
              className={`rounded-none border px-2.5 py-1 font-mono text-[11px] transition ${
                activeRef === code
                  ? "border-action bg-action/10 font-bold text-action"
                  : "border-line-2 bg-card text-ink-muted hover:border-action hover:text-action"
              }`}
            >
              {code}
            </button>
          ))}
        </div>
      </div>

      {/* Result Card */}
      {searched && (
        <div className="mt-6 animate-in fade-in slide-in-from-top-2 duration-300">
          {result ? (
            <div className="border border-line-2 bg-surface p-6 sm:p-8">
              {/* Status Header */}
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-line pb-6">
                <div>
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono text-xs font-bold uppercase text-ink-muted">
                      Reference ID:
                    </span>
                    <span className="font-mono text-sm font-bold text-action">
                      {result.reference}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopy(result.reference)}
                      className="text-ink/40 transition hover:text-action"
                      title="Copy reference"
                    >
                      {copied ? <Check size={14} className="text-green-600" /> : <Copy size={14} />}
                    </button>
                  </div>
                  <h4 className="mt-1 text-lg font-bold text-ink">{result.scope}</h4>
                  <p className="text-xs text-ink-muted">
                    Payee: <span className="font-semibold text-ink">{result.payeeName}</span> •{" "}
                    {result.department}
                  </p>
                </div>

                <div className="flex flex-col items-start sm:items-end gap-1">
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 font-mono text-[11px] font-bold uppercase tracking-wider ${
                      result.status === "disbursed"
                        ? "bg-emerald-50 text-emerald-800 border border-emerald-300 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800"
                        : result.status === "processing"
                        ? "bg-blue-50 text-blue-800 border border-blue-300 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800"
                        : "bg-amber-50 text-amber-800 border border-amber-300 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800"
                    }`}
                  >
                    {result.status === "disbursed" && <CheckCircle2 size={13} className="text-emerald-600" />}
                    {result.status === "processing" && <Clock size={13} className="text-blue-600 animate-spin" />}
                    {result.status === "review" && <Clock size={13} className="text-amber-600" />}
                    <span>
                      {result.status === "disbursed"
                        ? "Settled & Disbursed"
                        : result.status === "processing"
                        ? "Processing Batch"
                        : "Under Review"}
                    </span>
                  </span>
                  <p className="text-[11px] font-mono text-ink/50">
                    Submitted: {result.submittedDate}
                  </p>
                </div>
              </div>

              {/* Progress Stepper */}
              <div className="my-8">
                <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                  {[
                    { label: "1. Request Logged", detail: result.submittedDate, done: true },
                    {
                      label: "2. Technical Signoff",
                      detail: "Scope Verified",
                      done: result.status !== "review",
                      active: result.status === "review",
                    },
                    {
                      label: "3. Treasury Batching",
                      detail: result.method,
                      done: result.status === "disbursed",
                      active: result.status === "processing",
                    },
                    {
                      label: "4. Settled / Paid",
                      detail: result.disbursedDate ?? result.estimatedDate ?? "Pending",
                      done: result.status === "disbursed",
                      active: false,
                    },
                  ].map((step) => (
                    <div
                      key={step.label}
                      className={`relative border p-3.5 transition ${
                        step.done
                          ? "border-emerald-500/50 bg-emerald-50/30 dark:bg-emerald-950/20"
                          : step.active
                          ? "border-action bg-action/5"
                          : "border-line bg-card/50 opacity-60"
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        {step.done ? (
                          <CheckCircle2 size={14} className="text-emerald-600" />
                        ) : step.active ? (
                          <Clock size={14} className="text-action animate-pulse" />
                        ) : (
                          <span className="h-3 w-3 rounded-full border border-ink/30" />
                        )}
                        <span className="font-mono text-[11px] font-bold uppercase text-ink">
                          {step.label}
                        </span>
                      </div>
                      <p className="mt-2 text-xs text-ink-muted truncate">{step.detail}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Details Breakdown Table */}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 rounded-none border border-line bg-card p-5 text-sm">
                <div>
                  <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-ink/40">
                    Net Disbursement
                  </span>
                  <p className="mt-1 text-lg font-bold text-ink">
                    {result.currency} {result.amount}
                  </p>
                </div>
                <div>
                  <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-ink/40">
                    Payment Rail
                  </span>
                  <p className="mt-1 font-semibold text-ink">{result.method}</p>
                </div>
                <div>
                  <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-ink/40">
                    Destination Account
                  </span>
                  <p className="mt-1 font-mono text-xs text-ink">{result.accountMask}</p>
                </div>
                <div>
                  <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-ink/40">
                    {result.status === "disbursed" ? "Retrieval Reference (RRN)" : "Expected By"}
                  </span>
                  <p className="mt-1 font-mono text-xs font-semibold text-action">
                    {result.rrn ?? result.estimatedDate}
                  </p>
                </div>
              </div>

              {/* Security & Advice Footnote */}
              {result.notes && (
                <div className="mt-4 flex items-start gap-2.5 border-l-2 border-action bg-surface-2 p-3 text-xs leading-relaxed text-ink-muted">
                  <ShieldCheck size={16} className="shrink-0 text-action mt-0.5" />
                  <span>
                    <strong>Settlement Note:</strong> {result.notes} Official bank statement advice
                    is dispatched to registered billing contacts upon final settlement.
                  </span>
                </div>
              )}
            </div>
          ) : (
            <div className="border border-dashed border-line-2 bg-surface p-8 text-center">
              <AlertCircle size={32} className="mx-auto mb-3 text-amber-500" />
              <h4 className="text-base font-bold text-ink">No Record Found for &quot;{query}&quot;</h4>
              <p className="mt-2 max-w-md mx-auto text-xs text-ink-muted leading-relaxed">
                We could not locate an active disbursement with that reference. Please check for
                typos or contact your project lead or{" "}
                <a
                  href="mailto:billing@tauqeermustafa.tech"
                  className="font-semibold text-action hover:underline"
                >
                  billing@tauqeermustafa.tech
                </a>
                .
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
