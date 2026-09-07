"use client";

import { ReactNode, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getClientToken, setClientToken } from "@/lib/client-auth";
import { PORTAL } from "@/lib/rbac";
import { loginUrlWithReturnTo } from "@/lib/return-to";

export default function ClientGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const url = new URL(window.location.href);
    const callbackToken = url.searchParams.get("token");
    if (callbackToken) {
      setClientToken(callbackToken);
      url.searchParams.delete("token");
      window.history.replaceState({}, "", url.pathname + url.search);
    }
    const token = callbackToken || getClientToken();
    if (!token) {
      // Carry the page we turned away so signing in re-opens the link the
      // client followed, not the dashboard. The token is already stripped from
      // the URL above, so it is never handed back through `next`.
      router.replace(loginUrlWithReturnTo(PORTAL.CLIENT, url.pathname + url.search));
      return;
    }
    const frame = window.requestAnimationFrame(() => setReady(true));
    return () => window.cancelAnimationFrame(frame);
  }, [router]);
  if (!ready) return <div className="flex min-h-[60vh] items-center justify-center bg-[#f3f0ee] text-xs font-mono uppercase tracking-[0.12em] text-[#6a6a6a]">Loading workspace…</div>;
  return <>{children}</>;
}
