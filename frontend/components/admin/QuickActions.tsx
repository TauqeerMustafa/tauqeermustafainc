import Link from "next/link";
import { Plus, FileText, Briefcase, FolderOpen, Bell, Users, ShieldCheck } from "lucide-react";

const actions = [
  { title: "New Blog Post",    href: "/admin/blog",          icon: FileText,  color: "blue" },
  { title: "Add Service",      href: "/admin/services",      icon: Briefcase, color: "green" },
  { title: "New Portfolio",    href: "/admin/portfolio",     icon: FolderOpen,color: "amber" },
  { title: "Announcement",     href: "/admin/announcements", icon: Bell,      color: "red" },
  { title: "View Messages",    href: "/admin/messages",      icon: Users,       color: "blue" },
  { title: "Manage Users",    href: "/admin/users",          icon: ShieldCheck, color: "green" },
];

const iconColors: Record<string, { bg: string; icon: string; border: string }> = {
  blue:  { bg: "var(--adm-blue-light)",  icon: "var(--adm-blue)",  border: "var(--adm-blue-mid)" },
  green: { bg: "var(--adm-green-light)", icon: "var(--adm-green)", border: "#A7F3D0" },
  amber: { bg: "var(--adm-amber-light)", icon: "var(--adm-amber)", border: "#FDE68A" },
  red:   { bg: "var(--adm-red-light)",   icon: "var(--adm-red)",   border: "#FECACA" },
};

export default function QuickActions() {
  return (
    <section
      className="border p-5"
      style={{ background: "var(--adm-surface)", borderColor: "var(--adm-border)" }}
    >
      <div className="mb-4 flex items-center gap-2">
        <Plus size={18} style={{ color: "var(--adm-blue)" }} />
        <h2 className="text-base font-bold" style={{ color: "var(--adm-text)" }}>
          Quick Actions
        </h2>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {actions.map((action) => {
          const Icon = action.icon;
          const c = iconColors[action.color];

          return (
            <Link
              key={action.title}
              href={action.href}
              className="adm-card group flex items-center gap-3 p-3.5 transition-all"
            >
              <div
                className="flex h-8 w-8 shrink-0 items-center justify-center border transition-transform duration-200 group-hover:scale-110"
                style={{ background: c.bg, borderColor: c.border, color: c.icon }}
              >
                <Icon size={16} />
              </div>
              <span className="text-sm font-medium transition-colors" style={{ color: "var(--adm-text)" }}>
                {action.title}
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
