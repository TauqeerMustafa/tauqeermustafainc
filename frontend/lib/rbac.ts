/**
 * Canonical role + permission vocabulary for every portal.
 *
 * The backend is the single source of truth: `/auth/me` returns a lowercase
 * role slug (see backend/app/api/routes/auth.py `_to_user_read`) plus the flat
 * list of permission slugs granted through that role
 * (backend/app/core/rbac.py `get_user_permissions`).
 *
 * Before this module existed, four different files each invented their own
 * definition of "admin" — including two that compared against uppercase
 * strings the API never emits, so admins were silently treated as employees.
 * Every access decision in the frontend now routes through here.
 */

// ── Role slugs — must mirror backend/app/core/rbac.py + the migration seed ────
export const ROLE = {
  ADMIN: "admin",
  TEAM_LEAD: "team_lead",
  EXEC: "exec",
  MEMBER: "member",
  CLIENT: "client",
} as const;

export type RoleSlug = (typeof ROLE)[keyof typeof ROLE];

// ── Permission slugs — must mirror backend/app/core/rbac.py ───────────────────
export const PERMISSION = {
  LEADS_READ_OWN: "leads.read.own",
  LEADS_READ_TEAM: "leads.read.team",
  LEADS_READ_ALL: "leads.read.all",
  LEADS_CREATE: "leads.create",
  LEADS_UPDATE_OWN: "leads.update.own",
  LEADS_UPDATE_TEAM: "leads.update.team",
  LEADS_UPDATE_ALL: "leads.update.all",
  LEADS_DELETE_OWN: "leads.delete.own",
  LEADS_DELETE_ALL: "leads.delete.all",
  LEADS_EXPORT_OWN: "leads.export.own",
  LEADS_EXPORT_TEAM: "leads.export.team",
  LEADS_EXPORT_ALL: "leads.export.all",
  USERS_APPROVE: "users.approve",
  USERS_MANAGE: "users.manage",
  TEAMS_MANAGE: "teams.manage",
  ROLES_MANAGE: "roles.manage",
} as const;

export type PermissionSlug = (typeof PERMISSION)[keyof typeof PERMISSION];

// ── Portals ───────────────────────────────────────────────────────────────────
export const PORTAL = {
  ADMIN: "admin",
  EMPLOYEES: "employees",
  CLIENT: "client",
  MANAGEMENT: "management",
} as const;

export type PortalId = (typeof PORTAL)[keyof typeof PORTAL];

/**
 * Which roles may enter which portal. `admin` is deliberately allowed
 * everywhere staff-facing so a single operator can support all of them.
 */
const PORTAL_ACCESS: Record<PortalId, readonly RoleSlug[]> = {
  [PORTAL.ADMIN]: [ROLE.ADMIN],
  [PORTAL.MANAGEMENT]: [ROLE.ADMIN, ROLE.EXEC, ROLE.TEAM_LEAD],
  [PORTAL.EMPLOYEES]: [ROLE.ADMIN, ROLE.EXEC, ROLE.TEAM_LEAD, ROLE.MEMBER],
  [PORTAL.CLIENT]: [ROLE.CLIENT],
};

/** Where each portal sends an unauthenticated visitor. */
export const PORTAL_LOGIN_PATH: Record<PortalId, string> = {
  [PORTAL.ADMIN]: "/admin/login",
  [PORTAL.EMPLOYEES]: "/employees/login",
  [PORTAL.CLIENT]: "/client/login",
  [PORTAL.MANAGEMENT]: "/management/login",
};

/** Landing route once a session is confirmed. */
export const PORTAL_HOME_PATH: Record<PortalId, string> = {
  [PORTAL.ADMIN]: "/admin/dashboard",
  [PORTAL.EMPLOYEES]: "/employees/dashboard",
  [PORTAL.CLIENT]: "/client/dashboard",
  [PORTAL.MANAGEMENT]: "/management/dashboard",
};

export const PORTAL_LABEL: Record<PortalId, string> = {
  [PORTAL.ADMIN]: "Admin",
  [PORTAL.EMPLOYEES]: "Employee",
  [PORTAL.CLIENT]: "Client",
  [PORTAL.MANAGEMENT]: "Management",
};

/** One-line pitch for each portal, shown on the `/portals` chooser. */
export const PORTAL_DESCRIPTION: Record<PortalId, string> = {
  [PORTAL.ADMIN]: "Run the company: people, projects, documents, and configuration.",
  [PORTAL.MANAGEMENT]: "Executive signals — attendance, delivery, and pipeline at a glance.",
  [PORTAL.EMPLOYEES]: "Your day: attendance, leave, tasks, and team resources.",
  [PORTAL.CLIENT]: "Your private workspace — project progress and a direct line to the team.",
};

