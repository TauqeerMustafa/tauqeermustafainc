import { AdminPageHeader } from "@/components/admin/AdminUI";
import DirectChat from "@/components/portal/DirectChat";

export const metadata = {
  title: "Direct Chat // Staff Portal",
  description: "Direct messaging rail to Department Heads, System Admin, and Management Desk.",
};

export default function EmployeeChatPage() {
  return (
    <div className="space-y-4">
      <AdminPageHeader
        title="Direct Chat"
        description="Direct messaging rail to Department Heads, System Admin, and Management Desk."
      />
      <DirectChat />
    </div>
  );
}
