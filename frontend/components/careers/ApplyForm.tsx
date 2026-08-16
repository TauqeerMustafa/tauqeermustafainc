"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CheckCircle2, Loader2 } from "lucide-react";

const applySchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().optional(),
  portfolioUrl: z.string().url("Please enter a valid URL").or(z.literal("")),
  resumeUrl: z.string().url("Please enter a valid resume URL"),
  coverLetter: z.string().min(50, "Please write at least 50 characters about your interest in this role"),
});

type ApplyFormData = z.infer<typeof applySchema>;

interface ApplyFormProps {
  jobTitle: string;
  jobSlug: string;
}

export function ApplyForm({ jobTitle, jobSlug }: ApplyFormProps) {
  const [isSubmitted, setIsSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ApplyFormData>({
    resolver: zodResolver(applySchema),
  });

  async function onSubmit(data: ApplyFormData) {
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          subject: `Job Application: ${jobTitle}`,
          message: `
APPLICATION FOR: ${jobTitle}

NAME: ${data.name}
EMAIL: ${data.email}
PHONE: ${data.phone || "Not provided"}
PORTFOLIO: ${data.portfolioUrl || "Not provided"}
RESUME: ${data.resumeUrl}

COVER LETTER:
${data.coverLetter}
          `.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit application");
      }

      setIsSubmitted(true);
      reset();
    } catch (error) {
      console.error("Application submission error:", error);
      alert("Failed to submit application. Please try again or email us directly at careers@tauqeermustafa.tech");
    }
  }

  if (isSubmitted) {
    return (
      <div className="rounded-[24px] border border-[#e2ded9] bg-white p-8 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#1c69d4]/10">
          <CheckCircle2 className="h-8 w-8 text-[#1c69d4]" />
        </div>
        <h3 className="mt-6 text-[20px] font-bold uppercase leading-[1.2] tracking-[-0.01em] text-[#141413]">
          Application submitted
        </h3>
        <p className="mt-3 text-[17px] leading-[1.47] tracking-[-0.374px] text-[#6a6a6a]">
          Thank you for applying. We'll review your application and get back to you within 5 business days.
        </p>
        <button
          type="button"
          onClick={() => setIsSubmitted(false)}
          className="mt-6 text-[14px] font-semibold leading-none tracking-[-0.224px] text-[#1c69d4] hover:underline"
        >
          Submit another application
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-[24px] border border-[#e2ded9] bg-white p-8">
      <h3 className="text-[20px] font-bold uppercase leading-[1.2] tracking-[-0.01em] text-[#141413]">
        Apply for this role
      </h3>
      <p className="mt-3 text-[14px] leading-[1.43] tracking-[-0.224px] text-[#6a6a6a]">
        Fill out the form below to apply for {jobTitle}. We'll review your application and respond within 5 business days.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-6">
        {/* Name */}
        <div>
          <label htmlFor="name" className="block text-[14px] font-semibold leading-none tracking-[-0.224px] text-[#141413]">
            Full Name *
          </label>
          <input
            id="name"
            type="text"
            {...register("name")}
            className="mt-3 w-full rounded-[12px] border border-[#e2ded9] bg-white px-4 py-3 text-[17px] leading-[1.47] tracking-[-0.374px] text-[#141413] outline-none transition focus:border-[#1c69d4] focus:ring-2 focus:ring-[#1c69d4]/20"
            placeholder="Your full name"
          />
          {errors.name && (
            <p className="mt-2 text-[14px] leading-none tracking-[-0.224px] text-red-600">
              {errors.name.message}
            </p>
          )}
        </div>

        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-[14px] font-semibold leading-none tracking-[-0.224px] text-[#141413]">
            Email Address *
          </label>
          <input
            id="email"
            type="email"
            {...register("email")}
            className="mt-3 w-full rounded-[12px] border border-[#e2ded9] bg-white px-4 py-3 text-[17px] leading-[1.47] tracking-[-0.374px] text-[#141413] outline-none transition focus:border-[#1c69d4] focus:ring-2 focus:ring-[#1c69d4]/20"
            placeholder="your@email.com"
          />
          {errors.email && (
            <p className="mt-2 text-[14px] leading-none tracking-[-0.224px] text-red-600">
              {errors.email.message}
            </p>
          )}
        </div>

        {/* Phone */}
        <div>
          <label htmlFor="phone" className="block text-[14px] font-semibold leading-none tracking-[-0.224px] text-[#141413]">
            Phone Number <span className="font-normal text-[#6a6a6a]">(Optional)</span>
          </label>
          <input
            id="phone"
            type="tel"
            {...register("phone")}
            className="mt-3 w-full rounded-[12px] border border-[#e2ded9] bg-white px-4 py-3 text-[17px] leading-[1.47] tracking-[-0.374px] text-[#141413] outline-none transition focus:border-[#1c69d4] focus:ring-2 focus:ring-[#1c69d4]/20"
            placeholder="+1 (555) 123-4567"
          />
        </div>

        {/* Resume URL */}
        <div>
          <label htmlFor="resumeUrl" className="block text-[14px] font-semibold leading-none tracking-[-0.224px] text-[#141413]">
            Resume/CV URL *
          </label>
          <p className="mt-2 text-[12px] leading-[1.33] tracking-[-0.12px] text-[#6a6a6a]">
            Link to your resume on Google Drive, Dropbox, or personal website
          </p>
          <input
            id="resumeUrl"
            type="url"
            {...register("resumeUrl")}
            className="mt-3 w-full rounded-[12px] border border-[#e2ded9] bg-white px-4 py-3 text-[17px] leading-[1.47] tracking-[-0.374px] text-[#141413] outline-none transition focus:border-[#1c69d4] focus:ring-2 focus:ring-[#1c69d4]/20"
            placeholder="https://drive.google.com/..."
          />
          {errors.resumeUrl && (
            <p className="mt-2 text-[14px] leading-none tracking-[-0.224px] text-red-600">
              {errors.resumeUrl.message}
            </p>
          )}
        </div>

        {/* Portfolio URL */}
        <div>
          <label htmlFor="portfolioUrl" className="block text-[14px] font-semibold leading-none tracking-[-0.224px] text-[#141413]">
            Portfolio/LinkedIn URL <span className="font-normal text-[#6a6a6a]">(Optional)</span>
          </label>
          <input
            id="portfolioUrl"
            type="url"
            {...register("portfolioUrl")}
            className="mt-3 w-full rounded-[12px] border border-[#e2ded9] bg-white px-4 py-3 text-[17px] leading-[1.47] tracking-[-0.374px] text-[#141413] outline-none transition focus:border-[#1c69d4] focus:ring-2 focus:ring-[#1c69d4]/20"
            placeholder="https://linkedin.com/in/..."
          />
          {errors.portfolioUrl && (
            <p className="mt-2 text-[14px] leading-none tracking-[-0.224px] text-red-600">
              {errors.portfolioUrl.message}
            </p>
          )}
        </div>

        {/* Cover Letter */}
        <div>
          <label htmlFor="coverLetter" className="block text-[14px] font-semibold leading-none tracking-[-0.224px] text-[#141413]">
            Why are you interested in this role? *
          </label>
          <p className="mt-2 text-[12px] leading-[1.33] tracking-[-0.12px] text-[#6a6a6a]">
            Tell us about your relevant experience and why you'd be a good fit
          </p>
          <textarea
            id="coverLetter"
            {...register("coverLetter")}
            rows={6}
            className="mt-3 w-full rounded-[12px] border border-[#e2ded9] bg-white px-4 py-3 text-[17px] leading-[1.47] tracking-[-0.374px] text-[#141413] outline-none transition focus:border-[#1c69d4] focus:ring-2 focus:ring-[#1c69d4]/20"
            placeholder="I'm interested in this role because..."
          />
          {errors.coverLetter && (
            <p className="mt-2 text-[14px] leading-none tracking-[-0.224px] text-red-600">
              {errors.coverLetter.message}
            </p>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-[#1c69d4] px-7 py-4 font-mono text-[12px] font-bold uppercase tracking-[0.1em] text-white transition-colors hover:bg-[#0066b1] disabled:opacity-50"
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              Submitting...
            </span>
          ) : (
            "Submit Application"
          )}
        </button>
      </form>
    </div>
  );
}
