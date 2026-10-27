import Link from "next/link";
import Image from "next/image";

export default function MonasProjects() {
  const projects = [
    {
      title: "Qorlune Client Workspace & Management Hub",
      category: "Enterprise Portals & Auth",
      year: "2026",
      desc: "Zero-trust client portals, task orchestration, real-time ticket escalation, and encrypted document management.",
      tags: ["Next.js 16", "Supabase SSR", "PostgreSQL", "RBAC"],
      link: "https://client.qorlune.co.uk",
      isExternal: true,
    },
    {
      title: "Autonomous B2B Cloud Outreach Engine",
      category: "AI Agent Automation",
      year: "2026",
      desc: "Distributed cloud worker executing rotating multi-provider SMTP & REST deliveries with 100% completion across worldwide workbooks.",
      tags: ["Python", "GitHub Actions", "Multi-Provider API", "OpenPyXL"],
      link: "/portfolio",
      isExternal: false,
    },
    {
      title: "Universal Card Settlement & Whop Billing Terminal",
      category: "FinTech & Payment Rails",
      year: "2026",
      desc: "Streamlined single-page settlement rail supporting 130+ global payment methods, Apple Pay, Google Pay, and instant webhooks.",
      tags: ["Whop Merchant of Record", "TypeScript", "Vercel Edge", "Stripe Rails"],
      link: "https://billing.qorlune.co.uk",
      isExternal: true,
    },
    {
      title: "Global 50,000 Corporate Leads Enrichment Crawler",
      category: "Data Mining & Intelligence",
      year: "2026",
      desc: "High-throughput concurrent scraper crawling corporate websites across 160 countries to discover verified executive contact routes.",
      tags: ["Concurrent Futures", "Thread Pools", "Domain Resolution", "Data Pipelines"],
      link: "/portfolio",
      isExternal: false,
    },
  ];

  return (
    <section className="h1-project__area section-space-bottom heading-2-bg py-5" style={{ background: "#131315", padding: "100px 0" }}>
      <div className="container custom-container">
        {/* Header */}
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-end mb-5 pb-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
          <div>
            <span style={{ color: "#cf4500", fontSize: "13px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.15em" }}>
              Case Studies &amp; Implementations
            </span>
            <h2 style={{ fontSize: "clamp(32px, 4vw, 56px)", fontWeight: "800", color: "#ffffff", letterSpacing: "-0.02em", marginTop: "8px", margin: 0 }}>
              FEATURED WORK <span style={{ color: "rgba(255,255,255,0.3)" }}>—</span>
            </h2>
          </div>
          <div className="mt-4 mt-md-0">
            <Link
              href="/portfolio"
              style={{
                color: "#ffffff",
                fontSize: "14px",
                fontWeight: "600",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              All Projects <i className="fa-solid fa-arrow-right" style={{ color: "#cf4500" }}></i>
            </Link>
          </div>
        </div>

        {/* 2x2 Project Cards Grid */}
        <div className="row g-4">
          {projects.map((p, idx) => (
            <div key={idx} className="col-lg-6">
              <div
                className="h-100 p-4 p-md-5 d-flex flex-column justify-content-between"
                style={{
                  background: "#18181b",
                  borderRadius: "22px",
                  border: "1px solid rgba(255,255,255,0.08)",
                  position: "relative",
                  transition: "all 0.3s ease",
                }}
              >
                <div>
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <span style={{ color: "#cf4500", fontSize: "13px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                      {p.category}
                    </span>
                    <span style={{ color: "rgba(255,255,255,0.4)", fontSize: "13px", fontWeight: "600" }}>
                      {p.year}
                    </span>
                  </div>

                  <h3 style={{ color: "#ffffff", fontSize: "clamp(22px, 2.4vw, 30px)", fontWeight: "700", lineHeight: "1.25", marginBottom: "16px" }}>
                    {p.isExternal ? (
                      <a href={p.link} target="_blank" rel="noopener noreferrer" style={{ color: "#ffffff", textDecoration: "none" }}>
                        {p.title}
                      </a>
                    ) : (
                      <Link href={p.link} style={{ color: "#ffffff", textDecoration: "none" }}>
                        {p.title}
                      </Link>
                    )}
                  </h3>

                  <p style={{ color: "rgba(255,255,255,0.65)", fontSize: "15px", lineHeight: "1.6" }}>
                    {p.desc}
                  </p>
                </div>

                <div className="pt-4 mt-4 d-flex justify-content-between align-items-center" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                  <div className="d-flex flex-wrap gap-2">
                    {p.tags.map((tag) => (
                      <span
                        key={tag}
                        style={{
                          background: "rgba(255,255,255,0.05)",
                          color: "rgba(255,255,255,0.8)",
                          fontSize: "12px",
                          fontWeight: "500",
                          padding: "4px 10px",
                          borderRadius: "6px",
                        }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  {p.isExternal ? (
                    <a
                      href={p.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        width: "44px",
                        height: "44px",
                        borderRadius: "50%",
                        background: "rgba(255,255,255,0.06)",
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#fff",
                        textDecoration: "none",
                        flexShrink: 0,
                      }}
                    >
                      <i className="fa-solid fa-arrow-up-right-from-square" style={{ fontSize: "14px", color: "#1c69d4" }}></i>
                    </a>
                  ) : (
                    <Link
                      href={p.link}
                      style={{
                        width: "44px",
                        height: "44px",
                        borderRadius: "50%",
                        background: "rgba(255,255,255,0.06)",
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#fff",
                        textDecoration: "none",
                        flexShrink: 0,
                      }}
                    >
                      <i className="fa-solid fa-arrow-right" style={{ fontSize: "14px", color: "#cf4500" }}></i>
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
