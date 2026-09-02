"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Languages } from "lucide-react";

import { useI18n } from "@/lib/i18n";

/**
 * Language picker for the portal topbar.
 *
 * Round like the theme toggle beside it — the house rule puts icon-only controls
 * on pills and keeps structure square. Each language is listed in its own script
 * so it is legible to the person looking for it.
 */
export default function LanguageSwitcher({ className = "" }: { className?: string }) {
  const { locale, setLocale, locales, t } = useI18n();
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    function onPointerDown(event: MouseEvent) {
      if (!wrapRef.current?.contains(event.target as Node)) setOpen(false);
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div ref={wrapRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-label={t("Language")}
        title={t("Language")}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={`flex h-9 shrink-0 items-center gap-1.5 rounded-full border border-adm-border px-2.5 text-adm-text-2 transition hover:bg-adm-surface-2 hover:text-adm-text ${className}`}
      >
        <Languages size={17} aria-hidden="true" />
        <span className="text-[11px] font-bold uppercase tracking-wider">{locale}</span>
      </button>

      {open && (
        // Square panel on a hairline: it is structure, not a control.
        <div
          role="listbox"
          aria-label={t("Language")}
          className="absolute right-0 top-11 z-50 w-48 border border-adm-border bg-adm-surface py-1 shadow-lg"
        >
          {locales.map((entry) => {
            const active = entry.code === locale;
            return (
              <button
                key={entry.code}
                type="button"
                role="option"
                aria-selected={active}
                dir={entry.dir}
                onClick={() => {
                  setLocale(entry.code);
                  setOpen(false);
                }}
                className="flex w-full items-center justify-between gap-3 px-3 py-2 text-start text-sm transition hover:bg-adm-surface-2"
                style={{ color: active ? "var(--adm-blue)" : "var(--adm-text)" }}
              >
                <span className="flex min-w-0 flex-col">
                  <span className="truncate font-semibold leading-tight">{entry.label}</span>
                  <span
                    className="truncate text-[10px] font-bold uppercase tracking-wider"
                    style={{ color: "var(--adm-text-3)" }}
                  >
                    {entry.english}
                  </span>
                </span>
                {active && <Check size={15} aria-hidden="true" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
