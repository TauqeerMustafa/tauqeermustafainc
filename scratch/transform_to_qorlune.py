import os, re, json

SRC_DIR = r'scratch\monas-template\monas-package-file\monas-html'
OUT_DIR = r'frontend\data\monas'
os.makedirs(OUT_DIR, exist_ok=True)

def process_file(filename):
    raw_path = os.path.join(SRC_DIR, filename)
    with open(raw_path, 'r', encoding='utf-8', errors='ignore') as f:
        text = f.read()

    # Extract body content
    match = re.search(r'<body[^>]*>(.*?)</body>', text, re.DOTALL | re.IGNORECASE)
    if not match:
        raise ValueError(f"No body found in {filename}")
    body = match.group(1)
    
    # Strip existing <script> tags at bottom
    body = re.sub(r'<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>', '', body, flags=re.IGNORECASE)
    
    # 1. Clean asset URLs: turn ./assets/ and assets/ into /assets/
    body = re.sub(r'(src|href|data-background|data-thumb|data-bg)=["\'](?:\./)?assets/([^"\']+)["\']', r'\1="/assets/\2"', body)
    body = body.replace('//assets/', '/assets/')
    body = body.replace('./assets/', '/assets/')
    body = body.replace('assets/imgs/', '/assets/imgs/')
    body = body.replace('./about-architecture.png', '/about-architecture.png')

    # 2. Fix internal routing
    route_maps = [
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
    for old, new in route_maps:
        body = body.replace(old, new)
        body = body.replace(old.replace('"', "'"), new)

    # 3. Top menu transformations
    nav_replacements = [
        ('>Designer<', '>Enterprise Platform<'),
        ('>Developer<', '>AI Workforce<'),
        ('>Lawyer<', '>Cloud & DevSecOps<'),
        ('>Photographer<', '>FinTech Settlement<'),
        ('>project<', '>Solutions<'),
        ('>project details<', '>Solution Details<'),
        ('>About us<', '>About Us<'),
        ('>service<', '>Services<'),
        ('>service details<', '>Service Architecture<'),
        ('>blog<', '>Engineering Notes<'),
        ('>blog details<', '>Field Observation<'),
        ('>Contact<', '>Contact & Billing<'),
        ('>Contact Us<', '>Contact & Billing<'),
    ]
    for old, new in nav_replacements:
        body = body.replace(old, new)

    # 4. Global brand replacements
    body = body.replace('monascreativedesign@gmail.com', 'sales@qorlune.co.uk')
    body = body.replace('info@example.com', 'info@qorlune.co.uk')
    body = body.replace("HI, I'M MONAS", "QORLUNE SYSTEMS")
    body = body.replace("HI, I’M MONAS", "QORLUNE SYSTEMS")
    body = body.replace('Monas', 'Qorlune')
    body = body.replace('monas', 'qorlune')
    body = body.replace('+1 (555) 000-0000', '+1 711-091-5975')
    body = body.replace('+1 555 123 4567', '+1 711-091-5975')
    body = body.replace('Copyright  2025 Monas. All Rights Reserved.', 'Copyright © 2026 Qorlune LLC. All Rights Reserved.')
    body = body.replace('Copyright © 2025 Monas. All Rights Reserved.', 'Copyright © 2026 Qorlune LLC. All Rights Reserved.')
    body = body.replace('Copyright © 2025 Qorlune. All Rights Reserved.', 'Copyright © 2026 Qorlune LLC. All Rights Reserved.')
    body = body.replace('Available for freelance work', 'High-Assurance Engineering Active')
    body = body.replace('Available for freelance projects', 'High-Assurance Systems & AI Infrastructure')
    body = body.replace('Freelancer', 'Enterprise Engineering')
    body = body.replace('freelancer', 'Enterprise Engineering')

    # Replace logo with official high-res logo
    body = re.sub(r'/assets/imgs/logo/logo(?:-2)?\.png', '/logo.png', body)

    # 5. Transform Hero / Banner area:
    body = re.sub(r'<h1>\s*Freelance\s*<br>\s*Creative Designer\s*</h1>', '<h1>Enterprise <br> Technology Firm</h1>', body, flags=re.IGNORECASE)
    body = re.sub(r'<h1>\s*Freelance\s*<br>\s*Enterprise Technology Firm\s*</h1>', '<h1>Enterprise <br> Technology Firm</h1>', body, flags=re.IGNORECASE)
    body = body.replace('Creative Designer', 'Enterprise Technology Firm')

    # Replace banner image with Qorlune architecture diagram
    body = body.replace('/assets/imgs/banner/h1-banner-img1.jpg', '/about-architecture.png')
    body = body.replace('/assets/imgs/banner/banner-img-1.jpg', '/about-architecture.png')
    body = body.replace('/assets/imgs/banner/banner-img-1.png', '/about-architecture.png')

    # Replace Monas intro lines
    body = re.sub(r'<h6><a href="#">Hi,\s*I[^<]*</a></h6>', '<h6><a href="/about">Qorlune LLC</a></h6>', body)
    body = re.sub(r'<h6><a href="#">I[^<]*</a></h6>', '<h6><a href="/about">Qorlune LLC</a></h6>', body)

    # Replace the specific rr_title_anim h2 blocks
    body = re.sub(
        r'<h2 class="rr_title_anim">Hi,[\s\S]*?web designer[\s\S]*?</h2>',
        '<h2 class="rr_title_anim">Qorlune architects high-assurance digital platforms, custom AI workforces, <span class="ball-icon"><img src="/assets/imgs/icon/h1-ball-icon.png" alt="img not found"></span> and resilient cloud systems engineered for enterprise scale, mission-critical workloads, and zero-downtime reliability.</h2>',
        body
    )
    body = re.sub(
        r'<h2 class="rr_title_anim">I specialize in turning creative concepts into compelling[\s\S]*?</h2>',
        '<h2 class="rr_title_anim">We specialize in building resilient enterprise architecture, high-throughput financial settlement pipelines, and secure cloud ecosystems that scale without compromise.</h2>',
        body
    )
    body = re.sub(
        r'<h2 class="rr_title_anim">I work as a[\s\S]*?freelance[\s\S]*?</h2>',
        '<h2 class="rr_title_anim">Qorlune engineers high-throughput cloud platforms, multi-agent AI ecosystems, and secure distributed software for modern enterprises worldwide.</h2>',
        body
    )

    # 6. Projects / Solutions Section:
    body = body.replace('Explore Some of My Projects', 'Enterprise Solutions & Deployments')
    body = body.replace('from 2020 to 2024', 'Global Infrastructure & Platforms')
    
    # Map project images to real Qorlune images
    body = body.replace('/assets/imgs/project/project-img1.jpg', '/images/qorlune-acquisition.jpg')
    body = body.replace('/assets/imgs/project/project-img2.jpg', '/about-architecture.png')
    body = body.replace('/assets/imgs/project/project-img3.jpg', '/images/e66427a098a6617729ac146a2d301e91.jpg')
    body = body.replace('/assets/imgs/project/project-img4.jpg', '/images/certificate_732_preview.png')

    # Replace UI/UX Design titles
    body = body.replace('UI/UX Design', 'Enterprise ERP Settlement Hub')

    # 7. Capabilities & Pricing
    body = body.replace('SERVICES -', 'CAPABILITIES -')
    body = body.replace('PRICING -', 'TRANSPARENT RETAINERS -')
    body = body.replace('Check Out My Articles', 'Engineering Field Notes & Insights')

    # Replace pricing buttons with Whop billing terminal
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
    body = re.sub(r'href="javascript:void\(0\)"', 'href="https://billing.qorlune.co.uk"', body)

    # 8. Footer marquee and address
    body = re.sub(r'LET[^<]*s chat -', "LET'S BUILD — QORLUNE ENGINEERING — HIGH-ASSURANCE SYSTEMS — ", body)

    # Clean double slashes in paths
    body = body.replace('//assets/', '/assets/')

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

ts_lines = ["// 100% Authentic Qorlune Enterprise Platform for Node.js / Next.js\n"]

for var_name, html_file in pages_map.items():
    processed = process_file(html_file)
    clean_name = html_file.replace('.html', '')
    with open(os.path.join(OUT_DIR, f"{clean_name}.html"), 'w', encoding='utf-8') as hf:
        hf.write(processed)
    
    json_str = json.dumps(processed)
    ts_lines.append(f"export const {var_name}: string = {json_str};\n")
    print(f"Processed and transformed {html_file} -> {var_name}")

ts_lines.append(f"export const pricingHtml: string = homeHtml;\n")

ts_file = os.path.join(OUT_DIR, "pages.ts")
with open(ts_file, 'w', encoding='utf-8') as f:
    f.writelines(ts_lines)

print(f"\nSuccessfully updated {ts_file}!")
