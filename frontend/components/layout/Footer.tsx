import Link from "next/link";

import { company } from "@/data/company";
import { footerLinks, navigation } from "@/lib/site-data";

export default function Footer() {
  return (
    <footer
      className="border-t border-zinc-200 bg-white"
      aria-labelledby="footer-heading"
    >
      <h2 id="footer-heading" className="sr-only">
        Footer
      </h2>
      <div className="mx-auto max-w-7xl px-6 py-16 sm:py-24 lg:px-8">
        <div className="lg:flex lg:items-start lg:justify-between">
          <div>
            <Link href="/" className="text-lg font-semibold text-zinc-900">
              {company.name}
            </Link>
            <p className="mt-2 max-w-xs text-sm text-zinc-600">
              {company.description.split(".")[0]}.
            </p>
          </div>
          <div className="mt-16 grid grid-cols-2 gap-8 sm:grid-cols-3 lg:mt-0">
            {[
              { title: "Navigate", links: navigation },
              { title: "Services", links: footerLinks.services },
              { title: "Company", links: footerLinks.company },
            ].map((group) => (
              <div key={group.title}>
                <h3 className="text-sm font-semibold text-zinc-900">
                  {group.title}
                </h3>
                <ul role="list" className="mt-4 space-y-3">
                  {group.links.map((item) => (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        className="text-sm text-zinc-600 hover:text-zinc-900"
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
        <div className="mt-16 border-t border-zinc-900/10 pt-8 sm:mt-20 lg:mt-24">
          <p className="text-xs leading-5 text-zinc-500">
            &copy; {new Date().getFullYear()} {company.name}. All rights
            reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
