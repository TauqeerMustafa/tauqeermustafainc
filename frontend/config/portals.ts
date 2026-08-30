/**
 * The single source of truth for portal navigation.
 *
 * Every sidebar, breadcrumb, and portal-switcher reads this file. Previously
 * each portal hard-coded its own link list inside the sidebar component, which
 * is how 12 shipped admin routes ended up unreachable and two menu entries
 * pointed at routes that never existed.
 *
 * `permission` gates an item on a slug from `/auth/me`; `roles` narrows it to
 * specific role slugs. Omit both and the item is visible to anyone who can
 * enter the portal. Admins bypass permission gates (see `can` in lib/rbac).
 */
import {
  BarChart3,
  Bell,
  Briefcase,
  Building2,
  CalendarDays,
  CheckSquare,
  Clock,
  FileText,
  FolderKanban,
  GraduationCap,
  Globe,
  Image as ImageIcon,
  LayoutDashboard,
  Mail,
  MessageCircle,
  MessagesSquare,
  Newspaper,
  Settings,
  Shield,
  Target,
  User,
  Users,
  Wrench,
  type LucideIcon,
} from "lucide-react";

import { PERMISSION, PORTAL, ROLE, type PortalId, type RoleSlug } from "@/lib/rbac";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  /** Visible when the user holds ANY of these permission slugs. */
  permission?: string[];
  /** Visible only to these role slugs. */
  roles?: readonly RoleSlug[];
  /** Extra prefixes that should light this item up as active. */
  matches?: string[];
}

export interface NavSection {
  /** Section heading; omit for the leading, unlabelled group. */
  title?: string;
  items: NavItem[];
}

export const PORTAL_NAV: Record<PortalId, NavSection[]> = {
  // ── Admin: run the company ─────────────────────────────────────────────────
  [PORTAL.ADMIN]: [
    {
      items: [{ label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard }],
    },
    {
      title: "People",
      items: [
        {
          label: "Employees",
          href: "/admin/employees",
          icon: Users,
          matches: ["/admin/employees"],
        },
        { label: "Attendance", href: "/admin/attendance", icon: Clock },
        { label: "Leave Requests", href: "/admin/leave", icon: CalendarDays },
        { label: "Documents", href: "/admin/documents", icon: FileText },
        { label: "Announcements", href: "/admin/announcements", icon: Bell },
      ],
    },
    {
      title: "Delivery",
      items: [
        { label: "Projects", href: "/admin/projects", icon: FolderKanban },
        { label: "Tasks", href: "/admin/tasks", icon: CheckSquare },
      ],
    },
    {
      title: "Revenue",
      items: [
        {
          label: "Clients & Leads",
          href: "/admin/client",
          icon: Briefcase,
          permission: [
            PERMISSION.LEADS_READ_OWN,
            PERMISSION.LEADS_READ_TEAM,
            PERMISSION.LEADS_READ_ALL,
          ],
        },
      ],
    },
    {
      title: "Inbox",
      items: [
        { label: "Contact Messages", href: "/admin/messages", icon: MessagesSquare },
        { label: "Webmail", href: "/admin/mail", icon: Mail },
        { label: "WhatsApp", href: "/admin/whatsapp", icon: MessageCircle },
      ],
    },
    {
      title: "Website",
      items: [
        { label: "Blog", href: "/admin/blog", icon: Newspaper },
        { label: "Portfolio", href: "/admin/portfolio", icon: ImageIcon },
        { label: "Services", href: "/admin/services", icon: Wrench },
        { label: "Careers", href: "/admin/careers", icon: GraduationCap },
        { label: "Community", href: "/admin/community", icon: Globe },
      ],
    },
    {
      title: "Access Control",
      items: [
        {
          label: "Users",
          href: "/admin/users",
          icon: Users,
          permission: [PERMISSION.USERS_MANAGE, PERMISSION.USERS_APPROVE],
        },
        {
          label: "Roles & Permissions",
          href: "/admin/roles",
          icon: Shield,
          permission: [PERMISSION.ROLES_MANAGE],
        },
      ],
    },
    {
      title: "Account",
      items: [{ label: "Settings", href: "/admin/settings", icon: Settings }],
    },
  ],

  // ── Employees: self-service ────────────────────────────────────────────────
  [PORTAL.EMPLOYEES]: [
    {
      items: [{ label: "Dashboard", href: "/employees/dashboard", icon: LayoutDashboard }],
    },
    {
      title: "My Work",
      items: [
        { label: "Tasks", href: "/employees/tasks", icon: CheckSquare },
        { label: "Projects", href: "/employees/projects", icon: FolderKanban },
        { label: "Messages", href: "/employees/messages", icon: MessagesSquare },
      ],
    },
    {
      title: "Time & Leave",
      items: [
        { label: "Attendance", href: "/employees/attendance", icon: Clock },
        { label: "Leave", href: "/employees/leave", icon: CalendarDays },
      ],
    },
    {
      title: "Company",
      items: [
        { label: "Announcements", href: "/employees/announcements", icon: Bell },
        { label: "Documents", href: "/employees/documents", icon: FileText },
      ],
    },
    {
      title: "Account",
      items: [
        { label: "My Profile", href: "/employees/profile", icon: User },
        { label: "Settings", href: "/employees/settings", icon: Settings },
      ],
    },
  ],

  // ── Management: leadership reporting ───────────────────────────────────────
  [PORTAL.MANAGEMENT]: [
    {
      items: [{ label: "Overview", href: "/management/dashboard", icon: LayoutDashboard }],
    },
    {
      title: "Performance",
      items: [
        { label: "Headcount", href: "/management/headcount", icon: Users },
        { label: "Attendance", href: "/management/attendance", icon: Clock },
        { label: "Delivery", href: "/management/delivery", icon: FolderKanban },
      ],
    },
    {
      title: "Growth",
      items: [
        {
          label: "Pipeline",
          href: "/management/pipeline",
          icon: BarChart3,
          permission: [PERMISSION.LEADS_READ_TEAM, PERMISSION.LEADS_READ_ALL],
        },
        { label: "Objectives", href: "/management/objectives", icon: Target },
      ],
    },
    {
      title: "Account",
      items: [{ label: "Settings", href: "/management/settings", icon: Settings }],
    },
  ],

  // ── Client: external customers ─────────────────────────────────────────────
  [PORTAL.CLIENT]: [
    {
      items: [{ label: "Dashboard", href: "/client/dashboard", icon: LayoutDashboard }],
    },
    {
      title: "Engagement",
      items: [
        { label: "Projects", href: "/client/projects", icon: FolderKanban },
        { label: "Documents", href: "/client/documents", icon: FileText },
        { label: "Invoices", href: "/client/invoices", icon: Building2 },
      ],
    },
    {
      title: "Account",
      items: [{ label: "Settings", href: "/client/settings", icon: Settings }],
    },
  ],
};

