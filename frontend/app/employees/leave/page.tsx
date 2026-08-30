"use client";

import { useState } from "react";
import { CalendarDays, Plus } from "lucide-react";

import {
  DataTable,
  EmptyBlock,
  ErrorBlock,
  Field,
  LoadingBlock,
  Panel,
  PortalButton,
  PortalDialog,
  PortalPageHeader,
  StatCard,
  StatusPill,
  Td,
  inputClass,
} from "@/components/portal/PortalUI";
import { useMyLeave, useSubmitLeave } from "@/hooks/useLeave";
import type { CreateLeaveRequestPayload } from "@/types";

const LEAVE_TYPES = [
  { value: "vacation", label: "Vacation / annual leave" },
  { value: "sick", label: "Sick leave" },
  { value: "unpaid", label: "Unpaid leave" },
  { value: "bereavement", label: "Bereavement" },
] as const;

const EMPTY_FORM: CreateLeaveRequestPayload = {
  startDate: "",
  endDate: "",
  leaveType: "vacation",
  reason: "",
};

function formatDate(value: string | null | undefined) {
  if (!value) return "—";
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime())
    ? value
    : parsed.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

/** Inclusive day count, so a single-day request reads as 1 day. */
function dayCount(start: string, end: string) {
  const from = new Date(start).getTime();
  const to = new Date(end).getTime();
  if (Number.isNaN(from) || Number.isNaN(to)) return null;
  return Math.max(1, Math.round((to - from) / 86_400_000) + 1);
}

export default function EmployeeLeavePage() {
  const { data: requests, isLoading, isError, error, refetch } = useMyLeave();
  const submit = useSubmitLeave();
  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState<CreateLeaveRequestPayload>(EMPTY_FORM);

  const list = requests ?? [];
  const counts = {
    pending: list.filter((r) => r.status === "pending").length,
    approved: list.filter((r) => r.status === "approved").length,
    daysTaken: list
      .filter((r) => r.status === "approved")
      .reduce((sum, r) => sum + (dayCount(r.startDate, r.endDate) ?? 0), 0),
  };

  const datesInvalid =
    Boolean(form.startDate && form.endDate) && new Date(form.endDate) < new Date(form.startDate);

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (datesInvalid) return;
    submit.mutate(form, {
      onSuccess: () => {
        setForm(EMPTY_FORM);
        setIsOpen(false);
      },
    });
  }

  return (
    <div className="flex flex-col gap-8">
      <PortalPageHeader title="Leave" description="Request time off and track every decision.">
        <PortalButton icon={Plus} onClick={() => setIsOpen(true)}>
          Request leave
        </PortalButton>
      </PortalPageHeader>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Pending" value={counts.pending} tone="amber" hint="Awaiting a decision" />
        <StatCard label="Approved" value={counts.approved} tone="green" hint="This year" />
        <StatCard label="Days approved" value={counts.daysTaken} tone="blue" hint="Total calendar days" />
      </div>

      <Panel title="My requests" icon={CalendarDays} padded={false}>
        {isLoading ? (
          <div className="p-5">
            <LoadingBlock label="Loading requests…" />
          </div>
        ) : isError ? (
          <div className="p-5">
            <ErrorBlock
              message={error instanceof Error ? error.message : "Could not load your leave requests."}
              onRetry={() => refetch()}
            />
          </div>
        ) : list.length === 0 ? (
          <div className="p-5">
            <EmptyBlock title="No requests yet" description="Submit a request and it will show up here.">
              <PortalButton variant="ghost" icon={Plus} onClick={() => setIsOpen(true)}>
                Request leave
              </PortalButton>
            </EmptyBlock>
          </div>
        ) : (
          <DataTable head={["Type", "Dates", "Days", "Reason", "Status", "Manager notes"]}>
            {list.map((request) => (
              <tr key={request.id} className="transition hover:bg-adm-surface-2">
                <Td strong className="capitalize">
                  {request.leaveType}
                </Td>
                <Td>
                  {formatDate(request.startDate)} → {formatDate(request.endDate)}
                </Td>
                <Td className="tabular-nums">{dayCount(request.startDate, request.endDate) ?? "—"}</Td>
                <Td className="max-w-xs truncate">{request.reason || "—"}</Td>
                <Td>
                  <StatusPill status={request.status} />
                </Td>
                <Td className="max-w-xs truncate">{request.managerNotes || "—"}</Td>
              </tr>
            ))}
          </DataTable>
        )}
      </Panel>

      <PortalDialog open={isOpen} title="New leave request" onClose={() => setIsOpen(false)}>
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Start date" htmlFor="leave-start">
              <input
                id="leave-start"
                type="date"
                required
                value={form.startDate}
                onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                className={inputClass}
              />
            </Field>
            <Field label="End date" htmlFor="leave-end">
              <input
                id="leave-end"
                type="date"
                required
                min={form.startDate || undefined}
                value={form.endDate}
                onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                className={inputClass}
              />
            </Field>
          </div>

          <Field label="Leave type" htmlFor="leave-type">
            <select
              id="leave-type"
              value={form.leaveType}
              onChange={(e) => setForm({ ...form, leaveType: e.target.value })}
              className={inputClass}
            >
              {LEAVE_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Reason" htmlFor="leave-reason">
            <textarea
              id="leave-reason"
              required
              rows={3}
              value={form.reason}
              onChange={(e) => setForm({ ...form, reason: e.target.value })}
              placeholder="Briefly explain your request…"
              className={`${inputClass} resize-none`}
            />
          </Field>

          {datesInvalid && <p className="text-xs text-adm-red">The end date cannot precede the start date.</p>}
          {submit.isError && (
            <p className="text-xs text-adm-red">
              {(submit.error as Error).message || "Could not submit the request."}
            </p>
          )}

          <div className="mt-2 flex justify-end gap-3 border-t border-adm-border pt-5">
            <PortalButton variant="ghost" onClick={() => setIsOpen(false)}>
              Cancel
            </PortalButton>
            <PortalButton type="submit" disabled={submit.isPending || datesInvalid}>
              {submit.isPending ? "Submitting…" : "Submit request"}
            </PortalButton>
          </div>
        </form>
      </PortalDialog>
    </div>
  );
}
