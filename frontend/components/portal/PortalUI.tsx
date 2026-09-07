"use client";

/**
 * Shared portal design primitives.
 *
 * Every portal page (admin, employees, management, client) composes its UI from
 * these instead of hand-rolling `border border-adm-border bg-[…]`
 * strings, which is what let each page drift into its own look. The `--adm-*`
 * tokens are registered in `@theme inline`, so these use real Tailwind
 * utilities (`bg-adm-surface`, `text-adm-text-3`) rather than inline styles —
 * which is also what lets the whole portal flip light↔dark for free.
 *
 * House rules, per the hybrid system in globals.css:
 *   · STRUCTURE IS SQUARE — cards, panels, tables, inputs, primary buttons all
 *     `rounded-none` (BMW / BMW M).
 *   · CONTROLS ARE ROUND — chips, badges, avatars, progress bars, icon-only
 *     buttons all `rounded-full` (Mastercard).
 *   · Display type is UPPERCASE and bold; body copy is `text-adm-text-2`.
 *   · One action blue. The M tricolor is a divider/accent, never a fill.
 *   · Depth is hairline-first; the one allowed shadow is light-mode only and
 *     resolves to `none` under `.dark`.
 *
 * The widget vocabulary below (SmallBox, InfoBox, Callout, Progress, Timeline,
 * DescriptionBlock, Breadcrumb, Tabs, Pagination) is lifted from the AdminLTE /
 * Adminator dashboard templates and re-expressed in these tokens — the layout
 * ideas are theirs, none of their Bootstrap chrome comes along.
 */

import Link from "next/link";
import {
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  Inbox,
  Loader2,
  X,
  type LucideIcon,
} from "lucide-react";
import type { CSSProperties, ReactNode } from "react";

export type Tone = "blue" | "green" | "amber" | "red" | "neutral";

const TONE: Record<Tone, { fg: string; bg: string; border: string }> = {
  blue: { fg: "text-adm-blue", bg: "bg-adm-blue-light", border: "border-adm-blue" },
  green: { fg: "text-adm-green", bg: "bg-adm-green-light", border: "border-adm-green" },
  amber: { fg: "text-adm-amber", bg: "bg-adm-amber-light", border: "border-adm-amber" },
  red: { fg: "text-adm-red", bg: "bg-adm-red-light", border: "border-adm-red" },
  neutral: { fg: "text-adm-text-3", bg: "bg-adm-surface-2", border: "border-adm-border" },
};

/** Solid fills, spelled out so Tailwind's scanner emits every class. */
const SOLID: Record<Tone, string> = {
  blue: "bg-adm-blue",
  green: "bg-adm-green",
  amber: "bg-adm-amber",
  red: "bg-adm-red",
  neutral: "bg-adm-text-3",
};

/** Shared input skin — 0px radius, elevated fill, blue focus ring. */
export const inputClass =
  "w-full rounded-none border border-adm-border bg-adm-surface-2 px-4 py-2.5 text-[15px] text-adm-text outline-none transition placeholder:text-adm-text-3 focus:border-adm-blue focus:ring-2 focus:ring-adm-blue/25";

export function Field({
  label,
  htmlFor,
  hint,
  children,
}: {
  label: string;
  htmlFor?: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div className="grid gap-2">
      <label
        htmlFor={htmlFor}
        className="text-[11px] font-bold uppercase tracking-[0.14em] text-adm-text-2"
      >
        {label}
      </label>
      {children}
      {hint && <p className="text-xs text-adm-text-3">{hint}</p>}
    </div>
  );
}

