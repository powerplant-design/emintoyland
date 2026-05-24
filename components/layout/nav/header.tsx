"use client";

import React from "react";
import Link from "next/link";

type HeaderProps = {
  settings: {
    siteTitle?: string | null;
    nav?: Array<{ label?: string | null; href?: string | null } | null> | null;
    logo?: string | null;
  } | null;
};

export const Header = ({ settings }: HeaderProps) => {
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [scrolled, setScrolled] = React.useState(false);
  const nav = settings?.nav || [];

  React.useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header className={`navbar${scrolled ? ' scrolled' : ''}`} data-state={menuOpen ? "active" : ""}>
      <div className="navbar__inner wrapper">
        <Link href="/" className="navbar__logo" aria-label="Home">
          {settings?.logo ? (
            <img src={settings.logo} alt={settings?.siteTitle || "Em in Toyland"} />
          ) : (
            settings?.siteTitle || "Em in Toyland"
          )}
        </Link>

        <button
          className={`navbar__toggle ${menuOpen ? "is-active" : ""}`}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        <nav className="navbar__menu" aria-label="Main navigation">
          <ul className="navbar__list">
            {nav.map((item, index) => (
              <li key={index}>
                <Link
                  href={item?.href || "/"}
                  className="navbar__link"
                  onClick={() => setMenuOpen(false)}
                >
                  {item?.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
};
