"use client";

import { useState } from "react";
import Image from "next/image";

import { MStripe } from "@/components/home/ui";

export type PortraitVariant = "executive" | "studio" | "authentic";

interface VariantInfo {
  label: string;
  src: string;
  description: string;
}

const VARIANTS: Record<PortraitVariant, VariantInfo> = {
  executive: {
    label: "Executive",
    src: "/images/about/founder-executive.jpg",
    description: "Three-quarters corporate executive portrait",
  },
  studio: {
    label: "Studio",
    src: "/images/about/founder-studio.jpg",
    description: "Frontal studio executive portrait",
  },
  authentic: {
    label: "Authentic",
    src: "/images/about/founder-authentic.jpg",
    description: "Color-graded authentic original photograph",
  },
};

export function FounderPortrait({
  src,
  name = "Tauqeer Mustafa",
  role = "Founder & Chief Architect",
  alt,
}: {
  src?: string;
  name?: string;
  role?: string;
  alt?: string;
}) {
  const [activeVariant, setActiveVariant] = useState<PortraitVariant>("executive");
  const [selectedSrc, setSelectedSrc] = useState<string | null>(null);

  const imageSrc = selectedSrc ?? (src || VARIANTS[activeVariant].src);

  return (
    <figure className="relative overflow-hidden border border-white/10 bg-[#070709] transition-all">
      <MStripe width="w-full" className="absolute inset-x-0 top-0 z-20 h-1" />

      {/* Variant Micro-Switcher */}
      <div className="absolute right-3 top-4 z-30 flex items-center border border-white/15 bg-[#070709]/85 p-0.5 backdrop-blur-md">
        {(Object.keys(VARIANTS) as PortraitVariant[]).map((vKey) => {
          const isCurrent = activeVariant === vKey;
          return (
            <button
              key={vKey}
              type="button"
              onClick={() => {
                setActiveVariant(vKey);
                setSelectedSrc(VARIANTS[vKey].src);
              }}
              title={VARIANTS[vKey].description}
              className={`px-2.5 py-1 font-mono text-[9px] font-bold uppercase tracking-[0.14em] transition-colors ${
                isCurrent
                  ? "bg-action text-white"
                  : "text-white/60 hover:text-white hover:bg-white/5"
              }`}
            >
              {VARIANTS[vKey].label}
            </button>
          );
        })}
      </div>

      <div className="relative aspect-[3/4] sm:aspect-[4/5] overflow-hidden bg-[#070709]">
        <Image
          key={imageSrc}
          src={imageSrc}
          alt={alt ?? `${name}, ${role} of Tauqeer Mustafa Inc.`}
          fill
          sizes="(max-width: 1024px) 100vw, 45vw"
          priority
          className="object-cover transition-opacity duration-300"
        />

        {/* Bottom veil — dissolves smoothly into the caption */}
        <div
          className="pointer-events-none absolute inset-0"
          aria-hidden
          style={{
            background:
              "linear-gradient(to top, rgba(7,7,9,0.96) 0%, rgba(7,7,9,0.70) 24%, rgba(7,7,9,0.2) 52%, transparent 72%)",
          }}
        />
      </div>

      <figcaption className="absolute inset-x-0 bottom-0 z-10 p-6 sm:p-7">
        <div className="flex items-center gap-2 mb-2">
          <span className="h-1.5 w-1.5 bg-action" />
          <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-action">
            Leadership // Enterprise
          </span>
        </div>
        <p className="text-[22px] font-bold uppercase leading-[1.1] tracking-[-0.01em] text-white sm:text-2xl">
          {name}
        </p>
        <p className="mt-1 font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-white/70">
          {role}
        </p>
      </figcaption>
    </figure>
  );
}
