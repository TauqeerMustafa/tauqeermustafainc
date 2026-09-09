"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell, Check, CheckCheck, ExternalLink, LogOut, Menu, Search, Trash2, X } from "lucide-react";

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

type NotificationItem = {
  id: string;
  title: string;
  description: string;
  time: string;
  read: boolean;
  type: "task" | "attendance" | "announcement" | "message";
  href: string;
};

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "notif-1",
    title: "Shift Schedule Confirmed",
    description: "Your daily expected check-in time is assigned as 09:00 AM.",
    time: "10m ago",
    read: false,
    type: "attendance",
    href: "/employees/attendance",
  },
  {
    id: "notif-2",
    title: "Direct Chat Available",
    description: "You can now message your Department Head or Admin directly.",
    time: "25m ago",
    read: false,
    type: "message",
    href: "/employees/chat",
  },
  {
    id: "notif-3",
    title: "New Task Deliverables",
    description: "Check your active sprint deliverables in My Tasks.",
    time: "1h ago",
    read: false,
    type: "task",
    href: "/employees/tasks",
  },
  {
    id: "notif-4",
    title: "Executive Policy Update",
    description: "Updated security audit protocol documents have been published to Document Vault.",
    time: "3h ago",
    read: true,
    type: "announcement",
    href: "/employees/documents",
  },
];

const ICON_BUTTON =
  "flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-adm-border text-adm-text-2 transition hover:bg-adm-surface-2 hover:text-adm-text";

export default function PortalHeader({ portal, onMenuClick }: Props) {
  const router = useRouter();
  const logout = useLogout();
  const { data } = useCurrentUser();
  const { t } = useI18n();
  const user = data?.data;

  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("tmi_portal_notifications");
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          // fallback
        }
      }
    }
    return INITIAL_NOTIFICATIONS;
  });

  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    localStorage.setItem("tmi_portal_notifications", JSON.stringify(notifications));
  }, [notifications]);

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

  const unreadCount = notifications.filter((n) => !n.read).length;

  function markAsRead(id: string) {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
  }

  function markAllAsRead() {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }

  function clearAll() {
    setNotifications([]);
  }

  function handleLogout() {
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
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-adm-text-3"
            aria-hidden="true"
          />
          <input
            type="search"
            placeholder={t("Search anything…")}
            aria-label={t("Search anything…")}
            className="w-56 rounded-none border border-adm-border bg-adm-surface-2 py-1.5 pl-9 pr-4 text-sm text-adm-text outline-none transition placeholder:text-adm-text-3 focus:border-adm-blue focus:bg-adm-surface focus:ring-2 focus:ring-adm-blue/15 lg:w-72"
          />
        </div>
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
              aria-label="Notifications"
              className="absolute right-0 top-full mt-2 w-[min(22rem,calc(100vw-2rem))] sm:w-96 border border-adm-border bg-adm-surface shadow-2xl z-50 animate-in fade-in-0 zoom-in-95 duration-150"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-adm-border px-4 py-3 bg-adm-surface-2/70">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold uppercase tracking-wider text-adm-text">
                    Notifications
                  </span>
                  {unreadCount > 0 && (
                    <span className="bg-adm-blue px-1.5 py-0.2 font-mono text-[10px] font-bold text-white">
                      {unreadCount} new
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 text-xs">
                  {unreadCount > 0 && (
                    <button
                      type="button"
                      onClick={markAllAsRead}
                      className="font-mono text-[10px] uppercase tracking-wider text-adm-text-3 hover:text-adm-blue transition flex items-center gap-1"
                    >
                      <CheckCheck size={12} /> Mark read
                    </button>
                  )}
                  {notifications.length > 0 && (
                    <button
                      type="button"
                      onClick={clearAll}
                      className="font-mono text-[10px] uppercase tracking-wider text-adm-text-3 hover:text-adm-red transition flex items-center gap-1"
                    >
                      <Trash2 size={11} /> Clear
                    </button>
                  )}
                </div>
              </div>

              {/* Notification List */}
              <div className="max-h-80 overflow-y-auto divide-y divide-adm-border">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center text-xs text-adm-text-3">
                    <p className="font-medium">All caught up!</p>
                    <p className="mt-1 text-[11px]">No active notifications.</p>
                  </div>
                ) : (
                  notifications.map((item) => (
                    <div
                      key={item.id}
                      className={`p-3.5 transition hover:bg-adm-surface-2 flex items-start justify-between gap-3 ${
                        !item.read ? "bg-adm-blue/5" : ""
                      }`}
                    >
                      <Link
                        href={item.href}
                        onClick={() => {
                          markAsRead(item.id);
                          setNotifOpen(false);
                        }}
                        className="flex-1 min-w-0 group"
                      >
                        <div className="flex items-center justify-between gap-2 mb-0.5">
                          <p className={`text-xs truncate ${!item.read ? "font-bold text-adm-text" : "font-medium text-adm-text-2"} group-hover:text-adm-blue transition`}>
                            {item.title}
                          </p>
                          <span className="font-mono text-[9px] text-adm-text-3 shrink-0">
                            {item.time}
                          </span>
                        </div>
                        <p className="text-[11px] leading-relaxed text-adm-text-3 line-clamp-2">
                          {item.description}
                        </p>
                      </Link>

                      <div className="flex items-center gap-1 shrink-0 pt-0.5">
                        {!item.read && (
                          <button
                            type="button"
                            onClick={() => markAsRead(item.id)}
                            title="Mark as read"
                            className="text-adm-text-3 hover:text-adm-blue p-1"
                          >
                            <Check size={12} />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => setNotifications((prev) => prev.filter((n) => n.id !== item.id))}
                          title="Dismiss"
                          className="text-adm-text-3 hover:text-adm-red p-1"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Footer */}
              <div className="border-t border-adm-border px-4 py-2 bg-adm-surface-2/40 text-center">
                <Link
                  href="/employees/announcements"
                  onClick={() => setNotifOpen(false)}
                  className="font-mono text-[10px] font-bold uppercase tracking-wider text-adm-blue hover:underline inline-flex items-center gap-1"
                >
                  View All Announcements <ExternalLink size={10} />
                </Link>
              </div>
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
    </header>
  );
}
