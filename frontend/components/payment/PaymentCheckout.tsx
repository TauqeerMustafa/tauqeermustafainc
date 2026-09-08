"use client";

import { useState, useEffect } from "react";
import {
  CreditCard,
  Building2,
  Globe,
  CheckCircle2,
  ShieldCheck,
  Lock,
  ArrowRight,
  AlertCircle,
  Copy,
  Check,
  Printer,
  RotateCcw,
  Zap,
} from "lucide-react";

type PaymentMethod = "card" | "bank" | "raast" | "wise";
type Currency = "USD" | "PKR";

interface Receipt {
  transactionId: string;
  invoiceNumber: string;
  clientName: string;
  clientEmail: string;
  amount: number;
  currency: Currency;
  service: string;
  method: string;
  timestamp: string;
  referenceNote?: string;
  status: string;
}

export default function PaymentCheckout() {
  const [tab, setTab] = useState<"custom" | "invoice">("custom");
  const [invoiceQuery, setInvoiceQuery] = useState("");
  const [invoiceError, setInvoiceError] = useState("");
  const [searchingInvoice, setSearchingInvoice] = useState(false);

  // Custom milestone fields
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [service, setService] = useState("Enterprise Web Development Deposit");
  const [projectRef, setProjectRef] = useState("");
  const [amount, setAmount] = useState("500");
  const [currency, setCurrency] = useState<Currency>("USD");

  // Payment method selection
  const [method, setMethod] = useState<PaymentMethod>("card");

  // Card form fields
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvc, setCardCvc] = useState("");
  const [cardHolder, setCardHolder] = useState("");

  // Bank transfer receipt submission
  const [senderBank, setSenderBank] = useState("Meezan Bank Limited");
  const [bankRef, setBankRef] = useState("");
  const [bankNotes, setBankNotes] = useState("");

  // State
  const [processing, setProcessing] = useState(false);
  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [copiedIban, setCopiedIban] = useState(false);
  const [copiedRaast, setCopiedRaast] = useState(false);
  const [copiedWise, setCopiedWise] = useState(false);

  // Check if there was a saved receipt in session
  useEffect(() => {
    try {
      const saved = localStorage.getItem("tmi_last_receipt");
      if (saved) {
        setReceipt(JSON.parse(saved));
      }
    } catch {
      // Ignore storage errors
    }
  }, []);

  const handleCopyText = (text: string, setter: (val: boolean) => void) => {
    navigator.clipboard.writeText(text);
    setter(true);
    setTimeout(() => setter(false), 2000);
  };

  // Lookup invoice via live API
  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = invoiceQuery.trim().toUpperCase();
    setInvoiceError("");

    if (!code) {
      setInvoiceError("Please enter an invoice number (e.g. TMI-INV-2026-001).");
      return;
    }

    setSearchingInvoice(true);
    try {
      const res = await fetch(`/api/billing/payment?invoice=${encodeURIComponent(code)}`);
      const data = await res.json();
      if (res.ok && data.invoice) {
        setClientName(data.invoice.clientName || "");
        setClientEmail(data.invoice.clientEmail || "");
        setService(data.invoice.service || "Invoice Settlement");
        setProjectRef(code);
        setAmount(String(data.invoice.amount || 1000));
        setCurrency(data.invoice.currency || "USD");
        setTab("custom");
      } else {
        setInvoiceError(
          `Invoice "${code}" was not found in our active registry. You can proceed with a direct deposit using the Custom Deposit tab.`
        );
      }
    } catch {
      setInvoiceError("Could not reach invoice verification service. Please try Custom Deposit.");
    } finally {
      setSearchingInvoice(false);
    }
  };

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    const parsedAmount = parseFloat(amount);
    if (!clientName.trim() || !clientEmail.trim()) {
      setErrorMessage("Please enter your name/organization and a valid work email.");
      return;
    }
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setErrorMessage("Please enter a valid deposit amount greater than zero.");
      return;
    }
    if (method === "card") {
      if (!cardNumber.replace(/\s/g, "") || !cardExpiry || !cardCvc || !cardHolder) {
        setErrorMessage("Please complete all card payment fields.");
        return;
      }
    }
    if (method === "bank" && !bankRef.trim()) {
      setErrorMessage("Please enter your bank transfer reference or transaction ID (RRN).");
      return;
    }

    setProcessing(true);

    try {
      const res = await fetch("/api/billing/payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientName: clientName.trim(),
          clientEmail: clientEmail.trim(),
          service,
          projectRef: projectRef.trim() || undefined,
          amount: parsedAmount,
          currency,
          method,
          senderBank: method === "bank" ? senderBank : undefined,
          bankRef: method === "bank" ? bankRef.trim() : undefined,
          bankNotes: bankNotes.trim() || undefined,
          cardLast4: method === "card" ? cardNumber.replace(/\s/g, "").slice(-4) : undefined,
        }),
      });

      const data = await res.json();
      if (res.ok && data.receipt) {
        setReceipt(data.receipt);
        try {
          localStorage.setItem("tmi_last_receipt", JSON.stringify(data.receipt));
          const existing = JSON.parse(localStorage.getItem("tmi_receipts") || "[]");
          localStorage.setItem("tmi_receipts", JSON.stringify([data.receipt, ...existing]));
        } catch {
          // Ignore storage
        }
      } else {
        setErrorMessage(data.message || "Payment submission could not be processed.");
      }
    } catch {
      setErrorMessage("Network error connecting to payment gateway. Please check your connection or contact billing@tauqeermustafa.tech.");
    } finally {
      setProcessing(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleReset = () => {
    try {
      localStorage.removeItem("tmi_last_receipt");
    } catch {}
    setReceipt(null);
    setCardNumber("");
    setCardExpiry("");
    setCardCvc("");
    setCardHolder("");
    setBankRef("");
    setBankNotes("");
    setErrorMessage("");
  };

  return (
    <div className="w-full border border-line bg-surface p-6 sm:p-8">
      {/* If Paid: Show Verified Receipt */}
      {receipt ? (
        <div className="animate-in fade-in duration-200 space-y-6">
          <div className="border border-line bg-canvas p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-line pb-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center border border-line bg-surface text-action font-mono font-bold">
                  <CheckCircle2 size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-bold uppercase tracking-tight text-ink">
                    Official Payment Receipt
                  </h3>
                  <p className="font-mono text-[11px] text-ink-muted">
                    Reference: {receipt.transactionId}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handlePrint}
                  className="inline-flex items-center gap-1.5 border border-line bg-surface px-3 py-1.5 font-mono text-[11px] uppercase tracking-wider text-ink hover:border-action transition cursor-pointer"
                >
                  <Printer size={12} />
                  <span>Print Receipt</span>
                </button>
                <button
                  type="button"
                  onClick={handleReset}
                  className="inline-flex items-center gap-1.5 border border-line bg-surface px-3 py-1.5 font-mono text-[11px] uppercase tracking-wider text-action hover:bg-action hover:text-on-action transition cursor-pointer"
                >
                  <RotateCcw size={12} />
                  <span>New Payment</span>
                </button>
              </div>
            </div>

            {/* Receipt Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-6 text-xs font-mono">
              <div className="space-y-3">
                <div>
                  <span className="text-ink-muted uppercase block text-[10px]">Client / Organization:</span>
                  <span className="font-bold text-ink text-sm">{receipt.clientName}</span>
                </div>
                <div>
                  <span className="text-ink-muted uppercase block text-[10px]">Billing Email:</span>
                  <span className="text-ink">{receipt.clientEmail}</span>
                </div>
                <div>
                  <span className="text-ink-muted uppercase block text-[10px]">Service Tranche:</span>
                  <span className="text-ink">{receipt.service}</span>
                </div>
              </div>

              <div className="space-y-3 sm:text-right">
                <div>
                  <span className="text-ink-muted uppercase block text-[10px]">Amount Settled:</span>
                  <span className="text-xl font-bold text-action">
                    {receipt.currency} {Number(receipt.amount).toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="text-ink-muted uppercase block text-[10px]">Method & Gateway:</span>
                  <span className="text-ink">{receipt.method}</span>
                </div>
                <div>
                  <span className="text-ink-muted uppercase block text-[10px]">Settlement Date:</span>
                  <span className="text-ink">{receipt.timestamp}</span>
                </div>
              </div>
            </div>

            {receipt.referenceNote && (
              <div className="mt-6 p-3 border border-line bg-surface font-mono text-[11px] text-ink-muted">
                {receipt.referenceNote}
              </div>
            )}

            <div className="mt-8 pt-6 border-t border-line flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs font-mono text-ink-muted">
              <span>Tauqeer Mustafa Inc. // Corporate Treasury Desk</span>
              <span className="text-action">Verified & Recorded</span>
            </div>
          </div>
        </div>
      ) : (
        /* Payment Mode Selector & Form */
        <div>
          {/* Header */}
          <div className="border-b border-line pb-6 mb-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-action">
                  Treasury // Online Terminal
                </span>
                <h3 className="mt-1 text-2xl font-bold uppercase tracking-tight text-ink">
                  Direct Payment & Invoice Settlement
                </h3>
              </div>

              {/* Mode Tabs */}
              <div className="flex border border-line bg-canvas p-1">
                <button
                  type="button"
                  onClick={() => {
                    setTab("custom");
                    setInvoiceError("");
                  }}
                  className={`px-3 py-1 font-mono text-[11px] font-semibold uppercase tracking-wider transition ${
                    tab === "custom"
                      ? "bg-action text-on-action"
                      : "text-ink-muted hover:text-ink"
                  }`}
                >
                  Direct Deposit
                </button>
                <button
                  type="button"
                  onClick={() => setTab("invoice")}
                  className={`px-3 py-1 font-mono text-[11px] font-semibold uppercase tracking-wider transition ${
                    tab === "invoice"
                      ? "bg-action text-on-action"
                      : "text-ink-muted hover:text-ink"
                  }`}
                >
                  Lookup Invoice
                </button>
              </div>
            </div>
          </div>

          {/* Invoice Lookup Tab */}
          {tab === "invoice" && (
            <div className="mb-8 border border-line bg-canvas p-6 animate-in fade-in duration-150">
              <form onSubmit={handleLookup} className="space-y-4">
                <label className="font-mono text-[11px] font-bold uppercase tracking-wider text-ink block">
                  Enter Corporate Invoice Reference
                </label>
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="text"
                    value={invoiceQuery}
                    onChange={(e) => setInvoiceQuery(e.target.value)}
                    placeholder="e.g. TMI-INV-2026-001"
                    className="flex-1 border border-line bg-surface px-4 py-2.5 font-mono text-xs text-ink outline-none focus:border-action uppercase"
                  />
                  <button
                    type="submit"
                    disabled={searchingInvoice}
                    className="bg-action px-6 py-2.5 font-mono text-xs font-bold uppercase tracking-wider text-on-action hover:bg-action-strong transition disabled:opacity-50"
                  >
                    {searchingInvoice ? "Searching..." : "Lookup Invoice"}
                  </button>
                </div>
                {invoiceError && (
                  <div className="flex items-start gap-2 p-3 border border-red-500/30 bg-red-500/5 text-xs text-red-600 dark:text-red-400 font-mono">
                    <AlertCircle size={14} className="shrink-0 mt-0.5" />
                    <span>{invoiceError}</span>
                  </div>
                )}
              </form>
            </div>
          )}

          {/* Main Payment Checkout Form */}
          <form onSubmit={handlePay} className="space-y-8">
            {/* Payer Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="font-mono text-[11px] uppercase tracking-wider text-ink-muted block">
                  Full Name / Organization <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="e.g. Enterprise Client / Organization Name"
                  className="w-full border border-line bg-canvas px-3.5 py-2 text-xs font-mono text-ink outline-none focus:border-action"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-mono text-[11px] uppercase tracking-wider text-ink-muted block">
                  Corporate Billing Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                  placeholder="e.g. billing@company.com"
                  className="w-full border border-line bg-canvas px-3.5 py-2 text-xs font-mono text-ink outline-none focus:border-action"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-mono text-[11px] uppercase tracking-wider text-ink-muted block">
                  Service Category
                </label>
                <select
                  value={service}
                  onChange={(e) => setService(e.target.value)}
                  className="w-full border border-line bg-canvas px-3.5 py-2 text-xs font-mono text-ink outline-none focus:border-action"
                >
                  <option value="Enterprise Web Development Deposit">Enterprise Web Development</option>
                  <option value="Cybersecurity Consulting & Audit">Cybersecurity Consulting & Audit</option>
                  <option value="AI Solutions & Automation Pipeline">AI Solutions & Automation</option>
                  <option value="Cloud Architecture & DevOps Retainer">Cloud Engineering & DevOps</option>
                  <option value="Custom Technical SOW Deposit">Custom Technical Statement of Work</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="font-mono text-[11px] uppercase tracking-wider text-ink-muted block">
                  Project or Contract Reference (Optional)
                </label>
                <input
                  type="text"
                  value={projectRef}
                  onChange={(e) => setProjectRef(e.target.value)}
                  placeholder="e.g. TMI-2026-ENG or SOW-04"
                  className="w-full border border-line bg-canvas px-3.5 py-2 text-xs font-mono text-ink outline-none focus:border-action uppercase"
                />
              </div>
            </div>

            {/* Currency & Amount Selection */}
            <div className="border border-line bg-canvas p-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-ink">
                  Deposit Amount
                </span>
                <div className="flex border border-line bg-surface p-0.5">
                  <button
                    type="button"
                    onClick={() => setCurrency("USD")}
                    className={`px-3 py-1 font-mono text-[10px] font-bold uppercase transition ${
                      currency === "USD" ? "bg-action text-on-action" : "text-ink-muted"
                    }`}
                  >
                    USD ($)
                  </button>
                  <button
                    type="button"
                    onClick={() => setCurrency("PKR")}
                    className={`px-3 py-1 font-mono text-[10px] font-bold uppercase transition ${
                      currency === "PKR" ? "bg-action text-on-action" : "text-ink-muted"
                    }`}
                  >
                    PKR (Rs)
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="font-mono text-xl font-bold text-action">
                  {currency === "USD" ? "$" : "PKR"}
                </span>
                <input
                  type="number"
                  min="1"
                  step="any"
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full border border-line bg-surface px-4 py-2.5 font-mono text-lg font-bold text-ink outline-none focus:border-action"
                  placeholder="500"
                />
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="space-y-3">
              <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-ink block">
                Select Settlement Rail
              </span>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { id: "card", label: "Card (Stripe)", icon: CreditCard },
                  { id: "bank", label: "Meezan Bank Wire", icon: Building2 },
                  { id: "raast", label: "Raast P2M (PKR)", icon: Zap },
                  { id: "wise", label: "Wise Wire", icon: Globe },
                ].map((item) => {
                  const Icon = item.icon;
                  const isSelected = method === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setMethod(item.id as PaymentMethod)}
                      className={`p-3 border text-left transition flex flex-col justify-between gap-3 cursor-pointer ${
                        isSelected
                          ? "border-action bg-surface"
                          : "border-line bg-canvas hover:border-action/40"
                      }`}
                    >
                      <Icon size={16} className={isSelected ? "text-action" : "text-ink-muted"} />
                      <span className="font-mono text-[11px] font-bold uppercase text-ink">
                        {item.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Method-Specific Input Fields */}
            {method === "card" && (
              <div className="border border-line bg-canvas p-6 space-y-4 animate-in fade-in duration-150">
                <div className="flex items-center justify-between pb-3 border-b border-line">
                  <span className="font-mono text-[11px] font-bold uppercase text-ink">
                    Credit / Debit Card Details
                  </span>
                  <span className="font-mono text-[10px] text-ink-muted flex items-center gap-1">
                    <Lock size={10} className="text-action" />
                    <span>256-Bit SSL Encrypted</span>
                  </span>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="font-mono text-[10px] uppercase text-ink-muted block mb-1">
                      Card Number
                    </label>
                    <input
                      type="text"
                      maxLength={19}
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      placeholder="•••• •••• •••• ••••"
                      className="w-full border border-line bg-surface px-3.5 py-2 text-xs font-mono text-ink outline-none focus:border-action tracking-widest"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="font-mono text-[10px] uppercase text-ink-muted block mb-1">
                        Expiry (MM/YY)
                      </label>
                      <input
                        type="text"
                        maxLength={5}
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        placeholder="MM/YY"
                        className="w-full border border-line bg-surface px-3.5 py-2 text-xs font-mono text-ink outline-none focus:border-action"
                      />
                    </div>
                    <div>
                      <label className="font-mono text-[10px] uppercase text-ink-muted block mb-1">
                        Security Code (CVC)
                      </label>
                      <input
                        type="password"
                        maxLength={4}
                        value={cardCvc}
                        onChange={(e) => setCardCvc(e.target.value)}
                        placeholder="CVC"
                        className="w-full border border-line bg-surface px-3.5 py-2 text-xs font-mono text-ink outline-none focus:border-action"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="font-mono text-[10px] uppercase text-ink-muted block mb-1">
                      Cardholder Legal Name
                    </label>
                    <input
                      type="text"
                      value={cardHolder}
                      onChange={(e) => setCardHolder(e.target.value)}
                      placeholder="Name as printed on card"
                      className="w-full border border-line bg-surface px-3.5 py-2 text-xs font-mono text-ink outline-none focus:border-action uppercase"
                    />
                  </div>
                </div>
              </div>
            )}

            {method === "bank" && (
              <div className="border border-line bg-canvas p-6 space-y-4 animate-in fade-in duration-150">
                <div className="border-b border-line pb-3">
                  <span className="font-mono text-[11px] font-bold uppercase text-ink block">
                    Meezan Bank Direct Wire Coordinates
                  </span>
                  <p className="text-xs text-ink-muted font-light mt-0.5">
                    Transfer funds directly to our corporate bank account, then input your bank transaction reference below.
                  </p>
                </div>

                <div className="p-4 bg-surface border border-line space-y-2 font-mono text-xs">
                  <div className="flex justify-between">
                    <span className="text-ink-muted">Bank Name:</span>
                    <span className="font-bold text-ink">Meezan Bank Limited</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-ink-muted">Account Title:</span>
                    <span className="font-bold text-ink">Tauqeer Mustafa Inc.</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-ink-muted">IBAN:</span>
                    <div className="flex items-center gap-1.5 font-bold text-action">
                      <span>PK64MEZN0001090108421092</span>
                      <button
                        type="button"
                        onClick={() => handleCopyText("PK64MEZN0001090108421092", setCopiedIban)}
                        className="text-ink-muted hover:text-ink p-1"
                      >
                        {copiedIban ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                      </button>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-ink-muted">SWIFT / BIC:</span>
                    <span className="text-ink">MEZNPKKA</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div>
                    <label className="font-mono text-[10px] uppercase text-ink-muted block mb-1">
                      Your Remitting Bank
                    </label>
                    <input
                      type="text"
                      value={senderBank}
                      onChange={(e) => setSenderBank(e.target.value)}
                      placeholder="e.g. Meezan Bank, HBL, Standard Chartered"
                      className="w-full border border-line bg-surface px-3.5 py-2 text-xs font-mono text-ink outline-none focus:border-action"
                    />
                  </div>
                  <div>
                    <label className="font-mono text-[10px] uppercase text-ink-muted block mb-1">
                      Bank Transaction ID / RRN <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={bankRef}
                      onChange={(e) => setBankRef(e.target.value)}
                      placeholder="e.g. 984210398214"
                      className="w-full border border-line bg-surface px-3.5 py-2 text-xs font-mono text-ink outline-none focus:border-action uppercase"
                    />
                  </div>
                </div>
              </div>
            )}

            {method === "raast" && (
              <div className="border border-line bg-canvas p-6 space-y-4 animate-in fade-in duration-150">
                <div className="border-b border-line pb-3">
                  <span className="font-mono text-[11px] font-bold uppercase text-ink block">
                    State Bank Raast Instant Payment (0% Fee)
                  </span>
                  <p className="text-xs text-ink-muted font-light mt-0.5">
                    Real-time PKR settlement available across all Pakistani mobile banking apps.
                  </p>
                </div>

                <div className="p-4 bg-surface border border-line space-y-2 font-mono text-xs">
                  <div className="flex justify-between">
                    <span className="text-ink-muted">Account Title:</span>
                    <span className="font-bold text-ink">Tauqeer Mustafa Inc.</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-ink-muted">Raast IBAN:</span>
                    <div className="flex items-center gap-1.5 font-bold text-action">
                      <span>PK64MEZN0001090108421092</span>
                      <button
                        type="button"
                        onClick={() => handleCopyText("PK64MEZN0001090108421092", setCopiedRaast)}
                        className="text-ink-muted hover:text-ink p-1"
                      >
                        {copiedRaast ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                      </button>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="font-mono text-[10px] uppercase text-ink-muted block mb-1">
                    Raast Transaction Reference / STAN
                  </label>
                  <input
                    type="text"
                    value={bankRef}
                    onChange={(e) => setBankRef(e.target.value)}
                    placeholder="e.g. RST-8941092"
                    className="w-full border border-line bg-surface px-3.5 py-2 text-xs font-mono text-ink outline-none focus:border-action uppercase"
                  />
                </div>
              </div>
            )}

            {method === "wise" && (
              <div className="border border-line bg-canvas p-6 space-y-4 animate-in fade-in duration-150">
                <div className="border-b border-line pb-3">
                  <span className="font-mono text-[11px] font-bold uppercase text-ink block">
                    Wise Multi-Currency Settlement
                  </span>
                  <p className="text-xs text-ink-muted font-light mt-0.5">
                    For international clients remitting USD, EUR, or GBP at mid-market exchange rates.
                  </p>
                </div>

                <div className="p-4 bg-surface border border-line space-y-2 font-mono text-xs">
                  <div className="flex justify-between">
                    <span className="text-ink-muted">Wise Business Email:</span>
                    <div className="flex items-center gap-1.5 font-bold text-action">
                      <span>billing@tauqeermustafa.tech</span>
                      <button
                        type="button"
                        onClick={() => handleCopyText("billing@tauqeermustafa.tech", setCopiedWise)}
                        className="text-ink-muted hover:text-ink p-1"
                      >
                        {copiedWise ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                      </button>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-ink-muted">Recipient Name:</span>
                    <span className="font-bold text-ink">Tauqeer Mustafa Inc.</span>
                  </div>
                </div>

                <div>
                  <label className="font-mono text-[10px] uppercase text-ink-muted block mb-1">
                    Wise Transfer Reference / Transaction ID
                  </label>
                  <input
                    type="text"
                    value={bankRef}
                    onChange={(e) => setBankRef(e.target.value)}
                    placeholder="e.g. #TRANSFER-894129"
                    className="w-full border border-line bg-surface px-3.5 py-2 text-xs font-mono text-ink outline-none focus:border-action uppercase"
                  />
                </div>
              </div>
            )}

            {errorMessage && (
              <div className="flex items-start gap-2 p-3 border border-red-500/30 bg-red-500/5 text-xs text-red-600 dark:text-red-400 font-mono">
                <AlertCircle size={14} className="shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={processing}
              className="w-full py-4 bg-action text-on-action font-mono text-xs font-bold uppercase tracking-[0.14em] hover:bg-action-strong transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {processing ? (
                <span>Processing Settlement...</span>
              ) : (
                <>
                  <span>
                    Submit Payment ({currency} {Number(amount || 0).toLocaleString()})
                  </span>
                  <ArrowRight size={14} />
                </>
              )}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
