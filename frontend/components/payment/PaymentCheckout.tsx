"use client";

import { useState } from "react";
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
  Mail,
  Zap,
  RotateCcw,
} from "lucide-react";

interface InvoiceData {
  invoiceNumber: string;
  clientName: string;
  clientEmail: string;
  service: string;
  description: string;
  amountUSD: number;
  amountPKR: number;
  dueDate: string;
}

const SAMPLE_INVOICES: Record<string, InvoiceData> = {
  "INV-2026-081": {
    invoiceNumber: "INV-2026-081",
    clientName: "Meridian Logistics Ltd",
    clientEmail: "finance@meridianlogistics.co",
    service: "Enterprise Web Development",
    description: "Milestone 2 Delivery: Core Portal Architecture, Database Optimization & Real-Time Tracking APIs",
    amountUSD: 1850,
    amountPKR: 515000,
    dueDate: "Sep 15, 2026",
  },
  "INV-2026-089": {
    invoiceNumber: "INV-2026-089",
    clientName: "Apex Global Fintech",
    clientEmail: "accounts@apexfintech.io",
    service: "Cybersecurity Consulting & Audit",
    description: "Monthly Managed Security Retainer: Continuous Vulnerability Scans, Penetration Testing & SOC Advisory",
    amountUSD: 1200,
    amountPKR: 335000,
    dueDate: "Sep 20, 2026",
  },
  "INV-2026-095": {
    invoiceNumber: "INV-2026-095",
    clientName: "Zenith Health Systems",
    clientEmail: "ops@zenithhealth.org",
    service: "AI Solutions & Automation",
    description: "Advance Deposit: Clinical Workflow Assistant Discovery, LLM Architecture & Prompt Engineering Pipeline",
    amountUSD: 750,
    amountPKR: 210000,
    dueDate: "Sep 12, 2026",
  },
};

type PaymentMethod = "card" | "bank" | "wise";
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
}

