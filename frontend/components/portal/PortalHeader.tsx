"use client";

import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell, Check, CheckCheck, ExternalLink, LogOut, Menu, Search, Trash2, X } from "lucide-react";

import CommandPalette from "@/components/portal/CommandPalette";
import PortalThemeToggle from "@/components/portal/PortalThemeToggle";
import { Avatar } from "@/components/portal/PortalUI";
import { usePortalNotifications } from "@/hooks/usePortalNotifications";
import { useCurrentUser, useLogout } from "@/hooks/useAuth";
import { useI18n } from "@/lib/i18n";
import { PORTAL, roleLabel, type PortalId } from "@/lib/rbac";
import { currentLocationPath, loginUrlWithReturnTo } from "@/lib/return-to";

/**
 * Portal topbar — Adminator's layout (menu · search | actions · identity) in
 * BMW chrome: a squared surface plate on a hairline, round icon controls.
 * Everything rides `adm-*` utilities so it flips light↔dark with the theme.
 *
 * The search affordance opens a ⌘K command palette over the portal's nav; the
 * bell shows a live, portal-aware feed derived from real hooks
 * (`usePortalNotifications`). There is no notifications backend, so read /
 * dismissed state is the only thing kept client-side, in localStorage, keyed by
 * the feed's stable item ids.
 */

type Props = { portal: PortalId; onMenuClick: () => void };

/** Read/dismissed ids layered over the derived feed. */
type NotifState = { read: string[]; dismissed: string[] };

const STORAGE_KEY = "tmi_portal_notifications";

const ICON_BUTTON =
  "flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-adm-border text-adm-text-2 transition hover:bg-adm-surface-2 hover:text-adm-text";

/** Announcements destination per portal; portals without one hide the footer. */
const ANNOUNCEMENTS_HREF: Partial<Record<PortalId, string>> = {
  [PORTAL.ADMIN]: "/admin/announcements",
  [PORTAL.EMPLOYEES]: "/employees/announcements",
};

function readState(): NotifState {
  if (typeof window === "undefined") return { read: [], dismissed: [] };
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "");
    if (parsed && Array.isArray(parsed.read) && Array.isArray(parsed.dismissed)) {
      const strings = (arr: unknown[]) => arr.filter((x): x is string => typeof x === "string");
      return { read: strings(parsed.read), dismissed: strings(parsed.dismissed) };
    }
  } catch {
    // No saved state, or the legacy array shape — start clean.
  }
  return { read: [], dismissed: [] };
}

