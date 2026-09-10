"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Download,
  Smartphone,
  Shield,
  Users,
  BarChart3,
  CheckCircle2,
  Mail,
  Phone,
  ArrowRight,
  ExternalLink,
  Laptop,
  Share2,
  PlusCircle,
  HelpCircle,
  Sparkles,
  Lock,
} from "lucide-react";

export default function AppPortalPage() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showAndroidSteps, setShowAndroidSteps] = useState(false);
  const [showIosSteps, setShowIosSteps] = useState(false);

  useEffect(() => {
    // Check if already in standalone PWA mode
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
    }

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);
    return () => window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
  }, []);

  const handleInstallPWA = async () => {
    if (!deferredPrompt) {
      alert("To install on iOS Safari: Tap the Share button at the bottom, then tap 'Add to Home Screen'.\nOn Chrome/Edge: Click the Install icon in your browser address bar.");
      return;
    }
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setIsInstalled(true);
      setDeferredPrompt(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#07090E] text-[#E2E8F0] selection:bg-blue-600 selection:text-white">
      {/* Background Glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-blue-600/15 blur-[140px] rounded-full" />
        <div className="absolute top-1/2 right-10 w-[400px] h-[400px] bg-emerald-600/10 blur-[120px] rounded-full" />
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-slate-800/80 bg-[#07090E]/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-white shadow-lg shadow-blue-600/30">
              TM
            </div>
            <span className="font-bold text-sm tracking-tight text-white group-hover:text-blue-400 transition">
              Tauqeer Mustafa Inc
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <a
              href="mailto:app@tauqeermustafa.tech"
              className="text-xs font-medium text-slate-400 hover:text-white transition flex items-center gap-1.5"
            >
              <Mail size={14} className="text-blue-400" />
              <span>app@tauqeermustafa.tech</span>
            </a>
            <Link
              href="/portals"
              className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800/60 text-slate-200 hover:bg-slate-700 transition"
            >
              All Portals
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 py-12 sm:py-16 space-y-16">
        {/* Hero */}
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <Sparkles size={13} />
            <span>Official TMI Multi-Portal Application</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
            TMI Portals App
          </h1>

          <p className="text-sm sm:text-base text-slate-400 leading-relaxed">
            One unified mobile & desktop application for <strong className="text-slate-200">Employees</strong>, <strong className="text-slate-200">Admins</strong>, and <strong className="text-slate-200">Managers</strong>. Check in, manage tasks, coordinate delivery, and access operations on the go.
          </p>

          {/* Action Buttons */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-3.5">
            {/* Download APK Button */}
            <a
              href="/downloads/TMI-Portals.apk"
              download
              className="flex items-center gap-2.5 px-6 py-3 rounded-xl font-bold text-sm bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/25 transition transform active:scale-95"
            >
              <Download size={18} />
              <span>Download Android APK</span>
              <span className="text-[11px] bg-emerald-700 px-1.5 py-0.5 rounded font-mono font-normal">.apk</span>
            </a>

            {/* Install Web App Button */}
            <button
              type="button"
              onClick={handleInstallPWA}
              className="flex items-center gap-2 px-5 py-3 rounded-xl font-semibold text-sm border border-slate-700 bg-slate-800/80 hover:bg-slate-800 text-white transition transform active:scale-95"
            >
              <Smartphone size={17} className="text-blue-400" />
              <span>{isInstalled ? "App Installed" : "Install Web App (PWA)"}</span>
            </button>
          </div>

          <p className="text-[11px] text-slate-500 pt-1">
            Compatible with Android 8.0+, iOS 14+, Windows 10/11 & macOS.
          </p>
        </div>

        {/* 3 Dedicated Portal Access Cards */}
        <div>
          <div className="text-center mb-6">
            <h2 className="text-lg font-bold text-white tracking-tight">Direct Portal Access</h2>
            <p className="text-xs text-slate-400">Launch into your assigned operational workspace directly</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Employee Portal Card */}
            <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/60 hover:border-blue-500/40 transition flex flex-col justify-between group">
              <div className="space-y-3">
                <div className="h-12 w-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 group-hover:scale-105 transition">
                  <Users size={24} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-base text-white">Employee Desk</h3>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                      Staff
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    Check-in attendance, submit leave requests, view tasks, access project documents, and message management desks directly.
                  </p>
                </div>
              </div>

              <div className="pt-6">
                <Link
                  href="/employees/dashboard"
                  className="flex items-center justify-between w-full px-4 py-2.5 rounded-xl font-semibold text-xs bg-blue-600 hover:bg-blue-500 text-white transition"
                >
                  <span>Open Employee Desk</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            </div>

            {/* Admin Portal Card */}
            <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/60 hover:border-purple-500/40 transition flex flex-col justify-between group">
              <div className="space-y-3">
                <div className="h-12 w-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 group-hover:scale-105 transition">
                  <Shield size={24} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-base text-white">Admin Desk</h3>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">
                      Executive
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    Company control center: WhatsApp automation manager, staff message box, employee directory, permissions, and billing operations.
                  </p>
                </div>
              </div>

              <div className="pt-6">
                <Link
                  href="/admin/dashboard"
                  className="flex items-center justify-between w-full px-4 py-2.5 rounded-xl font-semibold text-xs bg-purple-600 hover:bg-purple-500 text-white transition"
                >
                  <span>Open Admin Desk</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            </div>

            {/* Management Portal Card */}
            <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/60 hover:border-emerald-500/40 transition flex flex-col justify-between group">
              <div className="space-y-3">
                <div className="h-12 w-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition">
                  <BarChart3 size={24} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-base text-white">Management Desk</h3>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      Leadership
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    Executive overview of team headcount, project delivery milestones, operational objectives, and sales pipeline tracking.
                  </p>
                </div>
              </div>

              <div className="pt-6">
                <Link
                  href="/management/dashboard"
                  className="flex items-center justify-between w-full px-4 py-2.5 rounded-xl font-semibold text-xs bg-emerald-600 hover:bg-emerald-500 text-white transition"
                >
                  <span>Open Management Desk</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Installation Guides Accordions */}
        <div className="p-6 sm:p-8 rounded-2xl border border-slate-800 bg-slate-900/40 space-y-6">
          <div className="flex items-center gap-2.5">
            <HelpCircle size={20} className="text-blue-400" />
            <h2 className="text-lg font-bold text-white tracking-tight">How to Install on Your Device</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Android APK Instructions */}
            <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/70 space-y-3">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                <Smartphone size={16} />
                <span>Android Phone (APK File)</span>
              </div>
              <ol className="text-xs text-slate-300 space-y-2 list-decimal list-inside leading-relaxed">
                <li>Tap <strong className="text-white">Download Android APK</strong> button above.</li>
                <li>When the download completes, tap the file in your notification bar or <strong className="text-white">Downloads</strong> folder.</li>
                <li>Select <strong className="text-white">Install</strong>. If prompted, toggle <strong className="text-white">&ldquo;Allow from this source&rdquo;</strong> in Settings.</li>
                <li>The <strong className="text-white">TMI Portals</strong> icon is now on your home screen!</li>
              </ol>
            </div>

            {/* iOS Safari Instructions */}
            <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/70 space-y-3">
              <div className="flex items-center gap-2 text-blue-400 font-bold text-sm">
                <Share2 size={16} />
                <span>Apple iPhone / iPad (Safari)</span>
              </div>
              <ol className="text-xs text-slate-300 space-y-2 list-decimal list-inside leading-relaxed">
                <li>Open this page in <strong className="text-white">Safari</strong> on your iPhone.</li>
                <li>Tap the <strong className="text-white">Share</strong> button (square with arrow pointing up) at the bottom.</li>
                <li>Scroll down and tap <strong className="text-white">&ldquo;Add to Home Screen&rdquo;</strong>.</li>
                <li>Tap <strong className="text-white">&ldquo;Add&rdquo;</strong> in top-right. Launches standalone with no address bar!</li>
              </ol>
            </div>
          </div>
        </div>

        {/* Support & Contacts Box */}
        <div className="p-6 rounded-2xl border border-blue-500/20 bg-blue-500/5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <h3 className="font-bold text-sm text-white">App Support & Inquiries</h3>
            <p className="text-xs text-slate-400">
              Need assistance setting up or experiencing an issue with your portal app?
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <a
              href="mailto:app@tauqeermustafa.tech"
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white transition shadow-sm"
            >
              <Mail size={14} />
              <span>app@tauqeermustafa.tech</span>
            </a>

            <Link
              href="/support/ticket"
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700 transition"
            >
              <span>Submit Ticket</span>
              <ExternalLink size={13} />
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 py-8 text-center text-xs text-slate-500">
        <p>© {new Date().getFullYear()} Tauqeer Mustafa Inc. All rights reserved.</p>
        <p className="mt-1">Support: <a href="mailto:app@tauqeermustafa.tech" className="text-blue-400 hover:underline">app@tauqeermustafa.tech</a></p>
      </footer>
    </div>
  );
}
