"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { Download, ImageOff, Loader2, RotateCcw } from "lucide-react";
import { toPng } from "html-to-image";
import { Status } from "./ui";
import {
  LAYER_Z_INDEX,
  MINGLE_LAYERS,
  TRAITS_PAGE_SIZE,
  TRAIT_REGISTRY_URL,
  composeTraits,
  describeTraits,
  filterMingles,
  parseMingleRegistry,
  traitImageUrl,
  type MingleFilters,
  type MingleLayer,
  type MingleRecord,
  type MingleRegistry,
  type MingleTraits,
} from "@/lib/mingle-traits";

/**
 * Laboratorio de arte del admin: une las 6 capas de cualquier Mingle, deja
 * cambiar el valor de una capa para ver la combinación y descarga el PNG
 * compuesto a 2×.
 *
 * Portado del generador viejo (`nftgenerator/page.tsx`), que estaba en Tailwind.
 * Aquí no hay Tailwind: el marcado usa clases que ya existen (`.nft-grid`,
 * `.nft-card`, `.nft-placeholder`, `.field`, `.button`, `.editor-card`,
 * `.status`) y solo añade las suyas al final de `globals.css`.
 *
 * Decisión: el registro de capas se pide por `fetch` al montar el componente, y
 * el componente solo se monta al abrir la pestaña. Así el JSON de ~486 KB no
 * entra en la web pública ni en el bundle del admin hasta que hace falta.
 *
 * PENDIENTE (fuera de alcance): subir o reemplazar el PNG de una capa. El
 * archivo viejo escribía en el bucket `traits` de producción; eso necesita
 * políticas de Storage y revisión de arte propias, así que esto es solo lectura.
 */

/** Se inlinea en el bundle del cliente por el prefijo NEXT_PUBLIC_. */
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";

/**
 * `edition|capa|valor` → la imagen no cargó. La clave incluye el valor para que
 * cambiar una capa rota por una buena vuelva a intentar la carga.
 */
type BrokenMap = Record<string, boolean>;

function brokenKey(edition: number, layer: MingleLayer, value: string) {
  return `${edition}|${layer}|${value}`;
}

