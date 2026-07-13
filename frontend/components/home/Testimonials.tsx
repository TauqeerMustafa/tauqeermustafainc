import { Quote } from "lucide-react";

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
    <section className="bg-slate-900 px-6 py-24" aria-labelledby="testimonials-title">
      <div className="mx-auto max-w-7xl">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase text-teal-300">
            Testimonials
          </p>
          <h2 id="testimonials-title" className="mt-3 text-4xl font-bold text-white">
            Trusted by teams that need dependable execution
          </h2>
        </div>

        <div className="mt-14 grid gap-6 lg:grid-cols-3">
          {testimonials.map((testimonial) => (
            <figure
              key={testimonial.name}
              className="rounded-lg border border-slate-800 bg-slate-950 p-7"
            >
              <Quote className="h-8 w-8 text-teal-300" aria-hidden="true" />
              <blockquote className="mt-6 text-base leading-7 text-slate-300">
                <p>&ldquo;{testimonial.quote}&rdquo;</p>
              </blockquote>
              <figcaption className="mt-8">
                <p className="font-bold text-white">{testimonial.name}</p>
                <p className="mt-1 text-sm text-slate-400">{testimonial.role}</p>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
