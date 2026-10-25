import json
import time
import os
import urllib.request
import urllib.error

API_KEY = os.environ.get("OPENEMAIL_API_KEY") or "oek_QvxyNrk1tAOyYzAlisEuyRa5mP3LRxSJmaZc_vaJ7es"
MAILBOX_ID = "01M17137MJNRTDR5N92QCAND0P"

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TARGETS_FILE = os.path.join(BASE_DIR, "data", "internship_targets.json")
HTML_FILE = os.path.join(BASE_DIR, "templates", "internship_email.html")
TEXT_FILE = os.path.join(BASE_DIR, "templates", "internship_email.txt")

def main():
    print("=" * 70)
    print("CLOUD B2B INTERNSHIP EMAIL DISPATCHER (Laptop-Independent)")
    print("=" * 70)

    if not os.path.exists(TARGETS_FILE) or not os.path.exists(HTML_FILE):
        print("Required data or template file not found.")
        return

    with open(TARGETS_FILE, "r", encoding="utf-8") as f:
        targets = json.load(f)

    with open(HTML_FILE, "r", encoding="utf-8") as f:
        html_content = f.read()

    with open(TEXT_FILE, "r", encoding="utf-8") as f:
        text_content = f.read()

    total = len(targets)
    delivered = sum(1 for t in targets if t.get("status") == "delivered")
    print(f"Total: {total} | Delivered: {delivered} | Pending: {total - delivered}")

    if delivered >= total:
        print("All emails have already been delivered! Nothing to dispatch.")
        return

    url = f"https://api.open.email/api/v1/mailboxes/{MAILBOX_ID}/send?save=true"
    headers = {
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json",
        "User-Agent": "Qorlune-CloudDispatch/1.0"
    }

    dispatched_in_this_run = 0

    for t in targets:
        if t.get("status") == "delivered":
            continue

        name = t["name"]
        co_email = t["company_email"]
        app_email = t.get("applicant_email")

        to_list = [{"email": co_email, "name": name}]
        if app_email and app_email != co_email:
            to_list.append({"email": app_email, "name": name})

        payload = {
            "from": {"email": "hr@qorlune.co.uk", "name": "Qorlune People Operations"},
            "replyTo": [{"email": "hr@qorlune.co.uk", "name": "Qorlune People Operations"}],
            "to": to_list,
            "subject": "Congratulations on Successfully Completing Your 1-Month B2B Executive Internship — Qorlune LLC",
            "text": text_content,
            "html": html_content
        }

        req = urllib.request.Request(url, data=json.dumps(payload).encode("utf-8"), headers=headers, method="POST")

        try:
            with urllib.request.urlopen(req, timeout=30) as resp:
                resp_data = json.loads(resp.read().decode("utf-8"))
                delivery_id = resp_data.get("deliveryId", "ok")
                t["status"] = "delivered"
                t["delivery_id"] = delivery_id
                t["delivered_at"] = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
                dispatched_in_this_run += 1

                curr_delivered = sum(1 for x in targets if x.get("status") == "delivered")
                print(f"[{curr_delivered}/{total}] [DELIVERED] {name} ({co_email}) | ID: {delivery_id}")

                with open(TARGETS_FILE, "w", encoding="utf-8") as f:
                    json.dump(targets, f, indent=2)

                time.sleep(1.2)

        except urllib.error.HTTPError as e:
            if e.code == 429:
                print("[RATE LIMITED] 429 quota reached. Saving progress and yielding to next cron tick.")
                with open(TARGETS_FILE, "w", encoding="utf-8") as f:
                    json.dump(targets, f, indent=2)
                break
            else:
                err_text = e.read().decode("utf-8", errors="ignore")
                print(f"[HTTP {e.code}] for {name}: {err_text[:120]}")
                t["status"] = "error"
                t["error"] = err_text[:120]
                with open(TARGETS_FILE, "w", encoding="utf-8") as f:
                    json.dump(targets, f, indent=2)

        except Exception as e:
            print(f"[ERROR] for {name}: {e}")
            break

    print(f"Run completed. Dispatched {dispatched_in_this_run} emails in this tick.")

if __name__ == "__main__":
    main()
