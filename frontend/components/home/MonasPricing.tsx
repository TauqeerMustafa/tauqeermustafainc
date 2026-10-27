import Link from "next/link";

export default function MonasPricing() {
  const plans = [
    {
      name: "Engineering Sprint Deposit",
      price: "$1,500",
      period: "Fixed Milestone",
      badge: "Fast Track",
      desc: "For rapid product development, feature launches, or critical infrastructure upgrades within 7–14 business days.",
      features: [
        "Full-stack Next.js 16 + React 19 build",
        "Cloud backend & PostgreSQL setup",
        "Zero-trust security audit & testing",
        "Direct engineer Slack/WhatsApp line",
        "Instant Whop checkout settlement",
      ],
      ctaText: "Pay Deposit via Whop",
      ctaLink: "https://billing.qorlune.co.uk",
      featured: false,
    },
    {
      name: "Complete Enterprise Platform",
      price: "$3,500",
      period: "Milestone Contract",
      badge: "Most Popular",
      desc: "End-to-end bespoke software platform, custom AI agent integrations, user portals, and multi-tenant cloud edge.",
      features: [
        "Complete bespoke platform architecture",
        "Autonomous AI automation & workflows",
        "Client/Admin role-based workspaces",
        "Production Vercel & Supabase clustering",
        "99.99% uptime SLA & deployment guide",
      ],
      ctaText: "Initiate Platform Build",
      ctaLink: "/contact",
      featured: true,
    },
    {
      name: "Autonomous AI Workforce",
      price: "$5,000",
      period: "/ Monthly Retainer",
      badge: "Enterprise AI",
      desc: "Continuous autonomous operations: 24/7 background AI dispatchers, multi-agent coordination, and active maintenance.",
      features: [
        "Multi-cloud background agent runners",
        "High-throughput data extraction & sync",
        "Ongoing security patches & zero downtime",
        "Dedicated senior DevOps engineer",
        "Priority emergency response (<15 min)",
      ],
      ctaText: "Book Retainer Call",
      ctaLink: "/contact",
      featured: false,
    },
  ];

  return (
    <section className="h1-service__area section-space-bottom heading-bg py-5" style={{ background: "#0f0f11", padding: "100px 0" }}>
      <div className="container custom-container">
        {/* Section Header */}
        <div className="text-center mb-5 pb-3">
          <span style={{ color: "#cf4500", fontSize: "13px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.15em" }}>
            Transparent Settlement &amp; Terms
          </span>
          <h2 style={{ fontSize: "clamp(32px, 4vw, 56px)", fontWeight: "800", color: "#ffffff", letterSpacing: "-0.02em", marginTop: "8px" }}>
            ENGAGEMENT TIERS <span style={{ color: "rgba(255,255,255,0.3)" }}>—</span>
          </h2>
          <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "16px", maxWidth: "600px", margin: "14px auto 0" }}>
            No surprise invoices, hidden hours, or complex contracts. Transparent milestones settled directly via the Whop Merchant of Record rail.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="row g-4 align-items-stretch justify-content-center">
          {plans.map((p, idx) => (
            <div key={idx} className="col-lg-4 col-md-6">
              <div
                className="h-100 p-4 p-lg-5 d-flex flex-column justify-content-between"
                style={{
                  background: p.featured ? "linear-gradient(180deg, #222227 0%, #18181b 100%)" : "#18181b",
                  borderRadius: "24px",
                  border: p.featured ? "2px solid #cf4500" : "1px solid rgba(255,255,255,0.08)",
                  position: "relative",
                  boxShadow: p.featured ? "0 20px 40px rgba(207,69,0,0.15)" : "none",
                }}
              >
                <div>
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <span
                      style={{
                        background: p.featured ? "#cf4500" : "rgba(255,255,255,0.08)",
                        color: "#fff",
                        fontSize: "12px",
                        fontWeight: "700",
                        textTransform: "uppercase",
                        padding: "5px 12px",
                        borderRadius: "20px",
                        letterSpacing: "0.06em",
                      }}
                    >
                      {p.badge}
                    </span>
                    <span style={{ color: "rgba(255,255,255,0.4)", fontSize: "13px" }}>Fixed Price</span>
                  </div>

                  <h3 style={{ color: "#ffffff", fontSize: "22px", fontWeight: "700", marginBottom: "8px" }}>
                    {p.name}
                  </h3>

                  <div className="d-flex align-items-baseline gap-2 my-4">
                    <span style={{ color: "#ffffff", fontSize: "clamp(36px, 4vw, 48px)", fontWeight: "800", letterSpacing: "-0.03em" }}>
                      {p.price}
                    </span>
                    <span style={{ color: "rgba(255,255,255,0.5)", fontSize: "14px", fontWeight: "500" }}>
                      {p.period}
                    </span>
                  </div>

                  <p style={{ color: "rgba(255,255,255,0.65)", fontSize: "14px", lineHeight: "1.6", marginBottom: "28px" }}>
                    {p.desc}
                  </p>

                  <div className="pt-3" style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
                    <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "12px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "16px" }}>
                      What's Included:
                    </p>
                    <ul className="list-unstyled d-flex flex-column gap-3 mb-0">
                      {p.features.map((f, i) => (
                        <li key={i} className="d-flex align-items-center gap-3" style={{ color: "rgba(255,255,255,0.85)", fontSize: "14px" }}>
                          <i className="fa-solid fa-check" style={{ color: "#cf4500", fontSize: "13px" }}></i>
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="pt-5 mt-4">
                  {p.ctaLink.startsWith("http") ? (
                    <a
                      href={p.ctaLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        background: p.featured ? "#cf4500" : "rgba(255,255,255,0.08)",
                        color: "#fff",
                        border: p.featured ? "none" : "1px solid rgba(255,255,255,0.15)",
                        padding: "14px 24px",
                        borderRadius: "30px",
                        fontSize: "14px",
                        fontWeight: "700",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                        textDecoration: "none",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "8px",
                        width: "100%",
                      }}
                    >
                      {p.ctaText} <i className="fa-solid fa-arrow-up-right-from-square" style={{ fontSize: "12px" }}></i>
                    </a>
                  ) : (
                    <Link
                      href={p.ctaLink}
                      style={{
                        background: p.featured ? "#cf4500" : "rgba(255,255,255,0.08)",
                        color: "#fff",
                        border: p.featured ? "none" : "1px solid rgba(255,255,255,0.15)",
                        padding: "14px 24px",
                        borderRadius: "30px",
                        fontSize: "14px",
                        fontWeight: "700",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                        textDecoration: "none",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "8px",
                        width: "100%",
                      }}
                    >
                      {p.ctaText} <i className="fa-solid fa-arrow-right" style={{ fontSize: "12px" }}></i>
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
