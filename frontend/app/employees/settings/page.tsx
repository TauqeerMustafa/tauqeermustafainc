import AccountSettings from "@/components/portal/AccountSettings";
import { PortalPageHeader } from "@/components/portal/PortalUI";

export default function EmployeeSettings() {
  return (
    <div className="flex flex-col gap-8">
      <PortalPageHeader title="Settings" description="Your profile, password, and access." />
      <AccountSettings />
    </div>
  );
}
