"use client";

import Link from "next/link";
import { useEffect, useSyncExternalStore } from "react";
import { ArrowRight, Menu, Moon, Sun, X } from "lucide-react";
import { useState } from "react";

type Theme = "dark" | "light";

const themeListeners = new Set<() => void>();
const subscribeToTheme = (listener: () => void) => {
  themeListeners.add(listener);
  return () => themeListeners.delete(listener);
};
const getTheme = (): Theme => {
  if (typeof window === "undefined") return "dark";
  const savedTheme = window.localStorage.getItem("community-theme");
  if (savedTheme === "light" || savedTheme === "dark") return savedTheme;
  return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
};
const getServerTheme = (): Theme => "dark";

const navItems = [
  { href: "/capabilities", label: "CAPABILITIES" },
  { href: "/delivery", label: "DELIVERY" },
  { href: "/sessions", label: "SESSIONS" },
];

export function CommunityChrome({ children }: { children: React.ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const theme = useSyncExternalStore(subscribeToTheme, getTheme, getServerTheme);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  const toggleTheme = () => {
    const nextTheme: Theme = theme === "dark" ? "light" : "dark";
    window.localStorage.setItem("community-theme", nextTheme);
    document.documentElement.dataset.theme = nextTheme;
    themeListeners.forEach((listener) => listener());
  };
  const closeMenu = () => setMenuOpen(false);

  return (
    <main className="site-shell">
      <div className="m-stripe" aria-hidden="true"><span /><span /><span /></div>
      <div className="utility-bar"><span>TECHNICAL COMMUNITY / EST. 2026</span><span className="utility-status"><i aria-hidden="true" /> OPEN TO NEW VOICES</span></div>
      <header className="site-header">
        <Link className="wordmark" href="/" aria-label="Community home"><span className="wordmark-mark" aria-hidden="true">C</span><span>COMMUNITY</span></Link>
        <button className="menu-trigger" type="button" aria-label={menuOpen ? "Close navigation" : "Open navigation"} aria-expanded={menuOpen} onClick={() => setMenuOpen((current) => !current)}>{menuOpen ? <X size={19} /> : <Menu size={19} />}</button>
        <nav className={`main-nav ${menuOpen ? "is-open" : ""}`} aria-label="Primary navigation">
          {navItems.map((item) => <Link href={item.href} onClick={closeMenu} key={item.href}>{item.label}</Link>)}
          <button className="theme-toggle" type="button" onClick={toggleTheme} aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}>{theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}<span>{theme === "dark" ? "LIGHT" : "DARK"}</span></button>
          <Link className="nav-cta" href="/join" onClick={closeMenu}>JOIN THE GRID <ArrowRight size={16} /></Link>
        </nav>
      </header>
      {children}
      <footer className="site-footer"><Link className="wordmark" href="/"><span className="wordmark-mark" aria-hidden="true">C</span><span>COMMUNITY</span></Link><p>MAKE SPACE. SHARE GENEROUSLY.</p><div className="footer-links"><Link href="/capabilities">CAPABILITIES</Link><Link href="/sessions">SESSIONS</Link><a href="mailto:hello@community.tauqeermustafa.tech">CONTACT</a></div></footer>
    </main>
  );
}
