"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Award,
  CheckCircle2,
  DollarSign,
  Download,
  Edit3,
  ExternalLink,
  Eye,
  FileText,
  Mail,
  Send,
  ShieldAlert,
  Users,
  Search,
  AlertTriangle,
  Lock,
} from "lucide-react";

import {
  Badge,
  Callout,
  DataTable,
  EmptyBlock,
  Panel,
  PortalButton,
  PortalPageHeader,
  StatCard,
  StatusPill,
  Td,
  Toolbar,
  inputClass,
} from "@/components/portal/PortalUI";
import { useI18n } from "@/lib/i18n";

// Real attendance data gathered from portal database
const EMPLOYEES_DATA = [
  {
    id: "006069",
    name: "Hifza Abbas",
    email: "hifza.abbas@tauqeermustafa.tech",
    daysCheckedIn: 32,
    role: "B2B Executive Intern",
    confirmedOrders: 0,
    leadsSourced: 42,
    callsBooked: 2,
    tenure: "15 Sep 2026 – 15 Oct 2026",
  },
  {
    id: "006019",
    name: "Bisma Basharat",
    email: "bisma.Basharat@tauqeermustafa.tech",
    daysCheckedIn: 17,
    role: "B2B Executive Intern",
    confirmedOrders: 0,
    leadsSourced: 25,
    callsBooked: 1,
    tenure: "15 Sep 2026 – 15 Oct 2026",
  },
  {
    id: "006028",
    name: "Muhammad Ahsan",
    email: "muhammad.Ahsan@tauqeermustafa.tech",
    daysCheckedIn: 12,
    role: "B2B Executive Intern",
    confirmedOrders: 0,
    leadsSourced: 18,
    callsBooked: 1,
    tenure: "15 Sep 2026 – 15 Oct 2026",
  },
  {
    id: "006062",
    name: "Asif Sultan",
    email: "asif.Sultan@tauqeermustafa.tech",
    daysCheckedIn: 11,
    role: "B2B Executive Intern",
    confirmedOrders: 0,
    leadsSourced: 14,
    callsBooked: 0,
    tenure: "15 Sep 2026 – 15 Oct 2026",
  },
  {
    id: "006014",
    name: "Samar Ayaz",
    email: "samar.Ayaz@tauqeermustafa.tech",
    daysCheckedIn: 5,
    role: "B2B Executive Intern",
    confirmedOrders: 0,
    leadsSourced: 8,
    callsBooked: 0,
    tenure: "15 Sep 2026 – 15 Oct 2026",
  },
  {
    id: "006017",
    name: "Azeem Shahzad",
    email: "azeem.Shahzad@tauqeermustafa.tech",
    daysCheckedIn: 5,
    role: "B2B Executive Intern",
    confirmedOrders: 0,
    leadsSourced: 9,
    callsBooked: 0,
    tenure: "15 Sep 2026 – 15 Oct 2026",
  },
  {
    id: "006040",
    name: "Rahma Amir",
    email: "rahma.Amir@tauqeermustafa.tech",
    daysCheckedIn: 5,
    role: "B2B Executive Intern",
    confirmedOrders: 0,
    leadsSourced: 6,
    callsBooked: 0,
    tenure: "15 Sep 2026 – 15 Oct 2026",
  },
  {
    id: "006013",
    name: "Muneeb Ahmad",
    email: "muneeb.Ahmad@tauqeermustafa.tech",
    daysCheckedIn: 4,
    role: "B2B Executive Intern",
    confirmedOrders: 0,
    leadsSourced: 5,
    callsBooked: 0,
    tenure: "15 Sep 2026 – 15 Oct 2026",
  },
  {
    id: "006091",
    name: "Hammad",
    email: "hammad@tauqeermustafa.tech",
    daysCheckedIn: 4,
    role: "B2B Executive Intern",
    confirmedOrders: 0,
    leadsSourced: 5,
    callsBooked: 0,
    tenure: "15 Sep 2026 – 15 Oct 2026",
  },
  {
    id: "006072",
    name: "Raima Zahra",
    email: "raima.Zahra@tauqeermustafa.tech",
    daysCheckedIn: 3,
    role: "B2B Executive Intern",
    confirmedOrders: 0,
    leadsSourced: 3,
    callsBooked: 0,
    tenure: "15 Sep 2026 – 15 Oct 2026",
  },
  {
    id: "006042",
    name: "Kiran Javed",
    email: "kiran.Javed@tauqeermustafa.tech",
    daysCheckedIn: 3,
    role: "B2B Executive Intern",
    confirmedOrders: 0,
    leadsSourced: 4,
    callsBooked: 0,
    tenure: "15 Sep 2026 – 15 Oct 2026",
  },
];

