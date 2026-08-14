"use client";

import Image from "next/image";
import Link from "next/link";
import { type ReactNode } from "react";
import { motion, type Variants } from "framer-motion";
import { ArrowRight } from "lucide-react";

export function cx(...c: (string | false | null | undefined)[]) {
  return c.filter(Boolean).join(" ");
}

/* ── Shared motion presets ───────────────────────────────────── */
export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};
export const fadeLeft: Variants = {
  hidden: { opacity: 0, x: -32 },
  show: { opacity: 1, x: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};
export const fadeRight: Variants = {
  hidden: { opacity: 0, x: 32 },
  show: { opacity: 1, x: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};
export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.94 },
  show: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
};
export const stagger = (gap = 0.08): Variants => ({
  hidden: {},
  show: { transition: { staggerChildren: gap } },
});

export const viewportOnce = { once: true, amount: 0.2 } as const;

/* ── Reveal wrapper ──────────────────────────────────────────── */
export function Reveal({
  children, variant = fadeUp, className, delay = 0,
}: { children: ReactNode; variant?: Variants; className?: string; delay?: number }) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={viewportOnce}
      variants={variant}
      transition={{ delay }}
    >
      {children}
    </motion.div>
  );
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
      light ? "text-white/70" : "text-[#0A0A0A]"
    )}>
      <span className={cx("h-1.5 w-1.5 shrink-0", light ? "bg-white" : "bg-[#0A0A0A]")} aria-hidden />
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
  return (
    <Reveal
      className={cx(
        "flex flex-col gap-8",
        align === "center" ? "mx-auto max-w-4xl items-center text-center" : "md:flex-row md:items-end md:justify-between",
        className
      )}
    >
      <div className={cx("max-w-4xl", align === "center" && "mx-auto")}>
        <Eyebrow light={light}>{eyebrow}</Eyebrow>
        <h2 id={id} className={cx(
          "mt-4 text-balance text-3xl font-semibold leading-[1.08] tracking-tight sm:text-4xl lg:text-5xl",
          light ? "text-white" : "text-[#0A0A0A]"
        )}>
          {title}
        </h2>
        {description && (
          <p className={cx("mt-5 max-w-3xl text-pretty text-base leading-7 sm:text-lg", light ? "text-white/60" : "text-[#525252]")}>
            {description}
          </p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </Reveal>
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
    <section className="border-b border-[#E5E5E5] bg-gradient-to-b from-white to-[#FAFAFA] px-5 py-16 sm:px-6 sm:py-20 lg:py-24 overflow-hidden">
      <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1fr_0.78fr] lg:items-end">
        <div>
          <Reveal variant={fadeUp}><Eyebrow>{eyebrow}</Eyebrow></Reveal>
          <Reveal variant={fadeUp} delay={0.08}>
            <h1 className="mt-5 text-balance text-4xl font-semibold leading-[1.05] tracking-tight text-[#0A0A0A] sm:text-5xl lg:text-6xl">
              {title}
            </h1>
          </Reveal>
          <Reveal variant={fadeUp} delay={0.16}>
            <p className="mt-6 max-w-3xl text-pretty text-base leading-8 text-[#525252] sm:text-lg">
              {description}
            </p>
          </Reveal>
          {children && (
            <Reveal variant={fadeUp} delay={0.24}>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">{children}</div>
            </Reveal>
          )}
        </div>
        {image && (
          <Reveal variant={fadeRight} delay={0.14} className="hidden lg:block">
            <ImagePlaceholder src={image} title={imageTitle ?? eyebrow} caption={imageCaption} floating />
          </Reveal>
        )}
      </div>
    </section>
  );
}

/* ── Card ────────────────────────────────────────────────────── */
export function Card({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <Reveal
      variant={scaleIn}
      className={cx(
        "lift group cursor-default border border-[#E5E5E5] bg-white p-6 sm:p-7 hover:border-[#0A0A0A]",
        "shadow-[0_1px_2px_rgba(0,0,0,0.03),0_8px_28px_rgba(0,0,0,0.05)]",
        className
      )}
    >
      {children}
    </Reveal>
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
      "img-zoom relative overflow-hidden border border-[#E5E5E5]",
      "shadow-[0_24px_64px_rgba(0,0,0,0.10)]",
      floating && "anim-float",
      className
    )}>
      <div className="relative aspect-[4/3] min-h-60">
        <Image
          src={src ?? "https://images.unsplash.com/photo-1518186285589-2f7649de83e0?auto=format&fit=crop&w=1600&q=80"}
          alt={title}
          fill
          sizes="(min-width:1024px) 40vw,100vw"
          priority={priority}
          className="object-cover grayscale-[0.15]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />
      </div>
      <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
        <p className="font-semibold leading-snug">{title}</p>
        {caption && <p className="mt-1 text-sm text-white/75">{caption}</p>}
      </div>
    </div>
  );
}