/** Centred modal. Renders nothing when closed so it costs nothing. */
export function PortalDialog({
  open,
  title,
  onClose,
  children,
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div
        className="adm-dialog w-full max-w-lg border border-adm-border bg-adm-surface"
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <div className="m-stripe" aria-hidden="true" />
        <div className="flex items-center justify-between gap-4 border-b border-adm-border px-6 py-4">
          <h2 className="text-sm font-bold uppercase tracking-[0.14em] text-adm-text">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-8 w-8 items-center justify-center rounded-full border border-adm-border text-adm-text-2 transition hover:bg-adm-surface-2 hover:text-adm-text"
          >
            <X size={16} />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

/** 13px/700/1.5px-tracking uppercase label — the system's utility voice. */
export function Label({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={`text-[11px] font-bold uppercase tracking-[0.14em] text-adm-text-3 ${className}`}
    >
      {children}
    </span>
  );
}

export function PortalPageHeader({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  /** Right-aligned actions. */
  children?: ReactNode;
}) {
  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <div className="m-stripe mb-4 w-16" aria-hidden="true" />
        <h1 className="truncate text-2xl font-bold uppercase tracking-[-0.01em] text-adm-text sm:text-3xl">
          {title}
        </h1>
        {description && <p className="mt-2 text-sm text-adm-text-2">{description}</p>}
      </div>
      {children && <div className="flex shrink-0 flex-wrap items-center gap-3">{children}</div>}
    </header>
  );
}

export function PortalButton({
  children,
  onClick,
  type = "button",
  variant = "primary",
  disabled,
  icon: Icon,
  href,
}: {
  children: ReactNode;
  onClick?: () => void;
  type?: "button" | "submit";
  variant?: "primary" | "ghost" | "danger";
  disabled?: boolean;
  icon?: LucideIcon;
  href?: string;
}) {
  const base =
    "btn-press inline-flex items-center justify-center gap-2 px-5 py-2.5 text-[11px] font-bold uppercase tracking-[0.14em] transition disabled:opacity-40";
  const skin =
    variant === "primary"
      ? "bg-adm-blue text-white hover:opacity-90"
      : variant === "danger"
        ? "bg-adm-red text-white hover:opacity-90"
        : "border border-adm-border text-adm-text-2 hover:bg-adm-surface-2 hover:text-adm-text";

  const body = (
    <>
      {Icon && <Icon size={15} />}
      {children}
    </>
  );

  if (href) {
    return (
      <Link href={href} className={`${base} ${skin}`}>
        {body}
      </Link>
    );
  }
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={`${base} ${skin}`}>
      {body}
    </button>
  );
}

/** A bordered panel with an uppercase header strip. */
export function Panel({
  title,
  icon: Icon,
  action,
  children,
  padded = true,
  tone = "neutral",
}: {
  title?: string;
  icon?: LucideIcon;
  action?: ReactNode;
  children: ReactNode;
  padded?: boolean;
  tone?: Tone;
}) {
  return (
    <section className="flex min-w-0 flex-col border border-adm-border bg-adm-surface">
      {title && (
        <div className="flex items-center justify-between gap-3 border-b border-adm-border bg-adm-surface-2 px-5 py-3.5">
          <h2 className="flex items-center gap-2 text-[12px] font-bold uppercase tracking-[0.14em] text-adm-text">
            {Icon && <Icon size={15} className={TONE[tone].fg} />}
            {title}
          </h2>
          {action}
        </div>
      )}
      <div className={padded ? "p-5" : ""}>{children}</div>
    </section>
  );
}

/** Big-number KPI tile. Becomes a link when `href` is supplied. */
export function StatCard({
  label,
  value,
  icon: Icon,
  href,
  tone = "blue",
  hint,
}: {
  label: string;
  value: ReactNode;
  icon?: LucideIcon;
  href?: string;
  tone?: Tone;
  hint?: string;
}) {
  const inner = (
    <>
      <div className="mb-3 flex items-center gap-3">
        {Icon && (
          <span
            className={`flex h-8 w-8 shrink-0 items-center justify-center ${TONE[tone].bg} ${TONE[tone].fg}`}
          >
            <Icon size={16} />
          </span>
        )}
        <Label>{label}</Label>
      </div>
      <p className="adm-stat-value text-3xl font-bold tabular-nums text-adm-text">{value}</p>
      {hint && <p className="mt-1 text-xs text-adm-text-3">{hint}</p>}
    </>
  );

  const shell =
    "block min-w-0 border border-adm-border bg-adm-surface p-5 transition hover:border-adm-border-2";

  return href ? (
    <Link href={href} className={shell}>
      {inner}
    </Link>
  ) : (
    <div className={shell}>{inner}</div>
  );
}

