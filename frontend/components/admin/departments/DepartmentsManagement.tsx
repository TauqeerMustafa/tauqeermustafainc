"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Building2,
  CheckCircle2,
  Edit2,
  Inbox,
  Mail,
  Plus,
  Search,
  Trash2,
  Users,
} from "lucide-react";

import {
  Badge,
  EmptyBlock,
  ErrorBlock,
  Field,
  LoadingBlock,
  Panel,
  PortalButton,
  PortalDialog,
  PortalPageHeader,
  StatCard,
  inputClass,
} from "@/components/portal/PortalUI";
import {
  useCreateDepartment,
  useDeleteDepartment,
  useDepartments,
  useUpdateDepartment,
} from "@/hooks/useDepartments";
import { useI18n } from "@/lib/i18n";
import type { Department } from "@/types/domain";

const DEPARTMENT_MAIL_MAP: Record<string, { tech: string; com: string }> = {
  "General Inquiries": {
    tech: "contact@tauqeermustafa.tech",
    com: "contact@tauqeermustafa.com",
  },
  "Customer Support": {
    tech: "support@tauqeermustafa.tech",
    com: "support@tauqeermustafa.com",
  },
  "Sales & New Business": {
    tech: "sales@tauqeermustafa.tech",
    com: "sales@tauqeermustafa.com",
  },
  "Partnerships": {
    tech: "partners@tauqeermustafa.tech",
    com: "partners@tauqeermustafa.com",
  },
  "Marketing & Press": {
    tech: "press@tauqeermustafa.tech",
    com: "press@tauqeermustafa.com",
  },
  "Careers & Human Resources": {
    tech: "careers@tauqeermustafa.tech",
    com: "careers@tauqeermustafa.com",
  },
  "Billing & Invoices": {
    tech: "billing@tauqeermustafa.tech",
    com: "billing@tauqeermustafa.com",
  },
  "Legal & Privacy": {
    tech: "legal@tauqeermustafa.tech",
    com: "legal@tauqeermustafa.com",
  },
  "Engineering": {
    tech: "engineering@tauqeermustafa.tech",
    com: "engineering@tauqeermustafa.com",
  },
  "Product & Design": {
    tech: "product@tauqeermustafa.tech",
    com: "product@tauqeermustafa.com",
  },
};

function getDepartmentEmails(name: string) {
  if (DEPARTMENT_MAIL_MAP[name]) {
    return DEPARTMENT_MAIL_MAP[name];
  }
  const clean = name.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 15) || "dept";
  return {
    tech: `${clean}@tauqeermustafa.tech`,
    com: `${clean}@tauqeermustafa.com`,
  };
}

