import { AdminPageHeader, AdminEmptyState } from "@/components/admin/AdminUI";

export default function AdminCommunityPage() {
  return (
    <div>
      <AdminPageHeader title="Community" description="Manage community members, posts, and guidelines." />
      <AdminEmptyState title="No active community reports" description="Community moderation tools will appear here." />
    </div>
  );
}
