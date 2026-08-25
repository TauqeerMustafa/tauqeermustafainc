"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import {
  ArrowRight,
  Bot,
  ChevronRight,
  CircleUserRound,
  Cloud,
  Code2,
  Menu,
  Moon,
  MoveUpRight,
  Palette,
  ShieldCheck,
  Sun,
  X,
} from "lucide-react";

type Theme = "dark" | "light";

const themeListeners = new Set<() => void>();
const subscribeToTheme = (listener: () => void) => {
  themeListeners.add(listener);
  return () => themeListeners.delete(listener);
};
const getTheme = (): Theme => {
  if (typeof window === "undefined") return "dark";
  const savedTheme = window.localStorage.getItem("community-theme");
  if (savedTheme === "light" || savedTheme === "dark") return savedTheme;
  return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
};
const getServerTheme = (): Theme => "dark";

const capabilities = [
  {
    index: "01",
    label: "WEB ENGINEERING",
    title: "Build systems",
    description: "Architecture, APIs, dashboards, and product platforms shaped for performance, ownership, and long-term maintenance.",
    icon: Code2,
  },
  {
    index: "02",
    label: "CYBERSECURITY",
    title: "Secure by design",
    description: "Threat modeling, access boundaries, vulnerability thinking, and security habits brought into the work before launch day.",
    icon: ShieldCheck,
  },
  {
    index: "03",
    label: "AI AUTOMATION",
    title: "Make work clearer",
    description: "Responsible automation, internal copilots, retrieval workflows, and data-enabled tools for operational teams.",
    icon: Bot,
  },
  {
    index: "04",
    label: "CLOUD ENGINEERING",
    title: "Run with confidence",
    description: "Infrastructure, CI/CD, containers, and observability that make production behavior visible and resilient.",
    icon: Cloud,
  },
  {
    index: "05",
    label: "PRODUCT DESIGN",
    title: "Turn complexity into clarity",
    description: "Research-informed flows, information architecture, and component systems for people doing consequential work.",
    icon: Palette,
  },
];

const delivery = [
  { index: "01", title: "Discover", text: "Map the actual problem, existing systems, constraints, and risks before architecture decisions are made." },
  { index: "02", title: "Plan", text: "Make the operational reality visible: requirements, trade-offs, security boundaries, and a scope that fits." },
  { index: "03", title: "Build", text: "Deliver in testable increments while feature, infrastructure, security, and experience move together." },
  { index: "04", title: "Support", text: "Ship with runbooks, monitoring baselines, and the clarity teams need to keep the system healthy." },
];

const sessions = [
  { date: "12 SEP", title: "Planning secure web platforms", type: "ENGINEERING" },
  { date: "19 SEP", title: "Incident response under pressure", type: "SECURITY" },
  { date: "03 OCT", title: "AI automation that improves operations", type: "AUTOMATION" },
  { date: "17 OCT", title: "Cloud cost and reliability in practice", type: "CLOUD" },
];

