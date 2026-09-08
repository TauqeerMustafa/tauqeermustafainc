"use client";

/**
 * TEMPORARY design harness — /design-preview
 *
 * The real portals sit behind PortalGuard, which renders null without a backend
 * session, so they cannot be seen while developing locally. This unguarded page
 * renders the REAL portal primitives (PortalUI) with mock data, inside chrome
 * that mirrors PortalHeader/PortalSidebar, so the BMW redesign can be viewed and
 * iterated in both themes. Not linked anywhere; delete once the redesign lands.
 */

import { useEffect, useState } from "react";
import {
  Bell,
  Briefcase,
  CalendarDays,
  ChevronRight,
  Clock,
  DollarSign,
  LayoutDashboard,
  LogOut,
  Mail,
  Menu,
  MessageSquare,
  Search,
  Settings,
  Sun,
  Moon,
  Users,
} from "lucide-react";

import {
  Avatar,
  Badge,
  Callout,
  DataTable,
  Eyebrow,
  InfoBox,
  Panel,
  PortalButton,
  PortalPageHeader,
  Progress,
  StatCard,
  StatusPill,
  Tabs,
  Td,
  inputClass,
} from "@/components/portal/PortalUI";

const NAV = [
  {
    title: "Overview",
    items: [
      { label: "Dashboard", icon: LayoutDashboard, active: true },
      { label: "Analytics", icon: DollarSign, active: false },
    ],
  },
  {
    title: "People",
    items: [
      { label: "Employees", icon: Users, active: false },
      { label: "Attendance", icon: Clock, active: false },
      { label: "Leave", icon: CalendarDays, active: false },
    ],
  },
  {
    title: "Comms",
    items: [
      { label: "WhatsApp", icon: MessageSquare, active: false },
      { label: "Webmail", icon: Mail, active: false },
    ],
  },
];

const ROWS = [
  { name: "Ayesha Khan", dept: "Design", status: "active", when: "2m ago" },
  { name: "Bilal Ahmed", dept: "Engineering", status: "present", when: "14m ago" },
  { name: "Fatima Noor", dept: "Marketing", status: "late", when: "1h ago" },
  { name: "Usman Tariq", dept: "Sales", status: "on_leave", when: "3h ago" },
  { name: "Zara Sheikh", dept: "Support", status: "absent", when: "Yesterday" },
];

