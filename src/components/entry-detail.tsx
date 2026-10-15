import Link from "next/link";
import { ArrowLeft, ArrowUpRight, MapPin, CalendarDays, Ticket } from "lucide-react";
import { isHttpsUrl, safeHref, type Entry } from "@/lib/content";

/**
 * Detalle de una entrada de Story o Updates.
 *
 * Es un componente de servidor a propósito: no necesita estado y así la página
 * se renderiza en el servidor (mejor para compartir el enlace de un evento).
 *
 * Seguridad: todo lo que viene del CMS se trata como dato, nunca como marcado.
 * Las imágenes y los enlaces solo se pintan si son `https://`; el vídeo se
 * incrusta **solo** de proveedores conocidos y, si no, se muestra como enlace.
 */
const VIDEO_PROVIDERS: { match: RegExp; embed: (id: string) => string }[] = [
  {
    match: /^(?:https:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([\w-]{6,})/,
    embed: (id) => `https://www.youtube-nocookie.com/embed/${id}`,
  },
  {
    match: /^(?:https:\/\/)?(?:www\.)?youtu\.be\/([\w-]{6,})/,
    embed: (id) => `https://www.youtube-nocookie.com/embed/${id}`,
  },
  {
    match: /^(?:https:\/\/)?(?:www\.)?vimeo\.com\/(\d{6,})/,
    embed: (id) => `https://player.vimeo.com/video/${id}`,
  },
];

function videoEmbed(url: string): string | null {
  if (!isHttpsUrl(url)) return null;
  for (const provider of VIDEO_PROVIDERS) {
    const found = provider.match.exec(url);
    if (found?.[1]) return provider.embed(found[1]);
  }
  return null;
}

function formatDate(value: string) {
  const date = new Date(`${value}T12:00:00Z`);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}

/**
 * Respeta los saltos de linea que escribe el admin.
 *
 * HTML colapsa los saltos, asi que un texto con parrafos salia todo corrido en
 * un solo bloque. Aqui se separa por **linea en blanco** en parrafos, y los
 * saltos simples dentro de un parrafo se conservan con `white-space: pre-line`
 * (ver `.entry-detail-lead` en site-cards.css). Asi funciona tanto si separa
 * los parrafos con una linea en blanco como si usa saltos simples.
 *
 * Es texto, nunca marcado: no hay HTML crudo ni innerHTML.
 */
/**
 * Articulo: parrafos con imagenes intercaladas.
 *
 * El cliente lo pidio asi: "1-2 parrafos, luego unas imagenes, luego 2 parrafos
 * mas, luego imagenes". Antes todo el texto iba junto y despues todas las fotos
 * (una entrada tiene 14 parrafos y 20 imagenes: se veia como un muro de texto
 * seguido de un muro de fotos).
 *
 * Se agrupan los parrafos de dos en dos y las imagenes se reparten **de manera
 * pareja** entre los bloques: con 3 filas y 7 bloques caen despues de los
 * bloques 0, 2 y 4, no todas al principio.
 */
const PARAGRAPHS_PER_BLOCK = 2;
const MAX_IMAGES_PER_ROW = 3;

function Article({ text, images }: { text: string; images: string[] }) {
  const paragraphs = text
    .split(/\n\s*\n/)
    .map((block) => block.trim())
    .filter(Boolean);

  const blocks: string[][] = [];
  for (let i = 0; i < paragraphs.length; i += PARAGRAPHS_PER_BLOCK) {
    blocks.push(paragraphs.slice(i, i + PARAGRAPHS_PER_BLOCK));
  }

  // Filas de imagenes, repartidas parejo entre los bloques.
  const rows: string[][] = [];
  if (blocks.length && images.length) {
    const perRow = Math.max(
      1,
      Math.min(MAX_IMAGES_PER_ROW, Math.ceil(images.length / blocks.length)),
    );
    for (let i = 0; i < images.length; i += perRow)
      rows.push(images.slice(i, i + perRow));
  }
  const rowsAfterBlock = new Map<number, string[][]>();
  rows.forEach((row, index) => {
    const target = Math.min(
      blocks.length - 1,
      Math.floor((index * blocks.length) / rows.length),
    );
    rowsAfterBlock.set(target, [...(rowsAfterBlock.get(target) ?? []), row]);
  });

  const figureRow = (row: string[], key: string) => (
    <div className="entry-figure-row" data-count={row.length} key={key}>
      {row.map((url) => (
        <img key={url} src={url} alt="" loading="lazy" referrerPolicy="no-referrer" />
      ))}
    </div>
  );

  if (!blocks.length) {
    // Sin texto: las imagenes se muestran juntas, como antes.
    if (!images.length) return null;
    return (
      <section className="entry-detail-gallery">
        <span className="eyebrow">GALLERY</span>
        <div className="entry-detail-grid">
          {images.map((url) => (
            <img key={url} src={url} alt="" loading="lazy" referrerPolicy="no-referrer" />
          ))}
        </div>
      </section>
    );
  }

  return (
    <>
      {blocks.map((block, blockIndex) => (
        <div className="entry-block" key={blockIndex}>
          {block.map((paragraph, paragraphIndex) => (
            <p className="entry-detail-lead" key={paragraphIndex}>
              {paragraph}
            </p>
          ))}
          {(rowsAfterBlock.get(blockIndex) ?? []).map((row, rowIndex) =>
            figureRow(row, `b${blockIndex}-r${rowIndex}`),
          )}
        </div>
      ))}
    </>
  );
}

export function EntryDetail({
  entry,
  kind,
}: {
  entry: Entry;
  kind: "story" | "updates";
}) {
  const backHref = kind === "story" ? "/story" : "/updates";
  const backLabel = kind === "story" ? "All stories" : "All updates";
  const embed = entry.video ? videoEmbed(entry.video) : null;
  const gallery = (entry.gallery ?? []).filter(isHttpsUrl);

  return (
    <main id="main" className="entry-detail">
      <div className="entry-detail-top">
        <Link className="text-link" href={backHref}>
          <ArrowLeft size={16} /> {backLabel}
        </Link>
        <span className="eyebrow">
          {kind === "story" ? "STORY" : "UPDATE"} / {entry.category}
          {entry.eventStatus === "upcoming" ? " / UPCOMING" : ""}
        </span>
      </div>

      {entry.media && isHttpsUrl(entry.media) ? (
        <img
          className="entry-detail-cover"
          src={entry.media}
          alt={entry.alt ?? entry.title}
          referrerPolicy="no-referrer"
        />
      ) : null}

      <h1>{entry.title}</h1>
      {entry.summary ? (
        <Article text={entry.summary} images={gallery} />
      ) : gallery.length ? (
        <Article text="" images={gallery} />
      ) : null}

      <dl className="entry-detail-meta">
        {entry.date ? (
          <div>
            <dt>
              <CalendarDays size={15} /> Date
            </dt>
            <dd>
              {formatDate(entry.date)}
              {entry.endsAt ? ` — ${formatDate(entry.endsAt)}` : ""}
            </dd>
          </div>
        ) : null}
        {entry.location ? (
          <div>
            <dt>
              <MapPin size={15} /> Location
            </dt>
            <dd>{entry.location}</dd>
          </div>
        ) : null}
        {entry.venue ? (
          <div>
            <dt>
              <Ticket size={15} /> Venue
            </dt>
            <dd>{entry.venue}</dd>
          </div>
        ) : null}
        {entry.eventStatus ? (
          <div>
            <dt>Status</dt>
            <dd>{entry.eventStatus === "upcoming" ? "Upcoming" : "Past"}</dd>
          </div>
        ) : null}
      </dl>

      {embed ? (
        <div className="entry-detail-video">
          <iframe
            src={embed}
            title={`Video: ${entry.title}`}
            loading="lazy"
            allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            referrerPolicy="strict-origin-when-cross-origin"
            sandbox="allow-scripts allow-same-origin allow-presentation"
          />
        </div>
      ) : entry.video && isHttpsUrl(entry.video) ? (
        <a
          className="button button-coral"
          href={entry.video}
          target="_blank"
          rel="noopener noreferrer"
        >
          Watch the video <ArrowUpRight size={16} />
        </a>
      ) : null}

      {entry.proof && isHttpsUrl(entry.proof) ? (
        <a
          className="text-link"
          href={safeHref(entry.proof)}
          target="_blank"
          rel="noopener noreferrer"
        >
          View proof <ArrowUpRight size={16} />
        </a>
      ) : null}
    </main>
  );
}
