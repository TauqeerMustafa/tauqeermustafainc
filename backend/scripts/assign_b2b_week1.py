"""
B2B Week-1 Onboarding Script
=============================
Assigns first-week tasks to all active B2B (member-role) employees,
emails each person on BOTH their personal email AND their company
@tauqeermustafa.tech address, and posts a company-wide announcement.

Usage:
    python -m scripts.assign_b2b_week1 [--start-date YYYY-MM-DD] [--dry-run]

    --start-date  Trial/week start date (defaults to today).
    --dry-run     Print what would happen without touching the API.

Environment:
    API_BASE_URL   (default: https://api.tauqeermustafa.tech)
    ADMIN_EMAIL
    ADMIN_PASSWORD
"""

from __future__ import annotations

import argparse
import json
import os
import sys
from datetime import date, timedelta
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

try:
    import httpx
except ImportError:
    sys.exit("httpx not installed. Run: pip install httpx")

# ---------------------------------------------------------------------------
# Config
# ---------------------------------------------------------------------------
API_BASE = os.getenv("API_BASE_URL", "https://api.tauqeermustafa.tech").rstrip("/")
ADMIN_EMAIL = os.getenv("ADMIN_EMAIL", "admin@tauqeermustafa.tech")
ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD", "")

# ---------------------------------------------------------------------------
# Week-1 task set  (days 0-7, from playbooks.ts  BD_B2B_TRIAL)
# ---------------------------------------------------------------------------
WEEK1_TASKS = [
    {
        "title": "Read and sign the Trial Engagement Declaration",
        "description": (
            "Read all eleven sections, not just the signature block. It sets out what "
            "the trial is (14 calendar days, non-salaried, not employment), what it can "
            "lead to (a salary offer at the declared rate, or a Certificate of "
            "Participation), and what binds you afterwards: confidentiality with no "
            "expiry, company ownership of every lead and script you produce, and no "
            "soliciting any prospect from this trial for 12 months. Tick each "
            "acknowledgement, sign, and return it to HR. Nothing else on this board "
            "starts until it is signed."
        ),
        "priority": "high",
        "due_in_days": 0,
    },
    {
        "title": "Set up your workspace — and keep company data inside it",
        "description": (
            "Sign in to the portal, change the temporary password from Settings, "
            "complete your profile, and check in on Attendance. Then the rule that "
            "matters: the portal is the only place company data lives. No personal "
            "spreadsheets, no personal cloud, no screenshots of leads or dashboards, "
            "nothing forwarded to a personal address. That is clause 5.3 of what you "
            "signed, and it is the one breach that ends a trial immediately."
        ),
        "priority": "high",
        "due_in_days": 0,
    },
    {
        "title": "Learn the three services you are selling",
        "description": (
            "You pitch three lines, and only three: cybersecurity consulting, financial "
            "compliance, and SEO/AdSense management. For each one write down, in your "
            "own words, the problem it solves, the kind of SME that has that problem, "
            "and the one sentence you would open a call with. Then learn the limit: you "
            "never quote a price, promise a date, or invent a capability. If a prospect "
            "asks, you say you will confirm and come back — that is clause 9.2, and "
            "inventing an answer is grounds for termination."
        ),
        "priority": "high",
        "due_in_days": 1,
    },
    {
        "title": "Read the lead-gen playbook and learn the stages",
        "description": (
            "Open Lead Playbook in the sidebar, under Company. Learn what each pipeline "
            "stage means: new (in the book, not contacted), contacted (first message "
            "delivered), follow_up (needs a second touch, follow-up date set), qualified "
            "(confirmed need and you know who signs), proposal_sent, won, lost. Learn "
            "the intake rule too — no lead without a next follow-up date. Ask before you guess."
        ),
        "priority": "high",
        "due_in_days": 1,
    },
    {
        "title": "Build your first 20 SME prospects in the pipeline",
        "description": (
            "My Pipeline -> New Lead, 20 times. SMEs only — big enough to have the "
            "problem and a budget, small enough that the person who owns the decision "
            "will take your call. Every field you know goes in: company, contact person, "
            "job title, email, phone, industry, source (linkedin / email / cold_call / "
            "referral), estimated value, and a next follow-up date. Enter each one "
            "directly in the portal as you find it. A lead with no follow-up date is a "
            "lead you will forget."
        ),
        "priority": "high",
        "due_in_days": 2,
    },
    {
        "title": "First-touch all 20 on the approved script",
        "description": (
            "Contact all 20 through approved channels only — email, LinkedIn, or phone "
            "— using the outreach script and messaging you were given. Do not rewrite "
            "the pitch and do not reach anyone through a channel that is not on that "
            "list (clauses 3.5 and 3.6). Log the touch the moment it happens (call, "
            "email or meeting) with what was actually said, then move the lead to "
            "contacted. If they replied and want more, move it to follow_up and set the date."
        ),
        "priority": "high",
        "due_in_days": 3,
    },
    {
        "title": "Start the daily check-in and activity report",
        "description": (
            "Every working day of the trial, not just today: attend the check-in, then "
            "before you log off send the day's activity report — outreach sent by "
            "channel, responses handled, discovery calls booked, leads moved, and what "
            "is blocking you. The portal already shows the numbers; the report is where "
            "you say what they mean. Clause 3.4 makes this a condition of the trial, "
            "and a missed report counts against the daily-activity metric."
        ),
        "priority": "high",
        "due_in_days": 3,
    },
    {
        "title": "Book your first 2 discovery calls",
        "description": (
            "This is the metric the trial is judged on (clause 4.1), so it starts now "
            "rather than in week two. A discovery call counts when a named decision-maker "
            "has agreed a time to talk about their own problem — not a maybe, not a "
            "brochure request. Log the booking as a meeting activity on the lead, set "
            "the follow-up date to the day of the call, and move the lead to qualified "
            "once the need and the budget owner are confirmed."
        ),
        "priority": "high",
        "due_in_days": 5,
    },
    {
        "title": "Week one close: 40 SME prospects, follow-ups at zero",
        "description": (
            "Take the pipeline to 40 SME leads with complete intake, and take Follow-ups "
            "due to zero before you finish. At least 25 first touches logged, at least "
            "10 leads in contacted, at least 5 in follow_up with a future date. No lead "
            "untouched for three or more days, and no lead without a follow-up date."
        ),
        "priority": "medium",
        "due_in_days": 7,
    },
    {
        "title": "Week-one self-review against the evaluation criteria",
        "description": (
            "Score yourself on the four things the trial is actually measured on "
            "(clause 4): discovery calls booked, pipeline quality (complete entries, "
            "follow-up cadence, engagement), daily activity volume, and professionalism "
            "in outreach and reporting. Write it as a short note to your manager: the "
            "number for each, what worked, what did not, and what you are changing for "
            "week two. Honest beats flattering — the portal shows the same numbers you do."
        ),
        "priority": "medium",
        "due_in_days": 7,
    },
]

