"use client";

import { useMemo, useState } from "react";
import {
  Check,
  Edit2,
  Plus,
  Search,
  Shield,
  Trash2,
  UserCheck,
  Users,
  X,
} from "lucide-react";

import {
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
import { useAdminUsers } from "@/hooks/useAdmin";
import {
  useBulkDeleteTeams,
  useCreateTeam,
  useDeleteTeam,
  useTeams,
  useUpdateTeam,
} from "@/hooks/useTeams";
import UserCategoryPicker from "@/components/admin/UserCategoryPicker";
import type { AdminTeam, AdminTeamMember } from "@/types/domain";

interface TeamDraft {
  name: string;
  teamLeadId: string;
  memberIds: string[];
}

const EMPTY_DRAFT: TeamDraft = {
  name: "",
  teamLeadId: "",
  memberIds: [],
};

export function TeamsManagement() {
  const teamsQuery = useTeams();
  const usersQuery = useAdminUsers({ pageSize: 100 });

  const createTeam = useCreateTeam();
  const updateTeam = useUpdateTeam();
  const deleteTeam = useDeleteTeam();
  const bulkDeleteTeams = useBulkDeleteTeams();

  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState<AdminTeam | null>(null);
  const [draft, setDraft] = useState<TeamDraft>(EMPTY_DRAFT);
  const [confirmDelete, setConfirmDelete] = useState<AdminTeam | null>(null);
  const [bulkConfirmOpen, setBulkConfirmOpen] = useState(false);

  const teams = teamsQuery.data ?? [];
  const users = usersQuery.data?.data?.items ?? [];

  // Metrics
  const totalTeams = teams.length;
  const assignedMemberIds = useMemo(() => {
    const ids = new Set<string>();
    for (const team of teams) {
      if (team.members) {
        for (const m of team.members) ids.add(m.id);
      }
    }
    return ids;
  }, [teams]);

  const unassignedCount = users.filter((u) => !u.teamId).length;
  const teamsWithLead = teams.filter((t) => t.teamLeadId).length;

  // Filtered teams
  const filteredTeams = useMemo(() => {
    if (!search.trim()) return teams;
    const term = search.toLowerCase();
    return teams.filter(
      (t) =>
        t.name.toLowerCase().includes(term) ||
        (t.teamLeadName && t.teamLeadName.toLowerCase().includes(term)) ||
        (t.members && t.members.some((m) => m.name.toLowerCase().includes(term) || m.email.toLowerCase().includes(term))),
    );
  }, [teams, search]);

  const allFilteredSelected =
    filteredTeams.length > 0 &&
    filteredTeams.every((t) => selectedIds.includes(t.id));

  function toggleSelectAll() {
    if (allFilteredSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredTeams.map((t) => t.id));
    }
  }

  function toggleSelect(id: string) {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  }

  function openCreate() {
    setEditingTeam(null);
    setDraft(EMPTY_DRAFT);
    setEditorOpen(true);
  }

  function openEdit(team: AdminTeam) {
    setEditingTeam(team);
    setDraft({
      name: team.name,
      teamLeadId: team.teamLeadId ?? "",
      memberIds: team.members ? team.members.map((m) => m.id) : [],
    });
    setEditorOpen(true);
  }

  function toggleMemberDraft(userId: string) {
    setDraft((prev) => {
      const exists = prev.memberIds.includes(userId);
      return {
        ...prev,
        memberIds: exists
          ? prev.memberIds.filter((id) => id !== userId)
          : [...prev.memberIds, userId],
      };
    });
  }

  function handleSelectMultipleMembers(userIds: string[]) {
    setDraft((prev) => ({
      ...prev,
      memberIds: Array.from(new Set([...prev.memberIds, ...userIds])),
    }));
  }

  function handleDeselectMultipleMembers(userIds: string[]) {
    setDraft((prev) => ({
      ...prev,
      memberIds: prev.memberIds.filter((id) => !userIds.includes(id)),
    }));
  }

  async function handleSaveTeam(e: React.FormEvent) {
    e.preventDefault();
    if (!draft.name.trim()) return;

    if (editingTeam) {
      await updateTeam.mutateAsync({
        id: editingTeam.id,
        payload: {
          name: draft.name.trim(),
          teamLeadId: draft.teamLeadId || null,
          memberIds: draft.memberIds,
        },
      });
    } else {
      await createTeam.mutateAsync({
        name: draft.name.trim(),
        teamLeadId: draft.teamLeadId || null,
        memberIds: draft.memberIds,
      });
    }
    setEditorOpen(false);
  }

  async function handleDeleteSingle() {
    if (!confirmDelete) return;
    await deleteTeam.mutateAsync(confirmDelete.id);
    setSelectedIds((prev) => prev.filter((id) => id !== confirmDelete.id));
    setConfirmDelete(null);
  }

  async function handleBulkDelete() {
    if (selectedIds.length === 0) return;
    await bulkDeleteTeams.mutateAsync(selectedIds);
    setSelectedIds([]);
    setBulkConfirmOpen(false);
  }

  if (teamsQuery.isLoading) return <LoadingBlock label="Loading team lists..." />;
  if (teamsQuery.isError) {
    return (
      <ErrorBlock
        message="Could not load teams from backend."
        onRetry={() => teamsQuery.refetch()}
      />
    );
  }

  return (
    <div className="space-y-6">
      <PortalPageHeader
        title="Teams Management"
        description="Organize company departments, assign team leads, manage member rosters, and structure task distribution."
      >
        <PortalButton variant="primary" onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" /> Create Team
        </PortalButton>
      </PortalPageHeader>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Teams"
          value={totalTeams}
          hint="Configured groups"
        />
        <StatCard
          label="Assigned Staff"
          value={assignedMemberIds.size}
          hint="Staff in teams"
        />
        <StatCard
          label="Unassigned"
          value={unassignedCount}
          hint="Needs team placement"
        />
        <StatCard
          label="Team Leads"
          value={teamsWithLead}
          hint="Appointed supervisors"
        />
      </div>

      {/* Search & Actions Bar */}
      <Panel>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-adm-text-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search teams by name, lead, or member..."
              className={`${inputClass} pl-9`}
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-adm-text-3 hover:text-adm-text"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            {filteredTeams.length > 0 && (
              <PortalButton variant="ghost" onClick={toggleSelectAll}>
                {allFilteredSelected ? "Deselect All" : "Select All"}
              </PortalButton>
            )}
            <span className="text-xs font-mono text-adm-text-3 uppercase tracking-wider">
              {filteredTeams.length} {filteredTeams.length === 1 ? "Team" : "Teams"}
            </span>
          </div>
        </div>
      </Panel>

      {/* Sticky Bulk Action Toolbar */}
      {selectedIds.length > 0 && (
        <div className="sticky top-20 z-40 flex items-center justify-between bg-adm-surface border border-adm-blue/40 p-4 shadow-xl backdrop-blur-md">
          <div className="flex items-center gap-3">
            <span className="flex h-6 w-6 items-center justify-center bg-adm-blue text-white text-xs font-mono font-bold">
              {selectedIds.length}
            </span>
            <span className="text-sm font-medium text-adm-text">
              {selectedIds.length} {selectedIds.length === 1 ? "team" : "teams"} selected
            </span>
          </div>
          <div className="flex items-center gap-2">
            <PortalButton
              variant="danger"
              onClick={() => setBulkConfirmOpen(true)}
              disabled={bulkDeleteTeams.isPending}
            >
              <Trash2 className="mr-2 h-4 w-4" /> Delete Selected
            </PortalButton>
            <PortalButton variant="ghost" onClick={() => setSelectedIds([])}>
              Clear
            </PortalButton>
          </div>
        </div>
      )}

      {/* Teams Grid */}
      {filteredTeams.length === 0 ? (
        <EmptyBlock
          title="No teams found"
          description={
            search
              ? "No teams match your search criteria. Try modifying your search term."
              : "No teams have been created yet. Click 'Create Team' to get started."
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {filteredTeams.map((team) => {
            const isSelected = selectedIds.includes(team.id);
            return (
              <div
                key={team.id}
                className={`relative flex flex-col justify-between border bg-adm-surface p-5 transition ${
                  isSelected
                    ? "border-adm-blue ring-1 ring-adm-blue/30"
                    : "border-adm-border hover:border-adm-border-2"
                }`}
              >
                <div>
                  {/* Card Header & Checkbox */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelect(team.id)}
                        className="h-4 w-4 rounded-none border-adm-border text-adm-blue focus:ring-adm-blue/20 cursor-pointer"
                      />
                      <h3 className="text-base font-bold text-adm-text truncate">
                        {team.name}
                      </h3>
                    </div>
                    <span className="inline-flex items-center gap-1 bg-adm-surface-2 px-2.5 py-0.5 text-[11px] font-mono uppercase tracking-wider text-adm-text-2 border border-adm-border">
                      <Users className="h-3 w-3" /> {team.memberCount}
                    </span>
                  </div>

                  {/* Team Lead Section */}
                  <div className="my-3 border-t border-b border-adm-border/60 py-2.5">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-adm-text-3">
                      Team Lead
                    </span>
                    <div className="mt-1 flex items-center gap-2">
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-adm-blue-light text-adm-blue text-xs font-bold font-mono">
                        {team.teamLeadName ? team.teamLeadName[0].toUpperCase() : "?"}
                      </div>
                      <span className="text-sm font-medium text-adm-text truncate">
                        {team.teamLeadName || "Unassigned lead"}
                      </span>
                    </div>
                  </div>

                  {/* Members List / Badges */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-mono uppercase tracking-widest text-adm-text-3">
                        Roster ({team.members?.length ?? 0})
                      </span>
                    </div>
                    {team.members && team.members.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto pr-1">
                        {team.members.map((member: AdminTeamMember) => (
                          <span
                            key={member.id}
                            className="inline-flex items-center gap-1 rounded-full bg-adm-surface-2 px-2.5 py-1 text-xs text-adm-text-2 border border-adm-border"
                            title={member.email}
                          >
                            <span className="h-1.5 w-1.5 rounded-full bg-adm-green" />
                            <span className="truncate max-w-[120px]">{member.name}</span>
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs italic text-adm-text-3 py-1">
                        No team members currently assigned.
                      </p>
                    )}
                  </div>
                </div>

                {/* Card Action Footer */}
                <div className="mt-5 flex items-center justify-between border-t border-adm-border pt-3">
                  <span className="text-[11px] font-mono text-adm-text-3">
                    {new Date(team.createdAt).toLocaleDateString()}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEdit(team)}
                      className="p-1.5 text-adm-text-3 hover:text-adm-blue transition"
                      title="Edit Team"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setConfirmDelete(team)}
                      className="p-1.5 text-adm-text-3 hover:text-adm-red transition"
                      title="Delete Team"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create / Edit Team Dialog */}
      <PortalDialog
        open={editorOpen}
        title={editingTeam ? "Edit Team" : "Create New Team"}
        onClose={() => setEditorOpen(false)}
      >
        <form onSubmit={handleSaveTeam} className="space-y-4">
          <Field label="Team Name *" hint="E.g., Engineering, Growth Marketing, Client Operations">
            <input
              type="text"
              required
              value={draft.name}
              onChange={(e) => setDraft({ ...draft, name: e.target.value })}
              placeholder="Enter team name"
              className={inputClass}
            />
          </Field>

          <Field label="Team Lead" hint="Select the primary manager or lead for this group">
            <select
              value={draft.teamLeadId}
              onChange={(e) => setDraft({ ...draft, teamLeadId: e.target.value })}
              className={inputClass}
            >
              <option value="">-- No Team Lead Assigned --</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.email}) {u.roleName ? `· ${u.roleName}` : ""}
                </option>
              ))}
            </select>
          </Field>

          {/* Member Assignment Section */}
          <UserCategoryPicker
            users={users}
            selectedIds={draft.memberIds}
            onToggle={toggleMemberDraft}
            onSelectMultiple={handleSelectMultipleMembers}
            onDeselectMultiple={handleDeselectMultipleMembers}
            label="Team Members"
            hint="Assemble roster from employees, admins, executives, or clients"
            maxListHeight="max-h-52"
          />

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-adm-border">
            <PortalButton variant="ghost" type="button" onClick={() => setEditorOpen(false)}>
              Cancel
            </PortalButton>
            <PortalButton
              variant="primary"
              type="submit"
              disabled={createTeam.isPending || updateTeam.isPending}
            >
              {editingTeam ? "Update Team" : "Create Team"}
            </PortalButton>
          </div>
        </form>
      </PortalDialog>

      {/* Single Delete Confirmation Dialog */}
      <PortalDialog
        open={Boolean(confirmDelete)}
        title="Confirm Delete Team"
        onClose={() => setConfirmDelete(null)}
      >
        <div className="space-y-4">
          <p className="text-sm text-adm-text-2">
            Are you sure you want to delete the team{" "}
            <strong className="text-adm-text">"{confirmDelete?.name}"</strong>?
          </p>
          <p className="text-xs text-adm-text-3">
            Assigned members will have their team association cleared to unassigned. No user accounts or tasks will be destroyed.
          </p>
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-adm-border">
            <PortalButton variant="ghost" onClick={() => setConfirmDelete(null)}>
              Cancel
            </PortalButton>
            <PortalButton
              variant="danger"
              onClick={handleDeleteSingle}
              disabled={deleteTeam.isPending}
            >
              Confirm Delete
            </PortalButton>
          </div>
        </div>
      </PortalDialog>

      {/* Bulk Delete Confirmation Dialog */}
      <PortalDialog
        open={bulkConfirmOpen}
        title="Confirm Bulk Delete Teams"
        onClose={() => setBulkConfirmOpen(false)}
      >
        <div className="space-y-4">
          <p className="text-sm text-adm-text-2">
            Are you sure you want to permanently delete{" "}
            <strong className="text-adm-text">{selectedIds.length} teams</strong>?
          </p>
          <p className="text-xs text-adm-text-3">
            All member associations for these teams will be safely unlinked.
          </p>
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-adm-border">
            <PortalButton variant="ghost" onClick={() => setBulkConfirmOpen(false)}>
              Cancel
            </PortalButton>
            <PortalButton
              variant="danger"
              onClick={handleBulkDelete}
              disabled={bulkDeleteTeams.isPending}
            >
              Confirm Bulk Delete
            </PortalButton>
          </div>
        </div>
      </PortalDialog>
    </div>
  );
}
