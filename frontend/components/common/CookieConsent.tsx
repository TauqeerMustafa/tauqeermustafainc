"use client";

import Link from "next/link";
import { useState } from "react";

const CONSENT_KEY = "tmi_cookie_consent";

type ConsentValue = "accepted" | "rejected";

export default function CookieConsent() {
  const [visible, setVisible] = useState(() => {
    if (typeof window === "undefined") return false;
    const stored = window.localStorage.getItem(CONSENT_KEY);
    return !stored;
  });

  function setConsent(value: ConsentValue) {
    window.localStorage.setItem(CONSENT_KEY, value);
    window.dispatchEvent(new CustomEvent("tmi:cookie-consent", { detail: value }));
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label="Cookie consent"
      className="fixed inset-x-0 bottom-0 z-[100] border-t border-[#E5E5E5] bg-white px-4 py-4 shadow-[0_-8px_30px_rgba(17,24,39,0.08)] sm:px-6"
    >
      <div className="mx-auto flex max-w-6xl flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm leading-6 text-[#171717]">
          We use essential cookies to run this site and optional cookies to understand how it&apos;s used.
          Read our{" "}
          <Link href="/cookies" className="font-semibold text-[#262626] underline underline-offset-2">
            Cookie Policy
          </Link>{" "}
          to learn more.
        </p>
        <div className="flex w-full shrink-0 gap-3 sm:w-auto">
          <button
            type="button"
            onClick={() => setConsent("rejected")}
            className="flex-1 border border-[#E5E5E5] px-4 py-2.5 text-sm font-semibold text-[#0A0A0A] transition hover:bg-[#F4F4F4] sm:flex-none"
          >
            Reject non-essential
          </button>
          <button
            type="button"
            onClick={() => setConsent("accepted")}
            className="flex-1 bg-[#0A0A0A] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#262626] sm:flex-none"
          >
            Accept all
          </button>
        </div>
      </div>
    </div>
  );
}