# ---------------------------------------------------------------------------
# Email content
# ---------------------------------------------------------------------------
TASK_EMAIL_SUBJECT = "Your Week 1 Tasks — B2B Business Development Trial · Tauqeer Mustafa Inc"

ANNOUNCEMENT_TITLE = "B2B Business Development Trial — Week 1 Tasks Assigned"
ANNOUNCEMENT_BODY = """We have officially kicked off the **14-day B2B Business Development trial**.

All enrolled team members have their **Week 1 task boards live** on the employee portal, and notification emails have gone out to both their personal and company inboxes.

**Week 1 task board (days 0-7)**

| # | Task | Priority | Due |
|---|------|----------|-----|
| 1 | Read and sign the Trial Engagement Declaration | HIGH | Day 0 |
| 2 | Set up workspace and portal credentials | HIGH | Day 0 |
| 3 | Learn the three service lines | HIGH | Day 1 |
| 4 | Read the Lead-Gen Playbook | HIGH | Day 1 |
| 5 | Build first 20 SME prospects in the pipeline | HIGH | Day 2 |
| 6 | First-touch all 20 on the approved script | HIGH | Day 3 |
| 7 | Start daily check-in and activity report | HIGH | Day 3 |
| 8 | Book first 2 discovery calls | HIGH | Day 5 |
| 9 | Week-close: 40 prospects, follow-ups at zero | MEDIUM | Day 7 |
| 10 | Week-one self-review against evaluation criteria | MEDIUM | Day 7 |

**The most important reminder**: everything company data-related lives in the portal only. No personal spreadsheets, no personal cloud, no forwarded screenshots (Declaration clause 5.3).

Good luck to everyone on the trial. Management is watching the pipeline and cheering you on.

— Tauqeer Mustafa Inc, Human Resources"""


def _due_date_str(start: date, days: int) -> str:
    d = start + timedelta(days=days)
    return d.strftime("%A, %d %b %Y")


