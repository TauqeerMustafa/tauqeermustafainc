"use client";

import { useState } from "react";
import {
  ArrowRight,
  CalendarDays,
  ChevronDown,
  Compass,
  Menu,
  MessageCircle,
  Sparkles,
  Users,
  X,
} from "lucide-react";

const spaces = [
  {
    eyebrow: "Think together",
    title: "Open conversations",
    description:
      "Bring a question, an observation, or a half-formed idea. Good discussions do not require a polished starting point.",
    icon: MessageCircle,
    color: "coral",
  },
  {
    eyebrow: "Grow together",
    title: "Skill exchange",
    description:
      "Learn from people who have tried it before, then pass a useful lesson forward in your own voice.",
    icon: Sparkles,
    color: "blue",
  },
  {
    eyebrow: "Meet in person",
    title: "Small gatherings",
    description:
      "Join focused sessions that make room for real introductions, practical takeaways, and follow-up.",
    icon: CalendarDays,
    color: "gold",
  },
  {
    eyebrow: "Find your people",
    title: "Interest circles",
    description:
      "Follow the themes that keep your attention and discover a smaller group to return to regularly.",
    icon: Compass,
    color: "lilac",
  },
];

const moments = [
  { date: "12 Sep", title: "The courage to start small", type: "Open conversation" },
  { date: "19 Sep", title: "Show your work: September", type: "Skill exchange" },
  { date: "03 Oct", title: "A morning for better questions", type: "Small gathering" },
];

export default function CommunityHome() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [showAll, setShowAll] = useState(false);

  return (
    <main className="site-shell">
      <div className="announcement">
        <span className="announcement-dot" aria-hidden="true" />
        <span>Thoughtful people. Useful conversations. A little more momentum.</span>
      </div>

      <header className="site-header">
        <a className="wordmark" href="#top" aria-label="Community home">
          <span className="wordmark-mark" aria-hidden="true">C</span>
          <span>Community</span>
        </a>
        <button
          className="menu-trigger"
          type="button"
          aria-label={menuOpen ? "Close navigation" : "Open navigation"}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((current) => !current)}
        >
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
        <nav className={`main-nav ${menuOpen ? "is-open" : ""}`} aria-label="Primary navigation">
          <a href="#spaces" onClick={() => setMenuOpen(false)}>Explore spaces</a>
          <a href="#moments" onClick={() => setMenuOpen(false)}>Upcoming moments</a>
          <a href="#principles" onClick={() => setMenuOpen(false)}>Our approach</a>
          <a className="nav-cta" href="#join" onClick={() => setMenuOpen(false)}>
            Find your place <ArrowRight size={16} />
          </a>
        </nav>
      </header>

      <section className="hero section" id="top">
        <div className="hero-copy">
          <p className="kicker"><span className="kicker-line" />A generous place to begin</p>
          <h1>Make room for <em>better</em> conversations.</h1>
          <p className="hero-lede">
            Community is a gathering place for curious people who want to exchange ideas,
            practice their craft, and leave one another with something useful.
          </p>
          <div className="hero-actions">
            <a className="button button-primary" href="#spaces">Explore the spaces <ArrowRight size={17} /></a>
            <a className="text-link" href="#principles">See how it works <ChevronDown size={16} /></a>
          </div>
          <div className="hero-proof">
            <div className="avatar-stack" aria-hidden="true">
              <span className="avatar avatar-one">M</span>
              <span className="avatar avatar-two">A</span>
              <span className="avatar avatar-three">J</span>
              <span className="avatar avatar-four">+</span>
            </div>
            <p><strong>1,240 curious people</strong><br />are already making space.</p>
          </div>
        </div>
        <div className="hero-art" aria-label="Abstract illustration of connected community members" role="img">
          <div className="orbit orbit-one" />
          <div className="orbit orbit-two" />
          <div className="orbit orbit-three" />
          <div className="art-sun"><Sparkles size={30} strokeWidth={1.5} /></div>
          <div className="art-card art-card-top"><span className="art-card-icon"><Users size={16} /></span><span>Room for everyone</span></div>
          <div className="art-card art-card-bottom"><span className="art-card-dot" /><span>Small steps count</span></div>
          <span className="art-star star-one">✦</span>
          <span className="art-star star-two">✦</span>
          <span className="art-star star-three">✧</span>
        </div>
      </section>

      <section className="intro-strip section" id="principles">
        <div className="intro-number">01</div>
        <div>
          <p className="kicker">The idea</p>
          <h2>Less broadcasting.<br /><em>More belonging.</em></h2>
        </div>
        <p className="intro-text">
          The best communities make it easier to ask the honest question, share the unfinished
          work, and find the person who has been there before. That is the kind of place we are building.
        </p>
      </section>

      <section className="spaces section" id="spaces">
        <div className="section-heading">
          <div>
            <p className="kicker">Find your rhythm</p>
            <h2>There is more than<br /><em>one way to belong.</em></h2>
          </div>
          <p className="section-note">Start with the space that feels most like you today.</p>
        </div>
        <div className="space-grid">
          {spaces.slice(0, showAll ? spaces.length : 3).map((space) => {
            const Icon = space.icon;
            return (
              <article className={`space-card ${space.color}`} key={space.title}>
                <div className="space-card-top">
                  <span className="space-icon"><Icon size={20} strokeWidth={1.8} /></span>
                  <span className="space-arrow"><ArrowRight size={18} /></span>
                </div>
                <p className="card-eyebrow">{space.eyebrow}</p>
                <h3>{space.title}</h3>
                <p>{space.description}</p>
              </article>
            );
          })}
        </div>
        <button className="outline-button" type="button" onClick={() => setShowAll((current) => !current)}>
          {showAll ? "Show fewer spaces" : "See all spaces"} <ArrowRight size={16} />
        </button>
      </section>

      <section className="moments section" id="moments">
        <div className="section-heading moments-heading">
          <div>
            <p className="kicker">Keep a date</p>
            <h2>Upcoming <em>moments.</em></h2>
          </div>
          <a className="text-link" href="#join">View the calendar <ArrowRight size={16} /></a>
        </div>
        <div className="moment-list">
          {moments.map((moment, index) => (
            <a className="moment-row" href="#join" key={moment.title}>
              <span className="moment-index">0{index + 1}</span>
              <span className="moment-date">{moment.date}</span>
              <span className="moment-title">{moment.title}</span>
              <span className="moment-type">{moment.type}</span>
              <ArrowRight className="moment-arrow" size={19} />
            </a>
          ))}
        </div>
      </section>

      <section className="join section" id="join">
        <div className="join-orb orb-a" />
        <div className="join-orb orb-b" />
        <div className="join-content">
          <p className="kicker light"><span className="kicker-line" />A seat is waiting</p>
          <h2>Come as you are.<br /><em>Bring what you know.</em></h2>
          <p>Get occasional notes about conversations, gatherings, and ways to take part.</p>
          <a className="button button-light" href="mailto:hello@community.tauqeermustafa.tech?subject=I%20want%20to%20join">I want to join <ArrowRight size={17} /></a>
        </div>
        <div className="join-mark" aria-hidden="true"><span>✦</span></div>
      </section>

      <footer className="site-footer">
        <a className="wordmark" href="#top"><span className="wordmark-mark" aria-hidden="true">C</span><span>Community</span></a>
        <p>Make space. Share generously.</p>
        <div className="footer-links"><a href="#spaces">Spaces</a><a href="#moments">Moments</a><a href="mailto:hello@community.tauqeermustafa.tech">Contact</a></div>
      </footer>
    </main>
  );
}
