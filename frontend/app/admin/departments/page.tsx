import type { Metadata } from "next";
import PeopleBanner from "@/components/portal/PeopleBanner";
import { DepartmentsManagement } from "@/components/admin/departments/DepartmentsManagement";

export const metadata: Metadata = {
  title: "Departments | Admin Portal",
};

export const dynamic = "force-dynamic";

export default function AdminDepartmentsPage() {
  return (
    <div className="flex flex-col gap-8">
      <PeopleBanner />
      <DepartmentsManagement />
    </div>
  );
}
