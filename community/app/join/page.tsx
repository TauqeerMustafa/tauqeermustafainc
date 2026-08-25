import { ArrowRight, Check, Mail, MoveUpRight, Users } from "lucide-react";
import { CommunityChrome } from "../components/community-chrome";

export const metadata = { title: "Join the Grid | Community", description: "Join a technical community for secure engineering, practical AI, cloud, and product design." };

const reasons = [
  "Compare notes with people who build and operate real systems.",
  "Share a production lesson before it becomes someone else’s incident.",
  "Find thoughtful sessions across engineering, security, AI, cloud, and design.",
];

export default function JoinPage() {
  return <CommunityChrome>
    <section className="route-hero route-hero-join section-wide"><div className="route-hero-inner section"><div><p className="eyebrow hero-eyebrow"><span className="eyebrow-line" /> YOUR NEXT MOVE</p><h1>MAKE ROOM<br /><span>FOR MORE</span> <em>SIGNAL.</em></h1><p className="route-lede">Come for the perspective. Stay for the people who make you think differently. The grid is open to practitioners, learners, and curious builders.</p></div><div className="route-index"><span>JOIN / 004</span><strong>01</strong><span>OPEN DOOR</span></div></div></section>
    <section className="page-section section join-page-section"><div className="join-content-grid"><div className="page-intro"><p className="eyebrow">A SEAT IS WAITING</p><h2>BRING WHAT<br /><em>YOU KNOW.</em></h2><p>Community is built by people willing to share the context behind the work: the trade-off, the constraint, the lesson, and the next question.</p></div><div className="join-reasons"><p className="card-label">WHY PEOPLE JOIN</p><ul>{reasons.map((reason) => <li key={reason}><Check size={17} /><span>{reason}</span></li>)}</ul><a className="button button-primary" href="mailto:hello@community.tauqeermustafa.tech?subject=I%20want%20to%20join">EMAIL THE COMMUNITY <Mail size={17} /></a></div></div></section>
    <section className="join-contact-band section-wide"><div className="join-contact-inner section"><div className="join-contact-icon"><Users size={28} /></div><div><p className="eyebrow light">START WITH A NOTE</p><h2>ONE GOOD QUESTION<br /><em>IS ENOUGH.</em></h2></div><a className="button button-secondary-on-dark" href="mailto:hello@community.tauqeermustafa.tech?subject=Community%20topic">SHARE A TOPIC <MoveUpRight size={16} /></a></div></section>
    <section className="next-route section"><div><p className="eyebrow">NOT SURE WHERE TO START?</p><h2>EXPLORE THE<br /><em>CAPABILITIES.</em></h2></div><a className="button button-primary" href="/capabilities">VIEW CAPABILITIES <ArrowRight size={17} /></a></section>
  </CommunityChrome>;
}
