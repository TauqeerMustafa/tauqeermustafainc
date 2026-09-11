import { jsPDF } from "jspdf";
import { company } from "@/data/company";
import { companyMetrics, profileSlides } from "@/data/company-profile";

/**
 * Generate Comprehensive Multi-Page Company Profile PDF
 */
export function generateCompanyProfilePdf(): void {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 18;
  const contentWidth = pageWidth - margin * 2;

  // Colors
  const PRIMARY = [17, 24, 39]; // #111827
  const SECONDARY = [37, 99, 235]; // #2563eb
  const MUTED = [107, 114, 128]; // #6b7280
  const LIGHT_BG = [243, 244, 246]; // #f3f4f6
  const BORDER = [229, 231, 235]; // #e5e7eb

  // ---------------- PAGE 1: COVER & OVERVIEW ----------------
  // Header Banner
  doc.setFillColor(PRIMARY[0], PRIMARY[1], PRIMARY[2]);
  doc.rect(0, 0, pageWidth, 55, "F");

  // Accent Line
  doc.setFillColor(SECONDARY[0], SECONDARY[1], SECONDARY[2]);
  doc.rect(0, 55, pageWidth, 3, "F");

  // Title Text
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.text(company.name.toUpperCase(), margin, 24);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.setTextColor(209, 213, 219);
  doc.text(company.tagline, margin, 34);

  doc.setFontSize(9);
  doc.setTextColor(156, 163, 175);
  doc.text(
    `OFFICIAL COMPANY PROFILE & CAPABILITIES SPECIFICATION  •  EST. ${company.founded}`,
    margin,
    44
  );

  let curY = 70;

  // Executive Summary Section
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(PRIMARY[0], PRIMARY[1], PRIMARY[2]);
  doc.text("1. EXECUTIVE SUMMARY", margin, curY);

  curY += 6;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  doc.setTextColor(75, 85, 99);
  const descLines = doc.splitTextToSize(
    `${company.description} Our delivery model bridges the traditional divide between rapid software engineering and rigorous cybersecurity. Every platform is designed, developed, and deployed with zero-trust principles, hardened against threat vectors, and built for maintainable scale.`,
    contentWidth
  );
  doc.text(descLines, margin, curY);

  curY += descLines.length * 5 + 8;

  // Key Metrics Grid
  doc.setFillColor(LIGHT_BG[0], LIGHT_BG[1], LIGHT_BG[2]);
  doc.rect(margin, curY, contentWidth, 38, "F");
  doc.setDrawColor(BORDER[0], BORDER[1], BORDER[2]);
  doc.rect(margin, curY, contentWidth, 38, "S");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(SECONDARY[0], SECONDARY[1], SECONDARY[2]);
  doc.text("KEY PERFORMANCE & DELIVERY METRICS", margin + 5, curY + 7);

  const colW = contentWidth / 3;
  companyMetrics.slice(0, 6).forEach((metric, idx) => {
    const row = Math.floor(idx / 3);
    const col = idx % 3;
    const mx = margin + 5 + col * colW;
    const my = curY + 16 + row * 11;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(PRIMARY[0], PRIMARY[1], PRIMARY[2]);
    doc.text(metric.value, mx, my);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(MUTED[0], MUTED[1], MUTED[2]);
    doc.text(metric.label, mx, my + 4);
  });

  curY += 48;

  // Core Service Pillars
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(PRIMARY[0], PRIMARY[1], PRIMARY[2]);
  doc.text("2. CORE SERVICE DISCIPLINES", margin, curY);

  curY += 6;
  const pillars = [
    {
      title: "Web Platforms & SaaS",
      desc: "Production-grade Next.js, React, Node.js, and Supabase systems with high-throughput data pipelines and sub-100ms API response times.",
    },
    {
      title: "Cybersecurity & DevSecOps",
      desc: "Adversarial threat modeling, OWASP Top 10 hardening, penetration testing, compliance auditing, and automated container scanning.",
    },
    {
      title: "AI & Intelligent Automation",
      desc: "Custom LLM integrations, retrieval-augmented generation (RAG), automated processing workflows, and intelligent agent integrations.",
    },
    {
      title: "Cloud Infrastructure & SRE",
      desc: "Kubernetes, Docker, AWS/GCP architecture, multi-region failover, Redis caching, and automated CI/CD deployment pipelines.",
    },
    {
      title: "Product Design & Enterprise Systems",
      desc: "Design tokens, WCAG 2.1 AA accessibility, multi-tenant UI architectures, and conversion-focused user experiences.",
    },
  ];

  pillars.forEach((p) => {
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(BORDER[0], BORDER[1], BORDER[2]);
    doc.rect(margin, curY, contentWidth, 14, "S");

    doc.setFillColor(SECONDARY[0], SECONDARY[1], SECONDARY[2]);
    doc.rect(margin, curY, 2, 14, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.5);
    doc.setTextColor(PRIMARY[0], PRIMARY[1], PRIMARY[2]);
    doc.text(p.title, margin + 5, curY + 5);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(MUTED[0], MUTED[1], MUTED[2]);
    const pLines = doc.splitTextToSize(p.desc, contentWidth - 8);
    doc.text(pLines, margin + 5, curY + 9.5);

    curY += 16;
  });

  // Footer Page 1
  addFooter(doc, 1, 3, pageWidth, pageHeight, margin, company);

  // ---------------- PAGE 2: METHODOLOGY & SECURITY ----------------
  doc.addPage();
  addHeaderBanner(doc, "OPERATING MODEL & GOVERNANCE", pageWidth, margin);

  curY = 32;

  // 4-Phase Delivery Framework
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(PRIMARY[0], PRIMARY[1], PRIMARY[2]);
  doc.text("3. FOUR-PHASE DELIVERY METHODOLOGY", margin, curY);

  curY += 6;
  const phases = [
    {
      phase: "PHASE 1",
      name: "Technical Discovery & Architecture",
      desc: "Requirements extraction, threat surface analysis, dependency auditing, and fixed milestone scoping.",
    },
    {
      phase: "PHASE 2",
      name: "Iterative Sprint Execution",
      desc: "Bi-weekly shippable increments, staging environments, continuous client demos, and direct engineer communication.",
    },
    {
      phase: "PHASE 3",
      name: "Security Hardening & QA",
      desc: "Penetration testing, load stress simulation, vulnerability scans, cross-browser audits, and regression verification.",
    },
    {
      phase: "PHASE 4",
      name: "Production Launch & Handover",
      desc: "Zero-downtime deployment, infrastructure telemetry, complete IP transfer, and comprehensive operational handover.",
    },
  ];

  phases.forEach((phase) => {
    doc.setFillColor(LIGHT_BG[0], LIGHT_BG[1], LIGHT_BG[2]);
    doc.rect(margin, curY, contentWidth, 18, "F");
    doc.setDrawColor(BORDER[0], BORDER[1], BORDER[2]);
    doc.rect(margin, curY, contentWidth, 18, "S");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(SECONDARY[0], SECONDARY[1], SECONDARY[2]);
    doc.text(phase.phase, margin + 4, curY + 6);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(PRIMARY[0], PRIMARY[1], PRIMARY[2]);
    doc.text(phase.name, margin + 24, curY + 6);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(MUTED[0], MUTED[1], MUTED[2]);
    const lines = doc.splitTextToSize(phase.desc, contentWidth - 10);
    doc.text(lines, margin + 4, curY + 12);

    curY += 21;
  });

  curY += 6;

  // Security Posture & Standards
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(PRIMARY[0], PRIMARY[1], PRIMARY[2]);
  doc.text("4. ENTERPRISE SECURITY & COMPLIANCE POSTURE", margin, curY);

  curY += 6;
  const securityItems = [
    {
      label: "Zero-Trust Architecture",
      val: "Every layer requires authentication, authorization, and cryptographic parameter verification.",
    },
    {
      label: "Data Protection & Encryption",
      val: "TLS 1.3 encryption in transit with forward secrecy; AES-256 encryption at rest for databases and backups.",
    },
    {
      label: "Regulatory Governance",
      val: "Strict compliance frameworks supporting GDPR (UK/EU), CCPA (US), and PDPA data processing agreements.",
    },
    {
      label: "Complete IP Ownership",
      val: "All custom application code, architecture designs, and intellectual property transfer 100% to the client.",
    },
    {
      label: "Service Level Agreement (SLA)",
      val: "99.98% production uptime commitments with guaranteed escalation response times.",
    },
  ];

  securityItems.forEach((item) => {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(PRIMARY[0], PRIMARY[1], PRIMARY[2]);
    doc.text(`• ${item.label}:`, margin + 2, curY);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(MUTED[0], MUTED[1], MUTED[2]);
    const textLines = doc.splitTextToSize(item.val, contentWidth - 45);
    doc.text(textLines, margin + 45, curY);

    curY += Math.max(textLines.length * 4.5, 7);
  });

  addFooter(doc, 2, 3, pageWidth, pageHeight, margin, company);

  // ---------------- PAGE 3: LOCATIONS & DIRECT CONTACT ----------------
  doc.addPage();
  addHeaderBanner(doc, "GLOBAL PRESENCE & CONTACT DESK", pageWidth, margin);

  curY = 32;

  // Locations Section
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(PRIMARY[0], PRIMARY[1], PRIMARY[2]);
  doc.text("5. REGISTERED OFFICES & GLOBAL REACH", margin, curY);

  curY += 6;

  // UK Office
  doc.setFillColor(LIGHT_BG[0], LIGHT_BG[1], LIGHT_BG[2]);
  doc.rect(margin, curY, (contentWidth - 4) / 2, 36, "F");
  doc.setDrawColor(BORDER[0], BORDER[1], BORDER[2]);
  doc.rect(margin, curY, (contentWidth - 4) / 2, 36, "S");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(PRIMARY[0], PRIMARY[1], PRIMARY[2]);
  doc.text("HEAD OFFICE (UNITED KINGDOM)", margin + 4, curY + 7);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(MUTED[0], MUTED[1], MUTED[2]);
  doc.text("Tauqeer Mustafa Inc.", margin + 4, curY + 13);
  doc.text("TMHQ, 6 Milton Rd, Harrow HA1 1XX", margin + 4, curY + 18);
  doc.text("London, United Kingdom", margin + 4, curY + 23);
  doc.text("Hours: 09:00 - 18:00 GMT", margin + 4, curY + 28);

  // Regional Office
  const col2X = margin + (contentWidth - 4) / 2 + 4;
  doc.setFillColor(LIGHT_BG[0], LIGHT_BG[1], LIGHT_BG[2]);
  doc.rect(col2X, curY, (contentWidth - 4) / 2, 36, "F");
  doc.setDrawColor(BORDER[0], BORDER[1], BORDER[2]);
  doc.rect(col2X, curY, (contentWidth - 4) / 2, 36, "S");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(PRIMARY[0], PRIMARY[1], PRIMARY[2]);
  doc.text("REGIONAL ENGINEERING OFFICE", col2X + 4, curY + 7);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(MUTED[0], MUTED[1], MUTED[2]);
  doc.text("Tauqeer Mustafa Inc. (Regional HQ)", col2X + 4, curY + 13);
  doc.text("TMRQ Flat 02-A A Block, Awais Appt", col2X + 4, curY + 18);
  doc.text("Iqbal Town, Islamabad, Pakistan", col2X + 4, curY + 23);
  doc.text("Hours: 09:00 - 18:00 PKT", col2X + 4, curY + 28);

  curY += 46;

  // Direct Communication Desk
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(PRIMARY[0], PRIMARY[1], PRIMARY[2]);
  doc.text("6. DIRECT CLIENT CHANNELS & VERIFICATION", margin, curY);

  curY += 6;

  const contactList = [
    { label: "Commercial Proposals & Sales", val: company.emails.sales },
    { label: "General & Executive Desk", val: company.emails.contact },
    { label: "24/7 Client Support Helpdesk", val: company.emails.support },
    { label: "WhatsApp Direct Sales Line", val: company.whatsappChannels.general.number },
    { label: "WhatsApp 24/7 Support Desk", val: company.whatsappChannels.support.number },
    { label: "Official Website & Portals", val: company.website },
    { label: "Technical Portfolio (GitHub)", val: company.social.github },
    { label: "Executive Presence (LinkedIn)", val: company.social.linkedin },
  ];

  contactList.forEach((c) => {
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(BORDER[0], BORDER[1], BORDER[2]);
    doc.rect(margin, curY, contentWidth, 9, "S");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(PRIMARY[0], PRIMARY[1], PRIMARY[2]);
    doc.text(c.label, margin + 4, curY + 6);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(SECONDARY[0], SECONDARY[1], SECONDARY[2]);
    doc.text(c.val, margin + 80, curY + 6);

    curY += 10.5;
  });

  curY += 6;

  // Verified Badge Card
  doc.setFillColor(PRIMARY[0], PRIMARY[1], PRIMARY[2]);
  doc.rect(margin, curY, contentWidth, 24, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(255, 255, 255);
  doc.text("DIRECT FOUNDER-LED ENGAGEMENT MODEL", margin + 6, curY + 8);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(209, 213, 219);
  doc.text(
    "All proposals are reviewed directly by our founding engineering team. Engagements are scoped with realistic timelines, transparent pricing, and comprehensive milestones.",
    margin + 6,
    curY + 14,
    { maxWidth: contentWidth - 12 }
  );

  addFooter(doc, 3, 3, pageWidth, pageHeight, margin, company);

  // Save the PDF
  doc.save("Tauqeer-Mustafa-Inc-Company-Profile.pdf");
}

/**
 * Generate Executive One-Pager Summary PDF
 */
export function generateExecutiveOnePagerPdf(): void {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 16;
  const contentWidth = pageWidth - margin * 2;

  const PRIMARY = [17, 24, 39];
  const SECONDARY = [37, 99, 235];
  const MUTED = [107, 114, 128];
  const LIGHT_BG = [243, 244, 246];
  const BORDER = [229, 231, 235];

  // Header Banner
  doc.setFillColor(PRIMARY[0], PRIMARY[1], PRIMARY[2]);
  doc.rect(0, 0, pageWidth, 42, "F");

  doc.setFillColor(SECONDARY[0], SECONDARY[1], SECONDARY[2]);
  doc.rect(0, 42, pageWidth, 2.5, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.setTextColor(255, 255, 255);
  doc.text(company.name.toUpperCase(), margin, 18);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(209, 213, 219);
  doc.text(company.tagline, margin, 26);

  doc.setFontSize(8);
  doc.setTextColor(156, 163, 175);
  doc.text(
    `EXECUTIVE ONE-PAGER  •  HQ: LONDON, UK  •  ${company.website}`,
    margin,
    34
  );

  let curY = 52;

  // Overview
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(PRIMARY[0], PRIMARY[1], PRIMARY[2]);
  doc.text("EXECUTIVE OVERVIEW", margin, curY);

  curY += 5;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(75, 85, 99);
  const overview = doc.splitTextToSize(
    `${company.description} We work with fast-growing startups and enterprises that require systems built to handle real operational pressure without security vulnerabilities or vendor lock-in.`,
    contentWidth
  );
  doc.text(overview, margin, curY);

  curY += overview.length * 4.5 + 4;

  // Key Highlights Bar
  doc.setFillColor(LIGHT_BG[0], LIGHT_BG[1], LIGHT_BG[2]);
  doc.rect(margin, curY, contentWidth, 18, "F");
  doc.setDrawColor(BORDER[0], BORDER[1], BORDER[2]);
  doc.rect(margin, curY, contentWidth, 18, "S");

  const statCols = [
    { val: "99.98%", lbl: "SLA Uptime" },
    { val: "45+ Ships", lbl: "Engagements" },
    { val: "8-16 Wks", lbl: "Avg Sprint" },
    { val: "100%", lbl: "IP Transfer" },
  ];

  const sColW = contentWidth / 4;
  statCols.forEach((s, idx) => {
    const sx = margin + idx * sColW + 4;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(PRIMARY[0], PRIMARY[1], PRIMARY[2]);
    doc.text(s.val, sx, curY + 8);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(MUTED[0], MUTED[1], MUTED[2]);
    doc.text(s.lbl, sx, curY + 13);
  });

  curY += 24;

  // Core Capabilities Grid (2 Columns)
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(PRIMARY[0], PRIMARY[1], PRIMARY[2]);
  doc.text("CORE CAPABILITIES & DISCIPLINES", margin, curY);

  curY += 5;

  const caps = [
    {
      title: "1. Web Engineering & SaaS",
      desc: "Next.js 15, React 19, TypeScript, PostgreSQL, and resilient microservices.",
    },
    {
      title: "2. Cybersecurity Consulting",
      desc: "Penetration testing, vulnerability auditing, zero-trust RBAC, and DevSecOps.",
    },
    {
      title: "3. AI Workflows & RAG",
      desc: "LLM integration, autonomous agents, and document intelligence pipelines.",
    },
    {
      title: "4. Cloud & SRE Infrastructure",
      desc: "Docker, Kubernetes, AWS/GCP, automated CI/CD, and Redis caching layers.",
    },
  ];

  const capColW = (contentWidth - 4) / 2;
  caps.forEach((cap, idx) => {
    const row = Math.floor(idx / 2);
    const col = idx % 2;
    const cx = margin + col * (capColW + 4);
    const cy = curY + row * 22;

    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(BORDER[0], BORDER[1], BORDER[2]);
    doc.rect(cx, cy, capColW, 19, "S");

    doc.setFillColor(SECONDARY[0], SECONDARY[1], SECONDARY[2]);
    doc.rect(cx, cy, 2, 19, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(PRIMARY[0], PRIMARY[1], PRIMARY[2]);
    doc.text(cap.title, cx + 5, cy + 6);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(MUTED[0], MUTED[1], MUTED[2]);
    const lines = doc.splitTextToSize(cap.desc, capColW - 8);
    doc.text(lines, cx + 5, cy + 11);
  });

  curY += 50;

  // Operating Model & Trust
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(PRIMARY[0], PRIMARY[1], PRIMARY[2]);
  doc.text("DELIVERY DISCIPLINES & TRUST STANDARDS", margin, curY);

  curY += 5;

  const trustBullets = [
    "• Direct Senior Engineering: Work directly with lead engineers without account manager buffering.",
    "• Zero-Trust by Default: Embedded threat modeling, automated linting, and strict access controls.",
    "• Transparent Sprints: Bi-weekly shippable demo releases with live staging environments.",
    "• 100% IP Transfer: Complete code, repository, and asset ownership passes to client upon settlement.",
  ];

  trustBullets.forEach((bullet) => {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(75, 85, 99);
    doc.text(bullet, margin, curY);
    curY += 5.5;
  });

  curY += 4;

  // Contact Box
  doc.setFillColor(LIGHT_BG[0], LIGHT_BG[1], LIGHT_BG[2]);
  doc.rect(margin, curY, contentWidth, 42, "F");
  doc.setDrawColor(BORDER[0], BORDER[1], BORDER[2]);
  doc.rect(margin, curY, contentWidth, 42, "S");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.setTextColor(PRIMARY[0], PRIMARY[1], PRIMARY[2]);
  doc.text("DIRECT ENGAGEMENT & PROPOSAL INQUIRIES", margin + 5, curY + 7);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(75, 85, 99);
  doc.text(`• Sales & RFPs: ${company.emails.sales}`, margin + 5, curY + 14);
  doc.text(`• General Inquiries: ${company.emails.contact}`, margin + 5, curY + 20);
  doc.text(`• WhatsApp Direct: ${company.whatsappChannels.general.number}`, margin + 5, curY + 26);
  doc.text(`• Head Office: TMHQ, 6 Milton Rd, Harrow HA1 1XX, London, UK`, margin + 5, curY + 32);
  doc.text(`• Regional Office: TMRQ, Iqbal Town, Islamabad, Pakistan`, margin + 5, curY + 37);

  // Footer
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(MUTED[0], MUTED[1], MUTED[2]);
  doc.text(
    `© ${new Date().getFullYear()} ${company.name}  •  ${company.website}`,
    margin,
    pageHeight - 10
  );

  doc.save("Tauqeer-Mustafa-Inc-Executive-OnePager.pdf");
}

function addHeaderBanner(doc: jsPDF, subtitle: string, pageWidth: number, margin: number) {
  doc.setFillColor(17, 24, 39);
  doc.rect(0, 0, pageWidth, 20, "F");
  doc.setFillColor(37, 99, 235);
  doc.rect(0, 20, pageWidth, 1.5, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(255, 255, 255);
  doc.text(company.name.toUpperCase(), margin, 12);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(209, 213, 219);
  doc.text(subtitle, pageWidth - margin, 12, { align: "right" });
}

function addFooter(
  doc: jsPDF,
  page: number,
  totalPages: number,
  pageWidth: number,
  pageHeight: number,
  margin: number,
  companyObj: typeof company
) {
  doc.setDrawColor(229, 231, 235);
  doc.line(margin, pageHeight - 14, pageWidth - margin, pageHeight - 14);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(107, 114, 128);
  doc.text(`${companyObj.name}  •  ${companyObj.website}`, margin, pageHeight - 8);
  doc.text(
    `Page ${page} of ${totalPages}`,
    pageWidth - margin,
    pageHeight - 8,
    { align: "right" }
  );
}
