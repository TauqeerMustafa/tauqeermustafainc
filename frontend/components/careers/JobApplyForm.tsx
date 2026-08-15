"use client";

import { useState } from "react";
import { Send, Paperclip, CheckCircle2, AlertCircle } from "lucide-react";

type FormState = "idle" | "submitting" | "success" | "error";

export default function JobApplyForm({
  jobTitle,
  jobSlug,
}: {
  jobTitle: string;
  jobSlug: string;
}) {
  const [state, setState] = useState<FormState>("idle");
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    portfolioUrl: "",
    message: "",
    cvUrl: "",
  });

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setState("submitting");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          message: `Job Application: ${jobTitle} (${jobSlug})\n\nPhone: ${form.phone || "—"}\nPortfolio / LinkedIn: ${form.portfolioUrl || "—"}\nCV / Resume link: ${form.cvUrl || "—"}\n\n${form.message}`,
          subject: `Application: ${jobTitle}`,
        }),
      });

      if (!res.ok) throw new Error("Request failed");
      setState("success");
    } catch {
      setState("error");
    }
  }

  if (state === "success") {
    return (
      <div className="mt-6 flex flex-col items-center gap-4 rounded-[12px] bg-white px-6 py-10 text-center">
        <CheckCircle2 className="h-10 w-10 text-[#0066cc]" aria-hidden />
        <h3 className="text-[21px] font-semibold leading-[1.19] tracking-[-0.374px] text-[#1d1d1f]">
          Application submitted
        </h3>
        <p className="text-[14px] leading-[1.43] tracking-[-0.224px] text-[#7a7a7a]">
          We've received your application for <strong>{jobTitle}</strong> and
          will be in touch within 5 business days.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
      {/* Name */}
      <div>
        <label
          htmlFor="apply-name"
          className="block text-[14px] font-semibold leading-none tracking-[-0.224px] text-[#1d1d1f]"
        >
          Full name <span className="text-[#0066cc]">*</span>
        </label>
        <input
          id="apply-name"
          name="name"
          type="text"
          required
          autoComplete="name"
          value={form.name}
          onChange={handleChange}
          placeholder="Your full name"
          className="mt-2 w-full rounded-[10px] border border-[#e0e0e0] bg-white px-4 py-3 text-[14px] leading-none tracking-[-0.224px] text-[#1d1d1f] outline-none placeholder:text-[#b0b0b0] transition focus:border-[#0066cc] focus:ring-2 focus:ring-[#0066cc]/10"
        />
      </div>

      {/* Email */}
      <div>
        <label
          htmlFor="apply-email"
          className="block text-[14px] font-semibold leading-none tracking-[-0.224px] text-[#1d1d1f]"
        >
          Email <span className="text-[#0066cc]">*</span>
        </label>
        <input
          id="apply-email"
          name="email"
          type="email"
          required
          autoComplete="email"
          value={form.email}
          onChange={handleChange}
          placeholder="you@company.com"
          className="mt-2 w-full rounded-[10px] border border-[#e0e0e0] bg-white px-4 py-3 text-[14px] leading-none tracking-[-0.224px] text-[#1d1d1f] outline-none placeholder:text-[#b0b0b0] transition focus:border-[#0066cc] focus:ring-2 focus:ring-[#0066cc]/10"
        />
      </div>

      {/* Phone */}
      <div>
        <label
          htmlFor="apply-phone"
          className="block text-[14px] font-semibold leading-none tracking-[-0.224px] text-[#1d1d1f]"
        >
          Phone{" "}
          <span className="font-normal text-[#7a7a7a]">(optional)</span>
        </label>
        <input
          id="apply-phone"
          name="phone"
          type="tel"
          autoComplete="tel"
          value={form.phone}
          onChange={handleChange}
          placeholder="+1 (555) 000-0000"
          className="mt-2 w-full rounded-[10px] border border-[#e0e0e0] bg-white px-4 py-3 text-[14px] leading-none tracking-[-0.224px] text-[#1d1d1f] outline-none placeholder:text-[#b0b0b0] transition focus:border-[#0066cc] focus:ring-2 focus:ring-[#0066cc]/10"
        />
      </div>

      {/* Portfolio / LinkedIn */}
      <div>
        <label
          htmlFor="apply-portfolio"
          className="block text-[14px] font-semibold leading-none tracking-[-0.224px] text-[#1d1d1f]"
        >
          Portfolio / LinkedIn{" "}
          <span className="font-normal text-[#7a7a7a]">(optional)</span>
        </label>
        <input
          id="apply-portfolio"
          name="portfolioUrl"
          type="url"
          value={form.portfolioUrl}
          onChange={handleChange}
          placeholder="https://linkedin.com/in/yourname"
          className="mt-2 w-full rounded-[10px] border border-[#e0e0e0] bg-white px-4 py-3 text-[14px] leading-none tracking-[-0.224px] text-[#1d1d1f] outline-none placeholder:text-[#b0b0b0] transition focus:border-[#0066cc] focus:ring-2 focus:ring-[#0066cc]/10"
        />
      </div>

      {/* CV / Resume link */}
      <div>
        <label
          htmlFor="apply-cv"
          className="block text-[14px] font-semibold leading-none tracking-[-0.224px] text-[#1d1d1f]"
        >
          <span className="flex items-center gap-1.5">
            <Paperclip className="h-3.5 w-3.5 text-[#7a7a7a]" aria-hidden />
            CV / Resume link{" "}
            <span className="font-normal text-[#7a7a7a]">(Google Drive, Dropbox, etc.)</span>
          </span>
        </label>
        <input
          id="apply-cv"
          name="cvUrl"
          type="url"
          value={form.cvUrl}
          onChange={handleChange}
          placeholder="https://drive.google.com/…"
          className="mt-2 w-full rounded-[10px] border border-[#e0e0e0] bg-white px-4 py-3 text-[14px] leading-none tracking-[-0.224px] text-[#1d1d1f] outline-none placeholder:text-[#b0b0b0] transition focus:border-[#0066cc] focus:ring-2 focus:ring-[#0066cc]/10"
        />
      </div>

      {/* Cover note */}
      <div>
        <label
          htmlFor="apply-message"
          className="block text-[14px] font-semibold leading-none tracking-[-0.224px] text-[#1d1d1f]"
        >
          Cover note <span className="text-[#0066cc]">*</span>
        </label>
        <textarea
          id="apply-message"
          name="message"
          required
          rows={4}
          value={form.message}
          onChange={handleChange}
          placeholder="Tell us what draws you to this role and where you've done relevant work."
          className="mt-2 w-full resize-none rounded-[10px] border border-[#e0e0e0] bg-white px-4 py-3 text-[14px] leading-[1.43] tracking-[-0.224px] text-[#1d1d1f] outline-none placeholder:text-[#b0b0b0] transition focus:border-[#0066cc] focus:ring-2 focus:ring-[#0066cc]/10"
        />
      </div>

      {/* Error */}
      {state === "error" && (
        <div className="flex items-center gap-2 rounded-[10px] border border-red-200 bg-red-50 px-4 py-3">
          <AlertCircle className="h-4 w-4 shrink-0 text-red-600" aria-hidden />
          <p className="text-[13px] text-red-700">
            Something went wrong. Email us directly at{" "}
            <a
              href="mailto:careers@tauqeermustafa.tech"
              className="underline"
            >
              careers@tauqeermustafa.tech
            </a>
            .
          </p>
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={state === "submitting"}
        className="flex w-full items-center justify-center gap-2 rounded-full bg-[#0066cc] px-6 py-3.5 text-[15px] font-semibold leading-none tracking-[-0.374px] text-white transition-colors hover:bg-[#0071e3] disabled:opacity-60"
      >
        {state === "submitting" ? (
          <>
            <svg
              className="h-4 w-4 animate-spin"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
            Submitting…
          </>
        ) : (
          <>
            Submit Application
            <Send className="h-4 w-4" aria-hidden />
          </>
        )}
      </button>

      <p className="text-center text-[12px] leading-[1.43] tracking-[-0.12px] text-[#b0b0b0]">
        We respond to every application within 5 business days.
      </p>
    </form>
  );
}
