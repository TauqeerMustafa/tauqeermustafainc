"use client";

import Image from "next/image";
import Link from "next/link";
import { type ComponentType, type ReactNode, useEffect, useRef } from "react";
import { ArrowRight } from "lucide-react";

export function cx(...c: (string | false | null | undefined)[]) {
  return c.filter(Boolean).join(" ");
}

/* ── IntersectionObserver scroll-reveal ─────────────────────── */
export function useScrollReveal<T extends HTMLElement = HTMLDivElement>() {
  const ref = useRef<T>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { el.classList.add("in-view"); io.disconnect(); } },
      { threshold: 0.1 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return ref;
}

/* ── Section ─────────────────────────────────────────────────── */
export function Section({
  children, className, labelledBy, containerClassName,
}: { children: ReactNode; className?: string; labelledBy?: string; containerClassName?: string }) {
  return (
    <section aria-labelledby={labelledBy} className={cx("px-5 py-16 sm:px-6 sm:py-20 lg:py-28", className)}>
      <div className={cx("mx-auto max-w-7xl", containerClassName)}>{children}</div>
    </section>
  );
}

/* ── Eyebrow ─────────────────────────────────────────────────── */
export function Eyebrow({ children, light }: { children: ReactNode; light?: boolean }) {
  return (
    <p className={cx(
      "inline-flex items-center gap-2 font-mono text-[11px] font-semibold uppercase tracking-[0.2em]",
      light ? "text-[#7FA8FF]" : "text-[#0A46A8]"
    )}>
      <span className={cx("h-1.5 w-1.5 shrink-0", light ? "bg-[#7FA8FF]" : "bg-[#0B5FFF]")} aria-hidden />
      {children}
    </p>
  );
}

