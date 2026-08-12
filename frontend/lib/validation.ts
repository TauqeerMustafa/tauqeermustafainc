import { z } from "zod";

export const contactSchema = z.object({
  fullName: z
    .string()
    .min(3, "Full name must be at least 3 characters.")
    .max(100, "Full name is too long."),

  company: z
    .string()
    .max(100, "Company name is too long.")
    .optional(),

  jobTitle: z.string().max(100, "Job title is too long.").optional(),
  country: z.string().optional(),
  timeline: z.string().optional(),
  referral: z.string().optional(),

  email: z
    .email("Enter a valid email address."),

  phone: z
    .string()
    .min(10, "Phone number is too short.")
    .max(20, "Phone number is too long."),

  service: z
    .string()
    .min(1, "Please select a service."),

  budget: z
    .string()
    .min(1, "Please select a budget."),

  subject: z
    .string()
    .min(5, "Subject must be at least 5 characters.")
    .max(150, "Subject is too long."),

  message: z
    .string()
    .min(20, "Message must be at least 20 characters.")
    .max(2000, "Message is too long."),
});

export type ContactFormData = z.infer<typeof contactSchema>;