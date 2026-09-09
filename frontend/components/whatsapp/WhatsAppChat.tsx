"use client";

import { useEffect, useRef, useState } from "react";
import { FaWhatsapp } from "react-icons/fa6";
import { X, Briefcase, LifeBuoy, ArrowRight } from "lucide-react";

import { company } from "@/data/company";

const WA_GREEN = "#25D366";

/**
 * Floating WhatsApp chat widget — provides completely separate direct access
 * to General Inquiries & Sales and Client & Technical Support.
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
          className="w-[min(22rem,calc(100vw-2.5rem))] origin-bottom-right overflow-hidden rounded-2xl border border-line bg-surface shadow-[0_18px_48px_rgba(17,24,39,0.18)] motion-safe:animate-in motion-safe:fade-in motion-safe:zoom-in-95 motion-safe:duration-150"
        >
          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-3.5" style={{ backgroundColor: WA_GREEN }}>
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/20">
              <FaWhatsapp className="h-6 w-6 text-white" aria-hidden />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[14px] font-semibold leading-tight text-white">{company.shortName} WhatsApp Hub</p>
              <p className="text-[12px] leading-tight text-white/85">Select department to continue</p>
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

          {/* Body: Two completely separate channels */}
          <div className="p-4 space-y-2.5">
            {/* General Inquiries & Sales */}
            <a
              href={company.whatsappChannels.general.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setOpen(false)}
              className="group block rounded-xl border border-line bg-surface p-3 transition hover:border-[#0066b1] hover:bg-surface-2"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#0066b1]/10 text-[#0066b1]">
                    <Briefcase className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <span className="text-[13px] font-bold text-ink group-hover:text-[#0066b1] transition">
                      General & Sales
                    </span>
                    <span className="ml-1.5 rounded-full bg-[#0066b1]/10 px-1.5 py-0.2 font-mono text-[9px] font-semibold text-[#0066b1]">
                      Info Line
                    </span>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-ink-light transition group-hover:translate-x-0.5 group-hover:text-[#0066b1]" />
              </div>
              <p className="mt-1 text-[11px] leading-relaxed text-ink-light pl-9">
                Quotes, services, partnerships & general business questions
              </p>
            </a>

            {/* Technical & Client Support */}
            <a
              href={company.whatsappChannels.support.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setOpen(false)}
              className="group block rounded-xl border border-line bg-surface p-3 transition hover:border-[#059669] hover:bg-surface-2"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#059669]/10 text-[#059669]">
                    <LifeBuoy className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <span className="text-[13px] font-bold text-ink group-hover:text-[#059669] transition">
                      Client Support
                    </span>
                    <span className="ml-1.5 rounded-full bg-[#059669]/10 px-1.5 py-0.2 font-mono text-[9px] font-semibold text-[#059669]">
                      24/7 Desk
                    </span>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-ink-light transition group-hover:translate-x-0.5 group-hover:text-[#059669]" />
              </div>
              <p className="mt-1 text-[11px] leading-relaxed text-ink-light pl-9">
                Active client helpdesk, bug reports & SLA escalation
              </p>
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
