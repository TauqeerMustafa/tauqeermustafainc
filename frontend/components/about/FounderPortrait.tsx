import Image from "next/image";

import { MStripe } from "@/components/home/ui";

const FOCAL_X = "50%";
const FOCAL_Y = "47%";

const CANVAS = "#1a2129";

export function FounderPortrait({
  src,
  name = "Tauqeer Mustafa",
  role = "Founder",
  alt,
}: {
  src: string;
  name?: string;
  role?: string;
  alt?: string;
}) {
  return (
    <figure
      className="relative overflow-hidden rounded-[24px]"
      style={{ backgroundColor: CANVAS }}
    >
      <MStripe width="w-full" className="absolute inset-x-0 top-0 z-20 h-1" />

      <div className="relative aspect-[4/5] overflow-hidden">
        <Image
          src={src}
          alt={alt ?? `${name}, ${role} of Tauqeer Mustafa Inc.`}
          fill
          sizes="(max-width: 1024px) 100vw, 45vw"
          className="object-cover"
          style={{
            objectPosition: `${FOCAL_X} ${FOCAL_Y}`,
          }}
          priority
        />

        {/* Subtle bottom scrim — keeps caption readable without obscuring the photo */}
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-32"
          aria-hidden
          style={{
            background: `linear-gradient(to top, rgba(15,20,28,0.92) 0%, rgba(15,20,28,0.5) 45%, transparent 100%)`,
          }}
        />
      </div>

      <figcaption className="absolute inset-x-0 bottom-0 z-10 px-7 pb-7">
        <MStripe width="w-14" />
        <p className="mt-3 text-[22px] font-bold uppercase leading-[1.1] tracking-[-0.01em] text-white">
          {name}
        </p>
        <p className="mt-1.5 font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-[#4d92e8]">
          {role}
        </p>
      </figcaption>
    </figure>
  );
}
