"use client";

import { useState } from "react";
import { Calculator, ArrowRight, ShieldCheck, Info } from "lucide-react";

type Currency = "PKR" | "USD" | "EUR" | "GBP";

interface RailOption {
  id: string;
  name: string;
  currencies: Currency[];
  speed: string;
  feePercent: number;
  flatFee: number;
  description: string;
  badge: string;
  highlight?: boolean;
}

const RAILS: RailOption[] = [
  {
    id: "raast",
    name: "Raast Instant Transfer",
    currencies: ["PKR"],
    speed: "Instant (Real-time 24/7)",
    feePercent: 0,
    flatFee: 0,
    description: "State Bank of Pakistan real-time payment gateway directly into any IBAN.",
    badge: "0% Fee • Instant",
    highlight: true,
  },
  {
    id: "local_bank",
    name: "1LINK Commercial Bank Wire",
    currencies: ["PKR"],
    speed: "Same-Day (Cutoff 15:00 PKT)",
    feePercent: 0,
    flatFee: 0,
    description: "Direct electronic clearance across all commercial banks in Pakistan.",
    badge: "0% Fee • Same Day",
  },
  {
    id: "wise",
    name: "Wise Multi-Currency Rail",
    currencies: ["USD", "EUR", "GBP"],
    speed: "1–2 Business Days",
    feePercent: 1.2,
    flatFee: 2.5,
    description: "Low-cost cross-border disbursement with real-time mid-market FX rates.",
    badge: "Mid-Market Rate",
  },
  {
    id: "swift",
    name: "Direct Institutional SWIFT Wire",
    currencies: ["USD", "EUR", "GBP"],
    speed: "2–4 Business Days",
    feePercent: 0,
    flatFee: 25,
    description: "Direct international telegraphic transfer with formal banking advice for large amounts.",
    badge: "Fixed Wire Fee",
  },
  {
    id: "payoneer",
    name: "Payoneer Direct Transfer",
    currencies: ["USD", "EUR", "GBP"],
    speed: "12–24 Hours",
    feePercent: 1.0,
    flatFee: 0,
    description: "Direct wallet-to-wallet transfer for global freelance contributors.",
    badge: "Fast Global Delivery",
  },
];

