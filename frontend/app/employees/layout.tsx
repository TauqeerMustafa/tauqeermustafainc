import type { ReactNode } from "react";

import PortalShell from "@/components/portal/PortalShell";
import { PORTAL } from "@/lib/rbac";

export default function EmployeesLayout({ children }: { children: ReactNode }) {
  return (
    <PortalShell portal={PORTAL.EMPLOYEES} publicPaths={["/employees/login"]}>
      {children}
    </PortalShell>
  );
}