/** Status chip. Recognises the attendance and leave vocabularies. */
export function StatusPill({ status }: { status: string | null | undefined }) {
  const key = (status ?? "unknown").toLowerCase();
  const tone: Tone =
    key === "present" || key === "approved" || key === "active" || key === "done"
      ? "green"
      : key === "late" || key === "pending" || key === "half_day" || key === "in_progress"
        ? "amber"
        : key === "absent" || key === "rejected"
          ? "red"
          : key === "leave" || key === "on_leave"
            ? "blue"
            : "neutral";

  return (
    <span
      className={`inline-block rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] ${TONE[tone].bg} ${TONE[tone].fg}`}
    >
      {key.replace(/_/g, " ")}
    </span>
  );
}

export function LoadingBlock({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-3 border border-adm-border bg-adm-surface py-16 text-sm text-adm-text-3">
      <Loader2 size={18} className="animate-spin text-adm-blue" />
      {label}
    </div>
  );
}

export function ErrorBlock({
  message = "Something went wrong loading this data.",
  onRetry,
}: {
  message?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex flex-col items-center gap-3 border border-adm-red bg-adm-red-light py-14 text-center">
      <AlertTriangle size={22} className="text-adm-red" />
      <p className="max-w-sm px-6 text-sm text-adm-text-2">{message}</p>
      {onRetry && (
        <PortalButton variant="ghost" onClick={onRetry}>
          Retry
        </PortalButton>
      )}
    </div>
  );
}

export function EmptyBlock({
  title = "Nothing here yet",
  description,
  children,
}: {
  title?: string;
  description?: string;
  children?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-3 border border-dashed border-adm-border py-14 text-center">
      <Inbox size={22} className="text-adm-text-3" />
      <p className="text-sm font-bold uppercase tracking-[0.1em] text-adm-text">{title}</p>
      {description && <p className="max-w-sm px-6 text-sm text-adm-text-3">{description}</p>}
      {children}
    </div>
  );
}