/* ── SectionHeader ───────────────────────────────────────────── */
export function SectionHeader({
  eyebrow, title, description, id, action, align = "left", light, className,
}: {
  eyebrow: string; title: string; description?: string; id: string;
  action?: ReactNode; align?: "left" | "center"; light?: boolean; className?: string;
}) {
  const ref = useScrollReveal();
  return (
    <div
      ref={ref}
      className={cx(
        "sr anim-up flex flex-col gap-8",
        align === "center" ? "mx-auto max-w-4xl items-center text-center" : "md:flex-row md:items-end md:justify-between",
        className
      )}
    >
      <div className={cx("max-w-4xl", align === "center" && "mx-auto")}>
        <Eyebrow light={light}>{eyebrow}</Eyebrow>
        <h2 id={id} className={cx(
          "mt-4 text-balance text-3xl font-semibold leading-[1.08] tracking-tight sm:text-4xl lg:text-5xl",
          light ? "text-white" : "text-[#0A1628]"
        )}>
          {title}
        </h2>
        {description && (
          <p className={cx("mt-5 max-w-3xl text-pretty text-base leading-7 sm:text-lg", light ? "text-zinc-300" : "text-[#5F6673]")}>
            {description}
          </p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

/* ── PageHero ────────────────────────────────────────────────── */
export function PageHero({
  eyebrow, title, description, children, image, imageTitle, imageCaption,
}: {
  eyebrow: string; title: string; description: string;
  children?: ReactNode; image?: string; imageTitle?: string; imageCaption?: string;
}) {
  return (
    <section className="border-b border-[#E5E7EB] bg-gradient-to-b from-white to-[#F8F9FB] px-5 py-16 sm:px-6 sm:py-20 lg:py-24 overflow-hidden">
      <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1fr_0.78fr] lg:items-end">
        <div>
          <div className="anim-hero-badge d-0"><Eyebrow>{eyebrow}</Eyebrow></div>
          <h1 className="anim-hero-h1 d-1 mt-5 text-balance text-4xl font-semibold leading-[1.05] tracking-tight text-[#0A1628] sm:text-5xl lg:text-6xl">
            {title}
          </h1>
          <p className="anim-hero-body d-2 mt-6 max-w-3xl text-pretty text-base leading-8 text-[#5F6673] sm:text-lg">
            {description}
          </p>
          {children && (
            <div className="anim-hero-buttons d-3 mt-8 flex flex-col gap-3 sm:flex-row">
              {children}
            </div>
          )}
        </div>
        {image && (
          <div className="anim-hero-image d-2 hidden lg:block">
            <ImagePlaceholder src={image} title={imageTitle ?? eyebrow} caption={imageCaption} floating />
          </div>
        )}
      </div>
    </section>
  );
}

/* ── Card ────────────────────────────────────────────────────── */
export function Card({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useScrollReveal();
  return (
    <article
      ref={ref as React.RefObject<HTMLElement>}
      className={cx(
        "sr anim-scale lift border border-[#D7DEE8] bg-white p-6 sm:p-7 hover:border-[#0B5FFF]",
        "shadow-[0_1px_2px_rgba(17,24,39,0.04),0_8px_32px_rgba(17,24,39,0.06)]",
        "group cursor-default",
        className
      )}
    >
      {children}
    </article>
  );
}

/* ── IconFrame ───────────────────────────────────────────────── */
export function IconFrame({
  icon: Icon, size = "md", color = "blue", className,
}: {
  icon: ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  size?: "sm" | "md" | "lg";
  color?: "blue" | "gold";
  className?: string;
}) {
  const sz = { sm: "h-9 w-9", md: "h-11 w-11", lg: "h-14 w-14" }[size];
  const iconSz = { sm: "h-4 w-4", md: "h-5 w-5", lg: "h-6 w-6" }[size];
  const clr = color === "gold"
    ? "border-[#F0D9A0] bg-[#FFFBEB] text-[#B88A2A]"
    : "border-[#D7DEE8] bg-[#F0F5FF] text-[#0A46A8]";
  return (
    <div className={cx("flex shrink-0 items-center justify-center border transition-transform duration-300 group-hover:scale-110", sz, clr, className)}>
      <Icon className={iconSz} aria-hidden />
    </div>
  );
}

/* ── ImagePlaceholder ────────────────────────────────────────── */
export function ImagePlaceholder({
  title, caption, src, className, floating = false, priority = false,
}: {
  title: string; caption?: string; src?: string;
  className?: string; floating?: boolean; priority?: boolean;
}) {
  return (
    <div className={cx(
      "img-zoom relative overflow-hidden border border-[#D7DEE8]",
      "shadow-[0_24px_64px_rgba(17,24,39,0.12)]",
      floating && "anim-float",
      className
    )}>
      <div className="relative aspect-[4/3] min-h-60">
        <Image
          src={src ?? "https://res.cloudinary.com/b5cle1jv/image/upload/v1785442688/tmi-hero-digital_cs7bvl.jpg"}
          alt={title}
          fill
          sizes="(min-width:1024px) 40vw,100vw"
          priority={priority}
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
      </div>
      <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
        <p className="font-semibold leading-snug">{title}</p>
        {caption && <p className="mt-1 text-sm text-white/75">{caption}</p>}
      </div>
    </div>
  );
}

/* ── Badge ───────────────────────────────────────────────────── */
export function Badge({ children, variant = "default" }: {
  children: ReactNode;
  variant?: "default" | "blue" | "gold" | "green" | "red";
}) {
  const v = {
    default: "border-[#E5E7EB] bg-white text-[#374151]",
    blue:    "border-[#BFCFFF] bg-[#EEF4FF] text-[#0A46A8]",
    gold:    "border-[#F0D9A0] bg-[#FFFBEB] text-[#B88A2A]",
    green:   "border-[#A7F3D0] bg-[#ECFDF5] text-[#059669]",
    red:     "border-[#FECACA] bg-[#FEF2F2] text-[#DC2626]",
  }[variant];
  return (
    <span className={cx("inline-flex items-center border px-2.5 py-1 font-mono text-[11px] font-semibold", v)}>
      {children}
    </span>
  );
}

/* ── Stat ────────────────────────────────────────────────────── */
export function Stat({
  value, label, detail, light,
}: { value: string; label: string; detail?: string; light?: boolean }) {
  const ref = useScrollReveal<HTMLDivElement>();
  return (
    <div ref={ref} className="sr anim-num">
      <div className={cx("font-mono text-3xl font-bold tracking-tight", light ? "text-white" : "text-[#0A1628]")}>
        {value}
      </div>
      <div className={cx("mt-1 text-sm font-semibold", light ? "text-zinc-300" : "text-[#374151]")}>{label}</div>
      {detail && <div className={cx("mt-1 text-xs leading-5", light ? "text-zinc-500" : "text-[#9AA5B4]")}>{detail}</div>}
    </div>
  );
}

/* ── DividerLine ─────────────────────────────────────────────── */
export function DividerLine({ className }: { className?: string }) {
  const ref = useScrollReveal();
  return <div ref={ref} className={cx("sr anim-line h-px bg-[#D7DEE8]", className)} />;
}

/* ── StepBadge ───────────────────────────────────────────────── */
export function StepBadge({ step, active }: { step: string; active?: boolean }) {
  return (
    <div className={cx(
      "flex h-9 w-9 shrink-0 items-center justify-center border font-mono text-xs font-bold transition-colors",
      active ? "border-[#0B5FFF] bg-[#0B5FFF] text-white" : "border-[#D7DEE8] bg-white text-[#0A46A8]"
    )}>
      {step}
    </div>
  );
}

/* ── Pill ────────────────────────────────────────────────────── */
export function Pill({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center border border-[#D7DEE8] bg-[#F4F7FC] px-2.5 py-1 font-mono text-[11px] font-medium text-[#0A46A8] transition hover:border-[#0B5FFF]">
      {children}
    </span>
  );
}

/* ── GlowCard ────────────────────────────────────────────────── */
export function GlowCard({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useScrollReveal();
  return (
    <div
      ref={ref}
      className={cx(
        "sr anim-scale group relative overflow-hidden border border-[#D7DEE8] bg-white p-6 sm:p-8",
        "before:pointer-events-none before:absolute before:inset-0 before:opacity-0 before:transition-opacity before:duration-500",
        "before:bg-[radial-gradient(circle_at_var(--mx,50%)_var(--my,50%),rgba(11,95,255,0.06),transparent_60%)]",
        "hover:before:opacity-100 hover:border-[#0B5FFF]/40",
        "shadow-[0_1px_3px_rgba(17,24,39,0.06)] hover:shadow-[0_12px_40px_rgba(11,95,255,0.1)]",
        "transition-all duration-300",
        className
      )}
      onMouseMove={(e) => {
        const el = e.currentTarget;
        const r = el.getBoundingClientRect();
        el.style.setProperty("--mx", `${((e.clientX - r.left) / r.width) * 100}%`);
        el.style.setProperty("--my", `${((e.clientY - r.top) / r.height) * 100}%`);
      }}
    >
      {children}
    </div>
  );
}

/* ── Buttons ─────────────────────────────────────────────────── */
const base = "inline-flex items-center justify-center gap-2 font-semibold tracking-tight transition-all duration-200 press focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#0A46A8]";

export function PrimaryButton({ href, children, className }: { href: string; children: ReactNode; className?: string }) {
  return (
    <Link href={href} className={cx(base, "min-h-12 px-6 bg-[#0B5FFF] text-white shadow-[0_8px_28px_rgba(11,95,255,0.30)] hover:bg-[#0A46A8] hover:-translate-y-0.5 hover:shadow-[0_14px_36px_rgba(11,95,255,0.35)] anim-glow", className)}>
      {children} <ArrowRight className="h-4 w-4" aria-hidden />
    </Link>
  );
}
export function SecondaryButton({ href, children, className }: { href: string; children: ReactNode; className?: string }) {
  return (
    <Link href={href} className={cx(base, "min-h-12 px-6 border border-[#C7D2E0] bg-white text-[#0A1628] hover:border-[#0B5FFF] hover:bg-[#F4F7FC] hover:-translate-y-0.5", className)}>
      {children} <ArrowRight className="h-4 w-4" aria-hidden />
    </Link>
  );
}
export function OutlineButton({ href, children, className }: { href: string; children: ReactNode; className?: string }) {
  return (
    <Link href={href} className={cx(base, "min-h-12 px-6 border border-[#0A1628] bg-transparent text-[#0A1628] hover:bg-[#0A1628] hover:text-white hover:-translate-y-0.5", className)}>
      {children}
    </Link>
  );
}
export function GhostButton({ href, children, className }: { href: string; children: ReactNode; className?: string }) {
  return (
    <Link href={href} className={cx(base, "min-h-10 px-4 text-[#0A1628] hover:bg-[#F0F5FF]", className)}>
      {children}
    </Link>
  );
}
export function TextLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link href={href} className="link-ul inline-flex items-center gap-1.5 text-sm font-semibold text-[#0A46A8] hover:text-[#0B5FFF]">
      {children} <ArrowRight className="h-3.5 w-3.5" aria-hidden />
    </Link>
  );
}
export function ButtonLink({ href, children, variant = "primary", size = "md", className, ariaLabel, showArrow = true }: {
  href: string; children: ReactNode; variant?: "primary"|"secondary"|"outline"|"ghost"|"text";
  size?: "sm"|"md"|"lg"; className?: string; ariaLabel?: string; showArrow?: boolean;
}) {
  const V = { primary: PrimaryButton, secondary: SecondaryButton, outline: OutlineButton, ghost: GhostButton, text: TextLink }[variant];
  return <V href={href} className={className}>{children}</V>;
}
