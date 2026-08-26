"use client";

import Image from "next/image";
import Link from "next/link";
import { type ReactNode } from "react";
import { motion, type Variants } from "framer-motion";
import { ArrowRight } from "lucide-react";

/* ══════════════════════════════════════════════════════════════════
   TMI design primitives — PURE BMW M, theme-flipping
   · 700/300 weight contrast, UPPERCASE mono micro-labels
   · blue --action is the single action signal (never the M stripe)
   · 0px radius by default; rounded-full only for circular icons
   · every colour rides on semantic tokens (bg-canvas / text-ink /
     border-line / bg-action …) so the whole site inverts by theme
   · the M tricolor rail (bg-m-blue / -mid / -red) stays literal — brand
   NOTE: the `light` / `dark` props are legacy no-ops kept so existing
   call sites keep compiling; colour now comes entirely from tokens.
   ══════════════════════════════════════════════════════════════════ */

export function cx(...c: (string | false | null | undefined)[]) {
  return c.filter(Boolean).join(" ");
}

/* ── Palette constants (for any JS/style consumers) ─── */
export const BMW = {
  blue: "#1c69d4",
  blueDeep: "#0066b1",
  red: "#e22718",
  dark: "#1a2129",
  darker: "#0d0d0d",
  tile: "#272729",
  cream: "#f3f0ee",
  ink: "#141413",
} as const;

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

/* ── MStripe — the BMW M tricolor rail, our signature divider ── */
export function MStripe({ className, width = "w-20" }: { className?: string; width?: string }) {
  return (
    <div className={cx("flex h-[3px] overflow-hidden", width, className)} aria-hidden>
      <span className="flex-1 bg-m-blue" />
      <span className="flex-1 bg-m-blue-mid" />
      <span className="flex-1 bg-m-red" />
    </div>
  );
}

/* ── Section — full-bleed tile ───────────────────────────────── */
export function Section({
  children, className, labelledBy, containerClassName,
}: { children: ReactNode; className?: string; labelledBy?: string; containerClassName?: string }) {
  return (
    <section aria-labelledby={labelledBy} className={cx("px-5 py-20 sm:px-6 sm:py-24 lg:py-28", className)}>
      <div className={cx("mx-auto max-w-[1200px]", containerClassName)}>{children}</div>
    </section>
  );
}

/* ── Eyebrow — BMW mono micro-label in the action blue ───────── */
export function Eyebrow({ children }: { children: ReactNode; light?: boolean }) {
  return (
    <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-action">
      {children}
    </p>
  );
}

/* ── SectionHeader — BMW uppercase display, 700 weight ───────── */
export function SectionHeader({
  eyebrow, title, description, id, action, align = "center", className,
}: {
  eyebrow: string; title: string; description?: string; id: string;
  action?: ReactNode; align?: "left" | "center"; light?: boolean; className?: string;
}) {
  return (
    <Reveal className={cx("flex flex-col gap-5", align === "center" ? "items-center text-center" : "", className)}>
      <MStripe />
      <Eyebrow>{eyebrow}</Eyebrow>
      <h2 id={id} className="text-balance text-[32px] font-bold uppercase leading-[1.1] tracking-[-0.02em] text-ink sm:text-[42px] lg:text-[48px]">
        {title}
      </h2>
      {description && (
        <p className="max-w-2xl text-pretty text-[17px] font-light leading-[1.6] tracking-[-0.01em] text-ink-muted sm:text-[18px]">
          {description}
        </p>
      )}
      {action && <div className="mt-1">{action}</div>}
    </Reveal>
  );
}

/* ── ImagePlaceholder — photo tile; caption sits on a dark veil
     over arbitrary imagery, so it stays white in both themes ── */
