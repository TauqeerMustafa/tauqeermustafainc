import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { company } from "@/data/company";
import { buildMetadata } from "@/lib/metadata";

export const metadata: Metadata = buildMetadata({
  title: "About Qorlune — Enterprise Platforms & AI Automation",
  description:
    "Qorlune is a premier digital technology firm delivering high-assurance web platforms, custom AI automation, zero-trust cybersecurity, and resilient cloud architectures worldwide.",
  path: "/about",
});

export default function AboutPage() {
  const milestones = [
    {
      period: "2024 — Present",
      role: "Autonomous Agentic Systems & Multi-Cloud Infrastructure",
      desc: "Architecting 24/7 background worker networks, distributed email dispatchers, and high-concurrency payment settlement rails with 99.99% availability.",
    },
    {
      period: "2022 — 2024",
      role: "Enterprise Web Platforms & Zero-Trust Cloud Architecture",
      desc: "Delivering bespoke platforms for FinTech, healthcare, and high-scale SaaS clients with zero regression and strict SOC2/ISO compliance alignment.",
    },
    {
      period: "2018 — 2022",
      role: "Cybersecurity Auditing & Resilient Microservices",
      desc: "Hardening production backends against sophisticated threat vectors, automating vulnerability mitigation, and optimizing serverless clusters.",
    },
  ];

  return (
    <div>
      {/* Breadcrumb / Page Banner */}
      <section className="breadcrumb__area heading-bg p-relative py-5" style={{ background: "#0f0f11", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
        <div className="container custom-container py-4">
          <div className="d-inline-flex align-items-center gap-2 mb-3" style={{ background: "rgba(207,69,0,0.12)", border: "1px solid rgba(207,69,0,0.3)", padding: "5px 16px", borderRadius: "30px" }}>
            <span style={{ color: "#cf4500", fontSize: "12px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.1em" }}>
              Our Story &amp; Philosophy
            </span>
          </div>
          <h1 style={{ fontSize: "clamp(36px, 5vw, 64px)", fontWeight: "800", color: "#ffffff", letterSpacing: "-0.03em" }}>
            Engineering Systems <br />
            <span style={{ color: "rgba(255,255,255,0.45)" }}>Built to Withstand Anything.</span>
          </h1>
          <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "18px", maxWidth: "700px", marginTop: "16px", lineHeight: "1.6" }}>
            We work with forward-thinking enterprises that refuse to tolerate downtime, broken releases, or disjointed outsourced teams.
          </p>
        </div>
      </section>

      {/* Core Philosophy Section */}
      <section className="h1-about2__area heading-bg py-5" style={{ background: "#131315", padding: "100px 0" }}>
        <div className="container custom-container">
          <div className="row g-5 align-items-center">
            <div className="col-lg-6">
              <span style={{ color: "#cf4500", fontSize: "13px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.15em" }}>
                The Qorlune Standard
              </span>
              <h2 style={{ fontSize: "clamp(28px, 3.5vw, 44px)", fontWeight: "800", color: "#ffffff", letterSpacing: "-0.02em", marginTop: "10px", lineHeight: "1.25" }}>
                We bridge the gap between creative vision and unbreakable technical execution.
              </h2>
              <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "16px", lineHeight: "1.7", marginTop: "20px" }}>
                Founded with a mission to eliminate technical debt and brittle software, Qorlune combines senior full-stack engineering, zero-trust cloud infrastructure, and autonomous agentic AI into one unified, cohesive team.
              </p>
              <div className="row g-4 mt-2">
                <div className="col-6">
                  <h4 style={{ color: "#cf4500", fontSize: "36px", fontWeight: "800", margin: 0 }}>99.99%</h4>
                  <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "13px", fontWeight: "600", textTransform: "uppercase", marginTop: "4px" }}>
                    Production Uptime SLA
                  </p>
                </div>
                <div className="col-6">
                  <h4 style={{ color: "#ffffff", fontSize: "36px", fontWeight: "800", margin: 0 }}>&lt; 72 hrs</h4>
                  <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "13px", fontWeight: "600", textTransform: "uppercase", marginTop: "4px" }}>
                    Rapid Prototype Deployment
                  </p>
                </div>
              </div>
            </div>

            <div className="col-lg-6">
              <div
                className="p-4 p-md-5"
                style={{
                  background: "#18181b",
                  borderRadius: "24px",
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
              >
                <h4 style={{ color: "#ffffff", fontSize: "20px", fontWeight: "700", marginBottom: "20px" }}>
                  Engineering Milestones &amp; Track Record
                </h4>
                <div className="d-flex flex-column gap-4">
                  {milestones.map((m, idx) => (
                    <div key={idx} className="pb-3" style={{ borderBottom: idx < milestones.length - 1 ? "1px solid rgba(255,255,255,0.06)" : "none" }}>
                      <span style={{ color: "#cf4500", fontSize: "12px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                        {m.period}
                      </span>
                      <h5 style={{ color: "#ffffff", fontSize: "16px", fontWeight: "600", margin: "6px 0" }}>
                        {m.role}
                      </h5>
                      <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "13px", lineHeight: "1.6", margin: 0 }}>
                        {m.desc}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to action */}
      <section className="py-5 text-center" style={{ background: "#0f0f11", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="container custom-container py-4">
          <h3 style={{ color: "#ffffff", fontSize: "28px", fontWeight: "700", marginBottom: "16px" }}>
            Ready to build high-assurance software?
          </h3>
          <div className="d-flex justify-content-center gap-3">
            <Link
              href="/contact"
              style={{
                background: "#cf4500",
                color: "#fff",
                padding: "12px 32px",
                borderRadius: "30px",
                fontSize: "15px",
                fontWeight: "600",
                textDecoration: "none",
              }}
            >
              Start a Conversation
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
