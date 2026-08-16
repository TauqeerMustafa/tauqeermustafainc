import { Section, SectionHeader } from "@/components/home/ui";

const faqs = [
  {
    question: "What does a typical engagement look like?",
    answer:
      "Most engagements start with a short discovery call to understand scope, followed by a written proposal covering timeline, milestones, and cost. Work is delivered in reviewable stages rather than a single handoff at the end.",
  },
  {
    question: "Do you work with early-stage companies as well as enterprises?",
    answer:
      "Yes. We scope engagements to fit the client, from a focused security review for a small team to a full platform build for an established organization.",
  },
  {
    question: "Can you support an existing codebase, not just new builds?",
    answer:
      "Yes. We regularly take over existing web platforms, security postures, and cloud infrastructure, starting with an audit before recommending changes.",
  },
  {
    question: "How do you handle security and confidentiality during a project?",
    answer:
      "Access is scoped to what's needed for the engagement, sensitive data handling is agreed upfront, and we're happy to sign an NDA before any detailed discovery begins.",
  },
  {
    question: "What's the typical timeline for a project?",
    answer:
      "It depends on scope: focused security reviews can wrap in 1-2 weeks, while full platform builds typically run 6-16 weeks. We'll give you a concrete estimate after discovery.",
  },
];

export default function FAQ() {
  return (
    <Section className="bg-[#f3f0ee]" labelledBy="contact-faq">
      <SectionHeader
        id="contact-faq"
        eyebrow="Questions"
        title="Frequently asked questions"
        description="A few things people usually ask before reaching out."
      />
      <div className="mt-14 grid gap-6 lg:grid-cols-2">
        {faqs.map((item, i) => (
          <div
            key={item.question}
            className="rounded-[18px] border border-[#e0e0e0] bg-white p-7"
          >
            <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-[#6e6e73]">
              0{i + 1}
            </span>
            <h3 className="mt-4 text-[17px] font-semibold leading-[1.3] tracking-[-0.374px] text-[#1d1d1f]">
              {item.question}
            </h3>
            <p className="mt-3 text-[15px] leading-[1.6] tracking-[-0.1px] text-[#6e6e73]">
              {item.answer}
            </p>
          </div>
        ))}
      </div>
    </Section>
  );
}