export function ImagePlaceholder({
  title, caption, src, className, floating = false, priority = false,
}: {
  title: string; caption?: string; src?: string;
  className?: string; floating?: boolean; priority?: boolean;
}) {
  return (
    <div className={cx("relative overflow-hidden", floating && "anim-float", className)}>
      <div className="relative aspect-[4/3] min-h-60">
        <Image
          src={src ?? "https://images.unsplash.com/photo-1518186285589-2f7649de83e0?auto=format&fit=crop&w=1600&q=80"}
          alt={title}
          fill
          sizes="(min-width:1024px) 40vw,100vw"
          priority={priority}
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
      </div>
      {(title || caption) && (
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
          {title && (
            <p className="text-[15px] font-bold uppercase leading-[1.3] tracking-[0.04em]">{title}</p>
          )}
          {caption && (
            <p className="mt-1.5 text-[14px] font-light leading-[1.5] tracking-[-0.01em] text-white/70">{caption}</p>
          )}
        </div>
      )}
    </div>
  );
}

/* ── Badges — rectangular BMW M tags ────────────────────────── */
export function Badge({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center border border-action/30 bg-action/[0.08] px-3.5 py-1.5 font-mono text-[11px] font-semibold uppercase tracking-[0.08em] text-action">
      {children}
    </span>
  );
}
export function BadgeMuted({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center border border-line-2 bg-surface px-3.5 py-1.5 font-mono text-[11px] font-medium uppercase tracking-[0.08em] text-ink-muted">
      {children}
    </span>
  );
}

/* ── Stat — BMW numeric display ─────────────────────────────── */
export function Stat({ value, label, detail }: { value: string; label: string; detail?: string; light?: boolean }) {
  return (
    <Reveal variant={fadeUp}>
      <div className="text-[40px] font-bold leading-[1] tracking-[-0.02em] text-ink sm:text-[48px]">
        {value}
      </div>
      <div className="mt-3 font-mono text-[11px] font-semibold uppercase tracking-[0.12em] text-action">
        {label}
      </div>
      {detail && (
        <div className="mt-2 text-[14px] font-light leading-[1.5] tracking-[-0.01em] text-ink-muted">
          {detail}
        </div>
      )}
    </Reveal>
  );
}

/* ── Card — rectangular, theme-aware, BMW hover rail ────────── */
export function Card({ children, className }: { children: ReactNode; className?: string; dark?: boolean }) {
  return (
    <Reveal
      variant={scaleIn}
      className={cx(
        "group relative cursor-default overflow-hidden border border-line bg-card p-6 transition-all duration-300 hover:border-action/40 hover:shadow-[0_12px_40px_rgba(28,105,212,0.10)] sm:p-7",
        className
      )}
    >
      <span
        className="absolute left-0 top-0 h-0.5 w-full origin-left scale-x-0 bg-action transition-transform duration-500 group-hover:scale-x-100"
        aria-hidden
      />
      {children}
    </Reveal>
  );
}

/* ── GlowCard — larger padding variant ──────────────────────── */
export function GlowCard({ children, className, dark }: { children: ReactNode; className?: string; dark?: boolean }) {
  return <Card className={cx("sm:p-8", className)} dark={dark}>{children}</Card>;
}

/* ── StepBadge — BMW square index marker ────────────────────── */
export function StepBadge({ step, active }: { step: string; active?: boolean }) {
  return (
    <div className={cx(
      "flex h-10 w-10 shrink-0 items-center justify-center font-mono text-[12px] font-bold uppercase tracking-[0.06em] transition-colors",
      active ? "bg-action text-on-action" : "border border-line-2 bg-card text-ink"
    )}>
      {step}
    </div>
  );
}

/* ── Pill — rectangular BMW M chip ──────────────────────────── */
export function Pill({ children }: { children: ReactNode; dark?: boolean }) {
  return (
    <span className="inline-flex items-center border border-line-2 bg-surface px-3.5 py-1.5 font-mono text-[11px] font-medium uppercase tracking-[0.08em] text-ink-2">
      {children}
    </span>
  );
}

/* ══ Buttons — BMW rectangular utility, zero radius, uppercase ══ */
const btnBase =
  "inline-flex items-center justify-center gap-2 px-7 py-3.5 font-mono text-[12px] font-bold uppercase tracking-[0.1em] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2";

