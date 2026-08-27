import type { ComponentType } from "react";

import { cn } from "@/lib/utils";

/**
 * Presentational icon badge. Intentionally has no "use client" directive so it
 * can render inside Server Components: the icon renders to SVG on the server,
 * which keeps the tree serializable. Passing a raw icon component to a Client
 * Component would fail, because a component is a function and functions can't
 * cross the server/client boundary.
 */
export function IconFrame({
  icon: Icon,
  size = "md",
  dark = false,
  className,
}: {
  icon: ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  size?: "sm" | "md" | "lg";
  dark?: boolean;
  className?: string;
}) {
  const sz = { sm: "h-9 w-9", md: "h-11 w-11", lg: "h-14 w-14" }[size];
  const iconSz = { sm: "h-4 w-4", md: "h-5 w-5", lg: "h-6 w-6" }[size];

  return (
    <div
      className={cn(
        /* BMW utility frame — rectangular, action blue accent on hover, theme-flipping */
        "flex shrink-0 items-center justify-center transition-colors duration-300",
        dark
          ? "border border-ink/12 bg-ink/[0.05] text-action group-hover:border-action/50 group-hover:bg-action/10"
          : "border border-line-2 bg-surface text-action group-hover:border-action group-hover:bg-action group-hover:text-on-action",
        sz,
        className,
      )}
    >
      <Icon className={iconSz} aria-hidden />
    </div>
  );
}
