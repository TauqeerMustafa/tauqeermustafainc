"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";

const CONSENT_KEY = "tmi_cookie_consent";
const PENDING = Symbol("pending");

type ConsentValue = "accepted" | "rejected";

const listeners = new Set<() => void>();
const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};
const readConsent = () => window.localStorage.getItem(CONSENT_KEY);
// Server (and React's first client hydration pass) can't see localStorage,
// so it reports a distinct "pending" sentinel — never treated as "no consent
// stored" — instead of reading real state and risking a hydration mismatch.
const readConsentOnServer = () => PENDING as unknown as string | null;

export default function CookieConsent() {
  const consent = useSyncExternalStore(subscribe, readConsent, readConsentOnServer);
  const visible = consent === null;

  function setConsent(value: ConsentValue) {
    window.localStorage.setItem(CONSENT_KEY, value);
    window.dispatchEvent(new CustomEvent("tmi:cookie-consent", { detail: value }));
    listeners.forEach((listener) => listener());
  }

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label="Cookie consent"
      className="fixed inset-x-0 bottom-0 z-[100] border-t border-line bg-surface px-4 py-4 shadow-[0_-8px_30px_rgba(17,24,39,0.08)] sm:px-6"
    >
      <div className="mx-auto flex max-w-6xl flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm leading-6 text-ink">
          We use essential cookies to run this site and optional cookies to understand how it&apos;s used.
          Read our{" "}
          <Link href="/cookies" className="font-semibold text-ink underline underline-offset-2">
            Cookie Policy
          </Link>{" "}
          to learn more.
        </p>
        <div className="flex w-full shrink-0 gap-3 sm:w-auto">
          <button
            type="button"
            onClick={() => setConsent("rejected")}
            className="flex-1 border border-line px-4 py-2.5 text-sm font-semibold text-ink transition hover:bg-canvas sm:flex-none"
          >
            Reject non-essential
          </button>
          <button
            type="button"
            onClick={() => setConsent("accepted")}
            className="flex-1 bg-ink px-4 py-2.5 text-sm font-semibold text-canvas transition hover:bg-action sm:flex-none"
          >
            Accept all
          </button>
        </div>
      </div>
    </div>
  );
}
