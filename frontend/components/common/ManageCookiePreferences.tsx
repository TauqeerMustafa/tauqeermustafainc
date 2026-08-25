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
      className="border border-[#e2ded9] bg-white px-5 py-3 text-sm font-semibold text-[#141413] transition hover:bg-[#f3f0ee]"
    >
      Manage cookie preferences
    </button>
  );
}
