"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { contactSchema, ContactFormData } from "@/lib/validation";

export default function ContactForm() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
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

      alert("Message sent successfully.");
      reset();
    } catch {
      alert("Failed to send message.");
    }
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-6 rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl"
    >
      <div className="grid gap-6 md:grid-cols-2">

        <div>
          <label className="mb-2 block text-sm font-medium text-white">
            Full Name
          </label>
          <input
            {...register("fullName")}
            className="w-full rounded-xl border border-white/10 bg-transparent px-4 py-3 text-white outline-none focus:border-yellow-400"
          />
          <p className="mt-1 text-sm text-red-400">
            {errors.fullName?.message}
          </p>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-white">
            Company
          </label>
          <input
            {...register("company")}
            className="w-full rounded-xl border border-white/10 bg-transparent px-4 py-3 text-white outline-none focus:border-yellow-400"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-white">
            Email
          </label>
          <input
            type="email"
            {...register("email")}
            className="w-full rounded-xl border border-white/10 bg-transparent px-4 py-3 text-white outline-none focus:border-yellow-400"
          />
          <p className="mt-1 text-sm text-red-400">
            {errors.email?.message}
          </p>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-white">
            Phone
          </label>
          <input
            {...register("phone")}
            className="w-full rounded-xl border border-white/10 bg-transparent px-4 py-3 text-white outline-none focus:border-yellow-400"
          />
          <p className="mt-1 text-sm text-red-400">
            {errors.phone?.message}
          </p>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-white">
            Service
          </label>
          <select
            {...register("service")}
            className="w-full rounded-xl border border-white/10 bg-[#08101F] px-4 py-3 text-white"
          >
            <option value="">Select Service</option>
            <option>Web Development</option>
            <option>Cyber Security</option>
            <option>AI Solutions</option>
            <option>Cloud Services</option>
            <option>UI/UX Design</option>
          </select>
          <p className="mt-1 text-sm text-red-400">
            {errors.service?.message}
          </p>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-white">
            Budget
          </label>
          <select
            {...register("budget")}
            className="w-full rounded-xl border border-white/10 bg-[#08101F] px-4 py-3 text-white"
          >
            <option value="">Select Budget</option>
            <option>$500 - $1,000</option>
            <option>$1,000 - $5,000</option>
            <option>$5,000 - $10,000</option>
            <option>$10,000+</option>
          </select>
          <p className="mt-1 text-sm text-red-400">
            {errors.budget?.message}
          </p>
        </div>

      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-white">
          Subject
        </label>
        <input
          {...register("subject")}
          className="w-full rounded-xl border border-white/10 bg-transparent px-4 py-3 text-white outline-none focus:border-yellow-400"
        />
        <p className="mt-1 text-sm text-red-400">
          {errors.subject?.message}
        </p>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-white">
          Message
        </label>
        <textarea
          rows={6}
          {...register("message")}
          className="w-full rounded-xl border border-white/10 bg-transparent px-4 py-3 text-white outline-none focus:border-yellow-400"
        />
        <p className="mt-1 text-sm text-red-400">
          {errors.message?.message}
        </p>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-xl bg-yellow-400 px-6 py-4 font-bold text-black transition hover:bg-yellow-300 disabled:opacity-50"
      >
        {isSubmitting ? "Sending..." : "Send Message"}
      </button>

    </form>
  );
}
