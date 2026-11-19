"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Check,
  Zap,
  Sparkles,
  ShieldCheck,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  Video,
  Scissors,
  Layers,
  Cpu,
  Monitor,
  Flame,
  Download,
  Infinity as InfinityIcon,
  HardDrive,
  Smile,
} from "lucide-react";

type BillingCycle = "monthly" | "yearly" | "lifetime";

interface PricingPlan {
  id: string;
  name: string;
  tagline: string;
  badge?: string;
  popular?: boolean;
  monthlyPrice: number;
  yearlyPrice: number;
  lifetimePrice: number;
  originalPrice?: number;
  periodText: {
    monthly: string;
    yearly: string;
    lifetime: string;
  };
  features: string[];
  ctaText: string;
  ctaSubtext: string;
  ctaHref: string;
}

const PLANS: PricingPlan[] = [
  {
    id: "free",
    name: "Free Starter",
    tagline: "Test ClipSonic on your own PC with zero commitment.",
    monthlyPrice: 0,
    yearlyPrice: 0,
    lifetimePrice: 0,
    periodText: {
      monthly: "Free forever",
      yearly: "Free forever",
      lifetime: "Free forever",
    },
    features: [
      "Up to 60-second clips",
      "Standard 720p HD export",
      "Fixed-Length clipping mode",
      "Local FFmpeg rendering (100% private)",
      "Standard subtitle presets",
      "Single device installation",
      "Community support",
    ],
    ctaText: "Download Free",
    ctaSubtext: "No credit card required",
    ctaHref: "#download",
  },
  {
    id: "pro",
    name: "Pro Subscription",
    tagline: "For active content creators wanting complete flexibility.",
    badge: "MOST POPULAR",
    popular: true,
    monthlyPrice: 19,
    yearlyPrice: 114, // $9.50/mo billed annually
    lifetimePrice: 99,
    originalPrice: 197,
    periodText: {
      monthly: "/ month",
      yearly: "/ year ($9.50/mo)",
      lifetime: "one-time payment",
    },
    features: [
      "Unlimited clip exports — zero monthly caps",
      "Full 1080x1920 (9:16) 60 FPS Ultra HD export",
      "Smart Viral & Audio Highlight detection (hears the action)",
      "All 3 Layouts: Split Top/Bottom, Inset PiP & 9:16 Full",
      "Auto facecam tracking & centering",
      "Clips up to 5 minutes long (no 25-clip ceiling)",
      "Animated viral subtitles (MrBeast & Hormozi bold styles)",
      "100% Commercial license (no watermark)",
      "Local Whisper AI transcription support",
      "Install on up to 2 machines (deactivate anytime)",
    ],
    ctaText: "Get Pro Access",
    ctaSubtext: "Instant download + activation key",
    ctaHref: "#checkout-pro",
  },
  {
    id: "lifetime",
    name: "Pro Lifetime Deal",
    tagline: "Pay once, own it forever. Includes all future updates.",
    badge: "FOUNDER OFFER — SAVE $98",
    monthlyPrice: 99,
    yearlyPrice: 99,
    lifetimePrice: 99,
    originalPrice: 197,
    periodText: {
      monthly: "one-time (pay once)",
      yearly: "one-time (pay once)",
      lifetime: "one-time payment",
    },
    features: [
      "Everything in Pro, forever with zero subscriptions",
      "Lifetime updates to all future versions & AI models",
      "Unlimited 9:16 vertical exports at 1080p 60 FPS",
      "Audio Action & Killstreak highlight detector",
      "All stream layouts: Split-Screen, Webcam PiP, Centered",
      "No API key needed for Fixed-Length & Smart modes",
      "High-energy animated subtitles with custom color palettes",
      "Install on up to 3 workstations / editing rigs",
      "Full commercial rights for YouTube, TikTok & clients",
      "Priority VIP developer support",
    ],
    ctaText: "Get Lifetime Access — $99",
    ctaSubtext: "One-time payment • Lifetime updates",
    ctaHref: "#checkout-lifetime",
  },
];

