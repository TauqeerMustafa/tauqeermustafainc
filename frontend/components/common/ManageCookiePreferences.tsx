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
      className="border border-[#E5E5E5] bg-white px-5 py-3 text-sm font-semibold text-[#0A0A0A] transition hover:bg-[#F4F4F4]"
    >
      Manage cookie preferences
    </button>
  );
}
