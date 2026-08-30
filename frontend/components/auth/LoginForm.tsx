"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, Loader2, ShieldCheck } from "lucide-react";

import { Field, PortalButton, inputClass } from "@/components/portal/PortalUI";
import { useLogin } from "@/hooks/useAuth";
import { PORTAL, PORTAL_HOME_PATH, PORTAL_LABEL, type PortalId } from "@/lib/rbac";
import { useAuthContext } from "@/providers/auth-provider";
import type { ApiError } from "@/types";
import { appConfig } from "@/config/app";

const loginSchema = z.object({
  email: z.email("Enter a valid email address."),
  password: z.string().min(1, "Password is required."),
  remember: z.boolean().optional(),
});

type LoginFormData = z.infer<typeof loginSchema>;

/** Portal-specific sub-headline, so three portals stop claiming to be the admin one. */
const BLURB: Record<PortalId, string> = {
  [PORTAL.ADMIN]: "Full control of people, content, access, and customer communication.",
  [PORTAL.EMPLOYEES]: "Check in, request leave, and pick up your assigned work.",
  [PORTAL.MANAGEMENT]: "Headcount, delivery health, and pipeline reporting for leadership.",
  [PORTAL.CLIENT]: "Track your projects and access shared documents.",
};

/**
 * Shared sign-in card for the staff portals (/admin, /employees, /management).
 *
 * It used to hard-code the marketing palette, render the marketing `PageHero`,
 * and announce "Access the admin workspace" no matter which portal mounted it —
 * so an employee signing in was told they were entering admin. It now takes the
 * portal it belongs to and derives its copy and landing route from lib/rbac.
 */
export default function LoginForm({
  portal = PORTAL.ADMIN,
  redirectUrl,
}: {
  portal?: PortalId;
  redirectUrl?: string;
}) {
  const router = useRouter();
  const { isAuthenticated } = useAuthContext();
  const loginMutation = useLogin();
  const destination = redirectUrl ?? PORTAL_HOME_PATH[portal];

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { remember: false },
  });

  // `destination` belongs in the dep list: it changes with the portal prop, and
  // omitting it meant a re-render could redirect to a stale route.
  useEffect(() => {
    if (isAuthenticated) router.replace(destination);
  }, [isAuthenticated, router, destination]);

  async function onSubmit(data: LoginFormData) {
    try {
      await loginMutation.mutateAsync(data);
      router.replace(destination);
    } catch {
      // Surfaced by the error panel below; a failed sign-in must not navigate.
    }
  }

  const apiError = loginMutation.error as ApiError | undefined;
  const busy = isSubmitting || loginMutation.isPending;

  return (
    <div className="adm-page flex min-h-screen flex-col bg-adm-bg">
      <div className="m-stripe" aria-hidden="true" />
      <div className="flex flex-1 items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-md">
          <Link
            href="/portals"
            className="mb-6 inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.14em] text-adm-text-3 transition hover:text-adm-text"
          >
            <ArrowLeft size={14} />
            All portals
          </Link>

          <div className="border border-adm-border bg-adm-surface">
            <div className="flex items-center gap-3 border-b border-adm-border bg-adm-surface-2 px-6 py-4">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center bg-adm-blue-light text-adm-blue">
                <ShieldCheck size={17} />
              </span>
              <div className="min-w-0">
                <h1 className="text-sm font-bold uppercase tracking-[0.12em] text-adm-text">
                  {PORTAL_LABEL[portal]} portal
                </h1>
                <p className="truncate text-xs text-adm-text-3">{BLURB[portal]}</p>
              </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5 p-6" noValidate>
              <Field label="Email" htmlFor="login-email">
                <input
                  id="login-email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@tauqeermustafa.tech"
                  className={inputClass}
                  {...register("email")}
                />
                {errors.email && <p className="mt-1 text-xs text-adm-red">{errors.email.message}</p>}
              </Field>

              <Field label="Password" htmlFor="login-password">
                <input
                  id="login-password"
                  type="password"
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className={inputClass}
                  {...register("password")}
                />
                {errors.password && (
                  <p className="mt-1 text-xs text-adm-red">{errors.password.message}</p>
                )}
              </Field>

              <label className="flex items-center gap-2.5 text-xs text-adm-text-2">
                <input
                  type="checkbox"
                  className="h-4 w-4 accent-adm-blue"
                  {...register("remember")}
                />
                Stay signed in on this device
              </label>

              {loginMutation.isError && (
                <div className="border border-adm-red/40 bg-adm-red-light p-4">
                  <p className="text-xs font-semibold text-adm-red" role="alert">
                    {apiError?.message ?? "Sign-in failed. Check your details and try again."}
                  </p>
                  {apiError?.status === undefined && (
                    <p className="mt-2 text-xs text-adm-text-3">
                      No response from the API at{" "}
                      <code className="text-adm-text-2">{appConfig.apiBaseUrl}</code> — it may be
                      asleep or unreachable.
                    </p>
                  )}
                </div>
              )}

              <PortalButton type="submit" disabled={busy} icon={busy ? Loader2 : undefined}>
                {busy ? "Signing in…" : "Sign in"}
              </PortalButton>
            </form>
          </div>

          <p className="mt-5 text-center text-xs text-adm-text-3">
            Trouble signing in? Contact your administrator.
          </p>
        </div>
      </div>
    </div>
  );
}