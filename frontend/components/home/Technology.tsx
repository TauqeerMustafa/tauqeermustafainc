"use client";

import { motion } from "framer-motion";
import { imageLibrary } from "@/data/media";
import { Eyebrow, ImagePlaceholder, Pill, Reveal, Section, fadeLeft, fadeUp, stagger, viewportOnce } from "./ui";

const technologyGroups = [
  {
    label: "Cloud & DevOps",
    description: "We build on reliable, scalable infrastructure using modern DevOps practices to keep systems resilient and maintainable.",
    items: ["AWS", "Azure", "Docker", "Kubernetes", "Terraform", "GitHub Actions", "Vercel"],
  },
  {
    label: "Product & Engineering",
    description: "Our stack is centered on robust, type-safe technologies that let us build high-quality, performant applications.",
    items: ["Next.js", "React", "TypeScript", "Node.js", "Tailwind CSS", "GraphQL", "REST APIs"],
  },
  {
    label: "Data & Automation",
    description: "We use practical data tools and AI to build systems that automate workflows and give teams better visibility.",
    items: ["PostgreSQL", "Python", "LangChain", "OpenAI API", "Vector DBs", "Celery", "Redis"],
  },
];

export default function Technology() {
  return (
    <Section className="bg-white" labelledBy="technology-title">
      <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[1fr_0.85fr] lg:items-center">
        <Reveal variant={fadeLeft}>
          <Eyebrow>Stack Notes</Eyebrow>
          <h2 id="technology-title" className="mt-4 text-3xl font-semibold tracking-tight text-[#0A0A0A] sm:text-4xl lg:text-5xl">
            A practical stack selected for ownership, not novelty.
          </h2>
          <p className="mt-6 text-lg leading-8 text-[#525252]">
            Tools are chosen for reliability, team ownership, security, and long-term
            maintainability — flexed around the client environment rather than turned into a logo wall.
          </p>
        </Reveal>
        <ImagePlaceholder
          src={imageLibrary.backgrounds[2]}
          title="Infrastructure & tooling"
          caption="A stack picked for maintainability, not trend-chasing."
          className="hidden lg:block"
        />
      </div>

      <div className="mt-16 grid divide-y divide-[#E5E5E5] border border-[#E5E5E5] lg:grid-cols-3 lg:divide-x lg:divide-y-0">
        {technologyGroups.map((group) => (
          <article key={group.label} className="group relative overflow-hidden px-6 py-8 lg:px-8">
            <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100 bg-[#FAFAFA]" aria-hidden />
            <h3 className="relative text-sm font-mono font-semibold uppercase tracking-widest text-[#0A0A0A]">{group.label}</h3>
            <p className="relative mt-3 text-sm leading-6 text-[#525252]">{group.description}</p>
            <motion.ul
              initial="hidden"
              whileInView="show"
              viewport={viewportOnce}
              variants={stagger(0.05)}
              className="relative mt-6 flex flex-wrap gap-2"
            >
              {group.items.map((item) => (
                <motion.li key={item} variants={{ hidden: { opacity: 0, scale: 0.9 }, show: { opacity: 1, scale: 1 } }}>
                  <Pill>{item}</Pill>
                </motion.li>
              ))}
            </motion.ul>
          </article>
        ))}
      </div>
    </Section>
  );
}
