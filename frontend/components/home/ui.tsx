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
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};
export const fadeLeft: Variants = {
  hidden: { opacity: 0, x: -28 },
  show: { opacity: 1, x: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};
export const fadeRight: Variants = {
  hidden: { opacity: 0, x: 28 },
  show: { opacity: 1, x: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};
export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.96 },
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

/* ── Section — full-bleed tile, no rounding ──────────────────── */
export function Section({
  children, className, labelledBy, containerClassName,
}: { children: ReactNode; className?: string; labelledBy?: string; containerClassName?: string }) {
  return (
    <section aria-labelledby={labelledBy} className={cx("px-5 py-20 sm:px-6 sm:py-[80px]", className)}>
      <div className={cx("mx-auto max-w-[980px]", containerClassName)}>{children}</div>
    </section>
  );
}

/* ── Eyebrow ─────────────────────────────────────────────────── */
export function Eyebrow({ children, light }: { children: ReactNode; light?: boolean }) {
  return (
    <p className={cx(
      "text-[21px] font-semibold leading-[1.19] tracking-[0.231px]",
      light ? "text-white" : "text-[#1d1d1f]"
    )}>
      {children}
    </p>
  );
}

/* ── SectionHeader ───────────────────────────────────────────── */
export function SectionHeader({
  eyebrow, title, description, id, action, align = "center", light, className,
}: {
  eyebrow: string; title: string; description?: string; id: string;
  action?: ReactNode; align?: "left" | "center"; light?: boolean; className?: string;
}) {
  return (
    <Reveal className={cx("flex flex-col gap-6", align === "center" ? "items-center text-center" : "", className)}>
      <Eyebrow light={light}>{eyebrow}</Eyebrow>
      <h2 id={id} className={cx(
        "text-balance text-[40px] font-semibold leading-[1.1] tracking-[-0.374px]",
        light ? "text-white" : "text-[#1d1d1f]"
      )}>
        {title}
      </h2>
      {description && (
        <p className={cx(
          "max-w-2xl text-pretty text-[17px] leading-[1.47] tracking-[-0.374px]",
          light ? "text-[#cccccc]" : "text-[#7a7a7a]"
        )}>
          {description}
        </p>
      )}
      {action && <div>{action}</div>}
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
    <div className={cx("overflow-hidden", floating && "anim-float", className)}>
      <div className="relative aspect-[4/3] min-h-60">
        <Image
          src={src ?? "https://images.unsplash.com/photo-1518186285589-2f7649de83e0?auto=format&fit=crop&w=1600&q=80"}
          alt={title}
          fill
          sizes="(min-width:1024px) 40vw,100vw"
          priority={priority}
          className="object-cover"
          style={{ boxShadow: "rgba(0,0,0,0.22) 3px 5px 30px 0" }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
      </div>
      <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
        <p className="text-[17px] font-semibold leading-[1.47] tracking-[-0.374px]">{title}</p>
        {caption && <p className="mt-1 text-[14px] leading-[1.43] tracking-[-0.224px] text-white/75">{caption}</p>}
      </div>
    </div>
  );
}

/* ── Badge ───────────────────────────────────────────────────── */
export function Badge({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-[#e0e0e0] bg-[#fafafc] px-3 py-1.5 text-[14px] font-semibold leading-[1.29] tracking-[-0.224px] text-[#1d1d1f]">
      {children}
    </span>
  );
}
export function BadgeMuted({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-[#e0e0e0] bg-[#f5f5f7] px-3 py-1.5 text-[14px] leading-[1.29] tracking-[-0.224px] text-[#7a7a7a]">
      {children}
    </span>
  );
}

/* ── Stat ────────────────────────────────────────────────────── */
export function Stat({ value, label, detail, light }: { value: string; label: string; detail?: string; light?: boolean }) {
  return (
    <Reveal variant={fadeUp}>
      <div className={cx("text-[40px] font-semibold leading-[1.1] tracking-[-0.374px]", light ? "text-white" : "text-[#1d1d1f]")}>
        {value}
      </div>
      <div className={cx("mt-1 text-[17px] font-semibold leading-[1.24] tracking-[-0.374px]", light ? "text-white/80" : "text-[#1d1d1f]")}>{label}</div>
      {detail && <div className={cx("mt-1 text-[14px] leading-[1.43] tracking-[-0.224px]", light ? "text-[#cccccc]" : "text-[#7a7a7a]")}>{detail}</div>}
    </Reveal>
  );
}

/* ── Card — utility card with 18px radius ────────────────────── */
export function Card({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <Reveal
      variant={scaleIn}
      className={cx(
        "group cursor-default rounded-[18px] border border-[#e0e0e0] bg-white p-6 sm:p-7",
        "transition-all duration-300 hover:shadow-[0_8px_32px_rgba(0,0,0,0.10)]",
        className
      )}
    >
      {children}
    </Reveal>
  );
}

/* ── GlowCard — utility card, Apple style ────────────────────── */
export function GlowCard({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <Reveal
      variant={scaleIn}
      className={cx(
        "group cursor-default rounded-[18px] border border-[#e0e0e0] bg-white p-6 sm:p-8",
        "transition-all duration-300 hover:shadow-[0_8px_32px_rgba(0,0,0,0.10)]",
        className
      )}
    >
      {children}
    </Reveal>
  );
}

/* ── StepBadge ───────────────────────────────────────────────── */
export function StepBadge({ step, active }: { step: string; active?: boolean }) {
  return (
    <div className={cx(
      "flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[14px] font-semibold transition-colors",
      active ? "bg-[#0066cc] text-white" : "border border-[#e0e0e0] bg-white text-[#1d1d1f]"
    )}>
      {step}
    </div>
  );
}

/* ── Pill ────────────────────────────────────────────────────── */
export function Pill({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-[#e0e0e0] bg-[#fafafc] px-3 py-1 text-[14px] tracking-[-0.224px] text-[#1d1d1f]">
      {children}
    </span>
  );
}

/* ── Buttons ─────────────────────────────────────────────────── */
/* Primary blue pill — the one Apple action signal */
export function PrimaryButton({ href, children, className }: { href: string; children: ReactNode; className?: string }) {
  return (
    <Link
      href={href}
      className={cx(
        "apple-press inline-flex items-center justify-center gap-2 rounded-full bg-[#0066cc] px-[22px] py-[11px]",
        "text-[17px] font-[400] leading-[1.47] tracking-[-0.374px] text-white",
        "transition-colors hover:bg-[#0071e3] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0071e3]",
        className
      )}
    >
      {children}
    </Link>
  );
}

/* Ghost pill — secondary CTA */
export function SecondaryButton({ href, children, className }: { href: string; children: ReactNode; className?: string }) {
  return (
    <Link
      href={href}
      className={cx(
        "apple-press inline-flex items-center justify-center gap-2 rounded-full border border-[#0066cc] bg-transparent px-[22px] py-[11px]",
        "text-[17px] font-[400] leading-[1.47] tracking-[-0.374px] text-[#0066cc]",
        "transition-colors hover:bg-[#0066cc] hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0071e3]",
        className
      )}
    >
      {children}
    </Link>
  );
}

/* Ghost pill — on dark surface */
export function OutlineButton({ href, children, className }: { href: string; children: ReactNode; className?: string }) {
  return (
    <Link
      href={href}
      className={cx(
        "apple-press inline-flex items-center justify-center gap-2 rounded-full border border-[#2997ff] bg-transparent px-[22px] py-[11px]",
        "text-[17px] font-[400] leading-[1.47] tracking-[-0.374px] text-[#2997ff]",
        "transition-colors hover:bg-[#2997ff] hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2997ff]",
        className
      )}
    >
      {children}
    </Link>
  );
}

export function GhostButton({ href, children, className }: { href: string; children: ReactNode; className?: string }) {
  return (
    <Link href={href} className={cx("inline-flex items-center gap-1 text-[17px] leading-[1.47] tracking-[-0.374px] text-[#0066cc] hover:underline", className)}>
      {children}
    </Link>
  );
}

export function TextLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link href={href} className="inline-flex items-center gap-1 text-[17px] leading-[1.47] tracking-[-0.374px] text-[#0066cc] hover:underline">
      {children} <ArrowRight className="h-4 w-4" aria-hidden />
    </Link>
  );
}

/* Text link for dark surfaces */
export function TextLinkDark({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link href={href} className="inline-flex items-center gap-1 text-[17px] leading-[1.47] tracking-[-0.374px] text-[#2997ff] hover:underline">
      {children} <ArrowRight className="h-4 w-4" aria-hidden />
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

/* ── PageHero — page-level hero banner (Apple parchment style) ── */
export function PageHero({
  eyebrow, title, description, image, imageTitle, imageCaption, children,
}: {
  eyebrow: string; title: string; description?: string;
  image?: string; imageTitle?: string; imageCaption?: string;
  children?: ReactNode;
}) {
  return (
    <div className="bg-[#f5f5f7] px-5 py-16 sm:px-6 sm:py-24">
      <div className="mx-auto max-w-[980px]">
        <div className={cx("grid gap-10", image ? "lg:grid-cols-2 lg:items-center" : "")}>
          <div>
            <p className="text-[21px] font-semibold leading-[1.19] tracking-[0.231px] text-[#1d1d1f]">{eyebrow}</p>
            <h1 className="mt-4 text-[56px] font-semibold leading-[1.07] tracking-[-0.28px] text-[#1d1d1f]">{title}</h1>
            {description && (
              <p className="mt-6 max-w-2xl text-[28px] font-[400] leading-[1.14] tracking-[0.196px] text-[#7a7a7a]">
                {description}
              </p>
            )}
            {children && <div className="mt-8 flex flex-wrap gap-4">{children}</div>}
          </div>
          {image && (
            <div className="overflow-hidden">
              <ImagePlaceholder src={image} title={imageTitle ?? ""} caption={imageCaption} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
