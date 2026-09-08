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
    <div className="relative overflow-hidden rounded-[18px] border border-adm-border bg-adm-surface p-5 sm:p-6">
      <div className="flex flex-col gap-5">
        {/* Top title & summary section */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full border border-adm-border bg-adm-surface-2 px-3 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-adm-text-3">
              <span className="h-1.5 w-1.5 rounded-full bg-adm-blue shrink-0" />
              <span>{t("Delivery & Execution")}</span>
            </div>
            <h2 className="mt-2 text-xl font-semibold tracking-tight text-adm-text sm:text-2xl">
              {t("Projects & Task Delivery")}
            </h2>
            {!compact && (
              <p className="mt-1 max-w-2xl text-xs font-normal leading-relaxed text-adm-text-3 sm:text-sm">
                {t(
                  "Monitor client milestone delivery, sprint backlog, 4-stage Kanban boards, and project lifecycle.",
                )}
              </p>
            )}
          </div>

          {/* Real-time pulse stats */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
            <div className="flex items-center gap-2 rounded-full border border-adm-border bg-adm-surface-2 px-3 py-1 text-xs">
              <span className="h-1.5 w-1.5 rounded-full bg-adm-blue" />
              <span className="text-adm-text-3">{t("Active Projects:")}</span>
              <span className="font-semibold text-adm-text tabular-nums">
                {projects.length}
              </span>
            </div>
            {openTasks > 0 ? (
              <div className="flex items-center gap-2 rounded-full border border-adm-blue/30 bg-adm-blue-light px-3 py-1 text-xs">
                <span className="h-1.5 w-1.5 rounded-full bg-adm-blue" />
                <span className="font-semibold text-adm-blue">
                  {openTasks} {t("open tasks")}
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-2 rounded-full border border-adm-green/30 bg-adm-green-light px-3 py-1 text-xs">
                <span className="h-1.5 w-1.5 rounded-full bg-adm-green" />
                <span className="font-semibold text-adm-green">{t("All tasks completed")}</span>
              </div>
            )}
          </div>
        </div>

        {/* Function navigation capsules */}
        <div className="border-t border-adm-border pt-4">
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-adm-text-3">
            {t("Delivery Functions")}
          </p>
          <nav aria-label={t("Delivery functions")} className="flex flex-wrap items-center gap-2">
            {DELIVERY_FUNCTIONS.map((item) => {
              const Icon = item.icon;
              const isActive = active === item.id;
              const count = item.countKey ? counts[item.countKey] : undefined;

              return (
                <Link
                  key={item.id}
                  href={item.href}
                  className={`inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-medium transition-all active:scale-95 ${
                    isActive
                      ? "bg-adm-blue text-white font-semibold"
                      : "border border-adm-border bg-adm-surface text-adm-text-2 hover:border-adm-border-2 hover:bg-adm-surface-2 hover:text-adm-text"
                  }`}
                >
                  <Icon
                    size={14}
                    className={`shrink-0 ${isActive ? "text-white" : "text-adm-text-3"}`}
                  />
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
    </div>
  );
}
