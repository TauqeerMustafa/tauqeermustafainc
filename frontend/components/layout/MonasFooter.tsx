import Link from "next/link";
import Image from "next/image";
import { company } from "@/data/company";

export default function MonasFooter() {
  return (
    <footer className="h1-footer__area fade-wrapper heading-bg" style={{ borderTop: "1px solid rgba(255,255,255,0.08)", background: "#0c0c0e" }}>
      {/* Marquee Banner */}
      <div className="container-fluid h1-f-custom-padding py-4" style={{ overflow: "hidden", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="d-flex align-items-center justify-content-between" style={{ whiteSpace: "nowrap" }}>
          <div className="h1-footer__content d-flex align-items-center gap-4">
            <h2 style={{ fontSize: "clamp(36px, 6vw, 72px)", fontWeight: "800", color: "#ffffff", letterSpacing: "-0.03em", margin: 0 }}>
              LET'S BUILD <span style={{ color: "#cf4500" }}>—</span> LET'S CHAT <span style={{ color: "rgba(255,255,255,0.2)" }}>—</span>
            </h2>
            <h2 style={{ fontSize: "clamp(36px, 6vw, 72px)", fontWeight: "800", color: "rgba(255,255,255,0.3)", letterSpacing: "-0.03em", margin: 0 }}>
              QORLUNE ENGINEERING <span style={{ color: "#cf4500" }}>—</span>
            </h2>
          </div>
        </div>
      </div>

      <div className="container custom-container py-5">
        <div className="row g-4 align-items-stretch">
          {/* Brand & Mission */}
          <div className="col-lg-4 col-md-6">
            <div className="h1-footer__widget body-dark-color h-100 d-flex flex-column pe-lg-4">
              <div className="mb-4">
                <Image
                  src="/qorlune-logo.png"
                  alt={company.name}
                  width={150}
                  height={42}
                  className="object-contain"
                />
              </div>
              <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "15px", lineHeight: "1.7" }}>
                Qorlune is a premier digital technology and engineering firm delivering high-assurance web platforms, custom AI automation, zero-trust cybersecurity, and resilient cloud architectures worldwide.
              </p>
              <div className="mt-auto pt-3">
                <span className="badge" style={{ background: "rgba(207,69,0,0.15)", color: "#cf4500", border: "1px solid rgba(207,69,0,0.3)", padding: "6px 14px", borderRadius: "20px", fontSize: "12px", fontWeight: "600" }}>
                  ISO/IEC 27001 Aligned • Zero Downtime
                </span>
              </div>
            </div>
          </div>

          {/* Inquiries & Direct Line */}
          <div className="col-lg-3 col-md-6">
            <div className="h1-footer__widget body-dark-color h-100 d-flex flex-column" style={{ borderLeft: "1px solid rgba(255,255,255,0.06)", paddingLeft: "24px" }}>
              <div className="h1-footer__widget-link">
                <p style={{ color: "#cf4500", fontSize: "12px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: "12px" }}>
                  Direct Inquiries
                </p>
                <h5 className="mb-2">
                  <a href={`mailto:${company.email}`} style={{ color: "#ffffff", textDecoration: "none", fontSize: "17px", fontWeight: "600" }}>
                    {company.email}
                  </a>
                </h5>
                <h6>
                  <a href={`tel:${company.phone}`} style={{ color: "rgba(255,255,255,0.7)", textDecoration: "none", fontSize: "15px" }}>
                    {company.phone}
                  </a>
                </h6>
                <div className="mt-4">
                  <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "6px" }}>Response Window</p>
                  <p style={{ color: "#ffffff", fontSize: "14px", fontWeight: "500", margin: 0 }}>
                    &lt; 15 Minutes for SLA Incident Teams
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Links & Infrastructure */}
          <div className="col-lg-2 col-md-6">
            <div className="h1-footer__widget body-dark-color h-100 d-flex flex-column" style={{ borderLeft: "1px solid rgba(255,255,255,0.06)", paddingLeft: "24px" }}>
              <div className="h1-footer__widget-link">
                <p style={{ color: "#cf4500", fontSize: "12px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: "12px" }}>
                  Navigation
                </p>
                <ul className="list-unstyled d-flex flex-column gap-2 mb-0">
                  <li><Link href="/about" style={{ color: "rgba(255,255,255,0.7)", textDecoration: "none", fontSize: "14px" }}>About Us</Link></li>
                  <li><Link href="/services" style={{ color: "rgba(255,255,255,0.7)", textDecoration: "none", fontSize: "14px" }}>Services</Link></li>
                  <li><Link href="/portfolio" style={{ color: "rgba(255,255,255,0.7)", textDecoration: "none", fontSize: "14px" }}>Portfolio</Link></li>
                  <li><Link href="/pricing" style={{ color: "rgba(255,255,255,0.7)", textDecoration: "none", fontSize: "14px" }}>Pricing</Link></li>
                  <li><Link href="/contact" style={{ color: "rgba(255,255,255,0.7)", textDecoration: "none", fontSize: "14px" }}>Contact</Link></li>
                  <li><a href="https://billing.qorlune.co.uk" target="_blank" rel="noopener noreferrer" style={{ color: "#1c69d4", textDecoration: "none", fontSize: "14px", fontWeight: "600" }}>Whop Billing Rail ↗</a></li>
                </ul>
              </div>
            </div>
          </div>

          {/* Follow & Headquarters */}
          <div className="col-lg-3 col-md-6">
            <div className="h1-footer__widget body-dark-color h-100 d-flex flex-column" style={{ borderLeft: "1px solid rgba(255,255,255,0.06)", paddingLeft: "24px" }}>
              <p style={{ color: "#cf4500", fontSize: "12px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: "12px" }}>
                Headquarters
              </p>
              <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "14px", lineHeight: "1.6", marginBottom: "16px" }}>
                71-75 Shelton Street, Covent Garden,<br />London, United Kingdom, WC2H 9JQ
              </p>
              <p style={{ color: "#cf4500", fontSize: "12px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: "10px" }}>
                Follow Qorlune
              </p>
              <ul className="d-flex gap-3 list-unstyled">
                <li>
                  <a href={company.social.linkedin} target="_blank" rel="noopener noreferrer" style={{ color: "#fff", background: "rgba(255,255,255,0.08)", width: "36px", height: "36px", borderRadius: "50%", display: "inline-flex", alignItems: "center", justifyContent: "center", textDecoration: "none" }}>
                    <i className="fa-brands fa-linkedin"></i>
                  </a>
                </li>
                <li>
                  <a href={company.social.github} target="_blank" rel="noopener noreferrer" style={{ color: "#fff", background: "rgba(255,255,255,0.08)", width: "36px", height: "36px", borderRadius: "50%", display: "inline-flex", alignItems: "center", justifyContent: "center", textDecoration: "none" }}>
                    <i className="fa-brands fa-github"></i>
                  </a>
                </li>
                <li>
                  <a href={company.social.twitter || "https://x.com/qorlune"} target="_blank" rel="noopener noreferrer" style={{ color: "#fff", background: "rgba(255,255,255,0.08)", width: "36px", height: "36px", borderRadius: "50%", display: "inline-flex", alignItems: "center", justifyContent: "center", textDecoration: "none" }}>
                    <i className="fa-brands fa-x-twitter"></i>
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="text-center pt-5 mt-5" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "13px", margin: 0 }}>
            © {new Date().getFullYear()} {company.legalName}. All Rights Reserved. Engineered for 99.99% Availability.
          </p>
        </div>
      </div>
    </footer>
  );
}
