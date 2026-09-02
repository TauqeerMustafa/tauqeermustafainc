"use client";

/**
 * Admin → Client CRM. Everything here reads the real pipeline: `/leads/pipeline`
 * for the totals and `/leads` for the table, both scope-filtered server-side by
 * the caller's `leads.*` permissions. "New Lead" creates a record through
 * `POST /leads` rather than announcing itself as unfinished.
 */

import { useState } from "react";

import {
  AdminDrawer,
  AdminEmptyState,
  AdminErrorState,
  AdminField,
  AdminFormActions,
  AdminLoadingState,
  AdminPageHeader,
  adminInputClass,
  adminInputStyle,
} from "@/components/admin/AdminUI";
import { useCreateLead, useLeadPipeline, useLeads } from "@/hooks/useLeads";
import type { CreateLeadPayload } from "@/services";

const STATUS_TONE: Record<string, { bg: string; fg: string }> = {
  won: { bg: "var(--adm-green-light)", fg: "var(--adm-green)" },
  lost: { bg: "var(--adm-red-light)", fg: "var(--adm-red)" },
  proposal: { bg: "var(--adm-amber-light)", fg: "var(--adm-amber)" },
};

function tone(status: string) {
  return STATUS_TONE[status] ?? { bg: "var(--adm-blue-light)", fg: "var(--adm-blue)" };
}