/* ── Badge ───────────────────────────────────────────────────── */
export function Badge({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center border border-[#D4D4D4] bg-[#FAFAFA] px-2.5 py-1 font-mono text-[11px] font-semibold text-[#171717]">
      {children}
    </span>
  );
}
export function BadgeMuted({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center border border-[#E5E5E5] bg-[#FAFAFA] px-2.5 py-1 font-mono text-[11px] font-semibold text-[#525252]">
      {children}
    </span>
  );
}

/* ── Stat ────────────────────────────────────────────────────── */
export function Stat({ value, label, detail, light }: { value: string; label: string; detail?: string; light?: boolean }) {
  return (
    <Reveal variant={fadeUp}>
      <div className={cx("font-mono text-3xl font-bold tracking-tight", light ? "text-white" : "text-[#E0E7FF]")}>
        {value}
      </div>
      <div className={cx("mt-1 text-sm font-semibold", light ? "text-white/70" : "text-white")}>{label}</div>
      {detail && <div className={cx("mt-1 text-xs leading-5", light ? "text-white/40" : "text-white/60")}>{detail}</div>}
    </Reveal>
  );
}

/* ── StepBadge ───────────────────────────────────────────────── */
export function StepBadge({ step, active }: { step: string; active?: boolean }) {
  return (
    <div className={cx(
      "flex h-9 w-9 shrink-0 items-center justify-center border font-mono text-xs font-bold transition-colors",
      active ? "border-[#0A0A0A] bg-[#0A0A0A] text-white" : "border-[#0A0A0A] bg-white text-[#0A0A0A]"
    )}>
      {step}
    </div>
  );
}

/* ── Pill ────────────────────────────────────────────────────── */
export function Pill({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center border border-[#E5E5E5] bg-[#FAFAFA] px-2.5 py-1 font-mono text-[11px] font-medium text-[#0A0A0A] transition hover:border-[#0A0A0A]">
      {children}
    </span>
  );
}

/* ── GlowCard (mouse-follow highlight, monochrome) ──────────── */
export function GlowCard({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <Reveal
      variant={scaleIn}
      className={cx(
        "group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.05] to-transparent p-6 sm:p-8 backdrop-blur-sm",
        "before:pointer-events-none before:absolute before:inset-0 before:opacity-0 before:transition-opacity before:duration-500",
        "before:bg-[radial-gradient(circle_at_var(--mx,50%)_var(--my,50%),rgba(56,189,248,0.15),transparent_50%)]",
        "hover:before:opacity-100 hover:border-[#38BDF8]/30",
        "shadow-[0_8px_32px_rgba(0,0,0,0.3)] hover:shadow-[0_16px_48px_rgba(56,189,248,0.2)]",
        "transition-all duration-300",
        className
      )}
    >
      <div
        className="contents"
        onMouseMove={(e) => {
          const el = e.currentTarget.parentElement as HTMLElement | null;
          if (!el) return;
          const r = el.getBoundingClientRect();
          el.style.setProperty("--mx", `${((e.clientX - r.left) / r.width) * 100}%`);
          el.style.setProperty("--my", `${((e.clientY - r.top) / r.height) * 100}%`);
        }}
      >
        {children}
      </div>
    </Reveal>
  );
}

/* ── Buttons ─────────────────────────────────────────────────── */
const base = "inline-flex items-center justify-center gap-2 font-semibold tracking-tight transition-all duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4";

export function PrimaryButton({ href, children, className }: { href: string; children: ReactNode; className?: string }) {
  return (
    <Link href={href} className={cx(base, "group min-h-12 px-6 rounded-full bg-gradient-to-r from-[#38BDF8] to-[#818CF8] text-white shadow-[0_8px_32px_rgba(56,189,248,0.35)] hover:shadow-[0_16px_48px_rgba(56,189,248,0.45)] hover:-translate-y-1 focus-visible:outline-[#38BDF8]", className)}>
      {children} <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden />
    </Link>
  );
}
export function SecondaryButton({ href, children, className }: { href: string; children: ReactNode; className?: string }) {
  return (
    <Link href={href} className={cx(base, "group min-h-12 px-6 rounded-full border border-white/20 bg-white/5 text-white backdrop-blur-sm hover:border-white/30 hover:bg-white/10 hover:-translate-y-1 focus-visible:outline-white", className)}>
      {children} <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden />
    </Link>
  );
}
export function OutlineButton({ href, children, className }: { href: string; children: ReactNode; className?: string }) {
  return (
    <Link href={href} className={cx(base, "min-h-12 px-6 rounded-full border border-white/20 bg-transparent text-white hover:border-[#38BDF8]/30 hover:bg-white/5 hover:-translate-y-1 focus-visible:outline-white", className)}>
      {children}
    </Link>
  );
}
export function GhostButton({ href, children, className }: { href: string; children: ReactNode; className?: string }) {
  return (
    <Link href={href} className={cx(base, "min-h-10 px-4 text-white hover:bg-white/5 focus-visible:outline-white", className)}>
      {children}
    </Link>
  );
}
export function TextLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link href={href} className="group inline-flex items-center gap-1.5 text-sm font-semibold text-[#38BDF8] hover:text-[#60C9FF]">
      {children} <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" aria-hidden />
    </Link>
  );
}
export function ButtonLink({ href, children, variant = "primary", className }: {
  href: string; children: ReactNode; variant?: "primary" | "secondary" | "outline" | "ghost" | "text";
  className?: string;
}) {
  const V = { primary: PrimaryButton, secondary: SecondaryButton, outline: OutlineButton, ghost: GhostButton, text: TextLink }[variant];
  return <V href={href} className={className}>{children}</V>;
}
