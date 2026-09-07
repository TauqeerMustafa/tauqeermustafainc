import { ArrowRight, CalendarDays, ChevronRight } from "lucide-react";
import { sessions } from "../components/community-data";
import { CommunityChrome } from "../components/community-chrome";

export const metadata = { title: "Sessions | Community", description: "Upcoming conversations on engineering, security, automation, and cloud reliability." };

export default function SessionsPage() {
  return <CommunityChrome>
    <section className="route-hero route-hero-sessions section-wide"><div className="route-hero-inner section"><div><p className="eyebrow hero-eyebrow"><span className="eyebrow-line" /> KEEP A DATE / KEEP LEARNING</p><h1>Upcoming<br /><span>Technical</span> <em>Sessions.</em></h1><p className="route-lede">Focused conversations for people working through the real decisions behind secure platforms, operational AI, and resilient infrastructure.</p></div><div className="route-index"><span>SESSIONS / 003</span><strong>04</strong><span>ON THE CALENDAR</span></div></div></section>
    <section className="page-section section"><div className="page-intro"><p className="eyebrow">THE EDITORIAL GRID</p><h2>Short sessions.<br /><em>Useful signal.</em></h2><p>Each session starts with a practical problem and leaves room for the details that do not fit into a headline: the constraint, the compromise, the failure mode, and the decision that made the system better.</p></div><div className="session-page-list">{sessions.map((session, index) => <a className="session-page-row" href="/join" key={session.title}><div className="session-page-index"><span>0{index + 1}</span><CalendarDays size={18} /></div><div className="session-page-main"><p className="card-label">{session.type} / {session.date}</p><h3>{session.title}</h3><p>{session.summary}</p></div><span className="session-page-arrow"><ChevronRight size={20} /></span></a>)}</div></section>
    <section className="dark-callout section-wide"><div className="dark-callout-inner section"><p className="eyebrow light"><span className="eyebrow-line" /> HAVE A TOPIC</p><h2>Make the Next<br /><em>Question Count.</em></h2><p>Suggest a session, share a production lesson, or join the conversation when the next one appears.</p><a className="button button-primary" href="/join">SUGGEST A TOPIC <ArrowRight size={17} /></a></div></section>
  </CommunityChrome>;
}
