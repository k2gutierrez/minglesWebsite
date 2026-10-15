"use client";
/**
 * Bloques editables de Etapa 1 del PDF del cliente: hero shots de /tequila y
 * /art, la galería de la botella, el bloque "ROOTED IN AGAVE", el lineage de
 * Art y el contexto de Mike Lombard con su behind-the-scenes.
 *
 * Reglas de la casa que se respetan aquí:
 * - Todo campo nuevo es **opcional**. Si está vacío, el sitio se ve exactamente
 *   como antes; nunca queda un hueco roto ni aparece texto de relleno.
 * - Todo lo que viene del CMS es **dato**: los enlaces pasan por `safeHref` /
 *   `safeLinkHref` y las imágenes solo se pintan si son `https://` (o rutas
 *   internas), tal y como las dejó el normalizador.
 * - Los efectos reutilizan el lenguaje que ya existe (`TiltSurface`, `Reveal`,
 *   `prefers-reduced-motion`).
 */
import { useEffect, useRef, useState, type ReactNode } from "react";
import { ArrowLeft, ArrowRight, Pause, Play } from "lucide-react";
import { useSite } from "./provider";
import { ArrowLink, Button, EmptyMedia, Reveal, Status } from "./ui";
import { TiltSurface } from "./effects";
import {
  agaveDefaults,
  endCtaDefaults,
  eraDefaults,
  isHttpsUrl,
  MIKE_LOMBARD_URL,
  proofDefaults,
  safeLinkHref,
  tequilaDetailDefaults,
  type EraDetails,
  type Photo,
  type Slide,
} from "@/lib/content";

