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
      className="border border-[#D7DEE8] bg-white px-5 py-3 text-sm font-semibold text-[#0A1628] transition hover:bg-[#F4F4F2]"
    >
      Manage cookie preferences
    </button>
  );
}
