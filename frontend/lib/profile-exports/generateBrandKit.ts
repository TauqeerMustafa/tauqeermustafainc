import JSZip from "jszip";
import { saveAs } from "file-saver";
import { company } from "@/data/company";

/**
 * Generate and download Corporate VCard (.vcf)
 */
export function generateVCard(): void {
  const vcardContent = `BEGIN:VCARD
VERSION:3.0
FN:${company.name}
ORG:${company.name}
TITLE:Digital Engineering & Cybersecurity
TEL;TYPE=WORK,VOICE:${company.phone}
TEL;TYPE=CELL,MSG:${company.whatsappChannels.general.number}
EMAIL;TYPE=WORK,INTERNET:${company.emails.contact}
EMAIL;TYPE=WORK,INTERNET:${company.emails.sales}
EMAIL;TYPE=WORK,INTERNET:${company.emails.support}
URL:${company.website}
ADR;TYPE=WORK,POSTAL,PARCEL:;;6 Milton Rd;Harrow;London;HA1 1XX;United Kingdom
ADR;TYPE=WORK:;;Flat 02-A A Block, Awais Appt, Iqbal Town;Islamabad;;;Pakistan
NOTE:${company.tagline} - ${company.description}
END:VCARD`;

  const blob = new Blob([vcardContent], { type: "text/vcard;charset=utf-8" });
  saveAs(blob, "Tauqeer-Mustafa-Inc-Contact.vcf");
}

/**
 * Generate and download Word Document Proposal (.doc/.docx format)
 */
export function generateDocxProposal(): void {
  const htmlDoc = `
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>${company.name} - Statement of Work & Proposal</title>
<style>
  body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #111827; padding: 40px; }
  h1 { color: #111827; border-bottom: 3px solid #2563eb; padding-bottom: 10px; font-size: 26pt; }
  h2 { color: #2563eb; margin-top: 30px; font-size: 16pt; border-bottom: 1px solid #e5e7eb; padding-bottom: 6px; }
  h3 { color: #1f2937; margin-top: 20px; font-size: 12pt; }
  p, li { font-size: 10.5pt; color: #374151; }
  .highlight-box { background: #f3f4f6; border-left: 4px solid #2563eb; padding: 15px; margin: 20px 0; }
  .meta-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
  .meta-table th, .meta-table td { border: 1px solid #e5e7eb; padding: 10px; font-size: 10pt; text-align: left; }
  .meta-table th { background-color: #f9fafb; color: #111827; }
  .badge { display: inline-block; background: #2563eb; color: white; padding: 3px 8px; font-size: 9pt; font-weight: bold; }
</style>
</head>
<body>
  <h1>${company.name}</h1>
  <p><strong>${company.tagline}</strong></p>
  <p>Official Website: <a href="${company.website}">${company.website}</a> | Sales Desk: ${company.emails.sales}</p>
  
  <div class="highlight-box">
    <strong>Executive Profile & Engagement Proposal</strong><br>
    ${company.description}
  </div>

  <h2>1. Company Identity & Registered Entities</h2>
  <table class="meta-table">
    <tr><th>Company Name</th><td>${company.name} (Short: ${company.shortName})</td></tr>
    <tr><th>Founded</th><td>${company.founded}</td></tr>
    <tr><th>UK Head Office</th><td>${company.hq}</td></tr>
    <tr><th>Regional Office</th><td>${company.offices[1]?.address || "Islamabad, Pakistan"}</td></tr>
    <tr><th>Sales Contact</th><td>${company.emails.sales} | WhatsApp: ${company.whatsappChannels.general.number}</td></tr>
    <tr><th>24/7 Support Desk</th><td>${company.emails.support}</td></tr>
  </table>

  <h2>2. Core Technical Disciplines</h2>
  <ul>
    <li><strong>Web Platforms & Enterprise SaaS:</strong> Next.js, React 19, TypeScript, PostgreSQL, REST/GraphQL microservices.</li>
    <li><strong>Cybersecurity & DevSecOps:</strong> Zero-trust threat modeling, OWASP Top 10 mitigation, penetration testing, and container security.</li>
    <li><strong>AI Integration & Custom Workflows:</strong> Custom LLM embeddings, RAG pipelines, and automated intelligence.</li>
    <li><strong>Cloud Infrastructure:</strong> AWS/GCP, Docker, Kubernetes, Redis, automated CI/CD deployments with 99.98% SLA.</li>
    <li><strong>Design Systems:</strong> WCAG 2.1 AA compliant UI/UX, design tokens, and conversion architecture.</li>
  </ul>

  <h2>3. Standard Engagement & Delivery Terms</h2>
  <ul>
    <li><strong>Direct Technical Leadership:</strong> Engagements are led directly by our founding engineers.</li>
    <li><strong>100% Intellectual Property Ownership:</strong> All code, design assets, and documentation transfer fully to the client upon milestone settlement.</li>
    <li><strong>Mutual Non-Disclosure (NDA):</strong> Standard bilateral NDA executed prior to discovery and code review.</li>
    <li><strong>Payment Milestones:</strong> Structured milestone payments via bank wire, Paddle, or Stripe with multi-currency support (USD, GBP, EUR, PKR).</li>
  </ul>

  <h2>4. Commercial & Proposal Contacts</h2>
  <p>To initiate a statement of work or request a formal technical review, please contact:</p>
  <p><strong>Tauqeer Mustafa Inc. Commercial Desk</strong><br>
  Email: ${company.emails.sales}<br>
  Website: <a href="${company.website}">${company.website}</a></p>
</body>
</html>
`;

  const blob = new Blob([htmlDoc], { type: "application/msword;charset=utf-8" });
  saveAs(blob, "Tauqeer-Mustafa-Inc-Proposal-Template.doc");
}

