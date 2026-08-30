"use client";

import { useRouter } from "next/navigation";
import { Bell, LogOut, Menu, Search, ChevronDown } from "lucide-react";
import { useCurrentUser, useLogout } from "@/hooks/useAuth";

type Props = { onMenuClick: () => void };

export default function PortalHeader({ onMenuClick }: Props) {
  const router = useRouter();
  const logout = useLogout();
  const { data } = useCurrentUser();
  const user = data?.data;

  const role = user?.role || "EMPLOYEE";
  const isAdmin = role === "SUPER_ADMIN" || role === "ADMIN";

  function handleLogout() {
    logout();
    if (isAdmin) {
      router.replace("/admin/login");
    } else {
      router.replace("/employees/login");
    }
  }

  return (
    <header
      className="sticky top-0 z-30 flex h-16 items-center justify-between gap-3 border-b px-4 sm:h-[60px] sm:px-6 lg:px-8"
      style={{
        background: "var(--adm-surface)",
        borderColor: "var(--adm-border)",
      }}
    >
      {/* Left */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          aria-label="Open menu"
          className="flex h-9 w-9 shrink-0 items-center justify-center border transition hover:bg-[var(--adm-surface-2)] lg:hidden"
          style={{ borderColor: "var(--adm-border)", color: "var(--adm-text-2)" }}
        >
          <Menu size={18} />
        </button>

        {/* Search bar */}
        <div className="relative hidden md:block">
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
            style={{ color: "var(--adm-text-3)" }}
          />
          <input
            type="text"
            placeholder="Search anything…"
            className="w-56 border py-2 pl-9 pr-4 text-sm outline-none transition focus:border-[color:var(--adm-blue)] focus:ring-2 focus:ring-[color:var(--adm-blue)]/25 lg:w-72"
            style={{
              borderColor: "var(--adm-border)",
              background: "var(--adm-surface-2)",
              color: "var(--adm-text)",
            }}
          />
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-2">
        {/* Notifications */}
        <button
          className="relative flex h-9 w-9 items-center justify-center border transition hover:bg-[var(--adm-surface-2)]"
          style={{ borderColor: "var(--adm-border)", color: "var(--adm-text-2)" }}
          aria-label="Notifications"
        >
          <Bell size={17} />
          {/* Notification dot */}
          <span
            className="absolute right-2 top-2 h-2 w-2 rounded-full border-2 animate-bounce-subtle"
            style={{ background: "var(--adm-blue)", borderColor: "var(--adm-surface)" }}
          />
        </button>

        {/* User pill */}
        <div
          className="hidden items-center gap-2.5 border px-3 py-1.5 transition hover:bg-[var(--adm-surface-2)] cursor-pointer sm:flex"
          style={{ borderColor: "var(--adm-border)" }}
        >
          <div
            className="flex h-7 w-7 shrink-0 items-center justify-center text-white text-xs font-semibold"
            style={{ background: "var(--adm-blue)" }}
          >
            {user?.name?.[0]?.toUpperCase() ?? "U"}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold leading-tight" style={{ color: "var(--adm-text)" }}>
              {user?.name ?? "User"}
            </p>
            <p className="truncate text-[10px] uppercase tracking-wider" style={{ color: "var(--adm-text-3)" }}>
              {role.replace("_", " ")}
            </p>
          </div>
          <ChevronDown size={14} style={{ color: "var(--adm-text-3)" }} />
        </div>

        {/* Logout */}
        <button
          type="button"
          onClick={handleLogout}
          aria-label="Log out"
          className="flex h-9 w-9 items-center justify-center border transition hover:border-[color:var(--adm-red)] hover:bg-[var(--adm-red-light)] hover:text-[color:var(--adm-red)]"
          style={{ borderColor: "var(--adm-border)", color: "var(--adm-text-2)" }}
        >
          <LogOut size={17} />
        </button>
      </div>
    </header>
  );
}
