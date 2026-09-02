"use client";

/**
 * Lead workbench — the one surface where a lead is actually worked, shared by
 * the admin console, the management portal and an employee's own book.
 *
 * Before this existed the CRM was read-only in every portal but for a five-field
 * "new lead" form: no source, no follow-up date, no way to log a call or move a
 * status. A pipeline you cannot advance is a list, not a pipeline.
 *
 * Everything is permission-derived rather than prop-driven, because the API is:
 * `/leads` is scope-filtered server-side by the caller's `leads.*` grants, so
 * the same component renders one intern's four leads or the whole company's
 * book without either call site knowing which.
 */

import { useMemo, useState } from "react";
import {
  CalendarClock,
  CircleDollarSign,
  Mail,
  MessageSquare,
  Phone,
  Plus,
  Search,
  StickyNote,
  Trash2,
  TrendingUp,
  Users2,
} from "lucide-react";

import {
  AdminConfirmDialog,
  AdminDrawer,
  AdminEmptyState,
  AdminErrorState,
  AdminField,
  AdminFormActions,
  AdminLoadingState,
  adminInputClass,
  adminInputStyle,
} from "@/components/admin/AdminUI";
import { useAdminUsers } from "@/hooks/useAdmin";
import { useCurrentUser } from "@/hooks/useAuth";
import {
  useCreateLead,
  useDeleteLead,
  useLead,
  useLeadPipeline,
  useLeads,
  useLogLeadActivity,
  useUpdateLead,
} from "@/hooks/useLeads";
import { useI18n } from "@/lib/i18n";
import { PERMISSION, can, isAdminRole, scopeFor } from "@/lib/rbac";
import type { CreateLeadPayload, UpdateLeadPayload } from "@/services";
import type { Lead, LeadActivity, LeadDetail } from "@/types";

export const LEAD_SOURCES = ["cold_call", "linkedin", "referral", "email", "other"] as const;
export const LEAD_STATUSES = [
  "new",
  "contacted",
  "follow_up",
  "qualified",
  "proposal_sent",
  "won",
  "lost",
] as const;
const ACTIVITY_TYPES = ["note", "call", "email", "meeting"] as const;

/** Human labels, kept out of the JSX so `t()` sees a plain literal to look up. */
const SOURCE_LABEL: Record<string, string> = {
  cold_call: "Cold call",
  linkedin: "LinkedIn",
  referral: "Referral",
  email: "Email",
  other: "Other",
};

const STATUS_LABEL: Record<string, string> = {
  new: "New",
  contacted: "Contacted",
  follow_up: "Follow up",
  qualified: "Qualified",
  proposal_sent: "Proposal sent",
  won: "Won",
  lost: "Lost",
};

const ACTIVITY_ICON = {
  call: Phone,
  email: Mail,
  meeting: Users2,
  status_change: TrendingUp,
  note: StickyNote,
} as const;

function statusTone(status: string) {
  if (status === "won") return { bg: "var(--adm-green-light)", fg: "var(--adm-green)" };
  if (status === "lost") return { bg: "var(--adm-red-light)", fg: "var(--adm-red)" };
  if (status === "proposal_sent" || status === "qualified")
    return { bg: "var(--adm-amber-light)", fg: "var(--adm-amber)" };
  return { bg: "var(--adm-blue-light)", fg: "var(--adm-blue)" };
}

function money(value: number | null | undefined, currency = "USD") {
  const amount = value ?? 0;
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
      notation: "compact",
      maximumFractionDigits: 1,
    }).format(amount);
  } catch {
    // Unknown ISO code — a plain number beats throwing inside a table cell.
    return amount.toLocaleString();
  }
}

function formatDate(value: string | null | undefined) {
  if (!value) return "—";
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime())
    ? value
    : parsed.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

/** `<input type="date">` needs bare YYYY-MM-DD; the API may send a full stamp. */
function dateInputValue(value: string | null | undefined) {
  return value ? value.slice(0, 10) : "";
}

/** Overdue follow-ups are the whole point of the column, so they get a colour. */
function isOverdue(value: string | null | undefined) {
  if (!value) return false;
  return dateInputValue(value) < new Date().toISOString().slice(0, 10);
}

