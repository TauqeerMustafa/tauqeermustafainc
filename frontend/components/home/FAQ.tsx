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
      <Section className="bg-[#f5f5f7]" labelledBy="faq-title">
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
              className="border-b border-[#d2d2d7] last:border-b-0"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="flex w-full items-start justify-between gap-4 py-6 text-left transition-colors hover:opacity-70"
                aria-expanded={openIndex === index}
              >
                <span className="text-[19px] font-semibold leading-[1.21] tracking-[-0.374px] text-[#1d1d1f] sm:text-[21px]">
                  {faq.question}
                </span>
                <ChevronDown
                  className={`mt-1 h-5 w-5 flex-shrink-0 text-[#1d1d1f] transition-transform duration-300 ${
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
                <p className="text-[17px] leading-[1.47] tracking-[-0.374px] text-[#6e6e73]">
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
