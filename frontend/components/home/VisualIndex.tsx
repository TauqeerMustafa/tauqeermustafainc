"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { imageLibrary } from "@/data/media";
import { Section, SectionHeader, stagger, viewportOnce } from "./ui";

const offsets = ["lg:mt-12", "", "lg:mt-20", "lg:mt-6"];
const aspects = ["aspect-[4/5]", "aspect-[1.1/1]", "aspect-[3/4]", "aspect-[4/5]"];

export default function VisualIndex() {
  const selectedImages = [
    imageLibrary.about[1],
    imageLibrary.services[1],
    imageLibrary.hero[1],
    imageLibrary.office[0],
  ];

  return (
    <Section className="overflow-hidden bg-canvas" labelledBy="visual-index-title">
      <SectionHeader
        id="visual-index-title"
        eyebrow="Visual direction"
        title="A restrained brand system supported by real assets."
        description="Real project imagery used as editorial support, not a generic gallery or decorative thumbnail wall."
        align="center"
      />

      <motion.div
        initial="hidden"
        whileInView="show"
        viewport={viewportOnce}
        variants={stagger(0.08)}
        className="mx-auto mt-14 grid max-w-6xl gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        {selectedImages.map((src, i) => (
          <motion.div
            key={src}
            variants={{ hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0 } }}
            className={`img-zoom group relative overflow-hidden border border-line shadow-[0_4px_20px_rgba(0,0,0,0.06)] transition-all duration-500 hover:shadow-[0_16px_48px_rgba(0,0,0,0.12)] hover:border-ink ${aspects[i]} ${offsets[i]}`}
          >
            <Image
              src={src}
              alt={`TMI selected visual ${i + 1}`}
              fill
              sizes="(min-width:1024px) 24vw,(min-width:640px) 50vw,100vw"
              className="object-cover grayscale"
            />
            <div className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100 bg-ink/5" aria-hidden />
            <div className="absolute bottom-3 left-3 opacity-0 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0 translate-y-2">
              {/* Label overlays a photo — keep literal white text for legibility on image */}
              <span className="border border-white/30 bg-black/50 px-2.5 py-1 font-mono text-[10px] font-semibold text-white backdrop-blur">
                0{i + 1}
              </span>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </Section>
  );
}
