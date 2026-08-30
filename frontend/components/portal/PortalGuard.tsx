"use client";

import { useRouter, usePathname } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { useCurrentUser } from "@/hooks/useAuth";
import { useAuthContext } from "@/providers/auth-provider";

export default function PortalGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated } = useAuthContext();
  const { data, isError } = useCurrentUser();

  const user = data?.data;
  const stillChecking = !user && !isError;
  const loginUrl = pathname.includes("/admin") ? "/admin/login" : "/employees/login";

  useEffect(() => {
    if (!isAuthenticated || isError) {
      router.replace(loginUrl);
    }
  }, [isAuthenticated, isError, router, loginUrl]);

  if (!isAuthenticated) {
    return null;
  }

  if (stillChecking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--adm-bg)] text-[var(--adm-text-3)]">
        Checking your session...
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[var(--adm-bg)] px-6 text-center text-[var(--adm-text)]">
        <p className="text-lg font-semibold">
          Your session has expired or is invalid.
        </p>
        <a
          href={loginUrl}
          className="rounded-none bg-[var(--adm-blue)] px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
        >
          Back to login
        </a>
      </div>
    );
  }

  // Admin access check for /admin routes
  if (pathname.includes("/admin") && user?.role !== "ADMIN" && user?.role !== "SUPER_ADMIN" && user?.role !== "admin") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[var(--adm-bg)] px-6 text-center text-[var(--adm-text)]">
        <p className="text-lg font-semibold">
          This account does not have admin access.
        </p>
        <a
          href="/dashboard"
          className="rounded-none bg-[var(--adm-blue)] px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
        >
          Go to Employee Dashboard
        </a>
      </div>
    );
  }

  return <>{children}</>;
}
