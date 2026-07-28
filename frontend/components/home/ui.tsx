import Image from "next/image";
import Link from "next/link";
import type { ComponentType, ReactNode } from "react";
import { ArrowRight } from "lucide-react";

export function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

const focusRing =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#0A46A8]";

const buttonBase =
  "inline-flex items-center justify-center gap-2 rounded-none font-semibold tracking-tight transition-[background,border-color,color,box-shadow,transform] duration-200 ease-out disabled:pointer-events-none disabled:opacity-50 motion-safe:hover:-translate-y-0.5";

const buttonSizes = {
  sm: "min-h-10 px-4 text-sm",
  md: "min-h-12 px-5 text-sm",
  lg: "min-h-14 px-7 text-base",
};

const buttonVariants = {
  primary:
    "bg-[#0B5FFF] text-white shadow-[0_10px_30px_rgba(11,95,255,0.28)] hover:bg-[#0A46A8] hover:shadow-[0_16px_38px_rgba(11,95,255,0.32)]",
  secondary:
    "border border-[#C7D2E0] bg-white/90 text-[#0A1628] shadow-[inset_0_1px_0_rgba(255,255,255,0.8)] hover:border-[#0B5FFF] hover:bg-[#F4F7FC]",
  outline:
    "border border-[#0A1628] bg-transparent text-[#0A1628] hover:bg-[#0A1628] hover:text-white",
  ghost:
    "bg-transparent text-[#0A1628] hover:bg-[#F4F4F2]",
  text: "rounded-none px-0 text-[#0A1628] underline-offset-4 hover:text-[#0A46A8] hover:underline",
};

export function ButtonLink({
  href,
  children,
  variant = "primary",
  size = "md",
  className,
  ariaLabel,
  showArrow = variant !== "ghost",
}: {
  href: string;
  children: ReactNode;
  variant?: keyof typeof buttonVariants;
  size?: keyof typeof buttonSizes;
  className?: string;
  ariaLabel?: string;
  showArrow?: boolean;
}) {
  return (
    <Link
      href={href}
      aria-label={ariaLabel}
      className={cx(
        buttonBase,
        buttonSizes[size],
        buttonVariants[variant],
        focusRing,
        className,
      )}
    >
      {children}
      {showArrow ? <ArrowRight className="h-4 w-4" aria-hidden /> : null}
    </Link>
  );
}

export function Section({
  children,
  className,
  labelledBy,
  containerClassName,
}: {
  children: ReactNode;
  className?: string;
  labelledBy?: string;
  containerClassName?: string;
}) {
  return (
    <section
      aria-labelledby={labelledBy}
      className={cx("px-5 py-16 sm:px-6 sm:py-20 lg:py-28", className)}
    >
      <div className={cx("mx-auto max-w-7xl", containerClassName)}>{children}</div>
    </section>
  );
}

export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#0A46A8]">
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
  align = "left",
  className,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  id: string;
  action?: ReactNode;
  align?: "left" | "center";
  className?: string;
}) {
  return (
    <div
      className={cx(
        "flex flex-col gap-8",
        align === "center"
          ? "mx-auto max-w-4xl items-center text-center"
          : "md:flex-row md:items-end md:justify-between",
        className,
      )}
    >
      <div className={cx("max-w-4xl", align === "center" && "mx-auto")}>
        <Eyebrow>{eyebrow}</Eyebrow>
        <h2
          id={id}
          className="mt-4 text-balance text-3xl font-semibold leading-[1.08] tracking-normal text-[#0A1628] sm:text-4xl lg:text-5xl"
        >
          {title}
        </h2>
        {description ? (
          <p className="mt-5 max-w-3xl text-pretty text-base leading-7 text-[#5F6673] sm:text-lg sm:leading-8">
            {description}
          </p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

export function PageHero({
  eyebrow,
  title,
  description,
  children,
  image = "/images/hero/tmi-hero-digital.jpg",
  imageTitle,
  imageCaption = "Structured delivery environment",
}: {
  eyebrow: string;
  title: string;
  description: string;
  children?: ReactNode;
  image?: string;
  imageTitle?: string;
  imageCaption?: string;
}) {
  return (
    <section className="border-b border-[#E5E7EB] bg-[linear-gradient(180deg,#FFFFFF_0%,#F8F9FB_100%)] px-5 py-16 sm:px-6 sm:py-20 lg:py-24">
      <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1fr_0.78fr] lg:items-end">
        <div className="max-w-4xl">
          <Eyebrow>{eyebrow}</Eyebrow>
          <h1 className="mt-5 text-balance text-4xl font-semibold leading-[1.05] tracking-normal text-[#0A1628] sm:text-5xl lg:text-6xl">
            {title}
          </h1>
          <p className="mt-6 max-w-3xl text-pretty text-base leading-8 text-[#5F6673] sm:text-lg">
            {description}
          </p>
          {children ? <div className="mt-8 flex flex-col gap-3 sm:flex-row">{children}</div> : null}
        </div>
        <ImagePlaceholder
          src={image}
          title={imageTitle ?? `${eyebrow} workspace`}
          caption={imageCaption}
          className="hidden lg:block"
        />
      </div>
    </section>
  );
}

export function Badge({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-none border border-[#E5E7EB] bg-white px-3 py-1 text-xs font-semibold text-[#374151]">
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
        "rounded-none border border-[#D7DEE8] bg-white/90 p-6 shadow-[0_1px_2px_rgba(17,24,39,0.04),0_18px_48px_rgba(17,24,39,0.05)] transition-[border-color,box-shadow,transform] duration-200 ease-out motion-safe:hover:-translate-y-1 hover:border-[#0B5FFF] hover:shadow-[0_18px_50px_rgba(17,24,39,0.09)] sm:p-7",
        className,
      )}
    >
      {children}
    </article>
  );
}

export function IconFrame({
  icon: Icon,
  className,
}: {
  icon: ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  className?: string;
}) {
  return (
    <div
      className={cx(
        "flex h-11 w-11 items-center justify-center rounded-none border border-[#D7DEE8] bg-[#F4F7FC] text-[#0A46A8] shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]",
        className,
      )}
    >
      <Icon className="h-5 w-5" aria-hidden />
    </div>
  );
}

export function ImagePlaceholder({
  title,
  caption,
  src = "/images/hero/tmi-hero-digital.jpg",
  className,
}: {
  title: string;
  caption?: string;
  src?: string;
  className?: string;
}) {
  return (
    <div className={cx(
      "relative overflow-hidden rounded-none border border-[#D7DEE8] shadow-[0_22px_60px_rgba(17,24,39,0.1)]",
      className,
    )}>
      <div className="relative aspect-[4/3] min-h-64">
        <Image
          src={src}
          alt={title}
          fill
          sizes="(min-width:1024px) 40vw, 100vw"
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
        <h3 className="text-lg font-semibold">{title}</h3>
        {caption && (
          <p className="mt-2 text-sm text-white/80">{caption}</p>
        )}
      </div>
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
    <ButtonLink
      href={href}
      ariaLabel={ariaLabel}
      variant="text"
      size="sm"
      className="min-h-0"
    >
      {children}
    </ButtonLink>
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
    <ButtonLink href={href} variant="primary">
      {children}
    </ButtonLink>
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
    <ButtonLink href={href} variant="secondary">
      {children}
    </ButtonLink>
  );
}

export function OutlineButton({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  return (
    <ButtonLink href={href} variant="outline">
      {children}
    </ButtonLink>
  );
}

export function GhostButton({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  return (
    <ButtonLink href={href} variant="ghost" showArrow={false}>
      {children}
    </ButtonLink>
  );
}