/**
 * Generate and download Brand & Press Media Kit (.zip)
 */
export async function generateBrandKitZip(): Promise<void> {
  const zip = new JSZip();

  // 1. Dark Vector Logo SVG
  const logoDarkSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 100" width="400" height="100">
  <rect width="100%" height="100%" fill="#0d1117"/>
  <rect x="20" y="20" width="60" height="60" rx="10" fill="#2563eb"/>
  <text x="36" y="62" font-family="Arial, sans-serif" font-size="32" font-weight="bold" fill="#ffffff">TM</text>
  <text x="96" y="55" font-family="Arial, sans-serif" font-size="24" font-weight="bold" fill="#ffffff">Tauqeer Mustafa Inc.</text>
  <text x="96" y="72" font-family="Arial, sans-serif" font-size="11" font-weight="bold" fill="#38bdf8" letter-spacing="1">ENGINEERING &amp; SECURITY</text>
</svg>`;

  // 2. Light Vector Logo SVG
  const logoLightSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 100" width="400" height="100">
  <rect width="100%" height="100%" fill="#ffffff"/>
  <rect x="20" y="20" width="60" height="60" rx="10" fill="#111827"/>
  <text x="36" y="62" font-family="Arial, sans-serif" font-size="32" font-weight="bold" fill="#ffffff">TM</text>
  <text x="96" y="55" font-family="Arial, sans-serif" font-size="24" font-weight="bold" fill="#111827">Tauqeer Mustafa Inc.</text>
  <text x="96" y="72" font-family="Arial, sans-serif" font-size="11" font-weight="bold" fill="#2563eb" letter-spacing="1">ENGINEERING &amp; SECURITY</text>
</svg>`;

  // 3. Mark / Icon SVG
  const iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120">
  <rect width="100%" height="100%" rx="24" fill="#0d1117"/>
  <rect x="10" y="10" width="100" height="100" rx="18" fill="#2563eb"/>
  <text x="32" y="78" font-family="Arial, sans-serif" font-size="52" font-weight="bold" fill="#ffffff">TM</text>
</svg>`;

  // 4. Brand Guidelines Document
  const brandGuideMd = `# Tauqeer Mustafa Inc. — Official Brand Guidelines & Press Spec

## 1. Company Name & Verbal Identity
- **Full Legal Name:** Tauqeer Mustafa Inc.
- **Short Name:** TMI
- **Tagline:** Engineering that ships. Security that holds.
- **Primary Website:** https://tauqeermustafa.tech

## 2. Color Palette
- **Obsidian Dark (Canvas / Hero):** \`#0D1117\` (RGB: 13, 17, 23)
- **Ink Primary (Headings / Text):** \`#111827\` (RGB: 17, 24, 39)
- **Action / M-Blue (Primary Accent):** \`#2563EB\` (RGB: 37, 99, 235)
- **Cyan / Highlight (Tech Accent):** \`#38BDF8\` (RGB: 56, 189, 248)
- **Surface Muted (Cards / Borders):** \`#1F2937\` / \`#E5E7EB\`

## 3. Typography
- **Primary UI / Headings:** Inter, SF Pro Display, Segoe UI, -apple-system, sans-serif
- **Monospace / Code / Badges:** JetBrains Mono, SF Mono, Menlo, monospace

## 4. Logo Clearspace & Usage
- Do not distort, skew, or recolor the logo icon.
- Maintain a minimum clearspace equal to the height of the 'TM' glyph around the wordmark.
- Use the dark-mode vector on dark backgrounds and the light-mode vector on light surfaces.

## 5. Media Contact
For press inquiries, brand permissions, or high-res photography requests:
Email: marketing@tauqeermustafa.tech / contact@tauqeermustafa.tech
`;

  // 5. Company Facts Markdown
  const factsMd = `# Tauqeer Mustafa Inc. Quick Facts Sheet

- **Founded:** 2023
- **Head Office:** TMHQ, 6 Milton Rd, Harrow HA1 1XX, London, United Kingdom
- **Regional Office:** TMRQ Flat 02-A A Block, Awais Appt, Iqbal Town, Islamabad, Pakistan
- **Core Focus:** Web Platforms, Cybersecurity, AI Automation, Cloud SRE, Product Systems
- **Deliveries:** 45+ Production Systems
- **SLA Uptime:** 99.98% Maintained
- **Direct Contacts:**
  - Sales & Proposals: sales@tauqeermustafa.tech
  - Support & Helpdesk: support@tauqeermustafa.tech
  - WhatsApp Line: +92 333 56701199
`;

  zip.folder("logos")?.file("tmi-logo-dark.svg", logoDarkSvg);
  zip.folder("logos")?.file("tmi-logo-light.svg", logoLightSvg);
  zip.folder("logos")?.file("tmi-icon-square.svg", iconSvg);
  zip.file("BRAND-GUIDELINES.md", brandGuideMd);
  zip.file("COMPANY-FACTS.md", factsMd);

  const content = await zip.generateAsync({ type: "blob" });
  saveAs(content, "Tauqeer-Mustafa-Inc-Brand-Kit.zip");
}
