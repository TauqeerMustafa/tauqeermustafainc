import Link from "next/link";

export default function MonasBlog() {
  const posts = [
    {
      title: "Architecting Multi-Agent AI Workflows That Run 24/7 Without Drift",
      category: "AI Engineering",
      date: "Oct 26, 2026",
      readTime: "5 min read",
      desc: "How we structured background GitHub Cloud runners with rotating SMTP/REST fallbacks to dispatch 1,400+ corporate deliveries with zero drop rate.",
      slug: "architecting-multi-agent-ai-workflows",
    },
    {
      title: "Scaling to 160 Countries: Concurrent Crawling & Database Optimization",
      category: "Distributed Systems",
      date: "Oct 24, 2026",
      readTime: "6 min read",
      desc: "Lessons learned parsing 167,000 global corporate records with ThreadPoolExecutor and atomic spreadsheet checkpointing.",
      slug: "scaling-to-160-countries-concurrent-crawling",
    },
    {
      title: "Why High-Assurance Teams Are Adopting Whop for Global Settlement",
      category: "FinTech & Payments",
      date: "Oct 22, 2026",
      readTime: "4 min read",
      desc: "Eliminating cross-border payment friction, handling 130+ local currencies, and replacing clunky legacy portals with instant single-tap card checkout.",
      slug: "why-teams-adopt-whop-settlement",
    },
  ];

  return (
    <section className="h1-blog__area section-space-bottom heading-bg py-5" style={{ background: "#131315", padding: "100px 0" }}>
      <div className="container custom-container">
        {/* Header */}
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-end mb-5 pb-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
          <div>
            <span style={{ color: "#cf4500", fontSize: "13px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.15em" }}>
              Technical Publications
            </span>
            <h2 style={{ fontSize: "clamp(32px, 4vw, 56px)", fontWeight: "800", color: "#ffffff", letterSpacing: "-0.02em", marginTop: "8px", margin: 0 }}>
              LATEST ARTICLES <span style={{ color: "rgba(255,255,255,0.3)" }}>—</span>
            </h2>
          </div>
          <div className="mt-4 mt-md-0">
            <Link
              href="/blog"
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
              All Articles <i className="fa-solid fa-arrow-right" style={{ color: "#cf4500" }}></i>
            </Link>
          </div>
        </div>

        {/* 3-Card Grid */}
        <div className="row g-4">
          {posts.map((post, idx) => (
            <div key={idx} className="col-lg-4 col-md-6">
              <div
                className="h-100 p-4 p-md-5 d-flex flex-column justify-content-between"
                style={{
                  background: "#18181b",
                  borderRadius: "20px",
                  border: "1px solid rgba(255,255,255,0.08)",
                  transition: "all 0.3s ease",
                }}
              >
                <div>
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <span style={{ color: "#cf4500", fontSize: "12px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                      {post.category}
                    </span>
                    <span style={{ color: "rgba(255,255,255,0.4)", fontSize: "12px" }}>
                      {post.date} • {post.readTime}
                    </span>
                  </div>

                  <h4 style={{ color: "#ffffff", fontSize: "20px", fontWeight: "700", lineHeight: "1.35", marginBottom: "14px" }}>
                    <Link href={`/blog/${post.slug}`} style={{ color: "#ffffff", textDecoration: "none" }}>
                      {post.title}
                    </Link>
                  </h4>

                  <p style={{ color: "rgba(255,255,255,0.65)", fontSize: "14px", lineHeight: "1.6" }}>
                    {post.desc}
                  </p>
                </div>

                <div className="pt-4 mt-3" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                  <Link
                    href={`/blog/${post.slug}`}
                    style={{
                      color: "#ffffff",
                      fontSize: "13px",
                      fontWeight: "600",
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                      textDecoration: "none",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                    }}
                  >
                    Read Publication <i className="fa-solid fa-arrow-right" style={{ color: "#cf4500", fontSize: "12px" }}></i>
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
