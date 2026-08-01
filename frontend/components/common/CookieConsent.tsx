"use client";

import Link from "next/link";
import { useState } from "react";

const CONSENT_KEY = "tmi_cookie_consent";

type ConsentValue = "accepted" | "rejected";

function shouldShowConsent() {
  if (typeof window === "undefined") return false;
  return !window.localStorage.getItem(CONSENT_KEY);
}

export default function CookieConsent() {
  const [visible, setVisible] = useState(shouldShowConsent);

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
      className="fixed inset-x-0 bottom-0 z-[100] border-t border-[#E5E7EB] bg-white px-4 py-4 shadow-[0_-8px_30px_rgba(17,24,39,0.08)] sm:px-6"
    >
      <div className="mx-auto flex max-w-6xl flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm leading-6 text-[#374151]">
          We use essential cookies to run this site and optional cookies to understand how it is used.
          Read our{" "}
          <Link href="/cookies" className="font-semibold text-[#0A46A8] underline underline-offset-2">
            Cookie Policy
          </Link>{" "}
          to learn more.
        </p>
        <div className="flex w-full shrink-0 gap-3 sm:w-auto">
          <button
            type="button"
            onClick={() => setConsent("rejected")}
            className="flex-1 border border-[#D7DEE8] px-4 py-2.5 text-sm font-semibold text-[#0A1628] transition hover:bg-[#F4F4F2] sm:flex-none"
          >
            Reject non-essential
          </button>
          <button
            type="button"
            onClick={() => setConsent("accepted")}
            className="flex-1 bg-[#0A1628] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#1F2937] sm:flex-none"
          >
            Accept all
          </button>
        </div>
      </div>
    </div>
  );
}