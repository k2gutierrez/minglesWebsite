"use client";
import { useState } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  ArrowRight,
  Fingerprint,
  FlaskConical,
  Search,
} from "lucide-react";
import { useSite } from "./provider";
import { Button, Status, EmptyMedia, ArrowLink, Reveal } from "./ui";
import { Experiments } from "./home";
import {
  ArtGallery,
  ArtLineage,
  ArtistSections,
  EndCta,
  IntroExtras,
  TequilaSections,
} from "./section-showcase";
import { entrySlug, safeLinkHref } from "@/lib/content";
// Se reexporta para no romper el import que ya usa el portal.
export { ArtLineage };
export function SectionPage({ section }: { section: string }) {
  const { content: c } = useSite();
  const [filter, setFilter] = useState("All");
  const [query, setQuery] = useState("");
  const s =
    section === "play"
      ? "experiments"
      : section === "build-the-distillery"
        ? "mission"
        : section;
  const entries = (s === "story" ? c.stories : c.updates).filter(
    (e) => e.published,
  );
  const filtered = entries.filter(
    (e) =>
      (filter === "All" || e.category === filter) &&
      `${e.title} ${e.summary}`.toLowerCase().includes(query.toLowerCase()),
  );
  const entryEyebrow = (label: string) => (
    <span className="eyebrow">MINGLES / {label}</span>
  );
  return (
    <main id="main">
      {s === "tequila" || s === "art" ? (
        <IntroExtras
          section={s}
          eyebrow={entryEyebrow(s.toUpperCase())}
          title={<h1>{c.copy[`${s}.title`]}</h1>}
          body={c.copy[`${s}.body`]}
          rune="✳"
          ctaHref={
            s === "tequila"
              ? c.copy["tequila.intro.cta.href"]
              : c.copy["art.intro.cta.href"]
          }
          ctaLabel={
            s === "tequila"
              ? c.copy["tequila.intro.cta"]
              : c.copy["art.intro.cta"]
          }
        />
      ) : (
        <section className="page-intro">
          {entryEyebrow(
            s === "mission" ? c.copy["mission.eyebrow"] || "OUR NORTH STAR" : s.toUpperCase(),
          )}
          <h1>{c.copy[`${s}.title`]}</h1>
          <div className="intro-bottom">
            <p>{c.copy[`${s}.body`]}</p>
            <span className="intro-symbol" aria-hidden="true">
              ✳
            </span>
          </div>
        </section>
      )}
      {s === "tequila" && <TequilaSections />}
      {s === "art" && (
        <>
          <section className="section">
            <div className="section-heading">
              <div>
                <span className="eyebrow">{c.copy["art.lineage.eyebrow"]}</span>
                <h2>{c.copy["art.lineage.title"]}</h2>
              </div>
              <p>{c.copy["art.lineage.body"]}</p>
            </div>
            <ArtLineage />
            <ArtGallery />
          </section>
          <ArtistSections />
        </>
      )}
      {s === "experiments" && (
        <>
          <section className="section">
            <div className="flex-between section-heading">
              <span className="eyebrow">
                {c.copy["experiments.lab.title"] ||
                  "PVG IS THE LAB. MINGLES IS THE IDENTITY."}
              </span>
              <Status>Building</Status>
            </div>
            <Experiments />
          </section>
          <section className="section lined">
            <div className="section-heading">
              <h2>
                {c.copy["experiments.rules.title1"] || "WATCH THE BUILD."}
                <br />
                {c.copy["experiments.rules.title2"] || "KNOW THE RULES."}
              </h2>
              <p>
                {c.copy["experiments.rules.body"] ||
                  "The deep game experience lives with PVG. Participation only opens when rules, costs, limits, and official links are ready."}
              </p>
            </div>
            {c.projects
              .filter(
                (p) =>
                  !["art", "bottle", "protocol", "collection"].includes(p.id) &&
                  p.enabled,
              )
              .map((p) => (
                <article className="experiment-detail" id={p.id} key={p.id}>
                  <FlaskConical size={35} />
                  <div>
                    <span className="eyebrow">{p.eyebrow}</span>
                    <h3>{p.title}</h3>
                    <p>{p.description}</p>
                    <p className="muted">
                      {c.copy["experiments.rules.note"] ||
                        "Rules, fees, results, and any Mingles allocation: not yet published."}
                    </p>
                  </div>
                  <Status>{p.status}</Status>
                </article>
              ))}
          </section>
        </>
      )}
      {(s === "updates" || s === "story") && (
        <section className="section archive">
          <div className="archive-controls">
            <div className="filter-chips" aria-label="Filter entries">
              {[
                "All",
                ...(s === "story"
                  ? ["Event", "Party", "Collaboration", "Product"]
                  : [
                      "Art",
                      "Tequila",
                      "PVG",
                      "Protocol",
                      "Migration",
                      "Company",
                    ]),
              ].map((f) => (
                <button
                  aria-pressed={filter === f}
                  className={filter === f ? "selected" : ""}
                  onClick={() => setFilter(f)}
                  key={f}
                >
                  {f}
                </button>
              ))}
            </div>
            <label className="search">
              <Search size={17} />
              <input
                aria-label="Search entries"
                placeholder="Search the archive"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </label>
          </div>
          {filtered.length ? (
            <div className="entry-cards">
              {filtered.map((e) => (
                <Link
                  className="entry-card"
                  href={`/${s}/${entrySlug(e)}`}
                  key={e.id}
                >
                  {e.media ? (
                    <img
                      className="entry-card-bg"
                      src={e.media}
                      alt={e.alt ?? ""}
                      loading="lazy"
                      referrerPolicy="no-referrer"
                      onError={(ev) => {
                        // Sin foto la card sigue viéndose bien: se oculta solo la imagen.
                        ev.currentTarget.style.display = "none";
                      }}
                    />
                  ) : null}
                  <span className="entry-card-shade" aria-hidden="true" />
                  <div className="entry-card-body">
                    <span className="eyebrow">
                      {e.date} / {e.category}
                      {e.eventStatus === "upcoming" ? " / UPCOMING" : ""}
                    </span>
                    <h2>{e.title}</h2>
                    <span className="entry-card-cta">
                      {e.eventStatus === "upcoming"
                        ? c.copy["cards.eventDetails"] || "Event details"
                        : c.copy["cards.readMore"] || "Read more"}
                      <ArrowUpRight size={16} />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="archive-empty">
              <span aria-hidden="true">✳</span>
              <h2>
                {query || filter !== "All"
                  ? "NO MATCHES."
                  : "THE STORY IS STILL UNFOLDING."}
              </h2>
              <p>
                {query || filter !== "All"
                  ? "Try another category or search."
                  : "Approved stories and verified updates will appear here. No invented dates. No filler milestones."}
              </p>
              {(query || filter !== "All") && (
                <button
                  className="button"
                  onClick={() => {
                    setFilter("All");
                    setQuery("");
                  }}
                >
                  Clear filters <ArrowRight size={18} />
                </button>
              )}
            </div>
          )}
        </section>
      )}
      {s === "mission" && (
        <>
          <section className="section">
            <div className="three-grid">
              {[
                {
                  n: "01",
                  title: "protocol.engine1.title",
                  fallbackTitle: "CHARACTER IP",
                  body: "protocol.engine1.body",
                  fallbackBody:
                    "Mingles is the collectible identity at the center of everything we build.",
                },
                {
                  n: "02",
                  title: "protocol.engine2.title",
                  fallbackTitle: "THE EXPERIMENT LAB",
                  body: "protocol.engine2.body",
                  fallbackBody:
                    "PVG creates onchain experiments, with demand beyond the holder community.",
                },
                {
                  n: "03",
                  title: "protocol.engine3.title",
                  fallbackTitle: "REAL-WORLD TEQUILA",
                  body: "protocol.engine3.body",
                  fallbackBody:
                    "A physical product that carries the Mingles brand into the world.",
                },
              ].map((e) => (
                <article className="mission-card" key={e.n}>
                  <span className="eyebrow">
                    {c.copy["protocol.engine.label"] || "ENGINE"} {e.n}
                  </span>
                  <h2>{c.copy[e.title] || e.fallbackTitle}</h2>
                  <p>{c.copy[e.body] || e.fallbackBody}</p>
                </article>
              ))}
            </div>
          </section>
          <section className="section protocol-section">
            <Status>
              {c.projects.find((p) => p.id === "protocol")?.status ||
                "In development"}
            </Status>
            <h2>{c.copy["protocol.bridge.title"] || "THE FUTURE BRIDGE."}</h2>
            <p className="measure">
              {c.copy["protocol.bridge.body"] ||
                "Activation is being designed to connect eligible ownership to published allocations from selected systems. It will be opt-in. No economics are live."}
            </p>
            <div className="flow">
              {[
                ["protocol.flow.1", "Outside demand"],
                ["protocol.flow.2", "Tequila / PVG"],
                ["protocol.flow.3", "Published allocation"],
                ["protocol.flow.4", "Activated Mingles"],
                ["protocol.flow.5", "Distribution record"],
              ].map(([key, fallback], i) => (
                <div key={key}>
                  <span>0{i + 1}</span>
                  <strong>{c.copy[key] || fallback}</strong>
                  {i < 4 && <ArrowRight size={18} />}
                </div>
              ))}
            </div>
            <p className="muted">
              {c.copy["protocol.bridge.note"] ||
                "Future architecture only. Allocations, periods, fees, contracts, and eligibility remain subject to published rules and approval."}
            </p>
            <Button href="/portal">Explore the holder portal</Button>
          </section>
        </>
      )}
      {s === "tequila" || s === "art" ? (
        <EndCta section={s} />
      ) : (
        <section className="section end-cta">
          <span className="eyebrow">
            {c.copy["cta.band.eyebrow"] || "THE NEXT CHAPTER IS BEING BUILT."}
          </span>
          <Button
            href={safeLinkHref(
              c.copy["cta.band.href"] || "",
              s === "updates" ? "/build-the-distillery" : "/updates",
            )}
            dark
          >
            {c.copy["cta.band.label"] ||
              (s === "updates" ? "Build the Distillery" : "Follow the build")}
          </Button>
        </section>
      )}
    </main>
  );
}
