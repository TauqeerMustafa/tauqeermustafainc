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
    title: "Open conversations",
    description: "Questions, observations, and unfinished ideas that get sharper in good company.",
    icon: MessageCircle,
  },
  {
    index: "02",
    title: "Skill exchange",
    description: "Practical knowledge from people who have tried it, tested it, and kept learning.",
    icon: PanelTop,
  },
  {
    index: "03",
    title: "Small gatherings",
    description: "Focused rooms for real introductions, useful takeaways, and a reason to return.",
    icon: CalendarDays,
  },
];

const moments = [
  { date: "12 SEP", title: "The courage to start small", type: "OPEN CONVERSATION" },
  { date: "19 SEP", title: "Show your work: September", type: "SKILL EXCHANGE" },
  { date: "03 OCT", title: "A morning for better questions", type: "SMALL GATHERING" },
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
          <h1>MAKE YOUR<br /><span>OWN</span> <em>LINE.</em></h1>
          <p className="hero-lede">A considered space for curious people to exchange ideas, sharpen their craft, and build momentum together.</p>
          <div className="hero-actions">
            <a className="button button-primary" href="#spaces">EXPLORE SPACES <ArrowRight size={17} /></a>
            <a className="text-link" href="#approach">OUR APPROACH <MoveUpRight size={15} /></a>
          </div>
          <div className="hero-meta">
            <span>01 — 03</span>
            <span className="meta-rule" />
            <span>COMMUNITY IN MOTION</span>
          </div>
        </div>
        <div className="hero-art" role="img" aria-label="Abstract geometric composition in the community colour system">
          <div className="art-grid" aria-hidden="true" />
          <div className="art-circle art-circle-one" aria-hidden="true" />
          <div className="art-circle art-circle-two" aria-hidden="true" />
          <div className="art-core" aria-hidden="true"><span>C</span></div>
          <div className="art-label art-label-top"><span className="art-label-dot" /> OPEN / CURIOUS / USEFUL</div>
          <div className="art-label art-label-bottom">PRECISION<br />WITH ROOM TO BREATHE</div>
          <span className="art-coordinate">25° 14&apos; 06&quot; N<br />55° 18&apos; 32&quot; E</span>
        </div>
      </section>

      <section className="statement section" id="approach">
        <div className="section-number">01</div>
        <div className="statement-heading"><p className="eyebrow">THE IDEA</p><h2>LESS NOISE.<br /><em>MORE SIGNAL.</em></h2></div>
        <div className="statement-copy"><p>Good communities make it easier to ask the honest question, share the unfinished work, and find the person who has been there before.</p><p className="muted-copy">Come for the perspective. Stay for the people who make you think differently.</p></div>
      </section>

      <section className="spaces section" id="spaces">
        <div className="section-heading">
          <div><p className="eyebrow">FIND YOUR RHYTHM</p><h2>THREE WAYS<br />TO <em>ENTER.</em></h2></div>
          <p className="section-note">Start with the space that feels most like you today.</p>
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
        <div className="section-heading moments-heading"><div><p className="eyebrow">KEEP A DATE</p><h2>UPCOMING<br /><em>MOMENTS.</em></h2></div><a className="text-link" href="#join">VIEW CALENDAR <MoveUpRight size={15} /></a></div>
        <div className="moment-list">
          {moments.map((moment, index) => <a className="moment-row" href="#join" key={moment.title}><span className="moment-index">0{index + 1}</span><span className="moment-date">{moment.date}</span><span className="moment-title">{moment.title}</span><span className="moment-type">{moment.type}</span><ChevronRight className="moment-arrow" size={19} /></a>)}
        </div>
      </section>

      <section className="join section" id="join">
        <div className="join-rings" aria-hidden="true"><span /><span /><span /></div>
        <div className="join-content"><p className="eyebrow light"><span className="eyebrow-line" /> YOUR NEXT MOVE</p><h2>MAKE ROOM<br /><em>FOR MORE.</em></h2><p>Get occasional notes about conversations, gatherings, and ways to take part.</p><a className="button button-light" href="mailto:hello@community.tauqeermustafa.tech?subject=I%20want%20to%20join">JOIN THE GRID <ArrowRight size={17} /></a></div>
        <div className="join-spec"><span className="join-spec-label">COMMUNITY / 001</span><CircleUserRound size={82} strokeWidth={.7} /><span className="join-spec-copy">EVERY VOICE<br />CHANGES THE SHAPE.</span></div>
      </section>

      <footer className="site-footer"><a className="wordmark" href="#top"><span className="wordmark-mark" aria-hidden="true">C</span><span>COMMUNITY</span></a><p>MAKE SPACE. SHARE GENEROUSLY.</p><div className="footer-links"><a href="#spaces">SPACES</a><a href="#moments">MOMENTS</a><a href="mailto:hello@community.tauqeermustafa.tech">CONTACT</a></div></footer>
    </main>
  );
}