/** Imagen del CMS: solo se pinta si su URL pasó el filtro de seguridad. */
function SafeImage({
  photo,
  className,
  alt,
  loading = "lazy",
}: {
  photo: Photo;
  className: string;
  alt: string;
  loading?: "lazy" | "eager";
}) {
  if (!isHttpsUrl(photo.url)) return null;
  return (
    <img
      className={className}
      src={photo.url}
      alt={photo.alt || alt}
      loading={loading}
      referrerPolicy="no-referrer"
    />
  );
}
/** Carrusel de imágenes: el slide activo viene al frente y los vecinos se hunden. */
function Carousel({
  slides,
  label,
  autoplayLabel,
  eyebrow,
  heading,
}: {
  slides: Slide[];
  label: string;
  autoplayLabel: string;
  eyebrow?: string;
  heading?: string;
}) {
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [offsets, setOffsets] = useState(100);
  const trackRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const total = slides.length;
  const go = (next: number) => setIndex(((next % total) + total) % total);
  // Tamaño real de un slide para centrar el activo. Si no se puede medir (jsdom,
  // ancho 0) se usa el porcentaje: el transform también funciona con `%`.
  useEffect(() => {
    const measure = () => setOffsets(trackRef.current?.clientWidth ?? 100);
    measure();
    const observer = new ResizeObserver(measure);
    if (trackRef.current) observer.observe(trackRef.current);
    if (viewportRef.current) observer.observe(viewportRef.current);
    return () => observer.disconnect();
  }, []);
  // El autoplay es opcional, se apaga al pasar el ratón o al enfocar y respeta
  // `prefers-reduced-motion` (dos veces: al elegir el estado y al avanzar).
  useEffect(() => {
    if (!playing || hovered || total < 2) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setInterval(() => {
      if (document.hidden) return;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      setIndex((i) => (i + 1) % total);
    }, 4200);
    return () => window.clearInterval(id);
  }, [playing, hovered, total]);
  if (total < 4) return null;
  return (
    <Reveal>
      {(eyebrow || heading) && (
        <div className="section-heading gallery-heading">
          <div>
            {eyebrow ? <span className="eyebrow">{eyebrow}</span> : null}
            {heading ? <h2>{heading}</h2> : null}
          </div>
          <p className="muted">{label}</p>
        </div>
      )}
      <section
        className="tequila-carousel"
        aria-roledescription="carousel"
        aria-label={label}
        onPointerEnter={() => setHovered(true)}
        onPointerLeave={() => setHovered(false)}
        onFocus={() => setHovered(true)}
        onBlur={() => setHovered(false)}
        onKeyDown={(event) => {
          if (event.key === "ArrowRight") {
            event.preventDefault();
            go(index + 1);
          }
          if (event.key === "ArrowLeft") {
            event.preventDefault();
            go(index - 1);
          }
        }}
      >
        <div className="tequila-carousel-viewport" ref={viewportRef}>
          <div className="tequila-carousel-track" ref={trackRef}>
            {slides.map((slide, i) => {
              const offset = i - index;
              const active = offset === 0;
              return (
                <TiltSurface className="tequila-slide" key={i}>
                  <button
                    type="button"
                    className="tequila-slide-frame"
                    data-index={i}
                    aria-current={active ? "true" : undefined}
                    aria-label={`${label} — image ${i + 1} of ${total}`}
                    tabIndex={active ? 0 : -1}
                    onClick={() => go(i)}
                    style={{
                      transform: `translateX(${offset * offsets}%) translateZ(0) scale(${active ? 1 : 0.86})`,
                      opacity: Math.abs(offset) > 1 ? 0.35 : active ? 1 : 0.62,
                      zIndex: active ? 2 : 1,
                    }}
                  >
                    <img
                      src={slide.url}
                      alt={slide.alt || `${label} — image ${i + 1}`}
                      loading={i === 0 ? "eager" : "lazy"}
                      referrerPolicy="no-referrer"
                    />
                    {slide.caption ? (
                      <span className="tequila-slide-caption">
                        {slide.caption}
                      </span>
                    ) : null}
                  </button>
                </TiltSurface>
              );
            })}
          </div>
        </div>
        <div className="tequila-carousel-controls">
          <button
            type="button"
            className="icon-button"
            aria-label="Previous image"
            onClick={() => go(index - 1)}
          >
            <ArrowLeft size={17} />
          </button>
          <div className="tequila-dots">
            {slides.map((_, i) => (
              <button
                type="button"
                key={i}
                className={i === index ? "selected" : ""}
                aria-label={`Go to image ${i + 1}`}
                aria-current={i === index ? "true" : undefined}
                onClick={() => go(i)}
              />
            ))}
          </div>
          <span className="tequila-carousel-count" aria-live="polite">
            {String(index + 1).padStart(2, "0")} /{" "}
            {String(total).padStart(2, "0")}
          </span>
          <button
            type="button"
            className="icon-button"
            aria-label={autoplayLabel}
            aria-pressed={playing}
            onClick={() => setPlaying((p) => !p)}
          >
            {playing ? <Pause size={16} /> : <Play size={16} />}
          </button>
          <button
            type="button"
            className="icon-button"
            aria-label="Next image"
            onClick={() => go(index + 1)}
          >
            <ArrowRight size={17} />
          </button>
        </div>
      </section>
    </Reveal>
  );
}
/**
 * Copy de una sección: primero la clave nueva, después la antigua (para no
 * perder lo ya publicado y editado) y por último el texto que el sitio enseña.
 */
