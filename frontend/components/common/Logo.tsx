import Image from "next/image";

export function Logo({ size = 32, className }: { size?: number; className?: string }) {
  return (
    <span
      className={`relative flex shrink-0 items-center justify-center overflow-hidden border border-[#D4D4D4] ${className ?? ""}`}
      style={{ width: size, height: size }}
    >
      <Image src="/logo-mark.svg" alt="" fill sizes={`${size}px`} className="object-cover" />
    </span>
  );
}
