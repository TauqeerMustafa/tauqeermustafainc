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
    } catch (error) {
      // surfaced via loginMutation.isError below
      console.error("Login error:", error);
    }
  }

  const apiError = loginMutation.error as ApiError | undefined;
  const errorMessage = apiError?.message ?? "Unable to connect to the server. Please check if the backend is running or try again later.";

  return (
    <>
      <div className="border-b border-[#E5E5E5] bg-white px-5 py-4 sm:px-6">
        <Link href="/" className="text-sm font-semibold text-[#0A0A0A] hover:text-[#262626]">
          &larr; Back to tauqeermustafa.tech
        </Link>
      </div>

      <PageHero
        eyebrow="Login"
        title="Access the admin workspace."
        description="Sign in to manage services, portfolio, blog posts, job listings, and incoming messages."
      />

      <Section className="bg-[#FAFAFA]" labelledBy="login-title">
        <div className="mx-auto max-w-md rounded-none border border-[#E5E5E5] bg-white p-8 shadow-sm">
          <h2 id="login-title" className="text-2xl font-semibold tracking-tight text-[#0A0A0A]">
            Sign in
          </h2>
          <form onSubmit={handleSubmit(onSubmit)} className="mt-8 grid gap-5" noValidate>
            <label className="grid gap-2 text-sm font-semibold text-[#0A0A0A]">
              Email
              <input
                type="email"
                autoComplete="email"
                {...register("email")}
                className="rounded-none border border-[#E5E5E5] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#0A0A0A] focus:ring-2 focus:ring-[#0A0A0A]/20"
                placeholder="admin@tauqeermustafa.tech"
              />
              {errors.email ? <p className="text-sm font-normal text-red-600">{errors.email.message}</p> : null}
            </label>
            <label className="grid gap-2 text-sm font-semibold text-[#0A0A0A]">
              Password
              <input
                type="password"
                autoComplete="current-password"
                {...register("password")}
                className="rounded-none border border-[#E5E5E5] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#0A0A0A] focus:ring-2 focus:ring-[#0A0A0A]/20"
                placeholder="Password"
              />
              {errors.password ? <p className="text-sm font-normal text-red-600">{errors.password.message}</p> : null}
            </label>
            <div className="flex items-center justify-between gap-4 text-sm">
              <label className="flex items-center gap-2 font-medium text-[#171717]">
                <input
                  type="checkbox"
                  {...register("remember")}
                  className="h-4 w-4 rounded border-[#E5E5E5] accent-[#0A0A0A]"
                />
                Stay signed in
              </label>
            </div>

            {loginMutation.isError ? (
              <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                <p className="text-sm font-medium text-red-800" role="alert">
                  {errorMessage}
                </p>
                {apiError?.status === undefined && (
                  <p className="mt-2 text-xs text-red-600">
                    Make sure the backend server is running at{" "}
                    <code className="rounded bg-red-100 px-1 py-0.5">http://localhost:8000</code>
                  </p>
                )}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={isSubmitting || loginMutation.isPending}
              className="rounded-none bg-[#0A0A0A] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#262626] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#0A0A0A] disabled:opacity-50"
            >
              {isSubmitting || loginMutation.isPending ? "Signing in..." : "Sign in"}
            </button>
          </form>
        </div>
      </Section>
    </>
  );
}
