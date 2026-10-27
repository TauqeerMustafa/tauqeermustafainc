import Link from "next/link";
import Image from "next/image";

export default function MonasHero() {
  return (
    <section className="h1-banner__area p-relative section-space heading-bg" style={{ minHeight: "85vh", display: "flex", alignItems: "center", position: "relative", overflow: "hidden", background: "#0f0f11", paddingTop: "60px", paddingBottom: "80px" }}>
      {/* Background Shapes */}
      <div className="h1-banner-shape d-none d-xl-block" style={{ pointerEvents: "none" }}>
        <img alt="" className="h1-banner-shape-1 p-absolute" src="/assets/imgs/shapes/banner-shape1.png" style={{ top: "10%", left: "5%", opacity: 0.15 }} />
        <img alt="" className="h1-banner-shape-2 p-absolute" src="/assets/imgs/shapes/banner-shape-2.png" style={{ bottom: "10%", right: "5%", opacity: 0.15 }} />
      </div>

      <div className="container custom-container" style={{ position: "relative", zIndex: 2 }}>
        {/* Header Title with Animated Badge */}
        <div className="h1-banner__header p-relative mb-5">
          <div className="d-inline-flex align-items-center gap-2 mb-3" style={{ background: "rgba(207,69,0,0.12)", border: "1px solid rgba(207,69,0,0.3)", padding: "6px 18px", borderRadius: "30px" }}>
            <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#cf4500", display: "inline-block", boxShadow: "0 0 10px #cf4500" }}></span>
            <span style={{ color: "#cf4500", fontSize: "13px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.1em" }}>
              Enterprise Platforms & AI Automation
            </span>
          </div>

          <h1 style={{ fontSize: "clamp(42px, 6vw, 84px)", fontWeight: "800", lineHeight: "1.05", color: "#ffffff", letterSpacing: "-0.03em" }}>
            Resilient Web Engineering <br />
            <span style={{ color: "rgba(255,255,255,0.45)" }}>&amp; Autonomous AI Systems.</span>
          </h1>
        </div>

        {/* 3-Column Banner Grid */}
        <div className="h1-banner__content">
          <div className="row align-items-stretch g-4">
            {/* Left Card: Value Proposition */}
            <div className="col-xl-3 col-md-6">
              <div
                className="h-100 p-4 d-flex flex-column justify-content-between"
                style={{
                  background: "#18181b",
                  borderRadius: "20px",
                  border: "1px solid rgba(255,255,255,0.08)",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                <div>
                  <div
                    style={{
                      width: "48px",
                      height: "48px",
                      borderRadius: "12px",
                      background: "rgba(207,69,0,0.15)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      marginBottom: "20px",
                    }}
                  >
                    <i className="fa-solid fa-microchip" style={{ color: "#cf4500", fontSize: "20px" }}></i>
                  </div>
                  <h4 style={{ color: "#fff", fontSize: "20px", fontWeight: "700", marginBottom: "12px" }}>
                    Zero-Downtime Guarantee
                  </h4>
                  <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "14px", lineHeight: "1.6" }}>
                    We engineer high-availability web applications, automated agentic pipelines, and resilient cloud architectures for businesses where downtime is not an option.
                  </p>
                </div>

                <div className="pt-4" style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
                  <Link
                    href="/services"
                    style={{
                      color: "#fff",
                      fontSize: "14px",
                      fontWeight: "600",
                      textDecoration: "none",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    Explore Capabilities <i className="fa-solid fa-arrow-right" style={{ color: "#cf4500" }}></i>
                  </Link>
                </div>
              </div>
            </div>

            {/* Center Card: Visual Hero Showcase */}
            <div className="col-xl-6 col-md-6">
              <div
                className="h-100 p-relative overflow-hidden d-flex flex-column justify-content-between"
                style={{
                  background: "linear-gradient(135deg, #1c1c20 0%, #121214 100%)",
                  borderRadius: "20px",
                  border: "1px solid rgba(255,255,255,0.1)",
                  padding: "40px 30px",
                  minHeight: "360px",
                  position: "relative",
                }}
              >
                <div style={{ position: "relative", zIndex: 2 }}>
                  <span className="badge mb-3" style={{ background: "rgba(28,105,212,0.15)", color: "#1c69d4", border: "1px solid rgba(28,105,212,0.3)", padding: "6px 14px", borderRadius: "20px", fontSize: "12px", fontWeight: "600" }}>
                    Continuous Delivery
                  </span>
                  <h3 style={{ color: "#fff", fontSize: "clamp(24px, 3vw, 36px)", fontWeight: "700", lineHeight: "1.2", maxWidth: "480px" }}>
                    Engineered for Scale, Security &amp; Uninterrupted Performance.
                  </h3>
                  <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "15px", maxWidth: "440px", marginTop: "12px" }}>
                    From autonomous B2B email dispatch engines to mission-critical financial terminals, we architect software that powers your business 24/7.
                  </p>
                </div>

                <div className="d-flex flex-wrap gap-3 mt-4" style={{ position: "relative", zIndex: 2 }}>
                  <Link
                    href="/contact"
                    style={{
                      background: "#cf4500",
                      color: "#fff",
                      padding: "12px 28px",
                      borderRadius: "30px",
                      fontSize: "15px",
                      fontWeight: "600",
                      textDecoration: "none",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "10px",
                    }}
                  >
                    Start an Engagement <i className="fa-solid fa-arrow-right"></i>
                  </Link>

                  <a
                    href="https://billing.qorlune.co.uk"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      background: "rgba(255,255,255,0.08)",
                      color: "#fff",
                      border: "1px solid rgba(255,255,255,0.18)",
                      padding: "12px 26px",
                      borderRadius: "30px",
                      fontSize: "15px",
                      fontWeight: "600",
                      textDecoration: "none",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    Whop Merchant Rail <i className="fa-solid fa-arrow-up-right-from-square" style={{ fontSize: "12px", color: "#1c69d4" }}></i>
                  </a>
                </div>

                {/* Ambient glow decoration */}
                <div
                  style={{
                    position: "absolute",
                    right: "-50px",
                    bottom: "-50px",
                    width: "240px",
                    height: "240px",
                    background: "radial-gradient(circle, rgba(207,69,0,0.25) 0%, rgba(0,0,0,0) 70%)",
                    filter: "blur(40px)",
                    pointerEvents: "none",
                  }}
                />
              </div>
            </div>

            {/* Right Card: Real-Time Availability & Metrics */}
            <div className="col-xl-3 col-md-6">
              <div
                className="h-100 p-4 d-flex flex-column justify-content-between"
                style={{
                  background: "#18181b",
                  borderRadius: "20px",
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
              >
                <div className="d-flex flex-column gap-3">
                  <div>
                    <span style={{ fontSize: "12px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.1em", color: "#cf4500" }}>
                      Production Status
                    </span>
                    <p style={{ color: "#fff", fontSize: "14px", fontWeight: "600", marginTop: "4px", marginBottom: "0" }}>
                      <span style={{ color: "#22c55e" }}>●</span> All Systems Operational
                    </p>
                  </div>

                  <div className="pt-2" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                    <span style={{ fontSize: "12px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.1em", color: "rgba(255,255,255,0.4)" }}>
                      HQ / Jurisdiction
                    </span>
                    <p style={{ color: "#fff", fontSize: "14px", fontWeight: "500", marginTop: "4px", marginBottom: "0" }}>
                      Covent Garden, London, UK
                    </p>
                  </div>

                  <div className="pt-2" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                    <span style={{ fontSize: "12px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.1em", color: "rgba(255,255,255,0.4)" }}>
                      Direct Line
                    </span>
                    <p style={{ color: "#fff", fontSize: "14px", fontWeight: "500", marginTop: "4px", marginBottom: "0" }}>
                      sales@qorlune.co.uk
                    </p>
                  </div>
                </div>

                <div className="pt-4 mt-3" style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
                  <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "8px" }}>
                    Active Network
                  </p>
                  <p style={{ color: "#fff", fontSize: "18px", fontWeight: "700", margin: 0 }}>
                    1,400+ <span style={{ fontSize: "13px", fontWeight: "400", color: "rgba(255,255,255,0.6)" }}>Corporate Leads Connected</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
