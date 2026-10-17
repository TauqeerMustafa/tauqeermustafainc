"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useTheme } from "next-themes";

/**
 * SiteBackground — Fixed full-viewport background layer that cycles through
 * real technology photographs (server racks, circuit boards, code editors,
 * data centers, network infrastructure). Adapts overlay intensity and tint
 * for both light and dark themes.
 *
 * Images rotate every 12 seconds with a smooth crossfade.
 */

const BG_IMAGES = [
  "/images/bg/server-rack.jpg",
  "/images/bg/circuit-board.jpg",
  "/images/bg/code-screen.jpg",
  "/images/bg/network-cables.jpg",
  "/images/bg/laptop-code.jpg",
  "/images/bg/data-center.jpg",
];

const INTERVAL_MS = 12_000; // rotate every 12 seconds

export default function SiteBackground() {
  const [current, setCurrent] = useState(0);
  const [loaded, setLoaded] = useState<Record<number, boolean>>({});
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted ? resolvedTheme === "dark" : true;

  // Cycle through images
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % BG_IMAGES.length);
    }, INTERVAL_MS);
    return () => clearInterval(timer);
  }, []);

  // Mark images as loaded for smooth fade-in
  const handleLoad = (index: number) => {
    setLoaded((prev) => ({ ...prev, [index]: true }));
  };

  return (
    <div className="fixed inset-0 -z-50 pointer-events-none" aria-hidden="true">
      {/* All images stacked, only the current one is visible */}
      {BG_IMAGES.map((src, i) => (
        <div
          key={src}
          className="absolute inset-0 transition-opacity duration-[2000ms] ease-in-out"
          style={{ opacity: i === current && loaded[i] ? 1 : 0 }}
        >
          <Image
            src={src}
            alt=""
            fill
            sizes="100vw"
            quality={85}
            priority={i === 0}
            className="object-cover"
            onLoad={() => handleLoad(i)}
          />
        </div>
      ))}

      {/* DARK theme overlay — deep navy tint, heavy vignette, text stays readable */}
      {isDark && (
        <>
          <div className="absolute inset-0 bg-[#040e27]/80" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#040e27]/60 via-[#040e27]/30 to-[#040e27]/90" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#040e27]/50 via-transparent to-[#040e27]/50" />
        </>
      )}

      {/* LIGHT theme overlay — warm cream wash, keeps images subtle behind content */}
      {!isDark && (
        <>
          <div className="absolute inset-0 bg-[#f3f0ee]/85" />
          <div className="absolute inset-0 bg-gradient-to-b from-white/60 via-[#f3f0ee]/40 to-[#f3f0ee]/90" />
        </>
      )}
    </div>
  );
}
