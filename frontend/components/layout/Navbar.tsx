import Link from "next/link";

const navLinks = [
  { name: "Home", href: "/" },
  { name: "About", href: "/about" },
  { name: "Services", href: "/services" },
  { name: "Portfolio", href: "/portfolio" },
  { name: "Careers", href: "/careers" },
  { name: "Blog", href: "/blog" },
  { name: "Contact", href: "/contact" },
];

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-[#E5E7EB] bg-white/95 backdrop-blur">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-base font-semibold tracking-tight text-[#111827] transition hover:text-[#A67C00] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#C9A227]"
        >
          <span className="h-2.5 w-2.5 rounded-full bg-[#C9A227]" aria-hidden="true" />
          Tauqeer Mustafa Inc.
        </Link>

        <ul className="hidden items-center gap-7 md:flex">
          {navLinks.map((link) => (
            <li key={link.name}>
              <Link
                href={link.href}
                className="text-sm font-medium text-[#6B7280] transition hover:text-[#A67C00] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#C9A227]"
              >
                {link.name}
              </Link>
            </li>
          ))}
        </ul>

        <Link
          href="/login"
          className="rounded-lg bg-[#111827] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#1F2937] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#C9A227]"
        >
          Login
        </Link>
      </nav>
    </header>
  );
}
