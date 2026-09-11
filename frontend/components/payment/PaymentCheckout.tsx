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
  Sparkles,
  Loader2,
  ExternalLink,
} from "lucide-react";
import { usePaddle } from "@/hooks/usePaddle";
import { paddleConfig, PRESET_MILESTONES } from "@/config/paddle";

type PaymentMethod = "paddle" | "bank" | "raast" | "wise";
type Currency = "USD" | "EUR" | "GBP" | "PKR";

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
  const [amount, setAmount] = useState("1500");
  const [currency, setCurrency] = useState<Currency>("USD");
  const [selectedPreset, setSelectedPreset] = useState<string | null>("discovery-deposit");

  // Payment method selection
  const [method, setMethod] = useState<PaymentMethod>("paddle");

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

  // Initialize Paddle checkout SDK hook
  const { paddle, isConfigured: isPaddleConfigured, isSandbox, openCheckout } = usePaddle({
    onCheckoutCompleted: (data) => {
      const txId = data.transaction_id || `TMI-TXN-${Date.now().toString().slice(-6)}`;
      const timestamp = new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });

      const customerData = data.customer as { name?: string; email?: string } | undefined;
      const newReceipt: Receipt = {
        transactionId: txId,
        invoiceNumber: projectRef || `DEP-${Date.now().toString().slice(-5)}`,
        clientName: clientName || customerData?.name || "Client",
        clientEmail: clientEmail || customerData?.email || "",
        amount: Number(amount) || 1500,
        currency,
        service,
        method: "Paddle Checkout (Card / Apple Pay / Wire)",
        status: "VERIFIED_SETTLED",
        timestamp,
        referenceNote: `Paddle Transaction ID: ${txId}`,
      };

      setReceipt(newReceipt);
      try {
        localStorage.setItem("tmi_last_receipt", JSON.stringify(newReceipt));
        const existing = JSON.parse(localStorage.getItem("tmi_receipts") || "[]");
        localStorage.setItem("tmi_receipts", JSON.stringify([newReceipt, ...existing]));
      } catch {
        // Storage failure non-blocking
      }
    },
  });

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

  const handleSelectPreset = (presetId: string) => {
    const found = PRESET_MILESTONES.find((p) => p.id === presetId);
    if (found) {
      setSelectedPreset(presetId);
      setAmount(String(found.amount));
      setCurrency(found.currency as Currency);
      setService(found.title);
    } else {
      setSelectedPreset(null);
    }
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
        setSelectedPreset(null);
        setTab("custom");
      } else {
        setInvoiceError(
          `Invoice "${code}" was not found in our active registry. You can proceed with a direct deposit using the Custom Deposit tab.`
        );
      }
    } catch {
      setInvoiceError("Could not reach invoice verification service. Please try Direct Deposit.");
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

    setProcessing(true);

    // 1. PADDLE CHECKOUT FLOW
    if (method === "paddle") {
      try {
        const txRes = await fetch("/api/billing/paddle/create-transaction", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            clientName: clientName.trim(),
            clientEmail: clientEmail.trim(),
            service,
            projectRef: projectRef.trim() || undefined,
            amount: parsedAmount,
            currency,
          }),
        });

        const txData = await txRes.json();

        if (txRes.ok && txData.transactionId) {
          // Open official Paddle Checkout overlay
          openCheckout({
            transactionId: txData.transactionId,
            customer: {
              email: clientEmail.trim(),
            },
          });
        } else if (txData.configured === false) {
          // Guide administrator on missing API key while permitting test flow
          setErrorMessage(
            "Paddle API Key (PADDLE_API_KEY) is not yet set in environment. Please add your credentials from vendors.paddle.com to complete real transactions."
          );
        } else {
          setErrorMessage(txData.message || "Failed to initiate Paddle checkout transaction.");
        }
      } catch {
        setErrorMessage("Network error connecting to Paddle gateway. Please try again or use direct wire transfer.");
      } finally {
        setProcessing(false);
      }
      return;
    }

    // 2. DIRECT BANK TRANSFER FLOW
    if (method === "bank" && !bankRef.trim()) {
      setErrorMessage("Please enter your bank transfer reference or transaction ID (RRN).");
      setProcessing(false);
      return;
    }

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
          bankRef: bankRef.trim() || undefined,
          bankNotes: bankNotes.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (res.ok && data.receipt) {
        setReceipt(data.receipt);
        try {
          localStorage.setItem("tmi_last_receipt", JSON.stringify(data.receipt));
          const existing = JSON.parse(localStorage.getItem("tmi_receipts") || "[]");
          localStorage.setItem("tmi_receipts", JSON.stringify([data.receipt, ...existing]));
        } catch {}
      } else {
        setErrorMessage(data.message || "Payment submission could not be processed.");
      }
    } catch {
      setErrorMessage("Network error connecting to payment gateway.");
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
                  className="inline-flex items-center gap-1.5 border border-line bg-surface px-3 py-1.5 font-mono text-[11px] uppercase tracking-wider text-action hover:bg-action hover:text-white transition cursor-pointer"
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
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-action">
                    Treasury // Global Settlement Terminal
                  </span>
                  {isSandbox && (
                    <span className="font-mono text-[9px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-600 dark:text-amber-400 px-2 py-0.5 border border-amber-500/20">
                      Sandbox Mode
                    </span>
                  )}
                </div>
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
                      ? "bg-action text-white"
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
                      ? "bg-action text-white"
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
                    className="bg-action px-6 py-2.5 font-mono text-xs font-bold uppercase tracking-wider text-white hover:bg-action-hover transition disabled:opacity-50"
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
            {/* Preset Packages Chips */}
            {tab === "custom" && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-ink flex items-center gap-1.5">
                    <Sparkles size={13} className="text-action" />
                    <span>Preset Engineering Packages</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setSelectedPreset(null)}
                    className="font-mono text-[10px] text-action uppercase hover:underline"
                  >
                    Custom Milestone &rarr;
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {PRESET_MILESTONES.map((preset) => {
                    const isSelected = selectedPreset === preset.id;
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => handleSelectPreset(preset.id)}
                        className={`p-3.5 border text-left transition cursor-pointer flex flex-col justify-between ${
                          isSelected
                            ? "border-action bg-surface shadow-xs"
                            : "border-line bg-canvas hover:border-action/40"
                        }`}
                      >
                        <div>
                          <span className="font-mono text-[10px] font-bold text-action uppercase">
                            ${preset.amount.toLocaleString()} USD
                          </span>
                          <h4 className="mt-1 font-bold text-xs uppercase text-ink line-clamp-1">
                            {preset.title}
                          </h4>
                          <p className="mt-1 text-[11px] text-ink-muted font-light line-clamp-2">
                            {preset.description}
                          </p>
                        </div>
                        <span className="mt-3 font-mono text-[9px] uppercase tracking-wider text-ink/40">
                          {isSelected ? "✓ Selected" : "Select Tier"}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Payer Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="font-mono text-[11px] uppercase tracking-wider text-ink-muted block">
                  Organization / Client Legal Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="e.g. Acme Corporation or Jane Doe"
                  className="w-full border border-line bg-canvas px-3.5 py-2 text-xs font-mono text-ink outline-none focus:border-action"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-mono text-[11px] uppercase tracking-wider text-ink-muted block">
                  Billing & Invoice Delivery Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                  placeholder="e.g. billing@acme.com"
                  className="w-full border border-line bg-canvas px-3.5 py-2 text-xs font-mono text-ink outline-none focus:border-action"
                />
              </div>
            </div>

            {/* Scope / Reference */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="font-mono text-[11px] uppercase tracking-wider text-ink-muted block">
                  Service Category / Milestone Scope
                </label>
                <select
                  value={service}
                  onChange={(e) => setService(e.target.value)}
                  className="w-full border border-line bg-canvas px-3.5 py-2 text-xs font-mono text-ink outline-none focus:border-action cursor-pointer"
                >
                  <option value="Enterprise Web Development Deposit">Enterprise Web Development</option>
                  <option value="Dedicated Engineering Sprint Retainer">Dedicated Engineering Retainer</option>
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
                  {(["USD", "EUR", "GBP", "PKR"] as Currency[]).map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setCurrency(c)}
                      className={`px-3 py-1 font-mono text-[10px] font-bold uppercase transition ${
                        currency === c ? "bg-action text-white" : "text-ink-muted"
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="font-mono text-xl font-bold text-action">
                  {currency === "USD" ? "$" : currency === "EUR" ? "€" : currency === "GBP" ? "£" : "PKR"}
                </span>
                <input
                  type="number"
                  min="1"
                  step="any"
                  required
                  value={amount}
                  onChange={(e) => {
                    setAmount(e.target.value);
                    setSelectedPreset(null);
                  }}
                  className="w-full border border-line bg-surface px-4 py-2.5 font-mono text-lg font-bold text-ink outline-none focus:border-action"
                  placeholder="1500"
                />
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="space-y-3">
              <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-ink block">
                Select Settlement Rail
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                {[
                  {
                    id: "paddle",
                    label: "Paddle Checkout",
                    sub: "Cards, Apple Pay, PayPal",
                    icon: CreditCard,
                    badge: "Recommended",
                  },
                  {
                    id: "bank",
                    label: "Meezan Bank Wire",
                    sub: "Direct IBAN transfer",
                    icon: Building2,
                  },
                  {
                    id: "raast",
                    label: "Raast P2M (PKR)",
                    sub: "0% Fee Instant Settlement",
                    icon: Zap,
                  },
                  {
                    id: "wise",
                    label: "Wise Wire",
                    sub: "Multi-Currency Routing",
                    icon: Globe,
                  },
                ].map((item) => {
                  const Icon = item.icon;
                  const isSelected = method === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setMethod(item.id as PaymentMethod)}
                      className={`p-3.5 border text-left transition flex flex-col justify-between gap-2 cursor-pointer ${
                        isSelected
                          ? "border-action bg-surface ring-1 ring-action/50"
                          : "border-line bg-canvas hover:border-action/40"
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <Icon size={16} className={isSelected ? "text-action" : "text-ink-muted"} />
                        {item.badge && (
                          <span className="font-mono text-[8px] font-bold uppercase bg-action text-white px-1.5 py-0.5">
                            {item.badge}
                          </span>
                        )}
                      </div>
                      <div>
                        <span className="font-mono text-[11px] font-bold uppercase text-ink block">
                          {item.label}
                        </span>
                        <span className="font-mono text-[9px] text-ink-muted block mt-0.5">
                          {item.sub}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Paddle Details Preview */}
            {method === "paddle" && (
              <div className="border border-line bg-canvas p-6 space-y-4 animate-in fade-in duration-150">
                <div className="flex items-center justify-between pb-3 border-b border-line">
                  <div className="flex items-center gap-2">
                    <ShieldCheck size={16} className="text-action" />
                    <span className="font-mono text-[11px] font-bold uppercase text-ink">
                      Paddle Merchant of Record Settlement
                    </span>
                  </div>
                  <span className="font-mono text-[10px] text-ink-muted flex items-center gap-1">
                    <Lock size={10} className="text-action" />
                    <span>256-Bit SSL Encrypted</span>
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs text-ink-muted">
                  <div className="border border-line bg-surface p-3 space-y-1">
                    <span className="text-ink font-bold block uppercase text-[10px]">Payment Methods:</span>
                    <p className="text-[11px]">Visa, Mastercard, Amex, Apple Pay, Google Pay, PayPal.</p>
                  </div>
                  <div className="border border-line bg-surface p-3 space-y-1">
                    <span className="text-ink font-bold block uppercase text-[10px]">Tax & Compliance:</span>
                    <p className="text-[11px]">Automated sales tax, VAT, and GST invoices generated by Paddle.</p>
                  </div>
                  <div className="border border-line bg-surface p-3 space-y-1">
                    <span className="text-ink font-bold block uppercase text-[10px]">Security:</span>
                    <p className="text-[11px]">PCI-DSS Level 1 compliant hosted checkout rails.</p>
                  </div>
                </div>

                {!isPaddleConfigured && (
                  <div className="p-3 border border-amber-500/30 bg-amber-500/10 text-xs font-mono text-amber-700 dark:text-amber-300">
                    <p className="font-bold uppercase">Setup Note for Administrator:</p>
                    <p className="mt-1">
                      Add `NEXT_PUBLIC_PADDLE_CLIENT_TOKEN` and `PADDLE_API_KEY` to your `.env.local` to enable production Paddle checkout.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Meezan Bank Details */}
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

            {/* Raast Details */}
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

            {/* Wise Details */}
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
              className="w-full py-4 bg-action text-white font-mono text-xs font-bold uppercase tracking-[0.14em] hover:bg-action-hover transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {processing ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span>Connecting to Settlement Gateway...</span>
                </>
              ) : method === "paddle" ? (
                <>
                  <span>Pay with Paddle ({currency} {Number(amount || 0).toLocaleString()})</span>
                  <ArrowRight size={14} />
                </>
              ) : (
                <>
                  <span>Submit Payment Record ({currency} {Number(amount || 0).toLocaleString()})</span>
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
