import type { Metadata } from "next";
import AppPortalView from "./AppPortalView";
import WhatsAppChat from "@/components/whatsapp/WhatsAppChat";
import { buildMetadata } from "@/lib/metadata";

export const metadata: Metadata = buildMetadata({
  title: "TMI Portals App | Android APK & Progressive Web App",
  description:
    "Official mobile application and installable portal suite for Tauqeer Mustafa Inc. Dedicated workspaces for Employees, Admin, and Management. Download the Android APK or install the PWA.",
  path: "/app",
});

export default function AppPortalPage() {
  return (
    <>
      <AppPortalView />
      <WhatsAppChat />
    </>
  );
}
