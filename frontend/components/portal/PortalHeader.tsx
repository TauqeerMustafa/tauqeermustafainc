"use client";

import { useRouter } from "next/navigation";
import { Bell, LogOut, Menu, Search } from "lucide-react";

import LanguageSwitcher from "@/components/portal/LanguageSwitcher";
import PortalThemeToggle from "@/components/portal/PortalThemeToggle";
import { Avatar } from "@/components/portal/PortalUI";
import { useCurrentUser, useLogout } from "@/hooks/useAuth";
import { useI18n } from "@/lib/i18n";
import { roleLabel, type PortalId } from "@/lib/rbac";
import { currentLocationPath, loginUrlWithReturnTo } from "@/lib/return-to";

/**
 * Portal topbar — Adminator's layout (menu · search | actions · identity) in
 * BMW chrome: a squared surface plate on a hairline, round icon controls.
 * Everything rides `adm-*` utilities so it flips light↔dark with the theme.
 */

type Props = { portal: PortalId; onMenuClick: () => void };

const ICON_BUTTON =
  "flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-adm-border text-adm-text-2 transition hover:bg-adm-surface-2 hover:text-adm-text";

export default function PortalHeader({ portal, onMenuClick }: Props) {
  const router = useRouter();
  const logout = useLogout();
  const { data } = useCurrentUser();
  const { t } = useI18n();
  const user = data?.data;

  function handleLogout() {
    // Remember the page before clearing the token: signing back in reopens it.
    // Same helper the guard uses, so the two redirects cannot disagree about
    // where a returning session lands.
    const back = loginUrlWithReturnTo(portal, currentLocationPath());
    logout();
    router.replace(back);
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-3 border-b border-adm-border bg-adm-surface px-4 sm:h-[60px] sm:px-6 lg:px-8">
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          aria-label={t("Open menu")}
          className={`${ICON_BUTTON} lg:hidden`}
        >
          <Menu size={18} />
        </button>

        <div className="relative hidden md:block">
          <Search
            size={15}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-adm-text-3"
            aria-hidden="true"
          />
          <input
            type="search"
            placeholder={t("Search anything…")}
            aria-label={t("Search anything…")}
            className="w-56 border border-adm-border bg-adm-surface-2 py-2 pl-9 pr-4 text-sm text-adm-text outline-none transition placeholder:text-adm-text-3 focus:border-adm-blue focus:ring-2 focus:ring-adm-blue/25 lg:w-72"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <LanguageSwitcher />
        <PortalThemeToggle />

        <button type="button" className={`relative ${ICON_BUTTON}`} aria-label={t("Notifications")}>
          <Bell size={17} />
          <span
            className="animate-bounce-subtle absolute right-2 top-2 h-2 w-2 rounded-full border-2 border-adm-surface bg-adm-blue"
            aria-hidden="true"
          />
        </button>

        {/* Identity plate — square, because it is structure, not a control. */}
        <div className="hidden items-center gap-2.5 border border-adm-border px-3 py-1.5 sm:flex">
          <Avatar name={user?.name} size={28} />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold leading-tight text-adm-text">
              {user?.name ?? t("User")}
            </p>
            <p className="truncate text-[10px] font-bold uppercase tracking-[0.12em] text-adm-text-3">
              {roleLabel(user?.role)}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          aria-label={t("Log out")}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-adm-border text-adm-text-2 transition hover:border-adm-red hover:bg-adm-red-light hover:text-adm-red"
        >
          <LogOut size={17} />
        </button>
      </div>
    </header>
  );
}
