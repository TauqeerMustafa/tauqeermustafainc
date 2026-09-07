import type { ReactNode } from "react";

import PortalShell from "@/components/portal/PortalShell";
import { PORTAL } from "@/lib/rbac";

/**
 * The management portal lives at `/management` on portals.tauqeermustafa.tech,
 * as a sibling of /admin and /employees rather than inside the `(subdomains)`
 * group — that group wraps its children in the marketing header, which would
 * stack a second chrome on top of PortalShell's sidebar and header.
 */
export default function ManagementLayout({ children }: { children: ReactNode }) {
  return (
    <PortalShell portal={PORTAL.MANAGEMENT} publicPaths={["/management/login"]}>
      {children}
    </PortalShell>
  );
}
