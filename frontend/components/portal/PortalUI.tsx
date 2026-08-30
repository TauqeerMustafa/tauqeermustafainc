"use client";

/**
 * Shared portal design primitives.
 *
 * Every portal page (admin, employees, management, client) composes its UI from
 * these instead of hand-rolling `border border-[var(--adm-border)] bg-[…]`
 * strings, which is what let each page drift into its own look. The `--adm-*`
 * tokens are now registered in `@theme inline`, so these can use real Tailwind
 * utilities (`bg-adm-surface`, `text-adm-text-3`) rather than inline styles.
 *
 * House rules, per the BMW M portal system: pure-black canvas, #1a1a1a panels,
 * 0px radius everywhere, white UPPERCASE display type, #bbbbbb body copy, one
 * action blue, no drop shadows.
 */

import Link from "next/link";
import { AlertTriangle, Inbox, Loader2, X, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

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
            className="flex h-8 w-8 items-center justify-center border border-adm-border text-adm-text-2 transition hover:bg-adm-surface-2 hover:text-adm-text"
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
      className={`inline-block px-2 py-1 text-[10px] font-bold uppercase tracking-[0.12em] ${TONE[tone].bg} ${TONE[tone].fg}`}
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
    <div className="flex h-2.5 w-full overflow-hidden bg-adm-surface-2">
      {segments.map((s, i) => (
        <div key={i} className={SOLID[s.tone]} style={{ width: `${(s.value / total) * 100}%` }} />
      ))}
    </div>
  );
}
