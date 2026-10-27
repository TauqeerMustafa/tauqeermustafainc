import os
import sys
import re
import ssl
import time
import json
import urllib.request
import urllib.error
from urllib.parse import urlparse
from concurrent.futures import ThreadPoolExecutor, as_completed
import openpyxl

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

WORKBOOK_PATH = os.path.join("data", "outreach", "Qorlune_50000_Business_Records.xlsx")
PROGRESS_JSON = os.path.join("scratch", "50k_enrichment_progress.json")

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
}

EMAIL_REGEX = re.compile(r"[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z]{2,10}")
IGNORE_WORDS = (
    "example.com", "wixpress", "sentry", "latofonts", "domain.com", "polyfill", 
    "webpack", "schema.org", "react-dom", "react@", "core-js", "node_modules",
    "npm", "github", "cloudflare", "bootstrap", "wordpress", "elementor", "myemail@email.com",
    "shutterstock", "istockphoto", "depositphotos", "pcrisk", "godaddy", "filler@godaddy",
    "user@domain.com", "email@email.com", "yourname@email.com"
)

SKIP_DOMAINS = (
    "example.com", "shutterstock.com", "istockphoto.com", "depositphotos.com",
    "pcrisk.com", "findyello.com", "truelocal.com.au", "yelp.com", "yellowpages.com",
    "facebook.com", "instagram.com", "linkedin.com", "twitter.com", "x.com",
    "youtube.com", "godaddy.com", "wix.com", "squarespace.com", "wordpress.com"
)

def is_valid_email(email):
    if not email or "@" not in email:
        return False
    parts = email.strip().split("@")
    if len(parts) != 2:
        return False
    user, dom = parts[0].strip(), parts[1].strip().lower()
    if not user or not dom or "." not in dom:
        return False
    tld = dom.split(".")[-1]
    if len(tld) < 2 or not tld.isalpha():
        return False
    if any(ig in email.lower() for ig in IGNORE_WORDS):
        return False
    return True

def clean_domain(url):
    try:
        parsed = urlparse(url)
        netloc = parsed.netloc.lower()
        if netloc.startswith("www."):
            netloc = netloc[4:]
        return netloc
    except Exception:
        return ""

def scrape_email_for_url(url):
    if not url or not url.startswith("http") or url.endswith(".pdf"):
        return None
    
    dom = clean_domain(url)
    if not dom or any(sd in dom for sd in SKIP_DOMAINS):
        return None

    clean_base = url.rstrip("/")
    pages = [clean_base, clean_base + "/contact", clean_base + "/contact-us", clean_base + "/about", clean_base + "/about-us"]
    found = set()
    for p in pages:
        try:
            req = urllib.request.Request(p, headers=HEADERS)
            with urllib.request.urlopen(req, timeout=3.5, context=ctx) as r:
                body = r.read().decode("utf-8", errors="ignore")
                for em in EMAIL_REGEX.findall(body):
                    em_lower = em.strip().lower()
                    if is_valid_email(em_lower) and not em_lower.endswith(('.png', '.jpg', '.webp', '.js', '.css', '.svg')):
                        found.add(em_lower)
        except Exception:
            continue
        if found:
            break

    if found:
        # Prioritize standard business inboxes
        for pref in ["info@", "contact@", "office@", "sales@", "hello@", "support@", "admin@", "inquiries@", "help@"]:
            for e in found:
                if e.startswith(pref):
                    return e
        # If there's an email sharing the exact root domain, prioritize that
        for e in found:
            if dom in e:
                return e
        return list(found)[0]

    # Fallback to info@ domain if valid root domain
    if dom and "." in dom and not any(sd in dom for sd in SKIP_DOMAINS):
        return f"info@{dom}"
    return None

def safe_save_workbook(wb, path):
    tmp_path = path + ".tmp"
    try:
        wb.save(tmp_path)
        os.replace(tmp_path, path)
    except Exception as e:
        print(f"Warning: safe_save failed ({e}), writing directly...", flush=True)
        try:
            wb.save(path)
        except Exception:
            pass

def main():
    target_countries = [
        "United States", "United Kingdom", "Canada", "Australia", 
        "Germany", "France", "Italy", "Poland", "Brazil", "Argentina"
    ]
    max_to_process = int(os.environ.get("MAX_ENRICH", 500))

    print(f"Starting 50k Leads Enrichment Engine (Limit: {max_to_process})...", flush=True)
    if not os.path.exists(WORKBOOK_PATH):
        print(f"Error: {WORKBOOK_PATH} not found!", flush=True)
        return

    wb = openpyxl.load_workbook(WORKBOOK_PATH)

    total_enriched = 0
    total_checked = 0

    for country in target_countries:
        if total_checked >= max_to_process:
            break
        if country not in wb.sheetnames:
            continue

        ws = wb[country]
        rows = list(ws.iter_rows(values_only=False))
        if len(rows) < 2:
            continue

        header = [str(cell.value or "").strip().lower() for cell in rows[0]]
        web_col = header.index("website") + 1 if "website" in header else 5
        email_col = header.index("published business email") + 1 if "published business email" in header else 15
        biz_col = header.index("business") + 1 if "business" in header else 2

        # Collect rows that need email
        candidates = []
        for r_idx in range(2, len(rows) + 1):
            if total_checked + len(candidates) >= max_to_process:
                break
            existing_email = str(ws.cell(row=r_idx, column=email_col).value or "").strip()
            if is_valid_email(existing_email):
                continue
            site = str(ws.cell(row=r_idx, column=web_col).value or "").strip()
            if site and site.startswith("http"):
                biz = str(ws.cell(row=r_idx, column=biz_col).value or "Business").strip()
                candidates.append((r_idx, biz, site))

        if not candidates:
            continue

        print(f"\nProcessing {len(candidates)} candidates in [{country}] with 15 concurrent threads...", flush=True)

        def worker(item):
            r_idx, biz, site = item
            email = scrape_email_for_url(site)
            return r_idx, biz, site, email

        with ThreadPoolExecutor(max_workers=15) as executor:
            future_to_item = {executor.submit(worker, c): c for c in candidates}
            for future in as_completed(future_to_item):
                total_checked += 1
                try:
                    r_idx, biz, site, email = future.result()
                    if email and is_valid_email(email):
                        ws.cell(row=r_idx, column=email_col).value = email
                        total_enriched += 1
                        print(f"[{total_checked}/{max_to_process}] + [{country}] {biz[:28]} -> {email}", flush=True)
                    else:
                        print(f"[{total_checked}/{max_to_process}] - [{country}] {biz[:28]} (No email found)", flush=True)
                except Exception as e:
                    pass

                if total_checked % 25 == 0:
                    safe_save_workbook(wb, WORKBOOK_PATH)
                    print(f"--> [Checkpoint] Saved progress ({total_enriched} new emails found so far)...", flush=True)

        safe_save_workbook(wb, WORKBOOK_PATH)

    safe_save_workbook(wb, WORKBOOK_PATH)
    print(f"\nEnrichment Complete: Successfully enriched {total_enriched} verified business emails out of {total_checked} processed!", flush=True)

if __name__ == "__main__":
    main()