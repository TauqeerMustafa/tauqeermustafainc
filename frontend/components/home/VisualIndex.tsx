import Image from "next/image";

import { imageLibrary } from "@/data/media";
import { Section, SectionHeader } from "./ui";

export default function VisualIndex() {
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
        title="A restrained brand system supported by selected real assets."
        description="The site uses the existing company, service, technology, and workspace imagery as editorial support, not as a generic gallery or decorative thumbnail wall."
        align="center"
      />
      <div className="mx-auto mt-14 grid max-w-6xl gap-4 sm:grid-cols-2 lg:grid-cols-[1.2fr_0.8fr_1fr_0.9fr]">
        {selectedImages.map((src, index) => (
          <div
            key={src}
            className={`group relative overflow-hidden rounded-lg border border-[#E7E3D8] bg-[#FBFAF7] shadow-[var(--tm-shadow-sm)] ${index === 0 ? "aspect-[4/5] lg:mt-10" : index === 1 ? "aspect-[1.1]" : index === 2 ? "aspect-[3/4] lg:mt-20" : "aspect-[4/5] lg:mt-4"}`}
          >
            <Image
              src={src}
              alt={`Tauqeer Mustafa Inc. selected visual asset ${index + 1}`}
              fill
              sizes="(min-width:1024px) 24vw, (min-width:640px) 50vw, 100vw"
              className="object-cover transition duration-500 group-hover:scale-[1.035]"
            />
          </div>
        ))}
      </div>
    </Section>
  );
}
