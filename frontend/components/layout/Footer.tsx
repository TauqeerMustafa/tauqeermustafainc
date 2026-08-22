import Image from "next/image";
import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";
import { FaGithub, FaLinkedin, FaXTwitter } from "react-icons/fa6";

import { company } from "@/data/company";
import { footerLinks, navigation } from "@/lib/site-data";

/* ── BMW M footer — near-black canvas, M-stripe rail, mono labels ── */

const socialLinks = [
  { name: "GitHub",   href: company.social.github,   icon: FaGithub },
  { name: "LinkedIn", href: company.social.linkedin,  icon: FaLinkedin },
  { name: "X",        href: company.social.twitter ?? "https://x.com/tauqeermustafainc", icon: FaXTwitter },
];

export default function Footer() {
  return (
    <footer className="relative bg-[#0d0d0d]" aria-labelledby="footer-heading">
      <h2 id="footer-heading" className="sr-only">Footer</h2>

      {/* M-stripe rail */}
      <div className="flex h-1" aria-hidden>
        <span className="flex-1 bg-[#0066b1]" />
        <span className="flex-1 bg-[#1c69d4]" />
        <span className="flex-1 bg-[#e22718]" />
      </div>

      <div className="mx-auto max-w-[1200px] px-5 py-16 sm:px-6 sm:py-20">

        {/* ── Top row: brand + nav columns ── */}
        <div className="grid gap-14 xl:grid-cols-[minmax(0,19rem)_1fr] xl:gap-14">

          {/* Brand block */}
          <div className="max-w-sm">
            <Link
              href="/"
              className="inline-flex items-center gap-2.5 text-[15px] font-bold uppercase tracking-[0.01em] text-white transition-opacity hover:opacity-80"
            >
              <span className="relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden border border-white/15 bg-white/[0.06]">
                <Image src="/logo-mark.svg" alt="" fill sizes="36px" className="object-cover" />
              </span>
              {company.name}
            </Link>

            <p className="mt-5 text-[15px] font-light leading-[1.6] tracking-[-0.01em] text-white/55">
              {company.description.split(".")[0]}.
            </p>

            <ul role="list" className="mt-7 space-y-3.5">
              <li>
                <a
                  href={`mailto:${company.email}`}
                  className="flex items-center gap-2.5 text-[14px] font-light tracking-[-0.01em] text-white/60 transition-colors hover:text-white"
                >
                  <Mail className="h-4 w-4 shrink-0 text-[#1c69d4]" aria-hidden="true" />
                  {company.email}
                </a>
              </li>
              <li>
                <a
                  href={`tel:${company.phone.replace(/\s+/g, "")}`}
                  className="flex items-center gap-2.5 text-[14px] font-light tracking-[-0.01em] text-white/60 transition-colors hover:text-white"
                >
                  <Phone className="h-4 w-4 shrink-0 text-[#1c69d4]" aria-hidden="true" />
                  {company.phone}
                </a>
              </li>
              <li className="flex items-start gap-2.5 text-[14px] font-light tracking-[-0.01em] text-white/60">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#1c69d4]" aria-hidden="true" />
                {company.city}
              </li>
            </ul>

            <div className="mt-7 flex gap-2.5">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.name}
                  className="flex h-10 w-10 items-center justify-center border border-white/12 bg-white/[0.04] text-white/60 transition-colors hover:border-[#1c69d4] hover:bg-[#1c69d4] hover:text-white"
                >
                  <social.icon className="h-4 w-4" aria-hidden="true" />
                </a>
              ))}
            </div>
          </div>

          {/* Nav columns */}
          <div className="grid grid-cols-2 gap-x-8 gap-y-10 md:grid-cols-4">
            {[
              { title: "Navigate", links: navigation },
              { title: "Services", links: footerLinks.services },
              { title: "Company",  links: footerLinks.company },
              { title: "Policies", links: footerLinks.policies },
            ].map((group) => (
              <div key={group.title}>
                <h3 className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-[#1c69d4]">
                  {group.title}
                </h3>
                <ul role="list" className="mt-5 space-y-3">
                  {group.links.map((item) => (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        className="text-[14px] font-light tracking-[-0.01em] text-white/60 transition-colors hover:text-white"
                      >
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* ── Bottom bar ── */}
        <div className="mt-14 flex flex-col gap-4 border-t border-white/10 pt-8 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-mono text-[11px] uppercase tracking-[0.08em] text-white/40">
            &copy; <span suppressHydrationWarning>{new Date().getFullYear()}</span> {company.name}. All rights reserved.
          </p>
          <div className="flex flex-wrap gap-6">
            {footerLinks.legal.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="font-mono text-[11px] uppercase tracking-[0.08em] text-white/40 transition-colors hover:text-white"
              >
                {item.name}
              </Link>
            ))}
          </div>
        </div>

      </div>
    </footer>
  );
}