function useCopy() {
  const { content } = useSite();
  return (...keys: string[]) => {
    for (const key of keys) {
      const value = content.copy[key];
      if (typeof value === "string" && value.trim()) return value;
    }
    return "";
  };
}
function AgaveArt({ photo }: { photo: Photo }) {
  const copy = useCopy();
  // El salto de linea vive en el texto editable (el admin puede escribir en
  // varias lineas), no en un <br/> fijo: asi el texto se copia y se lee bien.
  const titleLines = (copy("tequila.agave.title") || "ROOTED\nIN AGAVE.").split("\n");
  const copyTitle = titleLines.flatMap((line, i) =>
    i === 0 ? [line] : [<br key={i} />, line],
  );
  // Sin imagen de fondo se mantiene el bloque actual: la planta dibujada y el
  // rótulo "PRODUCT PHOTOGRAPHY TO FOLLOW". Con imagen, el velo es el que
  // mantiene el texto legible.
  if (!isHttpsUrl(photo.url))
    return (
      <div className="tequila-art">
        <svg className="agave-plant" viewBox="0 0 120 120" aria-hidden="true">
          <path
            d="M20 96c18-4 34-14 44-28 11-15 14-34 9-52 14 9 22 24 22 41 0 10-3 19-8 27 9-6 16-15 20-26 1 25-12 44-34 52-15 6-33 5-48-2"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.2"
          />
          <path
            d="M64 68c-9-13-13-30-11-47 9 8 16 19 19 31 3-9 4-19 3-29 8 13 10 30 5 45-2 5-5 9-8 12"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.2"
          />
        </svg>
        <div className="tequila-art-copy">
          <span className="eyebrow">
            {copy("tequila.agave.eyebrow") || "REAL-WORLD SPIRIT"}
          </span>
          <strong>{copyTitle}</strong>
          <span>{copy("tequila.agave.note") || "PRODUCT PHOTOGRAPHY TO FOLLOW"}</span>
        </div>
      </div>
    );
  return (
    <div className="tequila-art agave-photo">
      <img
        className="agave-art-image"
        src={photo.url}
        alt={photo.alt || "Agave field"}
        loading="lazy"
        referrerPolicy="no-referrer"
      />
      <span className="agave-art-shade" aria-hidden="true" />
      <div className="tequila-art-copy">
        <span className="eyebrow">
          {copy("tequila.agave.eyebrow") || "REAL-WORLD SPIRIT"}
        </span>
        <strong>{copyTitle}</strong>
      </div>
    </div>
  );
}
export function TequilaSections() {
  const { content } = useSite();
  const copy = useCopy();
  const visuals = content.visuals ?? {};
  const detailBody = copy("tequila.detail.body", "tequila.body");
  const points = tequilaDetailDefaults.points.map((fallback, i) => ({
    title: copy(`tequila.detail.${i + 1}.title`) || fallback.title,
    body: copy(`tequila.detail.${i + 1}.body`) || fallback.body,
  }));
  const proof = {
    eyebrow: copy("tequila.proof.eyebrow") || proofDefaults.eyebrow,
    title: copy("tequila.proof.title") || proofDefaults.title,
    body: copy("tequila.proof.body") || proofDefaults.body,
  };
  const cta = {
    label: copy("tequila.detail.cta") || proofDefaults.ctaLabel,
    href: safeLinkHref(copy("tequila.detail.cta.href"), endCtaDefaults.href),
  };
  return (
    <>
      <section className="section">
        <div className="feature-grid">
          <AgaveArt
            photo={{
              url: visuals.agaveBackground,
              alt: visuals.agaveBackgroundAlt,
            }}
          />
          <div className="feature-copy">
            <Status>
              {copy("tequila.detail.status") ||
                content.projects.find((p) => p.id === "bottle")?.status ||
                agaveDefaults.status}
            </Status>
            <h2>{copy("tequila.detail.title") || agaveDefaults.title}</h2>
            <p>{detailBody || agaveDefaults.body}</p>
            <div className="detail-list">
              {points.map((point, i) => (
                <div key={i}>
                  <span>0{i + 1}</span>
                  <div>
                    <h3>{point.title}</h3>
                    <p>{point.body}</p>
                  </div>
                </div>
              ))}
            </div>
            <Button href={cta.href}>{cta.label}</Button>
          </div>
        </div>
      </section>
      {visuals.tequilaGallery && visuals.tequilaGallery.length >= 4 ? (
        <section className="section lined">
          <Carousel
            slides={visuals.tequilaGallery}
            label={copy("tequila.gallery.label") || "Tequila gallery"}
            autoplayLabel={copy("tequila.gallery.autoplay") || "Autoplay"}
            eyebrow={copy("tequila.gallery.eyebrow")}
            heading={copy("tequila.gallery.heading")}
          />
        </section>
      ) : null}
      <section className="section lined">
        <span className="eyebrow">{proof.eyebrow}</span>
        <h2>{proof.title}</h2>
        <div className="three-grid">
          {proofDefaults.cards.map((fallback, i) => {
            const title =
              copy(`tequila.proof.card.${i + 1}.title`) || fallback.title;
            const tagline = copy(`tequila.proof.card.${i + 1}.tagline`);
            return tagline ? (
              <div className="proof-card" key={i}>
                <h3>{title}</h3>
                <p>{tagline}</p>
              </div>
            ) : (
              <EmptyMedia key={i} kind={title} />
            );
          })}
        </div>
        <p className="muted">{proof.body}</p>
      </section>
    </>
  );
}
/** Las tres eras del lineage. Los fondos y textos los sube el admin. */
/**
 * Galeria de fotos de la seccion de Art, editable desde el panel.
 * Se monta a partir de 4 imagenes, igual que la de Tequila, y reutiliza el mismo
 * carrusel (ya probado): sin fotos, la seccion queda exactamente como estaba.
 */
