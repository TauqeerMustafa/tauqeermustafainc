"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import {
  ArrowDownRight,
  ArrowRight,
  CalendarDays,
  ChevronRight,
  CircleUserRound,
  Menu,
  MessageCircle,
  Moon,
  MoveUpRight,
  PanelTop,
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

const spaces = [
  {
    index: "01",
    title: "Build systems",
    description: "Architecture, APIs, and product decisions for platforms that have to work under pressure.",
    icon: MessageCircle,
  },
  {
    index: "02",
    title: "Secure by design",
    description: "Threat modeling, access boundaries, and practical security habits shared before launch day.",
    icon: PanelTop,
  },
  {
    index: "03",
    title: "Practical AI",
    description: "Responsible automation, internal copilots, and data-enabled workflows that improve operations.",
    icon: CalendarDays,
  },
];

const moments = [
  { date: "12 SEP", title: "Planning secure web platforms", type: "ENGINEERING" },
  { date: "19 SEP", title: "Incident response under pressure", type: "SECURITY" },
  { date: "03 OCT", title: "AI automation that improves operations", type: "AUTOMATION" },
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
      <div className="utility-bar">
        <span>COMMUNITY / EST. 2026</span>
        <span className="utility-status"><i aria-hidden="true" /> OPEN TO NEW VOICES</span>
      </div>

      <header className="site-header">
        <a className="wordmark" href="#top" aria-label="Community home">
          <span className="wordmark-mark" aria-hidden="true">C</span>
          <span>COMMUNITY</span>
        </a>
        <button
          className="menu-trigger"
          type="button"
          aria-label={menuOpen ? "Close navigation" : "Open navigation"}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((current) => !current)}
        >
          {menuOpen ? <X size={19} /> : <Menu size={19} />}
        </button>
        <nav className={`main-nav ${menuOpen ? "is-open" : ""}`} aria-label="Primary navigation">
          <a href="#spaces" onClick={closeMenu}>SPACES</a>
          <a href="#moments" onClick={closeMenu}>MOMENTS</a>
          <a href="#approach" onClick={closeMenu}>APPROACH</a>
          <button className="theme-toggle" type="button" onClick={toggleTheme} aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}>
            {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
            <span>{theme === "dark" ? "LIGHT" : "DARK"}</span>
          </button>
          <a className="nav-cta" href="#join" onClick={closeMenu}>JOIN THE GRID <ArrowRight size={16} /></a>
        </nav>
      </header>

      <section className="hero section" id="top">
        <div className="hero-copy">
          <p className="eyebrow"><span className="eyebrow-line" /> A PLACE TO MOVE WITH PURPOSE</p>
          <h1>BUILD WHAT<br /><span>HOLDS</span> <em>UP.</em></h1>
          <p className="hero-lede">A technical community for people building secure platforms, resilient infrastructure, practical AI, and products that last.</p>
          <div className="hero-actions">
            <a className="button button-primary" href="#spaces">EXPLORE SPACES <ArrowRight size={17} /></a>
            <a className="text-link" href="#approach">OUR APPROACH <MoveUpRight size={15} /></a>
          </div>
          <div className="hero-meta">
            <span>01 — 03</span>
            <span className="meta-rule" />
            <span>ENGINEERING IN MOTION</span>
          </div>
        </div>
        <div className="hero-art" role="img" aria-label="Abstract geometric composition in the community colour system">
          <div className="art-grid" aria-hidden="true" />
          <div className="art-circle art-circle-one" aria-hidden="true" />
          <div className="art-circle art-circle-two" aria-hidden="true" />
          <div className="art-core" aria-hidden="true"><span>C</span></div>
          <div className="art-label art-label-top"><span className="art-label-dot" /> WEB / SECURITY / AI / CLOUD</div>
          <div className="art-label art-label-bottom">SECURITY FIRST<br />BUILT TO LAST</div>
          <span className="art-coordinate">ISLAMABAD / GLOBAL<br />SYSTEMS THAT SCALE</span>
        </div>
      </section>

      <section className="statement section" id="approach">
        <div className="section-number">01</div>
        <div className="statement-heading"><p className="eyebrow">THE IDEA</p><h2>SECURITY<br /><em>FROM DAY ONE.</em></h2></div>
        <div className="statement-copy"><p>The strongest systems bring architecture, security, infrastructure, and experience into the same conversation before the first feature ships.</p><p className="muted-copy">Bring the hard question. Share the lesson. Leave with a clearer way forward.</p></div>
      </section>

      <section className="spaces section" id="spaces">
        <div className="section-heading">
          <div><p className="eyebrow">FIND YOUR DISCIPLINE</p><h2>THREE WAYS<br />TO <em>CONTRIBUTE.</em></h2></div>
          <p className="section-note">Choose the conversation closest to the work in front of you.</p>
        </div>
        <div className="space-grid">
          {spaces.map((space) => {
            const Icon = space.icon;
            return <a className="space-card" href="#join" key={space.title}>
              <div className="space-card-top"><span className="space-index">{space.index}</span><span className="space-icon"><Icon size={19} strokeWidth={1.6} /></span></div>
              <div className="space-card-copy"><h3>{space.title}</h3><p>{space.description}</p></div>
              <span className="space-arrow"><ArrowDownRight size={20} /></span>
            </a>;
          })}
        </div>
      </section>

      <section className="moments section" id="moments">
        <div className="section-heading moments-heading"><div><p className="eyebrow">KEEP A DATE</p><h2>UPCOMING<br /><em>SESSIONS.</em></h2></div><a className="text-link" href="#join">VIEW CALENDAR <MoveUpRight size={15} /></a></div>
        <div className="moment-list">
          {moments.map((moment, index) => <a className="moment-row" href="#join" key={moment.title}><span className="moment-index">0{index + 1}</span><span className="moment-date">{moment.date}</span><span className="moment-title">{moment.title}</span><span className="moment-type">{moment.type}</span><ChevronRight className="moment-arrow" size={19} /></a>)}
        </div>
      </section>

      <section className="join section" id="join">
        <div className="join-rings" aria-hidden="true"><span /><span /><span /></div>
        <div className="join-content"><p className="eyebrow light"><span className="eyebrow-line" /> YOUR NEXT MOVE</p><h2>BUILD WITH<br /><em>INTENTION.</em></h2><p>Get occasional notes about secure engineering, useful automation, resilient cloud systems, and community sessions.</p><a className="button button-light" href="mailto:hello@community.tauqeermustafa.tech?subject=I%20want%20to%20join">JOIN THE GRID <ArrowRight size={17} /></a></div>
        <div className="join-spec"><span className="join-spec-label">COMMUNITY / SYSTEMS 001</span><CircleUserRound size={82} strokeWidth={.7} /><span className="join-spec-copy">EVERY VOICE<br />CHANGES THE SHAPE.</span></div>
      </section>

      <footer className="site-footer"><a className="wordmark" href="#top"><span className="wordmark-mark" aria-hidden="true">C</span><span>COMMUNITY</span></a><p>MAKE SPACE. SHARE GENEROUSLY.</p><div className="footer-links"><a href="#spaces">SPACES</a><a href="#moments">MOMENTS</a><a href="mailto:hello@community.tauqeermustafa.tech">CONTACT</a></div></footer>
    </main>
  );
}
