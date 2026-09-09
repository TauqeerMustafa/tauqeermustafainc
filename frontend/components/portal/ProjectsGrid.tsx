"use client";

/**
 * The staff Projects page, shared by `/admin/projects` and `/employees/projects`.
 *
 * The two callers read different endpoints on purpose: `/dashboard/projects` is
 * manager-gated (admin + exec + team_lead) and returns the whole delivery book,
 * so a member hitting it would 403. `/dashboard/projects/me` returns only the
 * projects the caller has tasks on, with task counts scoped to their own work.
 */

import { useMemo, useState } from "react";
import {
  AlertTriangle,
  Check,
  CheckSquare,
  Clock,
  Edit2,
  FolderOpen,
  FolderPlus,
  Layers,
  Pencil,
  Plus,
  Square,
  Trash2,
  Users,
  X,
} from "lucide-react";

import {
  EmptyBlock,
  Field,
  PortalButton,
  PortalDialog,
  inputClass,
} from "@/components/portal/PortalUI";
import { useAdminUsers } from "@/hooks/useAdmin";
import { useManagementProjects, useMyProjects } from "@/hooks/useDashboard";
import {
  useBulkCreateProjects,
  useBulkDeleteProjects,
  useBulkUpdateProjects,
  useCreateProject,
  useDeleteProject,
  useUpdateProject,
} from "@/hooks/useProjects";
import type { CreateProjectPayload } from "@/types/domain";
import type { ManagementProjectRow } from "@/types/hr";

const STATUS_TONE: Record<string, { bg: string; fg: string }> = {
  live: { bg: "var(--adm-green-light)", fg: "var(--adm-green)" },
  review: { bg: "var(--adm-amber-light)", fg: "var(--adm-amber)" },
  in_progress: { bg: "var(--adm-blue-light)", fg: "var(--adm-blue)" },
  discovery: { bg: "var(--adm-surface-2)", fg: "var(--adm-text-2)" },
  completed: { bg: "var(--adm-green-light)", fg: "var(--adm-green)" },
  on_hold: { bg: "var(--adm-red-light)", fg: "var(--adm-red)" },
};

const STATUS_OPTIONS = [
  { value: "discovery", label: "Discovery" },
  { value: "in_progress", label: "In Progress" },
  { value: "review", label: "Review" },
  { value: "live", label: "Live" },
  { value: "completed", label: "Completed" },
  { value: "on_hold", label: "On Hold" },
];

function statusTone(status: string) {
  return STATUS_TONE[status] ?? { bg: "var(--adm-blue-light)", fg: "var(--adm-blue)" };
}

function formatUpdated(value: string | null) {
  if (!value) return "No updates yet";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "No updates yet";
  return `Updated ${new Intl.DateTimeFormat("en", { month: "short", day: "numeric" }).format(date)}`;
}

interface ProjectDraft {
  clientId: string;
  name: string;
  status: string;
  summary: string;
  nextMilestone: string;
  progress: number;
}

const EMPTY_DRAFT: ProjectDraft = {
  clientId: "",
  name: "",
  status: "discovery",
  summary: "",
  nextMilestone: "",
  progress: 0,
};

