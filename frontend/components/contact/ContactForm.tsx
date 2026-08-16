"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { contactSchema, ContactFormData } from "@/lib/validation";

/* ── Hybrid design tokens ─────────────────────────────────────────
   Editorial form: bottom-border inputs, mono section labels,
   cream canvas, Apple-blue pill submit.
───────────────────────────────────────────────────────────────── */

const fieldWrap = "flex flex-col gap-1.5";

const labelClass =
  "font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-[#6e6e73]";

const inputClass =
  "w-full border-0 border-b border-[#d2d2d7] bg-transparent pb-2 pt-1 text-[16px] font-[400] leading-[1.5] tracking-[-0.2px] text-[#1d1d1f] outline-none transition-colors placeholder:text-[#b0b0b5] focus:border-[#0066cc]";

const errorClass = "mt-1 font-mono text-[11px] text-red-600";

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
  { label: "Under $5,000  — Small task / quick win",           value: "under-5k" },
  { label: "$5,000 – $15,000  — Focused project",             value: "5k-15k" },
  { label: "$15,000 – $50,000  — Mid-size engagement",        value: "15k-50k" },
  { label: "$50,000 – $150,000  — Full product build",        value: "50k-150k" },
  { label: "$150,000 – $500,000  — Enterprise solution",      value: "150k-500k" },
  { label: "$500,000+  — Strategic / multi-phase programme",  value: "500k-plus" },
  { label: "Not sure — let us scope it together",             value: "unsure" },
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
      className="rounded-[18px] bg-[#f3f0ee] px-8 py-10 sm:px-10 sm:py-12"
    >
      {/* ── Section: You ── */}
      <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-[#0066cc]">
        01 / About you
      </p>

      <div className="mt-7 grid gap-x-8 gap-y-8 md:grid-cols-2">
        <div className={fieldWrap}>
          <label className={labelClass}>Full Name <span className="text-red-500">*</span></label>
          <input {...register("fullName")} className={inputClass} placeholder="Jane Doe" autoComplete="name" />
          {errors.fullName && <p className={errorClass}>{errors.fullName.message}</p>}
        </div>

        <div className={fieldWrap}>
          <label className={labelClass}>Job Title</label>
          <input {...register("jobTitle")} className={inputClass} placeholder="CTO, Founder, Project Manager…" />
        </div>

        <div className={fieldWrap}>
          <label className={labelClass}>Email <span className="text-red-500">*</span></label>
          <input type="email" {...register("email")} className={inputClass} placeholder="jane@company.com" autoComplete="email" />
          {errors.email && <p className={errorClass}>{errors.email.message}</p>}
        </div>

        <div className={fieldWrap}>
          <label className={labelClass}>Phone</label>
          <input {...register("phone")} className={inputClass} placeholder="+1 555 000 0000" autoComplete="tel" />
          {errors.phone && <p className={errorClass}>{errors.phone.message}</p>}
        </div>
      </div>

      {/* ── Divider ── */}
      <div className="my-10 h-px bg-[#d2d2d7]" />

      {/* ── Section: Organisation ── */}
      <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-[#0066cc]">
        02 / Your organisation
      </p>

      <div className="mt-7 grid gap-x-8 gap-y-8 md:grid-cols-2">
        <div className={fieldWrap}>
          <label className={labelClass}>Company / Organisation</label>
          <input {...register("company")} className={inputClass} placeholder="Acme Corp" autoComplete="organization" />
        </div>

        <div className={fieldWrap}>
          <label className={labelClass}>Country</label>
          <select {...register("country")} className={inputClass}>
            <option value="">Select your country</option>
            {COUNTRIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      {/* ── Divider ── */}
      <div className="my-10 h-px bg-[#d2d2d7]" />

      {/* ── Section: Project ── */}
      <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-[#0066cc]">
        03 / About the project
      </p>

      <div className="mt-7 grid gap-x-8 gap-y-8 md:grid-cols-2">
        <div className={fieldWrap}>
          <label className={labelClass}>Service needed <span className="text-red-500">*</span></label>
          <select {...register("service")} className={inputClass}>
            <option value="">Select a service</option>
            {SERVICES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          {errors.service && <p className={errorClass}>{errors.service.message}</p>}
        </div>

        <div className={fieldWrap}>
          <label className={labelClass}>Estimated budget <span className="text-red-500">*</span></label>
          <select {...register("budget")} className={inputClass}>
            <option value="">Select a range</option>
            {BUDGET_RANGES.map((b) => (
              <option key={b.value} value={b.value}>{b.label}</option>
            ))}
          </select>
          {errors.budget && <p className={errorClass}>{errors.budget.message}</p>}
        </div>

        <div className={fieldWrap}>
          <label className={labelClass}>Preferred start timeline</label>
          <select {...register("timeline")} className={inputClass}>
            <option value="">Select a timeline</option>
            {TIMELINES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

        <div className={fieldWrap}>
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

      <div className="mt-8">
        <div className={fieldWrap}>
          <label className={labelClass}>Subject <span className="text-red-500">*</span></label>
          <input {...register("subject")} className={inputClass} placeholder="Brief headline of your request" />
          {errors.subject && <p className={errorClass}>{errors.subject.message}</p>}
        </div>
      </div>

      <div className="mt-8">
        <div className={fieldWrap}>
          <label className={labelClass}>Project details <span className="text-red-500">*</span></label>
          <textarea
            rows={5}
            {...register("message")}
            className={inputClass + " resize-none"}
            placeholder="Describe your project, the problem you're solving, any existing tech stack, and what success looks like."
          />
          {errors.message && <p className={errorClass}>{errors.message.message}</p>}
        </div>
      </div>

      {/* NDA note */}
      <p className="mt-6 text-[13px] leading-6 tracking-[-0.1px] text-[#6e6e73]">
        Need an NDA before sharing details?{" "}
        <a
          href="mailto:legal@tauqeermustafainc.com"
          className="text-[#0066cc] underline-offset-2 hover:underline"
        >
          Email our legal team
        </a>{" "}
        — we turn it around within one business day.
      </p>

      {/* Submit */}
      <div className="mt-10 flex flex-col items-start gap-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-[#0066cc] px-8 py-3.5 text-[17px] font-semibold leading-[1.29] tracking-[-0.374px] text-white shadow-lg shadow-[#0066cc]/25 transition-all hover:bg-[#0055b3] hover:shadow-xl hover:shadow-[#0066cc]/30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0071e3] disabled:opacity-50"
        >
          {isSubmitting ? "Sending…" : "Send Message"}
        </button>

        {isSubmitSuccessful && (
          <p className="font-mono text-[13px] font-medium text-[#1d1d1f]" role="status">
            ✓ Message received. We will follow up within one business day.
          </p>
        )}
      </div>
    </form>
  );
}