def task_email_body(name: str, start: date) -> str:
    first = name.split()[0] if name.strip() else "there"
    lines = []
    for i, t in enumerate(WEEK1_TASKS, 1):
        due_str = _due_date_str(start, t["due_in_days"])
        lines.append(f"  {i:>2}. [{t['priority'].upper()}]  {t['title']}")
        lines.append(f"       Due: {due_str}")
        lines.append("")
    task_block = "\n".join(lines)

    return f"""Hi {first},

Welcome to your first week on the B2B Business Development trial at Tauqeer Mustafa Inc.

Your ten Week-1 tasks are now live on your portal board. They follow the Trial Engagement
Declaration you signed clause-for-clause, so nothing here should be a surprise — but read
every card in full before you start, because the description is the instruction.

WEEK 1 TASK BOARD
----------------------------------------------------------------------
{task_block}----------------------------------------------------------------------

WHERE TO FIND YOUR TASKS
  Portal    https://portals.tauqeermustafa.tech/employees/login
  Once signed in, go to  Tasks -> My Tasks  to see every card with full details.

TWO RULES THAT MATTER MORE THAN EVERYTHING ELSE THIS WEEK

  1. Company data stays in the portal.
     No spreadsheets. No personal cloud. No screenshots.
     Clause 5.3 of the Declaration — the one breach that ends a trial immediately.

  2. Log every touch the moment it happens.
     A lead with no follow-up date is a lead you have already lost.
     A touch that is not logged did not happen.

The trial is judged on four numbers: discovery calls booked, pipeline quality,
daily activity volume, and professionalism. You can see all four on your dashboard
at any time. Your manager sees the same view.

If something is unclear, ask before you guess.

Welcome aboard.

— Tauqeer Mustafa Inc
  Human Resources
"""


# ---------------------------------------------------------------------------
# API helpers
# ---------------------------------------------------------------------------

def login(client: httpx.Client) -> str:
    resp = client.post(
        f"{API_BASE}/auth/login",
        json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD},
    )
    if resp.status_code != 200:
        sys.exit(f"Login failed ({resp.status_code}): {resp.text[:300]}")
    data = resp.json()
    token = (
        data.get("access_token")
        or (data.get("data") or {}).get("access_token")
    )
    if not token:
        sys.exit(f"No token in login response: {json.dumps(data)[:300]}")
    return token


def get_b2b_members(client: httpx.Client, token: str) -> list[dict]:
    headers = {"Authorization": f"Bearer {token}"}
    resp = client.get(
        f"{API_BASE}/admin/users",
        headers=headers,
        params={"page": 1, "pageSize": 200},
    )
    if resp.status_code != 200:
        sys.exit(f"Could not fetch users ({resp.status_code}): {resp.text[:300]}")

    body = resp.json()
    if isinstance(body, dict) and "data" in body:
        items = body["data"]
        if isinstance(items, dict) and "items" in items:
            items = items["items"]
    else:
        items = body if isinstance(body, list) else []

    return [
        u for u in items
        if u.get("role_slug") == "member" and u.get("status") == "approved"
    ]


def assign_tasks(
    client: httpx.Client,
    token: str,
    user_id: str,
    start: date,
    dry_run: bool,
) -> None:
    headers = {"Authorization": f"Bearer {token}"}
    for t in WEEK1_TASKS:
        payload = {
            "title": t["title"],
            "description": t["description"],
            "priority": t["priority"],
            "status": "todo",
            "due_date": (start + timedelta(days=t["due_in_days"])).isoformat(),
            "assigned_to_ids": [user_id],
        }
        if dry_run:
            print(f"    [DRY-RUN] Would create: {t['title'][:65]}")
            continue

        resp = client.post(f"{API_BASE}/tasks", headers=headers, json=payload)
        if resp.status_code in (200, 201):
            print(f"    + Task: {t['title'][:65]}")
        else:
            print(f"    ! Task FAILED [{resp.status_code}]: {t['title'][:65]}")
            print(f"      {resp.text[:200]}")


def send_email(
    client: httpx.Client,
    token: str,
    to_address: str,
    name: str,
    start: date,
    dry_run: bool,
    label: str = "",
) -> None:
    if dry_run:
        print(f"    [DRY-RUN] Would email ({label}): {to_address}")
        return

    headers = {"Authorization": f"Bearer {token}"}
    body_text = task_email_body(name, start)

    # Primary: staff-messages send route
    resp = client.post(
        f"{API_BASE}/staff-messages/send",
        headers=headers,
        json={"to": to_address, "subject": TASK_EMAIL_SUBJECT, "body": body_text},
    )
    if resp.status_code in (200, 201):
        print(f"    + Email ({label}): {to_address}")
        return

    # Fallback: schedule via /mail/scheduled (dispatched on next cron tick)
    from datetime import datetime, timezone, timedelta as td
    send_at = (datetime.now(timezone.utc) + td(minutes=2)).isoformat()
    resp2 = client.post(
        f"{API_BASE}/mail/scheduled",
        headers=headers,
        json={
            "to": [to_address],
            "subject": TASK_EMAIL_SUBJECT,
            "text": body_text,
            "send_at": send_at,
        },
    )
    if resp2.status_code in (200, 201):
        print(f"    + Email scheduled ({label}): {to_address}")
    else:
        print(f"    ! Email FAILED ({label}) [{resp2.status_code}]: {to_address}")
        print(f"      {resp2.text[:200]}")