export default function PaymentCheckout() {
  const [tab, setTab] = useState<"invoice" | "custom">("invoice");
  const [invoiceQuery, setInvoiceQuery] = useState("INV-2026-081");
  const [activeInvoice, setActiveInvoice] = useState<InvoiceData | null>(SAMPLE_INVOICES["INV-2026-081"]);
  const [invoiceError, setInvoiceError] = useState("");

  // Custom amount fields
  const [customName, setCustomName] = useState("");
  const [customEmail, setCustomEmail] = useState("");
  const [customService, setCustomService] = useState("Enterprise Web Development Deposit");
  const [customAmount, setCustomAmount] = useState("500");
  const [currency, setCurrency] = useState<Currency>("USD");

  // Payment method selection
  const [method, setMethod] = useState<PaymentMethod>("card");

  // Card form fields
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvc, setCardCvc] = useState("");
  const [cardHolder, setCardHolder] = useState("");

  // Bank transfer receipt submission
  const [bankRef, setBankRef] = useState("");
  const [senderBank, setSenderBank] = useState("");
  const [bankNotes, setBankNotes] = useState("");

  // State
  const [processing, setProcessing] = useState(false);
  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const [emailSent, setEmailSent] = useState(false);

  // Lookup invoice
  const handleLookup = (codeToLookup?: string) => {
    const code = (codeToLookup ?? invoiceQuery).trim().toUpperCase();
    setInvoiceError("");

    if (!code) {
      setInvoiceError("Please enter an invoice number.");
      return;
    }

    const found = SAMPLE_INVOICES[code];
    if (found) {
      setActiveInvoice(found);
      setInvoiceQuery(code);
    } else {
      setActiveInvoice({
        invoiceNumber: code,
        clientName: "Valued Client",
        clientEmail: "billing@client.com",
        service: "Technical Consulting Engagement",
        description: "Services rendered as specified in Statement of Work",
        amountUSD: 1000,
        amountPKR: 280000,
        dueDate: "Due upon receipt",
      });
      setInvoiceQuery(code);
    }
  };

  const getAmountToPay = () => {
    if (tab === "invoice" && activeInvoice) {
      return currency === "USD" ? activeInvoice.amountUSD : activeInvoice.amountPKR;
    }
    return Math.max(1, parseFloat(customAmount) || 0);
  };

  const handlePay = (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);

    const isInvoice = tab === "invoice" && activeInvoice;
    const client = isInvoice ? activeInvoice.clientName : customName.trim() || "Client";
    const email = isInvoice ? activeInvoice.clientEmail : customEmail.trim() || "client@email.com";
    const serviceName = isInvoice ? activeInvoice.service : customService;
    const invNum = isInvoice ? activeInvoice.invoiceNumber : `DEP-${Math.floor(1000 + Math.random() * 9000)}`;

    setTimeout(() => {
      const randomTx = `TMI-PAY-2026-${Math.floor(10000 + Math.random() * 90000)}`;
      setReceipt({
        transactionId: randomTx,
        invoiceNumber: invNum,
        clientName: client,
        clientEmail: email,
        amount: getAmountToPay(),
        currency,
        service: serviceName,
        method: method === "card" ? "Credit / Debit Card (PCI-DSS)" : method === "bank" ? "Direct Bank Transfer" : "Wise Multi-Currency",
        timestamp: new Date().toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
        referenceNote: method === "bank" && bankRef ? `Sender Ref: ${bankRef} via ${senderBank}` : undefined,
      });
      setProcessing(false);
    }, 1200);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleSendEmail = () => {
    setEmailSent(true);
    setTimeout(() => setEmailSent(false), 3000);
  };

  const handleReset = () => {
    setReceipt(null);
    setCardNumber("");
    setCardExpiry("");
    setCardCvc("");
    setCardHolder("");
    setBankRef("");
  };

  return (
    <div className="w-full border border-line-2 bg-surface p-6 sm:p-8">
      {/* If Paid: Show Verified Receipt */}
      {receipt ? (
        <div className="animate-in fade-in zoom-in-95 duration-300">
          <div className="border border-emerald-500/50 bg-emerald-50/30 dark:bg-emerald-950/20 p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-emerald-300 dark:border-emerald-800 pb-6">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white">
                  <CheckCircle2 size={26} />
                </div>
                <div>
                  <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
                    Payment Successful & Verified
                  </span>
                  <h3 className="text-xl font-bold uppercase text-ink">
                    Official Payment Receipt
                  </h3>
                  <p className="text-xs text-ink-muted">
                    Tauqeer Mustafa Inc. • Billing & Treasury Department
                  </p>
                </div>
              </div>

              <div className="text-left sm:text-right">
                <span className="font-mono text-xs text-ink/50 block">Transaction ID:</span>
                <span className="font-mono text-sm font-bold text-action">
                  {receipt.transactionId}
                </span>
              </div>
            </div>

            {/* Receipt Body */}
            <div className="my-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 border border-line bg-card p-5 text-sm">
              <div>
                <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-ink/40">
                  Amount Settle
                </span>
                <p className="mt-1 text-xl font-bold text-ink">
                  {receipt.currency} {receipt.amount.toLocaleString()}
                </p>
              </div>

              <div>
                <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-ink/40">
                  Invoice / Reference
                </span>
                <p className="mt-1 font-mono font-semibold text-action">
                  {receipt.invoiceNumber}
                </p>
              </div>

              <div>
                <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-ink/40">
                  Client / Payee
                </span>
                <p className="mt-1 font-semibold text-ink">{receipt.clientName}</p>
                <p className="text-xs text-ink-muted truncate">{receipt.clientEmail}</p>
              </div>

              <div>
                <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-ink/40">
                  Settlement Method
                </span>
                <p className="mt-1 font-semibold text-ink text-xs">{receipt.method}</p>
                <p className="text-[11px] text-ink-muted">{receipt.timestamp}</p>
              </div>
            </div>

            {/* Service details */}
            <div className="border border-line bg-card/60 p-4 text-xs">
              <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-ink/40 block mb-1">
                Engagement Scope:
              </span>
              <p className="font-semibold text-ink">{receipt.service}</p>
              {receipt.referenceNote && (
                <p className="mt-2 text-ink-muted border-t border-line/60 pt-2 font-mono">
                  {receipt.referenceNote}
                </p>
              )}
            </div>

            {/* Receipt Actions */}
            <div className="mt-6 flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-line text-xs">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handlePrint}
                  className="inline-flex items-center gap-1.5 border border-line-2 bg-card px-3.5 py-2 font-mono text-[11px] font-bold uppercase text-ink hover:border-action hover:text-action transition"
                >
                  <Printer size={14} />
                  <span>Print Receipt</span>
                </button>
                <button
                  type="button"
                  onClick={handleSendEmail}
                  className="inline-flex items-center gap-1.5 border border-line-2 bg-card px-3.5 py-2 font-mono text-[11px] font-bold uppercase text-ink hover:border-action hover:text-action transition"
                >
                  <Mail size={14} />
                  <span>{emailSent ? "Receipt Emailed!" : "Email Receipt"}</span>
                </button>
              </div>

              <button
                type="button"
                onClick={handleReset}
                className="font-mono text-xs font-bold uppercase text-action hover:underline flex items-center gap-1"
              >
                <RotateCcw size={12} />
                <span>Make Another Payment</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div>
          {/* Header */}
          <div className="flex flex-col gap-1 border-b border-line pb-4">
            <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-action">
              Online Client Terminal
            </span>
            <h3 className="text-xl font-bold uppercase tracking-tight text-ink sm:text-2xl">
              Pay Invoice or Advance Deposit
            </h3>
            <p className="text-xs text-ink-muted">
              Secure 256-bit encrypted checkout. Settle verified project milestones, retainers, and
              scheduled deliverables online.
            </p>
          </div>

          {/* Tab 1 vs Tab 2: Pay by Invoice or Custom */}
          <div className="mt-6 flex border-b border-line">
            <button
              type="button"
              onClick={() => setTab("invoice")}
              className={`px-5 py-3 font-mono text-xs font-bold uppercase tracking-wider transition border-b-2 -mb-[2px] ${
                tab === "invoice"
                  ? "border-action text-action bg-action/5"
                  : "border-transparent text-ink-muted hover:text-ink hover:border-line-2"
              }`}
            >
              1. Pay by Invoice #
            </button>
            <button
              type="button"
              onClick={() => setTab("custom")}
              className={`px-5 py-3 font-mono text-xs font-bold uppercase tracking-wider transition border-b-2 -mb-[2px] ${
                tab === "custom"
                  ? "border-action text-action bg-action/5"
                  : "border-transparent text-ink-muted hover:text-ink hover:border-line-2"
              }`}
            >
              2. Custom Amount / Advance Deposit
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handlePay} className="mt-6 space-y-6">
            {/* Invoice Lookup Row */}
            {tab === "invoice" && (
              <div className="border border-line bg-card p-5">
                <label className="block font-mono text-[11px] font-bold uppercase tracking-wider text-ink/70 mb-2">
                  Enter Your Invoice Number
                </label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    value={invoiceQuery}
                    onChange={(e) => setInvoiceQuery(e.target.value)}
                    placeholder="e.g. INV-2026-081"
                    className="flex-1 border border-line-2 bg-surface px-4 py-2.5 font-mono text-sm uppercase text-ink outline-none focus:border-action"
                  />
                  <button
                    type="button"
                    onClick={() => handleLookup()}
                    className="bg-ink px-5 py-2.5 font-mono text-xs font-bold uppercase text-white hover:bg-action transition"
                  >
                    Find Invoice
                  </button>
                </div>

                {invoiceError && (
                  <p className="mt-2 text-xs text-red-600 font-semibold">{invoiceError}</p>
                )}

                {/* Quick Samples */}
                <div className="mt-3 flex flex-wrap items-center gap-1.5 text-xs text-ink-muted">
                  <span className="font-mono text-[10px] uppercase text-ink/40">Try sample:</span>
                  {Object.keys(SAMPLE_INVOICES).map((code) => (
                    <button
                      key={code}
                      type="button"
                      onClick={() => handleLookup(code)}
                      className={`font-mono text-[11px] px-2 py-0.5 border transition ${
                        activeInvoice?.invoiceNumber === code
                          ? "border-action bg-action/10 text-action font-bold"
                          : "border-line bg-surface text-ink hover:border-action"
                      }`}
                    >
                      {code}
                    </button>
                  ))}
                </div>

                {/* Display found invoice details */}
                {activeInvoice && (
                  <div className="mt-5 border-t border-line/70 pt-4 grid gap-3 sm:grid-cols-2 text-xs">
                    <div>
                      <span className="font-mono text-[10px] uppercase text-ink/40 block">
                        Billed To:
                      </span>
                      <p className="font-bold text-ink text-sm">{activeInvoice.clientName}</p>
                      <p className="text-ink-muted">{activeInvoice.clientEmail}</p>
                    </div>

                    <div>
                      <span className="font-mono text-[10px] uppercase text-ink/40 block">
                        Service & Milestone:
                      </span>
                      <p className="font-semibold text-ink">{activeInvoice.service}</p>
                      <p className="text-ink-muted line-clamp-1">{activeInvoice.description}</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Custom Amount Form */}
            {tab === "custom" && (
              <div className="border border-line bg-card p-5 space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-semibold text-ink mb-1">
                      Client / Company Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={customName}
                      onChange={(e) => setCustomName(e.target.value)}
                      placeholder="e.g. Acme Corp / John Doe"
                      className="w-full border border-line-2 bg-surface px-3.5 py-2 text-sm text-ink outline-none focus:border-action"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-ink mb-1">
                      Billing Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={customEmail}
                      onChange={(e) => setCustomEmail(e.target.value)}
                      placeholder="e.g. billing@acme.com"
                      className="w-full border border-line-2 bg-surface px-3.5 py-2 text-sm text-ink outline-none focus:border-action"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-ink mb-1">
                    Service or Project Description
                  </label>
                  <input
                    type="text"
                    value={customService}
                    onChange={(e) => setCustomService(e.target.value)}
                    placeholder="e.g. Web Development Advance Booking"
                    className="w-full border border-line-2 bg-surface px-3.5 py-2 text-sm text-ink outline-none focus:border-action"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-ink mb-1">
                    Amount to Pay *
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={customAmount}
                    onChange={(e) => setCustomAmount(e.target.value)}
                    className="w-full border border-line-2 bg-surface px-3.5 py-2 font-mono text-base font-bold text-ink outline-none focus:border-action"
                  />
                </div>
              </div>
            )}

            {/* Currency Switcher & Total to Pay */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border border-line-2 bg-card p-4 gap-4">
              <div>
                <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-ink/50">
                  Payment Currency
                </span>
                <div className="flex gap-2 mt-1">
                  <button
                    type="button"
                    onClick={() => setCurrency("USD")}
                    className={`px-3 py-1 font-mono text-xs font-bold border transition ${
                      currency === "USD"
                        ? "border-action bg-action text-on-action"
                        : "border-line bg-surface text-ink"
                    }`}
                  >
                    USD ($)
                  </button>
                  <button
                    type="button"
                    onClick={() => setCurrency("PKR")}
                    className={`px-3 py-1 font-mono text-xs font-bold border transition ${
                      currency === "PKR"
                        ? "border-action bg-action text-on-action"
                        : "border-line bg-surface text-ink"
                    }`}
                  >
                    PKR (Rs.)
                  </button>
                </div>
              </div>

              <div className="text-left sm:text-right">
                <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-ink/50">
                  Total Amount Due:
                </span>
                <div className="text-2xl font-bold font-mono text-action">
                  {currency === "USD" ? "$" : "PKR "}
                  {getAmountToPay().toLocaleString()}
                </div>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div>
              <label className="block font-mono text-[11px] font-bold uppercase tracking-wider text-ink/70 mb-2">
                Choose Payment Rail:
              </label>
              <div className="grid gap-3 sm:grid-cols-3">
                <button
                  type="button"
                  onClick={() => setMethod("card")}
                  className={`flex flex-col items-start p-4 border text-left transition ${
                    method === "card"
                      ? "border-action bg-action/5 ring-1 ring-action"
                      : "border-line bg-card hover:border-line-2"
                  }`}
                >
                  <CreditCard size={18} className="text-action mb-2" />
                  <span className="font-semibold text-sm text-ink">Credit / Debit Card</span>
                  <span className="text-[11px] text-ink-muted mt-0.5">Visa, Mastercard, Amex</span>
                </button>

                <button
                  type="button"
                  onClick={() => setMethod("bank")}
                  className={`flex flex-col items-start p-4 border text-left transition ${
                    method === "bank"
                      ? "border-action bg-action/5 ring-1 ring-action"
                      : "border-line bg-card hover:border-line-2"
                  }`}
                >
                  <Building2 size={18} className="text-action mb-2" />
                  <span className="font-semibold text-sm text-ink">Direct Bank Transfer</span>
                  <span className="text-[11px] text-ink-muted mt-0.5">Meezan Bank, 1LINK, Raast</span>
                </button>

                <button
                  type="button"
                  onClick={() => setMethod("wise")}
                  className={`flex flex-col items-start p-4 border text-left transition ${
                    method === "wise"
                      ? "border-action bg-action/5 ring-1 ring-action"
                      : "border-line bg-card hover:border-line-2"
                  }`}
                >
                  <Globe size={18} className="text-action mb-2" />
                  <span className="font-semibold text-sm text-ink">Wise / International Wire</span>
                  <span className="text-[11px] text-ink-muted mt-0.5">USD, EUR, GBP cross-border</span>
                </button>
              </div>
            </div>

            {/* Method Details: Card Form */}
            {method === "card" && (
              <div className="border border-line bg-card p-5 space-y-4 animate-in fade-in duration-200">
                <div className="flex items-center justify-between border-b border-line pb-3">
                  <span className="font-mono text-xs font-bold uppercase text-ink">
                    Card Details (256-Bit SSL Encrypted)
                  </span>
                  <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-semibold">
                    <Lock size={12} />
                    <span>PCI DSS Level 1</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-ink mb-1">
                    Card Number
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={19}
                    value={cardNumber}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, "").replace(/(\d{4})(?=\d)/g, "$1 ");
                      setCardNumber(val);
                    }}
                    placeholder="4000 1234 5678 9010"
                    className="w-full border border-line-2 bg-surface px-3.5 py-2 font-mono text-sm text-ink outline-none focus:border-action"
                  />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-ink mb-1">
                      Expires (MM/YY)
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={5}
                      value={cardExpiry}
                      onChange={(e) => {
                        let val = e.target.value.replace(/\D/g, "");
                        if (val.length >= 2) val = `${val.slice(0, 2)}/${val.slice(2, 4)}`;
                        setCardExpiry(val);
                      }}
                      placeholder="MM/YY"
                      className="w-full border border-line-2 bg-surface px-3.5 py-2 font-mono text-sm text-ink outline-none focus:border-action"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-ink mb-1">
                      CVC / CVV
                    </label>
                    <input
                      type="password"
                      required
                      maxLength={4}
                      value={cardCvc}
                      onChange={(e) => setCardCvc(e.target.value.replace(/\D/g, ""))}
                      placeholder="123"
                      className="w-full border border-line-2 bg-surface px-3.5 py-2 font-mono text-sm text-ink outline-none focus:border-action"
                    />
                  </div>

                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-xs font-semibold text-ink mb-1">
                      Cardholder Name
                    </label>
                    <input
                      type="text"
                      required
                      value={cardHolder}
                      onChange={(e) => setCardHolder(e.target.value)}
                      placeholder="Full Name on Card"
                      className="w-full border border-line-2 bg-surface px-3.5 py-2 text-sm text-ink outline-none focus:border-action"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Method Details: Bank Transfer Notification Form */}
            {method === "bank" && (
              <div className="border border-line bg-card p-5 space-y-4 animate-in fade-in duration-200">
                <div className="border-b border-line pb-3">
                  <span className="font-mono text-xs font-bold uppercase text-ink block">
                    Step 2: Confirm Bank Wire / Transfer
                  </span>
                  <p className="text-xs text-ink-muted mt-1">
                    Transfer to our official Meezan Bank account shown below, then enter your
                    reference to immediately attach proof to your invoice.
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-semibold text-ink mb-1">
                      Bank Transaction ID / RRN *
                    </label>
                    <input
                      type="text"
                      required
                      value={bankRef}
                      onChange={(e) => setBankRef(e.target.value)}
                      placeholder="e.g. FT26084920491 or Raast Ref"
                      className="w-full border border-line-2 bg-surface px-3.5 py-2 font-mono text-sm text-ink outline-none focus:border-action"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-ink mb-1">
                      Your Bank / App Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={senderBank}
                      onChange={(e) => setSenderBank(e.target.value)}
                      placeholder="e.g. HBL, Meezan, Standard Chartered"
                      className="w-full border border-line-2 bg-surface px-3.5 py-2 text-sm text-ink outline-none focus:border-action"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-ink mb-1">
                    Additional Transfer Notes (Optional)
                  </label>
                  <input
                    type="text"
                    value={bankNotes}
                    onChange={(e) => setBankNotes(e.target.value)}
                    placeholder="Sender account title, branch, or time of transfer…"
                    className="w-full border border-line-2 bg-surface px-3.5 py-2 text-sm text-ink outline-none focus:border-action"
                  />
                </div>
              </div>
            )}

            {/* Method Details: Wise Transfer */}
            {method === "wise" && (
              <div className="border border-line bg-card p-5 space-y-4 animate-in fade-in duration-200">
                <div className="border-b border-line pb-3">
                  <span className="font-mono text-xs font-bold uppercase text-ink block">
                    Cross-Border Transfer Confirmation
                  </span>
                  <p className="text-xs text-ink-muted mt-1">
                    Dispatched via Wise or SWIFT wire to our UK / Barclays account. Enter your
                    transfer confirmation # below.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-ink mb-1">
                    Wise Transfer ID / SWIFT Reference # *
                  </label>
                  <input
                    type="text"
                    required
                    value={bankRef}
                    onChange={(e) => setBankRef(e.target.value)}
                    placeholder="e.g. #TRANSFER-94810284"
                    className="w-full border border-line-2 bg-surface px-3.5 py-2 font-mono text-sm text-ink outline-none focus:border-action"
                  />
                </div>
              </div>
            )}

            {/* Submit Action */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-2">
              <div className="flex items-center gap-2 text-xs text-ink/60">
                <ShieldCheck size={16} className="text-action" />
                <span>Zero hidden fees. Instant receipt generated upon completion.</span>
              </div>

              <button
                type="submit"
                disabled={processing}
                className="inline-flex min-h-12 items-center justify-center gap-2 bg-action px-8 font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-on-action transition hover:bg-action-strong active:scale-[0.98] disabled:opacity-50"
              >
                <span>
                  {processing
                    ? "Authorizing & Settle…"
                    : method === "card"
                    ? `Pay ${currency === "USD" ? "$" : "PKR "} ${getAmountToPay().toLocaleString()} Now`
                    : "Confirm & Submit Transfer Proof"}
                </span>
                <ArrowRight size={15} />
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
