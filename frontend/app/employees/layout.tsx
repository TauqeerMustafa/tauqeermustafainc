"use client";
import { ReactNode, useState } from "react";
import { usePathname } from "next/navigation";
import EmployeeGuard from "@/components/employee/EmployeeGuard";
import EmployeeSidebar from "@/components/employee/EmployeeSidebar";
import AdminHeader from "@/components/admin/AdminHeader";

export default function EmployeeLayout({ children }: { children: ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const pathname = usePathname();

  if (pathname === "/employees/login") {
    return <>{children}</>;
  }

  return (
    <EmployeeGuard>
      <div className="flex min-h-screen" style={{ background: "var(--adm-bg)" }}>
        <EmployeeSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
        <div className="flex min-w-0 flex-1 flex-col">
          <AdminHeader onMenuClick={() => setIsSidebarOpen(true)} />
          <main className="adm-page flex-1 p-4 sm:p-6 lg:p-8">
            {children}
          </main>
        </div>
      </div>
    </EmployeeGuard>
  );
}

