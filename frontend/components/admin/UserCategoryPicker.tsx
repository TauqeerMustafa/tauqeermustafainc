"use client";

import React, { useMemo, useState } from "react";
import { Check, Search, ShieldCheck, UserCheck, Users, Briefcase, Crown, X } from "lucide-react";
import type { AdminUser } from "@/types/domain";

export type UserCategory = "all" | "employees" | "admins" | "execs" | "clients";

export interface UserCategoryPickerProps {
  users: AdminUser[];
  selectedIds: string[];
  onToggle: (id: string) => void;
  onSelectMultiple?: (ids: string[]) => void;
  onDeselectMultiple?: (ids: string[]) => void;
  label?: string;
  hint?: string;
  className?: string;
  maxListHeight?: string;
}

export function getUserCategory(user: AdminUser): "employees" | "admins" | "execs" | "clients" {
  const roleSlug = (user.roleSlug || "").toLowerCase();
  const roleName = (user.roleName || "").toLowerCase();

  if (roleSlug.includes("admin") || roleName.includes("admin") || roleSlug === "superadmin") {
    return "admins";
  }
  if (roleSlug.includes("client") || roleName.includes("client")) {
    return "clients";
  }
  if (
    roleSlug.includes("exec") ||
    roleSlug.includes("lead") ||
    roleSlug.includes("manager") ||
    roleSlug.includes("management") ||
    roleName.includes("exec") ||
    roleName.includes("lead") ||
    roleName.includes("manager") ||
    roleName.includes("management")
  ) {
    return "execs";
  }
  return "employees";
}

const CATEGORY_CONFIG: Record<
  "employees" | "admins" | "execs" | "clients",
  {
    label: string;
    singular: string;
    icon: React.ElementType;
    color: string;
    bgBadge: string;
    borderBadge: string;
  }
> = {
  employees: {
    label: "Employees",
    singular: "Employee",
    icon: Users,
    color: "var(--adm-blue, #2563eb)",
    bgBadge: "rgba(37, 99, 235, 0.12)",
    borderBadge: "rgba(37, 99, 235, 0.3)",
  },
  admins: {
    label: "Admins",
    singular: "Admin",
    icon: ShieldCheck,
    color: "#9333ea",
    bgBadge: "rgba(147, 51, 234, 0.12)",
    borderBadge: "rgba(147, 51, 234, 0.3)",
  },
  execs: {
    label: "Executives & Leads",
    singular: "Executive",
    icon: Crown,
    color: "#d97706",
    bgBadge: "rgba(217, 119, 6, 0.12)",
    borderBadge: "rgba(217, 119, 6, 0.3)",
  },
  clients: {
    label: "Clients",
    singular: "Client",
    icon: Briefcase,
    color: "#059669",
    bgBadge: "rgba(5, 150, 105, 0.12)",
    borderBadge: "rgba(5, 150, 105, 0.3)",
  },
};

