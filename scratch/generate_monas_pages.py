import os, re, glob
from bs4 import BeautifulSoup

SRC_DIR = r'scratch\monas-template\monas-package-file\monas-html'

def process_html(filename):
    filepath = os.path.join(SRC_DIR, filename)
    with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
        content = f.read()
    
    # Extract body content
    match = re.search(r'<body[^>]*>(.*?)</body>', content, re.DOTALL | re.IGNORECASE)
    if not match:
        raise ValueError(f"No body found in {filename}")
    
    body = match.group(1)
    
    # Strip existing <script> tags from bottom of body so we control them cleanly
    body = re.sub(r'<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>', '', body, flags=re.IGNORECASE)
    
    # 1. Replace assets/ with /assets/
    # Handle src="assets/...", href="assets/...", data-background="assets/..."
    body = re.sub(r'(src|href|data-background|data-thumb|data-bg)=["\']assets/([^"\']+)["\']', r'\1="/assets/\2"', body)
    
    # 2. Fix internal navigation links
    replacements = [
        ('href="index.html"', 'href="/"'),
        ('href="index2.html"', 'href="/index2"'),
        ('href="index3.html"', 'href="/index3"'),
        ('href="index4.html"', 'href="/index4"'),
        ('href="about-us.html"', 'href="/about"'),
        ('href="service.html"', 'href="/services"'),
        ('href="service-details.html"', 'href="/service-details"'),
        ('href="portfolio.html"', 'href="/portfolio"'),
        ('href="portfolio-details.html"', 'href="/portfolio-details"'),
        ('href="blog.html"', 'href="/blog"'),
        ('href="blog-details.html"', 'href="/blog-details"'),
        ('href="contact-us.html"', 'href="/contact"'),
        ('action="mail.php"', 'action="/api/contact"'),
    ]
    for old, new in replacements:
        body = body.replace(old, new)
        # Also replace single quotes version
        body = body.replace(old.replace('"', "'"), new)
    
    # In pricing sections, replace empty links or hash links in pricing CTA buttons with Whop billing terminal
    # Look for buttons in pricing cards
    body = re.sub(
        r'<a([^>]*class="[^"]*(?:btn|pricing)[^"]*"[^>]*)href="javascript:void\(0\)"',
        r'<a\1href="https://billing.qorlune.co.uk"',
        body
    )
    body = re.sub(
        r'<a([^>]*class="[^"]*(?:btn|pricing)[^"]*"[^>]*)href="#"',
        r'<a\1href="https://billing.qorlune.co.uk"',
        body
    )
    
    return body

pages_map = {
    'homeHtml': 'index.html',
    'index2Html': 'index2.html',
    'index3Html': 'index3.html',
    'index4Html': 'index4.html',
    'aboutHtml': 'about-us.html',
    'servicesHtml': 'service.html',
    'serviceDetailsHtml': 'service-details.html',
    'portfolioHtml': 'portfolio.html',
    'portfolioDetailsHtml': 'portfolio-details.html',
    'blogHtml': 'blog.html',
    'blogDetailsHtml': 'blog-details.html',
    'contactHtml': 'contact-us.html',
}

out_dir = r'frontend\data\monas'
os.makedirs(out_dir, exist_ok=True)

# Generate pricingHtml by taking about-us header + pricing section of index.html + index2.html
# Let's inspect index.html pricing section:
with open(os.path.join(SRC_DIR, 'index.html'), 'r', encoding='utf-8', errors='ignore') as f:
    idx_content = f.read()

# Let's write out individual html files or a pages.ts
ts_lines = ["// Auto-generated 100% replica of Monas Creative Template for Node.js / Next.js\n"]

for var_name, html_file in pages_map.items():
    processed = process_html(html_file)
    print(f"Processed {html_file} -> {var_name} ({len(processed)} chars)")
    # Save as separate raw html file in data/monas/<name>.html as well
    clean_name = html_file.replace('.html', '')
    with open(os.path.join(out_dir, f"{clean_name}.html"), 'w', encoding='utf-8') as hf:
        hf.write(processed)
    
    # Serialize for TypeScript
    # JSON.dumps safely escapes newlines, quotes, backslashes
    import json
    json_str = json.dumps(processed)
    ts_lines.append(f"export const {var_name}: string = {json_str};\n")

# For pricingHtml, create a dedicated pricing page combining breadcrumb and pricing sections
with open(os.path.join(SRC_DIR, 'about-us.html'), 'r', encoding='utf-8', errors='ignore') as f:
    about_raw = f.read()

pricing_processed = process_html('index.html')
# We can also export pricingHtml as homeHtml (which contains the full pricing section) or dedicated
ts_lines.append(f"export const pricingHtml: string = homeHtml;\n")

ts_file = os.path.join(out_dir, "pages.ts")
with open(ts_file, 'w', encoding='utf-8') as f:
    f.writelines(ts_lines)

print(f"\nSuccessfully wrote {ts_file} ({os.path.getsize(ts_file)} bytes)")
