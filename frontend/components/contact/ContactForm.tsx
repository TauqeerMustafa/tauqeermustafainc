"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { contactSchema, ContactFormData } from "@/lib/validation";

const inputClass =
  "w-full rounded-none border border-[#E5E5E5] bg-white px-4 py-3 text-sm text-[#0A0A0A] outline-none transition placeholder:text-[#A3A3A3] focus:border-[#0A0A0A] focus:ring-1 focus:ring-[#0A0A0A]";
const labelClass = "mb-2 block text-sm font-semibold text-[#0A0A0A]";
const errorClass = "mt-1 text-sm text-red-600";

const SERVICES = [
  "Web Development",
  "Cybersecurity",
  "AI & Machine Learning",
  "Cloud Engineering",
  "UI/UX Design",
  "DevOps & Infrastructure",
  "Mobile Development",
  "Data Engineering",
  "Penetration Testing",
  "Compliance & Auditing",
  "Other",
];

const BUDGET_RANGES = [
  { label: "Under $5,000  — Small task / quick win", value: "under-5k" },
  { label: "$5,000 – $15,000  — Focused project", value: "5k-15k" },
  { label: "$15,000 – $50,000  — Mid-size engagement", value: "15k-50k" },
  { label: "$50,000 – $150,000  — Full product build", value: "50k-150k" },
  { label: "$150,000 – $500,000  — Enterprise solution", value: "150k-500k" },
  { label: "$500,000+  — Strategic / multi-phase programme", value: "500k-plus" },
  { label: "Not sure — let us scope it together", value: "unsure" },
];

const TIMELINES = [
  "As soon as possible",
  "Within 1 month",
  "1 – 3 months",
  "3 – 6 months",
  "6 – 12 months",
  "Ongoing / retainer",
  "Flexible",
];

const COUNTRIES = [
  "United States", "United Kingdom", "Canada", "Australia", "Germany",
  "France", "Netherlands", "Singapore", "United Arab Emirates", "Saudi Arabia",
  "Pakistan", "India", "Japan", "South Korea", "Brazil", "Mexico",
  "South Africa", "Nigeria", "Kenya", "Other",
];

export default function ContactForm() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isSubmitSuccessful },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
  });

  async function onSubmit(data: ContactFormData) {
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error();
      reset();
    } catch {
      alert("We could not send your message. Please try again or email us directly.");
    }
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-6 border border-[#E5E5E5] bg-white p-6 shadow-[0_1px_2px_rgba(17,24,39,0.04),0_18px_48px_rgba(17,24,39,0.05)] sm:p-8"
    >
      {/* ── Identity ── */}
      <div>
        <p className="font-mono text-[11px] font-semibold uppercase tracking-widest text-[#0A0A0A]">
          About you
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <label className={labelClass}>
            Full Name <span className="text-red-500">*</span>
          </label>
          <input
            {...register("fullName")}
            className={inputClass}
            placeholder="Jane Doe"
            autoComplete="name"
          />
          {errors.fullName && <p className={errorClass}>{errors.fullName.message}</p>}
        </div>

        <div>
          <label className={labelClass}>
            Job Title
          </label>
          <input
            {...register("jobTitle")}
            className={inputClass}
            placeholder="CTO, Founder, Project Manager…"
          />
        </div>

        <div>
          <label className={labelClass}>
            Email <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            {...register("email")}
            className={inputClass}
            placeholder="jane@company.com"
            autoComplete="email"
          />
          {errors.email && <p className={errorClass}>{errors.email.message}</p>}
        </div>

        <div>
          <label className={labelClass}>Phone</label>
          <input
            {...register("phone")}
            className={inputClass}
            placeholder="+1 555 000 0000"
            autoComplete="tel"
          />
          {errors.phone && <p className={errorClass}>{errors.phone.message}</p>}
        </div>
      </div>

      {/* ── Company ── */}
      <div className="pt-2">
        <p className="font-mono text-[11px] font-semibold uppercase tracking-widest text-[#0A0A0A]">
          Your organisation
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <label className={labelClass}>Company / Organisation</label>
          <input
            {...register("company")}
            className={inputClass}
            placeholder="Acme Corp"
            autoComplete="organization"
          />
        </div>

        <div>
          <label className={labelClass}>Country</label>
          <select {...register("country")} className={inputClass}>
            <option value="">Select your country</option>
            {COUNTRIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ── Project ── */}
      <div className="pt-2">
        <p className="font-mono text-[11px] font-semibold uppercase tracking-widest text-[#0A0A0A]">
          About the project
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <label className={labelClass}>
            Service needed <span className="text-red-500">*</span>
          </label>
          <select {...register("service")} className={inputClass}>
            <option value="">Select a service</option>
            {SERVICES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          {errors.service && <p className={errorClass}>{errors.service.message}</p>}
        </div>

        <div>
          <label className={labelClass}>
            Estimated budget <span className="text-red-500">*</span>
          </label>
          <select {...register("budget")} className={inputClass}>
            <option value="">Select a range</option>
            {BUDGET_RANGES.map((b) => (
              <option key={b.value} value={b.value}>
                {b.label}
              </option>
            ))}
          </select>
          {errors.budget && <p className={errorClass}>{errors.budget.message}</p>}
        </div>

        <div>
          <label className={labelClass}>Preferred start timeline</label>
          <select {...register("timeline")} className={inputClass}>
            <option value="">Select a timeline</option>
            {TIMELINES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelClass}>How did you hear about us?</label>
          <select {...register("referral")} className={inputClass}>
            <option value="">Select an option</option>
            <option>Google / Search engine</option>
            <option>LinkedIn</option>
            <option>GitHub</option>
            <option>Referral from a colleague</option>
            <option>Industry event</option>
            <option>Press / media</option>
            <option>Other</option>
          </select>
        </div>
      </div>

      <div>
        <label className={labelClass}>
          Subject <span className="text-red-500">*</span>
        </label>
        <input
          {...register("subject")}
          className={inputClass}
          placeholder="Brief headline of your request"
        />
        {errors.subject && <p className={errorClass}>{errors.subject.message}</p>}
      </div>

      <div>
        <label className={labelClass}>
          Project details <span className="text-red-500">*</span>
        </label>
        <textarea
          rows={6}
          {...register("message")}
          className={inputClass}
          placeholder="Describe your project, the problem you're solving, any existing tech stack, and what success looks like."
        />
        {errors.message && <p className={errorClass}>{errors.message.message}</p>}
      </div>

      {/* NDA note */}
      <p className="text-xs leading-5 text-[#A3A3A3]">
        Need an NDA before sharing details?{" "}
        <a
          href="mailto:legal@tauqeermustafainc.com"
          className="text-[#0A0A0A] underline-offset-2 hover:underline"
        >
          Email our legal team
        </a>{" "}
        and we will turn it around within one business day.
      </p>

      <button
        type="submit"
        disabled={isSubmitting}
        className="inline-flex w-full items-center justify-center gap-2 bg-[#0A0A0A] px-6 py-4 text-sm font-semibold text-white shadow-[0_10px_30px_rgba(0,0,0,0.28)] transition hover:bg-[#262626] disabled:opacity-50"
      >
        {isSubmitting ? "Sending…" : "Send Message"}
      </button>

      {isSubmitSuccessful && (
        <p className="text-sm font-medium text-[#262626]" role="status">
          ✓ Message received. We will follow up within one business day.
        </p>
      )}
    </form>
  );
}
