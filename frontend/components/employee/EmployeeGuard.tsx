"use client";

import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";

import { useCurrentUser } from "@/hooks/useAuth";
import { useAuthContext } from "@/providers/auth-provider";

export default function EmployeeGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { isAuthenticated } = useAuthContext();
  const { data, isError } = useCurrentUser();

  const user = data?.data;
  const isApproved = Boolean(user && user.status === "approved");
  const stillChecking = !user && !isError;

  useEffect(() => {
    if (!isAuthenticated || isError) {
      router.replace("/employees/login");
    }
  }, [isAuthenticated, isError, router]);

  if (!isAuthenticated) {
    return null;
  }

  if (stillChecking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f3f0ee] text-[#5a5a5a]">
        Checking your session...
      </div>
    );
  }

  if (isError || !isApproved) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#f3f0ee] px-6 text-center text-[#141413]">
        <p className="text-lg font-semibold">
          {isError ? "Your session has expired." : "Your account is not approved or active."}
        </p>
        <a
          href="/employees/login"
          className="rounded-[20px] bg-[#141413] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#2a2a28]"
        >
          Back to login
        </a>
      </div>
    );
  }

  return <>{children}</>;
}