const COMPARISON_ROWS = [
  { feature: "Maximum Clip Length", free: "60 seconds", pro: "5 minutes", lifetime: "5 minutes" },
  { feature: "Export Resolution & FPS", free: "720p @ 30 FPS", pro: "1080x1920 @ 60 FPS", lifetime: "1080x1920 @ 60 FPS" },
  { feature: "Monthly Clip Ceiling", free: "10 clips / month", pro: "Unlimited (no caps)", lifetime: "Unlimited (no caps)" },
  { feature: "Watermark", free: "Discreet watermark", pro: "Zero watermark", lifetime: "Zero watermark" },
  { feature: "Local Processing (Zero Cloud Fees)", free: "Yes (100% on PC)", pro: "Yes (100% on PC)", lifetime: "Yes (100% on PC)" },
  { feature: "Layout: Split Screen (Webcam on top)", free: "Basic", pro: "Full customizable", lifetime: "Full customizable" },
  { feature: "Layout: Fullscreen Gameplay + Inset", free: "No", pro: "Yes", lifetime: "Yes" },
  { feature: "Layout: 9:16 Centered Crop with Blur Padding", free: "Yes", pro: "Yes", lifetime: "Yes" },
  { feature: "Audio Action & Highlight Detection", free: "No", pro: "Yes (Hears the action)", lifetime: "Yes (Hears the action)" },
  { feature: "Facecam Auto-Framing", free: "No", pro: "Yes (corner box support)", lifetime: "Yes (corner box support)" },
  { feature: "Animated Word-by-Word Captions", free: "Static only", pro: "Viral animated highlight", lifetime: "Viral animated highlight" },
  { feature: "Device Activations", free: "1 device", pro: "2 devices", lifetime: "3 devices (portable)" },
  { feature: "Future Updates", free: "Minor bug fixes", pro: "Included with subscription", lifetime: "Lifetime updates forever" },
  { feature: "Commercial Rights", free: "Personal use only", pro: "Full commercial license", lifetime: "Full commercial license" },
];

const FAQS = [
  {
    q: "How does local processing work?",
    a: "Unlike web-based tools that charge high recurring fees and upload your heavy gigabytes to slow cloud servers, ClipSonic executes directly on your machine using optimized FFmpeg and your local hardware. Your stream recordings and raw footage never leave your hard drive.",
  },
  {
    q: "Do I need an internet connection or expensive AI API key?",
    a: "No! Internet is only used to pull YouTube videos if downloading from a link. Fixed-Length clipping, webcam framing, cropping, and rendering require zero internet and zero API keys. For captions, you can use local Whisper completely free or connect OpenAI/Groq keys if you prefer cloud speed.",
  },
  {
    q: "Can I use the clips for monetized YouTube Shorts, TikTok, and Reels?",
    a: "Yes! Both Pro and Lifetime licenses include a full commercial license with zero watermarks. You own 100% of all generated clips and can monetize them across YouTube, TikTok, Instagram Reels, Facebook, or deliver them to paying editing clients.",
  },
  {
    q: "What is the difference between Pro Monthly, Yearly, and Lifetime?",
    a: "All Pro plans have identical feature access, resolution, and unlimited clipping capabilities. The only difference is the billing model: Pro Monthly is flexible ($19/mo), Yearly saves 50% ($9.50/mo), and Lifetime ($99) is a one-time payment that gives you perpetual access and all future upgrades forever.",
  },
  {
    q: "Can I move my license to a new PC or laptop?",
    a: "Yes. You can deactivate an old device with a single click from your license portal and immediately activate your new machine without having to purchase a new key.",
  },
  {
    q: "What is your refund policy?",
    a: "We offer a 100% risk-free 14-day money-back guarantee. If ClipSonic does not drastically accelerate your Shorts production workflow on your machine, simply email support and we will issue a full prompt refund — no questions asked.",
  },
];

