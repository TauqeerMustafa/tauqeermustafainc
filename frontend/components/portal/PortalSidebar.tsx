"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard,
  Users,
  ShieldCheck,
  CalendarCheck,
  CalendarOff,
  CheckSquare,
  Briefcase,
  FolderOpen,
  FileText,
  Bell,
  Mail,
  MessageSquare,
  Settings,
  X,
  ChevronRight,
  ClipboardList
} from "lucide-react";
import { useCurrentUser } from "@/hooks/useAuth";

type Props = { isOpen: boolean; onClose: () => void };

export default function PortalSidebar({ isOpen, onClose }: Props) {
  const pathname = usePathname();
  const { data } = useCurrentUser();
  const user = data?.data;
  const role = user?.role || "EMPLOYEE"; // Fallback to EMPLOYEE

  const isAdmin = role === "SUPER_ADMIN" || role === "ADMIN";

  // Build the navigation links dynamically based on role
  let links: any[] = [];

  if (isAdmin) {
    links = [
      { title: "Dashboard",       href: "/admin/dashboard",   icon: LayoutDashboard },
      { title: "Employees",       href: "/admin/employees",   icon: Users },
      { title: "Roles & Perms",   href: "/admin/roles",       icon: ShieldCheck },
      { title: "Attendance",      href: "/admin/attendance",  icon: CalendarCheck },
      { title: "Leave Requests",  href: "/admin/leave",       icon: CalendarOff },
      { title: "Tasks",           href: "/admin/tasks",       icon: CheckSquare },
      { title: "Projects",        href: "/admin/projects",    icon: FolderOpen },
      { title: "Documents",       href: "/admin/documents",   icon: FileText },
      { title: "Announcements",   href: "/admin/announcements",icon: Bell },
      { title: "Settings",        href: "/admin/settings",    icon: Settings },
    ];
  } else {
    links = [
      { title: "Dashboard",       href: "/employees/dashboard",icon: LayoutDashboard },
      { title: "My Profile",      href: "/employees/profile",  icon: Users },
      { title: "Attendance",      href: "/employees/attendance",icon: CalendarCheck },
      { title: "Leave",           href: "/employees/leave",    icon: CalendarOff },
      { title: "Tasks",           href: "/employees/tasks",    icon: CheckSquare },
      { title: "Projects",        href: "/employees/projects", icon: FolderOpen },
      { title: "Documents",       href: "/employees/documents",icon: FileText },
      { title: "Announcements",   href: "/employees/announcements",icon: Bell },
      { title: "Email",           href: "/employees/email",    icon: Mail },
      { title: "Settings",        href: "/employees/settings", icon: Settings },
    ];
  }

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm transition-opacity lg:hidden"
          aria-hidden="true"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] lg:static lg:z-auto lg:translate-x-0 ${
          isOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"
        }`}
        style={{ borderColor: "var(--adm-border)", background: "var(--adm-surface)" }}
      >
        {/* BMW M signature stripe */}
        <div className="m-stripe" />

        {/* Brand */}
        <div
          className="flex items-center justify-between px-5 py-5 border-b"
          style={{ borderColor: "var(--adm-border)" }}
        >
          <Link
            href={isAdmin ? "/admin/dashboard" : "/dashboard"}
            className="inline-flex items-center gap-2.5 group"
            onClick={onClose}
          >
            <span
              className="relative flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden border transition group-hover:border-[color:var(--adm-border-2)]"
              style={{ borderColor: "var(--adm-border)" }}
            >
              <Image
                src="/logo-mark.svg"
                alt=""
                fill
                sizes="32px"
                className="object-cover"
              />
            </span>
            <div>
              <p className="text-sm font-semibold leading-tight" style={{ color: "var(--adm-text)" }}>
                TM INC
              </p>
              <p className="text-[10px] font-mono uppercase tracking-widest" style={{ color: "var(--adm-blue)" }}>
                {isAdmin ? "Admin Portal" : "Employee Portal"}
              </p>
            </div>
          </Link>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            className="flex h-8 w-8 items-center justify-center border transition hover:bg-[var(--adm-surface-2)] lg:hidden"
            style={{ borderColor: "var(--adm-border)", color: "var(--adm-text-2)" }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <p
            className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-widest"
            style={{ color: "var(--adm-text-3)" }}
          >
            Navigation
          </p>

          {links.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href || pathname.startsWith(item.href + "/");

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`adm-nav-link mb-0.5 flex items-center gap-3 rounded-none px-4 py-2.5 text-[15px] font-medium transition-all ${
                  active ? "active" : ""
                }`}
                style={
                  active
                    ? {
                        background: "var(--adm-blue-light)",
                        color: "var(--adm-blue)",
                      }
                    : { color: "var(--adm-text-2)" }
                }
              >
                <Icon
                  size={17}
                  className="shrink-0 transition-transform duration-200"
                  style={{ color: active ? "var(--adm-blue)" : "var(--adm-text-3)" }}
                />
                <span className="flex-1">{item.title}</span>
                {active && (
                  <ChevronRight size={14} style={{ color: "var(--adm-blue)" }} />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div
          className="border-t px-5 py-4"
          style={{ borderColor: "var(--adm-border)", background: "var(--adm-surface-2)" }}
        >
          <p className="text-[11px]" style={{ color: "var(--adm-text-3)" }}>
            Tauqeer Mustafa Inc. &copy; {new Date().getFullYear()}
          </p>
        </div>
      </aside>
    </>
  );
}
