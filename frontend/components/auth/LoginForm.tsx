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
import { appConfig } from "@/config/app";

const loginSchema = z.object({
  email: z.email("Enter a valid email address."),
  password: z.string().min(1, "Password is required."),
  remember: z.boolean().optional(),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginForm({ redirectUrl = "/admin/dashboard" }: { redirectUrl?: string }) {
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
      router.replace(redirectUrl);
    }
  }, [isAuthenticated, router]);

  async function onSubmit(data: LoginFormData) {
    try {
      await loginMutation.mutateAsync(data);
      router.replace(redirectUrl);
    } catch (error) {
      // surfaced via loginMutation.isError below
      console.error("Login error:", error);
    }
  }

  const apiError = loginMutation.error as ApiError | undefined;
  const errorMessage = apiError?.message ?? "Unable to connect to the server. Please check if the backend is running or try again later.";

  return (
    <>
      <div className="border-b border-[#e2ded9] bg-white px-5 py-4 sm:px-6">
        <Link href="/" className="text-sm font-semibold text-[#141413] hover:text-[#2a2a28]">
          &larr; Back to tauqeermustafa.tech
        </Link>
      </div>

      <PageHero
        eyebrow="Login"
        title="Access the admin workspace."
        description="Sign in to manage services, portfolio, blog posts, job listings, and incoming messages."
      />

      <Section className="bg-[#f3f0ee]" labelledBy="login-title">
        <div className="mx-auto max-w-md rounded-none border border-[#e2ded9] bg-white p-8 shadow-sm">
          <h2 id="login-title" className="text-2xl font-semibold tracking-tight text-[#141413]">
            Sign in
          </h2>
          <form onSubmit={handleSubmit(onSubmit)} className="mt-8 grid gap-5" noValidate>
            <label className="grid gap-2 text-sm font-semibold text-[#141413]">
              Email
              <input
                type="email"
                autoComplete="email"
                {...register("email")}
                className="rounded-none border border-[#e2ded9] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#141413] focus:ring-2 focus:ring-[#141413]/20"
                placeholder="admin@tauqeermustafa.tech"
              />
              {errors.email ? <p className="text-sm font-normal text-red-600">{errors.email.message}</p> : null}
            </label>
            <label className="grid gap-2 text-sm font-semibold text-[#141413]">
              Password
              <input
                type="password"
                autoComplete="current-password"
                {...register("password")}
                className="rounded-none border border-[#e2ded9] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#141413] focus:ring-2 focus:ring-[#141413]/20"
                placeholder="Password"
              />
              {errors.password ? <p className="text-sm font-normal text-red-600">{errors.password.message}</p> : null}
            </label>
            <div className="flex items-center justify-between gap-4 text-sm">
              <label className="flex items-center gap-2 font-medium text-[#141413]">
                <input
                  type="checkbox"
                  {...register("remember")}
                  className="h-4 w-4 rounded border-[#e2ded9] accent-[#141413]"
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
                    <code className="rounded bg-red-100 px-1 py-0.5">{appConfig.apiBaseUrl}</code>
                  </p>
                )}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={isSubmitting || loginMutation.isPending}
              className="rounded-none bg-[#141413] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#2a2a28] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#141413] disabled:opacity-50"
            >
              {isSubmitting || loginMutation.isPending ? "Signing in..." : "Sign in"}
            </button>
          </form>
        </div>
      </Section>
    </>
  );
}

