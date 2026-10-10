"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ExternalLink, ImageOff, X } from "lucide-react";
import { COLLECTION } from "@/lib/web3/collection";
import { mingleViews, type MingleViewId } from "@/lib/art";

const EXPLORER = COLLECTION.chain.blockExplorers.default.url;

/**
 * Detalle de un Mingle: las tres vistas en un solo lugar.
 *
 * Accesibilidad, porque un modal mal hecho deja a la gente atrapada:
 *  - `role="dialog"` + `aria-modal`, y el foco entra al botón de cerrar.
 *  - Se cierra con **Escape** y con clic fuera.
 *  - El fondo no hace scroll mientras está abierto.
 *  - El selector de vistas usa `aria-pressed`, no pestañas a medias.
 *  - Si una imagen no carga, se dice y se ofrece abrirla aparte: nunca queda
 *    un hueco mudo.
 */
export function MingleDetail({
  tokenId,
  name,
  officialImage,
  onClose,
}: {
  tokenId: string;
  name: string;
  officialImage: string | null;
  onClose: () => void;
}) {
  const [view, setView] = useState<MingleViewId>("official");
  const [broken, setBroken] = useState<Record<string, boolean>>({});
  const [mounted, setMounted] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);

  const views = mingleViews(tokenId, officialImage);
  const current = views.find((v) => v.id === view) ?? views[0];

  const close = useCallback(() => onClose(), [onClose]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    // Depende de `mounted`: sin eso el efecto corre antes de que el portal
    // exista, `closeRef.current` es null y el foco se queda detrás del modal.
    if (!mounted) return;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [close, mounted]);

  const failed = broken[current.id] || !current.url;

  // Portal a <body>, no negociable: dentro del layout del portal este modal NO
  // recibe clics. Comprobado con el navegador — con el modal anidado en <main>,
  // el punto central del botón devuelve <html> incluso forzando z-index al
  // máximo; movido a <body>, el clic entra donde debe. Un modal tiene que vivir
  // fuera de cualquier contexto del layout que lo pueda contener o recortar.
  if (!mounted) return null;

  return createPortal(
    <div
      className="md-backdrop"
      role="dialog"
      aria-modal="true"
      aria-label={`${name} — three views`}
      onClick={(e) => {
        if (e.target === e.currentTarget) close();
      }}
    >
      <div className="md-panel">
        <div className="md-top">
          <div>
            <span className="eyebrow">APECHAIN / #{tokenId}</span>
            <h3>{name}</h3>
          </div>
          <button
            ref={closeRef}
            className="button"
            onClick={close}
            aria-label="Close"
          >
            <X size={16} />
            Close
          </button>
        </div>

        <div className="md-image">
          {failed ? (
            <div className="nft-placeholder">
              <ImageOff size={28} />
              <span>
                {current.url
                  ? "This view did not load."
                  : "No image in the token metadata."}
              </span>
              {current.url && (
                <a
                  href={current.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Open it in a new tab ↗
                </a>
              )}
            </div>
          ) : (
            <img
              src={current.url as string}
              alt={`${name} — ${current.label}`}
              referrerPolicy="no-referrer"
              onError={() => setBroken((b) => ({ ...b, [current.id]: true }))}
            />
          )}
        </div>

        <div className="md-views" role="group" aria-label="Choose a view">
          {views.map((v) => (
            <button
              key={v.id}
              className="md-view"
              aria-pressed={v.id === view}
              onClick={() => setView(v.id)}
            >
              {v.label}
            </button>
          ))}
        </div>

        <p className="md-hint">{current.hint}</p>

        <div className="md-actions">
          {current.url && !failed && (
            <a
              className="button button-coral"
              href={current.url}
              target="_blank"
              rel="noopener noreferrer"
            >
              Open full size ↗
            </a>
          )}
          <a
            className="button"
            href={`${EXPLORER}/token/${COLLECTION.address}?a=${tokenId}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <ExternalLink size={14} />
            View on explorer
          </a>
        </div>

        <small className="muted">
          Ownership is verified onchain, not typed in. The three views are the
          same artwork served from the official collection host.
        </small>
      </div>
    </div>,
    document.body,
  );
}


