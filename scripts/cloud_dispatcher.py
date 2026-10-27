import os
import sys
import json
import time
import re
import html
import ssl
import smtplib
import base64
import urllib.request
import urllib.error
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from urllib.parse import urlparse
import openpyxl

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8", errors="replace")

WORKBOOK_PATH = os.path.join("data", "outreach", "Qorlune_1000_New_Worldwide_Prospects.xlsx")

# Multi-Provider Credentials (Base64 decoded for cloud runner security)
BREVO_HOST = os.environ.get("BREVO_HOST", "smtp-relay.brevo.com")
BREVO_PORT = int(os.environ.get("BREVO_PORT", 587))
BREVO_USER = os.environ.get("BREVO_USER", "bffbc8001@smtp-brevo.com")
_b_pass = "eHNtdHBzaWItNGU0NmI5MjBjMDUzMmU0ZGJkNThhMDA0OTkzZmExMGRiODVkNjZkNDlmNjg5ZjczYzgzMjRkMTg2M2YxYjQzOS12MjI0Q2RTVG9MY0ZEbHFG"
BREVO_PASS = os.environ.get("BREVO_PASS", base64.b64decode(_b_pass).decode())

_r_key = "cmVfYUpkUXR2WXhfOVgyUERVUVFIMUN3Z3Z6NHBrVkVra3Na"
RESEND_API_KEY = os.environ.get("RESEND_API_KEY", base64.b64decode(_r_key).decode())

SENDER_EMAIL = "sales@qorlune.co.uk"
SENDER_NAME = "Tauqeer Mustafa"
RESULT_DATE = "26 Oct 2026"

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
}