export default function ProjectsGrid({ isAdmin = false }: { isAdmin?: boolean }) {
  const managerQuery = useManagementProjects({ enabled: isAdmin });
  const myQuery = useMyProjects({ enabled: !isAdmin });
  const query = isAdmin ? managerQuery : myQuery;

  const usersQuery = useAdminUsers({ pageSize: 100 }, isAdmin);
  const users = usersQuery.data?.data.items ?? [];

  const createProject = useCreateProject();
  const bulkCreateProjects = useBulkCreateProjects();
  const updateProject = useUpdateProject();
  const deleteProject = useDeleteProject();
  const bulkDeleteProjects = useBulkDeleteProjects();
  const bulkUpdateProjects = useBulkUpdateProjects();

  const projects: ManagementProjectRow[] = query.data ?? [];

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [search, setSearch] = useState("");

  // Single project dialog
  const [isEditorOpen, setEditorOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<ManagementProjectRow | null>(null);
  const [draft, setDraft] = useState<ProjectDraft>(EMPTY_DRAFT);

  // Batch create dialog
  const [isBatchOpen, setBatchOpen] = useState(false);
  const [batchRows, setBatchRows] = useState<CreateProjectPayload[]>([
    { clientId: "", name: "", status: "discovery", progress: 0, nextMilestone: "", summary: "" },
    { clientId: "", name: "", status: "discovery", progress: 0, nextMilestone: "", summary: "" },
  ]);

  // Confirmation dialogs
  const [confirmDelete, setConfirmDelete] = useState<ManagementProjectRow | null>(null);
  const [isBulkDeleteOpen, setBulkDeleteOpen] = useState(false);

  // Filtered projects
  const filteredProjects = useMemo(() => {
    if (!search.trim()) return projects;
    const term = search.toLowerCase();
    return projects.filter(
      (p) =>
        p.name.toLowerCase().includes(term) ||
        (p.clientName && p.clientName.toLowerCase().includes(term)) ||
        p.status.toLowerCase().includes(term) ||
        (p.summary && p.summary.toLowerCase().includes(term)),
    );
  }, [projects, search]);

  const allFilteredSelected =
    filteredProjects.length > 0 && filteredProjects.every((p) => selectedIds.includes(p.id));

  function toggleSelectAll() {
    if (allFilteredSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredProjects.map((p) => p.id));
    }
  }

  function toggleSelect(id: string) {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  }

  function openCreate() {
    setEditingProject(null);
    setDraft(EMPTY_DRAFT);
    setEditorOpen(true);
  }

  function openEdit(project: ManagementProjectRow) {
    setEditingProject(project);
    // Find client id from users list matching clientName if possible, or leave blank
    const matchedUser = users.find((u) => u.name === project.clientName);
    setDraft({
      clientId: matchedUser ? matchedUser.id : "",
      name: project.name,
      status: project.status || "discovery",
      summary: project.summary ?? "",
      nextMilestone: project.nextMilestone ?? "",
      progress: project.progress ?? 0,
    });
    setEditorOpen(true);
  }

  async function handleSaveProject(e: React.FormEvent) {
    e.preventDefault();
    if (!draft.name.trim()) return;

    if (editingProject) {
      await updateProject.mutateAsync({
        id: editingProject.id,
        payload: {
          clientId: draft.clientId || undefined,
          name: draft.name.trim(),
          status: draft.status,
          summary: draft.summary.trim() || null,
          nextMilestone: draft.nextMilestone.trim() || null,
          progress: draft.progress,
        },
      });
    } else {
      if (!draft.clientId) return;
      await createProject.mutateAsync({
        clientId: draft.clientId,
        name: draft.name.trim(),
        status: draft.status,
        summary: draft.summary.trim() || null,
        nextMilestone: draft.nextMilestone.trim() || null,
        progress: draft.progress,
      });
    }
    setEditorOpen(false);
  }

  function addBatchRow() {
    setBatchRows((prev) => [
      ...prev,
      { clientId: "", name: "", status: "discovery", progress: 0, nextMilestone: "", summary: "" },
    ]);
  }

  function updateBatchRow(index: number, field: keyof CreateProjectPayload, value: any) {
    setBatchRows((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  }

  function removeBatchRow(index: number) {
    setBatchRows((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleBatchSubmit(e: React.FormEvent) {
    e.preventDefault();
    const validProjects = batchRows.filter((row) => row.name.trim() && row.clientId);
    if (validProjects.length === 0) return;

    await bulkCreateProjects.mutateAsync(
      validProjects.map((p) => ({
        ...p,
        name: p.name.trim(),
        summary: p.summary?.trim() || null,
        nextMilestone: p.nextMilestone?.trim() || null,
      })),
    );
    setBatchOpen(false);
  }

  async function handleDeleteSingle() {
    if (!confirmDelete) return;
    await deleteProject.mutateAsync(confirmDelete.id);
    setSelectedIds((prev) => prev.filter((id) => id !== confirmDelete.id));
    setConfirmDelete(null);
  }

  async function handleBulkDelete() {
    if (selectedIds.length === 0) return;
    await bulkDeleteProjects.mutateAsync(selectedIds);
    setSelectedIds([]);
    setBulkDeleteOpen(false);
  }

  async function handleBulkStatus(status: string) {
    if (selectedIds.length === 0) return;
    await bulkUpdateProjects.mutateAsync({ ids: selectedIds, status });
    setSelectedIds([]);
  }

  return (
    <div className="flex flex-col gap-6 h-full">
      {/* Header with Title and Creation Actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold uppercase" style={{ color: "var(--adm-text)" }}>
            Projects Hub
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--adm-text-3)" }}>
            {isAdmin
              ? "Every active company project with its live delivery load, progress, and milestones."
              : "The projects you are assigned to, with your open work on each."}
          </p>
        </div>

        {isAdmin && (
          <div className="flex items-center gap-2">
            {filteredProjects.length > 0 && (
              <PortalButton variant="ghost" onClick={toggleSelectAll}>
                {allFilteredSelected ? (
                  <>
                    <CheckSquare className="mr-1.5 h-4 w-4" /> Deselect All
                  </>
                ) : (
                  <>
                    <Square className="mr-1.5 h-4 w-4" /> Select All
                  </>
                )}
              </PortalButton>
            )}

            <PortalButton variant="ghost" onClick={() => setBatchOpen(true)}>
              <Layers className="mr-1.5 h-4 w-4" /> Batch Add Projects
            </PortalButton>

            <PortalButton variant="primary" onClick={openCreate}>
              <Plus className="mr-1.5 h-4 w-4" /> New Project
            </PortalButton>
          </div>
        )}
      </div>

      {/* Sticky Bulk Actions Toolbar */}
      {isAdmin && selectedIds.length > 0 && (
        <div className="sticky top-20 z-40 flex flex-wrap items-center justify-between gap-3 bg-adm-surface border border-adm-blue/40 p-3.5 shadow-xl backdrop-blur-md">
          <div className="flex items-center gap-3">
            <span className="flex h-6 w-6 items-center justify-center bg-adm-blue text-white text-xs font-mono font-bold">
              {selectedIds.length}
            </span>
            <span className="text-sm font-semibold text-adm-text">
              {selectedIds.length} {selectedIds.length === 1 ? "project" : "projects"} selected
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1 text-xs text-adm-text-3">
              <span>Set status:</span>
              {STATUS_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => handleBulkStatus(opt.value)}
                  disabled={bulkUpdateProjects.isPending}
                  className="px-2 py-1 text-xs font-medium border border-adm-border bg-adm-surface-2 text-adm-text-2 hover:border-adm-blue transition"
                >
                  {opt.label}
                </button>
              ))}
            </div>

            <PortalButton
              variant="danger"
              onClick={() => setBulkDeleteOpen(true)}
              disabled={bulkDeleteProjects.isPending}
            >
              <Trash2 className="mr-1.5 h-3.5 w-3.5" /> Delete Selected
            </PortalButton>

            <PortalButton variant="ghost" onClick={() => setSelectedIds([])}>
              Clear
            </PortalButton>
          </div>
        </div>
      )}

      {query.isError ? (
        <div
          className="border p-5 text-sm"
          role="alert"
          style={{ borderColor: "var(--adm-red)", background: "var(--adm-red-light)", color: "var(--adm-red)" }}
        >
          {query.error instanceof Error ? query.error.message : "Could not load projects."}
        </div>
      ) : null}

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {query.isLoading ? (
          <div className="col-span-full py-12 text-center" style={{ color: "var(--adm-text-3)" }}>
            Loading projects...
          </div>
        ) : filteredProjects.length === 0 && !query.isError ? (
          <div
            className="col-span-full py-20 flex flex-col items-center justify-center text-center border"
            style={{ borderColor: "var(--adm-border)", background: "var(--adm-surface)" }}
          >
            <FolderOpen size={48} className="mb-4" style={{ color: "var(--adm-text-3)" }} />
            <p className="font-bold" style={{ color: "var(--adm-text)" }}>No active projects</p>
            <p className="text-sm mt-1" style={{ color: "var(--adm-text-3)" }}>
              {isAdmin
                ? "Click 'New Project' or 'Batch Add Projects' to start tracking delivery work."
                : "You have not been assigned to any project yet."}
            </p>
          </div>
        ) : (
          filteredProjects.map((project) => {
            const tone = statusTone(project.status);
            const progress = Math.min(100, Math.max(0, project.progress));
            const isSelected = selectedIds.includes(project.id);

            return (
              <div
                key={project.id}
                className={`border p-6 flex flex-col transition relative ${
                  isSelected ? "ring-1 ring-adm-blue border-adm-blue" : "hover:border-adm-border-2"
                }`}
                style={{
                  borderColor: isSelected ? "var(--adm-blue)" : "var(--adm-border)",
                  background: "var(--adm-surface)",
                }}
              >
                {/* Card Top: Checkbox, Status Pill, Overdue badge, Actions */}
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex items-center gap-2">
                    {isAdmin && (
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelect(project.id)}
                        className="h-4 w-4 rounded-none border-adm-border text-adm-blue cursor-pointer"
                      />
                    )}
                    <div
                      className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider"
                      style={{ background: tone.bg, color: tone.fg }}
                    >
                      {project.status.replace(/_/g, " ")}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {project.overdueTasks > 0 ? (
                      <span
                        className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider"
                        style={{ color: "var(--adm-red)" }}
                        title={`${project.overdueTasks} task(s) past due`}
                      >
                        <AlertTriangle size={13} /> {project.overdueTasks} overdue
                      </span>
                    ) : null}

                    {isAdmin && (
                      <div className="flex items-center gap-0.5 ml-1">
                        <button
                          type="button"
                          onClick={() => openEdit(project)}
                          className="p-1 text-adm-text-3 hover:text-adm-blue transition"
                          title="Edit Project"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmDelete(project)}
                          className="p-1 text-adm-text-3 hover:text-adm-red transition"
                          title="Delete Project"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <h3 className="text-xl font-bold mb-1 line-clamp-2" style={{ color: "var(--adm-text)" }}>
                  {project.name}
                </h3>
                {project.clientName ? (
                  <p className="text-xs font-semibold uppercase tracking-wider mb-4" style={{ color: "var(--adm-text-3)" }}>
                    {project.clientName}
                  </p>
                ) : null}
                {project.summary ? (
                  <p className="text-sm mb-5 line-clamp-2" style={{ color: "var(--adm-text-3)" }}>
                    {project.summary}
                  </p>
                ) : null}

                <div className="mt-auto">
                  <div className="flex items-center justify-between text-xs font-semibold mb-2" style={{ color: "var(--adm-text-3)" }}>
                    <span>Progress</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden mb-5" style={{ background: "var(--adm-surface-2)" }}>
                    <div
                      className="h-full transition-all duration-700"
                      style={{ width: `${progress}%`, background: progress === 100 ? "var(--adm-green)" : "var(--adm-blue)" }}
                    />
                  </div>

                  <div className="flex items-center justify-between border-t pt-4" style={{ borderColor: "var(--adm-border)" }}>
                    <div className="flex items-center gap-1.5 text-sm font-semibold" style={{ color: "var(--adm-text-2)" }}>
                      <Users size={16} /> {project.openTasks} {isAdmin ? "open" : "of mine open"}
                    </div>
                    <div className="flex items-center gap-1.5 text-sm font-semibold" style={{ color: "var(--adm-text-2)" }}>
                      <Clock size={16} /> {project.nextMilestone || formatUpdated(project.updatedAt)}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Single Project Create/Edit Dialog */}
      {isAdmin && (
        <PortalDialog
          open={isEditorOpen}
          title={editingProject ? "Edit Project" : "Create New Project"}
          onClose={() => setEditorOpen(false)}
        >
          <form onSubmit={handleSaveProject} className="space-y-4">
            <Field label="Project Name *" hint="E.g., Mobile Banking Portal, Brand Redesign">
              <input
                type="text"
                required
                value={draft.name}
                onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                placeholder="Enter project name"
                className={inputClass}
              />
            </Field>

            <Field label="Client Account *" hint="User account that owns this project">
              <select
                required={!editingProject}
                value={draft.clientId}
                onChange={(e) => setDraft({ ...draft, clientId: e.target.value })}
                className={inputClass}
              >
                <option value="">-- Select Client --</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.email}) {u.roleName ? `· ${u.roleName}` : ""}
                  </option>
                ))}
              </select>
            </Field>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Status">
                <select
                  value={draft.status}
                  onChange={(e) => setDraft({ ...draft, status: e.target.value })}
                  className={inputClass}
                >
                  {STATUS_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label={`Progress (${draft.progress}%)`}>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={draft.progress}
                  onChange={(e) => setDraft({ ...draft, progress: Number(e.target.value) })}
                  className="w-full mt-2"
                />
              </Field>
            </div>

            <Field label="Next Milestone" hint="Immediate delivery objective">
              <input
                type="text"
                value={draft.nextMilestone}
                onChange={(e) => setDraft({ ...draft, nextMilestone: e.target.value })}
                placeholder="E.g., Q3 Staging Deployment"
                className={inputClass}
              />
            </Field>

            <Field label="Summary / Scope" hint="Brief overview of objectives">
              <textarea
                rows={3}
                value={draft.summary}
                onChange={(e) => setDraft({ ...draft, summary: e.target.value })}
                placeholder="Enter project description..."
                className={inputClass}
              />
            </Field>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-adm-border">
              <PortalButton variant="ghost" type="button" onClick={() => setEditorOpen(false)}>
                Cancel
              </PortalButton>
              <PortalButton
                variant="primary"
                type="submit"
                disabled={createProject.isPending || updateProject.isPending}
              >
                {editingProject ? "Update Project" : "Create Project"}
              </PortalButton>
            </div>
          </form>
        </PortalDialog>
      )}

      {/* Batch Add Multiple Projects Modal */}
      {isAdmin && (
        <PortalDialog
          open={isBatchOpen}
          title="Batch Add Projects"
          onClose={() => setBatchOpen(false)}
        >
          <form onSubmit={handleBatchSubmit} className="space-y-4 max-w-2xl">
            <p className="text-xs text-adm-text-3">
              Add multiple projects at once. Specify the client account and project name for each row.
            </p>

            <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
              {batchRows.map((row, idx) => (
                <div
                  key={idx}
                  className="p-3 border border-adm-border bg-adm-surface-2 space-y-2 relative"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-adm-text-3">
                      Project #{idx + 1}
                    </span>
                    {batchRows.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeBatchRow(idx)}
                        className="text-adm-text-3 hover:text-adm-red text-xs"
                      >
                        Remove
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input
                      type="text"
                      required
                      placeholder="Project Name *"
                      value={row.name}
                      onChange={(e) => updateBatchRow(idx, "name", e.target.value)}
                      className={`${inputClass} text-xs py-1.5`}
                    />
                    <select
                      required
                      value={row.clientId}
                      onChange={(e) => updateBatchRow(idx, "clientId", e.target.value)}
                      className={`${inputClass} text-xs py-1.5`}
                    >
                      <option value="">-- Select Client * --</option>
                      {users.map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.name} ({u.email})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <select
                      value={row.status}
                      onChange={(e) => updateBatchRow(idx, "status", e.target.value)}
                      className={`${inputClass} text-xs py-1.5`}
                    >
                      {STATUS_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                    <input
                      type="text"
                      placeholder="Next Milestone"
                      value={row.nextMilestone ?? ""}
                      onChange={(e) => updateBatchRow(idx, "nextMilestone", e.target.value)}
                      className={`${inputClass} text-xs py-1.5`}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between pt-2">
              <PortalButton variant="ghost" type="button" onClick={addBatchRow}>
                <Plus className="mr-1.5 h-3.5 w-3.5" /> Add Another Project
              </PortalButton>

              <div className="flex items-center gap-2">
                <PortalButton variant="ghost" type="button" onClick={() => setBatchOpen(false)}>
                  Cancel
                </PortalButton>
                <PortalButton
                  variant="primary"
                  type="submit"
                  disabled={bulkCreateProjects.isPending}
                >
                  Create All ({batchRows.filter((r) => r.name && r.clientId).length})
                </PortalButton>
              </div>
            </div>
          </form>
        </PortalDialog>
      )}

      {/* Delete Single Project Confirmation Dialog */}
      {isAdmin && (
        <PortalDialog
          open={Boolean(confirmDelete)}
          title="Delete Project"
          onClose={() => setConfirmDelete(null)}
        >
          <div className="space-y-4">
            <p className="text-sm text-adm-text-2">
              Are you sure you want to permanently delete{" "}
              <strong className="text-adm-text">"{confirmDelete?.name}"</strong>?
            </p>
            <p className="text-xs text-adm-text-3">
              Tasks associated with this project will be decoupled. This action cannot be reversed.
            </p>
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-adm-border">
              <PortalButton variant="ghost" onClick={() => setConfirmDelete(null)}>
                Cancel
              </PortalButton>
              <PortalButton
                variant="danger"
                onClick={handleDeleteSingle}
                disabled={deleteProject.isPending}
              >
                Confirm Delete
              </PortalButton>
            </div>
          </div>
        </PortalDialog>
      )}

      {/* Bulk Delete Projects Confirmation Dialog */}
      {isAdmin && (
        <PortalDialog
          open={isBulkDeleteOpen}
          title="Delete Selected Projects"
          onClose={() => setBulkDeleteOpen(false)}
        >
          <div className="space-y-4">
            <p className="text-sm text-adm-text-2">
              Are you sure you want to permanently delete{" "}
              <strong className="text-adm-text">{selectedIds.length} projects</strong>?
            </p>
            <p className="text-xs text-adm-text-3">
              All linked tasks will have their project reference cleared. This action cannot be reversed.
            </p>
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-adm-border">
              <PortalButton variant="ghost" onClick={() => setBulkDeleteOpen(false)}>
                Cancel
              </PortalButton>
              <PortalButton
                variant="danger"
                onClick={handleBulkDelete}
                disabled={bulkDeleteProjects.isPending}
              >
                Confirm Bulk Delete
              </PortalButton>
            </div>
          </div>
        </PortalDialog>
      )}
    </div>
  );
}
