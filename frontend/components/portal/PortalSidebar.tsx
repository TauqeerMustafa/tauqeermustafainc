"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { ChevronRight, ExternalLink, X } from "lucide-react";

import { PORTAL_NAV, isNavItemActive, type NavItem } from "@/config/portals";
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

/**
 * Portal sidebar — AdminLTE's sectioned nav rail rendered in BMW chrome: the M
 * stripe on top, squared plates, a 3px action rail on the active row (drawn by
 * `.adm-nav-link.active::before`). All colour comes from `adm-*` utilities so
 * the rail flips light↔dark with the theme rather than being pinned to black.
 */

type Props = { portal: PortalId; isOpen: boolean; onClose: () => void };

export default function PortalSidebar({ portal, isOpen, onClose }: Props) {
  const pathname = usePathname();
  const { data } = useCurrentUser();
  const { t } = useI18n();
  const user = data?.data ?? null;

  /** An item shows only if the viewer clears both its role and permission gate. */
  function isVisible(item: NavItem) {
    if (item.roles) {
      const slug = normalizeRole(user?.role);
      if (!slug || !item.roles.includes(slug)) return false;
    }
    if (item.permission) return can(user, ...item.permission);
    return true;
  }

  const sections = PORTAL_NAV[portal]
    .map((section) => ({ ...section, items: section.items.filter(isVisible) }))
    .filter((section) => section.items.length > 0);

  // Other portals this account may enter — lets an admin hop to the employee
  // view without logging out and guessing the URL.
  const otherPortals = portalsForRole(user?.role).filter((p) => p !== portal);

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity lg:hidden"
          aria-hidden="true"
          onClick={onClose}
        />
      )}
      <aside
        className={`fixed inset-y-0 start-0 z-50 flex w-[264px] flex-col border-e border-adm-border bg-adm-surface transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] lg:static lg:z-auto lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full rtl:translate-x-full"
        }`}
      >
        {/* BMW M signature stripe */}
        <div className="m-stripe" aria-hidden="true" />

        <div className="flex items-center justify-between gap-2 border-b border-adm-border px-5 py-5">
          <Link
            href={PORTAL_HOME_PATH[portal]}
            className="group inline-flex min-w-0 items-center gap-2.5"
            onClick={onClose}
          >
            <span className="relative flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden border border-adm-border transition group-hover:border-adm-border-2">
              <Image src="/logo-mark.svg" alt="" fill sizes="32px" className="object-cover" />
            </span>
            <span className="min-w-0">
              <span className="block text-sm font-bold uppercase leading-tight tracking-wide text-adm-text">
                TM INC
              </span>
              <span className="block truncate font-mono text-[10px] uppercase tracking-widest text-adm-blue">
                {t(PORTAL_LABEL[portal])} {t("Portal")}
              </span>
            </span>
          </Link>

          <button
            type="button"
            onClick={onClose}
            aria-label={t("Close menu")}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-adm-border text-adm-text-2 transition hover:bg-adm-surface-2 hover:text-adm-text lg:hidden"
          >
            <X size={16} />
          </button>
        </div>

        <nav
          className="adm-scroll flex-1 overflow-y-auto px-3 py-4"
          aria-label={`${t(PORTAL_LABEL[portal])} ${t("navigation")}`}
        >
          {sections.map((section, index) => (
            <div key={section.title ?? `group-${index}`} className={index > 0 ? "mt-5" : ""}>
              {section.title && (
                <p className="mb-2 px-4 text-[10px] font-bold uppercase tracking-widest text-adm-text-3">
                  {t(section.title)}
                </p>
              )}

              {section.items.map((item) => {
                const Icon = item.icon;
                const active = isNavItemActive(item, pathname);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onClose}
                    aria-current={active ? "page" : undefined}
                    className={`adm-nav-link mb-0.5 flex items-center gap-3 rounded-none px-4 py-2.5 text-[14px] font-medium transition-all ${
                      active
                        ? "active bg-adm-blue-light text-adm-blue"
                        : "text-adm-text-2 hover:bg-adm-surface-2 hover:text-adm-text"
                    }`}
                  >
                    <Icon
                      size={17}
                      className={`shrink-0 ${active ? "text-adm-blue" : "text-adm-text-3"}`}
                    />
                    <span className="flex-1 truncate">{t(item.label)}</span>
                    {active && <ChevronRight size={14} className="text-adm-blue rtl:rotate-180" />}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        <div className="border-t border-adm-border bg-adm-surface-2">
          {otherPortals.length > 0 && (
            <div className="border-b border-adm-border px-3 py-3">
              <p className="mb-2 px-1 text-[10px] font-bold uppercase tracking-widest text-adm-text-3">
                {t("Switch Portal")}
              </p>
              {otherPortals.map((target) => (
                <Link
                  key={target}
                  href={PORTAL_HOME_PATH[target]}
                  onClick={onClose}
                  className="flex items-center gap-2 px-1 py-1.5 text-[13px] font-medium text-adm-text-2 transition hover:text-adm-blue"
                >
                  <ExternalLink size={13} className="shrink-0" />
                  <span className="truncate">{t(PORTAL_LABEL[target])}</span>
                </Link>
              ))}
            </div>
          )}

          <p className="px-5 py-4 text-[11px] text-adm-text-3">
            Tauqeer Mustafa Inc. &copy; {new Date().getFullYear()}
          </p>
        </div>
      </aside>
    </>
  );
}
