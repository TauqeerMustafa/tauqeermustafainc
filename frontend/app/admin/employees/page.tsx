"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Eye, Plus, Search, UserCheck, UserX, Users } from "lucide-react";

import {
  DataTable,
  EmptyBlock,
  ErrorBlock,
  LoadingBlock,
  Panel,
  PortalButton,
  PortalPageHeader,
  StatCard,
  StatusPill,
  Td,
} from "@/components/portal/PortalUI";
import { useEmployees, useSetEmployeeStatus } from "@/hooks/useEmployees";
import { roleLabel } from "@/lib/rbac";

function initials(name: string | null | undefined) {
  if (!name) return "E";
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export default function AdminEmployeesPage() {
  const { data, isLoading, isError, error, refetch } = useEmployees();
  const setStatus = useSetEmployeeStatus();
  const [search, setSearch] = useState("");

  const employees = data ?? [];
  const filtered = useMemo(() => {
    const needle = search.trim().toLowerCase();
    if (!needle) return employees;
    return employees.filter((employee) =>
      [employee.name, employee.email, employee.employeeIdString, employee.jobTitle]
        .filter(Boolean)
        .some((field) => (field as string).toLowerCase().includes(needle)),
    );
  }, [employees, search]);

  const active = employees.filter((employee) => employee.status === "active").length;

  return (
    <div className="flex flex-col gap-8">
      <PortalPageHeader title="Employees" description="Every person on the roster, their role, and their account status.">
        <PortalButton href="/admin/employees/create" icon={Plus}>
          Add employee
        </PortalButton>
      </PortalPageHeader>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Total" value={employees.length} icon={Users} tone="blue" />
        <StatCard label="Active" value={active} icon={UserCheck} tone="green" />
        <StatCard label="Inactive" value={employees.length - active} icon={UserX} tone="red" />
      </div>

      <Panel
        title="Roster"
        icon={Users}
        padded={false}
        action={
          <div className="relative">
            <Search size={14} className="pointer-events-none absolute left-3 top-2.5 text-adm-text-3" />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search name, email, ID"
              aria-label="Search employees"
              className="w-44 rounded-none border border-adm-border bg-adm-surface py-1.5 pl-8 pr-3 text-xs text-adm-text outline-none transition placeholder:text-adm-text-3 focus:border-adm-blue sm:w-64"
            />
          </div>
        }
      >
        {isLoading ? (
          <div className="p-5">
            <LoadingBlock label="Loading employees…" />
          </div>
        ) : isError ? (
          <div className="p-5">
            <ErrorBlock
              message={error instanceof Error ? error.message : "Could not load the employee roster."}
              onRetry={() => refetch()}
            />
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-5">
            <EmptyBlock
              title={employees.length === 0 ? "No employees" : "No matches"}
              description={
                employees.length === 0
                  ? "Create the first employee to populate the roster."
                  : "Nobody matches that search."
              }
            >
              {employees.length === 0 && (
                <PortalButton href="/admin/employees/create" variant="ghost" icon={Plus}>
                  Add employee
                </PortalButton>
              )}
            </EmptyBlock>
          </div>
        ) : (
          <DataTable head={["Employee", "ID", "Job title", "Role", "Status", "Actions"]}>
            {filtered.map((employee) => {
              const nextStatus = employee.status === "active" ? "inactive" : "active";
              const busy = setStatus.isPending && setStatus.variables?.id === employee.id;
              return (
                <tr key={employee.id} className="transition hover:bg-adm-surface-2">
                  <Td strong>
                    <span className="flex items-center gap-3">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center bg-adm-blue-light text-xs font-bold text-adm-blue">
                        {initials(employee.name)}
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate">{employee.name ?? "Unnamed"}</span>
                        <span className="block truncate text-xs font-normal text-adm-text-3">
                          {employee.email ?? "—"}
                        </span>
                      </span>
                    </span>
                  </Td>
                  <Td>{employee.employeeIdString || "—"}</Td>
                  <Td>{employee.jobTitle || "—"}</Td>
                  <Td>{employee.role ? roleLabel(employee.role) : "—"}</Td>
                  <Td>
                    <StatusPill status={employee.status} />
                  </Td>
                  <Td>
                    <span className="flex items-center gap-1">
                      <Link
                        href={`/admin/employees/${employee.id}`}
                        title="View profile"
                        aria-label={`View ${employee.name ?? "employee"}`}
                        className="p-2 text-adm-text-2 transition hover:bg-adm-surface-2 hover:text-adm-text"
                      >
                        <Eye size={15} />
                      </Link>
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => setStatus.mutate({ id: employee.id, status: nextStatus })}
                        title={nextStatus === "active" ? "Reactivate" : "Deactivate"}
                        aria-label={`${nextStatus === "active" ? "Reactivate" : "Deactivate"} ${employee.name ?? "employee"}`}
                        className={`p-2 transition disabled:opacity-40 ${
                          nextStatus === "active"
                            ? "text-adm-green hover:bg-adm-green-light"
                            : "text-adm-red hover:bg-adm-red-light"
                        }`}
                      >
                        {nextStatus === "active" ? <UserCheck size={15} /> : <UserX size={15} />}
                      </button>
                    </span>
                  </Td>
                </tr>
              );
            })}
          </DataTable>
        )}
      </Panel>

      {setStatus.isError && (
        <p className="text-xs text-adm-red">
          {(setStatus.error as Error).message || "Could not update that employee's status."}
        </p>
      )}
    </div>
  );
}