type FormState = {
  companyName: string;
  contactPerson: string;
  contactTitle: string;
  email: string;
  phone: string;
  source: string;
  industry: string;
  status: string;
  estimatedValue: string;
  currency: string;
  nextFollowUpDate: string;
  assignedExecId: string;
};

const EMPTY_FORM: FormState = {
  companyName: "",
  contactPerson: "",
  contactTitle: "",
  email: "",
  phone: "",
  source: "linkedin",
  industry: "",
  status: "new",
  estimatedValue: "",
  currency: "USD",
  nextFollowUpDate: "",
  assignedExecId: "",
};

type Props = {
  title?: string;
  description?: string;
  /** Off where the host page already renders its own funnel/stat row. */
  showStats?: boolean;
};

export default function LeadWorkbench({
  title = "Pipeline",
  description,
  showStats = true,
}: Props) {
  const { t } = useI18n();
  const { data: me } = useCurrentUser();
  const user = me?.data ?? null;

  // Mirrors the API: `leads.create` to add, an update scope to edit, and
  // reassignment only above own scope (the router 403s an own-scope PATCH that
  // carries `assigned_exec_id`).
  const canCreate = can(user, PERMISSION.LEADS_CREATE);
  const updateScope = scopeFor(user, "leads.update");
  const canEdit = updateScope !== null;
  const canReassign = updateScope === "team" || updateScope === "all";
  const canDelete = can(user, PERMISSION.LEADS_DELETE_OWN, PERMISSION.LEADS_DELETE_ALL);

  const [status, setStatus] = useState("");
  const [term, setTerm] = useState("");

  const pipeline = useLeadPipeline();
  const leads = useLeads(status ? { status, limit: 200 } : { limit: 200 });
  const rows = leads.data ?? [];

  const [isCreateOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [formError, setFormError] = useState<string | null>(null);

  const [openLeadId, setOpenLeadId] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Lead | null>(null);

  const detail = useLead(openLeadId ?? undefined);
  const createLead = useCreateLead();
  const updateLead = useUpdateLead();
  const deleteLead = useDeleteLead();
  const logActivity = useLogLeadActivity();

  // `/admin/users` is admin-only, so only an admin can be offered an owner
  // picker; a team lead assigns from the admin console instead of tripping a 403.
  const canPickOwner = canReassign && isAdminRole(user?.role);
  const usersQuery = useAdminUsers(
    { pageSize: 100 },
    canPickOwner && (isCreateOpen || Boolean(openLeadId)),
  );
  const assignableUsers = usersQuery.data?.data.items ?? [];

  const filtered = useMemo(() => {
    const needle = term.trim().toLowerCase();
    if (!needle) return rows;
    return rows.filter((lead) =>
      [lead.companyName, lead.contactPerson, lead.email, lead.industry, lead.assignedExecName]
        .filter(Boolean)
        .some((field) => String(field).toLowerCase().includes(needle)),
    );
  }, [rows, term]);

  const totals = pipeline.data;
  const scopeNote = totals
    ? { own: "your own leads", team: "your team's leads", all: "all company leads" }[totals.scope] ??
      "the leads you can access"
    : null;

  function field<K extends keyof FormState>(key: K) {
    return (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((prev) => ({ ...prev, [key]: event.target.value }));
  }

  function closeCreate() {
    setCreateOpen(false);
    setForm(EMPTY_FORM);
    setFormError(null);
  }

  async function submitCreate(event: React.FormEvent) {
    event.preventDefault();
    setFormError(null);

    const payload: CreateLeadPayload = {
      companyName: form.companyName.trim(),
      contactPerson: form.contactPerson.trim(),
      contactTitle: form.contactTitle.trim() || null,
      email: form.email.trim() || null,
      phone: form.phone.trim() || null,
      source: form.source,
      industry: form.industry.trim() || null,
      status: form.status,
      estimatedValue: form.estimatedValue ? Number(form.estimatedValue) : null,
      currency: form.currency || "USD",
      nextFollowUpDate: form.nextFollowUpDate || null,
    };
    // Omitted entirely rather than sent as "": an own-scope creator is forced
    // onto themselves server-side, and an empty string is not a UUID.
    if (canPickOwner && form.assignedExecId) payload.assignedExecId = form.assignedExecId;

    try {
      await createLead.mutateAsync(payload);
      closeCreate();
    } catch (error) {
      setFormError(error instanceof Error ? error.message : t("Could not save this lead."));
    }
  }

  /** Field-level save from the detail drawer — one property at a time. */
  async function patch(id: string, payload: UpdateLeadPayload) {
    try {
      await updateLead.mutateAsync({ id, payload });
    } catch (error) {
      window.alert(error instanceof Error ? error.message : t("Could not save this lead."));
    }
  }

  async function confirmDelete() {
    if (!pendingDelete) return;
    try {
      await deleteLead.mutateAsync(pendingDelete.id);
      if (openLeadId === pendingDelete.id) setOpenLeadId(null);
    } finally {
      setPendingDelete(null);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold uppercase" style={{ color: "var(--adm-text)" }}>
            {t(title)}
          </h1>
          <p className="mt-1 text-sm" style={{ color: "var(--adm-text-3)" }}>
            {description
              ? t(description)
              : scopeNote
                ? `${t("Sales funnel across")} ${t(scopeNote)}.`
                : t("Source, work and close the leads assigned to you.")}
          </p>
        </div>
        {canCreate && (
          <button
            type="button"
            onClick={() => {
              setFormError(null);
              setCreateOpen(true);
            }}
            className="btn-press flex items-center justify-center gap-2 bg-adm-blue px-6 py-2.5 text-sm font-bold text-white transition hover:opacity-90"
          >
            <Plus size={16} />
            {t("New Lead")}
          </button>
        )}
      </div>

      {showStats && (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {[
            { label: "Open leads", value: totals ? String(totals.totalLeads) : "—", color: "var(--adm-blue)", icon: TrendingUp },
            {
              label: "Follow-ups due",
              value: totals ? String(totals.followUpsDue) : "—",
              color: totals?.followUpsDue ? "var(--adm-amber)" : "var(--adm-text)",
              icon: CalendarClock,
            },
            { label: "Open value", value: totals ? money(totals.openValue) : "—", color: "var(--adm-text)", icon: CircleDollarSign },
            { label: "Won value", value: totals ? money(totals.wonValue) : "—", color: "var(--adm-green)", icon: CircleDollarSign },
          ].map((stat) => (
            <div
              key={stat.label}
              className="flex items-start justify-between border p-5"
              style={{ borderColor: "var(--adm-border)", background: "var(--adm-surface)" }}
            >
              <div>
                <p
                  className="text-xs font-semibold uppercase tracking-wider"
                  style={{ color: "var(--adm-text-3)" }}
                >
                  {t(stat.label)}
                </p>
                <p className="mt-2 text-2xl font-bold" style={{ color: stat.color }}>
                  {pipeline.isLoading ? "…" : stat.value}
                </p>
              </div>
              <stat.icon size={18} style={{ color: "var(--adm-text-3)" }} />
            </div>
          ))}
        </div>
      )}

      <div className="border" style={{ borderColor: "var(--adm-border)", background: "var(--adm-surface)" }}>
        <div
          className="flex flex-col gap-3 border-b px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
          style={{ borderColor: "var(--adm-border)", background: "var(--adm-surface-2)" }}
        >
          <h3 className="font-semibold" style={{ color: "var(--adm-text)" }}>
            {t("Leads")} ({filtered.length})
          </h3>
          <div className="flex items-center gap-2">
            <select
              value={status}
              onChange={(event) => setStatus(event.target.value)}
              aria-label={t("Filter leads by status")}
              className={`${adminInputClass} w-40`}
              style={adminInputStyle}
            >
              <option value="">{t("All statuses")}</option>
              {LEAD_STATUSES.map((value) => (
                <option key={value} value={value}>
                  {t(STATUS_LABEL[value])}
                </option>
              ))}
            </select>
            <div className="relative">
              <Search
                size={14}
                className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-adm-text-3"
              />
              <input
                value={term}
                onChange={(event) => setTerm(event.target.value)}
                placeholder={t("Search leads…")}
                aria-label={t("Search leads…")}
                className={`${adminInputClass} w-52 ps-9`}
                style={adminInputStyle}
              />
            </div>
          </div>
        </div>

        {leads.isLoading ? (
          <AdminLoadingState label={t("Loading leads…")} />
        ) : leads.isError ? (
          <AdminErrorState
            message={leads.error instanceof Error ? leads.error.message : t("Could not load leads.")}
          />
        ) : filtered.length === 0 ? (
          <AdminEmptyState
            title={term || status ? t("No matches") : t("No leads yet")}
            description={
              term || status
                ? t("Try a different filter.")
                : t("Add your first lead to start working the pipeline.")
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] text-start text-sm">
              <thead
                className="border-b"
                style={{ borderColor: "var(--adm-border)", background: "var(--adm-surface-2)" }}
              >
                <tr>
                  {["Company", "Contact", "Source", "Owner", "Value", "Follow-up", "Status"].map(
                    (head) => (
                      <th
                        key={head}
                        className="px-5 py-3 text-start font-semibold"
                        style={{ color: "var(--adm-text-2)" }}
                      >
                        {t(head)}
                      </th>
                    ),
                  )}
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: "var(--adm-border)" }}>
                {filtered.map((lead) => (
                  <tr
                    key={lead.id}
                    onClick={() => setOpenLeadId(lead.id)}
                    className="cursor-pointer transition hover:bg-adm-surface-2"
                  >
                    <td className="px-5 py-3 font-medium" style={{ color: "var(--adm-text)" }}>
                      {lead.companyName}
                      {lead.industry ? (
                        <span className="block text-xs font-normal" style={{ color: "var(--adm-text-3)" }}>
                          {lead.industry}
                        </span>
                      ) : null}
                    </td>
                    <td className="px-5 py-3" style={{ color: "var(--adm-text-2)" }}>
                      {lead.contactPerson}
                      <span className="block text-xs" style={{ color: "var(--adm-text-3)" }}>
                        {lead.email ?? lead.phone ?? "—"}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-xs uppercase tracking-wider" style={{ color: "var(--adm-text-3)" }}>
                      {t(SOURCE_LABEL[lead.source] ?? String(lead.source))}
                    </td>
                    <td className="px-5 py-3" style={{ color: "var(--adm-text-2)" }}>
                      {lead.assignedExecName ?? t("Unassigned")}
                    </td>
                    <td className="px-5 py-3 tabular-nums" style={{ color: "var(--adm-text-2)" }}>
                      {lead.estimatedValue ? money(lead.estimatedValue, lead.currency) : "—"}
                    </td>
                    <td
                      className="px-5 py-3 tabular-nums"
                      style={{ color: isOverdue(lead.nextFollowUpDate) ? "var(--adm-red)" : "var(--adm-text-2)" }}
                    >
                      {formatDate(lead.nextFollowUpDate)}
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className="inline-block px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider"
                        style={{
                          background: statusTone(lead.status).bg,
                          color: statusTone(lead.status).fg,
                        }}
                      >
                        {t(STATUS_LABEL[lead.status] ?? String(lead.status))}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-end">
                      {canDelete && (
                        <button
                          type="button"
                          onClick={(event) => {
                            // The row itself opens the drawer.
                            event.stopPropagation();
                            setPendingDelete(lead);
                          }}
                          aria-label={`${t("Delete")} ${lead.companyName}`}
                          title={t("Delete")}
                          className="text-adm-text-3 transition hover:text-adm-red"
                        >
                          <Trash2 size={15} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <AdminDrawer open={isCreateOpen} title={t("New Lead")} onClose={closeCreate}>
        <form onSubmit={submitCreate} className="grid gap-5">
          <AdminField label={t("Company")} htmlFor="lead-company">
            <input
              id="lead-company"
              required
              value={form.companyName}
              onChange={field("companyName")}
              className={adminInputClass}
              style={adminInputStyle}
            />
          </AdminField>

          <div className="grid gap-5 sm:grid-cols-2">
            <AdminField label={t("Contact person")} htmlFor="lead-person">
              <input
                id="lead-person"
                required
                value={form.contactPerson}
                onChange={field("contactPerson")}
                className={adminInputClass}
                style={adminInputStyle}
              />
            </AdminField>
            <AdminField label={t("Job title")} htmlFor="lead-title">
              <input
                id="lead-title"
                value={form.contactTitle}
                onChange={field("contactTitle")}
                placeholder={t("e.g. Operations Director")}
                className={adminInputClass}
                style={adminInputStyle}
              />
            </AdminField>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <AdminField label={t("Email")} htmlFor="lead-email">
              <input
                id="lead-email"
                type="email"
                value={form.email}
                onChange={field("email")}
                className={adminInputClass}
                style={adminInputStyle}
              />
            </AdminField>
            <AdminField label={t("Phone")} htmlFor="lead-phone">
              <input
                id="lead-phone"
                value={form.phone}
                onChange={field("phone")}
                className={adminInputClass}
                style={adminInputStyle}
              />
            </AdminField>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <AdminField label={t("Source")} htmlFor="lead-source">
              <select
                id="lead-source"
                value={form.source}
                onChange={field("source")}
                className={adminInputClass}
                style={adminInputStyle}
              >
                {LEAD_SOURCES.map((value) => (
                  <option key={value} value={value}>
                    {t(SOURCE_LABEL[value])}
                  </option>
                ))}
              </select>
            </AdminField>
            <AdminField label={t("Industry")} htmlFor="lead-industry">
              <input
                id="lead-industry"
                value={form.industry}
                onChange={field("industry")}
                placeholder={t("e.g. Logistics")}
                className={adminInputClass}
                style={adminInputStyle}
              />
            </AdminField>
          </div>

          <div className="grid gap-5 sm:grid-cols-3">
            <AdminField label={t("Status")} htmlFor="lead-status">
              <select
                id="lead-status"
                value={form.status}
                onChange={field("status")}
                className={adminInputClass}
                style={adminInputStyle}
              >
                {LEAD_STATUSES.map((value) => (
                  <option key={value} value={value}>
                    {t(STATUS_LABEL[value])}
                  </option>
                ))}
              </select>
            </AdminField>
            <AdminField label={t("Estimated value")} htmlFor="lead-value">
              <input
                id="lead-value"
                type="number"
                min={0}
                step="100"
                value={form.estimatedValue}
                onChange={field("estimatedValue")}
                className={adminInputClass}
                style={adminInputStyle}
              />
            </AdminField>
            <AdminField label={t("Currency")} htmlFor="lead-currency">
              <select
                id="lead-currency"
                value={form.currency}
                onChange={field("currency")}
                className={adminInputClass}
                style={adminInputStyle}
              >
                {["USD", "EUR", "GBP", "AED", "PKR", "SAR"].map((code) => (
                  <option key={code} value={code}>
                    {code}
                  </option>
                ))}
              </select>
            </AdminField>
          </div>

          <AdminField label={t("Next follow-up")} htmlFor="lead-follow-up">
            <input
              id="lead-follow-up"
              type="date"
              value={form.nextFollowUpDate}
              onChange={field("nextFollowUpDate")}
              className={adminInputClass}
              style={adminInputStyle}
            />
          </AdminField>

          {canPickOwner && (
            <AdminField label={t("Owner")} htmlFor="lead-owner">
              <select
                id="lead-owner"
                value={form.assignedExecId}
                onChange={field("assignedExecId")}
                className={adminInputClass}
                style={adminInputStyle}
              >
                <option value="">{t("Me")}</option>
                {assignableUsers.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.name || option.email}
                  </option>
                ))}
              </select>
            </AdminField>
          )}

          {formError && (
            <p className="text-sm" role="alert" style={{ color: "var(--adm-red)" }}>
              {formError}
            </p>
          )}

          <AdminFormActions
            onCancel={closeCreate}
            isPending={createLead.isPending}
            submitLabel={t("Create lead")}
          />

        </form>
      </AdminDrawer>

      <AdminDrawer
        open={Boolean(openLeadId)}
        title={detail.data?.companyName ?? t("Lead")}
        onClose={() => setOpenLeadId(null)}
      >
        {detail.isLoading ? (
          <AdminLoadingState label={t("Loading lead…")} />
        ) : detail.isError || !detail.data ? (
          <AdminErrorState
            message={
              detail.error instanceof Error ? detail.error.message : t("Could not load this lead.")
            }
          />
        ) : (
          <LeadDetailBody
            lead={detail.data}
            owners={canPickOwner ? assignableUsers : []}
            canEdit={canEdit}
            isSaving={updateLead.isPending}
            isLogging={logActivity.isPending}
            onPatch={(payload) => patch(detail.data!.id, payload)}
            onLog={async (payload) => {
              await logActivity.mutateAsync({ id: detail.data!.id, payload });
            }}
          />
        )}
      </AdminDrawer>

      <AdminConfirmDialog
        open={Boolean(pendingDelete)}
        title={t("Delete lead")}
        description={
          pendingDelete
            ? t("“{title}” and its whole activity history will be removed. This cannot be undone.", {
                title: pendingDelete.companyName,
              })
            : undefined
        }
        confirmLabel={t("Delete")}
        isPending={deleteLead.isPending}
        onConfirm={confirmDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
}

type DetailProps = {
  lead: LeadDetail;
  owners: { id: string; name: string; email: string }[];
  canEdit: boolean;
  isSaving: boolean;
  isLogging: boolean;
  onPatch: (payload: UpdateLeadPayload) => void;
  onLog: (payload: { type: string; body: string }) => Promise<void>;
};

/**
 * The drawer body: what the lead is, plus the four things that actually move it
 * — status, follow-up date, value, owner — and the activity log underneath.
 *
 * Each control saves on its own rather than through one big submit: a rep on a
 * call wants to move the status and set tomorrow's follow-up in two clicks, and
 * a form they have to remember to submit is a form that loses the note.
 */
function LeadDetailBody({
  lead,
  owners,
  canEdit,
  isSaving,
  isLogging,
  onPatch,
  onLog,
}: DetailProps) {
  const { t } = useI18n();
  const [activityType, setActivityType] = useState<string>("call");
  const [body, setBody] = useState("");
  const [value, setValue] = useState(lead.estimatedValue ? String(lead.estimatedValue) : "");

  async function submitActivity(event: React.FormEvent) {
    event.preventDefault();
    const text = body.trim();
    if (!text) return;
    await onLog({ type: activityType, body: text });
    setBody("");
  }

  return (
    <div className="grid gap-6">
      <div className="grid gap-1 border-b pb-5" style={{ borderColor: "var(--adm-border)" }}>
        <p className="text-sm font-semibold" style={{ color: "var(--adm-text)" }}>
          {lead.contactPerson}
          {lead.contactTitle ? (
            <span className="font-normal" style={{ color: "var(--adm-text-3)" }}>
              {" "}
              · {lead.contactTitle}
            </span>
          ) : null}
        </p>
        <div className="flex flex-wrap items-center gap-4 text-sm">
          {lead.email ? (
            <a href={`mailto:${lead.email}`} className="flex items-center gap-1.5 text-adm-blue hover:underline">
              <Mail size={14} />
              {lead.email}
            </a>
          ) : null}
          {lead.phone ? (
            <a href={`tel:${lead.phone}`} className="flex items-center gap-1.5 text-adm-blue hover:underline">
              <Phone size={14} />
              {lead.phone}
            </a>
          ) : null}
        </div>
        <p className="text-xs" style={{ color: "var(--adm-text-3)" }}>
          {t(SOURCE_LABEL[lead.source] ?? String(lead.source))}
          {lead.industry ? ` · ${lead.industry}` : ""} · {t("Added")} {formatDate(lead.createdAt)}
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <AdminField label={t("Status")} htmlFor="detail-status">
          <select
            id="detail-status"
            value={lead.status}
            disabled={!canEdit || isSaving}
            onChange={(event) => onPatch({ status: event.target.value })}
            className={adminInputClass}
            style={adminInputStyle}
          >
            {LEAD_STATUSES.map((option) => (
              <option key={option} value={option}>
                {t(STATUS_LABEL[option])}
              </option>
            ))}
          </select>
        </AdminField>

        <AdminField label={t("Next follow-up")} htmlFor="detail-follow-up">
          <input
            id="detail-follow-up"
            type="date"
            value={dateInputValue(lead.nextFollowUpDate)}
            disabled={!canEdit || isSaving}
            onChange={(event) => onPatch({ nextFollowUpDate: event.target.value || null })}
            className={adminInputClass}
            style={adminInputStyle}
          />
        </AdminField>

        <AdminField label={`${t("Estimated value")} (${lead.currency})`} htmlFor="detail-value">
          <input
            id="detail-value"
            type="number"
            min={0}
            step="100"
            value={value}
            disabled={!canEdit || isSaving}
            onChange={(event) => setValue(event.target.value)}
            // Saved on blur, not per keystroke — otherwise "1200" is four PATCHes.
            onBlur={() => {
              const next = value ? Number(value) : null;
              if (next !== (lead.estimatedValue ?? null)) onPatch({ estimatedValue: next });
            }}
            className={adminInputClass}
            style={adminInputStyle}
          />
        </AdminField>

        {owners.length > 0 ? (
          <AdminField label={t("Owner")} htmlFor="detail-owner">
            <select
              id="detail-owner"
              value={lead.assignedExecId ?? ""}
              disabled={isSaving}
              onChange={(event) => onPatch({ assignedExecId: event.target.value || null })}
              className={adminInputClass}
              style={adminInputStyle}
            >
              <option value="">{t("Unassigned")}</option>
              {owners.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.name || option.email}
                </option>
              ))}
            </select>
          </AdminField>
        ) : (
          <AdminField label={t("Owner")} htmlFor="detail-owner-readonly">
            <input
              id="detail-owner-readonly"
              readOnly
              value={lead.assignedExecName ?? t("Unassigned")}
              className={adminInputClass}
              style={adminInputStyle}
            />
          </AdminField>
        )}
      </div>

      <form
        onSubmit={submitActivity}
        className="grid gap-3 border-t pt-5"
        style={{ borderColor: "var(--adm-border)" }}
      >
        <div className="flex items-center gap-2">
          <MessageSquare size={15} style={{ color: "var(--adm-text-3)" }} />
          <h4
            className="text-xs font-bold uppercase tracking-wider"
            style={{ color: "var(--adm-text-2)" }}
          >
            {t("Log activity")}
          </h4>
        </div>
        <div className="flex flex-wrap gap-2">
          {ACTIVITY_TYPES.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setActivityType(option)}
              aria-pressed={activityType === option}
              className="rounded-full border px-3 py-1 text-xs font-semibold capitalize transition"
              style={{
                borderColor: activityType === option ? "var(--adm-blue)" : "var(--adm-border)",
                background: activityType === option ? "var(--adm-blue-light)" : "transparent",
                color: activityType === option ? "var(--adm-blue)" : "var(--adm-text-2)",
              }}
            >
              {t(option)}
            </button>
          ))}
        </div>
        <textarea
          value={body}
          onChange={(event) => setBody(event.target.value)}
          rows={3}
          placeholder={t("What happened? Who said what, and what is the next step?")}
          aria-label={t("Log activity")}
          className={adminInputClass}
          style={adminInputStyle}
        />
        <button
          type="submit"
          disabled={isLogging || !body.trim()}
          className="btn-press justify-self-start bg-adm-blue px-5 py-2 text-sm font-bold text-white transition hover:opacity-90 disabled:opacity-40"
        >
          {isLogging ? t("Saving…") : t("Add to timeline")}
        </button>
      </form>

      <div className="grid gap-3">
        <h4
          className="text-xs font-bold uppercase tracking-wider"
          style={{ color: "var(--adm-text-2)" }}
        >
          {t("Timeline")} ({lead.activities.length})
        </h4>
        {lead.activities.length === 0 ? (
          <p className="text-sm" style={{ color: "var(--adm-text-3)" }}>
            {t("Nothing logged yet. Every call and email belongs here.")}
          </p>
        ) : (
          <ul className="grid gap-3">
            {lead.activities.map((activity: LeadActivity) => {
              const Icon = ACTIVITY_ICON[activity.type as keyof typeof ACTIVITY_ICON] ?? StickyNote;
              return (
                <li
                  key={activity.id}
                  className="flex gap-3 border p-3"
                  style={{ borderColor: "var(--adm-border)", background: "var(--adm-surface-2)" }}
                >
                  <Icon size={15} className="mt-0.5 shrink-0" style={{ color: "var(--adm-text-3)" }} />
                  <div className="min-w-0">
                    <p className="whitespace-pre-wrap text-sm" style={{ color: "var(--adm-text)" }}>
                      {activity.body}
                    </p>
                    <p className="mt-1 text-[11px]" style={{ color: "var(--adm-text-3)" }}>
                      {activity.authorName ?? t("System")} · {formatDate(activity.createdAt)}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>


    </div>
  );
}