export function ArtGallery() {
  const { content } = useSite();
  const copy = useCopy();
  const slides = content.visuals?.artGallery;
  if (!slides || slides.length < 4) return null;
  return (
    <section className="section lined">
      <Carousel
        slides={slides}
        label={copy("art.gallery.label") || "Art gallery"}
        autoplayLabel={copy("art.gallery.autoplay") || "Autoplay"}
        eyebrow={copy("art.gallery.eyebrow")}
        heading={copy("art.gallery.heading")}
      />
    </section>
  );
}
export function ArtLineage() {
  const { content } = useSite();
  const [era, setEra] = useState(0);
  const eras: (EraDetails & { title: string; body: string; status: string })[] =
    eraDefaults.map((fallback, i) => {
      const stored = content.visuals?.eras?.[i];
      return {
        ...stored,
        title: stored?.title || fallback.title,
        body: stored?.body || fallback.body,
        status: stored?.status || fallback.status,
      };
    });
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
            key={i}
          >
            {e.title}
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
        {isHttpsUrl(eras[era].image) ? (
          <img
            className="era-image"
            src={eras[era].image}
            alt={eras[era].imageAlt || eras[era].title}
            loading="lazy"
            referrerPolicy="no-referrer"
          />
        ) : (
          <EmptyMedia kind={eras[era].title} />
        )}
        <div>
          <span className="eyebrow">0{era + 1} / THE COLLECTION EVOLVES</span>
          <h3>{eras[era].title}</h3>
          <p>{eras[era].body}</p>
          <Status>{eras[era].status}</Status>
        </div>
      </div>
    </div>
  );
}
/** Contexto de Mike Lombard: retrato, bio, behind-the-scenes y CTA al portfolio. */
function ArtistSections() {
  const { content } = useSite();
  const copy = useCopy();
  const artist = content.visuals?.artist ?? {};
  const behind = artist.behindScenes ?? [];
  const name = copy("art.artist.name") || artist.name || "Mike Lombard";
  const portfolio = copy("art.artist.portfolio") || "Mike Lombard's portfolio";
  // El CTA al portfolio es obligatorio: si el admin escribe algo que no es una
  // ruta interna ni https, se cae al portfolio real en vez de publicarlo.
  const portfolioHref = safeLinkHref(
    copy("art.artist.portfolio.href"),
    MIKE_LOMBARD_URL,
  );
  const revealHref = safeLinkHref(
    copy("art.artist.cta.href"),
    endCtaDefaults.href,
  );
  return (
    <>
      <section className="section coral-section">
        <div className="feature-grid">
          <div>
            <span className="eyebrow">
              {copy("art.artist.eyebrow") || "THE ARTIST / MIKE LOMBARD"}
            </span>
            <h2>
              {copy("art.artist.title") || "MORE CHARACTER.\nMORE MINGLES."}
            </h2>
            {isHttpsUrl(artist.portrait) ? (
              <figure className="artist-portrait">
                <img
                  src={artist.portrait}
                  alt={artist.portraitAlt || name}
                  loading="lazy"
                  referrerPolicy="no-referrer"
                />
                <figcaption>{name}</figcaption>
              </figure>
            ) : null}
          </div>
          <div>
            <p>{copy("art.artist.body")}</p>
            <p>{copy("art.artist.body2")}</p>
            {artist.bio ? <p className="artist-bio">{artist.bio}</p> : null}
            <div className="artist-actions">
              <Button href={revealHref}>
                {copy("art.artist.cta") || "Follow the reveals"}
              </Button>
              <a
                className="text-link"
                href={portfolioHref}
                target="_blank"
                rel="noreferrer noopener"
              >
                {portfolio}
                <ArrowRight size={17} />
              </a>
            </div>
          </div>
        </div>
      </section>
      {behind.length ? (
        <section className="section lined" aria-label="Behind the scenes">
          <div className="section-heading">
            <h2>{copy("art.artist.bts.heading") || "BEHIND THE SCENES."}</h2>
            <p>{copy("art.artist.bts.body")}</p>
          </div>
          <div className="bts-grid">
            {behind.map((slide, i) => (
              <TiltSurface className="bts-card" key={i}>
                <img
                  src={slide.url}
                  alt={slide.alt || `${name} — behind the scenes ${i + 1}`}
                  loading="lazy"
                  referrerPolicy="no-referrer"
                />
                {slide.caption ? (
                  <span className="bts-caption">{slide.caption}</span>
                ) : null}
              </TiltSurface>
            ))}
          </div>
        </section>
      ) : null}
    </>
  );
}
/** Cabecera de sección con su CTA enlazable. */
export function EndCta({ section }: { section: "tequila" | "art" }) {
  const copy = useCopy();
  return (
    <section className="section end-cta">
      <span className="eyebrow">
        {copy(`${section}.end.eyebrow`) || endCtaDefaults.eyebrow}
      </span>
      <Button
        href={safeLinkHref(
          copy(`${section}.end.cta.href`),
          endCtaDefaults.href,
        )}
        dark
      >
        {copy(`${section}.end.cta`) || endCtaDefaults.label}
      </Button>
    </section>
  );
}
/**
 * Todo el intro de una sección: eyebrow, titular, cuerpo, símbolo, CTA del
 * intro y hero shot. Sin imagen (y sin CTA propio) el marcado es idéntico al de
 * antes; con imagen, el intro pasa a dos columnas.
 */
