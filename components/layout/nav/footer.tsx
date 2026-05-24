"use client";

import React from "react";
import Link from "next/link";

type FooterProps = {
  settings: {
    siteTitle?: string | null;
    footerText?: string | null;
    social?: Array<{ label?: string | null; url?: string | null; icon?: string | null } | null> | null;
    nav?: Array<{ label?: string | null; href?: string | null } | null> | null;
  } | null;
};

export const Footer = ({ settings }: FooterProps) => {
  const nav = settings?.nav || [];

  return (
    <footer className="footer section">
      <div className="wrapper">
        <div className="footer__links">
          {nav.map((item, index) => (
            <Link key={index} href={item?.href || "/"} className="footer__link">
              {item?.label}
            </Link>
          ))}
        </div>

        <p className="footer__credit">
          {settings?.footerText || `© ${new Date().getFullYear()} Em in Toyland. All rights reserved.`}
        </p>
      </div>
    </footer>
  );
};
