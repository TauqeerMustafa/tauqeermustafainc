"use client";

/**
 * The framed panel the playbook pages render inside.
 *
 * A client component purely to own the lucide icon: `Panel` lives in the
 * client-side `PortalUI`, and a server page cannot pass a component (the icon)
 * across the boundary — it fails to serialize at prerender. The playbook pages
 * must stay server components because they read the markdown off disk, so the
 * icon lives here instead.
 */

import { BookOpen } from "lucide-react";
import type { ReactNode } from "react";

import { Panel } from "@/components/portal/PortalUI";

export default function PlaybookPanel({ children }: { children: ReactNode }) {
  return (
    <Panel title="Lead generation playbook" icon={BookOpen}>
      {children}
    </Panel>
  );
}
