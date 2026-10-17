import Image from "next/image";
import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";
import {
  FaFacebookF,
  FaGithub,
  FaInstagram,
  FaLinkedin,
  FaXTwitter,
  FaYoutube,
} from "react-icons/fa6";

import { company } from "@/data/company";
import { footerLinks, navigation } from "@/lib/site-data";

/* ── Deep Oxford Navy Footer (#040e27) — Divider (#1e273d), Muted (#919191) ── */

const socialLinks = [
  { name: "Facebook",  href: "https://facebook.com/qorlune",                    icon: FaFacebookF },
  { name: "X",         href: company.social.twitter ?? "https://x.com/qorlune", icon: FaXTwitter },
  { name: "Instagram", href: "https://instagram.com/qorlune",                   icon: FaInstagram },
  { name: "LinkedIn",  href: company.social.linkedin,                           icon: FaLinkedin },
  { name: "GitHub",    href: company.social.github,                             icon: FaGithub },
  { name: "YouTube",   href: "https://youtube.com/@qorlune",                    icon: FaYoutube },
];

export default function Footer() {
  return (
    <footer className="relative bg-[#040e27]/95 overflow-hidden text-white border-t border-[#1e273d]" aria-labelledby="footer-heading">
      <h2 id="footer-heading" className="sr-only">Footer</h2>

      {/* Background image subtle overlay */}
      <div 
        className="pointer-events-none absolute inset-0 -z-10 bg-cover bg-bottom opacity-15 mix-blend-screen"
        style={{ backgroundImage: "url('/images/site-bg.jpg')" }}
        aria-hidden="true"
      />

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
              className="inline-flex items-center gap-2.5 text-[15px] font-bold uppercase tracking-[0.01em] text-white transition-opacity hover:opacity-80"
            >
              <span className="relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden border border-[#1e273d] bg-white/5">
                <Image src="/logo.png" alt={company.name} fill sizes="36px" className="object-contain p-0.5" />
              </span>
              {company.name}
            </Link>

            <p className="mt-5 text-[15px] font-light leading-[1.6] tracking-[-0.01em] text-[#919191]">
              {company.description.split(".")[0]}.
            </p>

            <ul role="list" className="mt-7 space-y-3.5">
              <li>
                <a
                  href={`mailto:${company.email}`}
                  className="flex items-center gap-2.5 text-[14px] font-light tracking-[-0.01em] text-[#919191] transition-colors hover:text-white"
                >
                  <Mail className="h-4 w-4 shrink-0 text-action" aria-hidden="true" />
                  {company.email}
                </a>
              </li>
              <li>
                <a
                  href={`tel:${company.phone.replace(/\s+/g, "")}`}
                  className="flex items-center gap-2.5 text-[14px] font-light tracking-[-0.01em] text-[#919191] transition-colors hover:text-white"
                >
                  <Phone className="h-4 w-4 shrink-0 text-action" aria-hidden="true" />
                  {company.phone}
                </a>
              </li>
              {company.offices.map((office) => (
                <li
                  key={office.label}
                  className="flex items-start gap-2.5 text-[14px] font-light tracking-[-0.01em] text-[#919191]"
                >
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-action" aria-hidden="true" />
                  <span>
                    <span className="block font-mono text-[10px] font-semibold uppercase tracking-[0.1em] text-[#919191]/60">
                      {office.label}
                    </span>
                    {office.address}
                  </span>
                </li>
              ))}
            </ul>
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
                        className="text-[14px] font-light tracking-[-0.01em] text-[#919191] transition-colors hover:text-white"
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

        {/* ── Social Row + Hairline Divider + Copyright Bar (matching reference screenshot) ── */}
        <div className="mt-16">
          {/* Social icons row centered above the divider */}
          <div className="flex items-center justify-center gap-8 pb-10 text-[#919191]">
            {socialLinks.map((social) => (
              <a
                key={social.name}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={social.name}
                className="transition-colors hover:text-white"
              >
                <social.icon className="h-5 w-5" aria-hidden="true" />
              </a>
            ))}
          </div>

          {/* Full-width continuous divider line (#1e273d) */}
          <div className="w-full border-t border-[#1e273d]" />

          {/* Bottom copyright and legal links */}
          <div className="flex flex-col gap-4 pt-8 sm:flex-row sm:items-center sm:justify-between">
            <p className="font-mono text-[12px] uppercase tracking-[0.08em] text-[#919191]">
              Copyright &copy; <span suppressHydrationWarning>{new Date().getFullYear()}</span> {company.legalName}. All rights reserved.
            </p>
            <div className="flex flex-wrap gap-6">
              {footerLinks.legal.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="font-mono text-[11px] uppercase tracking-[0.08em] text-[#919191] transition-colors hover:text-white"
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
        </div>

      </div>
    </footer>
  );
}
