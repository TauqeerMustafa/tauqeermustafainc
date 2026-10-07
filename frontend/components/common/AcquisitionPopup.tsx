"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { X, Sparkles, ArrowRight, Building2, Calendar } from "lucide-react";

// 7-day period starting October 8, 2026 up to October 15, 2026 23:59:59 (inclusive)
const EXPIRATION_TIMESTAMP = new Date("2026-10-15T23:59:59+05:00").getTime();
const SESSION_DISMISS_KEY = "tmi_acquisition_popup_dismissed_session";

export default function AcquisitionPopup() {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    // 1. Check if the announcement period is still active
    const now = Date.now();
    if (now > EXPIRATION_TIMESTAMP) {
      return;
    }

    // 2. Check if already dismissed in the current browser session
    try {
      const dismissed = sessionStorage.getItem(SESSION_DISMISS_KEY);
      if (!dismissed) {
        // Small delay for smooth entrance after page paints
        const timer = setTimeout(() => {
          setIsOpen(true);
        }, 500);
        return () => clearTimeout(timer);
      }
    } catch {
      // If sessionStorage is unavailable, display by default
      setIsOpen(true);
    }
  }, []);

  // Close and record in session storage
  const handleClose = () => {
    setIsOpen(false);
    try {
      sessionStorage.setItem(SESSION_DISMISS_KEY, "true");
    } catch {
      // Ignore
    }
  };

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        handleClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  // Lock body scroll while popup is active to keep single-page view locked
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  if (!mounted || !isOpen) {
    return null;
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="acquisition-popup-title"
      className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 overflow-hidden"
    >
      {/* Accessible Screen Reader Title */}
      <h2 id="acquisition-popup-title" className="sr-only">
        Tauqeer Mustafa Inc. Acquired by Qorlune LLC Announcement
      </h2>

      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity animate-in fade-in duration-300"
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Modal Dialog Container - strictly fits in single viewport height */}
      <div className="relative w-full max-w-md sm:max-w-lg max-h-[92vh] flex flex-col bg-surface border border-line shadow-2xl rounded-2xl overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-300 my-auto">
        {/* Top 3-Color Brand Stripe (matching header edges: Blue, Mid-Blue, Red) */}
        <div className="flex h-1.5 w-full shrink-0" aria-hidden="true">
          <div className="w-1/3 bg-[#0066b1]" />
          <div className="w-1/3 bg-[#1c69d4]" />
          <div className="w-1/3 bg-[#e22718]" />
        </div>

        {/* Compact Header Bar */}
        <div className="flex items-center justify-between px-4 py-2.5 sm:px-5 sm:py-3 border-b border-line bg-surface-2/40 shrink-0">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-red-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-red-600 dark:text-red-400 border border-red-500/20">
              <Sparkles className="h-3 w-3" />
              Acquisition Announcement
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-surface px-2 py-0.5 text-[11px] font-mono text-ink-muted border border-line">
              <Calendar className="h-3 w-3" />
              Oct 15, 2026
            </span>
          </div>

          <button
            type="button"
            onClick={handleClose}
            aria-label="Close notification"
            className="flex h-7 w-7 items-center justify-center rounded-full bg-surface text-ink-muted hover:text-ink hover:bg-line transition border border-line"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Poster Centerpiece - Uncropped 1:1 Aspect Ratio */}
        <div className="flex-1 min-h-0 p-3 sm:p-4 bg-canvas/30 flex items-center justify-center overflow-hidden">
          <div className="relative aspect-square w-full max-w-[min(420px,52vh)] rounded-xl overflow-hidden border border-line shadow-md bg-surface">
            <Image
              src="/images/qorlune-acquisition.jpg"
              alt="Tauqeer Mustafa Inc. Acquired by Qorlune LLC - Effective October 15, 2026"
              fill
              sizes="(max-width: 640px) 90vw, 420px"
              className="object-contain"
              priority
            />
          </div>
        </div>

        {/* Compact Footer Action Bar */}
        <div className="px-4 py-2.5 sm:px-5 sm:py-3 border-t border-line bg-surface flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-1.5 text-xs text-ink-muted">
            <Building2 className="h-3.5 w-3.5 text-action" />
            <span className="hidden sm:inline font-medium text-ink">Tauqeer Mustafa Inc. &rarr; Qorlune LLC</span>
            <span className="sm:hidden font-mono text-[11px]">Handover Oct 15</span>
          </div>

          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-1.5 sm:px-5 sm:py-2 rounded-full bg-ink text-canvas font-semibold text-xs sm:text-sm hover:opacity-90 transition shadow-sm flex items-center gap-1.5 shrink-0"
          >
            <span>Acknowledge & Continue</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Bottom 3-Color Brand Stripe (matching header edges: Blue, Mid-Blue, Red) */}
        <div className="flex h-1.5 w-full shrink-0" aria-hidden="true">
          <div className="w-1/3 bg-[#0066b1]" />
          <div className="w-1/3 bg-[#1c69d4]" />
          <div className="w-1/3 bg-[#e22718]" />
        </div>
      </div>
    </div>
  );
}