export default function PricingClient() {
  const [billing, setBilling] = useState<BillingCycle>("lifetime");
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <div className="relative min-h-screen bg-[#07090e] text-white selection:bg-purple-500/30 selection:text-purple-200 overflow-hidden font-sans">
      {/* Background Gradients & Ambient Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[550px] bg-gradient-to-b from-purple-600/20 via-indigo-600/10 to-transparent blur-[140px] pointer-events-none -z-10" />
      <div className="absolute top-[600px] right-0 w-[500px] h-[500px] bg-blue-600/10 blur-[150px] pointer-events-none -z-10" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-purple-900/10 blur-[160px] pointer-events-none -z-10" />

      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none -z-10" />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-32">
        {/* Header Hero */}
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-semibold tracking-wider uppercase mb-6 backdrop-blur-md">
            <Flame className="w-3.5 h-3.5 text-purple-400" />
            <span>AI Video Clipper For YouTube Shorts & Reels</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
            One price,{" "}
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400 bg-clip-text text-transparent">
              unlimited clips.
            </span>
          </h1>

          <p className="mt-5 text-lg sm:text-xl text-neutral-400 leading-relaxed">
            No per-clip fees, no monthly caps, no watermark. Free tier to start — or{" "}
            <span className="text-white font-medium">pay once and clip forever</span> with the lifetime deal.
          </p>

          {/* Billing Switcher */}
          <div className="mt-10 inline-flex p-1.5 rounded-2xl bg-neutral-900/80 border border-neutral-800 shadow-2xl backdrop-blur-xl">
            <button
              onClick={() => setBilling("monthly")}
              className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                billing === "monthly"
                  ? "bg-neutral-800 text-white shadow-lg shadow-black/40"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBilling("yearly")}
              className={`relative px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                billing === "yearly"
                  ? "bg-neutral-800 text-white shadow-lg shadow-black/40"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              Yearly
              <span className="ml-2 px-2 py-0.5 text-[10px] font-extrabold uppercase bg-emerald-500/20 text-emerald-400 rounded-full border border-emerald-500/30">
                Save 50%
              </span>
            </button>
            <button
              onClick={() => setBilling("lifetime")}
              className={`relative px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 ${
                billing === "lifetime"
                  ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-500/25"
                  : "text-neutral-300 hover:text-white"
              }`}
            >
              Pro Lifetime
              <span className="ml-2 px-2 py-0.5 text-[10px] font-black uppercase bg-white/20 text-white rounded-full">
                $99 Deal
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          {PLANS.map((plan) => {
            const isFeatured = plan.id === (billing === "lifetime" ? "lifetime" : "pro");
            const price =
              billing === "monthly"
                ? plan.monthlyPrice
                : billing === "yearly"
                ? plan.yearlyPrice
                : plan.lifetimePrice;

            return (
              <motion.div
                key={plan.id}
                whileHover={{ y: -6 }}
                transition={{ duration: 0.2 }}
                className={`relative flex flex-col justify-between rounded-3xl p-8 transition-all duration-300 ${
                  isFeatured
                    ? "bg-gradient-to-b from-neutral-900/90 to-neutral-950/90 border-2 border-purple-500/50 shadow-2xl shadow-purple-900/20 ring-1 ring-purple-500/30"
                    : "bg-neutral-900/40 border border-neutral-800/80 hover:border-neutral-700/80 shadow-xl backdrop-blur-xl"
                }`}
              >
                {/* Badge Header */}
                {plan.badge && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-[11px] font-extrabold tracking-wider uppercase shadow-md shadow-purple-600/30">
                    {plan.badge}
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold text-white tracking-tight">{plan.name}</h3>
                    {plan.id === "lifetime" && (
                      <span className="p-1.5 rounded-lg bg-purple-500/10 text-purple-400">
                        <InfinityIcon className="w-5 h-5" />
                      </span>
                    )}
                  </div>
                  <p className="mt-2 text-sm text-neutral-400 leading-relaxed">{plan.tagline}</p>

                  {/* Price display */}
                  <div className="mt-6 flex items-baseline gap-2">
                    {plan.originalPrice && billing === "lifetime" && (
                      <span className="text-xl text-neutral-500 line-through font-semibold">
                        ${plan.originalPrice}
                      </span>
                    )}
                    <span className="text-5xl font-black text-white tracking-tight">
                      ${price}
                    </span>
                    <span className="text-sm font-medium text-neutral-400">
                      {plan.periodText[billing]}
                    </span>
                  </div>

                  {/* Divider */}
                  <div className="my-7 h-px bg-neutral-800/80" />

                  {/* Features list */}
                  <div className="space-y-3.5">
                    <div className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                      Included with {plan.name}:
                    </div>
                    {plan.features.map((feat, idx) => (
                      <div key={idx} className="flex items-start gap-3">
                        <div
                          className={`mt-0.5 rounded-full p-0.5 ${
                            isFeatured
                              ? "bg-purple-500/20 text-purple-400"
                              : "bg-neutral-800 text-neutral-300"
                          }`}
                        >
                          <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                        </div>
                        <span className="text-sm text-neutral-300 leading-snug">{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Card CTA Footer */}
                <div className="mt-10 pt-4">
                  <Link
                    href={plan.ctaHref}
                    className={`w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl text-sm font-bold transition-all duration-200 ${
                      isFeatured
                        ? "bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 bg-[length:200%_auto] hover:bg-right text-white shadow-lg shadow-purple-600/30 hover:shadow-purple-600/50"
                        : "bg-neutral-800 hover:bg-neutral-700 text-white border border-neutral-700/60"
                    }`}
                  >
                    <span>{plan.ctaText}</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <p className="mt-2.5 text-center text-xs text-neutral-500">{plan.ctaSubtext}</p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Feature Comparison Matrix */}
        <section className="mt-32">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-3xl font-extrabold text-white tracking-tight">Compare Plans In-Depth</h2>
            <p className="mt-3 text-neutral-400 text-base">
              Every detail of what is unlocked between Free, Pro, and Lifetime.
            </p>
          </div>

          <div className="overflow-x-auto rounded-3xl border border-neutral-800 bg-neutral-900/30 backdrop-blur-xl shadow-2xl">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-neutral-800 bg-neutral-900/60 text-xs uppercase tracking-wider text-neutral-400">
                  <th className="py-5 px-6 font-semibold">Capabilities</th>
                  <th className="py-5 px-6 font-semibold">Free Starter</th>
                  <th className="py-5 px-6 font-semibold">Pro Subscription</th>
                  <th className="py-5 px-6 font-bold text-purple-400">Pro Lifetime ($99)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/60 text-sm">
                {COMPARISON_ROWS.map((row, i) => (
                  <tr
                    key={i}
                    className={`hover:bg-neutral-800/20 transition-colors ${
                      i % 2 === 0 ? "bg-transparent" : "bg-neutral-900/20"
                    }`}
                  >
                    <td className="py-4 px-6 font-medium text-neutral-200">{row.feature}</td>
                    <td className="py-4 px-6 text-neutral-400">{row.free}</td>
                    <td className="py-4 px-6 text-neutral-200 font-medium">{row.pro}</td>
                    <td className="py-4 px-6 text-purple-300 font-semibold">{row.lifetime}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* FAQ Accordion */}
        <section className="mt-32 max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-white tracking-tight">Frequently Asked Questions</h2>
            <p className="mt-2 text-neutral-400 text-sm">
              Everything you need to know about local rendering, licenses, and AI keys.
            </p>
          </div>

          <div className="space-y-4">
            {FAQS.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className="rounded-2xl border border-neutral-800 bg-neutral-900/40 backdrop-blur-lg overflow-hidden transition-colors"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full py-4 px-6 text-left flex items-center justify-between gap-4 font-semibold text-neutral-200 hover:text-white"
                  >
                    <span>{faq.q}</span>
                    <span className="p-1 rounded-lg bg-neutral-800 text-neutral-400">
                      {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </span>
                  </button>
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className="px-6 pb-5 text-sm text-neutral-400 leading-relaxed border-t border-neutral-800/40 pt-3">
                          {faq.a}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </section>

        {/* 100% Risk-Free Guarantee Banner */}
        <section className="mt-24 p-8 sm:p-10 rounded-3xl bg-gradient-to-r from-purple-950/40 via-indigo-950/30 to-neutral-900 border border-purple-500/20 text-center max-w-4xl mx-auto shadow-2xl relative overflow-hidden">
          <div className="absolute -right-10 -bottom-10 w-44 h-44 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="inline-flex p-3 rounded-2xl bg-purple-500/10 text-purple-400 mb-4 border border-purple-500/20">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h3 className="text-2xl font-bold text-white">100% Risk-Free Money-Back Guarantee</h3>
          <p className="mt-3 text-neutral-300 text-sm max-w-xl mx-auto leading-relaxed">
            Try ClipSonic for a full 14 days. If it doesn't dramatically cut down your YouTube Shorts and TikTok workflow time, email us and we will promptly refund every single penny. No questions asked.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-4 text-xs text-neutral-400 font-medium">
            <span className="flex items-center gap-1.5">
              <Check className="w-4 h-4 text-emerald-400" /> Instant Key Delivery
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="w-4 h-4 text-emerald-400" /> 14-Day Money Back
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="w-4 h-4 text-emerald-400" /> Commercial Rights Included
            </span>
          </div>
        </section>
      </main>
    </div>
  );
}
