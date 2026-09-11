"use client";

import { useState } from "react";
import {
  ExternalLink,
  ShieldCheck,
  FileText,
  CreditCard,
  History,
  Lock,
  ArrowRight,
  AlertCircle,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import { paddleConfig } from "@/config/paddle";

export default function CustomerPortalSection() {
  const [email, setEmail] = useState("");
  const [customerId, setCustomerId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [portalUrl, setPortalUrl] = useState<string | null>(null);

  const handleCreateSession = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setPortalUrl(null);

    const identifier = customerId.trim() || email.trim();
    if (!identifier) {
      setError("Please enter the email address or customer ID associated with your payments.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/billing/paddle/portal-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim() || undefined,
          customerId: customerId.trim() || undefined,
        }),
      });

      const data = await res.json();

      if (res.ok && data.url) {
        setPortalUrl(data.url);
        // Automatically redirect in current window or open
        window.open(data.url, "_blank", "noopener,noreferrer");
      } else {
        setError(
          data.message ||
            "Could not locate an active Paddle customer session for this account. If you just made your first payment, please allow up to 2 minutes for synchronization."
        );
      }
    } catch {
      setError("Connection error. Could not reach Paddle session gateway.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="border border-line bg-surface p-6 sm:p-10 space-y-8">
      {/* Header */}
      <div className="border-b border-line pb-6">
        <div className="flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-action">
          <ShieldCheck size={14} />
          <span>Paddle Hosted Self-Service</span>
        </div>
        <h2 className="mt-2 text-2xl sm:text-3xl font-bold uppercase text-ink tracking-tight">
          Client Billing & Subscription Portal
        </h2>
        <p className="mt-2 text-sm text-ink-muted font-light leading-relaxed max-w-2xl">
          Access your institutional billing dashboard powered by Paddle. Download official VAT/GST tax invoices, inspect historical settlement records, or update stored payment methods.
        </p>
      </div>

      {/* Feature Highlights Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="border border-line bg-card p-4 space-y-2">
          <div className="flex h-8 w-8 items-center justify-center border border-line bg-surface text-action">
            <FileText size={16} />
          </div>
          <h3 className="font-bold text-xs uppercase text-ink">Tax Invoices (PDF)</h3>
          <p className="text-[12px] text-ink-muted font-light leading-relaxed">
            Download stamped commercial receipts and tax compliance documentation for any past milestone.
          </p>
        </div>

        <div className="border border-line bg-card p-4 space-y-2">
          <div className="flex h-8 w-8 items-center justify-center border border-line bg-surface text-action">
            <CreditCard size={16} />
          </div>
          <h3 className="font-bold text-xs uppercase text-ink">Payment Methods</h3>
          <p className="text-[12px] text-ink-muted font-light leading-relaxed">
            Seamlessly update linked corporate credit cards, Apple Pay, Google Pay, or wire authorization.
          </p>
        </div>

        <div className="border border-line bg-card p-4 space-y-2">
          <div className="flex h-8 w-8 items-center justify-center border border-line bg-surface text-action">
            <History size={16} />
          </div>
          <h3 className="font-bold text-xs uppercase text-ink">Retainer Management</h3>
          <p className="text-[12px] text-ink-muted font-light leading-relaxed">
            Review active engineering tranches, view upcoming billing dates, or modify subscription tiers.
          </p>
        </div>
      </div>

      {/* Portal Access Form */}
      <div className="border border-line bg-card p-6 sm:p-8">
        <form onSubmit={handleCreateSession} className="space-y-6 max-w-xl">
          <div>
            <label className="block font-mono text-xs font-bold uppercase text-ink mb-2">
              Corporate Account Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. accounting@yourcompany.com"
              className="w-full border border-line bg-surface px-4 py-3 text-sm text-ink font-mono focus:border-action focus:outline-none transition"
            />
            <p className="mt-1.5 text-[11px] font-mono text-ink-muted">
              Enter the email address used during previous checkout settlements.
            </p>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 bg-action text-white px-6 py-3.5 font-mono text-xs font-bold uppercase tracking-wider hover:bg-action-hover transition cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span>Generating Secure Session...</span>
                </>
              ) : (
                <>
                  <span>Open Paddle Customer Portal</span>
                  <ExternalLink size={14} />
                </>
              )}
            </button>
          </div>

          {error && (
            <div className="border border-red-500/30 bg-red-500/10 p-4 flex items-start gap-3 text-red-600 dark:text-red-400 text-xs font-mono">
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-bold uppercase">Authentication Notice</p>
                <p>{error}</p>
                {!paddleConfig.isConfigured && (
                  <p className="text-[11px] text-ink-muted mt-2 pt-2 border-t border-line">
                    Tip for Administrator: Add `PADDLE_API_KEY` to your environment variables to enable live customer portal sessions.
                  </p>
                )}
              </div>
            </div>
          )}

          {portalUrl && (
            <div className="border border-emerald-500/30 bg-emerald-500/10 p-4 flex items-center justify-between gap-3 text-emerald-600 dark:text-emerald-400 text-xs font-mono">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={16} className="shrink-0" />
                <span>Secure session created successfully!</span>
              </div>
              <a
                href={portalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 font-bold underline uppercase"
              >
                <span>Launch Portal</span>
                <ArrowRight size={12} />
              </a>
            </div>
          )}
        </form>
      </div>

      {/* Security note */}
      <div className="flex items-center gap-2 font-mono text-[11px] text-ink-muted">
        <Lock size={12} className="text-action" />
        <span>One-time cryptographic session tokens minted on-demand directly by Paddle Merchant of Record.</span>
      </div>
    </div>
  );
}
