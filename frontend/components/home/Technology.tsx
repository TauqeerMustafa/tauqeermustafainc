"use client";

import { motion } from "framer-motion";
import { Reveal, fadeLeft, stagger, viewportOnce } from "./ui";

/* ── bg-canvas tile — dark precision grid, BMW utility feel, theme-flipping ── */

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
      className="relative overflow-hidden bg-canvas px-5 py-20 sm:px-6 sm:py-24 lg:py-32"
    >
      <div className="mx-auto max-w-[1200px]">
        <Reveal variant={fadeLeft} className="max-w-3xl">
          {/* M-stripe rail above the eyebrow — literal brand tricolor */}
          <div className="flex h-[3px] w-20 overflow-hidden">
            <span className="flex-1 bg-m-blue" />
            <span className="flex-1 bg-m-blue-mid" />
            <span className="flex-1 bg-m-red" />
          </div>

          <p className="mt-6 font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-action">
            Stack Notes
          </p>

          <h2
            id="technology-title"
            className="mt-4 text-[34px] font-bold uppercase leading-[1.08] tracking-[-0.02em] text-ink sm:text-[44px] lg:text-[52px]"
          >
            A practical stack selected for ownership, not novelty.
          </h2>

          <p className="mt-6 max-w-2xl text-[17px] font-light leading-[1.6] tracking-[-0.01em] text-ink/65 sm:text-[19px]">
            Tools are chosen for reliability, team ownership, security, and long-term
            maintainability — flexed around the client environment rather than turned
            into a logo wall.
          </p>
        </Reveal>

        {/* Precision grid — hairline dividers, zero radius, BMW utility feel */}
        <div className="mt-14 grid divide-y divide-line/10 border-y border-line/10 sm:mt-16 lg:grid-cols-3 lg:divide-x lg:divide-y-0 lg:border-x">
          {technologyGroups.map((group) => (
            <article
              key={group.label}
              className="group relative overflow-hidden px-6 py-9 transition-colors duration-500 hover:bg-ink/[0.04] lg:px-8 lg:py-10"
            >
              {/* Hover accent rail */}
              <span
                className="absolute left-0 top-0 h-0.5 w-full origin-left scale-x-0 bg-action transition-transform duration-500 group-hover:scale-x-100"
                aria-hidden
              />

              <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-ink/35">
                {group.index}
              </p>

              <h3 className="mt-4 text-[19px] font-bold uppercase leading-[1.2] tracking-[0.01em] text-ink">
                {group.label}
              </h3>

              <p className="mt-3 text-[15px] font-light leading-[1.6] tracking-[-0.01em] text-ink/55">
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
                    {/* Pill — Mastercard radius against themed surface */}
                    <span className="inline-flex items-center rounded-full border border-ink/12 bg-ink/[0.06] px-3.5 py-1.5 font-mono text-[11px] font-medium uppercase tracking-[0.08em] text-ink/75 transition-colors group-hover:border-action/40">
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
