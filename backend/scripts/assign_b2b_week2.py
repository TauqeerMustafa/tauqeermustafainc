"""
B2B Week-2 Assignment and Transition Script
===========================================
Assigns Week 2 (Days 8-14) tasks to all active approved B2B team members,
ensures idempotency, and posts the official portal announcement.

Usage:
    python backend/scripts/assign_b2b_week2.py [--dry-run]
"""

import urllib.request
import urllib.error
import json
import os
import sys
import time
from datetime import date

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

BASE_URL = os.getenv("API_BASE_URL", "https://tauqeer-inc-backend.onrender.com").rstrip("/")
ADMIN_EMAIL = os.getenv("ADMIN_EMAIL", "admin@tauqeermustafa.tech")
ADMIN_PW = os.getenv("ADMIN_PASSWORD", "Bushra@0609")

WEEK2_TASKS = [
    {
        "title": "Week 2: 20 more first touches, every follow-up cleared",
        "description": (
            "Add 20 more verified SME accounts via My Pipeline -> New Lead to bring your "
            "cumulative pipeline to 60 leads. Deliver first touches using the approved outreach "
            "scripts across LinkedIn, Email, or Phone. Maintain strict discipline: clear all "
            "pending follow-ups to zero daily. Log every interaction immediately. If a prospect "
            "is unresponsive or disqualified, transition to Lost with a detailed reason note — "
            "never delete a lead."
        ),
        "priority": "high",
        "due_date": "2026-10-01",  # Day 10
        "kpi": "Cumulative 60 SME leads in pipeline, 45 total first touches logged, and 0 overdue follow-ups",
    },
    {
        "title": "Multi-channel follow-up sprint & objection handling",
        "description": (
            "Execute targeted 2nd and 3rd touch follow-up cadences across LinkedIn, Email, and "
            "Phone for all leads currently in Contacted and Follow-Up stages. Apply the core "
            "objection-handling frameworks for common SME pushbacks (budget constraints, timing, "
            "existing vendor, internal handling). Move engaged leads into Follow-Up with future "
            "action dates. Keep overdue follow-ups at absolute zero."
        ),
        "priority": "high",
        "due_date": "2026-10-02",  # Day 11
        "kpi": "Second/third touches logged across all active leads; zero leads untouched for 3+ days",
    },
    {
        "title": "Reach 5 discovery calls booked",
        "description": (
            "Cumulative trial target: Secure at least 5 confirmed discovery calls with verified "
            "SME decision-makers (Founder, CEO, CTO, Managing Director). Log each booking as a "
            "meeting activity on the prospect card, record the identified pain points, confirm the "
            "budget/economic buyer, set the follow-up date to the meeting time, and transition "
            "the lead stage to Qualified. This is the primary metric evaluated for full-time "
            "employment conversion."
        ),
        "priority": "high",
        "due_date": "2026-10-03",  # Day 12
        "kpi": "5 confirmed discovery calls booked with economic decision-makers; meeting notes logged",
    },
    {
        "title": "Trial close-out, closing summary and pipeline handover",
        "description": (
            "Final trial sprint milestone. Complete all active pipeline documentation: verify "
            "every lead has an updated status, timeline activity notes, and scheduled next action "
            "so pipeline handover is seamless. Submit your comprehensive Trial Closing Summary to "
            "HR/Management (total accounts sourced, touches logged by channel, discovery calls "
            "booked, qualified pipeline value). Complete the mandatory Clause 6.5 data compliance "
            "declaration confirming zero company data remains on personal devices."
        ),
        "priority": "high",
        "due_date": "2026-10-05",  # Day 14
        "kpi": "Closing summary submitted, clean CRM pipeline handover, and zero-data compliance declaration completed",
    },
]

ANNOUNCEMENT_TITLE = "📢 B2B Business Development Trial — Week 2 Sprint & Conversion Directives"
ANNOUNCEMENT_BODY = """Team,

We are now officially entering **Week 2 (Days 8 to 14)** of the B2B Business Development Executive trial program!

All active Business Development Executives now have their **Week 2 sprint tasks active on their portal task boards**.

### 🎯 Week 2 Focus: Conversion & Pipeline Velocity
Week 1 was about foundational sourcing, outreach cadence, and CRM hygiene. 
**Week 2 is where sourcing volume drops and conversion carries the score.**

### 📋 Week 2 Sprint Task Schedule
| # | Task | Priority | Due Date | Target / KPI |
|---|---|---|---|---|
| 1 | **Week 2: 20 more first touches, every follow-up cleared** | HIGH | Oct 01, 2026 | Reach 60 SME accounts in pipeline; 0 overdue follow-ups |
| 2 | **Multi-channel follow-up sprint & objection handling** | HIGH | Oct 02, 2026 | 2nd & 3rd touches logged; zero untouched leads |
| 3 | **Reach 5 discovery calls booked** | HIGH | Oct 03, 2026 | 5 confirmed calls with SME decision-makers |
| 4 | **Trial close-out, closing summary and pipeline handover** | HIGH | Oct 05, 2026 | Complete handover summary & Clause 6.5 compliance |

### 🚨 Critical Performance Directives
1. **Discovery Calls Booked is King**: Clause 4.1 makes booked discovery calls with named SME decision-makers the single strongest input into salaried offer decisions.
2. **Follow-Ups Due at ZERO**: Clear your pending follow-ups every morning before taking new actions.
3. **Log Everything in Real Time**: Any interaction not logged on the CRM timeline did not happen.
4. **Data Security (Clause 5.3 & 6.5)**: Company data lives strictly inside the portal (`https://tauqeermustafa.com`). Personal spreadsheets, personal cloud storage, and unapproved tools are strictly prohibited.

View and track your cards at **Tasks -> My Tasks** in the [Employee Portal](https://tauqeermustafa.com/employees/login).

Good luck with your closing sprint! Let's convert these pipelines.

— **Office of Human Resources & Management**  
**Tauqeer Mustafa Inc.**
"""

