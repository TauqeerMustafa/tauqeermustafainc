import urllib.request
import urllib.error
import json
import concurrent.futures
import csv

API_KEY = "oek_vLhzeeO6fO_owBMaIIkLLzFPAWezb9I-f5H7isSGYug"
BASE_URL = "https://tauqeer-inc-backend.onrender.com"
ADMIN_EMAIL = "admin@qorlune.co.uk"
ADMIN_PASSWORD = "Bushra@0609"

headers_oe = {
    "Authorization": f"Bearer {API_KEY}",
    "User-Agent": "Mozilla/5.0",
    "Content-Type": "application/json"
}

def log(m):
    print(m, flush=True)

def delete_ident(ident_id):
    req = urllib.request.Request(
        f"https://api.open.email/api/v1/identities/{ident_id}",
        headers=headers_oe,
        method="DELETE"
    )
    try:
        with urllib.request.urlopen(req, timeout=10) as r:
            return True, ident_id
    except Exception as e:
        return False, f"{ident_id}: {e}"

def delete_route(addr):
    req = urllib.request.Request(
        f"https://api.open.email/api/v1/routes/{addr}",
        headers=headers_oe,
        method="DELETE"
    )
    try:
        with urllib.request.urlopen(req, timeout=10) as r:
            return True, addr
    except Exception as e:
        return False, f"{addr}: {e}"

def delete_db_user(u_id, token):
    req = urllib.request.Request(
        f"{BASE_URL}/admin/users/{u_id}",
        headers={"Authorization": f"Bearer {token}"},
        method="DELETE"
    )
    try:
        with urllib.request.urlopen(req, timeout=15) as r:
            return True, u_id
    except Exception as e:
        return False, f"{u_id}: {e}"

def main():
    log("=== FAST PURGE INITIALIZATION ===")

    # 1. Open.email Identities
    req_i = urllib.request.Request("https://api.open.email/api/v1/identities", headers=headers_oe)
    with urllib.request.urlopen(req_i) as r:
        identities = json.loads(r.read())["identities"]
    log(f"Current open.email identities: {len(identities)}")

    keep_ident_ids = {"01M17137MJNRTDR5N92QCAND0P", "01M1JHPGC1TJ9VRJMGKBVCAPTR"}
    idents_to_delete = [i for i in identities if i["id"] not in keep_ident_ids and i.get("primaryAddress") not in ["admin@qorlune.co.uk", "hammad@qorlune.co.uk"]]
    log(f"Deleting {len(idents_to_delete)} identities in parallel...")

    with concurrent.futures.ThreadPoolExecutor(max_workers=8) as ex:
        futures = [ex.submit(delete_ident, i["id"]) for i in idents_to_delete]
        concurrent.futures.wait(futures)

    # 2. Open.email Routes
    req_r = urllib.request.Request("https://api.open.email/api/v1/routes", headers=headers_oe)
    with urllib.request.urlopen(req_r) as r:
        routes = json.loads(r.read())["routes"]
    log(f"Current open.email routes: {len(routes)}")

    keep_prefixes = ("admin@", "tauqeer@", "hammad@", "sidra@", "contact@", "sales@", "billing@", "support@")
    routes_to_delete = [rt.get("address") for rt in routes if not rt.get("address", "").startswith(keep_prefixes)]
    log(f"Deleting {len(routes_to_delete)} routes in parallel...")

    with concurrent.futures.ThreadPoolExecutor(max_workers=8) as ex:
        futures = [ex.submit(delete_route, addr) for addr in routes_to_delete if addr]
        concurrent.futures.wait(futures)

    # 3. Ensure sidra@qorlune.co.uk & tauqeer@qorlune.co.uk exist
    for addr in ["tauqeer@qorlune.co.uk", "sidra@qorlune.co.uk"]:
        r_payload = {
            "address": addr,
            "destinationType": "mailbox",
            "mailboxId": "01M17137MJNRTDR5N92QCAND0P"
        }
        r_req = urllib.request.Request("https://api.open.email/api/v1/routes", data=json.dumps(r_payload).encode(), headers=headers_oe, method="POST")
        try:
            with urllib.request.urlopen(r_req, timeout=10) as r:
                log(f"  [OK] Created/verified route for {addr}")
        except Exception as e:
            log(f"  Route notice for {addr}: {e}")

    # 4. Backend DB: Delete remaining unwanted accounts (e.g. muhammad.*)
    log("\n=== FINALIZING BACKEND DB USERS ===")
    data = json.dumps({"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}).encode()
    req_l = urllib.request.Request(f"{BASE_URL}/auth/login", data=data, headers={"Content-Type": "application/json"})
    with urllib.request.urlopen(req_l) as r:
        token = json.loads(r.read())["data"]["accessToken"]

    req_u = urllib.request.Request(f"{BASE_URL}/admin/users?page=1&pageSize=100", headers={"Authorization": f"Bearer {token}"})
    with urllib.request.urlopen(req_u) as r:
        users = json.loads(r.read())["data"]["items"]

    strictly_keep_emails = {
        "admin@qorlune.co.uk",
        "employee@qorlune.co.uk",
        "notifications@qorlune.co.uk",
        "hammad@qorlune.co.uk",
        "sidra@qorlune.co.uk",
        "tauqeer@tauqeermustafa.com",
        "tauqeer@qorlune.co.uk"
    }

    db_to_delete = []
    for u in users:
        em = (u.get("email") or "").strip().lower()
        if em not in strictly_keep_emails:
            db_to_delete.append(u)

    log(f"Deleting {len(db_to_delete)} remaining non-core users from DB...")
    with concurrent.futures.ThreadPoolExecutor(max_workers=6) as ex:
        futures = [ex.submit(delete_db_user, u["id"], token) for u in db_to_delete]
        concurrent.futures.wait(futures)

    # 5. Clean Roster CSVs
    core_contacts = [
        {"Name": "Tauqeer Mustafa", "Email": "tauqeer@tauqeermustafa.com", "Role": "Founder & Executive", "Department": "Executive & Technology"},
        {"Name": "Hammad", "Email": "hammad@qorlune.co.uk", "Role": "Operations Lead", "Department": "Sales & Business"},
        {"Name": "Sidra Ansari", "Email": "sidra@qorlune.co.uk", "Role": "People & Operations", "Department": "Careers & Operations"}
    ]
    with open("b2b_broadcast_contacts.csv", "w", encoding="utf-8", newline="") as f:
        w = csv.DictWriter(f, fieldnames=["Name", "Email", "Role", "Department"])
        w.writeheader()
        w.writerows(core_contacts)

    with open("tmi_employees_contacts.csv", "w", encoding="utf-8", newline="") as f:
        w = csv.DictWriter(f, fieldnames=["Name", "Email", "Role", "Department"])
        w.writeheader()
        w.writerows(core_contacts)

    with open("washeet_b2b_contacts.csv", "w", encoding="utf-8", newline="") as f:
        w = csv.DictWriter(f, fieldnames=["Name", "Email", "Role", "Department"])
        w.writeheader()
        w.writerows(core_contacts)

    log("\n=== FAST PURGE COMPLETE ===")

if __name__ == "__main__":
    main()
