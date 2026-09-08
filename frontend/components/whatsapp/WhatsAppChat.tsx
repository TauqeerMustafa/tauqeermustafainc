"use client";

import { useEffect, useRef, useState } from "react";
import { FaWhatsapp } from "react-icons/fa6";
import { X } from "lucide-react";

import { company } from "@/data/company";

const WA_GREEN = "#25D366";

/**
 * Floating WhatsApp chat widget — a bottom-right FAB that expands into a small
 * greeting card with a single CTA that opens WhatsApp (company.whatsapp).
 * Client component: manages open/close, closes on Escape and outside click.
 */
export default function WhatsAppChat() {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    function onPointerDown(e: PointerEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [open]);

  return (
    <div
      ref={rootRef}
      className="fixed bottom-5 right-5 z-[90] flex flex-col items-end gap-3 sm:bottom-6 sm:right-6"
    >
      {/* Chat card */}
      {open && (
        <div
          role="dialog"
          aria-label="Chat with us on WhatsApp"
          className="w-[min(20rem,calc(100vw-2.5rem))] origin-bottom-right overflow-hidden rounded-2xl border border-line bg-surface shadow-[0_18px_48px_rgba(17,24,39,0.18)] motion-safe:animate-in motion-safe:fade-in motion-safe:zoom-in-95 motion-safe:duration-150"
        >
          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-3.5" style={{ backgroundColor: WA_GREEN }}>
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/20">
              <FaWhatsapp className="h-6 w-6 text-white" aria-hidden />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[14px] font-semibold leading-tight text-white">{company.shortName} Team</p>
              <p className="text-[12px] leading-tight text-white/85">Typically replies within minutes</p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close chat"
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-white/90 transition hover:bg-white/20"
            >
              <X className="h-4 w-4" aria-hidden />
            </button>
          </div>

          {/* Body */}
          <div className="px-4 py-4">
            <div className="max-w-[85%] rounded-2xl rounded-tl-sm bg-canvas px-3.5 py-2.5">
              <p className="text-[14px] leading-[1.5] text-ink">
                Hi there! 👋 How can we help you today?
              </p>
            </div>

            <a
              href={company.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setOpen(false)}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-full px-4 py-3 text-[14px] font-semibold text-white transition hover:opacity-90"
              style={{ backgroundColor: WA_GREEN }}
            >
              <FaWhatsapp className="h-5 w-5" aria-hidden />
              Start chat
            </a>
          </div>
        </div>
      )}

      {/* Floating action button */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label={open ? "Close WhatsApp chat" : "Chat with us on WhatsApp"}
        className="flex h-14 w-14 items-center justify-center rounded-full text-white shadow-[0_8px_24px_rgba(37,211,102,0.45)] transition hover:scale-105 active:scale-95"
        style={{ backgroundColor: WA_GREEN }}
      >
        {open ? (
          <X className="h-6 w-6" aria-hidden />
        ) : (
          <FaWhatsapp className="h-7 w-7" aria-hidden />
        )}
      </button>
    </div>
  );
}
