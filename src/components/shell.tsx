"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, X, ArrowUpRight, ArrowUp } from "lucide-react";
import { useSite } from "./provider";
import { safeHref, isHttpsUrl, OPENSEA_URL } from "@/lib/content";
import { OpenSeaIcon } from "./brand-icons";
export function Header() {
  const { content, mode } = useSite();
  const path = usePathname();
  const [open, setOpen] = useState(false);
  useEffect(() => setOpen(false), [path]);
  return (
    <>
      <div className="topline">
        <span>{content.copy["brand.tagline"]}</span>
        <span>
          {mode === "connected"
            ? "THE NEXT CHAPTER IS TAKING SHAPE"
            : mode === "unavailable"
              ? "CONTENT CONNECTION UNAVAILABLE · PREVIEW CONTENT"
              : "DESIGN PREVIEW · SEPTEMBER 2026"}
        </span>
      </div>
      <header className="header">
        <Link href="/" className="logo" aria-label="Mingles home">
          <img
            src="/brand/mingles-white.png"
            width="106"
            height="106"
            alt="Mingles"
          />
        </Link>
        <nav className="desktop-nav" aria-label="Main navigation">
          {content.nav.map((n) => (
            <Link
              key={n.href}
              aria-current={path === n.href ? "page" : undefined}
              href={safeHref(n.href)}
            >
              {n.label}
            </Link>
          ))}
        </nav>
        <a
          className="os-link"
          href={OPENSEA_URL}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Mingles collection on OpenSea"
          title="Mingles on OpenSea"
        >
          <OpenSeaIcon size={17} />
        </a>
        <Link className="portal-link" href="/portal">
          Holder portal <ArrowUpRight size={16} />
        </Link>
        <button
          className="menu-button"
          aria-label={open ? "Close navigation" : "Open navigation"}
          aria-expanded={open}
          aria-controls="mobile-nav"
          onClick={() => setOpen(!open)}
        >
          {open ? <X /> : <Menu />}
        </button>
        {open && (
          <nav
            id="mobile-nav"
            className="mobile-nav"
            aria-label="Mobile navigation"
            onKeyDown={(e) => {
              if (e.key === "Escape") setOpen(false);
            }}
          >
            {content.nav.map((n) => (
              <Link key={n.href} href={safeHref(n.href)}>
                {n.label}
                <ArrowUpRight />
              </Link>
            ))}
            <Link href="/build-the-distillery">
              Build the Distillery <ArrowUpRight />
            </Link>
            <Link href="/portal">
              Holder portal <ArrowUpRight />
            </Link>
            <a href={OPENSEA_URL} target="_blank" rel="noopener noreferrer">
              <OpenSeaIcon size={16} /> Collection on OpenSea <ArrowUpRight />
            </a>
          </nav>
        )}
      </header>
    </>
  );
}
export function Footer() {
  const { content } = useSite();
  return (
    <footer>
      <div className="footer-top">
        <div>
          <Link href="/" className="footer-name">
            {/* Si el admin sube la tipografía del logo, se usa la imagen; si no,
                se queda el texto de siempre. */}
            {isHttpsUrl(content.visuals?.footerLogo) ? (
              <img
                className="footer-logo"
                src={content.visuals!.footerLogo}
                alt="Mingles"
                loading="lazy"
                referrerPolicy="no-referrer"
              />
            ) : (
              <>
                MINGLES<span>®</span>
              </>
            )}
          </Link>
          <p>{content.copy["footer.note"]}</p>
        </div>
        <div className="footer-links">
          <a
            className="footer-os"
            href={OPENSEA_URL}
            target="_blank"
            rel="noopener noreferrer"
          >
            <span className="footer-os-icon">
              <OpenSeaIcon size={19} />
            </span>
            <span>
              Collection on OpenSea
              <small>Buy and sell Mingles</small>
            </span>
            <ArrowUpRight size={14} />
          </a>
          <Link href="/build-the-distillery">Build the Distillery ↗</Link>
          <Link href="/portal">Holder portal ↗</Link>
          <Link href="/updates">Follow the build ↗</Link>
        </div>
      </div>
      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} MINGLES</span>
        <span>{content.copy["footer.responsibility"]}</span>
        <a href="#top">
          BACK TO TOP <ArrowUp size={14} />
        </a>
      </div>
    </footer>
  );
}