/* Primary — the single BMW action signal */
export function PrimaryButton({ href, children, className }: { href: string; children: ReactNode; className?: string }) {
  return (
    <Link
      href={href}
      className={cx(btnBase, "bg-action text-on-action hover:bg-action-strong focus-visible:outline-action", className)}
    >
      {children}
    </Link>
  );
}

/* Secondary — solid ink outline that inverts on hover */
export function SecondaryButton({ href, children, className }: { href: string; children: ReactNode; className?: string }) {
  return (
    <Link
      href={href}
      className={cx(
        btnBase,
        "border-2 border-ink bg-transparent text-ink hover:bg-ink hover:text-canvas focus-visible:outline-ink",
        className
      )}
    >
      {children}
    </Link>
  );
}

/* Outline — subtle ink outline (works on any themed surface) */
export function OutlineButton({ href, children, className }: { href: string; children: ReactNode; className?: string }) {
  return (
    <Link
      href={href}
      className={cx(
        btnBase,
        "border-2 border-ink/25 bg-transparent text-ink hover:border-ink/50 hover:bg-ink/[0.08] focus-visible:outline-ink",
        className
      )}
    >
      {children}
    </Link>
  );
}

export function GhostButton({ href, children, className }: { href: string; children: ReactNode; className?: string }) {
  return (
    <Link
      href={href}
      className={cx(
        "inline-flex items-center gap-1.5 font-mono text-[12px] font-bold uppercase tracking-[0.1em] text-action transition-colors hover:text-action-strong",
        className
      )}
    >
      {children}
    </Link>
  );
}

export function TextLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      className="group inline-flex items-center gap-1.5 font-mono text-[12px] font-bold uppercase tracking-[0.1em] text-action transition-colors hover:text-action-strong"
    >
      {children}
      <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5" aria-hidden />
    </Link>
  );
}

/* TextLinkDark — legacy alias; now identical to TextLink (token-based) */
export function TextLinkDark({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      className="group inline-flex items-center gap-1.5 font-mono text-[12px] font-bold uppercase tracking-[0.1em] text-action transition-colors hover:text-ink"
    >
      {children}
      <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5" aria-hidden />
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

/* ── PageHero — BMW M banner with M-stripe rail, theme-flipping ─ */
export function PageHero({
  eyebrow, title, description, image, imageTitle, imageCaption, children,
}: {
  eyebrow: string; title: string; description?: string;
  image?: string; imageTitle?: string; imageCaption?: string;
  children?: ReactNode;
}) {
  return (
    <div className="relative overflow-hidden bg-surface px-5 py-16 sm:px-6 sm:py-24">
      {/* M-stripe rail across the top of every page hero (literal brand) */}
      <div className="absolute left-0 right-0 top-0 flex h-1" aria-hidden>
        <span className="flex-1 bg-m-blue" />
        <span className="flex-1 bg-m-blue-mid" />
        <span className="flex-1 bg-m-red" />
      </div>

      <div className="mx-auto max-w-[1200px]">
        <div className={cx("grid gap-12", image ? "lg:grid-cols-[1fr_0.85fr] lg:items-center" : "")}>
          <div>
            <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-action">
              {eyebrow}
            </p>
            <h1 className="mt-5 text-balance text-[40px] font-bold uppercase leading-[1.06] tracking-[-0.02em] text-ink sm:text-[54px] lg:text-[64px]">
              {title}
            </h1>
            {description && (
              <p className="mt-6 max-w-2xl text-pretty text-[18px] font-light leading-[1.6] tracking-[-0.01em] text-ink-muted sm:text-[20px]">
                {description}
              </p>
            )}
            {children && <div className="mt-10 flex flex-wrap gap-4">{children}</div>}
          </div>
          {image && (
            <ImagePlaceholder src={image} title={imageTitle ?? ""} caption={imageCaption} priority />
          )}
        </div>
      </div>
    </div>
  );
}
