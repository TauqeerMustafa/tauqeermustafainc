/**
 * Server-only loader for the documents kept as markdown under `content/`.
 *
 * `content/lead-gen-playbook.md` is the single copy of the lead-generation plan:
 * the root `LEAD-GEN-PLAYBOOK.md` only points here, and the trial task set in
 * `constants/playbooks.ts` sends new starters to the portal page that renders
 * it. A plan that changes in one place cannot leave a stale copy behind.
 *
 * Read synchronously at module scope so the pages that use it prerender into the
 * static shell (Next 16 includes deterministic sync I/O in the prerender). The
 * pages set `dynamic = "force-static"`, so the file is never touched at runtime
 * and does not need to survive output file tracing.
 */

import { readFileSync } from "node:fs";
import { join } from "node:path";

/** The playbook, or a short stand-in if the file is missing at build time. */
export function loadPlaybookMarkdown(): string {
  try {
    return readFileSync(join(process.cwd(), "content", "lead-gen-playbook.md"), "utf-8");
  } catch {
    // Never blank the page over a missing file: say where it lives instead, so
    // whoever hits this knows what to restore rather than seeing an error.
    return [
      "# Lead Generation Playbook",
      "The playbook could not be loaded. It lives at `frontend/content/lead-gen-playbook.md` — ask an administrator to restore it.",
    ].join("\n\n");
  }
}
