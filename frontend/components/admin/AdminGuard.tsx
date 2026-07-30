"use client";

import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";

import { useCurrentUser } from "@/hooks/useAuth";
import { useAuthContext } from "@/providers/auth-provider";

export default function AdminGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { isAuthenticated } = useAuthContext();
  const { data, isError } = useCurrentUser();

  const user = data?.data;
  const isAdmin = Boolean(user && user.role === "admin");
  // Don't trust isLoading alone - right after isAuthenticated flips to true,
  // there's a render where the query is enabled but hasn't started fetching
  // yet, so isLoading can read false with no data and no error. Treat "no
  // answer yet" as still checking, not as denied.
  const stillChecking = !user && !isError;

  useEffect(() => {
    if (!isAuthenticated || isError) {
      router.replace("/login");
    }
  }, [isAuthenticated, isError, router]);

  if (!isAuthenticated) {
    return null;
  }

  if (stillChecking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#050816] text-slate-400">
        Checking your session…
      </div>
    );
  }

  if (isError || !isAdmin) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#050816] px-6 text-center text-white">
        <p className="text-lg font-semibold">
          {isError ? "Your session has expired." : "This account does not have admin access."}
        </p>
        <a
          href="/login"
          className="border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-semibold text-white transition hover:border-yellow-400"
        >
          Back to login
        </a>
      </div>
    );
  }

  return <>{children}</>;
}
