"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { contactSchema, ContactFormData } from "@/lib/validation";

const inputClass =
  "w-full rounded-none border border-[#D7DEE8] bg-white px-4 py-3 text-sm text-[#0A1628] outline-none transition placeholder:text-[#9AA5B4] focus:border-[#0B5FFF] focus:ring-1 focus:ring-[#0B5FFF]";
const labelClass = "mb-2 block text-sm font-semibold text-[#0A1628]";
const errorClass = "mt-1 text-sm text-red-600";

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
        headers: {
          "Content-Type": "application/json",
        },
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
      className="space-y-6 rounded-none border border-[#D7DEE8] bg-white p-6 shadow-[0_1px_2px_rgba(17,24,39,0.04),0_18px_48px_rgba(17,24,39,0.05)] sm:p-8"
    >
      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <label className={labelClass}>Full Name</label>
          <input {...register("fullName")} className={inputClass} placeholder="Jane Doe" />
          {errors.fullName ? <p className={errorClass}>{errors.fullName.message}</p> : null}
        </div>

        <div>
          <label className={labelClass}>Company</label>
          <input {...register("company")} className={inputClass} placeholder="Your company" />
        </div>

        <div>
          <label className={labelClass}>Email</label>
          <input type="email" {...register("email")} className={inputClass} placeholder="jane@company.com" />
          {errors.email ? <p className={errorClass}>{errors.email.message}</p> : null}
        </div>

        <div>
          <label className={labelClass}>Phone</label>
          <input {...register("phone")} className={inputClass} placeholder="+1 555 000 0000" />
          {errors.phone ? <p className={errorClass}>{errors.phone.message}</p> : null}
        </div>

        <div>
          <label className={labelClass}>Service</label>
          <select {...register("service")} className={inputClass}>
            <option value="">Select Service</option>
            <option>Web Development</option>
            <option>Cyber Security</option>
            <option>AI Solutions</option>
            <option>Cloud Services</option>
            <option>UI/UX Design</option>
          </select>
          {errors.service ? <p className={errorClass}>{errors.service.message}</p> : null}
        </div>

        <div>
          <label className={labelClass}>Budget</label>
          <select {...register("budget")} className={inputClass}>
            <option value="">Select Budget</option>
            <option>$500 - $1,000</option>
            <option>$1,000 - $5,000</option>
            <option>$5,000 - $10,000</option>
            <option>$10,000+</option>
          </select>
          {errors.budget ? <p className={errorClass}>{errors.budget.message}</p> : null}
        </div>
      </div>

      <div>
        <label className={labelClass}>Subject</label>
        <input {...register("subject")} className={inputClass} placeholder="What can we help with?" />
        {errors.subject ? <p className={errorClass}>{errors.subject.message}</p> : null}
      </div>

      <div>
        <label className={labelClass}>Message</label>
        <textarea rows={6} {...register("message")} className={inputClass} placeholder="Tell us about your project, timeline, and goals." />
        {errors.message ? <p className={errorClass}>{errors.message.message}</p> : null}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="inline-flex w-full items-center justify-center gap-2 rounded-none bg-[#0B5FFF] px-6 py-4 text-sm font-semibold text-white shadow-[0_10px_30px_rgba(11,95,255,0.28)] transition hover:bg-[#0A46A8] disabled:opacity-50"
      >
        {isSubmitting ? "Sending..." : "Send Message"}
      </button>

      {isSubmitSuccessful ? (
        <p className="text-sm font-medium text-[#0A46A8]" role="status">
          Thanks, your message has been sent. We will get back to you within one business day.
        </p>
      ) : null}
    </form>
  );
}