export default function DesignPreview() {
  const [dark, setDark] = useState(false);
  const [tab, setTab] = useState<"all" | "active" | "archived">("all");

  useEffect(() => {
    const root = document.documentElement;
    if (dark) root.classList.add("dark");
    else root.classList.remove("dark");
  }, [dark]);

  return (
    <div dir="ltr" className="flex min-h-screen" style={{ background: "var(--adm-bg)" }}>
      {/* ── Sidebar (mirrors PortalSidebar, BMW) ─────────────── */}
      <aside className="hidden w-[264px] shrink-0 flex-col border-e border-adm-border bg-adm-surface lg:flex">
        <div className="flex items-center gap-2.5 border-b border-adm-border px-5 py-4">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-none bg-adm-text text-[13px] font-bold text-adm-surface">
            M
          </span>
          <span className="min-w-0">
            <span className="block text-sm font-semibold leading-tight tracking-tight text-adm-text">
              TM Inc.
            </span>
            <span className="block text-[11px] font-medium tracking-wide text-adm-blue">
              Admin Portal
            </span>
          </span>
        </div>

        <nav className="adm-scroll flex-1 overflow-y-auto px-3 py-4">
          {NAV.map((section, i) => (
            <div key={section.title} className={i > 0 ? "mt-5" : ""}>
              <p className="mb-2 px-3.5 text-[11px] font-medium uppercase tracking-wider text-adm-text-3">
                {section.title}
              </p>
              {section.items.map((item) => {
                const Icon = item.icon;
                return (
                  <a
                    key={item.label}
                    href="#"
                    onClick={(e) => e.preventDefault()}
                    className={`adm-nav-link mb-1 flex items-center gap-3 rounded-none px-3.5 py-2 text-[14px] font-medium transition-all ${
                      item.active
                        ? "active bg-adm-blue-light text-adm-blue font-semibold"
                        : "text-adm-text-2 hover:bg-adm-surface-2 hover:text-adm-text"
                    }`}
                  >
                    <Icon size={17} className={`shrink-0 ${item.active ? "text-adm-blue" : "text-adm-text-3"}`} />
                    <span className="flex-1 truncate">{item.label}</span>
                    {item.active && <ChevronRight size={14} className="text-adm-blue" />}
                  </a>
                );
              })}
            </div>
          ))}
        </nav>

        <div className="border-t border-adm-border px-5 py-4 text-[11px] text-adm-text-3">
          Tauqeer Mustafa Inc. &copy; 2026
        </div>
      </aside>

      {/* ── Main column ─────────────────────────────────────── */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Header (mirrors PortalHeader, BMW) */}
        <header className="sticky top-0 z-30 flex h-[60px] items-center justify-between gap-3 border-b border-adm-border bg-adm-surface px-6">
          <div className="flex min-w-0 items-center gap-3">
            <button className="flex h-9 w-9 items-center justify-center rounded-full border border-adm-border text-adm-text-2 lg:hidden">
              <Menu size={18} />
            </button>
            <div className="relative hidden md:block">
              <Search size={15} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-adm-text-3" />
              <input
                type="search"
                placeholder="Search anything…"
                className="w-56 rounded-none border border-adm-border bg-adm-surface-2 py-1.5 pl-9 pr-4 text-sm text-adm-text outline-none transition placeholder:text-adm-text-3 focus:border-adm-blue focus:bg-adm-surface lg:w-72"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setDark((d) => !d)}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-adm-border text-adm-text-2 transition hover:bg-adm-surface-2 hover:text-adm-text"
              aria-label="Toggle theme"
            >
              {dark ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            <button className="relative flex h-9 w-9 items-center justify-center rounded-full border border-adm-border text-adm-text-2 transition hover:bg-adm-surface-2 hover:text-adm-text">
              <Bell size={16} />
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full border-2 border-adm-surface bg-adm-blue" />
            </button>
            <div className="hidden items-center gap-2.5 rounded-none border border-adm-border bg-adm-surface-2/60 px-3 py-1 sm:flex">
              <Avatar name="Tauqeer" size={26} />
              <div className="min-w-0">
                <p className="truncate text-xs font-semibold leading-tight text-adm-text">Tauqeer Mustafa</p>
                <p className="truncate text-[9px] font-medium uppercase tracking-wider text-adm-text-3">Administrator</p>
              </div>
            </div>
            <button className="flex h-9 w-9 items-center justify-center rounded-full border border-adm-border text-adm-text-2 transition hover:border-adm-red hover:bg-adm-red-light hover:text-adm-red">
              <LogOut size={17} />
            </button>
          </div>
        </header>

        {/* Content — REAL PortalUI primitives */}
        <main className="adm-page mx-auto w-full max-w-[1400px] flex-1 space-y-6 p-8">
          <PortalPageHeader title="Good morning, Tauqeer" description="Here is what is happening across your company today.">
            <PortalButton variant="ghost">Export</PortalButton>
            <PortalButton variant="primary">New report</PortalButton>
          </PortalPageHeader>

          {/* M-stripe brand accent */}
          <div className="m-stripe w-28" />

          {/* Stat tiles */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Revenue" value="$48,250" icon={DollarSign} tone="blue" hint="+12.4% vs last week" />
            <StatCard label="Employees" value="1,284" icon={Users} tone="green" hint="+3.2% vs last week" />
            <StatCard label="Open tickets" value="37" icon={Briefcase} tone="amber" hint="-8.1% vs last week" />
            <StatCard label="Response" value="2h 14m" icon={Clock} tone="neutral" hint="-19% vs last week" />
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Table panel */}
            <div className="space-y-4 lg:col-span-2">
              <Tabs
                tabs={[
                  { id: "all", label: "All" },
                  { id: "active", label: "Active", count: 4, countTone: "green" },
                  { id: "archived", label: "Archived" },
                ]}
                value={tab}
                onChange={setTab}
              />
              <DataTable head={["Name", "Department", "Status", "Last seen"]}>
                {ROWS.map((r) => (
                  <tr key={r.name}>
                    <Td strong>
                      <span className="flex items-center gap-3">
                        <Avatar name={r.name} size={30} tone="neutral" />
                        {r.name}
                      </span>
                    </Td>
                    <Td>{r.dept}</Td>
                    <Td><StatusPill status={r.status} /></Td>
                    <Td className="text-right text-adm-text-3">{r.when}</Td>
                  </tr>
                ))}
              </DataTable>
            </div>

            {/* Side column */}
            <div className="space-y-6">
              <Panel title="Quick actions">
                <div className="space-y-3">
                  <div className="flex flex-col gap-2">
                    <PortalButton variant="primary">Add employee</PortalButton>
                    <PortalButton variant="ghost">Send announcement</PortalButton>
                  </div>
                  <div>
                    <Eyebrow>Departments</Eyebrow>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      <Badge tone="blue">Design</Badge>
                      <Badge tone="green">Engineering</Badge>
                      <Badge tone="amber">Sales</Badge>
                      <Badge tone="neutral">Support</Badge>
                    </div>
                  </div>
                  <div className="space-y-2 pt-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-adm-text-2">Q3 reviews</span>
                      <span className="tabular-nums text-adm-text-3">8 / 12</span>
                    </div>
                    <Progress value={66} tone="blue" />
                  </div>
                </div>
              </Panel>

              <Callout title="Reminder" tone="blue">
                Quarterly reviews close on Friday. 4 of 12 departments still need to submit their reports.
              </Callout>
            </div>
          </div>

          {/* InfoBox row + form input */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <InfoBox label="Present today" value="1,102" icon={Clock} tone="green" progress={86} note="86% of roster" />
            <InfoBox label="On leave" value="46" icon={CalendarDays} tone="amber" progress={12} note="12% of roster" />
            <div className="rounded-none border border-adm-border bg-adm-surface p-5">
              <Eyebrow>Search</Eyebrow>
              <input className={`${inputClass} mt-2`} placeholder="Filter employees…" />
              <p className="mt-2 text-xs text-adm-text-3">Square plate, action-blue focus border.</p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
