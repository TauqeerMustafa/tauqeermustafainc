import { ReactNode } from "react";
import PortalLayout from "@/components/portal/PortalLayout";

export default function Layout({ children }: { children: ReactNode }) {
  return <PortalLayout>{children}</PortalLayout>;
}