/** Portals offered on the /portals chooser, in display order. */
export const PORTAL_CHOOSER: readonly PortalId[] = [
  PORTAL.CLIENT,
  PORTAL.EMPLOYEES,
  PORTAL.MANAGEMENT,
  PORTAL.ADMIN,
] as const;

export const PORTAL_DESCRIPTION: Record<PortalId, string> = {
  [PORTAL.CLIENT]: "Track your projects, approve deliverables, and access shared documents.",
  [PORTAL.EMPLOYEES]: "Check in, request leave, and pick up your assigned work.",
  [PORTAL.MANAGEMENT]: "Headcount, delivery health, and pipeline reporting for leadership.",
  [PORTAL.ADMIN]: "Full control of people, content, access, and customer communication.",
};

export const PORTAL_ROLES_HINT: Record<PortalId, string> = {
  [PORTAL.CLIENT]: "Clients",
  [PORTAL.EMPLOYEES]: "All staff",
  [PORTAL.MANAGEMENT]: "Leads & executives",
  [PORTAL.ADMIN]: "Administrators",
};

/** Roles a visitor is told to expect, used for the chooser's helper copy. */
export const PORTAL_PRIMARY_ROLE: Record<PortalId, RoleSlug> = {
  [PORTAL.CLIENT]: ROLE.CLIENT,
  [PORTAL.EMPLOYEES]: ROLE.MEMBER,
  [PORTAL.MANAGEMENT]: ROLE.EXEC,
  [PORTAL.ADMIN]: ROLE.ADMIN,
};

/** Longest-prefix active match so `/admin/employees/create` lights Employees. */
export function isNavItemActive(item: NavItem, pathname: string): boolean {
  const prefixes = item.matches ?? [item.href];
  return prefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}
