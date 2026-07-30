"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { PageHero, Section } from "@/components/home/ui";
import { useLogin } from "@/hooks/useAuth";
import { useAuthContext } from "@/providers/auth-provider";
import type { ApiError } from "@/types";

const loginSchema = z.object({
  email: z.email("Enter a valid email address."),
  password: z.string().min(1, "Password is required."),
  remember: z.boolean().optional(),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginForm() {
  const router = useRouter();
  const { isAuthenticated } = useAuthContext();
  const loginMutation = useLogin();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { remember: false },
  });

  useEffect(() => {
    if (isAuthenticated) {
      router.replace("/admin/dashboard");
    }
  }, [isAuthenticated, router]);

  async function onSubmit(data: LoginFormData) {
    try {
      await loginMutation.mutateAsync(data);
      router.replace("/admin/dashboard");
    } catch {
      // surfaced via loginMutation.isError below
    }
  }

  const apiError = loginMutation.error as ApiError | undefined;

  return (
    <>
      <div className="border-b border-[#E5E7EB] bg-white px-5 py-4 sm:px-6">
        <Link href="/" className="text-sm font-semibold text-[#0A1628] hover:text-[#0A46A8]">
          &larr; Back to tauqeermustafa.tech
        </Link>
      </div>

      <PageHero
        eyebrow="Login"
        title="Access the admin workspace."
        description="Sign in to manage services, portfolio, blog posts, job listings, and incoming messages."
      />

      <Section className="bg-[#F8FAFC]" labelledBy="login-title">
        <div className="mx-auto max-w-md rounded-none border border-[#E5E7EB] bg-white p-8 shadow-sm">
          <h2 id="login-title" className="text-2xl font-semibold tracking-tight text-[#0A1628]">
            Sign in
          </h2>
          <form onSubmit={handleSubmit(onSubmit)} className="mt-8 grid gap-5" noValidate>
            <label className="grid gap-2 text-sm font-semibold text-[#0A1628]">
              Email
              <input
                type="email"
                autoComplete="email"
                {...register("email")}
                className="rounded-none border border-[#E5E7EB] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#0B5FFF] focus:ring-2 focus:ring-[#0B5FFF]/20"
                placeholder="admin@tauqeermustafa.tech"
              />
              {errors.email ? <p className="text-sm font-normal text-red-600">{errors.email.message}</p> : null}
            </label>
            <label className="grid gap-2 text-sm font-semibold text-[#0A1628]">
              Password
              <input
                type="password"
                autoComplete="current-password"
                {...register("password")}
                className="rounded-none border border-[#E5E7EB] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#0B5FFF] focus:ring-2 focus:ring-[#0B5FFF]/20"
                placeholder="Password"
              />
              {errors.password ? <p className="text-sm font-normal text-red-600">{errors.password.message}</p> : null}
            </label>
            <div className="flex items-center justify-between gap-4 text-sm">
              <label className="flex items-center gap-2 font-medium text-[#374151]">
                <input
                  type="checkbox"
                  {...register("remember")}
                  className="h-4 w-4 rounded border-[#E5E7EB] accent-[#0A1628]"
                />
                Stay signed in
              </label>
            </div>

            {loginMutation.isError ? (
              <p className="text-sm font-medium text-red-600" role="alert">
                {apiError?.message ?? "Incorrect email or password."}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={isSubmitting || loginMutation.isPending}
              className="rounded-none bg-[#0A1628] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#1F2937] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#0B5FFF] disabled:opacity-50"
            >
              {isSubmitting || loginMutation.isPending ? "Signing in..." : "Sign in"}
            </button>
          </form>
        </div>
      </Section>
    </>
  );
}
