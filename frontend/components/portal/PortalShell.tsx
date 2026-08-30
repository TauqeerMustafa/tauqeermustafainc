"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";

import PortalGuard from "@/components/portal/PortalGuard";
import PortalHeader from "@/components/portal/PortalHeader";
import PortalSidebar from "@/components/portal/PortalSidebar";
import type { PortalId } from "@/lib/rbac";

/**
 * The one and only portal chrome. /admin, /employees, /management and /client
 * all mount this; previously each kept its own near-identical copy, so a fix in
 * one silently skipped the others.
 *
 * Routes listed in `publicPaths` (login, register, verify) render bare — they
 * must not be wrapped in the guard that would redirect them to themselves.
 */
export default function PortalShell({
  portal,
  publicPaths = [],
  children,
}: {
  portal: PortalId;
  publicPaths?: string[];
  children: ReactNode;
}) {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Close the drawer on navigation so a mobile tap doesn't leave it covering
  // the page it just opened.
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [pathname]);

  const isPublic = publicPaths.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );

  if (isPublic) {
    return <>{children}</>;
  }

  return (
    <PortalGuard portal={portal}>
      <div className="flex min-h-screen" style={{ background: "var(--adm-bg)" }}>
        <PortalSidebar
          portal={portal}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />
        <div className="flex min-w-0 flex-1 flex-col">
          <PortalHeader portal={portal} onMenuClick={() => setIsSidebarOpen(true)} />
          <main className="adm-page mx-auto w-full max-w-[1400px] flex-1 p-4 sm:p-6 lg:p-8">
            {children}
          </main>
        </div>
      </div>
    </PortalGuard>
  );
}
