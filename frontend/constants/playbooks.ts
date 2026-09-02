/**
 * Ready-made task sets an admin can drop onto someone's board in one action.
 *
 * These exist because onboarding is the same work every time: the first week of
 * a lead-gen intern is not a judgement call, it is a checklist, and typing eight
 * cards by hand per person is how steps get skipped. `dueInDays` is an offset
 * from the start date the admin picks, so the same set works whenever it starts.
 *
 * The wording deliberately speaks the CRM's own vocabulary — `new`,
 * `contacted`, `follow_up`, `qualified`, and the `call` / `email` / `meeting`
 * activity types — so a task and the record it acts on cannot drift apart.
 */

export type PlaybookTask = {
  title: string;
  description: string;
  priority: "high" | "medium" | "low";
  /** Days after the chosen start date that this card is due. */
  dueInDays: number;
};

export type Playbook = {
  id: string;
  name: string;
  summary: string;
  tasks: PlaybookTask[];
};

const LEAD_GEN_WEEK_ONE: PlaybookTask[] = [
  {
    title: "Set up your workspace",
    description:
      "Sign in to the portal, change the temporary password from Settings, fill in your profile, and check in on Attendance. Do this before anything else — every other task assumes your account is yours.",
    priority: "high",
    dueInDays: 0,
  },
  {
    title: "Read the lead-gen playbook and learn the stages",
    description:
      "Open Lead Playbook in the sidebar, under Company. Learn what each pipeline stage means: new (in the book, not contacted), contacted (first message delivered), follow_up (needs a second touch, follow-up date set), qualified (confirmed need and you know who signs), proposal_sent, won, lost. Ask before you guess.",
    priority: "high",
    dueInDays: 0,
  },
  {
    title: "Build a 40-company target list",
    description:
      "Pick the industry you were assigned. Find 40 companies that fit: they have the problem we solve, and you can name the person who would own the decision. Keep it in a sheet first — one row per company with contact name, job title, email or phone, industry, and where you found them.",
    priority: "high",
    dueInDays: 1,
  },
  {
    title: "Add your first 15 leads with complete intake",
    description:
      "My Pipeline → New Lead, 15 times. Every field that you know goes in: company, contact person, job title, email, phone, industry, source (LinkedIn / cold call / referral / email), estimated value, and a next follow-up date. A lead with no follow-up date is a lead you will forget.",
    priority: "high",
    dueInDays: 1,
  },
  {
    title: "First-touch 15 leads and log every touch",
    description:
      "Contact all 15. Open the lead, log the activity the moment it happens (call, email or meeting) with what was actually said, then move the status to contacted. If they replied and want more, move it to follow_up and set the date.",
    priority: "high",
    dueInDays: 2,
  },
  {
    title: "Finish the target list — 40 leads in the pipeline",
    description:
      "Add the remaining 25 companies as leads with the same complete intake. Same rule: no lead without a next follow-up date.",
    priority: "medium",
    dueInDays: 3,
  },
  {
    title: "Clear every follow-up due and reach 10 contacted",
    description:
      "Start from the Follow-ups due count on My Pipeline and take it to zero. By end of day at least 10 leads are contacted and at least 5 are in follow_up with a future date set.",
    priority: "high",
    dueInDays: 4,
  },
  {
    title: "Week-1 review: 2 qualified leads and a written summary",
    description:
      "Move at least 2 leads to qualified — confirmed need, and you know who signs. On each one, log a note covering the need, the budget owner, and the next step. Then message your manager a short summary: leads added, touches made, what worked, what did not.",
    priority: "medium",
    dueInDays: 5,
  },
];

export const PLAYBOOKS: Playbook[] = [
  {
    id: "lead-gen-week-one",
    name: "Lead generation — week one",
    summary:
      "Onboarding set for a new intern or executive doing outbound: set up, learn the stages, build a 40-company list, first-touch it, and end the week with qualified leads.",
    tasks: LEAD_GEN_WEEK_ONE,
  },
];

/** YYYY-MM-DD for `start` + `dueInDays`, which is what `/tasks` expects. */
export function playbookDueDate(start: string, dueInDays: number) {
  const base = start ? new Date(`${start}T00:00:00`) : new Date();
  base.setDate(base.getDate() + dueInDays);
  return base.toISOString().slice(0, 10);
}
