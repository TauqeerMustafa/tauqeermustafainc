"use client";

/**
 * Employee → My Pipeline. The same workbench management uses, except an
 * Employee holds only own-scope `leads.*` grants (f1b7c3d9e482), so `/leads`
 * returns their book and nobody else's — the filtering is the API's job, not
 * this page's.
 */

import LeadWorkbench from "@/components/portal/LeadWorkbench";

export default function EmployeePipelinePage() {
  return (
    <LeadWorkbench
      title="My Pipeline"
      description="Your own lead book: source it, work it, log every touch, close it."
    />
  );
}
