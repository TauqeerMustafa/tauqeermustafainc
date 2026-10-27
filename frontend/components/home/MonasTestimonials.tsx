export default function MonasTestimonials() {
  const reviews = [
    {
      quote:
        "Qorlune delivered our core infrastructure platform ahead of deadline with zero regression. Their architectural discipline and automated testing saved us months of rework.",
      name: "Marcus Vance",
      role: "VP of Engineering, Global FinTech",
      metric: "99.99% Uptime Achieved",
    },
    {
      quote:
        "The autonomous AI dispatch workflows built by Qorlune operate continuously with zero maintenance overhead. Their communication and code clarity are exceptional.",
      name: "Sarah Lin",
      role: "Managing Director, Cloud Operations",
      metric: "1,400+ Accounts Automated",
    },
    {
      quote:
        "Moving our card billing to Qorlune's unified Whop terminal eliminated failed international payments immediately. Smooth, modern, and reliable.",
      name: "David H. Al-Mansoor",
      role: "Chief Operating Officer",
      metric: "130+ Currencies Enabled",
    },
  ];

  return (
    <section className="h1-test__area heading-2-bg py-5" style={{ background: "#0c0c0e", padding: "90px 0", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
      <div className="container custom-container">
        <div className="text-center mb-5">
          <span style={{ color: "#cf4500", fontSize: "13px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.15em" }}>
            Client Outcomes
          </span>
          <h2 style={{ fontSize: "clamp(30px, 3.5vw, 48px)", fontWeight: "800", color: "#ffffff", letterSpacing: "-0.02em", marginTop: "8px" }}>
            Verified Partner Reviews
          </h2>
        </div>

        <div className="row g-4 justify-content-center">
          {reviews.map((r, i) => (
            <div key={i} className="col-lg-4 col-md-6">
              <div
                className="h-100 p-4 p-lg-5 d-flex flex-column justify-content-between"
                style={{
                  background: "#18181b",
                  borderRadius: "20px",
                  border: "1px solid rgba(255,255,255,0.07)",
                }}
              >
                <div>
                  <div className="d-flex align-items-center justify-content-between mb-4">
                    <div style={{ color: "#cf4500", fontSize: "24px" }}>
                      <i className="fa-solid fa-quote-left"></i>
                    </div>
                    <span style={{ background: "rgba(34,197,94,0.12)", color: "#22c55e", padding: "4px 10px", borderRadius: "12px", fontSize: "11px", fontWeight: "600" }}>
                      {r.metric}
                    </span>
                  </div>

                  <p style={{ color: "rgba(255,255,255,0.75)", fontSize: "15px", lineHeight: "1.7", fontStyle: "italic", marginBottom: "24px" }}>
                    "{r.quote}"
                  </p>
                </div>

                <div className="pt-3" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                  <h6 style={{ color: "#ffffff", fontSize: "16px", fontWeight: "700", margin: 0 }}>
                    {r.name}
                  </h6>
                  <p style={{ color: "rgba(255,255,255,0.45)", fontSize: "13px", margin: 0, marginTop: "2px" }}>
                    {r.role}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