/** Who each portal is for, phrased for a visitor deciding where to sign in. */
export const PORTAL_ROLES_HINT: Record<PortalId, string> = {
  [PORTAL.ADMIN]: "Administrators",
  [PORTAL.MANAGEMENT]: "Executives & team leads",
  [PORTAL.EMPLOYEES]: "All staff",
  [PORTAL.CLIENT]: "Clients",
};

/** Display order for the chooser — staff portals first, clients last. */
export const PORTAL_CHOOSER: readonly PortalId[] = [
  PORTAL.ADMIN,
  PORTAL.MANAGEMENT,
  PORTAL.EMPLOYEES,
  PORTAL.CLIENT,
];

/** Human-readable role name for badges and profile headers. */
export const ROLE_LABEL: Record<string, string> = {
  [ROLE.ADMIN]: "Administrator",
  [ROLE.TEAM_LEAD]: "Team Lead",
  [ROLE.EXEC]: "Executive",
  [ROLE.MEMBER]: "Employee",
  [ROLE.CLIENT]: "Client",
};

/**
 * Normalize whatever the API (or a stale cache) hands us into a known slug.
 * Tolerates the legacy uppercase spellings that used to be hard-coded in the
 * UI so an old cached session degrades gracefully instead of locking someone
 * out of their own portal.
 */
export function normalizeRole(raw: string | null | undefined): RoleSlug | null {
  if (!raw) return null;
  const slug = raw.trim().toLowerCase();
  if (slug === "super_admin" || slug === "superadmin") return ROLE.ADMIN;
  if (slug === "employee" || slug === "staff") return ROLE.MEMBER;
  return (Object.values(ROLE) as string[]).includes(slug) ? (slug as RoleSlug) : null;
}

export function roleLabel(raw: string | null | undefined): string {
  const slug = normalizeRole(raw);
  return slug ? ROLE_LABEL[slug] : "Member";
}

/** True when the role is internal (anything other than an external client). */
export function isStaffRole(raw: string | null | undefined): boolean {
  const slug = normalizeRole(raw);
  return slug !== null && slug !== ROLE.CLIENT;
}

export function isAdminRole(raw: string | null | undefined): boolean {
  return normalizeRole(raw) === ROLE.ADMIN;
}

export function canAccessPortal(raw: string | null | undefined, portal: PortalId): boolean {
  const slug = normalizeRole(raw);
  return slug !== null && PORTAL_ACCESS[portal].includes(slug);
}

/** Every portal this role may enter, in menu order. */
export function portalsForRole(raw: string | null | undefined): PortalId[] {
  const slug = normalizeRole(raw);
  if (!slug) return [];
  return (Object.keys(PORTAL_ACCESS) as PortalId[]).filter((p) =>
    PORTAL_ACCESS[p].includes(slug),
  );
}

/**
 * Permission check. Admins are granted everything implicitly: the backend
 * treats `is_superuser` as a bypass in `get_current_admin`, and the UI must
 * agree or an admin would see a menu that doesn't match what the API allows.
 */
export function can(
  user: { role?: string | null; permissions?: string[] | null } | null | undefined,
  ...needed: string[]
): boolean {
  if (!user) return false;
  if (isAdminRole(user.role)) return true;
  if (needed.length === 0) return true;
  const granted = user.permissions ?? [];
  return needed.some((slug) => granted.includes(slug));
}

/** Widest scope held in a `<base>.{all,team,own}` family — mirrors `scope_for`. */
export function scopeFor(
  user: { role?: string | null; permissions?: string[] | null } | null | undefined,
  base: string,
): "all" | "team" | "own" | null {
  if (!user) return null;
  if (isAdminRole(user.role)) return "all";
  const granted = user.permissions ?? [];
  if (granted.includes(`${base}.all`)) return "all";
  if (granted.includes(`${base}.team`)) return "team";
  if (granted.includes(`${base}.own`)) return "own";
  return null;
}

/** Which portal a pathname belongs to, or null for public routes. */
export function portalFromPathname(pathname: string): PortalId | null {
  if (pathname.startsWith("/admin")) return PORTAL.ADMIN;
  if (pathname.startsWith("/employees")) return PORTAL.EMPLOYEES;
  if (pathname.startsWith("/management")) return PORTAL.MANAGEMENT;
  if (pathname.startsWith("/client")) return PORTAL.CLIENT;
  return null;
}
