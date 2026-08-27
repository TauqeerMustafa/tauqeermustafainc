"use client";

import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { Section, SectionHeader, stagger, viewportOnce } from "./ui";
import { commonFAQs, faqSchema } from "@/lib/faq-schema";

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <>
      <Section className="bg-surface" labelledBy="faq-title">
        <SectionHeader
          id="faq-title"
          eyebrow="FAQ"
          title="Common questions"
          description="Everything you need to know about working with us."
          align="center"
        />

        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
          variants={stagger(0.1)}
          className="mx-auto mt-12 max-w-3xl"
        >
          {commonFAQs.map((faq, index) => (
            <motion.div
              key={index}
              variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}
              className="border-b border-line-2 last:border-b-0"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="group flex w-full items-start justify-between gap-4 py-6 text-left"
                aria-expanded={openIndex === index}
              >
                <span className="text-[17px] font-bold uppercase leading-[1.25] tracking-[0.01em] text-ink transition-colors group-hover:text-action sm:text-[19px]">
                  {faq.question}
                </span>
                <ChevronDown
                  className={`mt-0.5 h-5 w-5 flex-shrink-0 text-action transition-transform duration-300 ${
                    openIndex === index ? "rotate-180" : ""
                  }`}
                  aria-hidden
                />
              </button>
              <div
                className={`overflow-hidden transition-all duration-300 ${
                  openIndex === index ? "max-h-96 pb-6" : "max-h-0"
                }`}
              >
                <p className="text-[16px] font-light leading-[1.6] tracking-[-0.01em] text-ink-muted sm:text-[17px]">
                  {faq.answer}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </Section>

      {/* FAQ Schema for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema(commonFAQs)) }}
      />
    </>
  );
}