def post_announcement(client: httpx.Client, token: str, dry_run: bool) -> None:
    if dry_run:
        print(f"\n[DRY-RUN] Would post announcement: {ANNOUNCEMENT_TITLE}")
        return

    headers = {"Authorization": f"Bearer {token}"}
    resp = client.post(
        f"{API_BASE}/announcements",
        headers=headers,
        json={"title": ANNOUNCEMENT_TITLE, "body": ANNOUNCEMENT_BODY, "is_published": True},
    )
    if resp.status_code in (200, 201):
        print(f"\n+ Announcement posted: {ANNOUNCEMENT_TITLE}")
    else:
        print(f"\n! Announcement FAILED [{resp.status_code}]: {resp.text[:300]}")


# ---------------------------------------------------------------------------
# Entry point
# ---------------------------------------------------------------------------

def main() -> None:
    parser = argparse.ArgumentParser(
        description="Assign B2B Week-1 tasks and notify employees by email"
    )
    parser.add_argument(
        "--start-date",
        default=date.today().isoformat(),
        help="Trial start date YYYY-MM-DD (default: today)",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Print what would happen without making any API calls",
    )
    args = parser.parse_args()

    try:
        start = date.fromisoformat(args.start_date)
    except ValueError:
        sys.exit("--start-date must be YYYY-MM-DD")

    dry_run: bool = args.dry_run

    if not dry_run and not ADMIN_PASSWORD:
        sys.exit(
            "Set ADMIN_PASSWORD before running (or use --dry-run).\n\n"
            "  PowerShell:\n"
            "    $env:ADMIN_PASSWORD = 'your-admin-password'\n"
            "    python -m scripts.assign_b2b_week1\n"
        )

    print(f"{'[DRY-RUN] ' if dry_run else ''}B2B Week-1 Onboarding")
    print(f"  API:        {API_BASE}")
    print(f"  Admin:      {ADMIN_EMAIL}")
    print(f"  Start date: {start.isoformat()}")
    print()

    with httpx.Client(timeout=30.0) as client:
        # Authenticate
        if dry_run:
            token = "dry-run-token"
        else:
            print("Logging in...")
            token = login(client)
            print("  Logged in.\n")

        # Fetch B2B members
        if dry_run:
            members = [
                {
                    "id": "00000000-0000-0000-0000-000000000001",
                    "name": "Demo Employee",
                    "email": "demo@example.com",
                    "openemail_address": "demo@tauqeermustafa.tech",
                    "role_slug": "member",
                }
            ]
            print("[DRY-RUN] Using placeholder employee.\n")
        else:
            print("Fetching active B2B members (role=member)...")
            members = get_b2b_members(client, token)
            if not members:
                print("  No active B2B members found. Nothing to do.")
                return
            print(f"  Found {len(members)} B2B member(s).\n")

        # Process each member
        for emp in members:
            user_id = str(emp.get("id") or emp.get("user_id", ""))
            name = (
                emp.get("name")
                or f"{emp.get('first_name', '')} {emp.get('last_name', '')}".strip()
                or "Team Member"
            )
            personal_email = emp.get("email", "")
            company_email = emp.get("openemail_address", "")

            print(f"-- {name}")
            print(f"   Personal : {personal_email or '(none)'}")
            print(f"   Company  : {company_email or '(none)'}")

            # Assign week-1 tasks
            print("   Assigning 10 week-1 tasks...")
            assign_tasks(client, token, user_id, start, dry_run)

            # Email personal address
            if personal_email:
                send_email(client, token, personal_email, name, start, dry_run, label="personal")
            else:
                print("   (no personal email — skipped)")

            # Email company address (only if different)
            if company_email and company_email.lower() != personal_email.lower():
                send_email(client, token, company_email, name, start, dry_run, label="company")
            elif company_email:
                print(f"   (company email same as personal — sent once only)")
            else:
                print("   (no company email — skipped)")

            print()

        # Post announcement
        post_announcement(client, token, dry_run)

    print("\nDone.")
    if dry_run:
        print("(Dry-run complete — no changes made. Remove --dry-run to execute.)")


if __name__ == "__main__":
    main()
