"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Download,
  Smartphone,
  ShieldCheck,
  Users,
  BarChart3,
  CheckCircle2,
  Mail,
  Phone,
  ArrowRight,
  ExternalLink,
  Share2,
  Sparkles,
  Lock,
  WifiOff,
  Check,
  Globe,
  Laptop,
  Copy,
  Layers,
  ChevronRight,
  HardDrive,
  Cpu,
  Fingerprint,
} from "lucide-react";
import { MStripe, Reveal, Section, fadeUp, scaleIn, fadeLeft, fadeRight } from "@/components/home/ui";
import { company } from "@/data/company";

export default function AppPortalView() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [activeInstallTab, setActiveInstallTab] = useState<"android" | "ios" | "desktop">("android");
  const [copiedEmail, setCopiedEmail] = useState(false);

  useEffect(() => {
    // Detect standalone PWA mode
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
      setActiveInstallTab("ios");
      const element = document.getElementById("installation-guide");
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
      return;
    }
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setIsInstalled(true);
      setDeferredPrompt(null);
    }
  };

  const handleCopyEmail = () => {
    navigator.clipboard.writeText("app@tauqeermustafa.tech");
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  return (
    <div className="relative overflow-hidden bg-canvas text-ink">
      {/* ── Top Brand Rail ── */}
      <div className="absolute left-0 right-0 top-0 m-stripe" />

      {/* ── Hero Section ── */}
      <section className="relative px-5 pb-20 pt-20 sm:px-6 sm:pt-28 lg:pt-36" aria-label="TMI Portals App Hero">
        <div className="mx-auto max-w-[1200px]">
          <div className="flex flex-col items-center text-center">
            {/* Eyebrow badge */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="inline-flex items-center gap-2 border border-ink/15 bg-surface px-4 py-1.5 font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-action shadow-sm"
            >
              <Smartphone className="h-3.5 w-3.5" />
              <span>Official TMI Multi-Portal App • APK & PWA</span>
            </motion.div>

            {/* Display Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
              className="mt-6 max-w-5xl text-balance text-[42px] font-bold uppercase leading-[1.08] tracking-[-0.02em] text-ink sm:text-[58px] lg:text-[76px]"
            >
              Workspaces on the go.
              <br />
              Portals in your pocket.
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.18, ease: [0.22, 1, 0.36, 1] }}
              className="mt-6 max-w-3xl text-pretty text-[17px] font-light leading-[1.6] tracking-[-0.01em] text-ink/70 sm:text-[20px]"
            >
              The unified mobile suite for Tauqeer Mustafa Inc. Engineered for Employees, Management,
              and Administrators. Download the direct Android APK or install the universal Progressive Web App with zero friction.
            </motion.p>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.26, ease: [0.22, 1, 0.36, 1] }}
              className="relative z-10 mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
            >
              {/* Primary APK Download */}
              <a
                href="/downloads/TMI-Portals.apk"
                download="TMI-Portals.apk"
                className="inline-flex w-full items-center justify-center gap-2.5 bg-action px-8 py-4 font-mono text-[13px] font-bold uppercase tracking-[0.08em] text-on-action shadow-lg shadow-action/20 transition-all hover:bg-action-strong focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-action sm:w-auto"
              >
                <Download className="h-4 w-4" />
                <span>Download Android APK</span>
              </a>

              {/* Secondary PWA Install */}
              <button
                type="button"
                onClick={handleInstallPWA}
                className="inline-flex w-full items-center justify-center gap-2.5 border-2 border-ink/25 bg-surface px-8 py-4 font-mono text-[13px] font-bold uppercase tracking-[0.08em] text-ink transition-all hover:border-ink/50 hover:bg-ink/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink sm:w-auto"
              >
                <Sparkles className="h-4 w-4 text-action" />
                <span>{isInstalled ? "App Installed ✓" : "Install Web App (PWA)"}</span>
              </button>

              {/* Online Portals Link */}
              <a
                href="https://portals.tauqeermustafa.tech"
                className="inline-flex w-full items-center justify-center gap-2 px-6 py-4 font-mono text-[13px] font-bold uppercase tracking-[0.08em] text-ink/70 transition-colors hover:text-ink sm:w-auto"
              >
                <span>Launch in Browser</span>
                <ArrowRight className="h-4 w-4" />
              </a>
            </motion.div>

            {/* Quick Specs Ledger */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.32, ease: [0.22, 1, 0.36, 1] }}
              className="mt-12 flex flex-wrap items-center justify-center gap-6 border-y border-ink/10 py-4 font-mono text-[11px] uppercase tracking-wider text-ink/60"
            >
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>RELEASE: <strong className="text-ink">v1.0.0 STABLE</strong></span>
              </div>
              <span className="hidden sm:inline text-ink/20">•</span>
              <div className="flex items-center gap-2">
                <Lock className="h-3.5 w-3.5 text-action" />
                <span>ENCRYPTION: <strong className="text-ink">TLS 1.3 / ZERO TRACKERS</strong></span>
              </div>
              <span className="hidden sm:inline text-ink/20">•</span>
              <div className="flex items-center gap-2">
                <Mail className="h-3.5 w-3.5 text-action" />
                <span>SUPPORT: <strong className="text-ink">app@tauqeermustafa.tech</strong></span>
              </div>
            </motion.div>
          </div>

          {/* ── Interactive App Preview Card (BMW Oversized Radius) ── */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.36, ease: [0.22, 1, 0.36, 1] }}
            className="mt-16 sm:mt-20"
          >
            <div className="relative overflow-hidden rounded-[32px] sm:rounded-[40px] border border-ink/15 bg-surface p-6 sm:p-10 shadow-2xl">
              {/* Top M-Stripe inside preview */}
              <div className="m-stripe mb-8" />

              {/* OS Chrome Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-ink/10 pb-6">
                <div className="flex items-center gap-3">
                  <div className="relative h-10 w-10 shrink-0 overflow-hidden border border-ink/15 bg-ink/[0.06]">
                    <Image src="/logo.png" alt="TMI Portals" fill sizes="40px" className="object-cover" />
                  </div>
                  <div>
                    <h3 className="font-mono text-sm font-bold uppercase tracking-wider text-ink">
                      TMI Portals Ecosystem OS
                    </h3>
                    <p className="text-xs text-ink/60">Multi-Role Architecture: Admin • Employees • Management</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 border border-ink/15 bg-ink/[0.04] px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-wider text-action">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    LIVE RUNTIME
                  </span>
                  <span className="inline-flex items-center gap-1.5 border border-ink/15 bg-ink/[0.04] px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-wider text-ink/70">
                    SLA 99.98%
                  </span>
                </div>
              </div>

              {/* Three Portal Quick Cards */}
              <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="border border-ink/10 bg-canvas p-6 transition-all hover:border-action/40">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-action">
                      DESK 01
                    </span>
                    <ShieldCheck className="h-5 w-5 text-action" />
                  </div>
                  <h4 className="mt-3 text-lg font-bold uppercase tracking-tight text-ink">
                    Admin Desk
                  </h4>
                  <p className="mt-1 text-xs text-ink/60 leading-relaxed">
                    WhatsApp CRM dispatch, vault access control, and telemetry audits.
                  </p>
                  <div className="mt-4 pt-3 border-t border-ink/5 flex items-center justify-between text-[11px] font-mono text-action font-semibold uppercase">
                    <span>Role: Superadmin</span>
                    <ArrowRight className="h-3 w-3" />
                  </div>
                </div>

                <div className="border border-ink/10 bg-canvas p-6 transition-all hover:border-action/40">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-action">
                      DESK 02
                    </span>
                    <Users className="h-5 w-5 text-action" />
                  </div>
                  <h4 className="mt-3 text-lg font-bold uppercase tracking-tight text-ink">
                    Employee Desk
                  </h4>
                  <p className="mt-1 text-xs text-ink/60 leading-relaxed">
                    Shift check-ins, document agreement vault, and staff inbox.
                  </p>
                  <div className="mt-4 pt-3 border-t border-ink/5 flex items-center justify-between text-[11px] font-mono text-action font-semibold uppercase">
                    <span>Role: Staff / Engineer</span>
                    <ArrowRight className="h-3 w-3" />
                  </div>
                </div>

                <div className="border border-ink/10 bg-canvas p-6 transition-all hover:border-action/40">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-action">
                      DESK 03
                    </span>
                    <BarChart3 className="h-5 w-5 text-action" />
                  </div>
                  <h4 className="mt-3 text-lg font-bold uppercase tracking-tight text-ink">
                    Management Desk
                  </h4>
                  <p className="mt-1 text-xs text-ink/60 leading-relaxed">
                    Headcount burn rate, payout approvals, and sprint deliverables.
                  </p>
                  <div className="mt-4 pt-3 border-t border-ink/5 flex items-center justify-between text-[11px] font-mono text-action font-semibold uppercase">
                    <span>Role: Director / PM</span>
                    <ArrowRight className="h-3 w-3" />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Section 1: The 3 Dedicated Portal Desks ── */}
      <Section className="bg-surface" labelledBy="portal-desks-heading">
        <div className="flex flex-col items-center text-center">
          <MStripe />
          <p className="mt-6 font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-action">
            Unified Portal Ecosystem
          </p>
          <h2
            id="portal-desks-heading"
            className="mt-3 text-balance text-[32px] font-bold uppercase leading-[1.1] tracking-[-0.02em] text-ink sm:text-[44px] lg:text-[48px]"
          >
            Three Desks. One Mobile Suite.
          </h2>
          <p className="mt-4 max-w-2xl text-pretty text-[17px] font-light leading-[1.6] text-ink/70">
            Every operational role inside Tauqeer Mustafa Inc. is powered by a specialized, mobile-optimized workspace.
          </p>
        </div>

        {/* 3-Column Razor-Sharp Grid */}
        <div className="mt-14 grid grid-cols-1 gap-px border border-ink/10 bg-ink/10 lg:grid-cols-3">
          {/* Card 1: Admin */}
          <div className="group flex flex-col justify-between bg-canvas p-8 transition-colors hover:bg-surface">
            <div>
              <div className="flex items-start justify-between">
                <span className="border border-ink/10 bg-surface p-3 text-ink transition-colors group-hover:border-action group-hover:text-action">
                  <ShieldCheck className="h-7 w-7" />
                </span>
                <span className="border border-action/30 bg-action/[0.08] px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-wider text-action">
                  Root Clearance
                </span>
              </div>

              <p className="mt-6 font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-action">
                DEVSECOPS • EXECUTIVE • SUPERADMIN
              </p>
              <h3 className="mt-2 text-2xl font-bold uppercase tracking-tight text-ink">
                Admin Desk
              </h3>
              <p className="mt-3 text-sm leading-6 text-ink/70">
                Command center for organizational operations, WhatsApp customer inbox dispatch, credential vaults, and root auditing.
              </p>

              <ul className="mt-6 space-y-2.5 text-xs text-ink/80 border-t border-ink/5 pt-6">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-action shrink-0" />
                  <span>Meta WhatsApp Cloud API live triage & bot controls</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-action shrink-0" />
                  <span>Secure vault document management & role provisioning</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-action shrink-0" />
                  <span>Server telemetry, database metrics & security audits</span>
                </li>
              </ul>
            </div>

            <div className="mt-8 pt-6 border-t border-ink/10">
              <a
                href="https://portals.tauqeermustafa.tech/admin/dashboard"
                className="inline-flex w-full items-center justify-between bg-surface px-5 py-3 font-mono text-xs font-bold uppercase tracking-wider text-ink border border-ink/15 transition hover:bg-action hover:text-on-action hover:border-action"
              >
                <span>Launch Admin Desk</span>
                <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Card 2: Employees */}
          <div className="group flex flex-col justify-between bg-canvas p-8 transition-colors hover:bg-surface">
            <div>
              <div className="flex items-start justify-between">
                <span className="border border-ink/10 bg-surface p-3 text-ink transition-colors group-hover:border-action group-hover:text-action">
                  <Users className="h-7 w-7" />
                </span>
                <span className="border border-ink/20 bg-ink/[0.04] px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-wider text-ink/70">
                  Daily Operations
                </span>
              </div>

              <p className="mt-6 font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-action">
                STAFF • CONTRACTORS • SPECIALISTS
              </p>
              <h3 className="mt-2 text-2xl font-bold uppercase tracking-tight text-ink">
                Employee Desk
              </h3>
              <p className="mt-3 text-sm leading-6 text-ink/70">
                Personal daily workspace for team members to manage attendance, review policies, submit requests, and communicate.
              </p>

              <ul className="mt-6 space-y-2.5 text-xs text-ink/80 border-t border-ink/5 pt-6">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-action shrink-0" />
                  <span>Automated shift clock-in, breaks & attendance history</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-action shrink-0" />
                  <span>Document Vault compliance (Agree / Disagree / Request Review)</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-action shrink-0" />
                  <span>Employee messages box & direct notifications dispatch</span>
                </li>
              </ul>
            </div>

            <div className="mt-8 pt-6 border-t border-ink/10">
              <a
                href="https://portals.tauqeermustafa.tech/employees/dashboard"
                className="inline-flex w-full items-center justify-between bg-surface px-5 py-3 font-mono text-xs font-bold uppercase tracking-wider text-ink border border-ink/15 transition hover:bg-action hover:text-on-action hover:border-action"
              >
                <span>Launch Employee Desk</span>
                <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Card 3: Management */}
          <div className="group flex flex-col justify-between bg-canvas p-8 transition-colors hover:bg-surface">
            <div>
              <div className="flex items-start justify-between">
                <span className="border border-ink/10 bg-surface p-3 text-ink transition-colors group-hover:border-action group-hover:text-action">
                  <BarChart3 className="h-7 w-7" />
                </span>
                <span className="border border-ink/20 bg-ink/[0.04] px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-wider text-ink/70">
                  Strategic Oversight
                </span>
              </div>

              <p className="mt-6 font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-action">
                DIRECTORS • TEAM LEADS • PMO
              </p>
              <h3 className="mt-2 text-2xl font-bold uppercase tracking-tight text-ink">
                Management Desk
              </h3>
              <p className="mt-3 text-sm leading-6 text-ink/70">
                Executive cockpit for operational oversight, budget tracking, contractor payout approvals, and sprint deliverable reviews.
              </p>

              <ul className="mt-6 space-y-2.5 text-xs text-ink/80 border-t border-ink/5 pt-6">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-action shrink-0" />
                  <span>Real-time delivery KPIs, velocity & headcount health</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-action shrink-0" />
                  <span>Contractor milestone payouts review & release authorization</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-action shrink-0" />
                  <span>Project burn rate analytics & client satisfaction scores</span>
                </li>
              </ul>
            </div>

            <div className="mt-8 pt-6 border-t border-ink/10">
              <a
                href="https://portals.tauqeermustafa.tech/management/dashboard"
                className="inline-flex w-full items-center justify-between bg-surface px-5 py-3 font-mono text-xs font-bold uppercase tracking-wider text-ink border border-ink/15 transition hover:bg-action hover:text-on-action hover:border-action"
              >
                <span>Launch Management Desk</span>
                <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>
      </Section>

      {/* ── Section 2: Installation Guides & Sideloading ── */}
      <Section id="installation-guide" className="bg-canvas" labelledBy="install-heading">
        <div className="flex flex-col items-center text-center">
          <MStripe />
          <p className="mt-6 font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-action">
            Deployment & Setup
          </p>
          <h2
            id="install-heading"
            className="mt-3 text-balance text-[32px] font-bold uppercase leading-[1.1] tracking-[-0.02em] text-ink sm:text-[44px] lg:text-[48px]"
          >
            Installation Guide
          </h2>
          <p className="mt-4 max-w-2xl text-pretty text-[17px] font-light leading-[1.6] text-ink/70">
            Deploy on Android via native APK, or install universally on iOS, macOS, and Windows via Progressive Web App.
          </p>

          {/* OS Switcher Tabs */}
          <div className="mt-10 inline-flex border border-ink/15 bg-surface p-1">
            <button
              type="button"
              onClick={() => setActiveInstallTab("android")}
              className={`flex items-center gap-2 px-5 py-2.5 font-mono text-xs font-bold uppercase tracking-wider transition ${
                activeInstallTab === "android"
                  ? "bg-action text-on-action shadow"
                  : "text-ink/70 hover:text-ink hover:bg-ink/5"
              }`}
            >
              <Smartphone className="h-4 w-4" />
              <span>Android APK</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveInstallTab("ios")}
              className={`flex items-center gap-2 px-5 py-2.5 font-mono text-xs font-bold uppercase tracking-wider transition ${
                activeInstallTab === "ios"
                  ? "bg-action text-on-action shadow"
                  : "text-ink/70 hover:text-ink hover:bg-ink/5"
              }`}
            >
              <Globe className="h-4 w-4" />
              <span>iOS (Safari PWA)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveInstallTab("desktop")}
              className={`flex items-center gap-2 px-5 py-2.5 font-mono text-xs font-bold uppercase tracking-wider transition ${
                activeInstallTab === "desktop"
                  ? "bg-action text-on-action shadow"
                  : "text-ink/70 hover:text-ink hover:bg-ink/5"
              }`}
            >
              <Laptop className="h-4 w-4" />
              <span>Desktop (PC / Mac)</span>
            </button>
          </div>
        </div>

        {/* Tab Content Box */}
        <div className="mt-12 mx-auto max-w-4xl border border-ink/15 bg-surface p-8 sm:p-12 shadow-xl">
          <AnimatePresence mode="wait">
            {activeInstallTab === "android" && (
              <motion.div
                key="android"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.3 }}
                className="space-y-8"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-ink/10 pb-6">
                  <div>
                    <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-action">
                      Channel: Direct Android Sideload
                    </span>
                    <h3 className="mt-1 text-2xl font-bold uppercase tracking-tight text-ink">
                      Native Android APK (v1.0.0)
                    </h3>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <a
                      href="/downloads/TMI-Portals.apk"
                      download="TMI-Portals.apk"
                      className="inline-flex items-center justify-center gap-2 bg-action px-6 py-3 font-mono text-xs font-bold uppercase tracking-wider text-on-action hover:bg-action-strong transition"
                    >
                      <Download className="h-4 w-4" />
                      <span>Download TMI-Portals.apk (Direct)</span>
                    </a>
                    <a
                      href="https://github.com/TauqeerMustafa/tauqeermustafainc/releases/latest/download/TMI-Portals.apk"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 border border-ink/20 bg-canvas px-4 py-3 font-mono text-xs font-bold uppercase tracking-wider text-ink hover:bg-ink/5 transition"
                    >
                      <span>GitHub Mirror</span>
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                  <div className="border border-ink/10 bg-canvas p-6">
                    <span className="flex h-8 w-8 items-center justify-center bg-action font-mono text-xs font-bold text-on-action">
                      01
                    </span>
                    <h4 className="mt-4 font-bold uppercase text-sm text-ink">Download APK</h4>
                    <p className="mt-2 text-xs leading-relaxed text-ink/70">
                      Tap the download button above to save <code className="bg-ink/5 px-1 py-0.5 rounded text-action">TMI-Portals.apk</code> to your Android device.
                    </p>
                  </div>

                  <div className="border border-ink/10 bg-canvas p-6">
                    <span className="flex h-8 w-8 items-center justify-center bg-action font-mono text-xs font-bold text-on-action">
                      02
                    </span>
                    <h4 className="mt-4 font-bold uppercase text-sm text-ink">Allow Unknown Apps</h4>
                    <p className="mt-2 text-xs leading-relaxed text-ink/70">
                      Tap the downloaded file. If prompted by Android security, allow <strong className="text-ink">"Install unknown apps"</strong> for your browser or Files app.
                    </p>
                  </div>

                  <div className="border border-ink/10 bg-canvas p-6">
                    <span className="flex h-8 w-8 items-center justify-center bg-action font-mono text-xs font-bold text-on-action">
                      03
                    </span>
                    <h4 className="mt-4 font-bold uppercase text-sm text-ink">Launch & Sign In</h4>
                    <p className="mt-2 text-xs leading-relaxed text-ink/70">
                      Tap <strong className="text-ink">"Install"</strong>. Once finished, open TMI Portals directly from your home screen and select your portal desk.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {activeInstallTab === "ios" && (
              <motion.div
                key="ios"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.3 }}
                className="space-y-8"
              >
                <div className="border-b border-ink/10 pb-6">
                  <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-action">
                    Channel: Apple iOS Safari
                  </span>
                  <h3 className="mt-1 text-2xl font-bold uppercase tracking-tight text-ink">
                    Install on iPhone & iPad (PWA)
                  </h3>
                  <p className="mt-1 text-xs text-ink/70">Zero App Store download needed. Runs with full-screen native performance.</p>
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                  <div className="border border-ink/10 bg-canvas p-6">
                    <span className="flex h-8 w-8 items-center justify-center bg-action font-mono text-xs font-bold text-on-action">
                      01
                    </span>
                    <h4 className="mt-4 font-bold uppercase text-sm text-ink">Open in Safari</h4>
                    <p className="mt-2 text-xs leading-relaxed text-ink/70">
                      Ensure you are viewing <code className="bg-ink/5 px-1 py-0.5 rounded text-action">https://app.tauqeermustafa.tech</code> in Apple Safari.
                    </p>
                  </div>

                  <div className="border border-ink/10 bg-canvas p-6">
                    <span className="flex h-8 w-8 items-center justify-center bg-action font-mono text-xs font-bold text-on-action">
                      02
                    </span>
                    <h4 className="mt-4 font-bold uppercase text-sm text-ink">Tap Share Icon</h4>
                    <p className="mt-2 text-xs leading-relaxed text-ink/70">
                      Tap the <strong className="text-ink">Share button</strong> (square icon with an upward arrow) at the bottom toolbar of Safari.
                    </p>
                  </div>

                  <div className="border border-ink/10 bg-canvas p-6">
                    <span className="flex h-8 w-8 items-center justify-center bg-action font-mono text-xs font-bold text-on-action">
                      03
                    </span>
                    <h4 className="mt-4 font-bold uppercase text-sm text-ink">Add to Home Screen</h4>
                    <p className="mt-2 text-xs leading-relaxed text-ink/70">
                      Scroll down and select <strong className="text-ink">"Add to Home Screen"</strong>, then tap <strong className="text-ink">"Add"</strong> in the top-right corner.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {activeInstallTab === "desktop" && (
              <motion.div
                key="desktop"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.3 }}
                className="space-y-8"
              >
                <div className="border-b border-ink/10 pb-6">
                  <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-action">
                    Channel: Desktop Chrome / Edge / Safari
                  </span>
                  <h3 className="mt-1 text-2xl font-bold uppercase tracking-tight text-ink">
                    Install on PC, Mac & Linux
                  </h3>
                  <p className="mt-1 text-xs text-ink/70">Run TMI Portals as a standalone desktop application with dedicated window and system tray notifications.</p>
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                  <div className="border border-ink/10 bg-canvas p-6">
                    <span className="flex h-8 w-8 items-center justify-center bg-action font-mono text-xs font-bold text-on-action">
                      01
                    </span>
                    <h4 className="mt-4 font-bold uppercase text-sm text-ink">Check Address Bar</h4>
                    <p className="mt-2 text-xs leading-relaxed text-ink/70">
                      In Chrome or Edge, look for the <strong className="text-ink">Install icon (⊕)</strong> on the right edge of your browser address bar.
                    </p>
                  </div>

                  <div className="border border-ink/10 bg-canvas p-6">
                    <span className="flex h-8 w-8 items-center justify-center bg-action font-mono text-xs font-bold text-on-action">
                      02
                    </span>
                    <h4 className="mt-4 font-bold uppercase text-sm text-ink">Click Install</h4>
                    <p className="mt-2 text-xs leading-relaxed text-ink/70">
                      Click <strong className="text-ink">"Install TMI Portals"</strong> in the popup prompt to launch installation.
                    </p>
                  </div>

                  <div className="border border-ink/10 bg-canvas p-6">
                    <span className="flex h-8 w-8 items-center justify-center bg-action font-mono text-xs font-bold text-on-action">
                      03
                    </span>
                    <h4 className="mt-4 font-bold uppercase text-sm text-ink">Standalone Window</h4>
                    <p className="mt-2 text-xs leading-relaxed text-ink/70">
                      TMI Portals will open in its own clean window, pin to your taskbar/dock, and retain your session securely.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </Section>

      {/* ── Section 3: Enterprise Architecture & Security Specifications ── */}
      <Section className="bg-surface" labelledBy="security-heading">
        <div className="flex flex-col items-center text-center">
          <MStripe />
          <p className="mt-6 font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-action">
            Enterprise Security
          </p>
          <h2
            id="security-heading"
            className="mt-3 text-balance text-[32px] font-bold uppercase leading-[1.1] tracking-[-0.02em] text-ink sm:text-[44px] lg:text-[48px]"
          >
            Zero-Trust Mobile Architecture
          </h2>
          <p className="mt-4 max-w-2xl text-pretty text-[17px] font-light leading-[1.6] text-ink/70">
            Hardened with the same rigorous engineering standards deployed across our enterprise client base.
          </p>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-px border border-ink/10 bg-ink/10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="bg-canvas p-8">
            <span className="inline-flex border border-ink/10 bg-surface p-3 text-action">
              <Lock className="h-6 w-6" />
            </span>
            <h3 className="mt-6 text-lg font-bold uppercase tracking-tight text-ink">
              TLS 1.3 Strict
            </h3>
            <p className="mt-2 text-xs leading-relaxed text-ink/70">
              Mandatory TLS 1.3 with Perfect Forward Secrecy and HSTS preloading on all subdomain API endpoints.
            </p>
          </div>

          <div className="bg-canvas p-8">
            <span className="inline-flex border border-ink/10 bg-surface p-3 text-action">
              <Fingerprint className="h-6 w-6" />
            </span>
            <h3 className="mt-6 text-lg font-bold uppercase tracking-tight text-ink">
              Biometric Pass
            </h3>
            <p className="mt-2 text-xs leading-relaxed text-ink/70">
              Integrated with Android BiometricPrompt and iOS FaceID/TouchID for high-assurance session verification.
            </p>
          </div>

          <div className="bg-canvas p-8">
            <span className="inline-flex border border-ink/10 bg-surface p-3 text-action">
              <ShieldCheck className="h-6 w-6" />
            </span>
            <h3 className="mt-6 text-lg font-bold uppercase tracking-tight text-ink">
              Zero Trackers
            </h3>
            <p className="mt-2 text-xs leading-relaxed text-ink/70">
              Free from commercial ad trackers, analytics SDKs, or background telemetry drains. Pure deterministic code.
            </p>
          </div>

          <div className="bg-canvas p-8">
            <span className="inline-flex border border-ink/10 bg-surface p-3 text-action">
              <WifiOff className="h-6 w-6" />
            </span>
            <h3 className="mt-6 text-lg font-bold uppercase tracking-tight text-ink">
              Offline Queue
            </h3>
            <p className="mt-2 text-xs leading-relaxed text-ink/70">
              Shift clock-ins and local drafts buffer in encrypted storage when offline and synchronize upon connection.
            </p>
          </div>
        </div>
      </Section>

      {/* ── Section 4: Official App Support & Dispatch Box ── */}
      <section className="border-t border-ink/10 bg-canvas px-5 py-20 sm:px-6 sm:py-24" aria-label="Official Support">
        <div className="mx-auto max-w-5xl border border-ink/15 bg-surface p-8 sm:p-12 shadow-2xl relative overflow-hidden">
          <div className="m-stripe mb-8" />

          <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <span className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-action">
                Official App Operations & Helpdesk
              </span>
              <h3 className="mt-2 text-2xl sm:text-3xl font-bold uppercase tracking-tight text-ink">
                Need Help with Setup or Access?
              </h3>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink/70">
                Our operations team provides 24/7 technical assistance for employee credentials, admin clearances, APK installation issues, and enterprise SLA reporting.
              </p>

              <div className="mt-6 flex flex-wrap items-center gap-6">
                <div className="flex items-center gap-2 font-mono text-xs">
                  <Mail className="h-4 w-4 text-action" />
                  <span className="text-ink/60">Official Support Mail:</span>
                  <a
                    href="mailto:app@tauqeermustafa.tech"
                    className="font-bold text-ink hover:text-action transition underline"
                  >
                    app@tauqeermustafa.tech
                  </a>
                  <button
                    type="button"
                    onClick={handleCopyEmail}
                    className="ml-1 p-1 text-ink/40 hover:text-ink transition"
                    title="Copy email"
                  >
                    {copiedEmail ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                  </button>
                </div>

                <div className="flex items-center gap-2 font-mono text-xs">
                  <Phone className="h-4 w-4 text-action" />
                  <span className="text-ink/60">Official Phone:</span>
                  <a href={`tel:${company.phone.replace(/\s+/g, "")}`} className="font-bold text-ink hover:text-action transition">
                    {company.phone}
                  </a>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0">
              <a
                href="https://support.tauqeermustafa.tech/ticket"
                className="inline-flex items-center justify-center gap-2 bg-action px-6 py-3.5 font-mono text-xs font-bold uppercase tracking-wider text-on-action hover:bg-action-strong transition shadow-sm"
              >
                <span>Open Enterprise Ticket</span>
                <ArrowRight className="h-4 w-4" />
              </a>

              <a
                href={company.whatsappChannels.support.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 border border-ink/20 bg-canvas px-6 py-3.5 font-mono text-xs font-bold uppercase tracking-wider text-ink hover:bg-ink/5 transition"
              >
                <span>WhatsApp Live Chat</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
