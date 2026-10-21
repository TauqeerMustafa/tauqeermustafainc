import urllib.request
import urllib.error
import json
import time
import sys
import csv

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

API_KEY = "oek_vLhzeeO6fO_owBMaIIkLLzFPAWezb9I-f5H7isSGYug"
BASE_URL = "https://tauqeer-inc-backend.onrender.com"
ADMIN_EMAIL = "admin@qorlune.co.uk"
ADMIN_PASSWORD = "Bushra@0609"

headers_oe = {
    "Authorization": f"Bearer {API_KEY}",
    "User-Agent": "Mozilla/5.0",
    "Content-Type": "application/json"
}

def log(msg):
    print(msg, flush=True)

def backend_login():
    data = json.dumps({"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}).encode()
    req = urllib.request.Request(f"{BASE_URL}/auth/login", data=data, headers={"Content-Type": "application/json"})
    with urllib.request.urlopen(req, timeout=20) as r:
        return json.loads(r.read())["data"]["accessToken"]

def main():
    log("=== STEP 1: AUTHENTICATING ===")
    token = backend_login()
    log("Backend token acquired.")

    # -------------------------------------------------------------
    # 1. PURGE BACKEND DATABASE USERS (KEEP ONLY TAUQEER, HAMMAD, SIDRA)
    # -------------------------------------------------------------
    log("\n=== STEP 2: PURGING EMPLOYEE USERS FROM BACKEND DB ===")
    page = 1
    all_users = []
    while True:
        req_u = urllib.request.Request(f"{BASE_URL}/admin/users?page={page}&pageSize=50", headers={"Authorization": f"Bearer {token}"})
        with urllib.request.urlopen(req_u) as r:
            res = json.loads(r.read())["data"]
            all_users.extend(res["items"])
            if page >= res["pagination"]["totalPages"]:
                break
            page += 1
    log(f"Fetched {len(all_users)} total DB users.")

    keep_emails = {
        "admin@qorlune.co.uk",
        "employee@qorlune.co.uk",
        "notifications@qorlune.co.uk",
        "hammad@qorlune.co.uk",
        "sidra@qorlune.co.uk",
        "tauqeer@tauqeermustafa.com",
        "tauqeer@qorlune.co.uk"
    }

    deleted_count = 0
    kept_count = 0

    for u in all_users:
        u_email = (u.get("email") or "").strip().lower()
        u_name = (u.get("name") or "").strip()
        u_id = u["id"]

        is_keep = False
        for ke in keep_emails:
            if u_email == ke:
                is_keep = True
                break
        if "tauqeer" in u_name.lower() or "hammad" in u_name.lower() or "sidra" in u_name.lower():
            if u_email.endswith("@qorlune.co.uk") or u_email.endswith("@tauqeermustafa.com"):
                is_keep = True

        if is_keep:
            log(f"  [KEEP] User: {u_name} <{u_email}> (ID: {u_id})")
            kept_count += 1
        else:
            del_req = urllib.request.Request(
                f"{BASE_URL}/admin/users/{u_id}",
                headers={"Authorization": f"Bearer {token}"},
                method="DELETE"
            )
            try:
                with urllib.request.urlopen(del_req, timeout=15) as r:
                    deleted_count += 1
                    if deleted_count % 10 == 0:
                        log(f"  Deleted {deleted_count} employees from DB...")
            except Exception as e:
                log(f"  Failed to delete {u_email}: {e}")

    log(f"DB User purge finished: {deleted_count} deleted, {kept_count} preserved.")

    # -------------------------------------------------------------
    # 2. PURGE OPEN.EMAIL IDENTITIES & ROUTES
    # -------------------------------------------------------------
    log("\n=== STEP 3: PURGING EMPLOYEE INBOXES ON OPEN.EMAIL ===")
    
    # Fetch all identities
    req_i = urllib.request.Request("https://api.open.email/api/v1/identities", headers=headers_oe)
    with urllib.request.urlopen(req_i) as r:
        identities = json.loads(r.read())["identities"]
    log(f"Fetched {len(identities)} identities from open.email.")

    # Core identities to keep
    # admin@qorlune.co.uk (01M17137MJNRTDR5N92QCAND0P)
    # hammad@qorlune.co.uk (01M1JHPGC1TJ9VRJMGKBVCAPTR)
    kept_identities = []
    deleted_idents = 0

    for ident in identities:
        addr = (ident.get("primaryAddress") or "").strip().lower()
        ident_id = ident["id"]

        should_keep = False
        if addr in ["admin@qorlune.co.uk", "hammad@qorlune.co.uk", "tauqeer@tauqeermustafa.com", "tauqeer@qorlune.co.uk", "sidra@qorlune.co.uk"]:
            should_keep = True
        elif ident_id in ["01M17137MJNRTDR5N92QCAND0P", "01M1JHPGC1TJ9VRJMGKBVCAPTR"]:
            should_keep = True

        if should_keep:
            log(f"  [KEEP MAILBOX] {addr} (ID: {ident_id})")
            kept_identities.append(ident)
        else:
            # Delete identity
            del_req = urllib.request.Request(
                f"https://api.open.email/api/v1/identities/{ident_id}",
                headers=headers_oe,
                method="DELETE"
            )
            try:
                with urllib.request.urlopen(del_req, timeout=15) as r:
                    deleted_idents += 1
            except Exception as e:
                log(f"  Failed to delete identity {addr}: {e}")

    log(f"Open.email identity purge finished: {deleted_idents} deleted, {len(kept_identities)} preserved.")

    # Fetch and purge unnecessary routes
    log("\n=== STEP 4: CLEANING UP OPEN.EMAIL ROUTING RULES ===")
    req_r = urllib.request.Request("https://api.open.email/api/v1/routes", headers=headers_oe)
    with urllib.request.urlopen(req_r) as r:
        routes = json.loads(r.read())["routes"]
    log(f"Fetched {len(routes)} routing rules.")

    keep_route_prefixes = ["admin@", "tauqeer@", "hammad@", "sidra@", "contact@", "sales@", "billing@", "support@"]
    deleted_routes = 0

    for route in routes:
        addr = (route.get("address") or "").strip().lower()
        keep_r = False
        for kp in keep_route_prefixes:
            if addr.startswith(kp):
                keep_r = True
                break

        if not keep_r:
            del_r_req = urllib.request.Request(
                f"https://api.open.email/api/v1/routes/{addr}",
                headers=headers_oe,
                method="DELETE"
            )
            try:
                with urllib.request.urlopen(del_r_req, timeout=15) as r:
                    deleted_routes += 1
            except Exception as e:
                pass

    log(f"Open.email routes purge finished: {deleted_routes} deleted.")

    # -------------------------------------------------------------
    # 3. ENSURE SIDRA@QORLUNE.CO.UK & TAUQEER@ ROUTES ARE ACTIVE
    # -------------------------------------------------------------
    log("\n=== STEP 5: PROVISIONING CORE INBOX ROUTES ===")
    
    # 1. Create route for sidra@qorlune.co.uk pointing to mailbox or forward
    # Check if mailbox slots are available or route to Hammad/Tauqeer or dedicated
    tauqeer_mb = "01M17137MJNRTDR5N92QCAND0P"
    hammad_mb = "01M1JHPGC1TJ9VRJMGKBVCAPTR"

    # Route tauqeer@qorlune.co.uk
    r_tauqeer = {
        "address": "tauqeer@qorlune.co.uk",
        "destinationType": "mailbox",
        "mailboxId": tauqeer_mb
    }
    req_t = urllib.request.Request("https://api.open.email/api/v1/routes", data=json.dumps(r_tauqeer).encode(), headers=headers_oe, method="POST")
    try:
        with urllib.request.urlopen(req_t, timeout=10) as r:
            log("  [OK] tauqeer@qorlune.co.uk route configured.")
    except Exception as e:
        log(f"  tauqeer@qorlune.co.uk route notice: {e}")

    # Route sidra@qorlune.co.uk
    r_sidra = {
        "address": "sidra@qorlune.co.uk",
        "destinationType": "mailbox",
        "mailboxId": tauqeer_mb  # Routed to core executive mailbox
    }
    req_s = urllib.request.Request("https://api.open.email/api/v1/routes", data=json.dumps(r_sidra).encode(), headers=headers_oe, method="POST")
    try:
        with urllib.request.urlopen(req_s, timeout=10) as r:
            log("  [OK] sidra@qorlune.co.uk route configured.")
    except Exception as e:
        log(f"  sidra@qorlune.co.uk route notice: {e}")

    # -------------------------------------------------------------
    # 4. CLEAN ROSTER FILES
    # -------------------------------------------------------------
    log("\n=== STEP 6: CLEANING LOCAL ROSTER FILES ===")
    
    core_contacts = [
        {"Name": "Tauqeer Mustafa", "Email": "tauqeer@tauqeermustafa.com", "Role": "Founder & Executive", "Department": "Executive & Technology"},
        {"Name": "Hammad", "Email": "hammad@qorlune.co.uk", "Role": "Operations Lead", "Department": "Sales & Business"},
        {"Name": "Sidra Ansari", "Email": "sidra@qorlune.co.uk", "Role": "People & Operations", "Department": "Careers & Operations"}
    ]

    with open("b2b_broadcast_contacts.csv", "w", encoding="utf-8", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=["Name", "Email", "Role", "Department"])
        writer.writeheader()
        writer.writerows(core_contacts)
    log("  [OK] Updated b2b_broadcast_contacts.csv (3 core members)")

    with open("tmi_employees_contacts.csv", "w", encoding="utf-8", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=["Name", "Email", "Role", "Department"])
        writer.writeheader()
        writer.writerows(core_contacts)
    log("  [OK] Updated tmi_employees_contacts.csv (3 core members)")

    log("\n========================================================")
    log("PURGE AND RESET COMPLETED SUCCESSFULLY:")
    log("  Remaining Core Active Team: tauqeer@, hammad@, sidra@")
    log("========================================================")

if __name__ == "__main__":
    main()
