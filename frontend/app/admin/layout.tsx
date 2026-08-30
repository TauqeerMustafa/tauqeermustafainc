"use client";

import { ReactNode, useState } from "react";
import { usePathname } from "next/navigation";

import PortalGuard from "@/components/portal/PortalGuard";
import PortalSidebar from "@/components/portal/PortalSidebar";
import PortalHeader from "@/components/portal/PortalHeader";

export default function AdminLayout({ children }: { children: ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const pathname = usePathname();

  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  return (
    <PortalGuard>
      <div className="flex min-h-screen" style={{ background: "var(--adm-bg)" }}>
        <PortalSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
        <div className="flex min-w-0 flex-1 flex-col">
          <PortalHeader onMenuClick={() => setIsSidebarOpen(true)} />
          <main className="adm-page flex-1 p-4 sm:p-6 lg:p-8 max-w-[1400px] mx-auto w-full">
            {children}
          </main>
        </div>
      </div>
    </PortalGuard>
  );
}
