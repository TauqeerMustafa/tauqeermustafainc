import { AdminPageHeader } from "@/components/admin/AdminUI";
import Webmail from "@/components/admin/mail/Webmail";

export const dynamic = "force-dynamic";

export default function EmployeeMessagesPage() {
  return (
    <div className="space-y-6">
      <AdminPageHeader title="Messages" description="Read and reply to your communications." />
      <Webmail />
    </div>
  );
}
