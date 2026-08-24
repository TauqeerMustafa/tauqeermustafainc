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
    <Section className="bg-[#FAFAFA]" labelledBy="contact-faq">
      <SectionHeader
        id="contact-faq"
        eyebrow="Questions"
        title="Frequently asked questions"
        description="A few things people usually ask before reaching out."
      />
      <div className="mt-14 grid gap-4 lg:grid-cols-2">
        {faqs.map((item) => (
          <div
            key={item.question}
            className="border-t border-gray-200 pt-6"
          >
            <h3 className="text-lg font-semibold text-[#0A0A0A]">{item.question}</h3>
            <p className="mt-3 text-base leading-7 text-[#737373]">{item.answer}</p>
          </div>
        ))}
      </div>
    </Section>
  );
}
