import { AdminPageHeader, AdminEmptyState } from "@/components/admin/AdminUI";

export default function AdminClientPage() {
  return (
    <div>
      <AdminPageHeader title="Client Portal" description="Manage client access, invoices, and secure files." />
      <AdminEmptyState title="No clients found" description="Client management tools will appear here." />
    </div>
  );
}