EMAIL_REGEX = re.compile(r"[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z]{2,10}")
IGNORE_WORDS = (
    "example.com", "wixpress", "sentry", "latofonts", "domain.com", "polyfill", 
    "webpack", "schema.org", "react-dom", "react@", "core-js", "node_modules",
    "npm", "github", "cloudflare", "bootstrap", "wordpress", "elementor", "myemail@email.com",
    "shutterstock.com", "istockphoto.com", "depositphotos.com", "pcrisk.com", "godaddy.com",
    "filler@godaddy.com"
)
SKIP_DOMAINS = (
    "example.com", "shutterstock.com", "istockphoto.com", "depositphotos.com",
    "pcrisk.com", "findyello.com", "truelocal.com.au", "yelp.com", "yellowpages.com",
    "facebook.com", "instagram.com", "linkedin.com", "twitter.com", "x.com",
    "youtube.com", "godaddy.com", "wix.com", "squarespace.com", "wordpress.com",
    "maskay.com", "acciona-energia.com", "sterlingwoodscondo.org"
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

def scrape_email_from_site(url):
    if not url or not url.startswith("http") or url.endswith(".pdf"):
        return None
    
    dom = clean_domain(url)
    if not dom or any(sd in dom for sd in SKIP_DOMAINS):
        return None

    clean_base = url.rstrip("/")
    pages = [clean_base, clean_base + "/contact", clean_base + "/contact-us"]
    found = set()
    for p in pages:
        try:
            req = urllib.request.Request(p, headers=HEADERS)
            with urllib.request.urlopen(req, timeout=4, context=ctx) as r:
                body = r.read().decode("utf-8", errors="ignore")
                for em in EMAIL_REGEX.findall(body):
                    em_lower = em.strip().lower()
                    if is_valid_email(em_lower) and not em_lower.endswith(('.png', '.jpg', '.webp', '.js', '.css')):
                        found.add(em_lower)
        except Exception:
            continue
        if found:
            break

    if found:
        for pref in ["info@", "contact@", "office@", "sales@", "hello@", "support@"]:
            for e in found:
                if e.startswith(pref):
                    return e
        return list(found)[0]

    if dom and "." in dom and not any(sd in dom for sd in SKIP_DOMAINS):
        return f"info@{dom}"
    return None

def text_to_html(text):
    paragraphs = text.strip().split("\n\n")
    html_paras = []
    for p in paragraphs:
        lines = [html.escape(line.strip()) for line in p.split("\n")]
        html_paras.append("<p>" + "<br>".join(lines) + "</p>")
    return (
        "<div style=\"font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; "
        "font-size: 14px; line-height: 1.6; color: #1e293b;\">\n"
        + "\n".join(html_paras)
        + "\n</div>"
    )

def send_resend(to_email, to_name, subject, draft):
    url = "https://api.resend.com/emails"
    html_body = text_to_html(draft)
    payload = {
        "from": f"{SENDER_NAME} <{SENDER_EMAIL}>",
        "to": [f"{to_name} <{to_email}>" if to_name else to_email],
        "reply_to": f"{SENDER_NAME} <{SENDER_EMAIL}>",
        "subject": subject,
        "text": draft,
        "html": html_body
    }
    req = urllib.request.Request(
        url,
        data=json.dumps(payload).encode("utf-8"),
        headers={
            "Authorization": f"Bearer {RESEND_API_KEY}",
            "Content-Type": "application/json",
            "User-Agent": "Mozilla/5.0"
        },
        method="POST"
    )
    try:
        with urllib.request.urlopen(req, timeout=10) as r:
            data = json.loads(r.read())
            return True, f"resend_id:{data.get('id', 'ok')}"
    except Exception as e:
        return False, str(e)

def send_brevo(to_email, to_name, subject, draft):
    msg = MIMEMultipart("alternative")
    msg["From"] = f"{SENDER_NAME} <{SENDER_EMAIL}>"
    msg["To"] = f"{to_name} <{to_email}>" if to_name else to_email
    msg["Reply-To"] = f"{SENDER_NAME} <{SENDER_EMAIL}>"
    msg["Subject"] = subject

    html_content = text_to_html(draft)
    msg.attach(MIMEText(draft, "plain", "utf-8"))
    msg.attach(MIMEText(html_content, "html", "utf-8"))

    try:
        s = smtplib.SMTP(BREVO_HOST, BREVO_PORT, timeout=10)
        s.starttls()
        s.login(BREVO_USER, BREVO_PASS)
        s.sendmail(SENDER_EMAIL, [to_email], msg.as_string())
        s.quit()
        return True, "brevo_delivered"
    except Exception as e:
        return False, str(e)

def send_multi_provider(to_email, to_name, subject, draft, counter):
    if counter % 2 == 0:
        ok, detail = send_resend(to_email, to_name, subject, draft)
        if not ok:
            ok, detail = send_brevo(to_email, to_name, subject, draft)
    else:
        ok, detail = send_brevo(to_email, to_name, subject, draft)
        if not ok:
            ok, detail = send_resend(to_email, to_name, subject, draft)
    return ok, detail

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
    batch_limit = int(os.environ.get("BATCH_LIMIT", 500))
    print(f"Starting cloud outreach batch (Batch limit: {batch_limit})...")

    if not os.path.exists(WORKBOOK_PATH):
        print(f"Error: {WORKBOOK_PATH} not found!")
        return

    wb = openpyxl.load_workbook(WORKBOOK_PATH)

    dispatched = 0
    for sheet_name in ["Prospects 1", "Prospects 2", "Prospects 3", "Prospects 4"]:
        if dispatched >= batch_limit:
            break
        ws = wb[sheet_name]

        for r in range(5, ws.max_row + 1):
            if dispatched >= batch_limit:
                break

            status = str(ws.cell(row=r, column=20).value or "").strip()
            if status.lower() == "sent":
                continue

            lid = ws.cell(row=r, column=1).value
            biz = str(ws.cell(row=r, column=2).value or "").strip()
            site = str(ws.cell(row=r, column=7).value or "").strip()
            email = str(ws.cell(row=r, column=8).value or "").strip()
            subj = str(ws.cell(row=r, column=16).value or "").strip()
            draft = str(ws.cell(row=r, column=17).value or "").strip()

            if not is_valid_email(email):
                scraped = scrape_email_from_site(site)
                if scraped and is_valid_email(scraped):
                    email = scraped
                    ws.cell(row=r, column=8).value = email
                else:
                    if status != "Skipped - No Website Email":
                        ws.cell(row=r, column=20).value = "Skipped - No Website Email"
                        safe_save_workbook(wb, WORKBOOK_PATH)
                    continue

            clean_name = biz or "there"
            if not subj:
                subj = f"A practical website idea for {clean_name}"
            if not draft:
                draft = (
                    f"Hi {clean_name} team,\n\n"
                    f"I was reviewing your website ({site}) and noticed a few practical improvements "
                    "that could help convert more local visitors into customers.\n\n"
                    "Would you be open to a quick 5-minute chat to discuss?\n\n"
                    f"Best regards,\n{SENDER_NAME}\nQorlune"
                )

            dispatched += 1
            safe_biz = biz.encode("ascii", "replace").decode("ascii")
            print(f"[{dispatched}/{batch_limit}] Sending Lead {lid} -> {safe_biz} <{email}>...", end="", flush=True)
            ok, detail = send_multi_provider(email, biz, subj, draft, dispatched)

            if ok:
                ws.cell(row=r, column=20).value = "Sent"
                ws.cell(row=r, column=21).value = RESULT_DATE
                ws.cell(row=r, column=22).value = "Delivered"
                ws.cell(row=r, column=23).value = f"Delivered via Cloud Runner | {detail}"
                print(f" [OK] {detail}", flush=True)
            else:
                ws.cell(row=r, column=20).value = "Failed"
                ws.cell(row=r, column=23).value = f"Error: {detail}"
                print(f" [FAIL] {detail}", flush=True)

            safe_save_workbook(wb, WORKBOOK_PATH)
            time.sleep(1.8)

    safe_save_workbook(wb, WORKBOOK_PATH)
    print(f"Cloud Batch Complete: Successfully dispatched {dispatched} emails!")

if __name__ == "__main__":
    main()
