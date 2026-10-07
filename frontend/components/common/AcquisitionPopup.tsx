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

    // 1. Check if the 7-day announcement period is still active
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
        }, 600);
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

  if (!mounted || !isOpen) {
    return null;
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="acquisition-popup-title"
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity animate-in fade-in duration-300"
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Modal Dialog Container */}
      <div className="relative w-full max-w-2xl bg-surface border border-line shadow-2xl rounded-2xl overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-300 my-auto">
        {/* Top Accent Gradient Bar */}
        <div className="h-1.5 w-full bg-gradient-to-r from-red-600 via-rose-500 to-indigo-600" />

        {/* Close Button */}
        <button
          type="button"
          onClick={handleClose}
          aria-label="Close notification"
          className="absolute top-4 right-4 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-surface-2 text-ink-muted hover:text-ink hover:bg-line transition border border-line"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="p-6 sm:p-8">
          {/* Header Badges */}
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-red-500/10 px-3 py-1 text-xs font-semibold text-red-600 border border-red-500/20">
              <Sparkles className="h-3.5 w-3.5" />
              Official Acquisition Announcement
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-surface-2 px-2.5 py-1 text-xs font-mono text-ink-muted border border-line">
              <Calendar className="h-3 w-3" />
              Effective Oct 15, 2026
            </span>
          </div>

          {/* Title */}
          <h2
            id="acquisition-popup-title"
            className="text-2xl sm:text-3xl font-bold tracking-tight text-ink leading-snug"
          >
            Tauqeer Mustafa Inc. Acquired by Qorlune LLC
          </h2>

          <p className="mt-2 text-sm sm:text-base font-medium text-action">
            Shaping Tomorrow Together • Full Operational Handover
          </p>

          {/* Acquisition Banner Graphic */}
          <div className="mt-5 relative w-full aspect-[16/9] sm:aspect-[2/1] rounded-xl overflow-hidden border border-line bg-black/10">
            <Image
              src="/images/qorlune-acquisition.jpg"
              alt="Qorlune LLC has acquired Tauqeer Mustafa Inc. - Effective October 15, 2026"
              fill
              sizes="(max-width: 768px) 100vw, 672px"
              className="object-cover"
              priority
            />
          </div>

          {/* Official Statement Body */}
          <div className="mt-5 space-y-3 text-sm sm:text-base leading-relaxed text-ink-muted border-l-2 border-red-500/40 pl-4 py-1 bg-surface-2/40 rounded-r-lg">
            <p className="text-ink font-medium">
              Qorlune LLC has acquired Tauqeer Mustafa Inc., with the complete transfer of ownership and operations effective <strong>October 15, 2026</strong>.
            </p>
            <p>
              From that date, founder Tauqeer Mustafa will step back and hand over full operations to their executive team. We extend our heartfelt gratitude to every client, partner, and team member who has supported this journey since 2023.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-line">
            <div className="flex items-center gap-2 text-xs text-ink-muted">
              <Building2 className="h-4 w-4 text-ink-muted" />
              <span>Tauqeer Mustafa Inc. &rarr; Qorlune LLC</span>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={handleClose}
                className="w-full sm:w-auto px-6 py-2.5 rounded-full bg-ink text-canvas font-semibold text-sm hover:opacity-90 transition shadow-sm flex items-center justify-center gap-2"
              >
                <span>Acknowledge & Continue</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
