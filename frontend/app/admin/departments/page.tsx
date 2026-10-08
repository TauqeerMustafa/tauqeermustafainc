"use client";

import PeopleBanner from "@/components/portal/PeopleBanner";
import { DepartmentsManagement } from "@/components/admin/departments/DepartmentsManagement";

export default function AdminDepartmentsPage() {
  return (
    <div className="flex flex-col gap-8">
      <PeopleBanner />
      <DepartmentsManagement />
    </div>
  );
}
