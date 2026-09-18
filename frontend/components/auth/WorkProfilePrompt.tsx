"use client";

import { useEffect, useState } from "react";
import {
  Briefcase,
  CheckCircle2,
  ExternalLink,
  Laptop,
  ShieldCheck,
  Smartphone,
  Sparkles,
  X,
  Layers,
  HelpCircle,
  Copy,
  Check,
} from "lucide-react";

import { useAuthContext } from "@/providers/auth-provider";
import { useCurrentUser } from "@/hooks/useAuth";

export default function WorkProfilePrompt() {
  const { isAuthenticated } = useAuthContext();
  const { data: userData } = useCurrentUser(isAuthenticated);
  const user = userData?.data;
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"android" | "chrome" | "guide">("android");
  const [isAndroidApp, setIsAndroidApp] = useState(false);
  const [isAndroidDevice, setIsAndroidDevice] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Detect environment
    const ua = navigator.userAgent || "";
    const isAndroid = /Android/i.test(ua);
    const hasBridge = Boolean((window as any).TMIAndroidBridge?.isAndroidApp?.());
    const isChromeBrowser = /Chrome/i.test(ua) && !/Edge|Edg|OPR/i.test(ua);

    setIsAndroidDevice(isAndroid);
    setIsAndroidApp(hasBridge);

    if (isAndroid) {
      setActiveTab("android");
    } else if (isChromeBrowser) {
      setActiveTab("chrome");
    }

    // Check storage flags
    const completed = localStorage.getItem("tmi_work_profile_status") === "completed";
    const dismissedThisSession = sessionStorage.getItem("tmi_work_profile_dismissed") === "true";
    const justLoggedIn = sessionStorage.getItem("tmi_just_logged_in") === "true";

    // Auto-prompt if authenticated and not completed
    if (isAuthenticated && !completed) {
      if (justLoggedIn || !dismissedThisSession) {
        // Slight delay for smooth initial page load
        const timer = setTimeout(() => {
          setIsOpen(true);
          sessionStorage.removeItem("tmi_just_logged_in");
        }, 1200);
        return () => clearTimeout(timer);
      }
    }

    // Allow manual trigger via custom event
    const handleOpen = () => setIsOpen(true);
    window.addEventListener("tmi:open-work-profile-prompt", handleOpen);
    return () => window.removeEventListener("tmi:open-work-profile-prompt", handleOpen);
  }, [isAuthenticated]);

  const handleDismiss = () => {
    sessionStorage.setItem("tmi_work_profile_dismissed", "true");
    setIsOpen(false);
  };

  const handleMarkCompleted = () => {
    localStorage.setItem("tmi_work_profile_status", "completed");
    setIsOpen(false);
  };

  const handleTriggerAndroidBridge = () => {
    if (typeof window === "undefined") return;
    const bridge = (window as any).TMIAndroidBridge;
    if (bridge && typeof bridge.triggerWorkProfileProvisioning === "function") {
      bridge.triggerWorkProfileProvisioning();
    } else {
      // Fallback: Open Android System Account Intent
      window.location.href =
        "intent:#Intent;action=android.settings.ADD_ACCOUNT_SETTINGS;S.account_types=com.google;end";
    }
  };

  const handleCopyEmail = () => {
    if (user?.email) {
      navigator.clipboard.writeText(user.email);
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 2000);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="work-profile-title"
    >
      <div className="relative w-full max-w-2xl overflow-hidden rounded-none border border-adm-border-2 bg-adm-surface shadow-2xl">
        {/* Brand M-Stripe rail */}
        <div className="m-stripe" aria-hidden="true" />

        {/* Modal Header */}
        <div className="flex items-start justify-between border-b border-adm-border bg-adm-surface-2 p-5 sm:p-6">
          <div className="flex items-center gap-3.5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center border border-adm-border bg-adm-surface text-adm-blue">
              <Briefcase className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-adm-blue">
                  Corporate Workspace Security
                </span>
                <span className="rounded-full bg-adm-blue/10 px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-wider text-adm-blue">
                  Zero Trust
                </span>
              </div>
              <h2
                id="work-profile-title"
                className="mt-0.5 text-lg font-bold tracking-tight text-adm-text sm:text-xl"
              >
                Activate Your Corporate Work Profile
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={handleDismiss}
            aria-label="Dismiss modal"
            className="flex h-8 w-8 items-center justify-center rounded-full border border-adm-border text-adm-text-3 transition hover:border-adm-border-2 hover:bg-adm-surface hover:text-adm-text"
          >
            <X size={16} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6">
          <p className="text-xs leading-relaxed text-adm-text-2 sm:text-sm">
            You are authenticated with <strong className="text-adm-text">{user?.email || "your company email"}</strong>.
            Activating a dedicated <strong>Work Profile</strong> automatically separates company
            data, mailboxes, and internal documents from your personal device data.
          </p>

          {/* OS Switcher Navigation */}
          <div className="mt-5 flex border-b border-adm-border">
            <button
              type="button"
              onClick={() => setActiveTab("android")}
              className={`flex items-center gap-2 border-b-2 px-4 py-2.5 font-mono text-xs font-bold uppercase tracking-wider transition ${
                activeTab === "android"
                  ? "border-adm-blue text-adm-blue bg-adm-blue/5"
                  : "border-transparent text-adm-text-3 hover:text-adm-text"
              }`}
            >
              <Smartphone className="h-4 w-4" />
              <span>Android Profile</span>
              {isAndroidDevice && (
                <span className="ml-1 rounded-full bg-emerald-500/10 px-1.5 py-0.2 font-mono text-[9px] text-emerald-500">
                  Detected
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("chrome")}
              className={`flex items-center gap-2 border-b-2 px-4 py-2.5 font-mono text-xs font-bold uppercase tracking-wider transition ${
                activeTab === "chrome"
                  ? "border-adm-blue text-adm-blue bg-adm-blue/5"
                  : "border-transparent text-adm-text-3 hover:text-adm-text"
              }`}
            >
              <Laptop className="h-4 w-4" />
              <span>Google Chrome Profile</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("guide")}
              className={`flex items-center gap-2 border-b-2 px-4 py-2.5 font-mono text-xs font-bold uppercase tracking-wider transition ${
                activeTab === "guide"
                  ? "border-adm-blue text-adm-blue bg-adm-blue/5"
                  : "border-transparent text-adm-text-3 hover:text-adm-text"
              }`}
            >
              <HelpCircle className="h-4 w-4" />
              <span>Overview & FAQ</span>
            </button>
          </div>

          {/* Tab 1: Android Work Profile */}
          {activeTab === "android" && (
            <div className="mt-5 space-y-4">
              <div className="border border-adm-border bg-adm-surface-2 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-wider text-adm-blue">
                    <ShieldCheck className="h-4 w-4" />
                    <span>Android Enterprise (Sandboxed Briefcase 💼)</span>
                  </div>
                  <span className="font-mono text-[10px] text-adm-text-3">Android 5.0+</span>
                </div>
                <p className="mt-2 text-xs text-adm-text-2 leading-relaxed">
                  Creates an isolated OS profile on your phone badged with a briefcase icon.
                  Company apps and documents run safely in this container. The company
                  <strong> cannot</strong> see your personal apps, photos, or personal messages.
                </p>
              </div>

              {/* Action Trigger Box */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border border-adm-blue/30 bg-adm-blue/5 p-4">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wide text-adm-text">
                    1-Tap Device Setup
                  </h4>
                  <p className="text-[11px] text-adm-text-3">
                    {isAndroidApp
                      ? "Connected to native TMI Android Bridge."
                      : "Triggers Android's native Account / Device Policy Wizard."}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleTriggerAndroidBridge}
                    className="inline-flex items-center justify-center gap-2 bg-adm-blue px-4 py-2.5 font-mono text-xs font-bold uppercase tracking-wider text-white transition hover:bg-adm-blue-hover shrink-0"
                  >
                    <Smartphone className="h-4 w-4" />
                    <span>Launch Work Setup</span>
                  </button>
                  <a
                    href="/downloads/TMI-Portals.apk"
                    download="TMI-Portals.apk"
                    className="inline-flex items-center justify-center gap-1.5 border border-adm-border bg-adm-surface px-3 py-2.5 font-mono text-xs font-bold uppercase tracking-wider text-adm-text transition hover:border-adm-blue hover:text-adm-blue shrink-0"
                    title="Download Native APK"
                  >
                    <span>Get APK</span>
                  </a>
                </div>
              </div>

              {/* Step by Step Breakdown */}
              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3 pt-2">
                <div className="border border-adm-border p-3 bg-adm-surface">
                  <span className="font-mono text-[10px] font-bold text-adm-blue">STEP 01</span>
                  <p className="mt-1 text-xs font-semibold text-adm-text">Open Device Accounts</p>
                  <p className="mt-0.5 text-[11px] text-adm-text-3 leading-snug">
                    Open Android <strong>Settings → Accounts → Add Account → Google</strong>.
                  </p>
                </div>
                <div className="border border-adm-border p-3 bg-adm-surface">
                  <span className="font-mono text-[10px] font-bold text-adm-blue">STEP 02</span>
                  <p className="mt-1 text-xs font-semibold text-adm-text">Enter Work Credentials</p>
                  <p className="mt-0.5 text-[11px] text-adm-text-3 leading-snug">
                    Sign in with <span className="font-mono text-adm-blue">{user?.email || "@tauqeermustafa.tech"}</span>.
                  </p>
                </div>
                <div className="border border-adm-border p-3 bg-adm-surface">
                  <span className="font-mono text-[10px] font-bold text-adm-blue">STEP 03</span>
                  <p className="mt-1 text-xs font-semibold text-adm-text">Accept Work Profile</p>
                  <p className="mt-0.5 text-[11px] text-adm-text-3 leading-snug">
                    Android provisions the sandboxed 💼 Work Profile automatically.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Chrome Work Profile */}
          {activeTab === "chrome" && (
            <div className="mt-5 space-y-4">
              <div className="border border-adm-border bg-adm-surface-2 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-wider text-adm-blue">
                    <Laptop className="h-4 w-4" />
                    <span>Google Chrome Enterprise Profile</span>
                  </div>
                  <span className="font-mono text-[10px] text-adm-text-3">Windows • Mac • Linux</span>
                </div>
                <p className="mt-2 text-xs text-adm-text-2 leading-relaxed">
                  Signing into Google Chrome with your company account creates a dedicated Chrome Work Profile.
                  This ensures your corporate tabs, bookmarks, extensions, and open.email sessions remain
                  completely separated from personal browsing.
                </p>
              </div>

              {/* Copyable Email Helper */}
              {user?.email && (
                <div className="flex items-center justify-between border border-adm-border bg-adm-surface p-3">
                  <div className="min-w-0">
                    <span className="block font-mono text-[10px] uppercase text-adm-text-3">
                      Your Corporate Email Address:
                    </span>
                    <span className="truncate font-mono text-xs font-bold text-adm-text">
                      {user.email}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleCopyEmail}
                    className="inline-flex items-center gap-1.5 border border-adm-border bg-adm-surface-2 px-2.5 py-1.5 font-mono text-xs font-bold uppercase tracking-wider text-adm-text transition hover:border-adm-blue hover:text-adm-blue"
                  >
                    {copiedEmail ? (
                      <>
                        <Check size={13} className="text-emerald-500" />
                        <span>Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy size={13} />
                        <span>Copy Email</span>
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* 4-Step Visual Sequence */}
              <div className="space-y-2 border-t border-adm-border pt-3">
                <div className="flex items-start gap-3 text-xs">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-adm-blue font-mono text-[10px] font-bold text-white">
                    1
                  </span>
                  <p className="text-adm-text-2">
                    In the top-right corner of Google Chrome, click your <strong>Profile avatar</strong>.
                  </p>
                </div>

                <div className="flex items-start gap-3 text-xs">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-adm-blue font-mono text-[10px] font-bold text-white">
                    2
                  </span>
                  <p className="text-adm-text-2">
                    At the bottom of the menu, click <strong>+ Add</strong> (or <em>"Set up another profile"</em>).
                  </p>
                </div>

                <div className="flex items-start gap-3 text-xs">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-adm-blue font-mono text-[10px] font-bold text-white">
                    3
                  </span>
                  <p className="text-adm-text-2">
                    Click <strong>Sign in</strong> and enter your <strong className="text-adm-text">{user?.email || "work email"}</strong>.
                  </p>
                </div>

                <div className="flex items-start gap-3 text-xs">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-adm-blue font-mono text-[10px] font-bold text-white">
                    4
                  </span>
                  <p className="text-adm-text-2">
                    When prompted: <em>"You are signing in with a managed account. Create a work profile?"</em>, click <strong>Continue</strong>.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Tab 3: Overview & FAQ */}
          {activeTab === "guide" && (
            <div className="mt-5 space-y-3 text-xs">
              <div className="border border-adm-border p-3.5 bg-adm-surface">
                <h4 className="font-bold text-adm-text">Why does the company require a Work Profile?</h4>
                <p className="mt-1 text-adm-text-2 leading-relaxed">
                  A Work Profile guarantees privacy for both parties: it protects confidential company
                  documents and client contracts while ensuring administrators have zero access to your
                  personal browsing, personal photos, private WhatsApp, or personal emails.
                </p>
              </div>

              <div className="border border-adm-border p-3.5 bg-adm-surface">
                <h4 className="font-bold text-adm-text">Can I turn off the Work Profile outside office hours?</h4>
                <p className="mt-1 text-adm-text-2 leading-relaxed">
                  Yes! On Android, you can toggle the Work Profile switch in quick settings (or the app drawer)
                  to turn off all work notifications, emails, and sync when your shift concludes.
                </p>
              </div>

              <div className="border border-adm-border p-3.5 bg-adm-surface">
                <h4 className="font-bold text-adm-text">Does this change how I receive email?</h4>
                <p className="mt-1 text-adm-text-2 leading-relaxed">
                  No. All email routing remains hosted on the company's secure <strong>open.email</strong> infrastructure.
                  The Work Profile simply configures the secure identity boundary on your device.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-3 border-t border-adm-border bg-adm-surface-2 p-4 sm:px-6">
          <button
            type="button"
            onClick={handleDismiss}
            className="font-mono text-xs font-semibold uppercase tracking-wider text-adm-text-3 transition hover:text-adm-text"
          >
            Remind me next time
          </button>

          <button
            type="button"
            onClick={handleMarkCompleted}
            className="inline-flex items-center justify-center gap-2 bg-adm-blue px-5 py-2.5 font-mono text-xs font-bold uppercase tracking-wider text-white transition hover:bg-adm-blue-hover"
          >
            <CheckCircle2 size={15} />
            <span>I Have Set Up My Work Profile</span>
          </button>
        </div>
      </div>
    </div>
  );
}
