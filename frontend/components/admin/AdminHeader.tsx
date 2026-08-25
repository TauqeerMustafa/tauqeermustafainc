"use client";

import { useRouter } from "next/navigation";
import { Bell, LogOut, Menu, Search, ChevronDown } from "lucide-react";
import { useCurrentUser, useLogout } from "@/hooks/useAuth";

type Props = { onMenuClick: () => void };

export default function AdminHeader({ onMenuClick }: Props) {
  const router = useRouter();
  const logout = useLogout();
  const { data } = useCurrentUser();
  const user = data?.data;

  function handleLogout() {
    logout();
    router.replace("/login");
  }

  return (
    <header
      className="sticky top-0 z-30 flex h-16 items-center justify-between gap-3 border-b px-4 backdrop-blur-md sm:h-[60px] sm:px-6 lg:px-8"
      style={{
        background: "rgba(255,255,255,0.95)",
        borderColor: "var(--adm-border)",
        boxShadow: "0 1px 0 0 var(--adm-border), 0 4px 12px rgba(0,0,0,0.04)",
      }}
    >
      {/* Left */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          aria-label="Open menu"
          className="flex h-9 w-9 shrink-0 items-center justify-center border transition hover:bg-gray-50 lg:hidden"
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
            className="w-56 border py-2 pl-9 pr-4 text-sm outline-none transition focus:border-[#141413] focus:ring-2 focus:ring-[#141413]/10 lg:w-72"
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
          className="relative flex h-9 w-9 items-center justify-center border transition hover:bg-gray-50"
          style={{ borderColor: "var(--adm-border)", color: "var(--adm-text-2)" }}
          aria-label="Notifications"
        >
          <Bell size={17} />
          {/* Notification dot */}
          <span
            className="absolute right-2 top-2 h-2 w-2 rounded-full border-2 border-white animate-bounce-subtle"
            style={{ background: "var(--adm-blue)" }}
          />
        </button>

        {/* User pill */}
        <div
          className="hidden items-center gap-2.5 border px-3 py-1.5 transition hover:bg-gray-50 cursor-pointer sm:flex"
          style={{ borderColor: "var(--adm-border)" }}
        >
          <div
            className="flex h-7 w-7 shrink-0 items-center justify-center text-white text-xs font-semibold"
            style={{ background: "var(--adm-blue)" }}
          >
            {user?.name?.[0]?.toUpperCase() ?? "A"}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold leading-tight" style={{ color: "var(--adm-text)" }}>
              {user?.name ?? "Admin"}
            </p>
            <p className="truncate text-[10px]" style={{ color: "var(--adm-text-3)" }}>
              {user?.role === "admin" ? "Super Admin" : (user?.email ?? "")}
            </p>
          </div>
          <ChevronDown size={14} style={{ color: "var(--adm-text-3)" }} />
        </div>

        {/* Logout */}
        <button
          type="button"
          onClick={handleLogout}
          aria-label="Log out"
          className="flex h-9 w-9 items-center justify-center border transition hover:border-red-300 hover:bg-red-50 hover:text-red-500"
          style={{ borderColor: "var(--adm-border)", color: "var(--adm-text-2)" }}
        >
          <LogOut size={17} />
        </button>
      </div>
    </header>
  );
}
