import { AdminPageHeader, AdminEmptyState } from "@/components/admin/AdminUI";

export default function AdminManagementPage() {
  return (
    <div>
      <AdminPageHeader title="Management" description="High-level company metrics, OKRs, and strategic documents." />
      <AdminEmptyState title="No metrics available" description="Executive dashboards and management reporting will appear here." />
    </div>
  );
}
