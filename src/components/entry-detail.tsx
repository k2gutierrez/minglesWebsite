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
      {entry.summary ? <p className="entry-detail-lead">{entry.summary}</p> : null}

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

      {gallery.length ? (
        <section className="entry-detail-gallery">
          <span className="eyebrow">GALLERY</span>
          <div className="entry-detail-grid">
            {gallery.map((url) => (
              <img
                key={url}
                src={url}
                alt=""
                loading="lazy"
                referrerPolicy="no-referrer"
              />
            ))}
          </div>
        </section>
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
