"use client";

import { useRouter } from "next/navigation";
import {
  Bell,
  LogOut,
  Menu,
  Search,
  UserCircle2,
} from "lucide-react";

import { useCurrentUser, useLogout } from "@/hooks/useAuth";

type Props = {
  onMenuClick: () => void;
};

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
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-3 border-b border-white/10 bg-[#050816]/90 px-4 backdrop-blur-xl sm:h-20 sm:px-6 lg:px-8">

      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          aria-label="Open menu"
          className="flex h-10 w-10 shrink-0 items-center justify-center border border-white/10 bg-white/5 text-slate-300 transition hover:border-yellow-400 lg:hidden"
        >
          <Menu size={20} />
        </button>

        <div className="min-w-0">
          <h2 className="truncate text-lg font-bold text-white sm:text-2xl">
            Dashboard
          </h2>

          <p className="mt-0.5 hidden truncate text-sm text-slate-400 sm:block">
            Welcome back{user?.name ? `, ${user.name}` : ""}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-5">

        <div className="relative hidden md:block">

          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
          />

          <input
            type="text"
            placeholder="Search..."
            className="w-40 rounded-none border border-white/10 bg-white/5 py-2.5 pl-11 pr-4 text-sm text-white outline-none transition focus:border-yellow-400 lg:w-72 lg:py-3"
          />

        </div>

        <button className="flex h-10 w-10 shrink-0 items-center justify-center rounded-none border border-white/10 bg-white/5 transition hover:border-yellow-400 sm:h-auto sm:w-auto sm:p-3">
          <Bell size={20} />
        </button>

        <div className="hidden items-center gap-3 rounded-none border border-white/10 bg-white/5 px-4 py-2 sm:flex">

          <UserCircle2
            size={36}
            className="text-yellow-400"
          />

          <div className="min-w-0">

            <p className="truncate text-sm font-semibold text-white">
              {user?.name ?? "Admin"}
            </p>

            <p className="truncate text-xs text-slate-400">
              {user?.role === "admin" ? "Super Administrator" : (user?.email ?? "")}
            </p>

          </div>

        </div>

        <button
          type="button"
          onClick={handleLogout}
          aria-label="Log out"
          className="flex h-10 w-10 shrink-0 items-center justify-center border border-white/10 bg-white/5 text-slate-300 transition hover:border-red-400 hover:text-red-400"
        >
          <LogOut size={18} />
        </button>

      </div>

    </header>
  );
}
