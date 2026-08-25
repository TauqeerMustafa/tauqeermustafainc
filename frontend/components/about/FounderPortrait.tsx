import Image from "next/image";

import { MStripe } from "@/components/home/ui";

/**
 * Founder portrait — BMW M treatment.
 *
 * The source photograph is an on-location shot with a busy background
 * (marquee ceiling, banquet chairs, patterned carpet). Rather than a hard
 * cut-out, the background is dissolved optically: the image is desaturated
 * and contrast-lifted so the pale surroundings flatten out, then a radial
 * vignette and a bottom veil in the canvas colour pull the edges down into
 * the section ground. The suited subject stays high-contrast and reads as
 * the only focal mass.
 *
 * FOCAL_* / ZOOM frame the crop to head-and-torso. They are the only values
 * to touch if the photograph is replaced — everything else is source-agnostic.
 */
const FOCAL_X = "47%";
const FOCAL_Y = "13%";
const ZOOM = "1.55";

/** Canvas colour — must match the surrounding section background. */
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
            transform: `scale(${ZOOM})`,
            transformOrigin: `${FOCAL_X} ${FOCAL_Y}`,
            filter:
              "grayscale(0.45) saturate(0.85) contrast(1.12) brightness(0.93)",
          }}
        />

        {/* Vignette — collapses the venue background into the canvas */}
        <div
          className="pointer-events-none absolute inset-0"
          aria-hidden
          style={{
            background: `radial-gradient(ellipse 64% 54% at ${FOCAL_X} 28%, transparent 0%, transparent 40%, rgba(26,33,41,0.70) 74%, ${CANVAS} 100%)`,
          }}
        />

        {/* Bottom veil — dissolves the floor and seats, seats the caption */}
        <div
          className="pointer-events-none absolute inset-0"
          aria-hidden
          style={{
            background: `linear-gradient(to top, ${CANVAS} 0%, rgba(26,33,41,0.88) 16%, rgba(26,33,41,0.25) 48%, transparent 68%)`,
          }}
        />

        {/* Cool tint — unifies the warm marquee lighting with the BMW palette */}
        <div
          className="pointer-events-none absolute inset-0 mix-blend-color"
          aria-hidden
          style={{ backgroundColor: "rgba(28,105,212,0.14)" }}
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
