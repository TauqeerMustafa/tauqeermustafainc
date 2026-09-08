"use client";

import { useState } from "react";
import { Copy, Check, Building2, Globe, Zap, ShieldCheck } from "lucide-react";

interface BankDetailItemProps {
  label: string;
  value: string;
  copyable?: boolean;
}

function BankDetailItem({ label, value, copyable = true }: BankDetailItemProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex items-center justify-between py-2 border-b border-line/60 last:border-0 text-sm">
      <span className="text-xs font-mono uppercase text-ink-muted">{label}</span>
      <div className="flex items-center gap-2">
        <span className="font-mono font-semibold text-ink text-xs sm:text-sm">{value}</span>
        {copyable && (
          <button
            type="button"
            onClick={handleCopy}
            className="text-ink/40 transition hover:text-action p-1"
            title={`Copy ${label}`}
            aria-label={`Copy ${label}`}
          >
            {copied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
          </button>
        )}
      </div>
    </div>
  );
}

export default function BankDetailsCard() {
  const [activeTab, setActiveTab] = useState<"pk" | "intl" | "raast">("pk");

  return (
    <div className="border border-line-2 bg-surface p-6 sm:p-8">
      <div className="flex flex-col gap-1 border-b border-line pb-4">
        <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-action">
          Verified Banking Coordinates
        </span>
        <h3 className="text-lg font-bold uppercase tracking-tight text-ink sm:text-xl">
          Official Company Bank Accounts
        </h3>
        <p className="text-xs text-ink-muted">
          Tauqeer Mustafa Inc. accepts direct institutional transfers with zero processing fees.
        </p>
      </div>

      {/* Tabs */}
      <div className="mt-6 flex border-b border-line">
        {[
          { id: "pk", label: "Pakistan (PKR / 1LINK)", icon: Building2 },
          { id: "raast", label: "Raast Instant (PKR)", icon: Zap },
          { id: "intl", label: "International (USD / GBP / EUR)", icon: Globe },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-3 font-mono text-xs font-bold uppercase tracking-wider transition border-b-2 -mb-[2px] ${
                isActive
                  ? "border-action text-action bg-action/5"
                  : "border-transparent text-ink-muted hover:text-ink hover:border-line-2"
              }`}
            >
              <Icon size={14} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Domestic Pakistan */}
      {activeTab === "pk" && (
        <div className="mt-6 space-y-1">
          <div className="mb-4 flex items-center justify-between bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-300 dark:border-emerald-800 px-3.5 py-2 text-xs text-emerald-800 dark:text-emerald-300">
            <span className="font-semibold">Local Bank Wire Clearance:</span>
            <span>Same-Day (Cutoff 15:00 PKT) • 0% Fee</span>
          </div>

          <BankDetailItem label="Bank Name" value="Meezan Bank Limited" copyable={false} />
          <BankDetailItem label="Account Title" value="Tauqeer Mustafa Inc." />
          <BankDetailItem label="IBAN Number" value="PK64MEZN0001090108421092" />
          <BankDetailItem label="Account Number" value="01090108421092" />
          <BankDetailItem label="Branch Code" value="0109 (Islamabad F-7 Markaz)" copyable={false} />
          <BankDetailItem label="SWIFT / BIC" value="MEZNPKKA" />
        </div>
      )}

      {/* Tab 2: Raast Instant */}
      {activeTab === "raast" && (
        <div className="mt-6 space-y-1">
          <div className="mb-4 flex items-center justify-between bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-300 dark:border-emerald-800 px-3.5 py-2 text-xs text-emerald-800 dark:text-emerald-300">
            <span className="font-semibold">State Bank Raast Gateway:</span>
            <span>Real-time 24/7 • Instant Clearance</span>
          </div>

          <BankDetailItem label="Raast ID (Phone)" value="+923356701199" />
          <BankDetailItem label="Raast ID (Email)" value="billing@tauqeermustafa.tech" />
          <BankDetailItem label="Registered Account Title" value="Tauqeer Mustafa Inc." />
          <BankDetailItem label="Associated Bank" value="Meezan Bank Limited" copyable={false} />
          <BankDetailItem label="Associated IBAN" value="PK64MEZN0001090108421092" />
        </div>
      )}

      {/* Tab 3: International */}
      {activeTab === "intl" && (
        <div className="mt-6 space-y-1">
          <div className="mb-4 flex items-center justify-between bg-blue-50 dark:bg-blue-950/30 border border-blue-300 dark:border-blue-800 px-3.5 py-2 text-xs text-blue-800 dark:text-blue-300">
            <span className="font-semibold">Cross-Border Remittance:</span>
            <span>SWIFT Wire / Wise • 1–3 Business Days</span>
          </div>

          <BankDetailItem label="Beneficiary" value="Tauqeer Mustafa Inc." />
          <BankDetailItem label="Wise Multi-Currency Tag" value="tauqeermustafa-inc" />
          <BankDetailItem label="UK Head Office Account #" value="83921045" />
          <BankDetailItem label="UK Sort Code" value="23-14-70" />
          <BankDetailItem label="UK IBAN (Barclays / Wise)" value="GB29BARC20000083921045" />
          <BankDetailItem label="SWIFT / BIC Code" value="BARCGB22" />
          <BankDetailItem label="Beneficiary Address" value="TMHQ, 6 Milton Rd, Harrow HA1 1XX, UK" copyable={false} />
        </div>
      )}

      {/* Security note */}
      <div className="mt-6 flex items-start gap-2.5 border-t border-line/70 pt-4 text-xs text-ink/60">
        <ShieldCheck size={16} className="shrink-0 text-action mt-0.5" />
        <p className="leading-relaxed">
          <strong>Security Notice:</strong> Tauqeer Mustafa Inc. conducts commercial banking solely
          through the corporate credentials displayed above. Official invoices are dispatched
          exclusively from <code className="font-mono text-action font-bold">@tauqeermustafa.tech</code>.
        </p>
      </div>
    </div>
  );
}