export function IntroExtras({
  section,
  eyebrow,
  title,
  body,
  rune,
  ctaHref,
  ctaLabel,
}: {
  section: "tequila" | "art";
  eyebrow: ReactNode;
  title: ReactNode;
  body: ReactNode;
  /** Símbolo que hoy cierra el intro; se conserva cuando no hay hero shot. */
  rune: ReactNode;
  ctaHref?: string;
  ctaLabel?: string;
}) {
  const { content } = useSite();
  const visuals = content.visuals ?? {};
  const photo: Photo =
    section === "tequila"
      ? { url: visuals.tequilaHeroShot, alt: visuals.tequilaHeroAlt }
      : { url: visuals.artHeroShot, alt: visuals.artHeroAlt };
  const hasPhoto = isHttpsUrl(photo.url);
  const href = safeLinkHref(ctaHref ?? "");
  const cta = href ? (
    <div className="intro-cta">
      <ArrowLink href={href}>{ctaLabel}</ArrowLink>
    </div>
  ) : null;
  return (
    <section className={`page-intro${hasPhoto ? " page-intro-has-shot" : ""}`}>
      <div className="page-intro-main">
        {eyebrow}
        {title}
        <div className="intro-bottom">
          <p>{body}</p>
          {!hasPhoto ? (
            <span className="intro-symbol" aria-hidden="true">
              {rune}
            </span>
          ) : null}
        </div>
        {cta}
      </div>
      {hasPhoto ? (
        <TiltSurface className="intro-shot">
          <SafeImage
            photo={photo}
            className="intro-shot-image"
            alt={
              section === "tequila"
                ? "Mingles tequila bottle"
                : "New Mingles artwork by Mike Lombard"
            }
          />
        </TiltSurface>
      ) : null}
    </section>
  );
}
export { ArtistSections };
