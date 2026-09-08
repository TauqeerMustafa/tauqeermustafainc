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
    <div className="relative overflow-hidden rounded-[18px] border border-adm-border bg-adm-surface p-5 sm:p-6">
      <div className="flex flex-col gap-5">
        {/* Top title & summary section */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full border border-adm-border bg-adm-surface-2 px-3 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-adm-text-3">
              <span className="h-1.5 w-1.5 rounded-full bg-adm-blue shrink-0" />
              <span>{t("Digital Presence & CMS")}</span>
            </div>
            <h2 className="mt-2 text-xl font-semibold tracking-tight text-adm-text sm:text-2xl">
              {t("Website Content Management")}
            </h2>
            {!compact && (
              <p className="mt-1 max-w-2xl text-xs font-normal leading-relaxed text-adm-text-3 sm:text-sm">
                {t(
                  "Publish and manage public digital channels: insights blog, client case studies, service catalog, hiring vacancies, and talent community.",
                )}
              </p>
            )}
          </div>

          {/* Real-time pulse stats */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
            <div className="flex items-center gap-2 rounded-full border border-adm-border bg-adm-surface-2 px-3 py-1 text-xs">
              <span className="h-1.5 w-1.5 rounded-full bg-adm-green" />
              <span className="text-adm-text-3">{t("Public CMS:")}</span>
              <span className="font-semibold text-adm-green">{t("Live")}</span>
            </div>
            <div className="flex items-center gap-2 rounded-full border border-adm-border bg-adm-surface-2 px-3 py-1 text-xs">
              <span className="text-adm-text-3">{t("5 Public Sections")}</span>
            </div>
          </div>
        </div>

        {/* Function navigation capsules */}
        <div className="border-t border-adm-border pt-4">
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-adm-text-3">
            {t("CMS Content Sections")}
          </p>
          <nav aria-label={t("CMS sections")} className="flex flex-wrap items-center gap-2">
            {CMS_FUNCTIONS.map((item) => {
              const Icon = item.icon;
              const isActive = active === item.id;

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
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </div>
  );
}
