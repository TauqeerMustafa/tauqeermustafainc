import Link from "next/link";

export default function MonasServices() {
  const services = [
    {
      num: "001",
      title: "Mission-Critical Web & SaaS Platforms",
      tags: ["Next.js 16", "React 19", "Tailwind CSS", "TypeScript", "Node.js", "Vercel Edge"],
      desc: "Full-stack architectures built for high-throughput concurrency, instant page speeds, and flawless responsive usability across all global viewports.",
      href: "/services",
    },
    {
      num: "002",
      title: "Autonomous AI Workforce & Agentic Automation",
      tags: ["Multi-Agent Coordination", "Autonomous Dispatch", "LLM APIs", "Background Workflows"],
      desc: "Custom-trained AI agents and automated batch pipelines that run 24/7 in the cloud to extract data, resolve tasks, and coordinate complex business actions.",
      href: "/services",
    },
    {
      num: "003",
      title: "Cloud Infrastructure, DevSecOps & Databases",
      tags: ["PostgreSQL", "Supabase", "Redis KV", "Cloudflare", "GitHub Actions CI/CD"],
      desc: "Zero-maintenance edge backends with automatic failover, distributed caching, schema validation, and instant automated deployments.",
      href: "/services",
    },
    {
      num: "004",
      title: "FinTech Settlement, Billing & Invoicing Rails",
      tags: ["Whop Merchant of Record", "Paddle SDK", "Global Cards", "Automated Webhooks"],
      desc: "Production payment systems allowing global clients to pay invoices, retainers, and subscriptions in 130+ currencies with instant verification.",
      href: "/pricing",
    },
  ];

  return (
    <section className="h1-service__area section-space-bottom heading-bg py-5" style={{ background: "#0f0f11", padding: "100px 0" }}>
      <div className="container custom-container">
        {/* Section Header */}
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-end mb-5 pb-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
          <div>
            <span style={{ color: "#cf4500", fontSize: "13px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.15em" }}>
              Core Capabilities
            </span>
            <h2 style={{ fontSize: "clamp(32px, 4vw, 56px)", fontWeight: "800", color: "#ffffff", letterSpacing: "-0.02em", marginTop: "8px", margin: 0 }}>
              SERVICES <span style={{ color: "rgba(255,255,255,0.3)" }}>—</span>
            </h2>
          </div>
          <div className="mt-4 mt-md-0">
            <Link
              href="/services"
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
              All Services <i className="fa-solid fa-arrow-right" style={{ color: "#cf4500" }}></i>
            </Link>
          </div>
        </div>

        {/* Services List Accordion / Card Style */}
        <div className="d-flex flex-column gap-4">
          {services.map((item) => (
            <div
              key={item.num}
              className="p-4 p-lg-5"
              style={{
                background: "#18181b",
                borderRadius: "20px",
                border: "1px solid rgba(255,255,255,0.08)",
                transition: "all 0.3s ease",
              }}
            >
              <div className="row g-4 align-items-center">
                <div className="col-lg-5">
                  <div className="d-flex align-items-baseline gap-3">
                    <span style={{ color: "#cf4500", fontSize: "16px", fontWeight: "800", letterSpacing: "0.05em" }}>
                      {item.num}
                    </span>
                    <h3 style={{ color: "#ffffff", fontSize: "clamp(20px, 2.2vw, 28px)", fontWeight: "700", margin: 0, lineHeight: "1.3" }}>
                      <Link href={item.href} style={{ color: "#ffffff", textDecoration: "none" }}>
                        {item.title}
                      </Link>
                    </h3>
                  </div>
                </div>

                <div className="col-lg-5">
                  <p style={{ color: "rgba(255,255,255,0.65)", fontSize: "15px", lineHeight: "1.6", margin: 0 }}>
                    {item.desc}
                  </p>
                  <div className="d-flex flex-wrap gap-2 mt-3">
                    {item.tags.map((tag) => (
                      <span
                        key={tag}
                        style={{
                          background: "rgba(255,255,255,0.06)",
                          color: "rgba(255,255,255,0.75)",
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
                </div>

                <div className="col-lg-2 text-lg-end">
                  <Link
                    href={item.href}
                    style={{
                      width: "50px",
                      height: "50px",
                      borderRadius: "50%",
                      background: "rgba(255,255,255,0.06)",
                      border: "1px solid rgba(255,255,255,0.15)",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#ffffff",
                      textDecoration: "none",
                      transition: "all 0.2s ease",
                    }}
                    className="hover:border-action"
                  >
                    <i className="fa-solid fa-arrow-right"></i>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
