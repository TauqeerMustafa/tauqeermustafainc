"use client";

import Link from "next/link";
import { CheckSquare, FolderKanban, type LucideIcon } from "lucide-react";

import { useAdminDashboard } from "@/hooks/useDashboard";
import { useI18n } from "@/lib/i18n";

export type DeliveryFunctionId = "projects" | "tasks";

interface DeliveryBannerProps {
  active?: DeliveryFunctionId;
  compact?: boolean;
}

interface FunctionItem {
  id: DeliveryFunctionId;
  label: string;
  shortLabel: string;
  href: string;
  icon: LucideIcon;
  countKey?: "projects" | "tasks";
}

const DELIVERY_FUNCTIONS: FunctionItem[] = [
  {
    id: "projects",
    label: "Projects Delivery Hub",
    shortLabel: "Projects Hub",
    href: "/admin/projects",
    icon: FolderKanban,
    countKey: "projects",
  },
  {
    id: "tasks",
    label: "Tasks Kanban Board",
    shortLabel: "Tasks Board",
    href: "/admin/tasks",
    icon: CheckSquare,
    countKey: "tasks",
  },
];

export default function DeliveryBanner({
  active = "projects",
  compact = false,
}: DeliveryBannerProps) {
  const { t } = useI18n();
  const { data } = useAdminDashboard();

  const projects = data?.projects ?? [];
  const tasks = data?.tasks ?? [];
  const openTasks = tasks.filter((task) => task.status !== "done").length;

  const counts: Record<string, number> = {
    projects: projects.length,
    tasks: openTasks,
  };

  return (
    <div className="flex flex-col gap-3 border-b border-adm-border pb-4">
      <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
        {/* Department indicator */}
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-adm-blue shrink-0" />
          <span className="text-xs font-semibold uppercase tracking-wider text-adm-text">
            {t("Delivery & Tasks")}
          </span>
          {openTasks > 0 && (
            <span className="rounded-full border border-adm-blue/30 bg-adm-blue-light px-2 py-0.5 text-[11px] font-medium text-adm-blue tabular-nums">
              {openTasks} {t("open tasks")}
            </span>
          )}
        </div>

        {/* Function pills */}
        <nav aria-label={t("Delivery functions")} className="flex flex-wrap items-center gap-1.5">
          {DELIVERY_FUNCTIONS.map((item) => {
            const Icon = item.icon;
            const isActive = active === item.id;
            const count = item.countKey ? counts[item.countKey] : undefined;

            return (
              <Link
                key={item.id}
                href={item.href}
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition active:scale-95 ${
                  isActive
                    ? "bg-adm-blue text-white font-semibold"
                    : "border border-adm-border bg-adm-surface text-adm-text-2 hover:border-adm-border-2 hover:bg-adm-surface-2 hover:text-adm-text"
                }`}
              >
                <Icon size={13} className={isActive ? "text-white" : "text-adm-text-3"} />
                <span>{t(item.shortLabel)}</span>
                {typeof count === "number" && count > 0 && (
                  <span
                    className={`inline-flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-medium tabular-nums ${
                      isActive
                        ? "bg-white/20 text-white"
                        : "border border-adm-border bg-adm-surface-2 text-adm-text-3"
                    }`}
                  >
                    {count}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
