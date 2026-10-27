"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { company } from "@/data/company";

export default function MonasNavbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "About", href: "/about" },
    { name: "Services", href: "/services" },
    { name: "Portfolio", href: "/portfolio" },
    { name: "Pricing", href: "/pricing" },
    { name: "Blog", href: "/blog" },
    { name: "Contact", href: "/contact" },
  ];

  return (
    <>
      {/* Offcanvas Mobile Menu */}
      <div className={`fix ${mobileMenuOpen ? "offcanvas-open" : ""}`}>
        <div className={`offcanvas__area ${mobileMenuOpen ? "opened" : ""}`} style={{ zIndex: 99999 }}>
          <div className="offcanvas__wrapper" style={{ background: "#131315", color: "#fff", height: "100%", padding: "40px 30px" }}>
            <div className="offcanvas__content">
              <div className="offcanvas__top d-flex justify-content-between align-items-center mb-40">
                <div className="offcanvas__logo">
                  <Link href="/" onClick={() => setMobileMenuOpen(false)}>
                    <Image
                      src="/qorlune-logo.png"
                      alt={company.name}
                      width={140}
                      height={40}
                      className="object-contain"
                    />
                  </Link>
                </div>
                <div className="offcanvas__close">
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="offcanvas-close-icon animation--flip"
                    style={{ background: "transparent", border: "1px solid rgba(255,255,255,0.2)", borderRadius: "50%", width: "45px", height: "45px", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
                  >
                    <i className="fa-solid fa-xmark"></i>
                  </button>
                </div>
              </div>

              {/* Navigation List */}
              <div className="mobile-menu fix mb-40">
                <ul className="d-flex flex-column gap-3 list-unstyled">
                  {navLinks.map((link) => (
                    <li key={link.name}>
                      <Link
                        href={link.href}
                        onClick={() => setMobileMenuOpen(false)}
                        style={{
                          fontSize: "20px",
                          fontWeight: "600",
                          color: pathname === link.href ? "#cf4500" : "#ffffff",
                          textDecoration: "none",
                          textTransform: "uppercase",
                          letterSpacing: "0.05em",
                        }}
                      >
                        {link.name}
                      </Link>
                    </li>
                  ))}
                  <li className="mt-2">
                    <a
                      href="https://billing.qorlune.co.uk"
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => setMobileMenuOpen(false)}
                      style={{
                        fontSize: "18px",
                        fontWeight: "600",
                        color: "#1c69d4",
                        textDecoration: "none",
                        textTransform: "uppercase",
                      }}
                    >
                      Billing Terminal <i className="fa-solid fa-arrow-up-right-from-square ms-1"></i>
                    </a>
                  </li>
                </ul>
              </div>

              <div className="offcanvas__contact mb-30" style={{ borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: "25px" }}>
                <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "14px", textTransform: "uppercase", letterSpacing: "0.1em" }}>Direct Inquiries</p>
                <a href={`mailto:${company.email}`} style={{ color: "#fff", textDecoration: "none", fontSize: "16px", fontWeight: "500" }}>
                  {company.email}
                </a>
              </div>

              <div className="offcanvas__social">
                <ul className="d-flex gap-3 list-unstyled">
                  <li>
                    <a href={company.social.linkedin} target="_blank" rel="noopener noreferrer" style={{ color: "#fff", fontSize: "18px" }}>
                      <i className="fab fa-linkedin"></i>
                    </a>
                  </li>
                  <li>
                    <a href={company.social.github} target="_blank" rel="noopener noreferrer" style={{ color: "#fff", fontSize: "18px" }}>
                      <i className="fab fa-github"></i>
                    </a>
                  </li>
                  <li>
                    <a href={company.social.twitter || "https://x.com/qorlune"} target="_blank" rel="noopener noreferrer" style={{ color: "#fff", fontSize: "18px" }}>
                      <i className="fab fa-x-twitter"></i>
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
      {mobileMenuOpen && (
        <div
          className="offcanvas__overlay show"
          style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,0,0,0.8)", zIndex: 9999 }}
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Main Sticky Header */}
      <header>
        <div id="header-sticky" className="header heading-bg py-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.08)", transition: "all 0.3s ease" }}>
          <div className="container custom-container">
            <div className="mega__menu-wrapper p-relative">
              <div className="header__main d-flex justify-content-between align-items-center">
                {/* Logo */}
                <div className="header__left">
                  <div className="header-1__logo">
                    <Link href="/">
                      <Image
                        src="/qorlune-logo.png"
                        alt={company.name}
                        width={150}
                        height={42}
                        priority
                        className="object-contain"
                      />
                    </Link>
                  </div>
                </div>

                {/* Desktop Navigation Links */}
                <div className="header__middle d-none d-xl-block">
                  <div className="main-menu">
                    <nav id="mobile-menu">
                      <ul className="d-flex align-items-center gap-4 list-unstyled mb-0">
                        {navLinks.map((link) => (
                          <li key={link.name}>
                            <Link
                              href={link.href}
                              style={{
                                color: pathname === link.href ? "#cf4500" : "#ffffff",
                                fontSize: "15px",
                                fontWeight: "600",
                                textTransform: "uppercase",
                                letterSpacing: "0.06em",
                                textDecoration: "none",
                                transition: "color 0.2s ease",
                              }}
                              className="hover:text-action"
                            >
                              {link.name}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </nav>
                  </div>
                </div>

                {/* Right CTA / Action Buttons */}
                <div className="header__right d-flex align-items-center gap-3">
                  <a
                    href="https://billing.qorlune.co.uk"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="d-none d-md-inline-flex align-items-center gap-2"
                    style={{
                      background: "rgba(255,255,255,0.06)",
                      border: "1px solid rgba(255,255,255,0.15)",
                      color: "#fff",
                      padding: "8px 18px",
                      borderRadius: "30px",
                      fontSize: "13px",
                      fontWeight: "600",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      textDecoration: "none",
                    }}
                  >
                    <i className="fa-solid fa-credit-card text-action"></i> Billing
                  </a>

                  <Link
                    href="/contact"
                    className="d-none d-sm-inline-flex align-items-center gap-2"
                    style={{
                      background: "#cf4500",
                      color: "#fff",
                      padding: "10px 24px",
                      borderRadius: "30px",
                      fontSize: "14px",
                      fontWeight: "600",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      textDecoration: "none",
                    }}
                  >
                    Let's Talk <i className="fa-solid fa-arrow-right"></i>
                  </Link>

                  {/* Mobile Hamburger Toggle */}
                  <div className="header__hamburger d-xl-none">
                    <button
                      onClick={() => setMobileMenuOpen(true)}
                      className="d-flex align-items-center justify-content-center"
                      style={{
                        background: "rgba(255,255,255,0.08)",
                        border: "1px solid rgba(255,255,255,0.2)",
                        color: "#fff",
                        width: "44px",
                        height: "44px",
                        borderRadius: "50%",
                        cursor: "pointer",
                      }}
                      aria-label="Toggle Menu"
                    >
                      <i className="fa-solid fa-bars"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>
    </>
  );
}
