import { Quote } from "lucide-react";

import { Card, Section, SectionHeader } from "@/components/home/ui";

const testimonials = [
  {
    quote:
      "Tauqeer Mustafa Inc. brought structure to a complex platform build and helped us launch with a stronger security posture.",
    name: "Ayesha Khan",
    role: "Operations Director, FinTech Group",
  },
  {
    quote:
      "The team translated business requirements into a clean technical roadmap and delivered a maintainable product on schedule.",
    name: "Daniel Roberts",
    role: "Product Lead, B2B SaaS",
  },
  {
    quote:
      "Their automation work removed repetitive handoffs and gave our managers reliable visibility into daily performance.",
    name: "Sana Ahmed",
    role: "Head of Customer Success, Services Firm",
  },
];

export default function Testimonials() {
  return (
    <Section className="bg-[#F8FAFC]" labelledBy="testimonials-title">
      <SectionHeader
        id="testimonials-title"
        eyebrow="Testimonials"
        title="Trusted by teams that need dependable execution"
      />

      <div className="mt-14 grid gap-6 lg:grid-cols-3">
        {testimonials.map((testimonial) => (
          <Card key={testimonial.name} className="flex flex-col">
            <Quote className="h-7 w-7 text-[#C9A227]" aria-hidden="true" />
            <blockquote className="mt-6 flex-1 text-base leading-7 text-[#374151]">
              <p>&ldquo;{testimonial.quote}&rdquo;</p>
            </blockquote>
            <figcaption className="mt-8 border-t border-[#E5E7EB] pt-5">
              <p className="font-semibold text-[#111827]">{testimonial.name}</p>
              <p className="mt-1 text-sm text-[#6B7280]">{testimonial.role}</p>
            </figcaption>
          </Card>
        ))}
      </div>
    </Section>
  );
}
