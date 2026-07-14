import Link from "next/link";
import type { ComponentType, ReactNode } from "react";
import { ArrowRight } from "lucide-react";

export function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function Section({
  children,
  className,
  labelledBy,
}: {
  children: ReactNode;
  className?: string;
  labelledBy?: string;
}) {
  return (
    <section
      aria-labelledby={labelledBy}
      className={cx("px-6 py-20 sm:py-24", className)}
    >
      <div className="mx-auto max-w-7xl">{children}</div>
    </section>
  );
}

export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[#A67C00]">
      {children}
    </p>
  );
}

export function SectionHeader({
  eyebrow,
  title,
  description,
  id,
  action,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  id: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
      <div className="max-w-3xl">
        <Eyebrow>{eyebrow}</Eyebrow>
        <h2
          id={id}
          className="mt-3 text-3xl font-semibold tracking-tight text-[#111827] sm:text-4xl"
        >
          {title}
        </h2>
        {description ? (
          <p className="mt-5 text-base leading-7 text-[#6B7280] sm:text-lg">
            {description}
          </p>
        ) : null}
      </div>
      {action}
    </div>
  );
}

export function PageHero({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children?: ReactNode;
}) {
  return (
    <section className="border-b border-[#E5E7EB] bg-white px-6 py-16 sm:py-20">
      <div className="mx-auto max-w-7xl">
        <div className="max-w-4xl">
          <Eyebrow>{eyebrow}</Eyebrow>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-[#111827] sm:text-5xl">
            {title}
          </h1>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-[#6B7280]">
            {description}
          </p>
          {children ? <div className="mt-8">{children}</div> : null}
        </div>
      </div>
    </section>
  );
}

export function Badge({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-[#E5E7EB] bg-[#F8FAFC] px-3 py-1 text-xs font-semibold text-[#374151]">
      {children}
    </span>
  );
}

export function Card({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <article
      className={cx(
        "rounded-lg border border-[#E5E7EB] bg-white p-7 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-[#C9A227]/60 hover:shadow-md",
        className,
      )}
    >
      {children}
    </article>
  );
}

export function IconFrame({
  icon: Icon,
}: {
  icon: ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
}) {
  return (
    <div className="flex h-11 w-11 items-center justify-center rounded-lg border border-[#E5E7EB] bg-[#F8FAFC] text-[#C9A227]">
      <Icon className="h-5 w-5" aria-hidden />
    </div>
  );
}

export function TextLink({
  href,
  children,
  ariaLabel,
}: {
  href: string;
  children: ReactNode;
  ariaLabel?: string;
}) {
  return (
    <Link
      href={href}
      aria-label={ariaLabel}
      className="inline-flex items-center gap-2 text-sm font-semibold text-[#111827] underline-offset-4 transition hover:text-[#A67C00] hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#C9A227]"
    >
      {children}
      <ArrowRight className="h-4 w-4" aria-hidden />
    </Link>
  );
}

export function PrimaryButton({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#111827] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#1F2937] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#C9A227]"
    >
      {children}
      <ArrowRight className="h-4 w-4" aria-hidden />
    </Link>
  );
}

export function SecondaryButton({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      className="inline-flex items-center justify-center rounded-lg border border-[#E5E7EB] bg-white px-5 py-3 text-sm font-semibold text-[#111827] shadow-sm transition hover:border-[#C9A227] hover:text-[#A67C00] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#C9A227]"
    >
      {children}
    </Link>
  );
}
