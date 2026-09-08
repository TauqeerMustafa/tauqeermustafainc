"use client";

import { useState } from "react";
import {
  Send,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  Building2,
  FileText,
  User,
  Mail,
  Phone,
  ShieldCheck,
} from "lucide-react";

export default function PayoutRequestForm() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [department, setDepartment] = useState("web_dev");
  const [invoiceRef, setInvoiceRef] = useState("");
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("PKR");
  const [method, setMethod] = useState("raast");
  const [accountTitle, setAccountTitle] = useState("");
  const [bankName, setBankName] = useState("");
  const [accountIban, setAccountIban] = useState("");
  const [deliverableNotes, setDeliverableNotes] = useState("");
  const [confirmNameMatch, setConfirmNameMatch] = useState(false);

  const [loading, setLoading] = useState(false);
  const [submittedRef, setSubmittedRef] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!fullName.trim() || !email.trim() || !amount.trim() || !accountTitle.trim() || !accountIban.trim()) {
      setError("Please fill in all required fields including legal name, email, amount, and account information.");
      return;
    }

    if (!confirmNameMatch) {
      setError("Please acknowledge that the account title matches your contracted legal name.");
      return;
    }

    setLoading(true);

    setTimeout(() => {
      const randomSuffix = Math.floor(100 + Math.random() * 900);
      const generatedRef = `TMI-PO-2026-${randomSuffix}`;
      setSubmittedRef(generatedRef);
      setLoading(false);
    }, 800);
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    setSubmittedRef(null);
    setInvoiceRef("");
    setAmount("");
    setDeliverableNotes("");
    setConfirmNameMatch(false);
  };

  return (
    <div className="w-full border border-line-2 bg-surface p-6 sm:p-8">
      <div className="flex flex-col gap-2">
        <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-action">
          Disbursement Dispatch
        </span>
        <h3 className="text-xl font-bold uppercase tracking-tight text-ink sm:text-2xl">
          Submit Payout / Invoice Request
        </h3>
        <p className="text-sm font-light leading-relaxed text-ink-muted">
          For contractors, consultants, and milestone owners. Submissions are reviewed and verified
          against signed milestones within our 48-hour treasury SLA.
        </p>
      </div>

      {submittedRef ? (
        <div className="mt-8 border border-emerald-500/40 bg-emerald-50/20 dark:bg-emerald-950/20 p-6 sm:p-8 animate-in fade-in duration-300">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white">
              <CheckCircle2 size={22} />
            </div>
            <div>
              <h4 className="text-lg font-bold text-ink">Payout Request Successfully Logged</h4>
              <p className="text-xs text-ink-muted">
                Your request has been routed to the TMI Treasury & Project Verification Queue.
              </p>
            </div>
          </div>

          <div className="mt-6 border border-line bg-card p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-ink/40">
                Tracking Reference Number
              </span>
              <div className="mt-1 flex items-center gap-2 font-mono text-xl font-bold text-action">
                <span>{submittedRef}</span>
                <button
                  type="button"
                  onClick={() => handleCopy(submittedRef)}
                  className="rounded border border-line-2 p-1 text-ink/50 transition hover:text-action hover:border-action"
                  title="Copy Reference"
                >
                  {copied ? <Check size={16} className="text-emerald-600" /> : <Copy size={16} />}
                </button>
              </div>
            </div>

            <div className="text-left sm:text-right">
              <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-ink/40">
                Estimated Settlement SLA
              </span>
              <p className="mt-1 font-semibold text-sm text-ink">Within 24 to 48 Hours</p>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-line/60 text-xs text-ink-muted">
            <p>
              A confirmation receipt and status alerts will be sent to <strong>{email}</strong>.
            </p>
            <button
              type="button"
              onClick={handleReset}
              className="font-mono text-xs font-bold uppercase tracking-wider text-action hover:underline"
            >
              Submit Another Request &rarr;
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          {error && (
            <div className="flex items-center gap-2 border border-red-300 bg-red-50 dark:bg-red-950/40 p-4 text-xs font-semibold text-red-700 dark:text-red-300">
              <AlertCircle size={16} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Section 1: Contributor Identification */}
          <div>
            <h4 className="font-mono text-[11px] font-bold uppercase tracking-[0.12em] text-ink/70 mb-3 border-b border-line pb-1.5 flex items-center gap-2">
              <User size={13} className="text-action" />
              <span>1. Contributor Identification</span>
            </h4>
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className="block text-xs font-semibold text-ink mb-1.5">
                  Full Legal Name *
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="As on Bank Account / ID"
                  className="w-full border border-line-2 bg-card px-3.5 py-2.5 text-sm text-ink outline-none transition focus:border-action focus:ring-1 focus:ring-action"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink mb-1.5">
                  Contract / Work Email *
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@tauqeermustafa.tech or personal"
                  className="w-full border border-line-2 bg-card px-3.5 py-2.5 text-sm text-ink outline-none transition focus:border-action focus:ring-1 focus:ring-action"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink mb-1.5">
                  WhatsApp / Phone (for SMS receipt)
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+92 300 1234567"
                  className="w-full border border-line-2 bg-card px-3.5 py-2.5 text-sm text-ink outline-none transition focus:border-action focus:ring-1 focus:ring-action"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Engagement & Milestone Scope */}
          <div>
            <h4 className="font-mono text-[11px] font-bold uppercase tracking-[0.12em] text-ink/70 mb-3 border-b border-line pb-1.5 flex items-center gap-2">
              <FileText size={13} className="text-action" />
              <span>2. Engagement & Deliverable Scope</span>
            </h4>
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className="block text-xs font-semibold text-ink mb-1.5">
                  Department / Function
                </label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full border border-line-2 bg-card px-3.5 py-2.5 text-sm text-ink outline-none transition focus:border-action"
                >
                  <option value="web_dev">Enterprise Web & Fullstack</option>
                  <option value="ai_ml">AI, ML & Data Engineering</option>
                  <option value="cybersecurity">Cybersecurity & Cloud Systems</option>
                  <option value="lead_gen">Sales & Lead Gen Commission</option>
                  <option value="design">UI/UX & Product Design</option>
                  <option value="operations">Corporate Operations & Management</option>
                  <option value="trial">Trial Period Settlement</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink mb-1.5">
                  Invoice or Project Reference #
                </label>
                <input
                  type="text"
                  value={invoiceRef}
                  onChange={(e) => setInvoiceRef(e.target.value)}
                  placeholder="e.g. INV-2026-042 or Milestone 2"
                  className="w-full border border-line-2 bg-card px-3.5 py-2.5 text-sm text-ink outline-none transition focus:border-action"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink mb-1.5">
                  Requested Amount & Currency *
                </label>
                <div className="flex gap-2">
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="w-24 border border-line-2 bg-card px-2.5 py-2.5 text-sm font-bold text-ink outline-none"
                  >
                    <option value="PKR">PKR</option>
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="GBP">GBP</option>
                  </select>
                  <input
                    type="number"
                    required
                    min="1"
                    step="any"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="e.g. 150000"
                    className="flex-1 border border-line-2 bg-card px-3.5 py-2.5 text-sm font-bold text-ink outline-none transition focus:border-action"
                  />
                </div>
              </div>
            </div>

            <div className="mt-3">
              <label className="block text-xs font-semibold text-ink mb-1.5">
                Deliverable Link or Verification Notes
              </label>
              <textarea
                rows={2}
                value={deliverableNotes}
                onChange={(e) => setDeliverableNotes(e.target.value)}
                placeholder="Brief description, link to merged GitHub PR, staging deliverable, or signed milestone agreement…"
                className="w-full border border-line-2 bg-card px-3.5 py-2 text-sm text-ink outline-none transition focus:border-action"
              />
            </div>
          </div>

          {/* Section 3: Payout Rail & Banking Destination */}
          <div>
            <h4 className="font-mono text-[11px] font-bold uppercase tracking-[0.12em] text-ink/70 mb-3 border-b border-line pb-1.5 flex items-center gap-2">
              <Building2 size={13} className="text-action" />
              <span>3. Payout Destination & Banking Details</span>
            </h4>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold text-ink mb-1.5">
                  Preferred Payout Rail *
                </label>
                <select
                  value={method}
                  onChange={(e) => setMethod(e.target.value)}
                  className="w-full border border-line-2 bg-card px-3.5 py-2.5 text-sm text-ink outline-none transition focus:border-action"
                >
                  <option value="raast">Raast Instant Transfer (Pakistan / 0% Fee)</option>
                  <option value="local_bank">Direct Commercial Bank (1LINK IBAN)</option>
                  <option value="wise">Wise Multi-Currency (Global)</option>
                  <option value="swift">International Wire / SWIFT</option>
                  <option value="payoneer">Payoneer Direct Balance</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink mb-1.5">
                  Bank / Financial Institution Name *
                </label>
                <input
                  type="text"
                  required
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  placeholder="e.g. Meezan Bank, HBL, Wise, Standard Chartered"
                  className="w-full border border-line-2 bg-card px-3.5 py-2.5 text-sm text-ink outline-none transition focus:border-action"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink mb-1.5">
                  Exact Account Title *
                </label>
                <input
                  type="text"
                  required
                  value={accountTitle}
                  onChange={(e) => setAccountTitle(e.target.value)}
                  placeholder="Must match your legal name exactly"
                  className="w-full border border-line-2 bg-card px-3.5 py-2.5 text-sm text-ink outline-none transition focus:border-action"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink mb-1.5">
                  IBAN / Account Number / Wise Tag *
                </label>
                <input
                  type="text"
                  required
                  value={accountIban}
                  onChange={(e) => setAccountIban(e.target.value)}
                  placeholder="PK... / Global IBAN / Payoneer Email"
                  className="w-full border border-line-2 bg-card px-3.5 py-2.5 font-mono text-sm text-ink outline-none transition focus:border-action"
                />
              </div>
            </div>
          </div>

          {/* Compliance Checkbox */}
          <div className="border border-line bg-card/60 p-4">
            <label className="flex items-start gap-3 cursor-pointer text-xs leading-relaxed text-ink">
              <input
                type="checkbox"
                required
                checked={confirmNameMatch}
                onChange={(e) => setConfirmNameMatch(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded-none accent-action border-line-2"
              />
              <span>
                <strong>Compliance Declaration:</strong> I certify that the bank account details
                provided belong to me and match the legal contractor agreement on file with Tauqeer
                Mustafa Inc. I understand that third-party payouts are prohibited under corporate
                anti-fraud and anti-money laundering policies.
              </span>
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="inline-flex min-h-12 w-full sm:w-auto items-center justify-center gap-2 bg-action px-8 font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-on-action transition hover:bg-action-strong active:scale-[0.98] disabled:opacity-50"
          >
            <Send size={15} />
            <span>{loading ? "Registering in Ledger…" : "Submit Payout Request"}</span>
          </button>
        </form>
      )}
    </div>
  );
}
