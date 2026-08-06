"use client";

import Image from "next/image";
import { imageLibrary } from "@/data/media";
import { Section, SectionHeader, useScrollReveal } from "./ui";

const offsets = ["lg:mt-12", "", "lg:mt-20", "lg:mt-6"];
const aspects = ["aspect-[4/5]", "aspect-[1.1/1]", "aspect-[3/4]", "aspect-[4/5]"];

export default function VisualIndex() {
  const gridRef = useScrollReveal<HTMLDivElement>();
  const selectedImages = [
    imageLibrary.about[0],
    imageLibrary.services[2],
    imageLibrary.hero[3],
    imageLibrary.backgrounds[0],
  ];

  return (
    <Section className="overflow-hidden bg-white" labelledBy="visual-index-title">
      <SectionHeader
        id="visual-index-title"
        eyebrow="Visual direction"
        title="A restrained brand system supported by real assets."
        description="Real project imagery used as editorial support, not a generic gallery or decorative thumbnail wall."
        align="center"
      />

      <div ref={gridRef} className="sr anim-up mx-auto mt-14 grid max-w-6xl gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {selectedImages.map((src, i) => (
          <div
            key={src}
            className={`img-zoom group relative overflow-hidden border border-[#D7DEE8] shadow-[0_4px_20px_rgba(17,24,39,0.07)] transition-all duration-500 hover:shadow-[0_16px_48px_rgba(11,95,255,0.12)] hover:border-[#0B5FFF]/40 ${aspects[i]} ${offsets[i]} d-${i}`}
          >
            <Image
              src={src}
              alt={`TMI selected visual ${i + 1}`}
              fill
              sizes="(min-width:1024px) 24vw,(min-width:640px) 50vw,100vw"
              className="object-cover"
            />
            {/* Corner accent on hover */}
            <div className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100 bg-gradient-to-br from-[#0B5FFF]/10 to-transparent" aria-hidden />
            <div className="absolute bottom-3 left-3 opacity-0 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0 translate-y-2">
              <span className="border border-white/30 bg-black/40 px-2.5 py-1 font-mono text-[10px] font-semibold text-white backdrop-blur">
                0{i + 1}
              </span>
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}
