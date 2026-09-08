"use client";

import Link from "next/link";
import {
  Globe,
  GraduationCap,
  ImageIcon,
  Newspaper,
  Wrench,
  type LucideIcon,
} from "lucide-react";

import { useI18n } from "@/lib/i18n";

export type CmsFunctionId = "blog" | "portfolio" | "services" | "careers" | "community";

interface CmsBannerProps {
  active?: CmsFunctionId;
  compact?: boolean;
}

interface FunctionItem {
  id: CmsFunctionId;
  label: string;
  shortLabel: string;
  href: string;
  icon: LucideIcon;
}

const CMS_FUNCTIONS: FunctionItem[] = [
  {
    id: "blog",
    label: "Blog & Insights",
    shortLabel: "Blog",
    href: "/admin/blog",
    icon: Newspaper,
  },
  {
    id: "portfolio",
    label: "Portfolio Case Studies",
    shortLabel: "Portfolio",
    href: "/admin/portfolio",
    icon: ImageIcon,
  },
  {
    id: "services",
    label: "Services & Capabilities",
    shortLabel: "Services",
    href: "/admin/services",
    icon: Wrench,
  },
  {
    id: "careers",
    label: "Careers & Openings",
    shortLabel: "Careers",
    href: "/admin/careers",
    icon: GraduationCap,
  },
  {
    id: "community",
    label: "Community Network",
    shortLabel: "Community",
    href: "/admin/community",
    icon: Globe,
  },
];

export default function CmsBanner({
  active = "blog",
  compact = false,
}: CmsBannerProps) {
  const { t } = useI18n();

  return (
    <div className="flex flex-col gap-3 border-b border-adm-border pb-4">
      <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
        {/* Department indicator */}
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-adm-blue shrink-0" />
          <span className="text-xs font-semibold uppercase tracking-wider text-adm-text">
            {t("Website CMS")}
          </span>
        </div>

        {/* Function pills */}
        <nav aria-label={t("CMS sections")} className="flex flex-wrap items-center gap-1.5">
          {CMS_FUNCTIONS.map((item) => {
            const Icon = item.icon;
            const isActive = active === item.id;

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
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