export function DepartmentsManagement() {
  const { t } = useI18n();
  const departmentsQuery = useDepartments();
  const createDepartment = useCreateDepartment();
  const updateDepartment = useUpdateDepartment();
  const deleteDepartment = useDeleteDepartment();

  const [search, setSearch] = useState("");
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);
  const [departmentName, setDepartmentName] = useState("");
  const [confirmDelete, setConfirmDelete] = useState<Department | null>(null);

  const departments = departmentsQuery.data ?? [];

  // Metrics
  const totalDepartments = departments.length;
  const totalAssignedStaff = useMemo(
    () => departments.reduce((acc, d) => acc + (d.employeeCount ?? 0), 0),
    [departments],
  );

  // Filtered
  const filteredDepartments = useMemo(() => {
    if (!search.trim()) return departments;
    const term = search.toLowerCase();
    return departments.filter((d) => d.name.toLowerCase().includes(term));
  }, [departments, search]);

  function openCreate() {
    setEditingDepartment(null);
    setDepartmentName("");
    setEditorOpen(true);
  }

  function openEdit(dept: Department) {
    setEditingDepartment(dept);
    setDepartmentName(dept.name);
    setEditorOpen(true);
  }

  async function handleSaveDepartment(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = departmentName.trim();
    if (!trimmed) return;

    if (editingDepartment) {
      await updateDepartment.mutateAsync({
        id: editingDepartment.id,
        payload: { name: trimmed },
      });
    } else {
      await createDepartment.mutateAsync({
        name: trimmed,
      });
    }
    setEditorOpen(false);
  }

  async function handleDeleteConfirm() {
    if (!confirmDelete) return;
    await deleteDepartment.mutateAsync(confirmDelete.id);
    setConfirmDelete(null);
  }

  if (departmentsQuery.isLoading) {
    return <LoadingBlock label={t("Loading organization departments…")} />;
  }

  if (departmentsQuery.isError) {
    return (
      <ErrorBlock
        message={t("Could not load departments from server.")}
        onRetry={() => departmentsQuery.refetch()}
      />
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <PortalPageHeader
        title={t("Departments")}
        description={t(
          "Manage organizational divisions, automated open.email dual routing, and staff allocations.",
        )}
      >
        <PortalButton icon={Plus} onClick={openCreate}>
          {t("Add Department")}
        </PortalButton>
      </PortalPageHeader>

      {/* Top Stat Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          label={t("Total Departments")}
          value={totalDepartments}
          icon={Building2}
          tone="blue"
          hint={t("Active organizational units")}
        />
        <StatCard
          label={t("Assigned Workforce")}
          value={totalAssignedStaff}
          icon={Users}
          tone="neutral"
          hint={t("Employees linked to departments")}
        />
        <StatCard
          label={t("Mail Routing Status")}
          value={t("100% Configured")}
          icon={CheckCircle2}
          tone="green"
          hint={t(".tech & .com dual aliases active")}
        />
      </div>

      {/* Controls & Filter */}
      <Panel>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-adm-text-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("Filter by department name…")}
              className={`${inputClass} pl-10`}
            />
          </div>
          <div className="flex items-center gap-2 text-xs text-adm-text-3">
            <span>
              {t("Showing {count} of {total} departments", {
                count: filteredDepartments.length,
                total: totalDepartments,
              })}
            </span>
          </div>
        </div>
      </Panel>

      {/* Departments Table */}
      <Panel padded={false}>
        {filteredDepartments.length === 0 ? (
          <div className="py-12">
            <EmptyBlock
              title={t("No departments found")}
              description={
                search
                  ? t("No department matched your search criteria.")
                  : t("No organizational departments have been set up yet.")
              }
            >
              <div className="mt-4">
                {search ? (
                  <PortalButton variant="ghost" onClick={() => setSearch("")}>
                    {t("Clear filter")}
                  </PortalButton>
                ) : (
                  <PortalButton icon={Plus} onClick={openCreate}>
                    {t("Create first department")}
                  </PortalButton>
                )}
              </div>
            </EmptyBlock>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead className="border-b border-adm-border bg-adm-surface-2/60 text-xs font-semibold uppercase tracking-wider text-adm-text-3">
                <tr>
                  <th className="py-3.5 pl-6 pr-4">{t("Department Name")}</th>
                  <th className="px-4 py-3.5">{t("Official Inboxes & Mail Routing")}</th>
                  <th className="px-4 py-3.5">{t("Team Headcount")}</th>
                  <th className="px-4 py-3.5">{t("Department ID")}</th>
                  <th className="py-3.5 pl-4 pr-6 text-right">{t("Actions")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-adm-border bg-adm-surface">
                {filteredDepartments.map((dept) => {
                  const emails = getDepartmentEmails(dept.name);
                  const count = dept.employeeCount ?? 0;
                  return (
                    <tr
                      key={dept.id}
                      className="transition-colors hover:bg-adm-surface-2/40"
                    >
                      <td className="py-4 pl-6 pr-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center border border-adm-border bg-adm-surface-2 text-adm-text">
                            <Building2 className="h-5 w-5 text-adm-blue" />
                          </div>
                          <div>
                            <span className="font-semibold text-adm-text">
                              {dept.name}
                            </span>
                            <div className="text-xs text-adm-text-3">
                              {t("Created: {date}", {
                                date: new Date(dept.createdAt).toLocaleDateString(),
                              })}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-4">
                        <div className="flex flex-col gap-1.5">
                          <div className="flex items-center gap-2">
                            <Badge tone="blue">
                              <span className="flex items-center gap-1">
                                <Mail className="h-3 w-3" />
                                {emails.tech}
                              </span>
                            </Badge>
                            <Link
                              href={`/admin/mail`}
                              className="text-xs text-adm-text-3 hover:text-adm-text transition-colors"
                              title={t("Open in Webmail")}
                            >
                              <Inbox className="h-3.5 w-3.5" />
                            </Link>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge tone="green">
                              <span className="flex items-center gap-1">
                                <Mail className="h-3 w-3" />
                                {emails.com}
                              </span>
                            </Badge>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-4">
                        <Link
                          href={`/admin/employees?department=${dept.id}`}
                          className="inline-flex items-center gap-1.5 rounded-full border border-adm-border bg-adm-surface-2 px-3 py-1 text-xs font-medium text-adm-text hover:border-adm-border-2"
                        >
                          <Users className="h-3.5 w-3.5 text-adm-text-3" />
                          <span>
                            {count === 1
                              ? t("1 assigned")
                              : t("{count} assigned", { count })}
                          </span>
                        </Link>
                      </td>

                      <td className="px-4 py-4">
                        <span className="font-mono text-xs text-adm-text-3">
                          {dept.id.slice(0, 8)}…{dept.id.slice(-4)}
                        </span>
                      </td>

                      <td className="py-4 pl-4 pr-6 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => openEdit(dept)}
                            title={t("Edit department")}
                            className="rounded-full p-2 text-adm-text-3 transition-colors hover:bg-adm-surface-2 hover:text-adm-text"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmDelete(dept)}
                            title={t("Delete department")}
                            className="rounded-full p-2 text-adm-red transition-colors hover:bg-adm-red-light/50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Panel>

      {/* Create / Edit Department Modal */}
      <PortalDialog
        open={editorOpen}
        onClose={() => setEditorOpen(false)}
        title={editingDepartment ? t("Edit Department") : t("Create New Department")}
      >
        <div className="text-sm text-adm-text-3 mb-4">
          {editingDepartment
            ? t("Update the department title. Mail routing will update automatically.")
            : t("Add a new organizational department and initialize dual routing inboxes.")}
        </div>
        <form onSubmit={handleSaveDepartment} className="flex flex-col gap-5 pt-2">
          <Field label={t("Department Name")}>
            <input
              type="text"
              required
              value={departmentName}
              onChange={(e) => setDepartmentName(e.target.value)}
              placeholder={t("e.g. Artificial Intelligence Research")}
              className={inputClass}
              autoFocus
            />
          </Field>

          {departmentName.trim() && (
            <div className="border border-adm-border bg-adm-surface-2 p-4">
              <span className="text-xs font-semibold text-adm-text-3 uppercase tracking-wide">
                {t("Auto-Generated Department Inboxes:")}
              </span>
              <div className="mt-2 flex flex-col gap-1.5 text-xs text-adm-text">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-adm-blue">.tech:</span>
                  <span className="font-mono">{getDepartmentEmails(departmentName).tech}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-adm-green">.com:</span>
                  <span className="font-mono">{getDepartmentEmails(departmentName).com}</span>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-3 border-t border-adm-border">
            <PortalButton
              variant="ghost"
              type="button"
              onClick={() => setEditorOpen(false)}
            >
              {t("Cancel")}
            </PortalButton>
            <PortalButton
              type="submit"
              disabled={createDepartment.isPending || updateDepartment.isPending}
            >
              {editingDepartment ? t("Save Changes") : t("Create Department")}
            </PortalButton>
          </div>
        </form>
      </PortalDialog>

      {/* Delete Confirmation Modal */}
      <PortalDialog
        open={Boolean(confirmDelete)}
        onClose={() => setConfirmDelete(null)}
        title={t("Delete Department")}
      >
        <div className="text-sm text-adm-text-3 mb-4">
          {t(
            "Are you sure you want to delete {name}? Any assigned employees will become unassigned.",
            { name: confirmDelete?.name ?? "" },
          )}
        </div>
        <div className="flex justify-end gap-3 pt-4 border-t border-adm-border">
          <PortalButton
            variant="ghost"
            onClick={() => setConfirmDelete(null)}
          >
            {t("Cancel")}
          </PortalButton>
          <PortalButton
            variant="danger"
            onClick={handleDeleteConfirm}
            disabled={deleteDepartment.isPending}
          >
            {t("Delete Department")}
          </PortalButton>
        </div>
      </PortalDialog>
    </div>
  );
}
