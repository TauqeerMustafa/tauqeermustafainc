import type { Metadata } from "next";
import MonasProjects from "@/components/home/MonasProjects";
import { buildMetadata } from "@/lib/metadata";

export const metadata: Metadata = buildMetadata({
  title: "Portfolio & Case Studies — Qorlune Implementations",
  description:
    "Explore our production systems: enterprise portals, autonomous AI dispatch workflows, and high-concurrency payment architectures.",
  path: "/portfolio",
});

export default function PortfolioPage() {
  return (
    <div>
      {/* Breadcrumb banner */}
      <section className="breadcrumb__area heading-bg p-relative py-5" style={{ background: "#0f0f11", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
        <div className="container custom-container py-4">
          <div className="d-inline-flex align-items-center gap-2 mb-3" style={{ background: "rgba(207,69,0,0.12)", border: "1px solid rgba(207,69,0,0.3)", padding: "5px 16px", borderRadius: "30px" }}>
            <span style={{ color: "#cf4500", fontSize: "12px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.1em" }}>
              Case Studies
            </span>
          </div>
          <h1 style={{ fontSize: "clamp(36px, 5vw, 64px)", fontWeight: "800", color: "#ffffff", letterSpacing: "-0.03em" }}>
            Featured Implementations <br />
            <span style={{ color: "rgba(255,255,255,0.45)" }}>Proven In Production.</span>
          </h1>
          <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "18px", maxWidth: "700px", marginTop: "16px", lineHeight: "1.6" }}>
            Production platforms, autonomous agentic workers, and payment rails engineered for high-assurance enterprises.
          </p>
        </div>
      </section>

      <MonasProjects />
    </div>
  );
}
