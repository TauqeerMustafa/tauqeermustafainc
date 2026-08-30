"use client";

import { useState } from "react";
import { Check, X } from "lucide-react";

import {
  EmptyBlock,
  ErrorBlock,
  Field,
  Label,
  LoadingBlock,
  PortalButton,
  PortalDialog,
  PortalPageHeader,
  StatusPill,
  inputClass,
} from "@/components/portal/PortalUI";
import { useDecideLeave, useLeaveQueue } from "@/hooks/useLeave";
import type { LeaveRequest } from "@/types";

const FILTERS = [
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
  { value: "", label: "All" },
] as const;

function formatDate(value: string | null | undefined) {
  if (!value) return "—";
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime())
    ? value
    : parsed.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

type Decision = { request: LeaveRequest; status: "approved" | "rejected" };

export default function AdminLeavePage() {
  const [filter, setFilter] = useState<string>("pending");
  const { data, isLoading, isError, error, refetch } = useLeaveQueue(filter);
  const decide = useDecideLeave();
  const [pending, setPending] = useState<Decision | null>(null);
  const [notes, setNotes] = useState("");

  const requests = data ?? [];

  function confirm() {
    if (!pending) return;
    decide.mutate(
      {
        id: pending.request.id,
        payload: { status: pending.status, managerNotes: notes.trim() || undefined },
      },
      {
        onSuccess: () => {
          setPending(null);
          setNotes("");
        },
      },
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <PortalPageHeader
        title="Leave Approvals"
        description="Review time-off requests and record the reasoning behind each decision."
      />

      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Filter by status">
        {FILTERS.map((option) => {
          const active = filter === option.value;
          return (
            <button
              key={option.label}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setFilter(option.value)}
              className={`border px-4 py-2 text-[11px] font-bold uppercase tracking-[0.14em] transition ${
                active
                  ? "border-adm-blue bg-adm-blue-light text-adm-blue"
                  : "border-adm-border text-adm-text-3 hover:bg-adm-surface-2 hover:text-adm-text"
              }`}
            >
              {option.label}
            </button>
          );
        })}
      </div>

      {isLoading ? (
        <LoadingBlock label="Loading requests…" />
      ) : isError ? (
        <ErrorBlock
          message={error instanceof Error ? error.message : "Could not load the approval queue."}
          onRetry={() => refetch()}
        />
      ) : requests.length === 0 ? (
        <EmptyBlock
          title={filter === "pending" ? "Inbox zero" : "Nothing to show"}
          description={
            filter === "pending"
              ? "There are no leave requests waiting on a decision."
              : "No requests match this filter."
          }
        />
      ) : (
        <ul className="flex flex-col gap-4">
          {requests.map((request) => (
            <li
              key={request.id}
              className="flex flex-col gap-5 border border-adm-border bg-adm-surface p-5 md:flex-row md:items-center md:justify-between"
            >
              <div className="flex min-w-0 items-start gap-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center bg-adm-blue-light text-base font-bold text-adm-blue">
                  {(request.employeeName ?? "E").charAt(0).toUpperCase()}
                </span>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-3">
                    <h3 className="text-sm font-bold uppercase tracking-[0.06em] text-adm-text">
                      {request.employeeName ?? "Unknown employee"}
                    </h3>
                    <Label>{request.leaveType}</Label>
                    <StatusPill status={request.status} />
                  </div>
                  <p className="mt-1.5 text-sm font-semibold text-adm-text-2">
                    {formatDate(request.startDate)} → {formatDate(request.endDate)}
                  </p>
                  {request.reason && (
                    <p className="mt-1 text-sm text-adm-text-3">{request.reason}</p>
                  )}
                  {request.managerNotes && (
                    <p className="mt-2 border-l-2 border-adm-border pl-3 text-xs text-adm-text-3">
                      Manager note: {request.managerNotes}
                    </p>
                  )}
                </div>
              </div>

              {request.status === "pending" && (
                <div className="flex shrink-0 items-center gap-2">
                  <PortalButton
                    variant="ghost"
                    icon={X}
                    onClick={() => {
                      setPending({ request, status: "rejected" });
                      setNotes("");
                    }}
                  >
                    Reject
                  </PortalButton>
                  <PortalButton
                    icon={Check}
                    onClick={() => {
                      setPending({ request, status: "approved" });
                      setNotes("");
                    }}
                  >
                    Approve
                  </PortalButton>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}

      <PortalDialog
        open={pending !== null}
        title={pending?.status === "rejected" ? "Reject request" : "Approve request"}
        onClose={() => setPending(null)}
      >
        {pending && (
          <div className="flex flex-col gap-5">
            <p className="text-sm text-adm-text-2">
              {pending.status === "rejected" ? "Rejecting" : "Approving"}{" "}
              <span className="font-semibold text-adm-text">
                {pending.request.employeeName ?? "this employee"}
              </span>
              &apos;s {pending.request.leaveType} leave from {formatDate(pending.request.startDate)} to{" "}
              {formatDate(pending.request.endDate)}.
            </p>

            <Field label="Manager notes" htmlFor="decision-notes" hint="Optional, visible to the employee.">
              <textarea
                id="decision-notes"
                rows={3}
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                className={`${inputClass} resize-none`}
                placeholder="Add context for this decision…"
              />
            </Field>

            {decide.isError && (
              <p className="text-xs text-adm-red">
                {(decide.error as Error).message || "Could not record the decision."}
              </p>
            )}

            <div className="flex justify-end gap-3 border-t border-adm-border pt-5">
              <PortalButton variant="ghost" onClick={() => setPending(null)}>
                Cancel
              </PortalButton>
              <PortalButton
                variant={pending.status === "rejected" ? "danger" : "primary"}
                disabled={decide.isPending}
                onClick={confirm}
              >
                {decide.isPending
                  ? "Saving…"
                  : pending.status === "rejected"
                    ? "Reject request"
                    : "Approve request"}
              </PortalButton>
            </div>
          </div>
        )}
      </PortalDialog>
    </div>
  );
}
