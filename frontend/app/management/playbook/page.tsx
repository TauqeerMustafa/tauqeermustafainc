/**
 * Management → Lead Playbook.
 *
 * The same single copy the employees read, so a lead reviewing someone's numbers
 * is holding them to the rules that person was actually given.
 */

import { PortalPageHeader } from "@/components/portal/PortalUI";
import { PlaybookDoc } from "@/components/portal/PlaybookDoc";
import PlaybookPanel from "@/components/portal/PlaybookPanel";
import { loadPlaybookMarkdown } from "@/lib/content";

export const dynamic = "force-static";

export const metadata = { title: "Lead Playbook" };

export default function ManagementPlaybookPage() {
  const markdown = loadPlaybookMarkdown();

  return (
    <div className="flex flex-col gap-8">
      <PortalPageHeader
        title="Lead Playbook"
        description="The standard your team is held to: sources, stages, logging, and the week-one targets."
      />
      <PlaybookPanel>
        <PlaybookDoc markdown={markdown} />
      </PlaybookPanel>
    </div>
  );
}
