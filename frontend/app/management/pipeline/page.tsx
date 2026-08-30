"use client";

import { useMemo, useState } from "react";
import { BarChart3, CalendarClock, CircleDollarSign, Search, Trophy } from "lucide-react";

import {
  DataTable,
  EmptyBlock,
  ErrorBlock,
  LoadingBlock,
  Panel,
  PortalPageHeader,
  StatCard,
  StatusPill,
  Td,
  inputClass,
} from "@/components/portal/PortalUI";
import { useLeadPipeline, useLeads } from "@/hooks/useLeads";
import type { LeadPipeline } from "@/types";

/** How wide a slice the caller was allowed to see, said honestly. */
const SCOPE_LABEL: Record<string, string> = {
  own: "your own leads",
  team: "your team's leads",
  all: "all company leads",
};

function formatDate(value: string | null | undefined) {
  if (!value) return "—";
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime())
    ? value
    : parsed.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function money(value: number | null | undefined, currency = "USD") {
  const amount = value ?? 0;
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    // Unknown currency code — fall back to a plain number rather than throwing.
    return amount.toLocaleString();
  }
}

/** Funnel column list: count and value per stage, widths inline (data-driven). */
function Funnel({ pipeline }: { pipeline: LeadPipeline }) {
  const max = Math.max(1, ...pipeline.stages.map((stage) => stage.count));
  return (
    <ul className="flex flex-col gap-3.5">
      {pipeline.stages.map((stage) => (
        <li key={stage.status} className="flex flex-col gap-1.5">
          <div className="flex items-baseline justify-between gap-4 text-sm">
            <span className="truncate text-adm-text-2">{stage.label}</span>
            <span className="flex items-baseline gap-3">
              <span className="text-xs text-adm-text-3">{money(stage.value)}</span>
              <span className="font-bold tabular-nums text-adm-text">{stage.count}</span>
            </span>
          </div>
          <div className="h-1.5 w-full bg-adm-surface-2">
            <div className="h-full bg-adm-blue" style={{ width: `${(stage.count / max) * 100}%` }} />
          </div>
        </li>
      ))}
    </ul>
  );
}

const STATUS_FILTERS = [
  { value: "", label: "All statuses" },
  { value: "new", label: "New" },
  { value: "contacted", label: "Contacted" },
  { value: "follow_up", label: "Follow up" },
  { value: "qualified", label: "Qualified" },
  { value: "proposal_sent", label: "Proposal sent" },
  { value: "won", label: "Won" },
  { value: "lost", label: "Lost" },
] as const;

export default function ManagementPipelinePage() {
  const pipeline = useLeadPipeline();
  const [status, setStatus] = useState("");
  const [query, setQuery] = useState("");

  const leads = useLeads(status ? { status, limit: 200 } : { limit: 200 });
  const rows = leads.data ?? [];
  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return rows;
    return rows.filter((lead) =>
      [lead.companyName, lead.contactPerson, lead.email, lead.assignedExecName]
        .filter(Boolean)
        .some((field) => String(field).toLowerCase().includes(needle)),
    );
  }, [rows, query]);

  const data = pipeline.data;
  const scopeNote = data ? SCOPE_LABEL[data.scope] ?? "the leads you can access" : null;

  return (
    <div className="flex flex-col gap-8">
      <PortalPageHeader
        title="Pipeline"
        description={
          scopeNote
            ? `Sales funnel across ${scopeNote}.`
            : "Sales funnel across the leads you can access."
        }
      />

      {pipeline.isLoading ? (
        <LoadingBlock label="Loading pipeline…" />
      ) : pipeline.isError || !data ? (
        <ErrorBlock
          message={
            pipeline.error instanceof Error
              ? pipeline.error.message
              : "Could not load the pipeline."
          }
          onRetry={() => pipeline.refetch()}
        />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label="Open leads"
              value={data.totalLeads}
              icon={BarChart3}
              hint={`Across ${scopeNote}`}
            />
            <StatCard
              label="Open value"
              value={money(data.openValue)}
              icon={CircleDollarSign}
              tone="neutral"
              hint="Not yet won or lost"
            />
            <StatCard
              label="Won value"
              value={money(data.wonValue)}
              icon={Trophy}
              tone="green"
            />
            <StatCard
              label="Follow-ups due"
              value={data.followUpsDue}
              icon={CalendarClock}
              tone={data.followUpsDue > 0 ? "amber" : "neutral"}
            />
          </div>

          <Panel title="Funnel" icon={BarChart3}>
            {data.stages.length === 0 ? (
              <EmptyBlock title="No leads" description="Nothing is in the pipeline yet." />
            ) : (
              <Funnel pipeline={data} />
            )}
          </Panel>
        </>
      )}

      <Panel
        title={`Leads (${filtered.length})`}
        icon={BarChart3}
        padded={false}
        action={
          <div className="flex items-center gap-2">
            <select
              value={status}
              onChange={(event) => setStatus(event.target.value)}
              aria-label="Filter leads by status"
              className={`${inputClass} w-40`}
            >
              {STATUS_FILTERS.map((filter) => (
                <option key={filter.label} value={filter.value}>
                  {filter.label}
                </option>
              ))}
            </select>
            <div className="relative">
              <Search
                size={14}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-adm-text-3"
              />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search leads…"
                aria-label="Search leads"
                className={`${inputClass} w-52 pl-9`}
              />
            </div>
          </div>
        }
      >
        {leads.isLoading ? (
          <div className="p-5">
            <LoadingBlock label="Loading leads…" />
          </div>
        ) : leads.isError ? (
          <div className="p-5">
            <ErrorBlock
              message={leads.error instanceof Error ? leads.error.message : "Could not load leads."}
              onRetry={() => leads.refetch()}
            />
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-5">
            <EmptyBlock
              title={query || status ? "No matches" : "No leads"}
              description={
                query || status ? "Try a different filter." : "No leads are in your book yet."
              }
            />
          </div>
        ) : (
          <DataTable head={["Company", "Contact", "Owner", "Value", "Follow-up", "Status"]}>
            {filtered.map((lead) => (
              <tr key={lead.id} className="transition hover:bg-adm-surface-2">
                <Td strong>
                  <span className="block truncate">{lead.companyName}</span>
                  {lead.industry ? (
                    <span className="block truncate text-xs font-normal text-adm-text-3">
                      {lead.industry}
                    </span>
                  ) : null}
                </Td>
                <Td>
                  <span className="block truncate">{lead.contactPerson}</span>
                  <span className="block truncate text-xs text-adm-text-3">
                    {lead.email ?? lead.phone ?? "—"}
                  </span>
                </Td>
                <Td>{lead.assignedExecName ?? "Unassigned"}</Td>
                <Td className="tabular-nums">{money(lead.estimatedValue, lead.currency)}</Td>
                <Td>{formatDate(lead.nextFollowUpDate)}</Td>
                <Td>
                  <StatusPill status={lead.status} />
                </Td>
              </tr>
            ))}
          </DataTable>
        )}
      </Panel>
    </div>
  );
}
