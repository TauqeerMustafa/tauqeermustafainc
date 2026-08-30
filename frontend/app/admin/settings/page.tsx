import AccountSettings from "@/components/portal/AccountSettings";
import { PortalPageHeader } from "@/components/portal/PortalUI";

export default function AdminSettings() {
  return (
    <div className="flex flex-col gap-8">
      <PortalPageHeader title="Settings" description="Your profile, password, and access." />
      <AccountSettings />
    </div>
  );
}
