"use client";

import { ReactNode, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getClientToken, setClientToken } from "@/lib/client-auth";

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
      router.replace("/client/login");
      return;
    }
    const frame = window.requestAnimationFrame(() => setReady(true));
    return () => window.cancelAnimationFrame(frame);
  }, [router]);
  if (!ready) return <div className="flex min-h-[60vh] items-center justify-center bg-[#f3f0ee] text-xs font-mono uppercase tracking-[0.12em] text-[#6a6a6a]">Loading workspace…</div>;
  return <>{children}</>;
}
