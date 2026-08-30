import type { ReactNode } from "react";

import PortalShell from "@/components/portal/PortalShell";
import { PORTAL } from "@/lib/rbac";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <PortalShell portal={PORTAL.ADMIN} publicPaths={["/admin/login"]}>
      {children}
    </PortalShell>
  );
}
