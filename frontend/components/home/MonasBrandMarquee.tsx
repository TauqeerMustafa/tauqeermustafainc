export default function MonasBrandMarquee() {
  const metrics = [
    { value: "13+", label: "Years Combined Engineering" },
    { value: ">99.9%", label: "Uptime SLA Benchmark" },
    { value: "1,400+", label: "Global Corporate Reach" },
    { value: "100%", label: "Cloud Delivery Completion" },
  ];

  return (
    <section className="h1-brand__area heading-2-bg py-4" style={{ background: "#0c0c0e", borderTop: "1px solid rgba(255,255,255,0.06)", borderBottom: "1px solid rgba(255,255,255,0.06)", overflow: "hidden" }}>
      <div className="container custom-container">
        <div className="row g-4 align-items-center justify-content-between">
          {metrics.map((m, idx) => (
            <div key={idx} className="col-lg-3 col-6 text-center text-lg-start">
              <div className="p-2">
                <h3 style={{ fontSize: "clamp(28px, 3.5vw, 42px)", fontWeight: "800", color: "#ffffff", letterSpacing: "-0.02em", margin: 0 }}>
                  <span style={{ color: "#cf4500" }}>{m.value}</span>
                </h3>
                <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "13px", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.06em", marginTop: "4px", marginBottom: 0 }}>
                  {m.label}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
