import Image from "next/image";
import Link from "next/link";
import { Mail, MapPin, Phone, FileText } from "lucide-react";
import { FaGithub, FaLinkedin, FaXTwitter } from "react-icons/fa6";

import { company } from "@/data/company";
import { footerLinks, navigation } from "@/lib/site-data";

const socialLinks = [
  { name: "GitHub",   href: company.social.github,   icon: FaGithub },
  { name: "LinkedIn", href: company.social.linkedin,  icon: FaLinkedin },
  { name: "X",        href: company.social.twitter ?? "https://x.com/tauqeermustafainc", icon: FaXTwitter },
];

/** Legal, compliance, and policy documents available to clients worldwide. */
const documents = [
  { name: "Privacy Policy",              href: "/privacy" },
  { name: "Terms of Service",            href: "/terms" },
  { name: "Cookie Policy",               href: "/cookies" },
  { name: "Accessibility Statement",     href: "/accessibility" },
  { name: "Service Level Agreement",     href: "/legal/sla" },
  { name: "Data Processing Agreement",   href: "/legal/dpa" },
  { name: "Non-Disclosure Agreement",    href: "/legal/nda" },
  { name: "Security Policy",             href: "/legal/security-policy" },
  { name: "Responsible Disclosure",      href: "/legal/responsible-disclosure" },
  { name: "Modern Slavery Statement",    href: "/legal/modern-slavery" },
  { name: "Anti-Bribery Policy",         href: "/legal/anti-bribery" },
  { name: "GDPR Compliance",             href: "/legal/gdpr" },
  { name: "CCPA / CPRA Notice",          href: "/legal/ccpa" },
  { name: "PDPA Compliance (Asia)",      href: "/legal/pdpa" },
  { name: "POPIA Compliance (Africa)",   href: "/legal/popia" },
];

export default function Footer() {
  return (
    <footer
      className="border-t border-[#E5E5E5] bg-[#FAFAFA]"
      aria-labelledby="footer-heading"
    >
      <h2 id="footer-heading" className="sr-only">Footer</h2>

      <div className="mx-auto max-w-7xl px-6 py-16 sm:py-24 lg:px-8">

        {/* ── Top row: brand + nav columns ── */}
        <div className="lg:flex lg:items-start lg:justify-between">

          {/* Brand block */}
          <div className="max-w-xs">
            <Link href="/" className="inline-flex items-center gap-2 text-lg font-semibold text-[#0A0A0A]">
              <span className="relative flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden border border-[#D4D4D4]">
                <Image
                  src="/logo-mark.svg"
                  alt=""
                  fill
                  sizes="32px"
                  className="object-cover"
                />
              </span>
              {company.name}
            </Link>
            <p className="mt-3 text-sm leading-6 text-[#525252]">
              {company.description.split(".")[0]}.
            </p>

            <ul role="list" className="mt-6 space-y-3">
              <li>
                <a
                  href={`mailto:${company.email}`}
                  className="flex items-center gap-2 text-sm text-[#525252] transition hover:text-[#0A0A0A]"
                >
                  <Mail className="h-4 w-4 text-[#A3A3A3]" aria-hidden="true" />
                  {company.email}
                </a>
              </li>
              <li>
                <a
                  href={`tel:${company.phone.replace(/\s+/g, "")}`}
                  className="flex items-center gap-2 text-sm text-[#525252] transition hover:text-[#0A0A0A]"
                >
                  <Phone className="h-4 w-4 text-[#A3A3A3]" aria-hidden="true" />
                  {company.phone}
                </a>
              </li>
              <li className="flex items-start gap-2 text-sm text-[#525252]">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#A3A3A3]" aria-hidden="true" />
                {company.headquarters}
              </li>
            </ul>

            <div className="mt-6 flex gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.name}
                  className="flex h-9 w-9 items-center justify-center border border-[#D4D4D4] text-[#525252] transition hover:border-[#0A0A0A] hover:text-[#0A0A0A]"
                >
                  <social.icon className="h-4 w-4" aria-hidden="true" />
                </a>
              ))}
            </div>
          </div>

          {/* Nav columns */}
          <div className="mt-16 grid grid-cols-2 gap-8 sm:grid-cols-3 lg:mt-0">
            {[
              { title: "Navigate", links: navigation },
              { title: "Services", links: footerLinks.services },
              { title: "Company",  links: footerLinks.company },
            ].map((group) => (
              <div key={group.title}>
                <h3 className="font-mono text-[11px] font-semibold uppercase tracking-widest text-[#171717]">
                  {group.title}
                </h3>
                <ul role="list" className="mt-4 space-y-3">
                  {group.links.map((item) => (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        className="text-sm text-[#525252] transition hover:text-[#0A0A0A]"
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

        {/* ── Documents section ── */}
        <div className="mt-16 border-t border-[#E5E5E5] pt-10 sm:mt-20 lg:mt-24">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-[#737373]" aria-hidden="true" />
            <h3 className="font-mono text-[11px] font-semibold uppercase tracking-widest text-[#171717]">
              Legal &amp; Compliance Documents
            </h3>
          </div>
          <p className="mt-2 max-w-2xl text-xs leading-5 text-[#737373]">
            We operate across multiple jurisdictions. The following documents govern our services and
            data practices in accordance with international law, including GDPR (EU), CCPA/CPRA
            (California), PDPA (Singapore / Thailand), POPIA (South Africa), and applicable UK and
            Canadian privacy regulations.
          </p>
          <ul
            role="list"
            className="mt-6 grid grid-cols-2 gap-x-8 gap-y-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
          >
            {documents.map((doc) => (
              <li key={doc.name}>
                <Link
                  href={doc.href}
                  className="group flex items-start gap-1.5 text-xs text-[#737373] transition hover:text-[#0A0A0A]"
                >
                  <span
                    className="mt-0.5 h-3 w-3 shrink-0 border border-[#D4D4D4] bg-white transition group-hover:border-[#0A0A0A]"
                    aria-hidden="true"
                  />
                  {doc.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* ── Bottom bar ── */}
        <div className="mt-12 flex flex-col gap-4 border-t border-[#E5E5E5] pt-8 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-mono text-xs leading-5 text-[#A3A3A3]">
            &copy; <span suppressHydrationWarning>{new Date().getFullYear()}</span> {company.name}. All rights reserved.
            Registered in England &amp; Wales. Serving clients worldwide.
          </p>
          <div className="flex flex-wrap gap-6">
            {footerLinks.legal.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="font-mono text-xs text-[#A3A3A3] transition hover:text-[#0A0A0A]"
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
