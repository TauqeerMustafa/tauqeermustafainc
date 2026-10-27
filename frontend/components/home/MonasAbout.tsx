import Link from "next/link";

export default function MonasAbout() {
  const pillars = [
    {
      number: "01",
      icon: "fa-solid fa-shield-halved",
      title: "Resilient Architecture",
      desc: "Zero-downtime microservices and fault-tolerant infrastructure built to withstand high traffic surges.",
    },
    {
      number: "02",
      icon: "fa-solid fa-robot",
      title: "Autonomous AI Agents",
      desc: "Autonomous workflow dispatch, multi-agent coordination, and intelligent data extraction engines.",
    },
    {
      number: "03",
      icon: "fa-solid fa-bolt",
      title: "High-Velocity Shipping",
      desc: "From initial sprint planning to global production deployment within 72 hours, backed by strict CI/CD pipelines.",
    },
    {
      number: "04",
      icon: "fa-solid fa-headset",
      title: "Direct Engineering Access",
      desc: "Speak directly with senior software architects without gatekeepers, account managers, or bureaucratic delays.",
    },
  ];

  return (
    <section className="h1-about__area section-space-bottom-90 section-space-top heading-2-bg fade-wrapper" style={{ background: "#131315", padding: "90px 0" }}>
      <div className="container custom-container">
        {/* Editorial Heading */}
        <div className="h1-about__heading-text mb-5">
          <h2 style={{ fontSize: "clamp(26px, 4vw, 48px)", fontWeight: "700", color: "#ffffff", lineHeight: "1.35", letterSpacing: "-0.02em", maxWidth: "1050px" }}>
            Qorlune is a specialized technology firm engineering{" "}
            <span style={{ color: "#cf4500", textDecoration: "underline", textUnderlineOffset: "8px" }}>production-grade platforms</span>,{" "}
            autonomous AI pipelines, and zero-trust cloud infrastructure worldwide.
          </h2>
        </div>

        {/* 4 Feature Pillars */}
        <div className="row g-4 mt-2">
          {pillars.map((item) => (
            <div key={item.number} className="col-xl-3 col-lg-6 col-md-6">
              <div
                className="h-100 p-4 d-flex flex-column justify-content-between"
                style={{
                  background: "#18181b",
                  borderRadius: "18px",
                  border: "1px solid rgba(255,255,255,0.06)",
                  transition: "transform 0.3s ease, border-color 0.3s ease",
                }}
              >
                <div>
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <div
                      style={{
                        width: "50px",
                        height: "50px",
                        borderRadius: "14px",
                        background: "rgba(207,69,0,0.12)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <i className={item.icon} style={{ color: "#cf4500", fontSize: "20px" }}></i>
                    </div>
                    <span style={{ color: "rgba(255,255,255,0.3)", fontSize: "14px", fontWeight: "700" }}>
                      {item.number}
                    </span>
                  </div>

                  <h5 style={{ color: "#ffffff", fontSize: "18px", fontWeight: "700", marginBottom: "10px" }}>
                    {item.title}
                  </h5>
                  <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "14px", lineHeight: "1.6", margin: 0 }}>
                    {item.desc}
                  </p>
                </div>

                <div className="pt-4 mt-3" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                  <Link href="/about" style={{ color: "rgba(255,255,255,0.5)", fontSize: "13px", fontWeight: "600", textDecoration: "none", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                    Learn More <i className="fa-solid fa-arrow-right ms-1" style={{ fontSize: "11px", color: "#cf4500" }}></i>
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
