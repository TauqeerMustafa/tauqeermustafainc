"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Briefcase,
  CalendarClock,
  Edit2,
  Mail,
  MapPin,
  Phone,
  Plane,
  ShieldCheck,
} from "lucide-react";

import {
  DataTable,
  EmptyBlock,
  ErrorBlock,
  Field,
  Label,
  LoadingBlock,
  Panel,
  PortalButton,
  PortalDialog,
  PortalPageHeader,
  StatusPill,
  Td,
  inputClass,
} from "@/components/portal/PortalUI";
import { useEmployeeAttendance } from "@/hooks/useAttendance";
import { useEmployee, useUpdateEmployee } from "@/hooks/useEmployees";
import { useEmployeeLeave } from "@/hooks/useLeave";
import { roleLabel } from "@/lib/rbac";
import type { EmployeeRecord, UpdateEmployeePayload } from "@/types";

const TABS = ["overview", "attendance", "leave"] as const;
type Tab = (typeof TABS)[number];

function formatDate(value: string | null | undefined) {
  if (!value) return "—";
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime())
    ? value
    : parsed.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

function formatTime(value: string | null | undefined) {
  if (!value) return "--:--";
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime())
    ? value
    : parsed.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
}

function initials(name: string | null | undefined) {
  if (!name) return "E";
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function draftFrom(employee: EmployeeRecord): UpdateEmployeePayload {
  return {
    jobTitle: employee.jobTitle ?? "",
    joiningDate: employee.joiningDate ?? "",
    status: employee.status,
    address: employee.address ?? "",
    emergencyContact: employee.emergencyContact ?? "",
  };
}

export default function EmployeeProfilePage() {
  const params = useParams<{ id: string }>();
  const id = typeof params.id === "string" ? params.id : params.id?.[0];

  const { data: employee, isLoading, isError, error, refetch } = useEmployee(id);
  const update = useUpdateEmployee();
  const [tab, setTab] = useState<Tab>("overview");
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<UpdateEmployeePayload>({});

  if (isLoading) return <LoadingBlock label="Loading employee…" />;

  if (isError || !employee) {
    return (
      <ErrorBlock
        message={error instanceof Error ? error.message : "That employee could not be loaded."}
        onRetry={() => refetch()}
      />
    );
  }

  function openEditor() {
    setDraft(draftFrom(employee as EmployeeRecord));
    setEditing(true);
  }

  function saveEditor(event: React.FormEvent) {
    event.preventDefault();
    if (!id) return;
    // Empty optional strings become null so Pydantic's date field accepts them.
    update.mutate(
      {
        id,
        payload: {
          ...draft,
          jobTitle: draft.jobTitle || null,
          joiningDate: draft.joiningDate || null,
          address: draft.address || null,
          emergencyContact: draft.emergencyContact || null,
        },
      },
      { onSuccess: () => setEditing(false) },
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-start gap-4">
        <Link
          href="/admin/employees"
          aria-label="Back to employees"
          className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center border border-adm-border text-adm-text-2 transition hover:bg-adm-surface-2 hover:text-adm-text"
        >
          <ArrowLeft size={16} />
        </Link>
        <PortalPageHeader
          title={employee.name ?? "Employee"}
          description={employee.jobTitle || "No job title on record."}
        >
          <PortalButton variant="ghost" icon={Edit2} onClick={openEditor}>
            Edit record
          </PortalButton>
        </PortalPageHeader>
      </div>

      <section className="border border-adm-border bg-adm-surface p-6">
        <div className="flex flex-col gap-6 md:flex-row md:items-center">
          <span className="flex h-20 w-20 shrink-0 items-center justify-center bg-adm-blue-light text-2xl font-bold text-adm-blue">
            {initials(employee.name)}
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-xl font-bold uppercase tracking-[0.04em] text-adm-text">
                {employee.name ?? "Unnamed"}
              </h2>
              <StatusPill status={employee.status} />
              <Label>{roleLabel(employee.role)}</Label>
            </div>
            <dl className="mt-4 grid grid-cols-1 gap-x-8 gap-y-3 border-t border-adm-border pt-4 text-sm sm:grid-cols-2">
              {[
                { icon: Mail, label: "Email", value: employee.email },
                { icon: Phone, label: "Phone", value: employee.phone || employee.emergencyContact },
                { icon: Briefcase, label: "Employee ID", value: employee.employeeIdString },
                { icon: MapPin, label: "Address", value: employee.address },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex items-center gap-2 text-adm-text-2">
                  <Icon size={15} className="shrink-0 text-adm-text-3" />
                  <dt className="sr-only">{label}</dt>
                  <dd className="truncate">{value || "—"}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      <div className="flex gap-2 border-b border-adm-border" role="tablist" aria-label="Employee sections">
        {TABS.map((name) => {
          const active = tab === name;
          return (
            <button
              key={name}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setTab(name)}
              className={`-mb-px border-b-2 px-4 py-2.5 text-[11px] font-bold uppercase tracking-[0.14em] transition ${
                active
                  ? "border-adm-blue text-adm-blue"
                  : "border-transparent text-adm-text-3 hover:text-adm-text"
              }`}
            >
              {name}
            </button>
          );
        })}
      </div>

      {tab === "overview" && <OverviewTab employee={employee} />}
      {tab === "attendance" && <AttendanceTab employeeId={id} />}
      {tab === "leave" && <LeaveTab employeeId={id} />}

      <PortalDialog open={editing} title="Edit employment record" onClose={() => setEditing(false)}>
        <form onSubmit={saveEditor} className="flex flex-col gap-5">
          <p className="text-xs text-adm-text-3">
            Name, email and role live on the linked user account and are edited under{" "}
            <Link href="/admin/users" className="text-adm-blue underline">
              Users
            </Link>
            .
          </p>

          <Field label="Job title" htmlFor="edit-job-title">
            <input
              id="edit-job-title"
              value={draft.jobTitle ?? ""}
              onChange={(event) => setDraft({ ...draft, jobTitle: event.target.value })}
              className={inputClass}
            />
          </Field>

          <Field label="Joining date" htmlFor="edit-joining-date">
            <input
              id="edit-joining-date"
              type="date"
              value={(draft.joiningDate ?? "").slice(0, 10)}
              onChange={(event) => setDraft({ ...draft, joiningDate: event.target.value })}
              className={inputClass}
            />
          </Field>

          <Field label="Status" htmlFor="edit-status">
            <select
              id="edit-status"
              value={draft.status ?? "active"}
              onChange={(event) => setDraft({ ...draft, status: event.target.value })}
              className={inputClass}
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="on_leave">On leave</option>
            </select>
          </Field>

          <Field label="Address" htmlFor="edit-address">
            <input
              id="edit-address"
              value={draft.address ?? ""}
              onChange={(event) => setDraft({ ...draft, address: event.target.value })}
              className={inputClass}
            />
          </Field>

          <Field label="Emergency contact" htmlFor="edit-emergency">
            <input
              id="edit-emergency"
              value={draft.emergencyContact ?? ""}
              onChange={(event) => setDraft({ ...draft, emergencyContact: event.target.value })}
              className={inputClass}
            />
          </Field>

          {update.isError && (
            <p className="text-xs text-adm-red">
              {(update.error as Error).message || "Could not save the record."}
            </p>
          )}

          <div className="flex justify-end gap-3 border-t border-adm-border pt-5">
            <PortalButton variant="ghost" onClick={() => setEditing(false)}>
              Cancel
            </PortalButton>
            <PortalButton type="submit" disabled={update.isPending}>
              {update.isPending ? "Saving…" : "Save changes"}
            </PortalButton>
          </div>
        </form>
      </PortalDialog>
    </div>
  );
}

function OverviewTab({ employee }: { employee: EmployeeRecord }) {
  const rows = [
    { label: "Employee ID", value: employee.employeeIdString || "—" },
    { label: "Job title", value: employee.jobTitle || "—" },
    { label: "Joining date", value: formatDate(employee.joiningDate) },
    { label: "Status", value: employee.status },
    { label: "Role", value: roleLabel(employee.role) },
    { label: "Emergency contact", value: employee.emergencyContact || "—" },
  ];

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <Panel title="Employment" icon={Briefcase}>
        <dl className="flex flex-col gap-3 text-sm">
          {rows.map((row) => (
            <div key={row.label} className="flex items-center justify-between gap-4">
              <dt className="text-adm-text-3">{row.label}</dt>
              <dd className="truncate font-semibold text-adm-text">{row.value}</dd>
            </div>
          ))}
        </dl>
      </Panel>

      <Panel title="Account" icon={ShieldCheck}>
        <dl className="flex flex-col gap-3 text-sm">
          <div className="flex items-center justify-between gap-4">
            <dt className="text-adm-text-3">Login email</dt>
            <dd className="truncate font-semibold text-adm-text">{employee.email || "—"}</dd>
          </div>
          <div className="flex items-center justify-between gap-4">
            <dt className="text-adm-text-3">Portal role</dt>
            <dd className="font-semibold text-adm-text">{roleLabel(employee.role)}</dd>
          </div>
          <div className="flex items-center justify-between gap-4">
            <dt className="text-adm-text-3">User ID</dt>
            <dd className="truncate font-mono text-xs text-adm-text-2">{employee.userId}</dd>
          </div>
        </dl>
        <p className="mt-4 border-t border-adm-border pt-4 text-xs text-adm-text-3">
          Role assignment and account status are managed under Users, which owns the login record.
        </p>
      </Panel>
    </div>
  );
}

function AttendanceTab({ employeeId }: { employeeId: string | undefined }) {
  const { data, isLoading, isError, error, refetch } = useEmployeeAttendance(employeeId);
  const records = data ?? [];

  return (
    <Panel title="Attendance history" icon={CalendarClock} padded={false}>
      {isLoading ? (
        <div className="p-5">
          <LoadingBlock label="Loading attendance…" />
        </div>
      ) : isError ? (
        <div className="p-5">
          <ErrorBlock
            message={error instanceof Error ? error.message : "Could not load attendance."}
            onRetry={() => refetch()}
          />
        </div>
      ) : records.length === 0 ? (
        <div className="p-5">
          <EmptyBlock title="No attendance yet" description="This employee has not checked in." />
        </div>
      ) : (
        <DataTable head={["Date", "Status", "Check in", "Check out", "Notes"]}>
          {records.map((record) => (
            <tr key={record.id} className="transition hover:bg-adm-surface-2">
              <Td strong>{formatDate(record.date)}</Td>
              <Td>
                <StatusPill status={record.status} />
              </Td>
              <Td className="tabular-nums">{formatTime(record.checkInTime)}</Td>
              <Td className="tabular-nums">{formatTime(record.checkOutTime)}</Td>
              <Td className="max-w-xs truncate">{record.notes || "—"}</Td>
            </tr>
          ))}
        </DataTable>
      )}
    </Panel>
  );
}

function LeaveTab({ employeeId }: { employeeId: string | undefined }) {
  const { data, isLoading, isError, error, refetch } = useEmployeeLeave(employeeId);
  const requests = data ?? [];

  return (
    <Panel title="Leave history" icon={Plane} padded={false}>
      {isLoading ? (
        <div className="p-5">
          <LoadingBlock label="Loading leave history…" />
        </div>
      ) : isError ? (
        <div className="p-5">
          <ErrorBlock
            message={error instanceof Error ? error.message : "Could not load leave history."}
            onRetry={() => refetch()}
          />
        </div>
      ) : requests.length === 0 ? (
        <div className="p-5">
          <EmptyBlock title="No leave requests" description="Nothing has been submitted yet." />
        </div>
      ) : (
        <DataTable head={["Type", "From", "To", "Status", "Reason"]}>
          {requests.map((request) => (
            <tr key={request.id} className="transition hover:bg-adm-surface-2">
              <Td strong className="capitalize">
                {request.leaveType}
              </Td>
              <Td>{formatDate(request.startDate)}</Td>
              <Td>{formatDate(request.endDate)}</Td>
              <Td>
                <StatusPill status={request.status} />
              </Td>
              <Td className="max-w-xs truncate">{request.reason || "—"}</Td>
            </tr>
          ))}
        </DataTable>
      )}
    </Panel>
  );
}
