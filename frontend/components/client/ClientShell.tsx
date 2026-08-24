"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ReactNode } from "react";
import { LogOut, MessageCircle, Settings2 } from "lucide-react";
import { clearClientToken } from "@/lib/client-auth";

export default function ClientShell({ children }: { children: ReactNode }) {
  const router = useRouter();
  function logout() { clearClientToken(); router.replace("/client/login"); }
  return <div className="min-h-screen bg-[#f3f0ee] text-[#141413]"><div className="m-stripe" aria-hidden="true" /><header className="border-b border-[#262626] bg-[#1a2129] text-white"><div className="mx-auto flex max-w-[1440px] items-center justify-between gap-6 px-5 py-5 sm:px-8 lg:px-12"><Link href="/client/dashboard" className="font-mono text-[11px] font-bold uppercase tracking-[0.14em]">TMI / CLIENT PORTAL</Link><nav className="hidden items-center gap-6 md:flex" aria-label="Client portal navigation"><Link href="/client/dashboard" className="font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-white/70 transition hover:text-white">Overview</Link><Link href="#messages" className="inline-flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-white/70 transition hover:text-white"><MessageCircle className="h-3.5 w-3.5" aria-hidden /> Messages</Link><Link href="#settings" className="inline-flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-white/70 transition hover:text-white"><Settings2 className="h-3.5 w-3.5" aria-hidden /> Settings</Link></nav><button type="button" onClick={logout} className="inline-flex min-h-10 items-center gap-2 border border-white/25 px-3 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-white/75 transition hover:border-white hover:text-white"><LogOut className="h-3.5 w-3.5" aria-hidden /> Sign out</button></div></header>{children}</div>;
}