export default function UserCategoryPicker({
  users,
  selectedIds,
  onToggle,
  onSelectMultiple,
  onDeselectMultiple,
  label,
  hint,
  className = "",
  maxListHeight = "max-h-52",
}: UserCategoryPickerProps) {
  const [activeTab, setActiveTab] = useState<UserCategory>("employees");
  const [search, setSearch] = useState("");

  // Categorize users into groups
  const categorized = useMemo(() => {
    const map: Record<"employees" | "admins" | "execs" | "clients", AdminUser[]> = {
      employees: [],
      admins: [],
      execs: [],
      clients: [],
    };
    for (const u of users) {
      const cat = getUserCategory(u);
      map[cat].push(u);
    }
    return map;
  }, [users]);

  // Counts of selected users by category
  const selectedCounts = useMemo(() => {
    const counts = { employees: 0, admins: 0, execs: 0, clients: 0, total: selectedIds.length };
    const idSet = new Set(selectedIds);
    for (const u of users) {
      if (idSet.has(u.id)) {
        const cat = getUserCategory(u);
        counts[cat]++;
      }
    }
    return counts;
  }, [users, selectedIds]);

  // Tab users
  const tabUsers = useMemo(() => {
    if (activeTab === "all") return users;
    return categorized[activeTab] || [];
  }, [activeTab, categorized, users]);

  // Filtered by search
  const filteredUsers = useMemo(() => {
    if (!search.trim()) return tabUsers;
    const q = search.toLowerCase();
    return tabUsers.filter((u) => {
      return (
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        (u.roleName && u.roleName.toLowerCase().includes(q)) ||
        (u.teamName && u.teamName.toLowerCase().includes(q))
      );
    });
  }, [tabUsers, search]);

  // Category batch select/deselect
  const allFilteredSelected = useMemo(() => {
    if (filteredUsers.length === 0) return false;
    const idSet = new Set(selectedIds);
    return filteredUsers.every((u) => idSet.has(u.id));
  }, [filteredUsers, selectedIds]);

  const handleSelectAllFiltered = () => {
    const toAdd = filteredUsers.map((u) => u.id).filter((id) => !selectedIds.includes(id));
    if (onSelectMultiple) {
      onSelectMultiple(toAdd);
    } else {
      toAdd.forEach((id) => onToggle(id));
    }
  };

  const handleDeselectAllFiltered = () => {
    const toRemove = filteredUsers.map((u) => u.id).filter((id) => selectedIds.includes(id));
    if (onDeselectMultiple) {
      onDeselectMultiple(toRemove);
    } else {
      toRemove.forEach((id) => onToggle(id));
    }
  };

  const handleClearAll = () => {
    if (onDeselectMultiple) {
      onDeselectMultiple(selectedIds);
    } else {
      [...selectedIds].forEach((id) => onToggle(id));
    }
  };

  // Resolve user objects for selected IDs
  const selectedUsers = useMemo(() => {
    const userMap = new Map(users.map((u) => [u.id, u]));
    return selectedIds.map((id) => userMap.get(id) || ({ id, name: id, email: "" } as AdminUser));
  }, [users, selectedIds]);

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Header & Meta */}
      {(label || hint) && (
        <div className="flex items-baseline justify-between gap-2">
          {label && (
            <label
              className="block text-xs font-bold uppercase tracking-wider"
              style={{ color: "var(--adm-text-2)" }}
            >
              {label} ({selectedIds.length} selected)
            </label>
          )}
          {hint && (
            <span className="text-[11px]" style={{ color: "var(--adm-text-3)" }}>
              {hint}
            </span>
          )}
        </div>
      )}

      {/* Category Breakdown Counters & Clear All */}
      <div
        className="flex flex-wrap items-center justify-between gap-2 border px-3 py-2 text-xs"
        style={{
          borderColor: "var(--adm-border)",
          background: "var(--adm-surface-2)",
        }}
      >
        <div className="flex flex-wrap items-center gap-1.5 font-mono text-[11px]">
          <span className="font-semibold text-adm-text">Selected:</span>
          <span
            className="inline-flex items-center gap-1 px-1.5 py-0.5"
            style={{
              background: CATEGORY_CONFIG.employees.bgBadge,
              border: `1px solid ${CATEGORY_CONFIG.employees.borderBadge}`,
              color: CATEGORY_CONFIG.employees.color,
            }}
          >
            {selectedCounts.employees} Employees
          </span>
          <span
            className="inline-flex items-center gap-1 px-1.5 py-0.5"
            style={{
              background: CATEGORY_CONFIG.admins.bgBadge,
              border: `1px solid ${CATEGORY_CONFIG.admins.borderBadge}`,
              color: CATEGORY_CONFIG.admins.color,
            }}
          >
            {selectedCounts.admins} Admins
          </span>
          <span
            className="inline-flex items-center gap-1 px-1.5 py-0.5"
            style={{
              background: CATEGORY_CONFIG.execs.bgBadge,
              border: `1px solid ${CATEGORY_CONFIG.execs.borderBadge}`,
              color: CATEGORY_CONFIG.execs.color,
            }}
          >
            {selectedCounts.execs} Execs
          </span>
          <span
            className="inline-flex items-center gap-1 px-1.5 py-0.5"
            style={{
              background: CATEGORY_CONFIG.clients.bgBadge,
              border: `1px solid ${CATEGORY_CONFIG.clients.borderBadge}`,
              color: CATEGORY_CONFIG.clients.color,
            }}
          >
            {selectedCounts.clients} Clients
          </span>
        </div>

        {selectedIds.length > 0 && (
          <button
            type="button"
            onClick={handleClearAll}
            className="text-[11px] font-semibold text-red-500 hover:text-red-600 transition cursor-pointer"
          >
            Clear All
          </button>
        )}
      </div>

      {/* Selected Chips Roster */}
      {selectedIds.length > 0 && (
        <div
          className="flex flex-wrap gap-1.5 border p-2 max-h-24 overflow-y-auto"
          style={{
            borderColor: "var(--adm-border)",
            background: "var(--adm-surface)",
          }}
        >
          {selectedUsers.map((u) => {
            const cat = getUserCategory(u);
            const cfg = CATEGORY_CONFIG[cat];
            return (
              <span
                key={u.id}
                className="inline-flex items-center gap-1.5 px-2 py-0.5 text-xs font-medium border"
                style={{
                  background: cfg.bgBadge,
                  borderColor: cfg.borderBadge,
                  color: "var(--adm-text)",
                }}
              >
                <span
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ background: cfg.color }}
                />
                <span className="font-semibold text-[11px]">{u.name}</span>
                <span
                  className="font-mono text-[9px] uppercase tracking-wider px-1 py-0.2"
                  style={{ color: cfg.color }}
                >
                  {cfg.singular}
                </span>
                <button
                  type="button"
                  onClick={() => onToggle(u.id)}
                  className="ml-0.5 hover:opacity-75 transition cursor-pointer"
                  style={{ color: "var(--adm-text-3)" }}
                  title="Remove"
                >
                  <X size={12} />
                </button>
              </span>
            );
          })}
        </div>
      )}

      {/* Category Tabs */}
      <div
        className="flex flex-wrap border-b text-xs font-medium"
        style={{ borderColor: "var(--adm-border)" }}
      >
        <button
          type="button"
          onClick={() => setActiveTab("employees")}
          className={`flex items-center gap-1.5 px-3 py-2 border-b-2 font-bold uppercase tracking-wider text-[11px] transition cursor-pointer ${
            activeTab === "employees"
              ? "border-adm-blue text-adm-blue bg-adm-surface-2"
              : "border-transparent text-adm-text-3 hover:text-adm-text hover:bg-adm-surface-2"
          }`}
        >
          <Users size={13} />
          <span>Employees</span>
          <span className="ml-1 rounded-full px-1.5 py-0.2 font-mono text-[10px] bg-adm-surface border border-adm-border text-adm-text-2">
            {categorized.employees.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("admins")}
          className={`flex items-center gap-1.5 px-3 py-2 border-b-2 font-bold uppercase tracking-wider text-[11px] transition cursor-pointer ${
            activeTab === "admins"
              ? "border-purple-600 text-purple-600 bg-adm-surface-2"
              : "border-transparent text-adm-text-3 hover:text-adm-text hover:bg-adm-surface-2"
          }`}
        >
          <ShieldCheck size={13} />
          <span>Admins</span>
          <span className="ml-1 rounded-full px-1.5 py-0.2 font-mono text-[10px] bg-adm-surface border border-adm-border text-adm-text-2">
            {categorized.admins.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("execs")}
          className={`flex items-center gap-1.5 px-3 py-2 border-b-2 font-bold uppercase tracking-wider text-[11px] transition cursor-pointer ${
            activeTab === "execs"
              ? "border-amber-600 text-amber-600 bg-adm-surface-2"
              : "border-transparent text-adm-text-3 hover:text-adm-text hover:bg-adm-surface-2"
          }`}
        >
          <Crown size={13} />
          <span>Execs & Leads</span>
          <span className="ml-1 rounded-full px-1.5 py-0.2 font-mono text-[10px] bg-adm-surface border border-adm-border text-adm-text-2">
            {categorized.execs.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("clients")}
          className={`flex items-center gap-1.5 px-3 py-2 border-b-2 font-bold uppercase tracking-wider text-[11px] transition cursor-pointer ${
            activeTab === "clients"
              ? "border-emerald-600 text-emerald-600 bg-adm-surface-2"
              : "border-transparent text-adm-text-3 hover:text-adm-text hover:bg-adm-surface-2"
          }`}
        >
          <Briefcase size={13} />
          <span>Clients</span>
          <span className="ml-1 rounded-full px-1.5 py-0.2 font-mono text-[10px] bg-adm-surface border border-adm-border text-adm-text-2">
            {categorized.clients.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("all")}
          className={`flex items-center gap-1.5 px-3 py-2 border-b-2 font-bold uppercase tracking-wider text-[11px] transition cursor-pointer ${
            activeTab === "all"
              ? "border-adm-text text-adm-text bg-adm-surface-2"
              : "border-transparent text-adm-text-3 hover:text-adm-text hover:bg-adm-surface-2"
          }`}
        >
          <UserCheck size={13} />
          <span>All ({users.length})</span>
        </button>
      </div>

      {/* Tab Filter & Batch Actions */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-adm-text-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={`Filter ${
              activeTab === "all"
                ? "all users"
                : activeTab === "execs"
                ? "executives & leads"
                : activeTab
            }...`}
            className="w-full pl-8 pr-7 py-1.5 text-xs bg-adm-surface border border-adm-border text-adm-text placeholder:text-adm-text-3 focus:border-adm-blue focus:outline-none"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-adm-text-3 hover:text-adm-text cursor-pointer"
            >
              <X size={12} />
            </button>
          )}
        </div>

        {filteredUsers.length > 0 && (
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={allFilteredSelected ? handleDeselectAllFiltered : handleSelectAllFiltered}
              className="border border-adm-border px-2.5 py-1 text-[11px] font-semibold transition hover:bg-adm-surface-2 text-adm-text cursor-pointer"
            >
              {allFilteredSelected
                ? `Deselect All ${activeTab !== "all" ? `in ${activeTab}` : ""}`
                : `Select All ${activeTab !== "all" ? `in ${activeTab}` : ""}`}
            </button>
            <span className="font-mono text-[10px] text-adm-text-3 uppercase">
              {filteredUsers.length} listed
            </span>
          </div>
        )}
      </div>

      {/* User Checklist */}
      <div
        className={`${maxListHeight} space-y-0.5 overflow-y-auto border p-1`}
        style={{
          borderColor: "var(--adm-border)",
          background: "var(--adm-surface)",
        }}
      >
        {filteredUsers.length === 0 ? (
          <div className="p-4 text-center text-xs" style={{ color: "var(--adm-text-3)" }}>
            {search
              ? `No matching ${activeTab} found for "${search}".`
              : `No users configured under ${activeTab}.`}
          </div>
        ) : (
          filteredUsers.map((user) => {
            const isChecked = selectedIds.includes(user.id);
            const cat = getUserCategory(user);
            const cfg = CATEGORY_CONFIG[cat];

            return (
              <label
                key={user.id}
                onClick={() => onToggle(user.id)}
                className="flex cursor-pointer items-center justify-between p-2 text-xs transition hover:bg-adm-surface-2"
                style={{
                  background: isChecked ? "var(--adm-surface-2)" : "transparent",
                  color: "var(--adm-text)",
                  borderLeft: isChecked ? `3px solid ${cfg.color}` : "3px solid transparent",
                }}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <div
                    className="flex h-4 w-4 shrink-0 items-center justify-center border"
                    style={{
                      borderColor: isChecked ? cfg.color : "var(--adm-border)",
                      background: isChecked ? cfg.color : "transparent",
                      color: "white",
                    }}
                  >
                    {isChecked && <Check size={12} />}
                  </div>

                  {/* Initials badge */}
                  <div
                    className="flex h-6 w-6 shrink-0 items-center justify-center text-[10px] font-bold font-mono uppercase"
                    style={{
                      background: cfg.bgBadge,
                      color: cfg.color,
                      border: `1px solid ${cfg.borderBadge}`,
                    }}
                  >
                    {user.name.charAt(0)}
                  </div>

                  <div className="truncate flex flex-col">
                    <span className="truncate font-semibold text-xs text-adm-text">
                      {user.name}
                    </span>
                    <span className="font-mono text-[10px] text-adm-text-3 truncate">
                      {user.email}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0 pl-2">
                  <span
                    className="px-1.5 py-0.5 font-mono text-[10px] uppercase font-semibold"
                    style={{
                      background: cfg.bgBadge,
                      color: cfg.color,
                      border: `1px solid ${cfg.borderBadge}`,
                    }}
                  >
                    {user.roleName || cfg.singular}
                  </span>
                  {user.teamName && (
                    <span
                      className="px-1.5 py-0.5 font-mono text-[10px] hidden sm:inline-block"
                      style={{
                        background: "var(--adm-surface)",
                        color: "var(--adm-text-3)",
                        border: "1px solid var(--adm-border)",
                      }}
                    >
                      {user.teamName}
                    </span>
                  )}
                </div>
              </label>
            );
          })
        )}
      </div>
    </div>
  );
}
