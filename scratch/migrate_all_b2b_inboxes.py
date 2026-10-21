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

def log(msg):
    print(msg, flush=True)

def openemail_req(endpoint, data=None, method="GET"):
    url = f"https://api.open.email/api/v1{endpoint}"
    headers = {
        "Authorization": f"Bearer {API_KEY}",
        "User-Agent": "Mozilla/5.0",
        "Content-Type": "application/json"
    }
    encoded_data = json.dumps(data).encode("utf-8") if data is not None else None
    req = urllib.request.Request(url, data=encoded_data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            content = resp.read().decode("utf-8")
            return True, json.loads(content) if content else {}
    except urllib.error.HTTPError as e:
        err_msg = e.read().decode("utf-8", errors="ignore")
        return False, f"HTTP {e.code}: {err_msg}"
    except Exception as e:
        return False, str(e)

def backend_login():
    data = json.dumps({"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}).encode()
    req = urllib.request.Request(f"{BASE_URL}/auth/login", data=data, headers={"Content-Type": "application/json"})
    try:
        with urllib.request.urlopen(req, timeout=20) as r:
            return True, json.loads(r.read())["data"]["accessToken"]
    except Exception as e:
        return False, str(e)

def backend_patch_user(user_id, payload, token):
    url = f"{BASE_URL}/admin/users/{user_id}"
    req = urllib.request.Request(
        url,
        data=json.dumps(payload).encode(),
        headers={"Authorization": f"Bearer {token}", "Content-Type": "application/json"},
        method="PATCH"
    )
    try:
        with urllib.request.urlopen(req, timeout=15) as r:
            return True, json.loads(r.read())
    except urllib.error.HTTPError as e:
        return False, f"HTTP {e.code}: {e.read().decode('utf-8', errors='ignore')}"
    except Exception as e:
        return False, str(e)

def main():
    log("=== Step 1: Connecting to open.email & Backend ===")
    ok, token = backend_login()
    if not ok:
        log(f"Backend login failed: {token}")
        return
    log("Backend admin logged in successfully.")

    # Fetch all DB users to map by old and new emails
    all_db_users = []
    page = 1
    while True:
        req_u = urllib.request.Request(f"{BASE_URL}/admin/users?page={page}&pageSize=50", headers={"Authorization": f"Bearer {token}"})
        try:
            with urllib.request.urlopen(req_u, timeout=15) as r:
                res = json.loads(r.read())["data"]
                all_db_users.extend(res["items"])
                if page >= res["pagination"]["totalPages"]:
                    break
                page += 1
        except Exception as e:
            log(f"Error fetching users page {page}: {e}")
            break
            
    db_by_email = {}
    for u in all_db_users:
        em = u.get("email", "").strip().lower()
        if em:
            db_by_email[em] = u
    log(f"Fetched {len(all_db_users)} users from backend DB.")

    # Fetch open.email identities
    ok, idents_res = openemail_req("/identities")
    if not ok:
        log(f"Failed to fetch open.email identities: {idents_res}")
        return
    identities = idents_res.get("identities") or idents_res.get("items") or []
    addr_to_ident = {}
    for i in identities:
        p_addr = i.get("primaryAddress", "").strip().lower()
        if p_addr:
            addr_to_ident[p_addr] = i
    log(f"Fetched {len(identities)} identities from open.email.")

    # Fetch existing routes on open.email
    ok, routes_res = openemail_req("/routes")
    existing_routes = set()
    if ok and isinstance(routes_res, dict):
        for r in routes_res.get("routes", []):
            existing_routes.add(r.get("address", "").strip().lower())
    log(f"Fetched {len(existing_routes)} routes from open.email.")

    # Load B2B employees manifest
    with open("scratch/b2b_week1_assignments.json", "r", encoding="utf-8") as f:
        b2b_data = json.load(f)
    bdes = b2b_data.get("bde_assignments", [])
    log(f"Total B2B employees to process: {len(bdes)}")

    log("\n=== Step 2: Creating Qorlune Inboxes on open.email & Updating DB ===")
    results = []

    for idx, bde in enumerate(bdes, 1):
        name = bde.get("name")
        curr_email = bde.get("company_email", "").strip().lower()
        prefix = curr_email.split("@")[0]
        old_email = f"{prefix}@tauqeermustafa.tech"
        new_email = f"{prefix}@qorlune.co.uk"

        # Find mailbox identity
        ident = addr_to_ident.get(old_email) or addr_to_ident.get(new_email)
        if not ident:
            # Check by prefix match if available
            for p_addr, i in addr_to_ident.items():
                if p_addr.startswith(f"{prefix}@"):
                    ident = i
                    break

        mailbox_id = ident["id"] if ident else None
        mailbox_status = "OK"

        if not ident:
            mailbox_status = "NOT_FOUND"
            log(f"[{idx:02d}/{len(bdes)}] {name}: Mailbox identity NOT FOUND for prefix {prefix}")
        else:
            # 1. Ensure route exists for new_email
            if new_email not in existing_routes:
                route_payload = {
                    "address": new_email,
                    "destinationType": "mailbox",
                    "mailboxId": mailbox_id
                }
                r_ok, r_res = openemail_req("/routes", route_payload, method="POST")
                if not r_ok:
                    log(f"[{idx:02d}/{len(bdes)}] {name}: Route creation failed for {new_email} -> {r_res}")
                    mailbox_status = f"ROUTE_ERR: {r_res}"
                else:
                    existing_routes.add(new_email)

            # 2. Update primaryAddress on identity
            if ident.get("primaryAddress") != new_email:
                p_ok, p_res = openemail_req(f"/identities/{mailbox_id}", {"primaryAddress": new_email}, method="PATCH")
                if not p_ok:
                    log(f"[{idx:02d}/{len(bdes)}] {name}: Primary address update failed -> {p_res}")
                    mailbox_status = f"PATCH_ERR: {p_res}"
                else:
                    ident["primaryAddress"] = new_email
                    addr_to_ident[new_email] = ident

            # 3. Clean up old route if present
            if old_email in existing_routes:
                openemail_req(f"/routes/{old_email}", method="DELETE")
                existing_routes.discard(old_email)

        # 4. Update Database user record (keep status=terminated)
        db_user = db_by_email.get(old_email) or db_by_email.get(new_email)
        db_status = "NOT_IN_DB"
        if db_user:
            u_id = db_user["id"]
            need_patch = (db_user.get("email") != new_email) or (db_user.get("status") != "terminated")
            if need_patch:
                d_ok, d_res = backend_patch_user(u_id, {"email": new_email, "status": "terminated"}, token)
                if d_ok:
                    db_status = "UPDATED (terminated)"
                else:
                    db_status = f"ERR: {d_res}"
            else:
                db_status = "ALREADY_TERMINATED"

        # Update in-memory bde object for file saving
        bde["company_email"] = new_email

        results.append({
            "idx": idx,
            "name": name,
            "old_email": old_email,
            "new_email": new_email,
            "mailbox_status": mailbox_status,
            "db_status": db_status
        })

        if idx % 5 == 0 or idx == len(bdes):
            log(f"Processed {idx:02d}/{len(bdes)}: {name} -> {new_email} | MB: {mailbox_status} | DB: {db_status}")

    # Step 3: Update local JSON and CSV files
    log("\n=== Step 3: Updating CSV & JSON Roster Files ===")
    
    # 1. Update scratch/b2b_week1_assignments.json
    with open("scratch/b2b_week1_assignments.json", "w", encoding="utf-8") as f:
        json.dump(b2b_data, f, indent=2, ensure_ascii=False)
    log("  [OK] Updated scratch/b2b_week1_assignments.json")

    # 2. Update tmi_employees_contacts.csv
    try:
        with open("tmi_employees_contacts.csv", "r", encoding="utf-8", errors="ignore") as f:
            reader = list(csv.DictReader(f))
        for row in reader:
            em = row.get("E-mail 1 - Value", "").strip()
            if em.endswith("@tauqeermustafa.tech") and not em.startswith("admin@") and not em.startswith("notifications@"):
                pfx = em.split("@")[0]
                row["E-mail 1 - Value"] = f"{pfx}@qorlune.co.uk"
        with open("tmi_employees_contacts.csv", "w", encoding="utf-8", newline="") as f:
            writer = csv.DictWriter(f, fieldnames=reader[0].keys())
            writer.writeheader()
            writer.writerows(reader)
        log("  [OK] Updated tmi_employees_contacts.csv")
    except Exception as e:
        log(f"  [WARN] tmi_employees_contacts.csv: {e}")

    # 3. Update b2b_broadcast_contacts.csv
    try:
        with open("b2b_broadcast_contacts.csv", "r", encoding="utf-8", errors="ignore") as f:
            reader = list(csv.DictReader(f))
        for row in reader:
            em = row.get("Email", "").strip()
            if em.endswith("@tauqeermustafa.tech"):
                pfx = em.split("@")[0]
                row["Email"] = f"{pfx}@qorlune.co.uk"
        with open("b2b_broadcast_contacts.csv", "w", encoding="utf-8", newline="") as f:
            writer = csv.DictWriter(f, fieldnames=reader[0].keys())
            writer.writeheader()
            writer.writerows(reader)
        log("  [OK] Updated b2b_broadcast_contacts.csv")
    except Exception as e:
        log(f"  [WARN] b2b_broadcast_contacts.csv: {e}")

    # Summary
    success_mb = sum(1 for r in results if r["mailbox_status"] == "OK")
    success_db = sum(1 for r in results if "UPDATED" in r["db_status"] or "ALREADY" in r["db_status"])
    log(f"\n==========================================")
    log(f"MIGRATION COMPLETE:")
    log(f"  Total B2B Staff Processed: {len(results)}")
    log(f"  Mailboxes active on @qorlune.co.uk: {success_mb}/{len(results)}")
    log(f"  DB Users marked terminated on @qorlune.co.uk: {success_db}/{len(results)}")
    log(f"==========================================")

if __name__ == "__main__":
    main()
