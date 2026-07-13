import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";

const outcomes = [
  "Clear technical roadmap",
  "Secure delivery process",
  "Production-ready execution",
];

export default function CTA() {
  return (
    <section className="bg-slate-950 px-6 py-24" aria-labelledby="cta-title">
      <div className="mx-auto max-w-7xl rounded-lg border border-teal-400/30 bg-teal-400 px-6 py-12 text-slate-950 md:px-10 lg:px-14">
        <div className="grid gap-10 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <p className="text-sm font-bold uppercase text-slate-800">
              Enterprise call to action
            </p>
            <h2 id="cta-title" className="mt-3 max-w-3xl text-4xl font-extrabold">
              Ready to build a secure digital platform with a serious delivery team?
            </h2>
            <p className="mt-5 max-w-2xl text-base leading-7 text-slate-800">
              Bring us your product goals, operational constraints, and security
              requirements. We will help turn them into a practical execution plan.
            </p>
            <ul className="mt-7 grid gap-3 sm:grid-cols-3">
              {outcomes.map((outcome) => (
                <li key={outcome} className="flex items-center gap-2 text-sm font-bold">
                  <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
                  {outcome}
                </li>
              ))}
            </ul>
          </div>

          <Link
            href="/contact"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-950 px-6 py-3 text-sm font-bold text-white transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 focus:ring-offset-teal-400"
          >
            Schedule Consultation
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
}