export default function CommunityHome() {
  const [menuOpen, setMenuOpen] = useState(false);
  const theme = useSyncExternalStore(subscribeToTheme, getTheme, getServerTheme);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  const toggleTheme = () => {
    const nextTheme: Theme = theme === "dark" ? "light" : "dark";
    window.localStorage.setItem("community-theme", nextTheme);
    document.documentElement.dataset.theme = nextTheme;
    themeListeners.forEach((listener) => listener());
  };
  const closeMenu = () => setMenuOpen(false);

  return (
    <main className="site-shell">
      <div className="m-stripe" aria-hidden="true"><span /><span /><span /></div>
      <div className="utility-bar"><span>TECHNICAL COMMUNITY / EST. 2026</span><span className="utility-status"><i aria-hidden="true" /> OPEN TO NEW VOICES</span></div>

      <header className="site-header">
        <a className="wordmark" href="#top" aria-label="Community home"><span className="wordmark-mark" aria-hidden="true">C</span><span>COMMUNITY</span></a>
        <button className="menu-trigger" type="button" aria-label={menuOpen ? "Close navigation" : "Open navigation"} aria-expanded={menuOpen} onClick={() => setMenuOpen((current) => !current)}>{menuOpen ? <X size={19} /> : <Menu size={19} />}</button>
        <nav className={`main-nav ${menuOpen ? "is-open" : ""}`} aria-label="Primary navigation">
          <a href="#capabilities" onClick={closeMenu}>CAPABILITIES</a>
          <a href="#delivery" onClick={closeMenu}>DELIVERY</a>
          <a href="#sessions" onClick={closeMenu}>SESSIONS</a>
          <button className="theme-toggle" type="button" onClick={toggleTheme} aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}>{theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}<span>{theme === "dark" ? "LIGHT" : "DARK"}</span></button>
          <a className="nav-cta" href="#join" onClick={closeMenu}>JOIN THE GRID <ArrowRight size={16} /></a>
        </nav>
      </header>

      <section className="hero-band section-wide" id="top">
        <div className="hero-band-inner section">
          <div className="hero-copy"><p className="eyebrow hero-eyebrow"><span className="eyebrow-line" /> PRODUCTION-MINDED PEOPLE</p><h1>BUILD WHAT<br /><span>HOLDS</span> <em>UP.</em></h1><p className="hero-lede">A technical community for people building secure platforms, resilient infrastructure, practical AI, and products that last.</p><div className="hero-actions"><a className="button button-primary" href="#capabilities">EXPLORE CAPABILITIES <ArrowRight size={17} /></a><a className="text-link text-link-on-dark" href="#approach">OUR APPROACH <MoveUpRight size={15} /></a></div><div className="hero-meta"><span>ISLAMABAD / GLOBAL</span><span className="meta-rule" /><span>ENGINEERING IN MOTION</span></div></div>
          <div className="hero-art" role="img" aria-label="Abstract geometric composition in the community colour system"><div className="art-grid" aria-hidden="true" /><div className="art-circle art-circle-one" aria-hidden="true" /><div className="art-circle art-circle-two" aria-hidden="true" /><div className="art-core" aria-hidden="true"><span>C</span></div><div className="art-label art-label-top"><span className="art-label-dot" /> WEB / SECURITY / AI / CLOUD</div><div className="art-label art-label-bottom">SECURITY FIRST<br />BUILT TO LAST</div><span className="art-coordinate">SYSTEMS THAT SCALE<br />PEOPLE WHO SHARE</span></div>
        </div>
      </section>

      <section className="signal-strip section" id="approach"><div className="signal-cell"><span className="signal-number">01</span><span>SHARE THE HARD QUESTION</span></div><div className="signal-cell"><span className="signal-number">02</span><span>MAKE THE TRADE-OFF VISIBLE</span></div><div className="signal-cell"><span className="signal-number">03</span><span>LEAVE WITH A CLEARER NEXT STEP</span></div></section>

      <section className="statement section"><div className="section-number">01</div><div className="statement-heading"><p className="eyebrow">THE IDEA</p><h2>SECURITY<br /><em>FROM DAY ONE.</em></h2></div><div className="statement-copy"><p>The strongest systems bring architecture, security, infrastructure, and experience into the same conversation before the first feature ships.</p><p>That is the standard behind this community: direct thinking, practical lessons, and room for people doing the work to compare notes without the theatre.</p></div></section>

      <section className="capabilities section" id="capabilities"><div className="section-heading"><div><p className="eyebrow">FIND YOUR DISCIPLINE</p><h2>FIVE WAYS<br />TO <em>CONTRIBUTE.</em></h2></div><p className="section-note">Choose the conversation closest to the work in front of you. Follow one discipline or move across the whole system.</p></div><div className="capability-grid">{capabilities.map((capability) => { const Icon = capability.icon; return <a className="capability-card" href="#join" key={capability.title}><div className="capability-top"><span className="space-index">{capability.index}</span><span className="space-icon"><Icon size={19} strokeWidth={1.6} /></span></div><div className="capability-copy"><p className="card-label">{capability.label}</p><h3>{capability.title}</h3><p>{capability.description}</p></div><span className="capability-arrow"><ArrowRight size={18} /></span></a>; })}</div></section>

      <section className="delivery section" id="delivery"><div className="section-heading"><div><p className="eyebrow">A CLEAR PROCESS</p><h2>FROM FIRST<br /><em>QUESTION.</em></h2></div><p className="section-note">The work gets stronger when scope, risk, and milestones are visible from the beginning.</p></div><div className="delivery-grid">{delivery.map((step) => <article className="delivery-card" key={step.title}><span className="delivery-number">{step.index}</span><h3>{step.title}</h3><p>{step.text}</p><span className="delivery-rule" /></article>)}</div></section>

      <section className="moments section" id="sessions"><div className="section-heading moments-heading"><div><p className="eyebrow">KEEP A DATE</p><h2>UPCOMING<br /><em>SESSIONS.</em></h2></div><a className="text-link" href="#join">VIEW CALENDAR <MoveUpRight size={15} /></a></div><div className="moment-list">{sessions.map((session, index) => <a className="moment-row" href="#join" key={session.title}><span className="moment-index">0{index + 1}</span><span className="moment-date">{session.date}</span><span className="moment-title">{session.title}</span><span className="moment-type">{session.type}</span><ChevronRight className="moment-arrow" size={19} /></a>)}</div></section>

      <section className="join-band section-wide" id="join"><div className="join section"><div className="join-rings" aria-hidden="true"><span /><span /><span /></div><div className="join-content"><p className="eyebrow light"><span className="eyebrow-line" /> YOUR NEXT MOVE</p><h2>BUILD WITH<br /><em>INTENTION.</em></h2><p>Get occasional notes about secure engineering, useful automation, resilient cloud systems, and community sessions.</p><a className="button button-primary" href="mailto:hello@community.tauqeermustafa.tech?subject=I%20want%20to%20join">JOIN THE GRID <ArrowRight size={17} /></a></div><div className="join-spec"><span className="join-spec-label">COMMUNITY / SYSTEMS 001</span><CircleUserRound size={82} strokeWidth={.7} /><span className="join-spec-copy">EVERY VOICE<br />CHANGES THE SHAPE.</span></div></div></section>

      <footer className="site-footer"><a className="wordmark" href="#top"><span className="wordmark-mark" aria-hidden="true">C</span><span>COMMUNITY</span></a><p>MAKE SPACE. SHARE GENEROUSLY.</p><div className="footer-links"><a href="#capabilities">CAPABILITIES</a><a href="#sessions">SESSIONS</a><a href="mailto:hello@community.tauqeermustafa.tech">CONTACT</a></div></footer>
    </main>
  );
}
