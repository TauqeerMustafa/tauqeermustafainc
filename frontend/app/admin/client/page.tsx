"use client";

/**
 * Admin → Client CRM. The pipeline is real: `/leads/pipeline` for the totals,
 * `/leads` for the book, both scope-filtered server-side by the caller's
 * `leads.*` grants. Everything a lead needs — full intake fields, status moves,
 * follow-up dates, reassignment and the activity timeline — lives in the shared
 * workbench so the admin console, management and an employee's own book cannot
 * drift apart.
 */

import LeadWorkbench from "@/components/portal/LeadWorkbench";

export default function AdminClientPage() {
  return (
    <LeadWorkbench
      title="Client CRM"
      description="Every lead, who owns it, and what happens next."
    />
  );
}
