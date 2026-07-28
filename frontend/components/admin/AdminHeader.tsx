"use client";

import {
  Bell,
  Search,
  UserCircle2,
} from "lucide-react";

export default function AdminHeader() {
  return (
    <header className="sticky top-0 z-50 flex h-20 items-center justify-between border-b border-white/10 bg-[#050816]/90 px-8 backdrop-blur-xl">

      <div>
        <h2 className="text-2xl font-bold text-white">
          Dashboard
        </h2>

        <p className="mt-1 text-sm text-slate-400">
          Welcome back, Administrator
        </p>
      </div>

      <div className="flex items-center gap-5">

        <div className="relative">

          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
          />

          <input
            type="text"
            placeholder="Search..."
            className="w-72 rounded-none border border-white/10 bg-white/5 py-3 pl-11 pr-4 text-white outline-none transition focus:border-yellow-400"
          />

        </div>

        <button className="rounded-none border border-white/10 bg-white/5 p-3 transition hover:border-yellow-400">
          <Bell size={20} />
        </button>

        <div className="flex items-center gap-3 rounded-none border border-white/10 bg-white/5 px-4 py-2">

          <UserCircle2
            size={42}
            className="text-yellow-400"
          />

          <div>

            <p className="font-semibold text-white">
              Admin
            </p>

            <p className="text-sm text-slate-400">
              Super Administrator
            </p>

          </div>

        </div>

      </div>

    </header>
  );
}
