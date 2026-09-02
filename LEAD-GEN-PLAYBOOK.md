# Lead Generation Playbook

How leads get found, worked, and closed at Tauqeer Mustafa Inc. This is the plan
the portal enforces — every stage name and activity type below is a real value in
the CRM, not a metaphor.

Where the work happens:

| Who | Portal | Page |
| --- | --- | --- |
| Intern / employee | `portals.tauqeermustafa.tech/employees` | **My Pipeline** (own leads only) |
| Exec / team lead | `.../management` | **Pipeline** (own + team) |
| Admin | `.../admin` | **Client CRM** (everything) |

Scope is enforced by the API, not the page: an Employee holds `leads.*.own`
grants, so `/leads` returns their book and nobody else's.

## 1. Who we go after

One industry per person, so the pitch gets sharper with every call instead of
starting over. A company belongs on the list only if both are true:

1. They have the problem we solve — manual internal operations, no client portal,
   a website that does not sell, or spreadsheets doing a system's job.
2. You can name the person who would own the decision. "Someone in IT" is not a
   name.

Bad list entries cost more than missing ones: every one of them eats a follow-up
slot for weeks.

## 2. Where leads come from

The `source` field, in the order that has the best return for a small team:

| Source | What it means | Target share |
| --- | --- | --- |
| `referral` | An existing contact introduced them. Closes fastest. | 10% |
| `linkedin` | Found and approached on LinkedIn. | 50% |
| `email` | Cold email to a named person. | 25% |
| `cold_call` | Phone first. | 15% |
| `other` | Inbound from the website contact form, events, anything else. | — |

Always record the real source. It is the only way to learn which channel is
worth more time next month.

## 3. Intake: what a lead row must contain

A lead is created from **New Lead** with every field you know. Minimum bar:

- Company, contact person, and job title
- Email **or** phone
- Industry
- `source`
- `estimated_value` — a rough, honest number in the right currency
- **`next_follow_up_date` — never blank.** A lead with no follow-up date is a
  lead you have already lost.

One company = one lead. Two contacts at the same company go in the timeline of
the same record.

## 4. Stages, and what each one actually means

| Stage | Enter it when | Exit rule |
| --- | --- | --- |
| `new` | It is in the book. Nobody has been contacted. | Move within 3 days. |
| `contacted` | First message or call was delivered. | Follow-up date set. |
| `follow_up` | They replied, or need a second touch. | Date must be in the future. |
| `qualified` | Need confirmed **and** you know who signs. | Proposal within a week. |
| `proposal_sent` | Scope and price are with them. | Chase on the follow-up date. |
| `won` | Signed. | Hand over to delivery. |
| `lost` | They said no, or went silent after 5 touches. | Log the reason as a note. |

Status changes are logged automatically, so the timeline always shows who moved
what and when.

## 5. Logging: the rule that makes the rest work

Log the touch the moment it happens, using the right type — `call`, `email`,
`meeting`, or `note`. Write what was actually said and what the next step is, not
"followed up".

If it is not in the timeline, it did not happen. A manager reading a lead cold
must be able to pick up the conversation without asking you anything.

## 6. Daily cadence

| Time | What |
| --- | --- |
| 09:00 | Check in on **Attendance**. Read your tasks. |
| 09:15 | Clear **Follow-ups due** first — before anything new. |
| 10:00 | Sourcing: add new leads with complete intake. |
| 13:30 | Outreach: call and email, log every touch, move statuses. |
| 16:00 | Close the day: every lead touched has an activity; tomorrow's follow-up dates set. |
| 17:00 | Check out. |

## 7. Week-one targets per person

Ramp for a new intern or executive. Week two onward, the sourcing target drops
and the conversion targets rise.

| Metric | Target |
| --- | --- |
| Leads added | 40 |
| First touches logged | 25 |
| Moved to `contacted` | 10 |
| In `follow_up` with a future date | 5 |
| Moved to `qualified` | 2 |
| Leads untouched for 3+ days | 0 |
| Leads with no follow-up date | 0 |

The matching task set is on the admin task board under **Assign playbook →
Lead generation — week one**: eight cards, due dates spread across the week.

## 8. Rules

1. Never delete a lead. `lost` with a reason is data; a deleted row is a hole.
2. No lead without a next follow-up date.
3. Log the touch when it happens, not at the end of the week.
4. Do not promise a price, a date, or a feature. Escalate instead.
5. If a lead asks something you cannot answer, say you will find out — then do.

## 9. How performance is read

From the portal, not from a report anyone writes by hand:

- **Follow-ups due** at zero by end of day is the discipline metric.
- **Open value** and stage counts on the funnel show whether sourcing is turning
  into pipeline.
- The timeline density on `qualified` leads shows whether the calls are real.