function relativeTime(iso: string | null): string {
  if (!iso) return "";
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "";
  const mins = Math.round((Date.now() - then) / 60_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.round(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return `${Math.round(days / 7)}w ago`;
}

/**
 * Post-mount platform detection via `useSyncExternalStore` rather than a
 * setState-in-effect: the server snapshot is `false` (so SSR and first paint
 * render "Ctrl K"), and the client snapshot reads the user agent once hydration
 * runs. The UA never changes, so `subscribe` is a no-op.
 */
const subscribePlatform = () => () => {};
const getIsMacSnapshot = () => /mac/i.test(navigator.userAgent);
const getIsMacServerSnapshot = () => false;

export default function PortalHeader({ portal, onMenuClick }: Props) {
  const router = useRouter();
  const logout = useLogout();
  const { data } = useCurrentUser();
  const { t } = useI18n();
  const user = data?.data;

  const derived = usePortalNotifications(portal);

  const [notifOpen, setNotifOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [state, setState] = useState<NotifState>(readState);
  const notifRef = useRef<HTMLDivElement>(null);
  const isMac = useSyncExternalStore(subscribePlatform, getIsMacSnapshot, getIsMacServerSnapshot);

  const readSet = useMemo(() => new Set(state.read), [state.read]);
  const dismissedSet = useMemo(() => new Set(state.dismissed), [state.dismissed]);
  const visible = useMemo(
    () => derived.filter((n) => !dismissedSet.has(n.id)),
    [derived, dismissedSet],
  );
  const unreadCount = useMemo(
    () => visible.filter((n) => !readSet.has(n.id)).length,
    [visible, readSet],
  );

  // Persist read/dismissed state.
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Private mode or quota — read/dismissed state just won't persist.
    }
  }, [state]);

  // Prune ids no longer in the feed so localStorage can't grow without bound.
  useEffect(() => {
    const ids = new Set(derived.map((n) => n.id));
    setState((prev) => {
      const read = prev.read.filter((id) => ids.has(id));
      const dismissed = prev.dismissed.filter((id) => ids.has(id));
      return read.length === prev.read.length && dismissed.length === prev.dismissed.length
        ? prev
        : { read, dismissed };
    });
  }, [derived]);

  // Global ⌘K / Ctrl-K toggles the palette.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && (e.key === "k" || e.key === "K")) {
        e.preventDefault();
        setPaletteOpen((prev) => !prev);
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    }
    if (notifOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [notifOpen]);

  function markAsRead(id: string) {
    setState((prev) => (prev.read.includes(id) ? prev : { ...prev, read: [...prev.read, id] }));
  }

  function markAllAsRead() {
    setState((prev) => ({
      ...prev,
      read: Array.from(new Set([...prev.read, ...visible.map((n) => n.id)])),
    }));
  }

  function dismiss(id: string) {
    setState((prev) =>
      prev.dismissed.includes(id) ? prev : { ...prev, dismissed: [...prev.dismissed, id] },
    );
  }

  function clearAll() {
    setState((prev) => ({
      ...prev,
      dismissed: Array.from(new Set([...prev.dismissed, ...visible.map((n) => n.id)])),
    }));
  }

  function handleLogout() {
    const back = loginUrlWithReturnTo(portal, currentLocationPath());
    logout();
    router.replace(back);
  }

  const announcementsHref = ANNOUNCEMENTS_HREF[portal];
  const kbdHint = isMac ? "⌘K" : "Ctrl K";

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

        <button
          type="button"
          onClick={() => setPaletteOpen(true)}
          aria-label={t("Search")}
          aria-keyshortcuts="Meta+K Control+K"
          className="hidden w-56 items-center gap-2 rounded-none border border-adm-border bg-adm-surface-2 py-1.5 pl-3 pr-2 text-sm text-adm-text-3 transition hover:border-adm-border-2 hover:text-adm-text md:flex lg:w-72"
        >
          <Search size={15} className="shrink-0" aria-hidden="true" />
          <span className="flex-1 text-left">{t("Search…")}</span>
          <kbd className="rounded-full border border-adm-border px-2 py-0.5 text-[10px] font-medium text-adm-text-3">
            {kbdHint}
          </kbd>
        </button>
      </div>

      <div className="flex items-center gap-2">
        <PortalThemeToggle />

        {/* Interactive Notifications Bell */}
        <div className="relative" ref={notifRef}>
          <button
            type="button"
            onClick={() => setNotifOpen((prev) => !prev)}
            className={`relative ${ICON_BUTTON} ${notifOpen ? "border-adm-blue bg-adm-surface-2 text-adm-blue" : ""}`}
            aria-label={t("Notifications")}
            aria-expanded={notifOpen}
          >
            <Bell size={16} />
            {unreadCount > 0 && (
              <span
                className="absolute right-1.5 top-1.5 flex h-2.5 w-2.5 items-center justify-center rounded-full border-2 border-adm-surface bg-adm-blue"
                aria-hidden="true"
              />
            )}
          </button>

          {/* Notifications Dropdown Panel */}
          {notifOpen && (
            <div
              role="dialog"
              aria-label={t("Notifications")}
              className="absolute right-0 top-full z-50 mt-2 w-[min(22rem,calc(100vw-2rem))] border border-adm-border-2 bg-adm-surface sm:w-96"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-adm-border bg-adm-surface-2/70 px-4 py-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-adm-text">
                    {t("Notifications")}
                  </span>
                  {unreadCount > 0 && (
                    <span className="rounded-full bg-adm-blue px-2 py-0.5 text-[10px] font-bold text-white">
                      {unreadCount} {t("new")}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3 text-xs">
                  {unreadCount > 0 && (
                    <button
                      type="button"
                      onClick={markAllAsRead}
                      className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-adm-text-3 transition hover:text-adm-blue"
                    >
                      <CheckCheck size={12} /> {t("Mark read")}
                    </button>
                  )}
                  {visible.length > 0 && (
                    <button
                      type="button"
                      onClick={clearAll}
                      className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-adm-text-3 transition hover:text-adm-red"
                    >
                      <Trash2 size={11} /> {t("Clear")}
                    </button>
                  )}
                </div>
              </div>

              {/* Notification List */}
              <div className="max-h-80 divide-y divide-adm-border overflow-y-auto">
                {visible.length === 0 ? (
                  <div className="p-8 text-center text-xs text-adm-text-3">
                    <p className="font-medium">{t("All caught up!")}</p>
                    <p className="mt-1 text-[11px]">{t("No active notifications.")}</p>
                  </div>
                ) : (
                  visible.map((item) => {
                    const Icon = item.icon;
                    const isRead = readSet.has(item.id);
                    const time = relativeTime(item.createdAt);
                    return (
                      <div
                        key={item.id}
                        className={`flex items-start justify-between gap-3 p-3.5 transition hover:bg-adm-surface-2 ${
                          isRead ? "" : "bg-adm-blue/5"
                        }`}
                      >
                        <Link
                          href={item.href}
                          onClick={() => {
                            markAsRead(item.id);
                            setNotifOpen(false);
                          }}
                          className="group flex min-w-0 flex-1 items-start gap-3"
                        >
                          <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-adm-border text-adm-text-2">
                            <Icon size={14} />
                          </span>
                          <div className="min-w-0 flex-1">
                            <div className="mb-0.5 flex items-center justify-between gap-2">
                              <p
                                className={`truncate text-xs transition group-hover:text-adm-blue ${
                                  isRead ? "font-medium text-adm-text-2" : "font-bold text-adm-text"
                                }`}
                              >
                                {item.title}
                              </p>
                              {time && (
                                <span className="shrink-0 text-[9px] text-adm-text-3">{time}</span>
                              )}
                            </div>
                            <p className="line-clamp-2 text-[11px] leading-relaxed text-adm-text-3">
                              {item.description}
                            </p>
                          </div>
                        </Link>

                        <div className="flex shrink-0 items-center gap-1 pt-0.5">
                          {!isRead && (
                            <button
                              type="button"
                              onClick={() => markAsRead(item.id)}
                              title={t("Mark as read")}
                              className="p-1 text-adm-text-3 transition hover:text-adm-blue"
                            >
                              <Check size={12} />
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => dismiss(item.id)}
                            title={t("Dismiss")}
                            className="p-1 text-adm-text-3 transition hover:text-adm-red"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Footer */}
              {announcementsHref && (
                <div className="border-t border-adm-border bg-adm-surface-2/40 px-4 py-2 text-center">
                  <Link
                    href={announcementsHref}
                    onClick={() => setNotifOpen(false)}
                    className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-adm-blue hover:underline"
                  >
                    {t("View all announcements")} <ExternalLink size={10} />
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Identity plate */}
        <div className="hidden items-center gap-2.5 rounded-none border border-adm-border bg-adm-surface-2/60 px-3 py-1 sm:flex">
          <Avatar name={user?.name} src={user?.avatarUrl} size={26} />
          <div className="min-w-0">
            <p className="truncate text-xs font-semibold leading-tight text-adm-text">
              {user?.name ?? t("User")}
            </p>
            <p className="truncate text-[9px] font-medium uppercase tracking-wider text-adm-text-3">
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

      <CommandPalette portal={portal} open={paletteOpen} onClose={() => setPaletteOpen(false)} />
    </header>
  );
}
