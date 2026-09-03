"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ReactNode } from "react";
import { LogOut, MessageCircle, Settings2 } from "lucide-react";
import { clearClientToken } from "@/lib/client-auth";
import { PORTAL } from "@/lib/rbac";
import { currentLocationPath, loginUrlWithReturnTo } from "@/lib/return-to";

export default function ClientShell({ children }: { children: ReactNode }) {
  const router = useRouter();
  function logout() {
    // Remember the page, so signing back in reopens it rather than the dashboard.
    const back = loginUrlWithReturnTo(PORTAL.CLIENT, currentLocationPath());
    clearClientToken();
    router.replace(back);
  }
  return <div className="bg-canvas text-ink"><header className="border-b border-line bg-surface text-ink"><div className="mx-auto flex max-w-[1440px] items-center justify-between gap-6 px-5 py-5 sm:px-8 lg:px-12"><Link href="/client/dashboard" className="font-mono text-[11px] font-bold uppercase tracking-[0.14em]">TMI / PORTALS</Link><nav className="hidden items-center gap-6 md:flex" aria-label="Client portal navigation"><Link href="/client/dashboard" className="font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-ink-muted transition hover:text-ink">Overview</Link><Link href="#messages" className="inline-flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-ink-muted transition hover:text-ink"><MessageCircle className="h-3.5 w-3.5" aria-hidden /> Messages</Link><Link href="#settings" className="inline-flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-ink-muted transition hover:text-ink"><Settings2 className="h-3.5 w-3.5" aria-hidden /> Settings</Link></nav><button type="button" onClick={logout} className="inline-flex min-h-10 items-center gap-2 border border-line-2 px-3 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-ink-muted transition hover:border-ink hover:text-ink"><LogOut className="h-3.5 w-3.5" aria-hidden /> Sign out</button></div></header>{children}</div>;
}
