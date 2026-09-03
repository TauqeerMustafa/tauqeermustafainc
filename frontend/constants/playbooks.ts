/**
 * Ready-made task sets an admin can drop onto someone's board in one action.
 *
 * These exist because onboarding is the same work every time: the first fortnight
 * of a business development trial is not a judgement call, it is a checklist, and
 * typing thirteen cards by hand per person is how steps get skipped. `dueInDays`
 * is an offset from the start date the admin picks, so the same set works whenever
 * it starts.
 *
 * The wording deliberately speaks the CRM's own vocabulary — `new`, `contacted`,
 * `follow_up`, `qualified`, and the `call` / `email` / `meeting` activity types —
 * so a task and the record it acts on cannot drift apart.
 *
 * The set below tracks the signed **Trial Engagement Declaration** for Business
 * Development Executive (B2B), clause for clause: fourteen calendar days, SME
 * prospects, the three declared service lines, discovery calls booked as the
 * primary metric (4.1), and the daily check-in and activity report (3.4). The
 * declaration itself is `docs/DECLARATION.md`, whose sections 1-10 keep those
 * numbers so a citation here stays true. Two of its rules shape the cards more
 * than the rest:
 *
 *  - **5.3(b) — no company data on personal devices or cloud accounts.** So a
 *    prospect goes straight into My Pipeline. There is no "build the list in a
 *    sheet first" step; that would have a new hire breach the agreement they
 *    signed on day one.
 *  - **3.5 / 3.6 — approved scripts and approved channels only.** So every
 *    outreach card names the channel and points at the provided script rather
 *    than leaving the wording open.
 *
 * Editing the declaration means editing this set. The admin drawer can adjust or
 * drop individual cards per intake, but the defaults here are the contract.
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

const BD_B2B_TRIAL: PlaybookTask[] = [
  {
    title: "Read and sign the Trial Engagement Declaration",
    description:
      "Read all eleven sections, not just the signature block. It sets out what the trial is (14 calendar days, non-salaried, not employment), what it can lead to (a salary offer at the declared rate, or a Certificate of Participation), and what binds you afterwards: confidentiality with no expiry, company ownership of every lead and script you produce, and no soliciting any prospect from this trial for 12 months. Tick each acknowledgement, sign, and return it to HR. Nothing else on this board starts until it is signed.",
    priority: "high",
    dueInDays: 0,
  },
  {
    title: "Set up your workspace — and keep company data inside it",
    description:
      "Sign in to the portal, change the temporary password from Settings, complete your profile, and check in on Attendance. Then the rule that matters: the portal is the only place company data lives. No personal spreadsheets, no personal cloud, no screenshots of leads or dashboards, nothing forwarded to a personal address. That is clause 5.3 of what you signed, and it is the one breach that ends a trial immediately.",
    priority: "high",
    dueInDays: 0,
  },
  {
    title: "Learn the three services you are selling",
    description:
      "You pitch three lines, and only three: cybersecurity consulting, financial compliance, and SEO/AdSense management. For each one write down, in your own words, the problem it solves, the kind of SME that has that problem, and the one sentence you would open a call with. Then learn the limit: you never quote a price, promise a date, or invent a capability. If a prospect asks, you say you will confirm and come back — that is clause 9.2, and inventing an answer is grounds for termination.",
    priority: "high",
    dueInDays: 1,
  },
  {
    title: "Read the lead-gen playbook and learn the stages",
    description:
      "Open Lead Playbook in the sidebar, under Company. Learn what each pipeline stage means: new (in the book, not contacted), contacted (first message delivered), follow_up (needs a second touch, follow-up date set), qualified (confirmed need and you know who signs), proposal_sent, won, lost. Learn the intake rule too — no lead without a next follow-up date. Ask before you guess.",
    priority: "high",
    dueInDays: 1,
  },
  {
    title: "Build your first 20 SME prospects in the pipeline",
    description:
      "My Pipeline → New Lead, 20 times. SMEs only — big enough to have the problem and a budget, small enough that the person who owns the decision will take your call. Every field you know goes in: company, contact person, job title, email, phone, industry, source (linkedin / email / cold_call / referral), estimated value, and a next follow-up date. Enter each one directly in the portal as you find it. A lead with no follow-up date is a lead you will forget.",
    priority: "high",
    dueInDays: 2,
  },
  {
    title: "First-touch all 20 on the approved script",
    description:
      "Contact all 20 through approved channels only — email, LinkedIn, or phone — using the outreach script and messaging you were given. Do not rewrite the pitch and do not reach anyone through a channel that is not on that list (clauses 3.5 and 3.6). Log the touch the moment it happens (call, email or meeting) with what was actually said, then move the lead to contacted. If they replied and want more, move it to follow_up and set the date.",
    priority: "high",
    dueInDays: 3,
  },
  {
    title: "Start the daily check-in and activity report",
    description:
      "Every working day of the trial, not just today: attend the check-in, then before you log off send the day's activity report — outreach sent by channel, responses handled, discovery calls booked, leads moved, and what is blocking you. The portal already shows the numbers; the report is where you say what they mean. Clause 3.4 makes this a condition of the trial, and a missed report counts against the daily-activity metric.",
    priority: "high",
    dueInDays: 3,
  },
  {
    title: "Book your first 2 discovery calls",
    description:
      "This is the metric the trial is judged on (clause 4.1), so it starts now rather than in week two. A discovery call counts when a named decision-maker has agreed a time to talk about their own problem — not a maybe, not a brochure request. Log the booking as a meeting activity on the lead, set the follow-up date to the day of the call, and move the lead to qualified once the need and the budget owner are confirmed.",
    priority: "high",
    dueInDays: 5,
  },
  {
    title: "Week one close: 40 SME prospects, follow-ups at zero",
    description:
      "Take the pipeline to 40 SME leads with complete intake, and take Follow-ups due to zero before you finish. At least 25 first touches logged, at least 10 leads in contacted, at least 5 in follow_up with a future date. No lead untouched for three or more days, and no lead without a follow-up date.",
    priority: "medium",
    dueInDays: 7,
  },
  {
    title: "Week-one self-review against the evaluation criteria",
    description:
      "Score yourself on the four things the trial is actually measured on (clause 4): discovery calls booked, pipeline quality (complete entries, follow-up cadence, engagement), daily activity volume, and professionalism in outreach and reporting. Write it as a short note to your manager: the number for each, what worked, what did not, and what you are changing for week two. Honest beats flattering — the portal shows the same numbers you do.",
    priority: "medium",
    dueInDays: 7,
  },
  {
    title: "Week two: 20 more first touches, every follow-up cleared",
    description:
      "Add 20 more SME prospects and first-touch them on the same approved script, while keeping Follow-ups due at zero every day. Week two is where sourcing volume drops and conversion matters: chase the leads that replied, get past the gatekeeper on the ones that did not, and mark the dead ones lost with the reason in a note. Never delete a lead.",
    priority: "high",
    dueInDays: 10,
  },
  {
    title: "Reach 5 discovery calls booked",
    description:
      "Five booked discovery calls with named SME decision-makers by the end of day 12, cumulative across the trial. Each one has a meeting activity on its lead, a follow-up date set to the call, and notes covering the need, who signs, and the next step. This number is the single strongest input to whether a salary offer is extended.",
    priority: "high",
    dueInDays: 12,
  },
  {
    title: "Trial close-out and handover",
    description:
      "Last working day. Every lead you touched has a complete timeline, a correct stage, and a next follow-up date, so whoever picks up your book can carry the conversation without asking you anything. Write a closing summary: leads added, touches by channel, discovery calls booked, qualified leads with the need and budget owner named. Then confirm in writing that nothing company-owned is left on a personal device or account — clause 6.5 requires it, and the evaluation happens straight after.",
    priority: "high",
    dueInDays: 13,
  },
];

export const PLAYBOOKS: Playbook[] = [
  {
    id: "bd-b2b-trial-14",
    name: "Business Development (B2B) — 14-day trial",
    summary:
      "The full trial engagement for a Business Development Executive: sign the declaration, learn the three service lines, build an SME pipeline in the portal, work it on approved scripts, and be judged on discovery calls booked.",
    tasks: BD_B2B_TRIAL,
  },
];

/** YYYY-MM-DD for `start` + `dueInDays`, which is what `/tasks` expects. */
export function playbookDueDate(start: string, dueInDays: number) {
  const base = start ? new Date(`${start}T00:00:00`) : new Date();
  base.setDate(base.getDate() + dueInDays);
  return base.toISOString().slice(0, 10);
}
