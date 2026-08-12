import type { ComponentType } from "react";

import { cx } from "@/components/home/ui";

export function IconFrame({
  icon: Icon,
  size = "md",
  className,
}: {
  icon: ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const sz = { sm: "h-9 w-9", md: "h-11 w-11", lg: "h-14 w-14" }[size];
  const iconSz = { sm: "h-4 w-4", md: "h-5 w-5", lg: "h-6 w-6" }[size];

  return (
    <div
      className={cx(
        "flex shrink-0 items-center justify-center border border-[#D4D4D4] bg-[#FAFAFA] text-[#171717] transition-all duration-300 group-hover:scale-110 group-hover:border-[#0A0A0A] group-hover:bg-[#0A0A0A] group-hover:text-white",
        sz,
        className
      )}
    >
      <Icon className={iconSz} aria-hidden />
    </div>
  );
}
