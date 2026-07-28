import { Section, PrimaryButton } from "./ui";

export default function CTA() {
  return (
    <Section className="bg-white">
      <div className="tmi-corners tmi-grid mx-auto max-w-3xl border border-[#D7DEE8] bg-[#0A1628] p-8 text-center shadow-[0_22px_70px_rgba(10,22,40,0.25)] sm:p-12">
        <p className="inline-flex items-center gap-2 font-mono text-xs font-semibold uppercase tracking-[0.18em] text-[#7FA8FF]">
          <span className="h-1.5 w-1.5 bg-[#0B5FFF]" aria-hidden="true" />
          Start a Conversation
        </p>
        <h2 className="mt-4 text-balance text-3xl font-semibold tracking-tight text-white sm:text-4xl">
          Have a project or a risk you need eyes on?
        </h2>
        <p className="mx-auto mt-6 max-w-2xl text-pretty text-lg leading-8 text-zinc-300">
          Tell us what you are building or defending. We will tell you plainly
          whether we are the right team for it.
        </p>
        <div className="mt-10">
          <PrimaryButton href="/contact">Contact Us</PrimaryButton>
        </div>
      </div>
    </Section>
  );
}