def request_json(url, method="GET", payload=None, token=None):
    headers = {"Content-Type": "application/json"}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    data = json.dumps(payload).encode() if payload else None
    req = urllib.request.Request(url, data=data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req, timeout=30) as r:
            return True, json.loads(r.read())
    except urllib.error.HTTPError as e:
        body = e.read().decode("utf-8", errors="ignore")
        return False, f"HTTP {e.code}: {body[:250]}"
    except Exception as e:
        return False, str(e)


def main():
    dry_run = "--dry-run" in sys.argv
    print("=" * 70)
    print(f"🚀 TMI B2B WEEK 2 TASK DEPLOYMENT {'[DRY RUN]' if dry_run else ''}")
    print("=" * 70)
    print(f"API Target: {BASE_URL}")

    # 1. Login
    ok, auth_res = request_json(f"{BASE_URL}/auth/login", method="POST", payload={"email": ADMIN_EMAIL, "password": ADMIN_PW})
    if not ok:
        print("❌ Login failed:", auth_res)
        return
    token = auth_res["data"]["accessToken"]
    print("✅ Authenticated as Admin.")

    # 2. Fetch all members
    print("Fetching active approved members...")
    all_users = []
    page = 1
    while True:
        ok, res = request_json(f"{BASE_URL}/admin/users?page={page}&pageSize=50", token=token)
        if not ok:
            print("❌ Failed fetching users page", page, res)
            return
        items = res["data"]["items"]
        pagination = res["data"]["pagination"]
        all_users.extend(items)
        if page >= pagination["totalPages"]:
            break
        page += 1

    members = [u for u in all_users if u.get("roleSlug") == "member" and u.get("status") == "approved"]
    print(f"✅ Found {len(members)} active approved employee members in DB.")

    # 3. Fetch existing tasks to ensure idempotency
    print("Fetching existing tasks for duplicate prevention...")
    existing_tasks = []
    t_page = 1
    while True:
        ok, res = request_json(f"{BASE_URL}/tasks?page={t_page}&pageSize=100", token=token)
        if not ok:
            print("❌ Failed fetching tasks page", t_page, res)
            return
        t_items = res["data"]["items"]
        existing_tasks.extend(t_items)
        if len(existing_tasks) >= res["data"].get("total", 0) or not t_items:
            break
        t_page += 1

    print(f"✅ Existing tasks in DB: {len(existing_tasks)}")

    # Index existing tasks by (user_id, task_title)
    existing_map = set()
    for t in existing_tasks:
        title = t.get("title", "").strip().lower()
        for a in t.get("assignees", []):
            existing_map.add((a.get("id"), title))
        if t.get("assignedToId"):
            existing_map.add((t.get("assignedToId"), title))

    # 4. Assign Week 2 Tasks
    print("\n--- Assigning Week 2 Tasks ---")
    created_count = 0
    skipped_count = 0
    failed_count = 0

    for idx, member in enumerate(members, 1):
        uid = member.get("id")
        name = member.get("name")
        email = member.get("email")

        for task_def in WEEK2_TASKS:
            title_lower = task_def["title"].strip().lower()
            if (uid, title_lower) in existing_map:
                skipped_count += 1
                continue

            payload = {
                "title": task_def["title"],
                "description": task_def["description"],
                "priority": task_def["priority"],
                "status": "todo",
                "due_date": task_def["due_date"],
                "assigned_to_ids": [uid],
            }

            if dry_run:
                print(f"  [DRY RUN] Would assign '{task_def['title'][:35]}...' to {name}")
                created_count += 1
            else:
                ok, t_res = request_json(f"{BASE_URL}/tasks", method="POST", payload=payload, token=token)
                if ok:
                    created_count += 1
                    existing_map.add((uid, title_lower))
                else:
                    failed_count += 1
                    print(f"  ❌ Failed for {name} ({email}): {t_res}")

        if idx % 10 == 0 or idx == len(members):
            print(f"  Progress: {idx}/{len(members)} members processed... (Created: {created_count}, Skipped: {skipped_count}, Failed: {failed_count})")

    print("\n--- Task Assignment Summary ---")
    print(f"  Total Members: {len(members)}")
    print(f"  Tasks Created: {created_count}")
    print(f"  Tasks Skipped (Already existed): {skipped_count}")
    print(f"  Failed: {failed_count}")

    # 5. Post Announcement
    if not dry_run:
        print("\n--- Posting Week 2 Company Announcement ---")
        ann_payload = {
            "title": ANNOUNCEMENT_TITLE,
            "body": ANNOUNCEMENT_BODY,
            "is_published": True,
        }
        ok, ann_res = request_json(f"{BASE_URL}/announcements", method="POST", payload=ann_payload, token=token)
        if ok:
            print("✅ Official Announcement posted successfully! ID:", ann_res.get("data", {}).get("id"))
        else:
            print("❌ Failed posting announcement:", ann_res)
    else:
        print("\n[DRY RUN] Would post Announcement:", ANNOUNCEMENT_TITLE)

    print("\n🎉 Week 2 Task Deployment Complete!")


if __name__ == "__main__":
    main()
