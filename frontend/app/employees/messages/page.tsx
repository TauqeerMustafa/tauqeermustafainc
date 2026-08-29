import { AdminPageHeader } from "@/components/admin/AdminUI";
import MailInbox from "@/components/admin/mail/MailInbox";

export const dynamic = "force-dynamic";

export default function EmployeeMessagesPage() {
  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <AdminPageHeader title="Messages" description="View customer communications." />
      <MailInbox />
    </div>
  );
}