export function MingleLab() {
  const [registry, setRegistry] = useState<MingleRegistry | null>(null);
  const [loadError, setLoadError] = useState("");
  const [filters, setFilters] = useState<MingleFilters>({});
  const [query, setQuery] = useState("");
  const [visible, setVisible] = useState(TRAITS_PAGE_SIZE);
  const [overrides, setOverrides] = useState<
    Record<number, Partial<MingleTraits>>
  >({});
  const [selected, setSelected] = useState<number | null>(null);
  const [broken, setBroken] = useState<BrokenMap>({});
  const [downloading, setDownloading] = useState(false);
  const [message, setMessage] = useState("");
  const previewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const response = await fetch(TRAIT_REGISTRY_URL);
        if (!response.ok) {
          throw new Error(
            `The trait registry responded ${response.status}. Regenerate public/data/mingles-traits.json.`,
          );
        }
        const parsed = parseMingleRegistry(await response.json());
        if (!parsed) {
          throw new Error("The trait registry has an unexpected shape.");
        }
        if (!cancelled) setRegistry(parsed);
      } catch (error) {
        if (!cancelled) {
          setLoadError(
            error instanceof Error
              ? error.message
              : "The trait registry could not be loaded.",
          );
        }
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  // Como el sitio viejo: cualquier filtro nuevo vuelve a la primera página.
  useEffect(() => {
    setVisible(TRAITS_PAGE_SIZE);
  }, [filters, query]);

  const filtered = useMemo(
    () => (registry ? filterMingles(registry.mingles, filters, query) : []),
    [registry, filters, query],
  );

  const selectedRecord = useMemo(
    () =>
      registry && selected !== null
        ? (registry.mingles.find((m) => m.edition === selected) ?? null)
        : null,
    [registry, selected],
  );

  const selectedTraits = selectedRecord
    ? composeTraits(selectedRecord, overrides[selectedRecord.edition])
    : null;

  const missing =
    selectedRecord && selectedTraits
      ? MINGLE_LAYERS.filter(
          (layer) =>
            broken[
              brokenKey(selectedRecord.edition, layer, selectedTraits[layer])
            ],
        )
      : [];

  const activeFilterCount = MINGLE_LAYERS.filter((l) => filters[l]).length;
  const traitValueCount = registry
    ? MINGLE_LAYERS.reduce((sum, l) => sum + registry.traits[l].length, 0)
    : 0;

  function markBroken(key: string) {
    setBroken((prev) => (prev[key] ? prev : { ...prev, [key]: true }));
  }

  function setLayer(edition: number, layer: MingleLayer, value: string) {
    setOverrides((prev) => ({
      ...prev,
      [edition]: { ...prev[edition], [layer]: value },
    }));
    setMessage("");
  }

  function resetLayer(edition: number, layer: MingleLayer) {
    setOverrides((prev) => {
      const next = { ...prev[edition] };
      delete next[layer];
      const all = { ...prev, [edition]: next };
      if (!Object.keys(next).length) delete all[edition];
      return all;
    });
    setMessage("");
  }

  function resetAllLayers() {
    if (selected === null) return;
    setOverrides((prev) => {
      const next = { ...prev };
      delete next[selected];
      return next;
    });
    setMessage("");
  }

  /**
   * Descarga la composición. `toPng` delega el render en el navegador (nada de
   * dibujar a mano en un canvas), pero clona el nodo: si una capa todavía no
   * terminó de cargar, la captura sale con huecos. Por eso se espera a
   * `img.decode()` de cada capa antes de capturar — el archivo viejo no lo hacía
   * y de vez en cuando exportaba a medias.
   */
  async function download() {
    const node = previewRef.current;
    if (!node || !selectedRecord) return;
    setDownloading(true);
    setMessage("");
    try {
      const images = Array.from(node.querySelectorAll("img"));
      await Promise.all(
        images.map((image) => image.decode().catch(() => undefined)),
      );
      const dataUrl = await toPng(node, {
        pixelRatio: 2, // el doble de resolución, como el generador viejo
        cacheBust: false,
        // La composición son solo imágenes: embeber las fuentes del sitio solo
        // añadiría segundos de espera y un punto de fallo más.
        skipFonts: true,
      });
      const link = document.createElement("a");
      link.download = `mingle-${selectedRecord.edition}.png`;
      link.href = dataUrl;
      link.click();
      setMessage(
        `Downloaded mingle-${selectedRecord.edition}.png at 2× resolution.`,
      );
    } catch (error) {
      setMessage(
        error instanceof Error
          ? `Download failed: ${error.message}`
          : "Download failed. Please try again.",
      );
    } finally {
      setDownloading(false);
    }
  }

  /** Las 6 capas apiladas. El `zIndex` sale del mapa del generador viejo. */
  function renderLayers(
    record: MingleRecord,
    traits: MingleTraits,
    options: { lazy: boolean },
  ) {
    return MINGLE_LAYERS.map((layer) => {
      const value = traits[layer];
      if (broken[brokenKey(record.edition, layer, value)]) return null;
      return (
        <img
          key={layer}
          className="lab-layer"
          style={{ zIndex: LAYER_Z_INDEX[layer] }}
          src={traitImageUrl(SUPABASE_URL, layer, value)}
          alt={`${layer} layer: ${value}`}
          loading={options.lazy ? "lazy" : "eager"}
          decoding="async"
          onError={() => markBroken(brokenKey(record.edition, layer, value))}
        />
      );
    });
  }

  if (loadError) {
    return (
      <p className="message lab-error" role="status">
        {loadError}
      </p>
    );
  }
  if (!registry) {
    return (
      <p className="editor-help lab-loading" role="status">
        Loading the Mingle layer registry…
      </p>
    );
  }
  if (!SUPABASE_URL) {
    return (
      <p className="message lab-error" role="status">
        Layer art needs NEXT_PUBLIC_SUPABASE_URL. Set it in .env.local and
        restart the server.
      </p>
    );
  }

  const page = filtered.slice(0, visible);
  const remaining = filtered.length - page.length;

  return (
    <>
      <p className="editor-help">
        Every Mingle is six stacked layers served from the public{" "}
        <code>traits</code> bucket. Pick one, change any layer to preview the
        combination, and download the result as a 2× PNG. Read-only by design:
        uploading or replacing layer art is not available here, because it needs
        its own Storage policies and art review.
      </p>
      <p className="lab-summary">
        <Status>
          {registry.mingles.length} Mingles · {traitValueCount} layer values
        </Status>
        <span className="muted">
          The ten 1-of-1 tokens are not in this registry: they use special
          layers.
        </span>
      </p>

      <div className="lab-layout">
        <aside className="editor-card lab-filters" aria-label="Layer filters">
          <h3>Filters</h3>
          {MINGLE_LAYERS.map((layer) => (
            <label className="field" key={layer}>
              <span>{layer}</span>
              <select
                value={filters[layer] ?? ""}
                onChange={(e) =>
                  setFilters((prev) => {
                    const next = { ...prev };
                    if (e.target.value) next[layer] = e.target.value;
                    else delete next[layer];
                    return next;
                  })
                }
              >
                <option value="">Any {layer.toLowerCase()}</option>
                {registry.traits[layer].map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </label>
          ))}
          <label className="field">
            <span>Edition number</span>
            <input
              value={query}
              inputMode="numeric"
              placeholder="Search, e.g. 2769"
              onChange={(e) => setQuery(e.target.value)}
            />
          </label>
          <button
            className="button lab-clear"
            onClick={() => {
              setFilters({});
              setQuery("");
            }}
            disabled={!activeFilterCount && !query}
          >
            Clear filters
          </button>
        </aside>

        <div className="lab-grid-wrap">
          <p className="lab-count" role="status">
            Showing {page.length} of {filtered.length} Mingles
            {activeFilterCount || query
              ? ` (${registry.mingles.length} in the registry)`
              : ""}
            .
          </p>
          {page.length ? (
            <div className="nft-grid lab-grid">
              {page.map((record) => {
                const traits = composeTraits(record, overrides[record.edition]);
                const isSelected = record.edition === selected;
                return (
                  <article
                    key={record.edition}
                    className={`nft-card lab-card${isSelected ? " is-selected" : ""}`}
                  >
                    <div className="lab-compose" title={describeTraits(traits)}>
                      {renderLayers(record, traits, { lazy: true })}
                    </div>
                    <div className="lab-card-meta">
                      <h3>#{record.edition}</h3>
                      <button
                        className="button lab-card-button"
                        aria-pressed={isSelected}
                        aria-label={`${isSelected ? "In the composer" : "Compose"} Mingle #${record.edition}`}
                        onClick={() => {
                          setSelected(record.edition);
                          setMessage("");
                        }}
                      >
                        {isSelected ? "In the composer" : "Compose"}
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="nft-placeholder lab-empty">
              <ImageOff size={28} />
              <span>
                No Mingle matches those layers. Clear a filter and try again.
              </span>
            </div>
          )}
          {remaining > 0 && (
            <button
              className="button lab-more"
              onClick={() => setVisible((v) => v + TRAITS_PAGE_SIZE)}
            >
              Load {Math.min(TRAITS_PAGE_SIZE, remaining)} more
              <span className="muted">({remaining} remaining)</span>
            </button>
          )}
        </div>

        <aside className="editor-card lab-inspector" aria-label="Composer">
          {!selectedRecord || !selectedTraits ? (
            <>
              <h3>Composer</h3>
              <p className="editor-help">
                Choose a Mingle from the grid to see its six layers, swap any
                value, and download the composition.
              </p>
            </>
          ) : (
            <>
              <h3>Mingle #{selectedRecord.edition}</h3>
              <div className="lab-preview" ref={previewRef}>
                {renderLayers(selectedRecord, selectedTraits, { lazy: false })}
              </div>
              {missing.length > 0 && (
                <p className="lab-missing" role="status">
                  No PNG found for {missing.join(", ")}. That layer is left out
                  of the preview and of the download.
                </p>
              )}
              <div className="lab-actions">
                <button
                  className="button button-coral"
                  onClick={download}
                  disabled={downloading}
                >
                  {downloading ? (
                    <Loader2 size={15} className="lab-spin" />
                  ) : (
                    <Download size={15} />
                  )}
                  {downloading ? "Rendering…" : "Download PNG (2×)"}
                </button>
                <button
                  className="button"
                  onClick={resetAllLayers}
                  disabled={!overrides[selectedRecord.edition]}
                >
                  <RotateCcw size={15} />
                  Reset layers
                </button>
              </div>
              <div className="lab-layers">
                {MINGLE_LAYERS.map((layer) => {
                  const changed =
                    selectedTraits[layer] !== selectedRecord.traits[layer];
                  return (
                    <div className="lab-layer-field" key={layer}>
                      <label className="field">
                        <span>
                          {layer}
                          {changed ? " — changed" : ""}
                        </span>
                        <select
                          value={selectedTraits[layer]}
                          onChange={(e) =>
                            setLayer(
                              selectedRecord.edition,
                              layer,
                              e.target.value,
                            )
                          }
                        >
                          {registry.traits[layer].map((value) => (
                            <option key={value} value={value}>
                              {value}
                            </option>
                          ))}
                        </select>
                      </label>
                      {changed && (
                        <button
                          className="icon-button"
                          aria-label={`Restore the original ${layer} value for Mingle #${selectedRecord.edition}`}
                          onClick={() =>
                            resetLayer(selectedRecord.edition, layer)
                          }
                        >
                          <RotateCcw size={14} />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
              <p className="muted lab-original">
                Original layers: {describeTraits(selectedRecord.traits)}
              </p>
            </>
          )}
        </aside>
      </div>

      <p role="status" className="message lab-message">
        {message}
      </p>
    </>
  );
}
