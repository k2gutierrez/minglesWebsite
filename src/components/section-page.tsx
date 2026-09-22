"use client";
import { useState } from "react";
import {
  ArrowUpRight,
  ArrowRight,
  Fingerprint,
  Sprout,
  FlaskConical,
  Search,
} from "lucide-react";
import { useSite } from "./provider";
import { Button, Status, EmptyMedia, ArrowLink, Reveal } from "./ui";
import { Experiments } from "./home";
import { safeHref } from "@/lib/content";
const eras = ["Legacy PFP", "ApeChain", "Lombard era"];
export function ArtLineage() {
  const [era, setEra] = useState(0);
  return (
    <div className="lineage">
      <div className="tabs" role="tablist" aria-label="Art era">
        {eras.map((e, i) => (
          <button
            role="tab"
            id={`era-${i}`}
            aria-selected={era === i}
            aria-controls="era-panel"
            tabIndex={era === i ? 0 : -1}
            onKeyDown={(event) => {
              if (["ArrowRight", "ArrowLeft"].includes(event.key)) {
                event.preventDefault();
                const next = (i + (event.key === "ArrowRight" ? 1 : 2)) % 3;
                setEra(next);
                document.getElementById(`era-${next}`)?.focus();
              }
            }}
            onClick={() => setEra(i)}
            key={e}
          >
            {e}
          </button>
        ))}
      </div>
      <div
        id="era-panel"
        role="tabpanel"
        aria-labelledby={`era-${era}`}
        className="era-panel"
        key={era}
      >
        <EmptyMedia kind={eras[era]} />
        <div>
          <span className="eyebrow">0{era + 1} / THE COLLECTION EVOLVES</span>
          <h3>{eras[era]}</h3>
          <p>
            {
              [
                "The original collectible identity. The beginning of the Mingles story, preserved as part of its provenance.",
                "The current official ApeChain chapter. Verified token art will appear with ownership and provenance data.",
                "Incoming authored character art by Mike Lombard. Same recognizable DNA, a new creative chapter.",
              ][era]
            }
          </p>
          <Status>
            {era === 2 ? "Reveal pending" : "Official assets pending"}
          </Status>
        </div>
      </div>
    </div>
  );
}
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
  return (
    <main id="main">
      <section className="page-intro">
        <span className="eyebrow">
          MINGLES / {s === "mission" ? "OUR NORTH STAR" : s.toUpperCase()}
        </span>
        <h1>{c.copy[`${s}.title`]}</h1>
        <div className="intro-bottom">
          <p>{c.copy[`${s}.body`]}</p>
          <span className="intro-symbol" aria-hidden="true">
            ✳
          </span>
        </div>
      </section>
      {s === "tequila" && (
        <>
          <section className="section">
            <div className="feature-grid">
              <div className="tequila-art">
                <Sprout strokeWidth={0.65} />
                <div className="tequila-art-copy">
                  <span className="eyebrow">REAL-WORLD SPIRIT</span>
                  <strong>
                    ROOTED
                    <br />
                    IN AGAVE.
                  </strong>
                  <span>PRODUCT PHOTOGRAPHY TO FOLLOW</span>
                </div>
              </div>
              <div className="feature-copy">
                <Status>
                  {c.projects.find((p) => p.id === "bottle")?.status ||
                    "Building"}
                </Status>
                <h2>
                  THE SPIRIT.
                  <br />
                  THE SURPRISE.
                </h2>
                <p>
                  A bottle that belongs in the real world. A collectible cap
                  that belongs in the Mingles universe.
                </p>
                <div className="detail-list">
                  <div>
                    <span>01</span>
                    <div>
                      <h3>The bottle</h3>
                      <p>
                        Product details will be published with verified
                        production information.
                      </p>
                    </div>
                  </div>
                  <div>
                    <span>02</span>
                    <div>
                      <h3>Reveal your Mingle</h3>
                      <p>
                        The collectible cap is the signature moment. The full
                        reveal comes with the real product.
                      </p>
                    </div>
                  </div>
                  <div>
                    <span>03</span>
                    <div>
                      <h3>The whole experience</h3>
                      <p>
                        Packaging, unboxing, and the details that make it
                        Mingles.
                      </p>
                    </div>
                  </div>
                </div>
                <Button href="/updates">Follow the build</Button>
              </div>
            </div>
          </section>
          <section className="section lined">
            <span className="eyebrow">PRODUCT FIRST</span>
            <h2>PROOF AT EVERY STEP.</h2>
            <div className="three-grid">
              {[
                "Bottle & cap",
                "Packaging & unboxing",
                "Production & testing",
              ].map((t) => (
                <EmptyMedia key={t} kind={t} />
              ))}
            </div>
            <p className="muted">
              Launch information, availability, and retail channels will be
              published when confirmed.
            </p>
          </section>
        </>
      )}
      {s === "art" && (
        <>
          <section className="section">
            <div className="section-heading">
              <div>
                <span className="eyebrow">THREE CHAPTERS. ONE IDENTITY.</span>
                <h2>
                  AN EVOLUTION.
                  <br />
                  STILL A MINGLE.
                </h2>
              </div>
              <p>
                Explore the lineage. Each era is part of the story; official art
                is shown only when approved.
              </p>
            </div>
            <ArtLineage />
          </section>
          <section className="section coral-section">
            <div className="feature-grid">
              <div>
                <span className="eyebrow">THE ARTIST / MIKE LOMBARD</span>
                <h2>
                  MORE CHARACTER.
                  <br />
                  MORE MINGLES.
                </h2>
              </div>
              <div>
                <p>
                  The new art direction builds a stronger foundation for
                  character IP: weird, irreverent creatures of the agave that
                  can live in collectibles, product, and play.
                </p>
                <p>
                  Collection and migration details will follow once the official
                  rules are finalized.
                </p>
                <ArrowLink href="/updates">Follow the reveals</ArrowLink>
              </div>
            </div>
          </section>
        </>
      )}
      {s === "experiments" && (
        <>
          <section className="section">
            <div className="flex-between section-heading">
              <span className="eyebrow">
                PVG IS THE LAB. MINGLES IS THE IDENTITY.
              </span>
              <Status>Building</Status>
            </div>
            <Experiments />
          </section>
          <section className="section lined">
            <div className="section-heading">
              <h2>
                WATCH THE BUILD.
                <br />
                KNOW THE RULES.
              </h2>
              <p>
                The deep game experience lives with PVG. Participation only
                opens when rules, costs, limits, and official links are ready.
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
                      Rules, fees, results, and any Mingles allocation: not yet
                      published.
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
            filtered.map((e) => (
              <article className="archive-entry" id={e.id} key={e.id}>
                <span className="eyebrow">
                  {e.date} / {e.category}
                </span>
                <h2>{e.title}</h2>
                <p>{e.summary}</p>
                {e.proof && (
                  <a
                    className="text-link"
                    href={safeHref(e.proof)}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View proof <ArrowUpRight size={17} />
                  </a>
                )}
              </article>
            ))
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
                [
                  "01",
                  "CHARACTER IP",
                  "Mingles is the collectible identity at the center of everything we build.",
                ],
                [
                  "02",
                  "THE EXPERIMENT LAB",
                  "PVG creates onchain experiments, with demand beyond the holder community.",
                ],
                [
                  "03",
                  "REAL-WORLD TEQUILA",
                  "A physical product that carries the Mingles brand into the world.",
                ],
              ].map(([n, title, body]) => (
                <article className="mission-card" key={n}>
                  <span className="eyebrow">ENGINE {n}</span>
                  <h2>{title}</h2>
                  <p>{body}</p>
                </article>
              ))}
            </div>
          </section>
          <section className="section protocol-section">
            <Status>
              {c.projects.find((p) => p.id === "protocol")?.status ||
                "In development"}
            </Status>
            <h2>THE FUTURE BRIDGE.</h2>
            <p className="measure">
              Activation is being designed to connect eligible ownership to
              published allocations from selected systems. It will be opt-in. No
              economics are live.
            </p>
            <div className="flow">
              {[
                "Outside demand",
                "Tequila / PVG",
                "Published allocation",
                "Activated Mingles",
                "Distribution record",
              ].map((v, i) => (
                <div key={v}>
                  <span>0{i + 1}</span>
                  <strong>{v}</strong>
                  {i < 4 && <ArrowRight size={18} />}
                </div>
              ))}
            </div>
            <p className="muted">
              Future architecture only. Allocations, periods, fees, contracts,
              and eligibility remain subject to published rules and approval.
            </p>
            <Button href="/portal">Explore the holder portal</Button>
          </section>
        </>
      )}
      <section className="section end-cta">
        <span className="eyebrow">THE NEXT CHAPTER IS BEING BUILT.</span>
        <Button
          href={s === "updates" ? "/build-the-distillery" : "/updates"}
          dark
        >
          {s === "updates" ? "Build the Distillery" : "Follow the build"}
        </Button>
      </section>
    </main>
  );
}
