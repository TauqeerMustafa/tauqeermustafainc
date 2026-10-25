import json
import time
import os
import urllib.request
import urllib.error

API_KEY = "oek_QvxyNrk1tAOyYzAlisEuyRa5mP3LRxSJmaZc_vaJ7es"
MAILBOX_ID = "01M17137MJNRTDR5N92QCAND0P"

HTML_PATH = r"E:\Tauqeer\Downloads\Internship_Email\email.html"
TEXT_PATH = r"E:\Tauqeer\Downloads\Internship_Email\email.txt"
LOG_PATH = r"C:\Users\mrtau\.gemini\antigravity\brain\1788bf0d-30ca-4c9e-aea4-362059f64fcd\scratch\internship_email_dispatch_log.json"
B2B_PATH = r"scratch\b2b_week1_assignments.json"

PROGRESS_LOG = r"scratch\internship_completion_live_dispatch_log.json"

def build_targets():
    with open(LOG_PATH, "r", encoding="utf-8") as f:
        old_log = json.load(f)

    old_by_name = {x["name"].strip().lower(): x for x in old_log}
    old_by_prefix = {x["company_email"].split("@")[0].strip().lower(): x for x in old_log}

    with open(B2B_PATH, "r", encoding="utf-8") as f:
        b2b_data = json.load(f)

    bdes = b2b_data.get("bde_assignments", [])

    targets = []
    seen = set()

    # 1. Admin / Founder
    targets.append({
        "name": "Tauqeer Mustafa",
        "company_email": "admin@qorlune.co.uk",
        "applicant_email": "mr.tauqeermustafa@gmail.com",
        "status": "pending"
    })
    seen.add("admin@qorlune.co.uk")

    # 2. All 67 B2B Interns
    for b in bdes:
        name = b.get("name", "").strip()
        co_email = b.get("company_email", "").strip().lower()
        prefix = co_email.split("@")[0]
        
        old_entry = old_by_prefix.get(prefix) or old_by_name.get(name.lower()) or {}
        app_email = old_entry.get("applicant_email")
        if app_email and app_email.strip().lower() in ("n/a", "none", "", co_email):
            app_email = None
        elif app_email:
            app_email = app_email.strip().lower()

        if co_email in seen:
            continue
        seen.add(co_email)

        targets.append({
            "name": name,
            "company_email": co_email,
            "applicant_email": app_email,
            "status": "pending"
        })

    # If progress log exists, merge previous success
    if os.path.exists(PROGRESS_LOG):
        try:
            with open(PROGRESS_LOG, "r", encoding="utf-8") as f:
                prev_targets = json.load(f)
                prev_by_email = {p["company_email"]: p for p in prev_targets}
                for t in targets:
                    if t["company_email"] in prev_by_email:
                        prev = prev_by_email[t["company_email"]]
                        if prev.get("status") == "delivered":
                            t["status"] = "delivered"
                            t["delivery_id"] = prev.get("delivery_id")
                            t["delivered_at"] = prev.get("delivered_at")
        except Exception as e:
            print(f"Warning reading previous log: {e}")

    return targets

def main():
    print("=" * 70, flush=True)
    print("QORLUNE LLC — B2B EXECUTIVE INTERNSHIP COMPLETION EMAIL DISPATCH", flush=True)
    print("=" * 70, flush=True)

    with open(HTML_PATH, "r", encoding="utf-8") as f:
        html_content = f.read()

    with open(TEXT_PATH, "r", encoding="utf-8") as f:
        text_content = f.read()

    targets = build_targets()
    total = len(targets)
    delivered = sum(1 for t in targets if t.get("status") == "delivered")
    print(f"Total Targets: {total} | Already Delivered: {delivered} | Remaining: {total - delivered}", flush=True)

    url = f"https://api.open.email/api/v1/mailboxes/{MAILBOX_ID}/send?save=true"
    headers = {
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json",
        "User-Agent": "Qorlune-InternshipDispatch/2.0"
    }

    for idx, t in enumerate(targets):
        if t.get("status") == "delivered":
            continue

        name = t["name"]
        co_email = t["company_email"]
        app_email = t.get("applicant_email")

        # Recipients: deliver to company email and applicant personal email (if available)
        to_list = [{"email": co_email, "name": name}]
        if app_email and app_email != co_email:
            to_list.append({"email": app_email, "name": name})

        payload = {
            "from": {
                "email": "hr@qorlune.co.uk",
                "name": "Qorlune People Operations"
            },
            "replyTo": [
                {
                    "email": "hr@qorlune.co.uk",
                    "name": "Qorlune People Operations"
                }
            ],
            "to": to_list,
            "subject": "Congratulations on Successfully Completing Your 1-Month B2B Executive Internship — Qorlune LLC",
            "text": text_content,
            "html": html_content
        }

        success = False
        while not success:
            req = urllib.request.Request(
                url,
                data=json.dumps(payload).encode("utf-8"),
                headers=headers,
                method="POST"
            )

            try:
                with urllib.request.urlopen(req, timeout=30) as resp:
                    resp_data = json.loads(resp.read().decode("utf-8"))
                    delivery_id = resp_data.get("deliveryId", "ok")
                    t["status"] = "delivered"
                    t["delivery_id"] = delivery_id
                    t["delivered_at"] = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
                    success = True

                    curr_delivered = sum(1 for x in targets if x.get("status") == "delivered")
                    print(f"[{curr_delivered}/{total}] [DELIVERED] {name} -> {co_email}" + (f" + {app_email}" if app_email else "") + f" | ID: {delivery_id}", flush=True)

                    # Persist progress
                    with open(PROGRESS_LOG, "w", encoding="utf-8") as f:
                        json.dump(targets, f, indent=2)

                    time.sleep(1.2)

            except urllib.error.HTTPError as e:
                err_text = e.read().decode("utf-8", errors="ignore")
                if e.code == 429:
                    retry_after = 60
                    try:
                        err_json = json.loads(err_text)
                        retry_after = int(err_json.get("retryAfterSeconds", 60))
                    except:
                        pass
                    print(f"[RATE LIMITED] HTTP 429 msgs_per_hour. Sleeping {retry_after}s before retry...", flush=True)
                    time.sleep(retry_after)
                else:
                    print(f"[HTTP ERROR {e.code}] for {name} ({co_email}): {err_text[:140]}", flush=True)
                    t["status"] = "error"
                    t["error"] = f"HTTP {e.code}: {err_text[:140]}"
                    with open(PROGRESS_LOG, "w", encoding="utf-8") as f:
                        json.dump(targets, f, indent=2)
                    break

            except Exception as e:
                print(f"[NETWORK ERROR] for {name} ({co_email}): {e}. Retrying in 10s...", flush=True)
                time.sleep(10.0)

    print("\n" + "=" * 70, flush=True)
    delivered_final = sum(1 for x in targets if x.get("status") == "delivered")
    print(f"DISPATCH BATCH COMPLETE: {delivered_final}/{total} Emails Delivered Successfully!", flush=True)
    print("=" * 70, flush=True)

if __name__ == "__main__":
    main()
