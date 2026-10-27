import os, re, json

OUT_DIR = r'frontend\data\monas'

for fname in os.listdir(OUT_DIR):
    if not fname.endswith('.html'): continue
    fpath = os.path.join(OUT_DIR, fname)
    with open(fpath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Fix //logo.png, //about-architecture.png, //images, //assets
    fixed = content.replace('="//logo.png"', '="/logo.png"')
    fixed = fixed.replace("='//logo.png'", "='/logo.png'")
    fixed = fixed.replace('="//about-architecture.png"', '="/about-architecture.png"')
    fixed = fixed.replace("='//about-architecture.png'", "='/about-architecture.png'")
    fixed = fixed.replace('="//images/', '="/images/')
    fixed = fixed.replace('="//assets/', '="/assets/')
    
    if fixed != content:
        print(f"Fixed double slashes in {fname}")
        with open(fpath, 'w', encoding='utf-8') as f:
            f.write(fixed)

# Regenerate pages.ts
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

ts_lines = ["// 100% Authentic Qorlune Enterprise Platform for Node.js / Next.js\n"]

for var_name, html_file in pages_map.items():
    with open(os.path.join(OUT_DIR, html_file), 'r', encoding='utf-8') as hf:
        body = hf.read()
    json_str = json.dumps(body)
    ts_lines.append(f"export const {var_name}: string = {json_str};\n")

ts_lines.append(f"export const pricingHtml: string = homeHtml;\n")

ts_file = os.path.join(OUT_DIR, "pages.ts")
with open(ts_file, 'w', encoding='utf-8') as f:
    f.writelines(ts_lines)

print("pages.ts updated cleanly!")
