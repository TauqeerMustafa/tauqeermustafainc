import Image from "next/image";
import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";
import { FaGithub, FaLinkedin } from "react-icons/fa";

import { company } from "@/data/company";
import { footerLinks, navigation } from "@/lib/site-data";

const socialLinks = [
  { name: "GitHub", href: company.social.github, icon: FaGithub },
  { name: "LinkedIn", href: company.social.linkedin, icon: FaLinkedin },
];

export default function Footer() {
  return (
    <footer
      className="tmi-grid border-t border-[#1B2A45] bg-[#0A1628]"
      aria-labelledby="footer-heading"
    >
      <h2 id="footer-heading" className="sr-only">
        Footer
      </h2>
      <div className="mx-auto max-w-7xl px-6 py-16 sm:py-24 lg:px-8">
        <div className="lg:flex lg:items-start lg:justify-between">
          <div className="max-w-xs">
            <Link href="/" className="inline-flex items-center gap-2 text-lg font-semibold text-white">
              <span className="relative flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden border border-[#0B5FFF]">
                <Image
                  src="/images/logo/tmi-logo-badge.jpg"
                  alt=""
                  fill
                  sizes="32px"
                  className="object-cover"
                />
              </span>
              {company.name}
            </Link>
            <p className="mt-3 text-sm text-zinc-400">
              {company.description.split(".")[0]}.
            </p>

            <ul role="list" className="mt-6 space-y-3">
              <li>
                <a
                  href={`mailto:${company.email}`}
                  className="flex items-center gap-2 text-sm text-zinc-400 transition hover:text-white"
                >
                  <Mail className="h-4 w-4 text-[#7FA8FF]" aria-hidden="true" />
                  {company.email}
                </a>
              </li>
              <li>
                <a
                  href={`tel:${company.phone.replace(/\s+/g, "")}`}
                  className="flex items-center gap-2 text-sm text-zinc-400 transition hover:text-white"
                >
                  <Phone className="h-4 w-4 text-[#7FA8FF]" aria-hidden="true" />
                  {company.phone}
                </a>
              </li>
              <li className="flex items-start gap-2 text-sm text-zinc-400">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#7FA8FF]" aria-hidden="true" />
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
                  className="flex h-9 w-9 items-center justify-center border border-[#1B2A45] text-zinc-400 transition hover:border-[#0B5FFF] hover:text-white"
                >
                  <social.icon className="h-4 w-4" aria-hidden="true" />
                </a>
              ))}
            </div>
          </div>
          <div className="mt-16 grid grid-cols-2 gap-8 sm:grid-cols-3 lg:mt-0">
            {[
              { title: "Navigate", links: navigation },
              { title: "Services", links: footerLinks.services },
              { title: "Company", links: footerLinks.company },
            ].map((group) => (
              <div key={group.title}>
                <h3 className="font-mono text-xs font-semibold uppercase tracking-widest text-[#7FA8FF]">
                  {group.title}
                </h3>
                <ul role="list" className="mt-4 space-y-3">
                  {group.links.map((item) => (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        className="text-sm text-zinc-400 transition hover:text-white"
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
        <div className="mt-16 flex flex-col gap-4 border-t border-[#1B2A45] pt-8 sm:mt-20 sm:flex-row sm:items-center sm:justify-between lg:mt-24">
          <p className="font-mono text-xs leading-5 text-zinc-500">
            &copy; {new Date().getFullYear()} {company.name}. All rights
            reserved.
          </p>
          <div className="flex flex-wrap gap-6">
            {footerLinks.legal.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="font-mono text-xs text-zinc-500 transition hover:text-white"
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