/** Compact money for the stat row: 12400 -> $12.4k. */
function money(value: number, currency = "USD") {
  return new Intl.NumberFormat("en", {
    style: "currency",
    currency,
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value || 0);
}

const EMPTY_FORM = {
  companyName: "",
  contactPerson: "",
  email: "",
  phone: "",
  estimatedValue: "",
};

export default function AdminClientPage() {
  const pipeline = useLeadPipeline();
  const leads = useLeads({ limit: 25 });
  const createLead = useCreateLead();

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState<string | null>(null);

  const rows = leads.data ?? [];
  const totals = pipeline.data;

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setFormError(null);
    const payload: CreateLeadPayload = {
      companyName: form.companyName.trim(),
      contactPerson: form.contactPerson.trim(),
      email: form.email.trim() || null,
      phone: form.phone.trim() || null,
      estimatedValue: form.estimatedValue ? Number(form.estimatedValue) : null,
    };
    try {
      await createLead.mutateAsync(payload);
      setForm(EMPTY_FORM);
      setOpen(false);
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Could not save this lead.");
    }
  }

  const stats = [
    {
      label: "Open leads",
      value: totals ? String(totals.totalLeads) : "—",
      color: "var(--adm-blue)",
    },
    {
      label: "Follow-ups due",
      value: totals ? String(totals.followUpsDue) : "—",
      color: totals?.followUpsDue ? "var(--adm-amber)" : "var(--adm-text)",
    },
    {
      label: "Open value",
      value: totals ? money(totals.openValue) : "—",
      color: "var(--adm-text)",
    },
    {
      label: "Won value",
      value: totals ? money(totals.wonValue) : "—",
      color: "var(--adm-green)",
    },
  ];

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Client CRM"
        description={
          totals
            ? `Inbound leads and pipeline value (${totals.scope === "all" ? "company-wide" : `${totals.scope} scope`}).`
            : "Manage inbound leads, clients, and active projects."
        }
        actionLabel="New Lead"
        onAction={() => {
          setFormError(null);
          setOpen(true);
        }}
      />

      <div className="mb-6 grid grid-cols-1 gap-5 md:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="border p-5 transition"
            style={{ borderColor: "var(--adm-border)", background: "var(--adm-surface)" }}
          >
            <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--adm-text-3)" }}>
              {stat.label}
            </p>
            <p className="mt-2 text-2xl font-bold" style={{ color: stat.color }}>
              {pipeline.isLoading ? "…" : stat.value}
            </p>
          </div>
        ))}
      </div>

      <div className="border" style={{ borderColor: "var(--adm-border)", background: "var(--adm-surface)" }}>
        <div className="border-b px-5 py-4" style={{ borderColor: "var(--adm-border)" }}>
          <h3 className="font-semibold" style={{ color: "var(--adm-text)" }}>Recent leads</h3>
        </div>

        {leads.isLoading ? (
          <AdminLoadingState label="Loading leads…" />
        ) : leads.isError ? (
          <AdminErrorState
            message={leads.error instanceof Error ? leads.error.message : "Could not load leads."}
          />
        ) : rows.length === 0 ? (
          <AdminEmptyState
            title="No leads yet"
            description="Leads captured from the website contact form and added here will appear in this table."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="border-b" style={{ borderColor: "var(--adm-border)", background: "var(--adm-surface-2)" }}>
                <tr>
                  <th className="px-5 py-3 font-semibold" style={{ color: "var(--adm-text-2)" }}>Company</th>
                  <th className="px-5 py-3 font-semibold" style={{ color: "var(--adm-text-2)" }}>Contact person</th>
                  <th className="px-5 py-3 font-semibold" style={{ color: "var(--adm-text-2)" }}>Status</th>
                  <th className="px-5 py-3 font-semibold" style={{ color: "var(--adm-text-2)" }}>Owner</th>
                  <th className="px-5 py-3 font-semibold" style={{ color: "var(--adm-text-2)" }}>Value</th>
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: "var(--adm-border)" }}>
                {rows.map((lead) => (
                  <tr key={lead.id} className="transition hover:bg-adm-surface-2">
                    <td className="px-5 py-3 font-medium" style={{ color: "var(--adm-text)" }}>{lead.companyName}</td>
                    <td className="px-5 py-3" style={{ color: "var(--adm-text-2)" }}>
                      {lead.contactPerson}
                      {lead.email ? (
                        <span className="block text-xs" style={{ color: "var(--adm-text-3)" }}>{lead.email}</span>
                      ) : null}
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className="inline-block px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider"
                        style={{ background: tone(lead.status).bg, color: tone(lead.status).fg }}
                      >
                        {String(lead.status).replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="px-5 py-3" style={{ color: "var(--adm-text-2)" }}>
                      {lead.assignedExecName ?? "Unassigned"}
                    </td>
                    <td className="px-5 py-3" style={{ color: "var(--adm-text-2)" }}>
                      {lead.estimatedValue ? money(lead.estimatedValue, lead.currency) : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <AdminDrawer open={open} title="New lead" onClose={() => setOpen(false)}>
        <form onSubmit={submit} className="grid gap-5">
          <AdminField label="Company" htmlFor="lead-company">
            <input
              id="lead-company"
              required
              className={adminInputClass}
              style={adminInputStyle}
              value={form.companyName}
              onChange={(event) => setForm({ ...form, companyName: event.target.value })}
            />
          </AdminField>
          <AdminField label="Contact person" htmlFor="lead-person">
            <input
              id="lead-person"
              required
              className={adminInputClass}
              style={adminInputStyle}
              value={form.contactPerson}
              onChange={(event) => setForm({ ...form, contactPerson: event.target.value })}
            />
          </AdminField>
          <AdminField label="Email" htmlFor="lead-email">
            <input
              id="lead-email"
              type="email"
              className={adminInputClass}
              style={adminInputStyle}
              value={form.email}
              onChange={(event) => setForm({ ...form, email: event.target.value })}
            />
          </AdminField>
          <AdminField label="Phone" htmlFor="lead-phone">
            <input
              id="lead-phone"
              className={adminInputClass}
              style={adminInputStyle}
              value={form.phone}
              onChange={(event) => setForm({ ...form, phone: event.target.value })}
            />
          </AdminField>
          <AdminField label="Estimated value (USD)" htmlFor="lead-value">
            <input
              id="lead-value"
              type="number"
              min={0}
              step="100"
              className={adminInputClass}
              style={adminInputStyle}
              value={form.estimatedValue}
              onChange={(event) => setForm({ ...form, estimatedValue: event.target.value })}
            />
          </AdminField>
          {formError ? (
            <p className="text-sm" role="alert" style={{ color: "var(--adm-red)" }}>{formError}</p>
          ) : null}
          <AdminFormActions
            onCancel={() => setOpen(false)}
            isPending={createLead.isPending}
            submitLabel="Create lead"
          />
        </form>
      </AdminDrawer>
    </div>
  );
}
