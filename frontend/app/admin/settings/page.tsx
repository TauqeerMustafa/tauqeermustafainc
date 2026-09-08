import AccessControlBanner from "@/components/portal/AccessControlBanner";
import AccountSettings from "@/components/portal/AccountSettings";
import { PortalPageHeader } from "@/components/portal/PortalUI";

export default function AdminSettings() {
  return (
    <div className="flex flex-col gap-8">
      <AccessControlBanner active="settings" />
      <PortalPageHeader title="Settings" description="Your profile, password, and access." />
      <AccountSettings />
    </div>
  );
}
