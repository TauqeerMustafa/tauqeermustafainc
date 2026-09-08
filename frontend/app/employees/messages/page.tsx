import { AdminPageHeader } from "@/components/admin/AdminUI";
import Webmail from "@/components/admin/mail/Webmail";

export const dynamic = "force-dynamic";

export default function EmployeeMessagesPage() {
  return (
    <div className="space-y-4">
      <AdminPageHeader title="Webmail" description="Your secure company inbox. Read and send messages." />
      <Webmail />
    </div>
  );
}
