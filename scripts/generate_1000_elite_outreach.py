import os
import sys
import json
import re
import openpyxl

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

WORKBOOK_PATH = r"data/outreach/Qorlune_50000_Business_Records.xlsx"
OUTPUT_JSON = r"scratch/elite_1000_outreach.json"

TIER1_SHEETS = [
    "United Kingdom",
    "United States",
    "Canada",
    "Australia",
    "Ireland",
    "New Zealand",
]

def clean_biz_name(name):
    if not name:
        return "Team"
    # Remove LLC, Ltd, Inc, Co., Pty, etc.
    cleaned = re.sub(r"\b(LLC|L\.L\.C\.|Ltd|LTD|Limited|Inc|Inc\.|Co\.|Corp\.|Pty|PTY)\b", "", name, flags=re.IGNORECASE).strip()
    cleaned = re.sub(r"\s+", " ", cleaned).strip(" ,.-")
    return cleaned or name.strip()

def build_elite_copy(biz_name, category, city, country, website):
    clean_name = clean_biz_name(biz_name)
    cat_lower = (category or "").lower()

    if any(k in cat_lower for k in ["tech", "computer", "software", "web", "it", "digital", "data", "cloud", "telecom"]):
        subject = f"Infrastructure & platform scalability for {clean_name}"
        body = (
            f"Hi {clean_name} team,\n\n"
            f"I came across {clean_name} while reviewing technology operations in {city or country}.\n\n"
            f"We specialize in high-throughput cloud runtimes, low-latency API architecture, and sub-second web performance — helping technical teams eliminate infrastructure bottlenecks and scale client delivery smoothly.\n\n"
            f"Would you be open to a 2-minute overview of speed and performance optimizations we've recently deployed for high-growth platforms?\n\n"
            f"Best regards,\n"
            f"Tauqeer Mustafa\n"
            f"Principal Systems Architect & Founder\n"
            f"tauqeermustafa.com | contact@tauqeermustafa.com"
        )
    elif any(k in cat_lower for k in ["consult", "legal", "law", "finance", "account", "recruit", "agency", "service", "market"]):
        subject = f"Client intake and workflow automation for {clean_name}"
        body = (
            f"Hi {clean_name} team,\n\n"
            f"I noticed the strong client presence {clean_name} has established in {city or country}.\n\n"
            f"We build custom digital operations engines — automated client onboarding, omni-channel messaging desks, and conversion workflows that reduce manual administration by 60% while capturing qualified inquiries round the clock.\n\n"
            f"Would you be open to a brief review of how similar service firms have streamlined their inbound lead-to-cash pipeline?\n\n"
            f"Warm regards,\n"
            f"Tauqeer Mustafa\n"
            f"Executive Director\n"
            f"tauqeermustafa.com | contact@tauqeermustafa.com"
        )
    else:
        subject = f"Modernizing digital workflows for {clean_name}"
        body = (
            f"Hi {clean_name} team,\n\n"
            f"Following {clean_name}'s work in {city or country}, I wanted to reach out directly.\n\n"
            f"We partner with established businesses to modernize web architecture, streamline client portals, and deploy high-converting digital touchpoints that drive predictable revenue.\n\n"
            f"If you have a couple of minutes next week, I’d be glad to share a few practical takeaways relevant to {clean_name}.\n\n"
            f"Best,\n"
            f"Tauqeer Mustafa\n"
            f"Founder & Principal\n"
            f"tauqeermustafa.com | contact@tauqeermustafa.com"
        )

    return subject, body

def main():
    print(f"Loading {WORKBOOK_PATH}...")
    wb = openpyxl.load_workbook(WORKBOOK_PATH, read_only=True)
    
    seen_emails = set()
    prospects = []

    for sheet in TIER1_SHEETS:
        if sheet not in wb.sheetnames:
            continue
        ws = wb[sheet]
        print(f"Scanning sheet: {sheet}")
        for row in ws.iter_rows(min_row=2, values_only=True):
            if len(prospects) >= 1000:
                break
            
            raw_email = row[14]
            if not raw_email or "@" not in str(raw_email):
                continue
            
            email = str(raw_email).strip().lower()
            if email in seen_emails or any(x in email for x in ["example", "sentry", "domain.com", "wix"]):
                continue
            
            biz_name = str(row[1] or "").strip()
            city = str(row[3] or "").strip()
            website = str(row[4] or "").strip()
            phone = str(row[5] or "").strip()
            category = str(row[11] or "").strip()

            if not biz_name:
                continue

            subject, body = build_elite_copy(biz_name, category, city, sheet, website)
            
            seen_emails.add(email)
            prospects.append({
                "record_id": str(row[0] or f"REC-{len(prospects)+1:04d}"),
                "business_name": biz_name,
                "clean_name": clean_biz_name(biz_name),
                "city": city,
                "country": sheet,
                "category": category,
                "website": website,
                "phone": phone,
                "to_email": email,
                "subject": subject,
                "body": body,
            })

    print(f"\nSuccessfully compiled {len(prospects)} elite B2B prospects!")
    os.makedirs(os.path.dirname(OUTPUT_JSON), exist_ok=True)
    with open(OUTPUT_JSON, "w", encoding="utf-8") as f:
        json.dump(prospects, f, indent=2, ensure_ascii=False)
    print(f"Wrote campaign to {OUTPUT_JSON}")

if __name__ == "__main__":
    main()
