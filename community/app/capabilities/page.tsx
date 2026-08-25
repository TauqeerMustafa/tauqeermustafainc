import { ArrowRight, MoveUpRight } from "lucide-react";
import { capabilities } from "../components/community-data";
import { CommunityChrome } from "../components/community-chrome";

export const metadata = { title: "Capabilities | Community", description: "Five technical disciplines for building secure, resilient digital systems." };

export default function CapabilitiesPage() {
  return <CommunityChrome>
    <section className="route-hero section-wide"><div className="route-hero-inner section"><div><p className="eyebrow hero-eyebrow"><span className="eyebrow-line" /> THE SYSTEM AROUND THE SYSTEM</p><h1>FIVE WAYS<br /><span>TO MAKE</span> <em>IMPACT.</em></h1><p className="route-lede">Web engineering, cybersecurity, AI automation, cloud engineering, and product design belong in the same conversation when the work has to hold up in production.</p></div><div className="route-index"><span>CAPABILITIES / 001</span><strong>05</strong><span>DISCIPLINES</span></div></div></section>
    <section className="page-section section"><div className="page-intro"><p className="eyebrow">CHOOSE YOUR ENTRY POINT</p><h2>The best work crosses<br /><em>disciplines.</em></h2><p>Each space has its own vocabulary. Together, they describe the full system: the interface people use, the infrastructure it runs on, the security that protects it, and the automation that gives teams leverage without losing judgment.</p></div><div className="capability-page-grid">{capabilities.map((capability) => { const Icon = capability.icon; return <article className="capability-page-card" key={capability.title}><div className="capability-top"><span className="space-index">{capability.index}</span><span className="space-icon"><Icon size={20} strokeWidth={1.5} /></span></div><div className="capability-page-copy"><p className="card-label">{capability.label}</p><h3>{capability.title}</h3><p>{capability.description}</p><a className="text-link" href="/join">START A CONVERSATION <MoveUpRight size={15} /></a></div></article>; })}</div></section>
    <section className="dark-callout section-wide"><div className="dark-callout-inner section"><p className="eyebrow light"><span className="eyebrow-line" /> THE COMMON THREAD</p><h2>SECURITY IS NOT<br /><em>A LATER PHASE.</em></h2><p>It is part of discovery, planning, build, and support. That same discipline gives a community better questions and more useful answers.</p><a className="button button-primary" href="/delivery">SEE THE DELIVERY MODEL <ArrowRight size={17} /></a></div></section>
  </CommunityChrome>;
}
