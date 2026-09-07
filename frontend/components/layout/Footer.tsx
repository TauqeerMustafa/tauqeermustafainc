import Image from "next/image";
import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";
import { FaGithub, FaLinkedin, FaXTwitter } from "react-icons/fa6";

import { company } from "@/data/company";
import { footerLinks, navigation } from "@/lib/site-data";

/* ── BMW M footer — theme-flipping canvas, M-stripe rail, mono labels ── */

const socialLinks = [
  { name: "GitHub",   href: company.social.github,   icon: FaGithub },
  { name: "LinkedIn", href: company.social.linkedin,  icon: FaLinkedin },
  { name: "X",        href: company.social.twitter ?? "https://x.com/tauqeermustafainc", icon: FaXTwitter },
];

export default function Footer() {
  return (
    <footer className="relative bg-surface" aria-labelledby="footer-heading">
      <h2 id="footer-heading" className="sr-only">Footer</h2>

      {/* M-stripe rail — literal tricolor brand signature */}
      <div className="flex h-1" aria-hidden>
        <span className="flex-1 bg-m-blue" />
        <span className="flex-1 bg-m-blue-mid" />
        <span className="flex-1 bg-m-red" />
      </div>

      <div className="mx-auto max-w-[1200px] px-5 py-16 sm:px-6 sm:py-20">

        {/* ── Top row: brand + nav columns ── */}
        <div className="grid gap-14 xl:grid-cols-[minmax(0,19rem)_1fr] xl:gap-14">

          {/* Brand block */}
          <div className="max-w-sm">
            <Link
              href="/"
              className="inline-flex items-center gap-2.5 text-[15px] font-bold uppercase tracking-[0.01em] text-ink transition-opacity hover:opacity-80"
            >
              <span className="relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden border border-ink/15 bg-ink/[0.06]">
                <Image src="/logo-mark.svg" alt="" fill sizes="36px" className="object-cover" />
              </span>
              {company.name}
            </Link>

            <p className="mt-5 text-[15px] font-light leading-[1.6] tracking-[-0.01em] text-ink/55">
              {company.description.split(".")[0]}.
            </p>

            <ul role="list" className="mt-7 space-y-3.5">
              <li>
                <a
                  href={`mailto:${company.email}`}
                  className="flex items-center gap-2.5 text-[14px] font-light tracking-[-0.01em] text-ink/60 transition-colors hover:text-ink"
                >
                  <Mail className="h-4 w-4 shrink-0 text-action" aria-hidden="true" />
                  {company.email}
                </a>
              </li>
              <li>
                <a
                  href={`tel:${company.phone.replace(/\s+/g, "")}`}
                  className="flex items-center gap-2.5 text-[14px] font-light tracking-[-0.01em] text-ink/60 transition-colors hover:text-ink"
                >
                  <Phone className="h-4 w-4 shrink-0 text-action" aria-hidden="true" />
                  {company.phone}
                </a>
              </li>
              <li className="flex items-start gap-2.5 text-[14px] font-light tracking-[-0.01em] text-ink/60">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-action" aria-hidden="true" />
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
                  className="flex h-10 w-10 items-center justify-center border border-ink/12 bg-ink/[0.04] text-ink/60 transition-colors hover:border-action hover:bg-action hover:text-on-action"
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
              { title: "Documentation", links: footerLinks.documentation },
            ].map((group) => (
              <div key={group.title}>
                <h3 className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-action">
                  {group.title}
                </h3>
                <ul role="list" className="mt-5 space-y-3">
                  {group.links.map((item) => (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        className="text-[14px] font-light tracking-[-0.01em] text-ink/60 transition-colors hover:text-ink"
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
        <div className="mt-14 flex flex-col gap-4 border-t border-ink/10 pt-8 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-mono text-[11px] uppercase tracking-[0.08em] text-ink/40">
            &copy; <span suppressHydrationWarning>{new Date().getFullYear()}</span> {company.name}. All rights reserved.
          </p>
          <div className="flex flex-wrap gap-6">
            {footerLinks.legal.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="font-mono text-[11px] uppercase tracking-[0.08em] text-ink/40 transition-colors hover:text-ink"
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
