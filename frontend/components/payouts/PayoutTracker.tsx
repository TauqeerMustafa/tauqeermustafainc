"use client";

import { useState } from "react";
import {
  Search,
  CheckCircle2,
  Clock,
  AlertCircle,
  ShieldCheck,
  Building2,
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

export default function PayoutTracker() {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<PayoutRecord | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleSearch = async (codeToSearch?: string) => {
    const term = (codeToSearch ?? query).trim().toUpperCase();
    if (!term) {
      setError("Please enter a disbursement reference (e.g. TMI-PO-2026-XXXXX).");
      return;
    }

    setError("");
    setLoading(true);
    setResult(null);

    // 1. Check local storage first
    try {
      const stored: PayoutRecord[] = JSON.parse(localStorage.getItem("tmi_payout_requests") || "[]");
      const localMatch = stored.find((r) => r.reference.toUpperCase() === term);
      if (localMatch) {
        setResult(localMatch);
        setLoading(false);
        return;
      }
    } catch {
      // Ignore
    }

    // 2. Query live API
    try {
      const res = await fetch(`/api/billing/payouts?ref=${encodeURIComponent(term)}`);
      const data = await res.json();
      if (res.ok && data.payout) {
        setResult(data.payout);
      } else {
        setError(data.message || `No disbursement record found for reference "${term}". Please check the reference code provided in your submission confirmation.`);
      }
    } catch {
      setError("Unable to connect to live disbursement registry. Please verify your reference or try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full space-y-6">
      {/* Search Input Bar */}
      <div className="border border-line bg-canvas p-2">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSearch();
          }}
          className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2"
        >
          <div className="flex-1 flex items-center px-3 py-1.5 bg-surface border border-line">
            <Search size={16} className="text-action shrink-0 mr-2" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="ENTER DISBURSEMENT REFERENCE (E.G. TMI-PO-2026-XXXXX)..."
              className="w-full bg-transparent font-mono text-xs uppercase tracking-wider text-ink outline-none placeholder:text-ink-muted"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 bg-action text-on-action font-mono text-xs font-bold uppercase tracking-wider hover:bg-action-strong transition cursor-pointer disabled:opacity-50"
          >
            {loading ? "Searching..." : "Track Status"}
          </button>
        </form>
      </div>

      {error && (
        <div className="flex items-start gap-2.5 p-4 border border-red-500/30 bg-red-500/5 text-xs text-red-600 dark:text-red-400 font-mono">
          <AlertCircle size={15} className="shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Result Display */}
      {result && (
        <div className="border border-line bg-canvas p-6 sm:p-8 animate-in fade-in duration-150 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-line pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm font-bold text-ink">{result.reference}</span>
                <button
                  type="button"
                  onClick={() => handleCopy(result.reference)}
                  className="text-ink-muted hover:text-ink"
                  title="Copy Reference"
                >
                  {copied ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
                </button>
              </div>
              <p className="text-xs text-ink-muted font-light mt-0.5">{result.scope}</p>
            </div>

            {/* Status Badge */}
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 border border-action/30 bg-action/[0.08] px-3 py-1 font-mono text-[11px] font-bold uppercase text-action">
                <Clock size={12} />
                <span>{result.status === "disbursed" ? "Disbursed / Settled" : "Processing Review"}</span>
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 font-mono text-xs">
            <div>
              <span className="text-ink-muted uppercase block text-[10px]">Payee / Beneficiary:</span>
              <span className="font-bold text-ink text-sm">{result.payeeName}</span>
            </div>
            <div>
              <span className="text-ink-muted uppercase block text-[10px]">Disbursement Amount:</span>
              <span className="font-bold text-action text-sm">
                {result.currency} {Number(result.amount).toLocaleString()}
              </span>
            </div>
            <div>
              <span className="text-ink-muted uppercase block text-[10px]">Settlement Channel:</span>
              <span className="text-ink">{result.method}</span>
            </div>
            <div>
              <span className="text-ink-muted uppercase block text-[10px]">Account Destination:</span>
              <span className="text-ink">{result.accountMask}</span>
            </div>
            <div>
              <span className="text-ink-muted uppercase block text-[10px]">Submitted Date:</span>
              <span className="text-ink">{result.submittedDate}</span>
            </div>
            <div>
              <span className="text-ink-muted uppercase block text-[10px]">Estimated Settlement:</span>
              <span className="text-ink">{result.estimatedDate || "Within 48h SLA"}</span>
            </div>
          </div>

          {result.notes && (
            <div className="p-4 border border-line bg-surface font-mono text-xs text-ink-muted">
              <span className="font-bold text-action uppercase block mb-1">Treasury Audit Notes:</span>
              <p>{result.notes}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
