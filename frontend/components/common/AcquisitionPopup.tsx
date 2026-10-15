"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { X, Sparkles, ArrowRight, Building2, Clock } from "lucide-react";

const STORAGE_SEEN_KEY = "qorlune_takeover_12am_notification";

export default function AcquisitionPopup() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Show on main landing and key entry points
  const isTargetPage = pathname === "/" || pathname === "/about" || pathname === "/contact";

  useEffect(() => {
    if (!isTargetPage) {
      setIsOpen(false);
      return;
    }

    setMounted(true);

    try {
      const alreadySeen =
        sessionStorage.getItem(STORAGE_SEEN_KEY) ||
        localStorage.getItem(STORAGE_SEEN_KEY);
      if (alreadySeen) {
        return;
      }

      // Smooth entrance after page paints
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 400);
      return () => clearTimeout(timer);
    } catch {
      setIsOpen(true);
    }
  }, [isTargetPage]);

  const handleClose = () => {
    setIsOpen(false);
    try {
      sessionStorage.setItem(STORAGE_SEEN_KEY, "true");
      localStorage.setItem(STORAGE_SEEN_KEY, "true");
    } catch {
      // Ignore
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        handleClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  if (!isTargetPage || !mounted || !isOpen) {
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
        Official Notification: Qorlune Takes Over at 12:00 AM
      </h2>

      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity animate-in fade-in duration-300"
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Modal Dialog Container */}
      <div className="relative w-full max-w-md sm:max-w-lg max-h-[94vh] flex flex-col bg-surface border border-line shadow-2xl rounded-2xl overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-300 my-auto">
        {/* Top Brand Stripe */}
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
              Takeover Notification
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-surface px-2 py-0.5 text-[11px] font-mono text-ink-muted border border-line">
              <Clock className="h-3 w-3 text-action" />
              Takes Over at 12:00 AM
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

        {/* Poster Centerpiece */}
        <div className="flex-1 min-h-0 p-3 sm:p-4 bg-canvas/30 flex flex-col items-center justify-center overflow-hidden">
          <div className="relative aspect-square w-full max-w-[min(380px,46vh)] rounded-xl overflow-hidden border border-line shadow-md bg-surface">
            <Image
              src="/images/qorlune-acquisition.jpg"
              alt="Qorlune Takes Over at 12:00 AM - Official Operations Handover"
              fill
              sizes="(max-width: 640px) 90vw, 380px"
              className="object-contain"
              priority
            />
          </div>

          <div className="mt-3 text-center px-2">
            <h3 className="text-base sm:text-lg font-bold text-ink">
              Qorlune Takes Over at 12:00 AM
            </h3>
            <p className="mt-1 text-xs sm:text-sm text-ink-muted leading-relaxed">
              Official Handover: Full operational and infrastructure transition effective 12:00 AM. All active contracts, platforms, and client workspaces continue uninterrupted.
            </p>
          </div>
        </div>

        {/* Footer Action Bar */}
        <div className="px-4 py-2.5 sm:px-5 sm:py-3 border-t border-line bg-surface flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-1.5 text-xs text-ink-muted">
            <Building2 className="h-3.5 w-3.5 text-action" />
            <span className="hidden sm:inline font-medium text-ink">Transition to Qorlune LLC</span>
            <span className="sm:hidden font-mono text-[11px]">12:00 AM Handover</span>
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

        {/* Bottom Brand Stripe */}
        <div className="flex h-1.5 w-full shrink-0" aria-hidden="true">
          <div className="w-1/3 bg-[#0066b1]" />
          <div className="w-1/3 bg-[#1c69d4]" />
          <div className="w-1/3 bg-[#e22718]" />
        </div>
      </div>
    </div>
  );
}
