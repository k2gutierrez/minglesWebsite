"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, X, ArrowUpRight, ArrowUp } from "lucide-react";
import { useSite } from "./provider";
import { safeHref } from "@/lib/content";
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
            MINGLES<span>®</span>
          </Link>
          <p>{content.copy["footer.note"]}</p>
        </div>
        <div className="footer-links">
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
