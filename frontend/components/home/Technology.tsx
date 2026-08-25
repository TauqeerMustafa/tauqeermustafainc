"use client";

import { motion } from "framer-motion";
import { Reveal, fadeLeft, stagger, viewportOnce } from "./ui";

/* ── BMW M — dark canvas, uppercase display, M-stripe rail, precision grid ── */

const technologyGroups = [
  {
    index: "01",
    label: "Cloud & DevOps",
    description:
      "We build on reliable, scalable infrastructure using modern DevOps practices to keep systems resilient and maintainable.",
    items: ["AWS", "Azure", "Docker", "Kubernetes", "Terraform", "GitHub Actions", "Vercel"],
  },
  {
    index: "02",
    label: "Product & Engineering",
    description:
      "Our stack is centered on robust, type-safe technologies that let us build high-quality, performant applications.",
    items: ["Next.js", "React", "TypeScript", "Node.js", "Tailwind CSS", "GraphQL", "REST APIs"],
  },
  {
    index: "03",
    label: "Data & Automation",
    description:
      "We use practical data tools and AI to build systems that automate workflows and give teams better visibility.",
    items: ["PostgreSQL", "Python", "LangChain", "OpenAI API", "Vector DBs", "Celery", "Redis"],
  },
];

export default function Technology() {
  return (
    <section
      aria-labelledby="technology-title"
      className="relative overflow-hidden bg-[#1a2129] px-5 py-20 sm:px-6 sm:py-24 lg:py-32"
    >
      <div className="mx-auto max-w-[1200px]">
        <Reveal variant={fadeLeft} className="max-w-3xl">
          {/* M-stripe rail above the eyebrow */}
          <div className="flex h-[3px] w-20 overflow-hidden">
            <span className="flex-1 bg-[#0066b1]" />
            <span className="flex-1 bg-[#1c69d4]" />
            <span className="flex-1 bg-[#e22718]" />
          </div>

          <p className="mt-6 font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-[#1c69d4]">
            Stack Notes
          </p>

          <h2
            id="technology-title"
            className="mt-4 text-[34px] font-bold uppercase leading-[1.08] tracking-[-0.02em] text-white sm:text-[44px] lg:text-[52px]"
          >
            A practical stack selected for ownership, not novelty.
          </h2>

          <p className="mt-6 max-w-2xl text-[17px] font-light leading-[1.6] tracking-[-0.01em] text-white/65 sm:text-[19px]">
            Tools are chosen for reliability, team ownership, security, and long-term
            maintainability — flexed around the client environment rather than turned
            into a logo wall.
          </p>
        </Reveal>

        {/* Precision grid — hairline dividers, zero radius, BMW utility feel */}
        <div className="mt-14 grid divide-y divide-white/10 border-y border-white/10 sm:mt-16 lg:grid-cols-3 lg:divide-x lg:divide-y-0 lg:border-x">
          {technologyGroups.map((group) => (
            <article
              key={group.label}
              className="group relative overflow-hidden px-6 py-9 transition-colors duration-500 hover:bg-white/[0.04] lg:px-8 lg:py-10"
            >
              {/* Hover accent rail */}
              <span
                className="absolute left-0 top-0 h-0.5 w-full origin-left scale-x-0 bg-[#1c69d4] transition-transform duration-500 group-hover:scale-x-100"
                aria-hidden
              />

              <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-white/35">
                {group.index}
              </p>

              <h3 className="mt-4 text-[19px] font-bold uppercase leading-[1.2] tracking-[0.01em] text-white">
                {group.label}
              </h3>

              <p className="mt-3 text-[15px] font-light leading-[1.6] tracking-[-0.01em] text-white/55">
                {group.description}
              </p>

              <motion.ul
                initial="hidden"
                whileInView="show"
                viewport={viewportOnce}
                variants={stagger(0.05)}
                className="mt-7 flex flex-wrap gap-2"
              >
                {group.items.map((item) => (
                  <motion.li
                    key={item}
                    variants={{ hidden: { opacity: 0, scale: 0.9 }, show: { opacity: 1, scale: 1 } }}
                  >
                    {/* Mastercard pill radius against BMW dark surface */}
                    <span className="inline-flex items-center rounded-full border border-white/12 bg-white/[0.06] px-3.5 py-1.5 font-mono text-[11px] font-medium uppercase tracking-[0.08em] text-white/75 transition-colors group-hover:border-[#1c69d4]/40">
                      {item}
                    </span>
                  </motion.li>
                ))}
              </motion.ul>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
