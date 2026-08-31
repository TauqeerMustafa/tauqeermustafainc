import { AdminPageHeader } from "@/components/admin/AdminUI";
import Webmail from "@/components/admin/mail/Webmail";

export const dynamic = "force-dynamic";

// Next 16: searchParams is a Promise and must be awaited.
export default async function AdminMailPage({
  searchParams,
}: {
  searchParams: Promise<{ compose?: string; to?: string; subject?: string }>;
}) {
  const sp = await searchParams;
  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Webmail"
        description="Read, reply to, and manage every mailbox in one place."
      />
      <Webmail
        initialTo={sp.to ?? ""}
        initialSubject={sp.subject ?? ""}
        autoCompose={Boolean(sp.compose || sp.to)}
      />
    </div>
  );
}
