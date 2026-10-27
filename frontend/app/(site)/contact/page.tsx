import type { Metadata } from "next";
import Link from "next/link";
import ContactForm from "@/components/contact/ContactForm";
import { company } from "@/data/company";
import { buildMetadata } from "@/lib/metadata";

export const metadata: Metadata = buildMetadata({
  title: "Contact Qorlune — Enterprise Direct Line",
  description:
    "Direct engineering access. Get in touch with our senior technical team for new project architecture, security audits, or AI automation.",
  path: "/contact",
});

export default function ContactPage() {
  return (
    <div>
      {/* Breadcrumb banner */}
      <section className="breadcrumb__area heading-bg p-relative py-5" style={{ background: "#0f0f11", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
        <div className="container custom-container py-4">
          <div className="d-inline-flex align-items-center gap-2 mb-3" style={{ background: "rgba(207,69,0,0.12)", border: "1px solid rgba(207,69,0,0.3)", padding: "5px 16px", borderRadius: "30px" }}>
            <span style={{ color: "#cf4500", fontSize: "12px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.1em" }}>
              Direct Line
            </span>
          </div>
          <h1 style={{ fontSize: "clamp(36px, 5vw, 64px)", fontWeight: "800", color: "#ffffff", letterSpacing: "-0.03em" }}>
            Let's Start a Conversation <br />
            <span style={{ color: "rgba(255,255,255,0.45)" }}>Direct to Senior Engineers.</span>
          </h1>
          <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "18px", maxWidth: "700px", marginTop: "16px", lineHeight: "1.6" }}>
            Every inquiry reaches our core engineering leadership directly. We respond within 15 minutes for critical incidents and 1 business day for project scoping.
          </p>
        </div>
      </section>

      {/* Contact Content */}
      <section className="contact-area heading-bg py-5" style={{ background: "#131315", padding: "90px 0" }}>
        <div className="container custom-container">
          <div className="row g-5">
            {/* Form */}
            <div className="col-lg-7">
              <div
                className="p-4 p-md-5"
                style={{
                  background: "#18181b",
                  borderRadius: "24px",
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
              >
                <h3 style={{ color: "#ffffff", fontSize: "24px", fontWeight: "700", marginBottom: "8px" }}>
                  Send us a Message
                </h3>
                <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "14px", marginBottom: "28px" }}>
                  Fill in your details and scope requirements below.
                </p>
                <ContactForm />
              </div>
            </div>

            {/* Direct Details */}
            <div className="col-lg-5">
              <div className="d-flex flex-column gap-4">
                <div
                  className="p-4 p-md-5"
                  style={{
                    background: "#18181b",
                    borderRadius: "24px",
                    border: "1px solid rgba(255,255,255,0.08)",
                  }}
                >
                  <span style={{ color: "#cf4500", fontSize: "12px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                    Official Channels
                  </span>
                  <div className="mt-4">
                    <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "4px" }}>
                      Direct Email
                    </p>
                    <a href={`mailto:${company.email}`} style={{ color: "#ffffff", fontSize: "17px", fontWeight: "600", textDecoration: "none" }}>
                      {company.email}
                    </a>
                  </div>

                  <div className="mt-4 pt-3" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                    <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "4px" }}>
                      Telephone / WhatsApp
                    </p>
                    <a href={`tel:${company.phone}`} style={{ color: "#ffffff", fontSize: "16px", fontWeight: "500", textDecoration: "none" }}>
                      {company.phone}
                    </a>
                  </div>

                  <div className="mt-4 pt-3" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                    <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "4px" }}>
                      Headquarters
                    </p>
                    <p style={{ color: "#ffffff", fontSize: "15px", lineHeight: "1.6", margin: 0 }}>
                      71-75 Shelton Street, Covent Garden,<br />
                      London, WC2H 9JQ, United Kingdom
                    </p>
                  </div>
                </div>

                <div
                  className="p-4"
                  style={{
                    background: "rgba(28,105,212,0.1)",
                    borderRadius: "20px",
                    border: "1px solid rgba(28,105,212,0.25)",
                  }}
                >
                  <h5 style={{ color: "#ffffff", fontSize: "16px", fontWeight: "700", marginBottom: "8px" }}>
                    Need Instant Settlement?
                  </h5>
                  <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "13px", lineHeight: "1.5", marginBottom: "14px" }}>
                    Existing clients can pay retainer deposits and milestone invoices directly via our Whop Merchant of Record rail.
                  </p>
                  <a
                    href="https://billing.qorlune.co.uk"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      color: "#1c69d4",
                      fontSize: "13px",
                      fontWeight: "700",
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                      textDecoration: "none",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                    }}
                  >
                    Open Billing Terminal <i className="fa-solid fa-arrow-up-right-from-square" style={{ fontSize: "11px" }}></i>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
