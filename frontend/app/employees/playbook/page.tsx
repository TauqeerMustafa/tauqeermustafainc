/**
 * Employees → Lead Playbook.
 *
 * The plan the week-one task set tells a new starter to read, served to the
 * people who have to follow it. Static: the markdown is fixed at build time, so
 * this prerenders once and costs nothing per view.
 */

import { PortalPageHeader } from "@/components/portal/PortalUI";
import { PlaybookDoc } from "@/components/portal/PlaybookDoc";
import PlaybookPanel from "@/components/portal/PlaybookPanel";
import { loadPlaybookMarkdown } from "@/lib/content";

export const dynamic = "force-static";

export const metadata = { title: "Lead Playbook" };

export default function EmployeePlaybookPage() {
  const markdown = loadPlaybookMarkdown();

  return (
    <div className="flex flex-col gap-8">
      <PortalPageHeader
        title="Lead Playbook"
        description="How we find leads and what is expected of you this week. Work it in My Pipeline."
      />
      <PlaybookPanel>
        <PlaybookDoc markdown={markdown} />
      </PlaybookPanel>
    </div>
  );
}
