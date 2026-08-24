"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

import { Card } from "@/components/home/ui";

type Faq = {
  question: string;
  answer: string;
};

export function FaqAccordion({ faqs }: { faqs: Faq[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="space-y-3">
      {faqs.map((faq, index) => {
        const isOpen = openIndex === index;
        return (
          <Card key={faq.question} className="hover:translate-y-0 p-0">
            <button
              type="button"
              onClick={() => setOpenIndex(isOpen ? null : index)}
              aria-expanded={isOpen}
              className="flex w-full items-center justify-between gap-4 p-6 text-left"
            >
              <span className="font-semibold text-[#0A0A0A]">{faq.question}</span>
              <ChevronDown
                className={`h-5 w-5 shrink-0 text-[#0A0A0A] transition-transform ${isOpen ? "rotate-180" : ""}`}
                aria-hidden
              />
            </button>
            {isOpen && (
              <p className="px-6 pb-6 text-sm leading-6 text-[#737373]">{faq.answer}</p>
            )}
          </Card>
        );
      })}
    </div>
  );
}
