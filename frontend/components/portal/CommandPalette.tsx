"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Command } from "cmdk";
import { ArrowRight, Search } from "lucide-react";

import { PORTAL_NAV, type NavItem } from "@/config/portals";
import { useCurrentUser } from "@/hooks/useAuth";
import { useI18n } from "@/lib/i18n";
import {
  PORTAL_HOME_PATH,
  PORTAL_LABEL,
  can,
  normalizeRole,
  portalsForRole,
  type PortalId,
} from "@/lib/rbac";
import type { LucideIcon } from "lucide-react";

/**
 * ⌘K command palette over the current portal's navigation. Replaces the header's
 * dead search box: every entry is a real, role-gated route from `PORTAL_NAV`
 * (same `isVisible` gate the sidebar uses), plus "Switch portal" jumps from
 * `portalsForRole`. Selecting an entry routes to it.
 *
 * It draws its own overlay rather than reusing `PortalDialog` — the dialog's
 * mandatory title bar and `p-6` fight a palette's flush search input — but
 * mirrors the dialog's exact chrome tokens so it still obeys the house rules:
 * square panel, hairline border, no drop shadow.
 */

type Props = { portal: PortalId; open: boolean; onClose: () => void };

type PaletteEntry = {
  key: string;
  label: string;
  href: string;
  icon: LucideIcon;
  group: string;
  keywords?: string[];
};

// cmdk renders the group label into a `[cmdk-group-heading]` child; style it in
// place so headings match the sidebar's section captions.
const GROUP_CLASS =
  "[&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:pb-1.5 [&_[cmdk-group-heading]]:pt-3 [&_[cmdk-group-heading]]:text-[10px] [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider [&_[cmdk-group-heading]]:text-adm-text-3";

export default function CommandPalette({ portal, open, onClose }: Props) {
  const router = useRouter();
  const { t } = useI18n();
  const { data } = useCurrentUser();
  const user = data?.data ?? null;

  const groups = useMemo(() => {
    function isVisible(item: NavItem) {
      if (item.roles) {
        const slug = normalizeRole(user?.role);
        if (!slug || !item.roles.includes(slug)) return false;
      }
      if (item.permission) return can(user, ...item.permission);
      return true;
    }

    const entries: PaletteEntry[] = PORTAL_NAV[portal].flatMap((section) =>
      section.items.filter(isVisible).map((item) => ({
        key: `nav:${item.href}`,
        label: item.label,
        href: item.href,
        icon: item.icon,
        group: section.title ?? t("General"),
      })),
    );

    for (const target of portalsForRole(user?.role).filter((p) => p !== portal)) {
      entries.push({
        key: `portal:${target}`,
        label: `${t(PORTAL_LABEL[target])} ${t("Portal")}`,
        href: PORTAL_HOME_PATH[target],
        icon: ArrowRight,
        group: t("Switch portal"),
        keywords: ["switch", "portal", target],
      });
    }

    // Bucket by group, preserving first-seen order.
    const ordered: { label: string; items: PaletteEntry[] }[] = [];
    for (const entry of entries) {
      let bucket = ordered.find((g) => g.label === entry.group);
      if (!bucket) {
        bucket = { label: entry.group, items: [] };
        ordered.push(bucket);
      }
      bucket.items.push(entry);
    }
    return ordered;
  }, [portal, user, t]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  function go(href: string) {
    onClose();
    router.push(href);
  }

  return (
    <div
      className="fixed inset-0 z-[70] flex items-start justify-center bg-black/40 p-4 pt-[14vh] backdrop-blur-md"
      role="dialog"
      aria-modal="true"
      aria-label={t("Command palette")}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <Command
        label={t("Command palette")}
        loop
        className="w-full max-w-lg overflow-hidden rounded-none border border-adm-border-2 bg-adm-surface"
      >
        <div className="flex items-center gap-3 border-b border-adm-border px-4">
          <Search size={16} className="shrink-0 text-adm-text-3" aria-hidden="true" />
          <Command.Input
            autoFocus
            placeholder={t("Search pages, jump to a section…")}
            className="h-12 flex-1 border-0 bg-transparent text-sm text-adm-text outline-none placeholder:text-adm-text-3"
          />
          <kbd className="rounded-full border border-adm-border px-2 py-0.5 text-[10px] font-medium text-adm-text-3">
            ESC
          </kbd>
        </div>

        <Command.List className="max-h-[min(24rem,60vh)] overflow-y-auto p-2">
          <Command.Empty className="px-3 py-8 text-center text-xs text-adm-text-3">
            {t("No matches found.")}
          </Command.Empty>

          {groups.map((group) => (
            <Command.Group key={group.label} heading={group.label} className={GROUP_CLASS}>
              {group.items.map((entry) => {
                const Icon = entry.icon;
                return (
                  <Command.Item
                    key={entry.key}
                    value={`${entry.label} ${entry.href}`}
                    keywords={entry.keywords}
                    onSelect={() => go(entry.href)}
                    className="flex cursor-pointer items-center gap-3 rounded-none px-3 py-2.5 text-sm text-adm-text-2 transition data-[selected=true]:bg-adm-blue-light data-[selected=true]:text-adm-blue"
                  >
                    <Icon size={16} className="shrink-0 text-adm-text-3" aria-hidden="true" />
                    <span className="flex-1 truncate font-medium">{entry.label}</span>
                  </Command.Item>
                );
              })}
            </Command.Group>
          ))}
        </Command.List>
      </Command>
    </div>
  );
}
