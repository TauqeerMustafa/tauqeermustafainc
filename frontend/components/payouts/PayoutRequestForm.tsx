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
  ArrowRight,
} from "lucide-react";

export default function PayoutRequestForm() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [department, setDepartment] = useState("Enterprise Web Development");
  const [invoiceRef, setInvoiceRef] = useState("");
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("PKR");
  const [method, setMethod] = useState("Raast Instant Transfer");
  const [accountTitle, setAccountTitle] = useState("");
  const [bankName, setBankName] = useState("");
  const [accountIban, setAccountIban] = useState("");
  const [deliverableNotes, setDeliverableNotes] = useState("");
  const [confirmNameMatch, setConfirmNameMatch] = useState(false);

  const [loading, setLoading] = useState(false);
  const [submittedRef, setSubmittedRef] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
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

    try {
      const res = await fetch("/api/billing/payouts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: fullName.trim(),
          email: email.trim(),
          phone: phone.trim() || undefined,
          department,
          invoiceRef: invoiceRef.trim() || undefined,
          amount: parseFloat(amount) || amount,
          currency,
          method,
          accountTitle: accountTitle.trim(),
          bankName: bankName.trim() || undefined,
          accountIban: accountIban.trim(),
          deliverableNotes: deliverableNotes.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (res.ok && data.payout) {
        setSubmittedRef(data.payout.reference);
        try {
          const existing = JSON.parse(localStorage.getItem("tmi_payout_requests") || "[]");
          localStorage.setItem("tmi_payout_requests", JSON.stringify([data.payout, ...existing]));
        } catch {
          // Ignore
        }
      } else {
        setError(data.message || "Could not log payout request. Please try again.");
      }
    } catch {
      setError("Network error connecting to disbursement queue. Please try again.");
    } finally {
      setLoading(false);
    }
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
    setError("");
  };

  return (
    <div className="w-full border border-line bg-surface p-6 sm:p-8">
      <div className="flex flex-col gap-1 border-b border-line pb-4 mb-6">
        <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-action">
          Disbursement Queue
        </span>
        <h3 className="text-xl font-bold uppercase tracking-tight text-ink">
          Submit Contractor Payout Request
        </h3>
        <p className="text-xs text-ink-muted font-light">
          Requests are reviewed against delivered milestones within our 48-hour treasury SLA.
        </p>
      </div>

      {submittedRef ? (
        <div className="border border-line bg-canvas p-6 sm:p-8 space-y-6 animate-in fade-in duration-200">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center border border-line bg-surface text-action font-mono">
              <CheckCircle2 size={20} />
            </div>
            <div>
              <h4 className="text-base font-bold uppercase text-ink">
                Payout Request Logged Successfully
              </h4>
              <p className="font-mono text-xs text-ink-muted">
                Reference ID: <span className="font-bold text-action">{submittedRef}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleCopy(submittedRef)}
              className="inline-flex items-center gap-1.5 border border-line bg-surface px-3.5 py-1.5 font-mono text-[11px] uppercase tracking-wider text-ink hover:border-action transition cursor-pointer"
            >
              {copied ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
              <span>{copied ? "Copied" : "Copy Reference ID"}</span>
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-1.5 border border-line bg-surface px-3.5 py-1.5 font-mono text-[11px] uppercase tracking-wider text-action hover:bg-action hover:text-on-action transition cursor-pointer"
            >
              <span>Submit Another Request</span>
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-mono text-[10px] uppercase text-ink-muted block mb-1">
                Full Legal Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Contractor full legal name"
                className="w-full border border-line bg-canvas px-3.5 py-2 text-xs font-mono text-ink outline-none focus:border-action"
              />
            </div>
            <div>
              <label className="font-mono text-[10px] uppercase text-ink-muted block mb-1">
                Corporate Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="contractor@email.com"
                className="w-full border border-line bg-canvas px-3.5 py-2 text-xs font-mono text-ink outline-none focus:border-action"
              />
            </div>

            <div>
              <label className="font-mono text-[10px] uppercase text-ink-muted block mb-1">
                Department / Capability
              </label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full border border-line bg-canvas px-3.5 py-2 text-xs font-mono text-ink outline-none focus:border-action"
              >
                <option value="Enterprise Web Development">Enterprise Web Development</option>
                <option value="Cybersecurity & Audit">Cybersecurity & Audit</option>
                <option value="AI & Machine Learning">AI & Machine Learning</option>
                <option value="Cloud Architecture">Cloud Architecture</option>
                <option value="Product Design / UX">Product Design / UX</option>
              </select>
            </div>

            <div>
              <label className="font-mono text-[10px] uppercase text-ink-muted block mb-1">
                Milestone or SOW Reference
              </label>
              <input
                type="text"
                value={invoiceRef}
                onChange={(e) => setInvoiceRef(e.target.value)}
                placeholder="e.g. SOW-04 Milestone 2"
                className="w-full border border-line bg-canvas px-3.5 py-2 text-xs font-mono text-ink outline-none focus:border-action uppercase"
              />
            </div>

            <div>
              <label className="font-mono text-[10px] uppercase text-ink-muted block mb-1">
                Amount <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-2">
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="border border-line bg-canvas px-2.5 py-2 text-xs font-mono text-ink outline-none focus:border-action"
                >
                  <option value="PKR">PKR</option>
                  <option value="USD">USD</option>
                  <option value="GBP">GBP</option>
                  <option value="EUR">EUR</option>
                </select>
                <input
                  type="number"
                  required
                  min="1"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Amount"
                  className="w-full border border-line bg-canvas px-3.5 py-2 text-xs font-mono text-ink outline-none focus:border-action"
                />
              </div>
            </div>

            <div>
              <label className="font-mono text-[10px] uppercase text-ink-muted block mb-1">
                Disbursement Rail
              </label>
              <select
                value={method}
                onChange={(e) => setMethod(e.target.value)}
                className="w-full border border-line bg-canvas px-3.5 py-2 text-xs font-mono text-ink outline-none focus:border-action"
              >
                <option value="Raast Instant Transfer">Raast Instant Transfer (0% Fee)</option>
                <option value="1LINK Commercial Bank Wire">1LINK Local Commercial Wire</option>
                <option value="Wise Multi-Currency Wire">Wise Multi-Currency Wire</option>
                <option value="Payoneer Direct Transfer">Payoneer Direct Transfer</option>
              </select>
            </div>
          </div>

          {/* Account Details */}
          <div className="border border-line bg-canvas p-4 space-y-3">
            <span className="font-mono text-[11px] font-bold uppercase text-ink block">
              Destination Account Coordinates
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-mono text-[10px] uppercase text-ink-muted block mb-1">
                  Account Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={accountTitle}
                  onChange={(e) => setAccountTitle(e.target.value)}
                  placeholder="Exact title on bank account"
                  className="w-full border border-line bg-surface px-3.5 py-2 text-xs font-mono text-ink outline-none focus:border-action"
                />
              </div>
              <div>
                <label className="font-mono text-[10px] uppercase text-ink-muted block mb-1">
                  Bank / Platform Name
                </label>
                <input
                  type="text"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  placeholder="e.g. Meezan Bank, HBL, Wise"
                  className="w-full border border-line bg-surface px-3.5 py-2 text-xs font-mono text-ink outline-none focus:border-action"
                />
              </div>
            </div>
            <div>
              <label className="font-mono text-[10px] uppercase text-ink-muted block mb-1">
                IBAN or Account Number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={accountIban}
                onChange={(e) => setAccountIban(e.target.value)}
                placeholder="PK... or International Account Number"
                className="w-full border border-line bg-surface px-3.5 py-2 text-xs font-mono text-ink outline-none focus:border-action uppercase"
              />
            </div>
          </div>

          {/* Confirmation Checkbox */}
          <label className="flex items-start gap-2.5 cursor-pointer font-mono text-xs text-ink/80">
            <input
              type="checkbox"
              checked={confirmNameMatch}
              onChange={(e) => setConfirmNameMatch(e.target.checked)}
              className="mt-0.5 accent-action"
            />
            <span>
              I certify that the destination account title matches my legal name and corresponding contract.
            </span>
          </label>

          {error && (
            <div className="flex items-start gap-2 p-3 border border-red-500/30 bg-red-500/5 text-xs text-red-600 dark:text-red-400 font-mono">
              <AlertCircle size={14} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-action text-on-action font-mono text-xs font-bold uppercase tracking-wider hover:bg-action-strong transition cursor-pointer disabled:opacity-50"
          >
            {loading ? "Submitting Request..." : "Submit Payout Request"}
          </button>
        </form>
      )}
    </div>
  );
}