export default function PayoutCalculator() {
  const [currency, setCurrency] = useState<Currency>("PKR");
  const [amountStr, setAmountStr] = useState<string>("150000");
  const [selectedRailId, setSelectedRailId] = useState<string>("raast");

  const amount = Math.max(0, parseFloat(amountStr) || 0);

  // Available rails for selected currency
  const availableRails = RAILS.filter((r) => r.currencies.includes(currency));
  const activeRail = availableRails.find((r) => r.id === selectedRailId) || availableRails[0];

  // Fee calculation
  const networkFee = activeRail ? (amount * activeRail.feePercent) / 100 + activeRail.flatFee : 0;
  const netEstimated = Math.max(0, amount - networkFee);

  const formatMoney = (val: number) => {
    return new Intl.NumberFormat("en-US", {
      maximumFractionDigits: currency === "PKR" ? 0 : 2,
      minimumFractionDigits: currency === "PKR" ? 0 : 2,
    }).format(val);
  };

  return (
    <div className="w-full border border-line-2 bg-surface p-6 sm:p-8">
      <div className="flex flex-col gap-2">
        <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-action">
          Disbursement Estimator
        </span>
        <h3 className="text-xl font-bold uppercase tracking-tight text-ink sm:text-2xl">
          Calculate Net Settlement & Fees
        </h3>
        <p className="text-sm font-light leading-relaxed text-ink-muted">
          Compare payout rails, calculate network processing fees, and preview estimated net delivery
          times for your invoices and milestones.
        </p>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1.2fr_1fr]">
        {/* Input & Rail Selection */}
        <div className="space-y-6">
          {/* Currency Toggle */}
          <div>
            <label className="block font-mono text-[11px] font-bold uppercase tracking-wider text-ink/60 mb-2">
              Disbursement Currency
            </label>
            <div className="grid grid-cols-4 gap-2">
              {(["PKR", "USD", "EUR", "GBP"] as Currency[]).map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => {
                    setCurrency(c);
                    if (c === "PKR") {
                      setSelectedRailId("raast");
                      setAmountStr("150000");
                    } else {
                      setSelectedRailId("wise");
                      setAmountStr("1200");
                    }
                  }}
                  className={`border py-2.5 font-mono text-xs font-bold transition ${
                    currency === c
                      ? "border-action bg-action text-on-action"
                      : "border-line bg-card text-ink hover:border-action"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Amount Input */}
          <div>
            <label className="block font-mono text-[11px] font-bold uppercase tracking-wider text-ink/60 mb-2">
              Gross Invoice / Milestone Amount ({currency})
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 font-mono text-sm font-bold text-ink/40">
                {currency === "USD" ? "$" : currency === "PKR" ? "Rs." : currency === "EUR" ? "€" : "£"}
              </span>
              <input
                type="number"
                min="1"
                step="any"
                value={amountStr}
                onChange={(e) => setAmountStr(e.target.value)}
                className="w-full border border-line-2 bg-card py-3.5 pl-12 pr-4 font-mono text-base font-bold text-ink outline-none transition focus:border-action focus:ring-1 focus:ring-action"
              />
            </div>
          </div>

          {/* Rails List */}
          <div>
            <label className="block font-mono text-[11px] font-bold uppercase tracking-wider text-ink/60 mb-2">
              Select Payout Rail
            </label>
            <div className="space-y-2.5">
              {availableRails.map((rail) => {
                const isSelected = activeRail.id === rail.id;
                return (
                  <button
                    key={rail.id}
                    type="button"
                    onClick={() => setSelectedRailId(rail.id)}
                    className={`flex w-full items-start justify-between border p-3.5 text-left transition ${
                      isSelected
                        ? "border-action bg-action/5 ring-1 ring-action"
                        : "border-line bg-card hover:border-line-2"
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-ink">{rail.name}</span>
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                            rail.highlight
                              ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                              : "bg-surface-2 text-ink-muted"
                          }`}
                        >
                          {rail.badge}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-ink-muted">{rail.description}</p>
                    </div>
                    <span className="font-mono text-xs font-semibold text-action shrink-0">
                      {rail.speed}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Breakdown Card */}
        <div className="flex flex-col justify-between border border-line-2 bg-card p-6 sm:p-7">
          <div>
            <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-action">
              Settlement Breakdown
            </span>
            <h4 className="mt-1 text-base font-bold uppercase tracking-tight text-ink">
              Disbursement Summary
            </h4>

            <div className="mt-6 space-y-3.5 border-b border-line pb-6 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-ink-muted">Gross Amount</span>
                <span className="font-mono font-semibold text-ink">
                  {currency} {formatMoney(amount)}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-ink-muted flex items-center gap-1">
                  <span>Network Rail Fee</span>
                  <span title="Transfer and intermediary network fee">
                    <Info size={13} className="text-ink/40" />
                  </span>
                </span>
                <span className="font-mono font-semibold text-ink">
                  {networkFee === 0 ? (
                    <span className="text-emerald-600 font-bold">FREE (0.00)</span>
                  ) : (
                    `-${currency} ${formatMoney(networkFee)}`
                  )}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-ink-muted">Platform Deductions</span>
                <span className="font-mono font-bold text-emerald-600">ZERO (TMI Paid)</span>
              </div>
            </div>

            <div className="mt-6">
              <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-ink/40">
                Estimated Net Delivery
              </span>
              <div className="mt-1 text-3xl font-bold tracking-tight text-ink">
                {currency} {formatMoney(netEstimated)}
              </div>
              <p className="mt-2 text-xs font-light text-ink-muted">
                Settlement Window: <strong className="text-ink">{activeRail.speed}</strong>
              </p>
            </div>
          </div>

          <div className="mt-8 border-t border-line/70 pt-4 text-xs text-ink/60 space-y-2">
            <div className="flex items-center gap-1.5 text-ink font-semibold">
              <ShieldCheck size={14} className="text-action" />
              <span>Full Value Protection</span>
            </div>
            <p className="leading-relaxed">
              TMI absorbs internal payment processing overheads. Foreign exchange spreads on Wise
              and bank wires reflect live interbank rates at disbursement time.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