/** Horizontal-scrolling table scaffold — headers get the uppercase label voice. */
export function DataTable({
  head,
  children,
}: {
  head: readonly string[];
  children: ReactNode;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[560px] border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-adm-border bg-adm-surface-2">
            {head.map((cell) => (
              <th
                key={cell}
                className="px-5 py-3 text-[10px] font-bold uppercase tracking-[0.14em] text-adm-text-3"
                scope="col"
              >
                {cell}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-adm-border">{children}</tbody>
      </table>
    </div>
  );
}

export function Td({
  children,
  strong,
  className = "",
}: {
  children: ReactNode;
  strong?: boolean;
  className?: string;
}) {
  return (
    <td
      className={`px-5 py-3.5 align-middle ${
        strong ? "font-semibold text-adm-text" : "text-adm-text-2"
      } ${className}`}
    >
      {children}
    </td>
  );
}

/** Segmented bar used for roster / status breakdowns. */
export function SegmentBar({
  segments,
}: {
  segments: readonly { value: number; tone: Tone }[];
}) {
  const total = segments.reduce((sum, s) => sum + s.value, 0) || 1;
  return (
    <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-adm-surface-2">
      {segments.map((s, i) => (
        <div key={i} className={SOLID[s.tone]} style={{ width: `${(s.value / total) * 100}%` }} />
      ))}
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────────────
   WIDGET VOCABULARY — AdminLTE / Adminator layout ideas on our own tokens.
   ────────────────────────────────────────────────────────────────────────── */

/**
 * Mastercard's eyebrow label: a 5px accent dot then a tiny uppercase kicker.
 * Sits above a section title to name the region without another heading level.
 */
export function Eyebrow({ children }: { children: ReactNode }) {
  return <span className="adm-eyebrow">{children}</span>;
}

/** Round status token — a control, so it gets the full pill. */
export function Badge({
  children,
  tone = "neutral",
  solid = false,
}: {
  children: ReactNode;
  tone?: Tone;
  solid?: boolean;
}) {
  const skin = solid ? `${SOLID[tone]} text-white` : `${TONE[tone].bg} ${TONE[tone].fg}`;
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] ${skin}`}
    >
      {children}
    </span>
  );
}

/** Initial-circle avatar. Round, per the control rule. */
export function Avatar({
  name,
  size = 32,
  tone = "blue",
}: {
  name?: string | null;
  size?: number;
  tone?: Tone;
}) {
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-full font-bold text-white ${SOLID[tone]}`}
      style={{ width: size, height: size, fontSize: Math.round(size * 0.4) }}
      aria-hidden="true"
    >
      {name?.trim()?.[0]?.toUpperCase() ?? "?"}
    </span>
  );
}

/** Thin percentage bar. `value` is 0–100; out-of-range input is clamped. */
export function Progress({
  value,
  tone = "blue",
  size = "md",
}: {
  value: number;
  tone?: Tone;
  size?: "sm" | "md" | "lg";
}) {
  const pct = Math.max(0, Math.min(100, Number.isFinite(value) ? value : 0));
  const h = size === "sm" ? "h-1" : size === "lg" ? "h-3" : "h-2";
  return (
    <div
      className={`w-full overflow-hidden rounded-full bg-adm-surface-2 ${h}`}
      role="progressbar"
      aria-valuenow={Math.round(pct)}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className={`h-full rounded-full transition-[width] duration-500 ${SOLID[tone]}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

/** AdminLTE's progress-group: label, count on the right, bar underneath. */
export function ProgressGroup({
  label,
  current,
  total,
  tone = "blue",
}: {
  label: string;
  current: number;
  total: number;
  tone?: Tone;
}) {
  const pct = total > 0 ? (current / total) * 100 : 0;
  return (
    <div className="grid gap-2">
      <div className="flex items-baseline justify-between gap-3">
        <Label>{label}</Label>
        <span className="text-xs font-bold tabular-nums text-adm-text-2">
          {current}
          <span className="text-adm-text-3">/{total}</span>
        </span>
      </div>
      <Progress value={pct} tone={tone} size="sm" />
    </div>
  );
}

/**
 * AdminLTE's info-box: a square icon plate, then label over value. Reads well
 * in a 2–4 column grid and, unlike StatCard, can carry a progress footer.
 */
export function InfoBox({
  label,
  value,
  icon: Icon,
  tone = "blue",
  progress,
  note,
}: {
  label: string;
  value: ReactNode;
  icon: LucideIcon;
  tone?: Tone;
  /** 0–100. Renders a thin bar plus `note` beneath the value. */
  progress?: number;
  note?: string;
}) {
  return (
    <div className="flex min-w-0 items-stretch border border-adm-border bg-adm-surface">
      <span
        className={`flex w-14 shrink-0 items-center justify-center ${TONE[tone].bg} ${TONE[tone].fg}`}
      >
        <Icon size={20} />
      </span>
      <div className="min-w-0 flex-1 px-4 py-3.5">
        <Label>{label}</Label>
        <p className="mt-1 truncate text-2xl font-bold tabular-nums text-adm-text">{value}</p>
        {typeof progress === "number" && (
          <div className="mt-2.5 grid gap-1.5">
            <Progress value={progress} tone={tone} size="sm" />
            {note && <p className="text-xs text-adm-text-3">{note}</p>}
          </div>
        )}
        {typeof progress !== "number" && note && (
          <p className="mt-1 truncate text-xs text-adm-text-3">{note}</p>
        )}
      </div>
    </div>
  );
}

/**
 * AdminLTE's small-box: a solid-tone tile with an oversized watermark glyph and
 * an optional footer link. Use sparingly — one row at the top of a dashboard.
 */
export function SmallBox({
  label,
  value,
  icon: Icon,
  tone = "blue",
  href,
  linkLabel = "View details",
}: {
  label: string;
  value: ReactNode;
  icon: LucideIcon;
  tone?: Tone;
  href?: string;
  linkLabel?: string;
}) {
  return (
    <div className={`relative min-w-0 overflow-hidden text-white ${SOLID[tone]}`}>
      <Icon
        size={104}
        className="pointer-events-none absolute -right-4 -top-4 opacity-15"
        aria-hidden="true"
      />
      <div className="relative px-5 pb-4 pt-5">
        <p className="text-3xl font-bold tabular-nums leading-none">{value}</p>
        <p className="mt-2 text-[11px] font-bold uppercase tracking-[0.14em] text-white/80">
          {label}
        </p>
      </div>
      {href && (
        <Link
          href={href}
          className="relative flex items-center justify-center gap-1.5 bg-black/15 px-5 py-2 text-[10px] font-bold uppercase tracking-[0.14em] text-white/90 transition hover:bg-black/25 hover:text-white"
        >
          {linkLabel}
          <ChevronRight size={13} />
        </Link>
      )}
    </div>
  );
}

/** Rail colours for `.adm-callout`, which reads `--callout` for its left edge. */
const RAIL: Record<Tone, string> = {
  blue: "var(--adm-blue)",
  green: "var(--adm-green)",
  amber: "var(--adm-amber)",
  red: "var(--adm-red)",
  neutral: "var(--adm-border-2)",
};

/** AdminLTE's callout — an inline advisory with a 3px tone rail on the left. */
export function Callout({
  title,
  tone = "blue",
  icon: Icon,
  children,
}: {
  title?: string;
  tone?: Tone;
  icon?: LucideIcon;
  children: ReactNode;
}) {
  return (
    <div
      className="adm-callout px-5 py-4"
      style={{ "--callout": RAIL[tone] } as CSSProperties}
      role="note"
    >
      {title && (
        <p className="flex items-center gap-2 text-[12px] font-bold uppercase tracking-[0.14em] text-adm-text">
          {Icon && <Icon size={15} className={TONE[tone].fg} />}
          {title}
        </p>
      )}
      <div className={`text-sm text-adm-text-2 ${title ? "mt-1.5" : ""}`}>{children}</div>
    </div>
  );
}

/**
 * AdminLTE's timeline. The 1px spine is drawn by `.adm-timeline::before` at
 * x=11px, which is the centre of each 22px `TimelineItem` dot.
 */
export function Timeline({ children }: { children: ReactNode }) {
  return (
    <ol className="adm-timeline grid gap-5" role="list">
      {children}
    </ol>
  );
}

export function TimelineItem({
  title,
  meta,
  icon: Icon,
  tone = "blue",
  children,
}: {
  title: ReactNode;
  /** Timestamp or actor — rendered small and muted, right under the title. */
  meta?: string;
  icon?: LucideIcon;
  tone?: Tone;
  children?: ReactNode;
}) {
  return (
    <li className="flex gap-3.5">
      <span
        className={`relative z-[1] mt-0.5 flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full ring-4 ring-adm-surface ${SOLID[tone]}`}
        aria-hidden="true"
      >
        {Icon && <Icon size={12} className="text-white" />}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-adm-text">{title}</p>
        {meta && <p className="mt-0.5 text-xs text-adm-text-3">{meta}</p>}
        {children && <div className="mt-1.5 text-sm text-adm-text-2">{children}</div>}
      </div>
    </li>
  );
}

/**
 * AdminLTE's description-block: a centred figure with a signed delta. Designed
 * to sit several-across in a card footer, split by vertical hairlines.
 */
export function DescriptionBlock({
  label,
  value,
  delta,
  direction,
}: {
  label: string;
  value: ReactNode;
  /** Pre-formatted, e.g. `"12.4%"`. The arrow and colour come from `direction`. */
  delta?: string;
  direction?: "up" | "down";
}) {
  const good = direction === "up";
  return (
    <div className="min-w-0 px-4 py-3 text-center">
      {delta && (
        <p
          className={`flex items-center justify-center gap-1 text-xs font-bold ${
            good ? "text-adm-green" : "text-adm-red"
          }`}
        >
          {good ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
          {delta}
        </p>
      )}
      <p className="mt-1 truncate text-xl font-bold tabular-nums text-adm-text">{value}</p>
      <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.14em] text-adm-text-3">
        {label}
      </p>
    </div>
  );
}

export type Crumb = { label: string; href?: string };

/** Trail above a page header. The last crumb is the current page, never a link. */
export function Breadcrumb({ items }: { items: readonly Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex flex-wrap items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.12em]">
        {items.map((item, i) => {
          const last = i === items.length - 1;
          return (
            <li key={`${item.label}-${i}`} className="flex items-center gap-1.5">
              {i > 0 && <ChevronRight size={12} className="text-adm-text-3" aria-hidden="true" />}
              {item.href && !last ? (
                <Link href={item.href} className="text-adm-text-3 transition hover:text-adm-blue">
                  {item.label}
                </Link>
              ) : (
                <span className={last ? "text-adm-text" : "text-adm-text-3"} aria-current={last ? "page" : undefined}>
                  {item.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

/**
 * BMW's category tabs: no pills, no boxes — uppercase labels on a hairline,
 * the active one carrying a 2px action-blue underline. `count` renders a pill.
 */
export function Tabs<T extends string>({
  tabs,
  value,
  onChange,
}: {
  tabs: readonly { id: T; label: string; count?: number; countTone?: Tone }[];
  value: T;
  onChange: (id: T) => void;
}) {
  return (
    <div className="flex overflow-x-auto border-b border-adm-border" role="tablist">
      {tabs.map((tab) => {
        const active = tab.id === value;
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(tab.id)}
            className={`-mb-px flex shrink-0 items-center gap-2 border-b-2 px-5 py-3 text-[11px] font-bold uppercase tracking-[0.14em] transition ${
              active
                ? "border-adm-blue text-adm-blue"
                : "border-transparent text-adm-text-3 hover:text-adm-text"
            }`}
          >
            {tab.label}
            {typeof tab.count === "number" && tab.count > 0 && (
              <Badge tone={tab.countTone ?? "red"}>{tab.count}</Badge>
            )}
          </button>
        );
      })}
    </div>
  );
}

/** Filter/action strip that sits directly above a table inside a `Panel`. */
export function Toolbar({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-wrap items-center gap-3 border-b border-adm-border bg-adm-surface-2 px-5 py-3">
      {children}
    </div>
  );
}

/** Page stepper. Round controls, per the house rule. Hidden when there is one page. */
export function Pagination({
  page,
  pageCount,
  onChange,
}: {
  page: number;
  pageCount: number;
  onChange: (page: number) => void;
}) {
  if (pageCount <= 1) return null;
  const btn =
    "flex h-9 w-9 items-center justify-center rounded-full border border-adm-border text-adm-text-2 transition hover:bg-adm-surface-2 hover:text-adm-text disabled:opacity-35 disabled:hover:bg-transparent";
  return (
    <div className="flex items-center justify-between gap-4 border-t border-adm-border px-5 py-3">
      <Label>
        Page {page} of {pageCount}
      </Label>
      <div className="flex items-center gap-2">
        <button
          type="button"
          className={btn}
          onClick={() => onChange(page - 1)}
          disabled={page <= 1}
          aria-label="Previous page"
        >
          <ChevronLeft size={16} />
        </button>
        <button
          type="button"
          className={btn}
          onClick={() => onChange(page + 1)}
          disabled={page >= pageCount}
          aria-label="Next page"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
