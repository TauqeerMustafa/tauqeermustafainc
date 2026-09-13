"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import {
  Bot,
  ShieldCheck,
  LogOut,
  ArrowLeft,
  Sparkles,
  Lock,
  UserCheck,
} from "lucide-react";

import { useCurrentUser, useLogout } from "@/hooks/useAuth";
import { useAuthContext } from "@/providers/auth-provider";
import { roleLabel } from "@/lib/rbac";

export default function AIWorkforceLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { isAuthenticated } = useAuthContext();
  const { data, isLoading, isError } = useCurrentUser();
  const logout = useLogout();

  const user = data?.data;

  // Strict anti-anonymous security guard: redirect unauthenticated visits immediately
  useEffect(() => {
    if (!isAuthenticated || isError) {
      router.replace("/login?returnTo=/ai-workforce");
    }
  }, [isAuthenticated, isError, router]);

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-400">
        <div className="flex items-center gap-3">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-cyan-500 border-t-transparent" />
          <span className="text-sm font-medium tracking-wide">Validating operator credentials…</span>
        </div>
      </div>
    );
  }

  if (isLoading || (!user && !isError)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-400">
        <div className="flex flex-col items-center gap-4">
          <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl">
            <Bot className="h-7 w-7 text-cyan-400 animate-pulse" />
          </div>
          <p className="text-sm font-medium tracking-wide text-slate-300">
            Establishing secure executive link to TMI Autonomous Workforce…
          </p>
        </div>
      </div>
    );
  }

  // Enforce management/admin role for executive agent operations
  const isManagerOrAdmin = user?.role === "admin" || user?.role === "manager";
  if (!isManagerOrAdmin) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-950 px-6 text-center text-slate-200">
        <div className="relative mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/10 border border-amber-500/20">
          <Lock className="h-8 w-8 text-amber-400" />
        </div>
        <h1 className="text-xl font-bold uppercase tracking-wider text-slate-100">
          Executive Clearance Required
        </h1>
        <p className="mt-2 max-w-md text-sm text-slate-400">
          The Autonomous AI Workforce platform executes company-wide operations and is restricted
          to executive and management personnel. You are currently signed in as{" "}
          <strong className="text-slate-200">{roleLabel(user?.role)}</strong> ({user?.email}).
        </p>
        <div className="mt-6 flex gap-3">
          <Link
            href="/portals"
            className="inline-flex items-center gap-2 rounded-xl bg-slate-800 px-5 py-2.5 text-sm font-semibold text-slate-200 transition hover:bg-slate-700"
          >
            <ArrowLeft className="h-4 w-4" /> Return to Portals
          </Link>
          <button
            onClick={() => {
              logout();
              router.push("/login?returnTo=/ai-workforce");
            }}
            className="inline-flex items-center gap-2 rounded-xl bg-cyan-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-cyan-500"
          >
            <LogOut className="h-4 w-4" /> Sign In as Operator
          </button>
        </div>
      </div>
    );
  }

  const operatorName = user?.name || user?.email || "Executive Operator";

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 antialiased selection:bg-cyan-500 selection:text-white">
      {/* Top Standalone Executive Shell Header */}
      <header className="sticky top-0 z-40 border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1700px] flex-wrap items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
          {/* Brand & Platform Identity */}
          <div className="flex items-center gap-3">
            <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500/20 via-blue-600/20 to-indigo-600/20 border border-cyan-500/30 shadow-lg shadow-cyan-950/50">
              <Bot className="h-5 w-5 text-cyan-400" />
              <Sparkles className="absolute -top-1 -right-1 h-3.5 w-3.5 text-amber-400 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold tracking-tight text-white sm:text-base">
                  TMI AI Workforce
                </span>
                <span className="rounded-full bg-cyan-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-cyan-400 border border-cyan-500/20">
                  Autonomous Virtual Staff
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                Dedicated Standalone Executive Operations & Revenue Platform
              </p>
            </div>
          </div>

          {/* Operator Identity & Accountability Badge (Anti-Anonymous Proof) */}
          <div className="flex items-center gap-3 rounded-xl bg-slate-900/90 border border-slate-800 px-3 py-1.5 shadow-inner">
            <div className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </div>
            <div className="text-left text-xs">
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-slate-400">Operating As:</span>
                <span className="font-semibold text-slate-200 flex items-center gap-1">
                  <UserCheck className="h-3 w-3 text-cyan-400" />
                  {operatorName}
                </span>
                <span className="rounded bg-slate-800 px-1.5 py-0.2 text-[10px] font-mono text-cyan-300 border border-slate-700">
                  {user?.role?.toUpperCase()}
                </span>
              </div>
              <div className="text-[10px] text-slate-500 truncate max-w-[240px] sm:max-w-[320px]">
                {user?.email} • Verified Session
              </div>
            </div>
          </div>

          {/* Quick Controls */}
          <div className="flex items-center gap-2">
            <Link
              href="/portals"
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900/80 px-3 py-1.5 text-xs font-medium text-slate-300 transition hover:bg-slate-800 hover:text-white"
              title="Return to standard company portals"
            >
              <ArrowLeft className="h-3.5 w-3.5 text-slate-400" />
              <span className="hidden md:inline">Exit to</span> Portals
            </Link>
            <button
              onClick={() => {
                logout();
                router.push("/login");
              }}
              className="inline-flex items-center gap-1.5 rounded-lg border border-rose-900/40 bg-rose-950/20 px-3 py-1.5 text-xs font-medium text-rose-300 transition hover:bg-rose-900/40 hover:text-rose-100"
              title="End authenticated operator session"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span className="hidden md:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Workspace Body */}
      <main className="mx-auto max-w-[1700px] p-4 sm:p-6 lg:p-8">
        {children}
      </main>
    </div>
  );
}
