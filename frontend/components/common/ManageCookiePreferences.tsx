"use client";

const CONSENT_KEY = "tmi_cookie_consent";

export default function ManageCookiePreferences() {
  return (
    <button
      type="button"
      onClick={() => {
        window.localStorage.removeItem(CONSENT_KEY);
        window.location.reload();
      }}
      className="border border-line bg-white px-5 py-3 text-sm font-semibold text-ink transition hover:bg-surface"
    >
      Manage cookie preferences
    </button>
  );
}
