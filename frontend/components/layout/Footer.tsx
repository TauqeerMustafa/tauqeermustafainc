import Image from "next/image";
import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";
import { FaGithub, FaLinkedin, FaXTwitter } from "react-icons/fa6";

import { company } from "@/data/company";
import { footerLinks } from "@/lib/site-data";

const socialLinks = [
  { name: "GitHub", href: "https://github.com/qorlune", icon: FaGithub },
  { name: "LinkedIn", href: "https://linkedin.com/company/qorlune", icon: FaLinkedin },
  { name: "X", href: "https://x.com/qorlune", icon: FaXTwitter },
];

export default function Footer() {
  return (
    <footer className="relative bg-zinc-50 border-t border-zinc-200 text-zinc-600 dark:bg-zinc-950 dark:border-zinc-800 dark:text-zinc-400" aria-labelledby="footer-heading">
      <h2 id="footer-heading" className="sr-only">Footer</h2>

      {/* M-stripe rail — signature brand element */}
      <div className="m-stripe" aria-hidden="true" />

      <div className="mx-auto max-w-[1200px] px-5 py-16 sm:px-6 sm:py-20">

        {/* ── Top row: brand + nav columns ── */}
        <div className="grid gap-12 xl:grid-cols-[minmax(0,19rem)_1fr] xl:gap-14">

          {/* Brand block */}
          <div className="max-w-sm">
            <Link
              href="/"
              className="inline-flex items-center gap-2.5 text-[15px] font-bold uppercase tracking-[0.01em] text-zinc-900 transition-opacity hover:opacity-80 dark:text-white"
            >
              <span className="relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-md border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
                <Image src="/logo.png" alt="Qorlune LLC" fill sizes="36px" className="object-contain p-1" />
              </span>
              <span className="text-zinc-900 dark:text-white">Qorlune LLC</span>
            </Link>

            <p className="mt-4 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
              Enterprise software platforms, mission-critical cybersecurity, cloud engineering, and autonomous AI systems built for global scale.
            </p>

            <ul role="list" className="mt-6 space-y-3">
              <li>
                <a
                  href="mailto:contact@qorlune.co.uk"
                  className="flex items-center gap-2.5 text-sm text-zinc-600 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
                >
                  <Mail className="h-4 w-4 shrink-0 text-zinc-500" aria-hidden="true" />
                  contact@qorlune.co.uk
                </a>
              </li>
              <li>
                <a
                  href={`tel:${company.phone.replace(/\s+/g, "")}`}
                  className="flex items-center gap-2.5 text-sm text-zinc-600 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
                >
                  <Phone className="h-4 w-4 shrink-0 text-zinc-500" aria-hidden="true" />
                  {company.phone}
                </a>
              </li>
              {company.offices.map((office) => (
                <li
                  key={office.label}
                  className="flex items-start gap-2.5 text-sm text-zinc-600 dark:text-zinc-400"
                >
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-zinc-500" aria-hidden="true" />
                  <span>
                    <span className="block text-[11px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                      {office.label}
                    </span>
                    {office.address}
                  </span>
                </li>
              ))}
            </ul>

            <div className="mt-6 flex gap-2">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.name}
                  className="flex h-9 w-9 items-center justify-center rounded-md border border-zinc-200 bg-white text-zinc-600 transition-colors hover:border-zinc-900 hover:bg-zinc-900 hover:text-white dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:border-white dark:hover:bg-white dark:hover:text-zinc-900"
                >
                  <social.icon className="h-4 w-4" aria-hidden="true" />
                </a>
              ))}
            </div>
          </div>

          {/* Nav columns */}
          <div className="grid grid-cols-2 gap-x-8 gap-y-10 md:grid-cols-4">
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-900 dark:text-white">
                Company
              </h3>
              <ul role="list" className="mt-4 space-y-2.5">
                <li>
                  <Link href="/about" className="text-sm text-zinc-600 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link href="/portfolio" className="text-sm text-zinc-600 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white">
                    Portfolio
                  </Link>
                </li>
                <li>
                  <Link href="/careers" className="text-sm text-zinc-600 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white">
                    Careers
                  </Link>
                </li>
                <li>
                  <Link href="/blog" className="text-sm text-zinc-600 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="text-sm text-zinc-600 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white">
                    Contact Us
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-900 dark:text-white">
                Services
              </h3>
              <ul role="list" className="mt-4 space-y-2.5">
                <li>
                  <Link href="/services" className="text-sm text-zinc-600 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white">
                    All Services
                  </Link>
                </li>
                {footerLinks.services.map((item) => (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className="text-sm text-zinc-600 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-900 dark:text-white">
                Portals & Access
              </h3>
              <ul role="list" className="mt-4 space-y-2.5">
                <li>
                  <a
                    href="https://client.qorlune.co.uk"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-zinc-600 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
                  >
                    Client Workspace
                  </a>
                </li>
                <li>
                  <a
                    href="https://docs.qorlune.co.uk"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-zinc-600 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
                  >
                    Documentation
                  </a>
                </li>
                <li>
                  <a
                    href="https://support.qorlune.co.uk"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-zinc-600 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
                  >
                    Support Desk
                  </a>
                </li>
                <li>
                  <a
                    href="https://billing.qorlune.co.uk"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-zinc-600 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
                  >
                    Billing & Treasury
                  </a>
                </li>
                <li>
                  <a
                    href="https://portals.qorlune.co.uk"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-zinc-600 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
                  >
                    Corporate Portals
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-900 dark:text-white">
                Legal & Trust
              </h3>
              <ul role="list" className="mt-4 space-y-2.5">
                {footerLinks.legal.map((item) => (
                  <li key={item.name}>
                    <a
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-zinc-600 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
                    >
                      {item.name}
                    </a>
                  </li>
                ))}
                <li>
                  <a
                    href="https://docs.qorlune.co.uk/sla"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-zinc-600 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
                  >
                    Service Level Agreement
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* ── Bottom bar ── */}
        <div className="mt-14 flex flex-col gap-4 border-t border-zinc-200 pt-8 sm:flex-row sm:items-center sm:justify-between dark:border-zinc-800">
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            &copy; <span suppressHydrationWarning>{new Date().getFullYear()}</span> Qorlune LLC. All rights reserved.
          </p>
          <div className="flex flex-wrap gap-6 text-xs text-zinc-500 dark:text-zinc-400">
            <Link href="/about" className="transition-colors hover:text-zinc-900 dark:hover:text-white">
              About
            </Link>
            <Link href="/services" className="transition-colors hover:text-zinc-900 dark:hover:text-white">
              Services
            </Link>
            <Link href="/portfolio" className="transition-colors hover:text-zinc-900 dark:hover:text-white">
              Portfolio
            </Link>
            <Link href="/contact" className="transition-colors hover:text-zinc-900 dark:hover:text-white">
              Contact
            </Link>
          </div>
        </div>

      </div>
    </footer>
  );
}
