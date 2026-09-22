"use client";
import Link from "next/link";
import {
  ArrowUpRight,
  ArrowDown,
  FlaskConical,
  Fingerprint,
  Sprout,
  Plus,
  Orbit,
  Layers,
} from "lucide-react";
import { useSite } from "./provider";
import { BrandArt, Button, Status, Reveal, ArrowLink, EmptyMedia } from "./ui";
import { TiltSurface } from "./effects";
import { safeHref, type Item } from "@/lib/content";
export function ProjectCard({ item, index }: { item: Item; index: number }) {
  const Icon = [Fingerprint, Sprout, Orbit, Layers][index % 4];
  return (
    <TiltSurface className={`build-tile build-tile-${index}`}>
      <Link className="project-card" href={safeHref(item.href)}>
        <div className="project-top">
          <span>M / 00{index + 1}</span>
          <ArrowUpRight size={19} />
        </div>
        <div className="project-graphic" aria-hidden="true">
          <span className="graphic-orbit" />
          <span className="graphic-orbit graphic-orbit-two" />
          <Icon size={82} strokeWidth={0.9} />
          <span className="graphic-coordinate">
            {["IDENTITY", "REAL WORLD", "ONCHAIN", "EVOLUTION"][index % 4]}
          </span>
        </div>
        <div className="card-content">
          <span className="eyebrow">{item.eyebrow}</span>
          <h3>{item.title}</h3>
          <p>{item.description}</p>
          <div className="card-bottom">
            <Status>{item.status}</Status>
            <span>EXPLORE ↗</span>
          </div>
        </div>
      </Link>
    </TiltSurface>
  );
}
export function Experiments() {
  const { content } = useSite();
  return (
    <div className="experiment-grid">
      {content.projects
        .filter(
          (p) =>
            !["art", "bottle", "protocol", "collection"].includes(p.id) &&
            p.enabled,
        )
        .map((p, i) => (
          <TiltSurface className="experiment" key={p.id}>
            <div className={`experiment-visual experiment-${i % 2}`}>
              {p.media ? (
                <img
                  className="card-image"
                  src={p.media}
                  alt={p.alt || p.title}
                />
              ) : (
                <>
                  <span className="experiment-index">PVG — 0{i + 1}</span>
                  <span className="experiment-symbol" aria-hidden="true">
                    {i === 0 ? "✳" : "↯"}
                  </span>
                  <span className="experiment-caption">
                    IDENTITY STUDY / GAME MEDIA PENDING
                  </span>
                </>
              )}
            </div>
            <div className="experiment-copy">
              <div className="flex-between">
                <h3>{p.title}</h3>
                <Status>{p.status}</Status>
              </div>
              <p>{p.description}</p>
              <ArrowLink
                href={
                  p.href === "/experiments" ? `/experiments#${p.id}` : p.href
                }
              >
                View experiment
              </ArrowLink>
            </div>
          </TiltSurface>
        ))}
    </div>
  );
}
export function Home() {
  const { content: c } = useSite();
  const copy = (key: string) => c.copy[key];
  return (
    <main id="main">
      <section className="hero">
        <div className="hero-copy">
          <div className="eyebrow">
            <span className="tiny-star">✳</span>
            {c.hero.eyebrow}
          </div>
          <h1>
            {c.hero.title.split("\n").map((line, i) => (
              <span key={i}>{line}</span>
            ))}
          </h1>
          <p>{c.hero.description}</p>
          <div className="hero-actions">
            <Button href="#building" dark>
              {c.hero.primary}
            </Button>
            <ArrowLink href="/story">{c.hero.secondary}</ArrowLink>
          </div>
          <div className="hero-foot">
            <span>THE WORLD OF MINGLES</span>
            <a href="#building" aria-label="Scroll to building now">
              <ArrowDown size={18} />
            </a>
          </div>
        </div>
        <BrandArt />
      </section>
      <div className="ticker" aria-hidden="true">
        <div>
          {Array.from({ length: 4 }, (_, i) => (
            <span key={i}>
              TEQUILA WITH CHARACTER <b>✳</b> CHARACTER WITH SPIRIT <b>✳</b>{" "}
              BUILD THE DISTILLERY <b>✳</b>{" "}
            </span>
          ))}
        </div>
      </div>
      {c.modules
        .filter((m) => m.enabled)
        .map((m) => {
          switch (m.id) {
            case "state":
              return (
                <section
                  id="building"
                  className="section state-section"
                  key={m.id}
                >
                  <Reveal>
                    <div className="section-heading">
                      <div>
                        <span className="eyebrow">
                          THE NEXT CHAPTER / BUILDING NOW
                        </span>
                        <h2>{copy("home.state.title")}</h2>
                      </div>
                      <p>{copy("home.state.body")}</p>
                    </div>
                    <div className="project-grid">
                      {c.projects
                        .filter(
                          (p) =>
                            [
                              "art",
                              "bottle",
                              "protocol",
                              "collection",
                            ].includes(p.id) && p.enabled,
                        )
                        .map((p, i) => (
                          <ProjectCard item={p} index={i} key={p.id} />
                        ))}
                    </div>
                    <div className="small-note">
                      STATUS BASIS: SEPTEMBER 2026 PRODUCT BRIEF{" "}
                      <span>PROGRESS, NOT PROMISES.</span>
                    </div>
                  </Reveal>
                </section>
              );
            case "tequila":
              return (
                <section className="section feature-section" key={m.id}>
                  <Reveal>
                    <div className="feature-grid">
                      <div className="tequila-art">
                        {c.projects.find((p) => p.id === "bottle")?.media ? (
                          <img
                            className="feature-image"
                            src={
                              c.projects.find((p) => p.id === "bottle")?.media
                            }
                            alt={
                              c.projects.find((p) => p.id === "bottle")?.alt ||
                              "Mingles bottle"
                            }
                          />
                        ) : (
                          <>
                            <Sprout strokeWidth={0.65} aria-hidden="true" />
                            <span className="vertical-type">
                              ROOTED IN SOMETHING REAL
                            </span>
                            <div className="tequila-art-copy">
                              <span className="eyebrow">
                                THE MINGLES SPIRIT
                              </span>
                              <strong>
                                AGAVE
                                <br />& ATTITUDE.
                              </strong>
                              <span>OFFICIAL BOTTLE REVEAL TO FOLLOW ↗</span>
                            </div>
                          </>
                        )}
                      </div>
                      <div className="feature-copy">
                        <span className="eyebrow">
                          {copy("tequila.kicker")}
                        </span>
                        <h2>{copy("tequila.title")}</h2>
                        <p>{copy("tequila.body")}</p>
                        <Status>
                          {c.projects.find((p) => p.id === "bottle")?.status ||
                            "Building"}
                        </Status>
                        <div className="feature-details">
                          <span>THE BOTTLE</span>
                          <Plus size={14} />
                          <span>THE CAP</span>
                          <Plus size={14} />
                          <span>THE EXPERIENCE</span>
                        </div>
                        <Button href="/tequila" dark>
                          {copy("tequila.cta")}
                        </Button>
                      </div>
                    </div>
                  </Reveal>
                </section>
              );
            case "art":
              return (
                <section className="section art-section" key={m.id}>
                  <Reveal>
                    <div className="feature-grid reverse">
                      <div className="feature-copy">
                        <span className="eyebrow">{copy("art.kicker")}</span>
                        <h2>{copy("art.title")}</h2>
                        <p>{copy("art.body")}</p>
                        <p className="artist-credit">
                          ART DIRECTION / MIKE LOMBARD
                        </p>
                        <Button href="/art">{copy("art.cta")}</Button>
                      </div>
                      <div className="art-lineage-preview">
                        {c.projects.find((p) => p.id === "art")?.media ? (
                          <img
                            className="official-art"
                            src={c.projects.find((p) => p.id === "art")?.media}
                            alt={
                              c.projects.find((p) => p.id === "art")?.alt ||
                              "Official Mingles art"
                            }
                          />
                        ) : (
                          <>
                            <span className="eyebrow">
                              THE EVOLUTION CONTINUES
                            </span>
                            <div className="lineage-marks">
                              <span>M</span>
                              <span>→</span>
                              <span>?</span>
                            </div>
                            <div className="flex-between">
                              <span>LEGACY → APECHAIN → LOMBARD</span>
                              <Fingerprint size={25} />
                            </div>
                            <small>
                              Official character reveals awaiting publication.
                            </small>
                          </>
                        )}
                      </div>
                    </div>
                  </Reveal>
                </section>
              );
            case "experiments":
              return (
                <section className="section" key={m.id}>
                  <Reveal>
                    <div className="section-heading">
                      <div>
                        <span className="eyebrow">03 / THE EXPERIMENT LAB</span>
                        <h2>{copy("experiments.title")}</h2>
                      </div>
                      <div>
                        <p>{copy("experiments.body")}</p>
                        <ArrowLink href="/experiments">
                          Inside the lab
                        </ArrowLink>
                      </div>
                    </div>
                    <Experiments />
                  </Reveal>
                </section>
              );
            case "protocol":
              return (
                <section className="section protocol-section" key={m.id}>
                  <Reveal>
                    <div className="protocol-layout">
                      <div className="protocol-icon">
                        <Fingerprint size={125} strokeWidth={0.65} />
                      </div>
                      <div>
                        <Status>
                          {c.projects.find((p) => p.id === "protocol")
                            ?.status || "In development"}
                        </Status>
                        <h2>{copy("protocol.title")}</h2>
                        <p>{copy("protocol.body")}</p>
                        <ArrowLink href="/build-the-distillery">
                          See how it connects
                        </ArrowLink>
                      </div>
                      <span className="vertical-type">
                        MINGLES PROTOCOL / NOT LIVE
                      </span>
                    </div>
                  </Reveal>
                </section>
              );
            case "story":
              return (
                <section className="section" key={m.id}>
                  <div className="section-heading">
                    <div>
                      <span className="eyebrow">BUILT THROUGH PEOPLE</span>
                      <h2>{copy("story.title")}</h2>
                    </div>
                    <div>
                      <p>{copy("story.body")}</p>
                      <ArrowLink href="/story">Explore our history</ArrowLink>
                    </div>
                  </div>
                </section>
              );
            case "updates":
              return (
                <section className="section updates-home" key={m.id}>
                  <div className="section-heading">
                    <div>
                      <span className="eyebrow">FROM THE BUILD LOG</span>
                      <h2>LATEST MOVES.</h2>
                    </div>
                    <ArrowLink href="/updates">All updates</ArrowLink>
                  </div>
                  {c.updates
                    .filter((u) => u.published)
                    .slice(0, 3)
                    .map((u) => (
                      <Link
                        className="update-row"
                        href={`/updates#${u.id}`}
                        key={u.id}
                      >
                        <span>
                          {u.category} / {u.date}
                        </span>
                        <h3>{u.title}</h3>
                        <ArrowUpRight />
                      </Link>
                    ))}
                  {!c.updates.some((u) => u.published) && (
                    <div className="empty-inline">
                      <FlaskConical size={24} />
                      <div>
                        <h3>The next chapter is taking shape.</h3>
                        <p>
                          Verified updates will appear here as they are
                          published.
                        </p>
                      </div>
                      <Status>Building</Status>
                    </div>
                  )}
                </section>
              );
            case "holder":
              return (
                <section className="holder-cta" key={m.id}>
                  <span className="eyebrow">
                    FOR THE ONES WHO OWN THE WEIRD
                  </span>
                  <h2>{copy("holder.title")}</h2>
                  <p>{copy("holder.body")}</p>
                  <Button href="/portal" dark>
                    Enter holder portal
                  </Button>
                  <span className="holder-star" aria-hidden="true">
                    ✳
                  </span>
                </section>
              );
            default:
              return null;
          }
        })}
    </main>
  );
}
