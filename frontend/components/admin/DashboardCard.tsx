"use client";

import type { LucideIcon } from "lucide-react";
import { TrendingUp } from "lucide-react";

type Props = {
  title: string;
  value: string | number;
  subtitle: string;
  icon: LucideIcon;
  trend?: number; /* percent change, positive = up */
  color?: "blue" | "green" | "amber" | "red";
};

const colorMap = {
  blue:  { bg: "var(--adm-blue-light)",  icon: "var(--adm-blue)",  border: "var(--adm-blue-mid)" },
  green: { bg: "var(--adm-green-light)", icon: "var(--adm-green)", border: "#A7F3D0" },
  amber: { bg: "var(--adm-amber-light)", icon: "var(--adm-amber)", border: "#FDE68A" },
  red:   { bg: "var(--adm-red-light)",   icon: "var(--adm-red)",   border: "#FECACA" },
};

export default function DashboardCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  color = "blue",
}: Props) {
  const c = colorMap[color];

  return (
    <div
      className="adm-card group p-5 cursor-default"
      style={{ animationFillMode: "both" }}
    >
      {/* Top row */}
      <div className="flex items-start justify-between gap-3">
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center border transition-transform duration-300 group-hover:scale-110"
          style={{ background: c.bg, borderColor: c.border, color: c.icon }}
        >
          <Icon size={20} />
        </div>

        {trend !== undefined && (
          <div
            className="flex items-center gap-1 px-2 py-0.5 text-xs font-semibold"
            style={{
              background: trend >= 0 ? "var(--adm-green-light)" : "var(--adm-red-light)",
              color: trend >= 0 ? "var(--adm-green)" : "var(--adm-red)",
            }}
          >
            <TrendingUp
              size={11}
              style={{ transform: trend < 0 ? "scaleY(-1)" : undefined }}
            />
            {Math.abs(trend)}%
          </div>
        )}
      </div>

      {/* Value */}
      <div className="mt-4">
        <p className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: "var(--adm-text-3)" }}>
          {title}
        </p>
        <p
          className="mt-1 text-3xl font-bold tabular-nums tracking-tight adm-stat-value"
          style={{ color: "var(--adm-text)" }}
        >
          {value}
        </p>
      </div>

      {/* Divider + subtitle */}
      <div
        className="mt-4 border-t pt-3"
        style={{ borderColor: "var(--adm-border)" }}
      >
        <p className="text-xs" style={{ color: "var(--adm-text-3)" }}>
          {subtitle}
        </p>
      </div>

      {/* Blue accent line on hover */}
      <div
        className="absolute bottom-0 left-0 h-0.5 w-0 transition-all duration-300 group-hover:w-full"
        style={{ background: c.icon }}
      />
    </div>
  );
}
