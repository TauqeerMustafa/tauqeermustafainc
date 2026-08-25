import { ArrowRight, Check } from "lucide-react";
import { delivery } from "../components/community-data";
import { CommunityChrome } from "../components/community-chrome";

export const metadata = { title: "Delivery | Community", description: "A clear four-step process for making technical work visible, testable, and maintainable." };

const principles = [
  "Security considerations begin during discovery, not after launch.",
  "Scope and trade-offs stay visible as the work changes.",
  "Incremental delivery keeps feedback close to the decision.",
  "A system is not finished until people can operate it with confidence.",
];

export default function DeliveryPage() {
  return <CommunityChrome>
    <section className="route-hero route-hero-blue section-wide"><div className="route-hero-inner section"><div><p className="eyebrow hero-eyebrow"><span className="eyebrow-line" /> DELIVERY MODEL / 004 STEPS</p><h1>FROM FIRST<br /><span>QUESTION</span> TO <em>STABILITY.</em></h1><p className="route-lede">A clear process creates better technical decisions. It keeps constraints visible, turns risk into a conversation, and gives every person a useful place to contribute.</p></div><div className="route-index"><span>DELIVERY / 002</span><strong>04</strong><span>PHASES</span></div></div></section>
    <section className="page-section section"><div className="page-intro"><p className="eyebrow">A CLEAR PROCESS</p><h2>The timeline scales.<br /><em>The phases stay.</em></h2><p>Whether the work is an authentication rebuild or an operational platform, the discipline is the same: understand the conditions, choose a workable path, ship in increments, and support the system after release.</p></div><div className="delivery-page-grid">{delivery.map((step) => <article className="delivery-page-card" key={step.title}><span className="delivery-number">{step.index}</span><h3>{step.title}</h3><p>{step.text}</p><span className="delivery-rule" /></article>)}</div></section>
    <section className="principles-band section-wide"><div className="principles-inner section"><div><p className="eyebrow">WHAT WE KEEP VISIBLE</p><h2>THE DETAILS<br /><em>THAT MATTER.</em></h2></div><ul>{principles.map((principle) => <li key={principle}><Check size={17} /><span>{principle}</span></li>)}</ul></div></section>
    <section className="next-route section"><div><p className="eyebrow">KEEP MOVING</p><h2>BRING THE<br /><em>HARD QUESTION.</em></h2></div><a className="button button-primary" href="/sessions">EXPLORE SESSIONS <ArrowRight size={17} /></a></section>
  </CommunityChrome>;
}
