"use client";

import { useState, useEffect, useCallback } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Download,
  Maximize2,
  Minimize2,
  Copy,
  Check,
  FilePresentation,
  Shield,
  Layers,
  Sparkles,
} from "lucide-react";
import { profileSlides, type ProfileSlide } from "@/data/company-profile";
import { generatePptxDeck } from "@/lib/profile-exports/generatePptx";

interface SlideDeckViewerProps {
  onExportPptx?: () => void;
}

export default function SlideDeckViewer({ onExportPptx }: SlideDeckViewerProps) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const currentSlide: ProfileSlide = profileSlides[currentIdx];

  const handleNext = useCallback(() => {
    setCurrentIdx((prev) => (prev < profileSlides.length - 1 ? prev + 1 : 0));
  }, []);

  const handlePrev = useCallback(() => {
    setCurrentIdx((prev) => (prev > 0 ? prev - 1 : profileSlides.length - 1));
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " ") {
        handleNext();
      } else if (e.key === "ArrowLeft") {
        handlePrev();
      } else if (e.key === "Escape" && isFullscreen) {
        setIsFullscreen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleNext, handlePrev, isFullscreen]);

  const handleCopySlideText = () => {
    const text = `[Slide ${currentSlide.slideNumber}] ${currentSlide.title}\n${currentSlide.subtitle}\n\n${currentSlide.bullets.join("\n")}\n\nHighlights:\n${currentSlide.keyHighlights.map((h) => `${h.label}: ${h.value}`).join("\n")}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadPptx = async () => {
    try {
      setIsExporting(true);
      await generatePptxDeck();
    } catch (err) {
      console.error("Failed to export PPTX:", err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div
      className={`flex flex-col border border-adm-border bg-adm-surface transition-all ${
        isFullscreen
          ? "fixed inset-0 z-[100] h-screen w-screen p-6 backdrop-blur-xl"
          : "rounded-none p-4 sm:p-6"
      }`}
    >
      {/* Top Controls Bar */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-adm-border pb-4">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center bg-adm-blue text-white text-xs font-bold">
            {currentSlide.slideNumber}
          </span>
          <div>
            <span className="font-mono text-xs font-semibold uppercase tracking-wider text-adm-blue">
              {currentSlide.category}
            </span>
            <span className="ms-2 text-xs text-adm-text-3">
              ({currentIdx + 1} of {profileSlides.length})
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopySlideText}
            className="btn-press flex items-center gap-1.5 border border-adm-border bg-adm-surface-2 px-3 py-1.5 text-xs font-medium text-adm-text transition hover:border-adm-blue hover:text-adm-blue"
            title="Copy current slide text"
          >
            {copied ? <Check size={14} className="text-green-600" /> : <Copy size={14} />}
            <span>{copied ? "Copied" : "Copy Slide"}</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadPptx}
            disabled={isExporting}
            className="btn-press flex items-center gap-1.5 bg-adm-blue px-3.5 py-1.5 text-xs font-bold text-white transition hover:opacity-90 disabled:opacity-50"
            title="Download full 10-slide PowerPoint presentation"
          >
            <Download size={14} />
            <span>{isExporting ? "Generating PPTX..." : "Download PPTX Deck"}</span>
          </button>

          <button
            type="button"
            onClick={() => setIsFullscreen((prev) => !prev)}
            className="flex h-8 w-8 items-center justify-center border border-adm-border bg-adm-surface-2 text-adm-text-2 transition hover:text-adm-text"
            title={isFullscreen ? "Exit Fullscreen (Esc)" : "Fullscreen Presenter"}
          >
            {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </button>
        </div>
      </div>

      {/* Main Slide Canvas */}
      <div className="relative flex flex-1 flex-col justify-between overflow-hidden border border-adm-border bg-[#0d1117] p-6 text-white sm:p-10 shadow-2xl min-h-[420px]">
        {/* Decorative Top Accent Rail */}
        <div className="absolute start-0 top-0 h-1.5 w-full bg-gradient-to-r from-blue-600 via-sky-400 to-indigo-600" />

        {/* Slide Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold tracking-widest text-sky-400">
              {currentSlide.category.toUpperCase()}
            </span>
            <span className="text-zinc-600">•</span>
            <span className="font-mono text-xs text-zinc-400">
              SLIDE {currentSlide.slideNumber} / {profileSlides.length}
            </span>
          </div>

          <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
            {currentSlide.title}
          </h2>

          <p className="text-sm font-medium text-zinc-400 sm:text-base">
            {currentSlide.subtitle}
          </p>
        </div>

        {/* Slide Content Body (Grid Layout) */}
        <div className="my-6 grid gap-6 lg:grid-cols-[1.6fr_1fr] items-start">
          {/* Bullets List */}
          <div className="space-y-3 rounded border border-zinc-800/80 bg-zinc-900/60 p-5 backdrop-blur-sm">
            <p className="text-[11px] font-mono font-bold uppercase tracking-wider text-sky-400/90 mb-3 flex items-center gap-1.5">
              <Layers size={13} />
              Core Points & Scope
            </p>
            <ul className="space-y-3 text-sm text-zinc-200">
              {currentSlide.bullets.map((bullet, idx) => (
                <li key={idx} className="flex items-start gap-2.5 leading-relaxed">
                  <span className="mt-1 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-blue-500/20 text-[10px] font-bold text-sky-400">
                    {idx + 1}
                  </span>
                  <span>{bullet}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Key Specs & Highlights Column */}
          <div className="space-y-2.5">
            <p className="text-[11px] font-mono font-bold uppercase tracking-wider text-zinc-400 mb-2 flex items-center gap-1.5">
              <Shield size={13} className="text-blue-400" />
              Verified Highlights
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2.5">
              {currentSlide.keyHighlights.map((hl, idx) => (
                <div
                  key={idx}
                  className="rounded border border-zinc-800 bg-zinc-900/90 p-3 transition hover:border-sky-500/40"
                >
                  <span className="block font-mono text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
                    {hl.label}
                  </span>
                  <span className="mt-0.5 block text-sm font-bold text-white">
                    {hl.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Slide Footer */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-zinc-800 pt-4 text-xs text-zinc-400 font-mono">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-zinc-300">Tauqeer Mustafa Inc.</span>
            <span>•</span>
            <span className="text-sky-400">tauqeermustafa.tech</span>
          </div>
          <div className="text-zinc-500 text-[11px]">
            Use <kbd className="rounded border border-zinc-700 bg-zinc-800 px-1 py-0.5 text-zinc-300">←</kbd> /{" "}
            <kbd className="rounded border border-zinc-700 bg-zinc-800 px-1 py-0.5 text-zinc-300">→</kbd> to navigate
          </div>
        </div>
      </div>

      {/* Navigation Buttons & Thumbnails Rail */}
      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handlePrev}
            className="flex items-center gap-1 border border-adm-border bg-adm-surface-2 px-3 py-2 text-xs font-bold text-adm-text transition hover:bg-adm-blue hover:text-white"
            aria-label="Previous Slide"
          >
            <ChevronLeft size={16} />
            <span>Prev Slide</span>
          </button>

          <button
            type="button"
            onClick={handleNext}
            className="flex items-center gap-1 border border-adm-border bg-adm-surface-2 px-3 py-2 text-xs font-bold text-adm-text transition hover:bg-adm-blue hover:text-white"
            aria-label="Next Slide"
          >
            <span>Next Slide</span>
            <ChevronRight size={16} />
          </button>
        </div>

        {/* Thumbnail Dots / Badges */}
        <div className="flex flex-wrap items-center gap-1 overflow-x-auto py-1">
          {profileSlides.map((slide, idx) => (
            <button
              key={slide.id}
              type="button"
              onClick={() => setCurrentIdx(idx)}
              className={`flex h-7 px-2.5 items-center justify-center font-mono text-[11px] font-bold transition ${
                currentIdx === idx
                  ? "bg-adm-blue text-white shadow"
                  : "border border-adm-border bg-adm-surface-2 text-adm-text-3 hover:bg-adm-surface hover:text-adm-text"
              }`}
              title={`${slide.slideNumber}. ${slide.title}`}
            >
              {slide.slideNumber}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