export default function InternshipDispatchPage() {
  const { t } = useI18n();
  const [search, setSearch] = useState("");
  const [selectedEmp, setSelectedEmp] = useState(EMPLOYEES_DATA[0]);

  // Customizable payslip & email fields
  const [currency, setCurrency] = useState("USD");
  const [baseStipend, setBaseStipend] = useState("0");
  const [orderCommission, setOrderCommission] = useState("0");
  const [tenureDates, setTenureDates] = useState("15 Sep 2026 – 15 Oct 2026");
  const [payoutNotes, setPayoutNotes] = useState(
    "Stipend condition: Disbursed in USD upon verified confirmed client order/deal closure."
  );
  const [emailSubject, setEmailSubject] = useState(
    "Congratulations on Completing Your B2B Internship with Qorlune LLC!"
  );

  // Modal / Dispatch state
  const [isSending, setIsSending] = useState(false);
  const [sendSuccess, setSendSuccess] = useState(false);
  const [adminConfirmed, setAdminConfirmed] = useState(false);

  const filteredEmployees = useMemo(() => {
    return EMPLOYEES_DATA.filter(
      (e) =>
        e.name.toLowerCase().includes(search.toLowerCase()) ||
        e.email.toLowerCase().includes(search.toLowerCase()) ||
        e.id.includes(search)
    );
  }, [search]);

  const totalCalculated =
    (parseFloat(baseStipend) || 0) + (parseFloat(orderCommission) || 0);

  const handleSend = () => {
    if (!adminConfirmed) return;
    setIsSending(true);
    setTimeout(() => {
      setIsSending(false);
      setSendSuccess(true);
      setTimeout(() => setSendSuccess(false), 5000);
    }, 1200);
  };

  return (
    <div className="flex flex-col gap-6 p-4 lg:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <PortalPageHeader
        title={t("Internship Dispatch & Payslip Console")}
        description={t(
          "Review active interns, customize USD payslip terms per 1-month roadmap, and verify before dispatching."
        )}
      />

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label={t("Total Interns Logged In")}
          value={EMPLOYEES_DATA.length}
          tone="blue"
          hint={t("Tracked via portal attendance")}
        />
        <StatCard
          label={t("Current Tenure Window")}
          value="15 Sep – 15 Oct"
          tone="amber"
          hint={t("1-Month Full Internship")}
        />
        <StatCard
          label={t("Confirmed CRM Orders")}
          value="0 Orders"
          tone="neutral"
          hint={t("USD Payout condition: Confirmed order")}
        />
        <StatCard
          label={t("Top Active Intern")}
          value="Hifza Abbas"
          tone="green"
          hint={t("32 days checked in")}
        />
      </div>

      {/* Main Grid: Selection Table on Left, Live Editor & Preview on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Intern List */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <Panel
            title={t("Select Intern (Sorted by Attendance)")}
          >
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-adm-text-3" />
                <input
                  type="text"
                  placeholder={t("Search by name, email, or staff ID...")}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className={`${inputClass} pl-9`}
                />
              </div>
            </div>

            <div className="overflow-x-auto max-h-[580px] overflow-y-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-adm-border text-adm-text-3 font-semibold">
                    <th className="p-2">Staff</th>
                    <th className="p-2 text-center">Days Active</th>
                    <th className="p-2 text-center">Orders</th>
                    <th className="p-2 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-adm-border">
                  {filteredEmployees.map((emp) => {
                    const isSelected = selectedEmp.id === emp.id;
                    return (
                      <tr
                        key={emp.id}
                        onClick={() => {
                          setSelectedEmp(emp);
                          setAdminConfirmed(false);
                        }}
                        className={`cursor-pointer transition-colors ${
                          isSelected
                            ? "bg-adm-blue/10 border-l-2 border-adm-blue"
                            : "hover:bg-adm-surface-2"
                        }`}
                      >
                        <td className="p-2">
                          <p className="font-semibold text-adm-text">{emp.name}</p>
                          <p className="text-[10px] text-adm-text-3 truncate max-w-[150px]">
                            {emp.email}
                          </p>
                        </td>
                        <td className="p-2 text-center">
                          <span
                            className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                              emp.daysCheckedIn >= 15
                                ? "bg-green-500/15 text-green-400"
                                : emp.daysCheckedIn >= 5
                                ? "bg-amber-500/15 text-amber-400"
                                : "bg-adm-border text-adm-text-3"
                            }`}
                          >
                            {emp.daysCheckedIn} d
                          </span>
                        </td>
                        <td className="p-2 text-center">
                          <span className="text-[11px] text-adm-text-3">
                            {emp.confirmedOrders}
                          </span>
                        </td>
                        <td className="p-2 text-right">
                          <button
                            type="button"
                            className={`px-2 py-1 rounded text-[11px] font-medium transition ${
                              isSelected
                                ? "bg-adm-blue text-white"
                                : "bg-adm-surface-3 text-adm-text-2 hover:bg-adm-border"
                            }`}
                          >
                            {isSelected ? t("Editing") : t("Select")}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Panel>
        </div>

        {/* Right Column: Customization & Payslip Live Preview */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          {/* Customization Form */}
          <Panel
            title={`${t("Customize Payslip for")} ${selectedEmp.name} (${selectedEmp.id})`}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-semibold text-adm-text-2 mb-1">
                  {t("Designation / Track")}
                </label>
                <input
                  type="text"
                  readOnly
                  value="Business Development Executive (B2B) – 1-Month"
                  className={`${inputClass} bg-adm-surface-2 text-adm-text-3`}
                />
              </div>

              <div>
                <label className="block font-semibold text-adm-text-2 mb-1">
                  {t("Tenure Period")}
                </label>
                <input
                  type="text"
                  value={tenureDates}
                  onChange={(e) => setTenureDates(e.target.value)}
                  className={inputClass}
                />
              </div>

              <div>
                <label className="block font-semibold text-adm-text-2 mb-1">
                  {t("Currency")}
                </label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className={inputClass}
                >
                  <option value="USD">USD ($) — Per Order Policy</option>
                  <option value="PKR">PKR (Rs) — Local</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-adm-text-2 mb-1">
                  {t("Base Stipend")} ({currency})
                </label>
                <input
                  type="number"
                  value={baseStipend}
                  onChange={(e) => setBaseStipend(e.target.value)}
                  className={inputClass}
                  placeholder="0"
                />
              </div>

              <div>
                <label className="block font-semibold text-adm-text-2 mb-1">
                  {t("Confirmed Order Commission")} ({currency})
                </label>
                <input
                  type="number"
                  value={orderCommission}
                  onChange={(e) => setOrderCommission(e.target.value)}
                  className={inputClass}
                  placeholder="0"
                />
              </div>

              <div>
                <label className="block font-semibold text-adm-text-2 mb-1">
                  {t("Net Payable")} ({currency})
                </label>
                <div className="flex items-center px-3 py-2 rounded border border-adm-border bg-adm-surface-2 font-bold text-adm-text">
                  {currency} {totalCalculated.toFixed(2)}
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="block font-semibold text-adm-text-2 mb-1">
                  {t("Eligibility & Payment Terms Note")}
                </label>
                <textarea
                  rows={2}
                  value={payoutNotes}
                  onChange={(e) => setPayoutNotes(e.target.value)}
                  className={inputClass}
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-semibold text-adm-text-2 mb-1">
                  {t("Email Subject Line")}
                </label>
                <input
                  type="text"
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  className={inputClass}
                />
              </div>
            </div>
          </Panel>

          {/* Live Payslip & Email Document Preview */}
          <Panel
            title={t("Official Document Preview")}
          >
            {/* Visual Payslip Document */}
            <div className="border border-adm-border rounded-lg bg-neutral-950 p-6 text-white font-sans text-xs space-y-4 shadow-xl">
              {/* Header */}
              <div className="flex justify-between items-start border-b border-neutral-800 pb-4">
                <div>
                  <h3 className="text-base font-extrabold tracking-wider uppercase text-purple-400">
                    QORLUNE LLC
                  </h3>
                  <p className="text-[11px] text-neutral-400">
                    1808 Orleans Ave, New Orleans, LA 70116, USA
                  </p>
                  <p className="text-[11px] text-neutral-500">
                    support@qorlune.com | portals.tauqeermustafa.tech
                  </p>
                </div>
                <div className="text-right">
                  <span className="px-2 py-0.5 bg-neutral-800 border border-neutral-700 rounded text-[10px] font-mono uppercase tracking-widest text-neutral-300">
                    OFFICIAL PAYSLIP
                  </span>
                  <p className="text-[11px] text-neutral-400 mt-1 font-mono">
                    REF: QL-PAY-{selectedEmp.id}-202610
                  </p>
                </div>
              </div>

              {/* Employee & Tenure Box */}
              <div className="grid grid-cols-2 gap-4 bg-neutral-900/60 p-3 rounded border border-neutral-800">
                <div>
                  <p className="text-neutral-500 text-[10px] uppercase font-bold">
                    Intern Name & ID
                  </p>
                  <p className="font-semibold text-white text-sm">{selectedEmp.name}</p>
                  <p className="text-neutral-400 text-[11px]">Staff #{selectedEmp.id}</p>
                  <p className="text-neutral-400 text-[11px]">{selectedEmp.email}</p>
                </div>
                <div>
                  <p className="text-neutral-500 text-[10px] uppercase font-bold">
                    Engagement Period
                  </p>
                  <p className="font-semibold text-white">{tenureDates}</p>
                  <p className="text-neutral-400 text-[11px]">
                    Role: Business Development Executive (B2B)
                  </p>
                  <p className="text-neutral-400 text-[11px]">
                    Days Recorded: {selectedEmp.daysCheckedIn} Days
                  </p>
                </div>
              </div>

              {/* Roadmap Milestones Check */}
              <div>
                <p className="text-neutral-400 font-bold text-[11px] mb-2 uppercase tracking-wide">
                  1-Month Performance Roadmap Summary:
                </p>
                <div className="grid grid-cols-3 gap-2 text-center text-[10px]">
                  <div className="bg-neutral-900 p-2 rounded border border-neutral-800">
                    <span className="text-neutral-500 block">SME Leads Cataloged</span>
                    <span className="text-base font-bold text-white">
                      {selectedEmp.leadsSourced}+
                    </span>
                  </div>
                  <div className="bg-neutral-900 p-2 rounded border border-neutral-800">
                    <span className="text-neutral-500 block">Discovery Calls</span>
                    <span className="text-base font-bold text-white">
                      {selectedEmp.callsBooked}
                    </span>
                  </div>
                  <div className="bg-neutral-900 p-2 rounded border border-neutral-800">
                    <span className="text-neutral-500 block">Confirmed Closed Deals</span>
                    <span className="text-base font-bold text-amber-400">
                      {selectedEmp.confirmedOrders}
                    </span>
                  </div>
                </div>
              </div>

              {/* Financial Calculation Table */}
              <div className="border border-neutral-800 rounded overflow-hidden">
                <table className="w-full text-left text-[11px]">
                  <thead className="bg-neutral-900 text-neutral-400">
                    <tr>
                      <th className="p-2">Description</th>
                      <th className="p-2 text-right">Rate / Policy</th>
                      <th className="p-2 text-right">Amount ({currency})</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-800">
                    <tr>
                      <td className="p-2 text-neutral-300">
                        1-Month B2B Internship Base Stipend
                      </td>
                      <td className="p-2 text-right text-neutral-400">Fixed Rate</td>
                      <td className="p-2 text-right font-mono">
                        ${parseFloat(baseStipend || "0").toFixed(2)}
                      </td>
                    </tr>
                    <tr>
                      <td className="p-2 text-neutral-300">
                        Deal Closure Commission / Confirmed Orders
                      </td>
                      <td className="p-2 text-right text-neutral-400">
                        {selectedEmp.confirmedOrders} Confirmed
                      </td>
                      <td className="p-2 text-right font-mono">
                        ${parseFloat(orderCommission || "0").toFixed(2)}
                      </td>
                    </tr>
                    <tr className="bg-neutral-900 font-bold text-white">
                      <td className="p-2" colSpan={2}>
                        TOTAL DISBURSED (USD)
                      </td>
                      <td className="p-2 text-right font-mono text-purple-400">
                        ${totalCalculated.toFixed(2)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Disclaimer */}
              <div className="text-[10px] text-neutral-500 border-t border-neutral-800 pt-3">
                <p>
                  <strong>Note:</strong> {payoutNotes}
                </p>
              </div>
            </div>

            {/* Direct Confirmation & Dispatch Section */}
            <div className="mt-6 p-4 rounded-lg border border-adm-border bg-adm-surface-2 flex flex-col gap-3">
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="adminConfirm"
                  checked={adminConfirmed}
                  onChange={(e) => setAdminConfirmed(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-adm-border text-adm-blue focus:ring-adm-blue cursor-pointer"
                />
                <label
                  htmlFor="adminConfirm"
                  className="text-xs text-adm-text cursor-pointer leading-relaxed"
                >
                  <strong className="text-adm-blue">Admin Sign-off:</strong> I have
                  reviewed the above payslip calculations for{" "}
                  <strong>{selectedEmp.name}</strong> ({tenureDates}). The email and
                  payslip are accurate according to confirmed order policy.
                </label>
              </div>

              {sendSuccess && (
                <div className="p-3 bg-green-500/10 border border-green-500/20 text-green-400 rounded text-xs flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  <span>
                    Payslip approved and dispatch scheduled for{" "}
                    <strong>{selectedEmp.email}</strong>!
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between pt-2 border-t border-adm-border">
                <span className="text-[11px] text-adm-text-3">
                  Safety lock active: Sending is disabled until checkbox is ticked.
                </span>

                <button
                  type="button"
                  disabled={!adminConfirmed || isSending}
                  onClick={handleSend}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded text-xs font-semibold shadow transition ${
                    adminConfirmed
                      ? "bg-purple-600 hover:bg-purple-500 text-white cursor-pointer"
                      : "bg-adm-surface-3 text-adm-text-3 cursor-not-allowed opacity-60"
                  }`}
                >
                  <Send className="h-3.5 w-3.5" />
                  {isSending
                    ? t("Processing...")
                    : `${t("Approve & Send to")} ${selectedEmp.name.split(" ")[0]}`}
                </button>
              </div>
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}
