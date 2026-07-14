import { ReactNode } from "react";

import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";

type Props = {
  children: ReactNode;
};

export default function AdminLayout({
  children,
}: Props) {
  return (
    <div className="flex min-h-screen bg-[#050816]">

      <AdminSidebar />

      <div className="flex flex-1 flex-col">

        <AdminHeader />

        <main className="flex-1 p-8">
          {children}
        </main>

      </div>

    </div>
  );
}
