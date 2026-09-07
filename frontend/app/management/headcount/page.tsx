"use client";

import { useMemo, useState } from "react";
import { Building2, Search, ShieldCheck, Users } from "lucide-react";

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
import { useManagementDashboard } from "@/hooks/useDashboard";
import { useEmployees } from "@/hooks/useEmployees";
import { roleLabel } from "@/lib/rbac";
import type { CountByKey } from "@/types";

function formatDate(value: string | null | undefined) {
  if (!value) return "—";
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime())
    ? value
    : parsed.toLocaleDateString(undefined, { month: "short", year: "numeric" });
}

/** Horizontal bar list. Widths are inline because the percentage is data. */
function Breakdown({ rows }: { rows: CountByKey[] }) {
  const max = Math.max(1, ...rows.map((row) => row.count));
  return (
    <ul className="flex flex-col gap-3.5">
      {rows.map((row) => (
        <li key={row.key} className="flex flex-col gap-1.5">
          <div className="flex items-baseline justify-between gap-4 text-sm">
            <span className="truncate text-adm-text-2">{row.label}</span>
            <span className="font-bold tabular-nums text-adm-text">{row.count}</span>
          </div>
          <div className="h-1.5 w-full bg-adm-surface-2">
            <div className="h-full bg-adm-blue" style={{ width: `${(row.count / max) * 100}%` }} />
          </div>
        </li>
      ))}
    </ul>
  );
}

export default function ManagementHeadcountPage() {
  const summary = useManagementDashboard();
  const employees = useEmployees();
  const [query, setQuery] = useState("");

  const roster = employees.data ?? [];
  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return roster;
    return roster.filter((person) =>
      [person.name, person.email, person.jobTitle, person.employeeIdString]
        .filter(Boolean)
        .some((field) => String(field).toLowerCase().includes(needle)),
    );
  }, [roster, query]);

  const overview = summary.data?.overview;
  const byRole = summary.data?.headcountByRole ?? [];
  const byDepartment = summary.data?.headcountByDepartment ?? [];

  return (
    <div className="flex flex-col gap-8">
      <PortalPageHeader
        title="Headcount"
        description="Who is on the books, split by role and department."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Active employees" value={overview?.headcount ?? "—"} icon={Users} />
        <StatCard
          label="Roles in use"
          value={byRole.length || "—"}
          icon={ShieldCheck}
          tone="neutral"
        />
        <StatCard
          label="Departments"
          value={byDepartment.length || "—"}
          icon={Building2}
          tone="neutral"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Panel title="By role" icon={ShieldCheck}>
          {summary.isLoading ? (
            <LoadingBlock label="Loading split…" />
          ) : byRole.length === 0 ? (
            <EmptyBlock title="No data" description="No active employees to split." />
          ) : (
            <Breakdown rows={byRole} />
          )}
        </Panel>

        <Panel title="By department" icon={Building2}>
          {summary.isLoading ? (
            <LoadingBlock label="Loading split…" />
          ) : byDepartment.length === 0 ? (
            <EmptyBlock title="No data" description="No active employees to split." />
          ) : (
            <Breakdown rows={byDepartment} />
          )}
        </Panel>
      </div>

      <Panel
        title={`Roster (${filtered.length})`}
        icon={Users}
        padded={false}
        action={
          <div className="relative">
            <Search
              size={14}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-adm-text-3"
            />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search people…"
              aria-label="Search people"
              className={`${inputClass} w-52 pl-9`}
            />
          </div>
        }
      >
        {employees.isLoading ? (
          <div className="p-5">
            <LoadingBlock label="Loading roster…" />
          </div>
        ) : employees.isError ? (
          <div className="p-5">
            <ErrorBlock
              message={
                employees.error instanceof Error
                  ? employees.error.message
                  : "Could not load the roster."
              }
              onRetry={() => employees.refetch()}
            />
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-5">
            <EmptyBlock
              title={query ? "No matches" : "No employees"}
              description={
                query ? "Try a different search term." : "No employee records exist yet."
              }
            />
          </div>
        ) : (
          <DataTable head={["Name", "Role", "Job title", "Joined", "Status"]}>
            {filtered.map((person) => (
              <tr key={person.id} className="transition hover:bg-adm-surface-2">
                <Td strong>
                  <span className="block truncate">{person.name ?? "Unnamed"}</span>
                  <span className="block truncate text-xs font-normal text-adm-text-3">
                    {person.email ?? "—"}
                  </span>
                </Td>
                <Td>{roleLabel(person.role)}</Td>
                <Td>{person.jobTitle || "—"}</Td>
                <Td>{formatDate(person.joiningDate)}</Td>
                <Td>
                  <StatusPill status={person.status} />
                </Td>
              </tr>
            ))}
          </DataTable>
        )}
      </Panel>
    </div>
  );
}