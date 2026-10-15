"use client";
import { useEffect, useState } from "react";
import {
  ArrowUp,
  ArrowDown,
  Eye,
  Save,
  Upload,
  Plus,
  RotateCcw,
} from "lucide-react";
import { useSite } from "./provider";
import {
  cardSymbols,
  initialContent,
  isHttpsUrl,
  isSiteContent,
  MIKE_LOMBARD_URL,
  normalizeSymbol,
  safeLinkHref,
  statuses,
  withContentDefaults,
  type Photo,
  type SiteContent,
  type Slide,
  type Entry,
  type EraDetails,
  type Visuals,
  type Status as BuildStatus,
} from "@/lib/content";
import { getSupabase } from "@/lib/supabase";
import { Status } from "./ui";
import { MingleLab } from "./nft-lab";
type Revision = { at: string; content: SiteContent };
function Field({
  label,
  value,
  onChange,
  multiline = false,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  multiline?: boolean;
}) {
  return (
    <label className="field">
      <span>{label}</span>
      {multiline ? (
        <textarea value={value} onChange={(e) => onChange(e.target.value)} />
      ) : (
        <input value={value} onChange={(e) => onChange(e.target.value)} />
      )}
    </label>
  );
}
type MediaItem = { url: string; alt: string };
type Uploader = (file?: File) => Promise<string | null>;
/**
 * Tope de subida del estudio.
 * ⚠️ Tiene que coincidir con el `file_size_limit` del bucket `public-media` en
 * Supabase: si aquí fuera mayor, la subida fallaría en el servidor con un error
 * confuso; si fuera menor, el navegador rechazaría archivos que el bucket sí
 * acepta. Cambiar los dos a la vez.
 */
const MAX_UPLOAD_MB = 10;
const MAX_UPLOAD_BYTES = MAX_UPLOAD_MB * 1024 * 1024;
/** Pestañas ordenadas por flujo de trabajo real: contenido → secciones → media → publicar. */
const tabOrder = [
  "Copy",
  "Navigation",
  "Sections",
  "Progress & experiments",
  "Updates",
  "Story",
  "Media",
  "Visuals",
  "Mingle lab",
  "Revisions",
] as const;
const tabHelp: Record<string, string> = {
  Copy: "Every text on the site, grouped by page section. Search, then edit in place.",
  Navigation:
    "Only the visible labels of the top menu. Routes stay fixed so a rename cannot break a destination.",
  Sections:
    "Switch a home section on or off and change its order. Hidden sections collapse without a gap.",
  "Progress & experiments":
    "Titles, descriptions, links and card images. The symbol and background of each card are chosen in Visuals.",
  Updates:
    "Build-log entries. Add a cover image, a gallery and a video link, then publish to show them on /updates.",
  Story:
    "Story entries. Same editor as Updates: cover image, gallery, event fields and a video link.",
  Media: `Upload approved images here, then pick them anywhere in the studio. PNG, JPEG or WebP, up to ${MAX_UPLOAD_MB} MB.`,
  Visuals:
    "Tequila, Art, hero shots, galleries, the lineage, Mike Lombard's context and the destination of every button. An empty field or image keeps the site exactly as it looks today.",
  "Mingle lab":
    "Layer viewer from the old generator. Read-only: it never writes to the art bucket.",
  Revisions:
    "Restore an earlier publication into the draft, review it, then publish.",
};
/** Destinos que se ofrecen en el selector de CTA; se puede escribir otro. */
const linkSuggestions = [
  { label: "Updates", href: "/updates" },
  { label: "Story", href: "/story" },
  { label: "Tequila", href: "/tequila" },
  { label: "Art", href: "/art" },
  { label: "Experiments", href: "/experiments" },
  { label: "Build the distillery", href: "/build-the-distillery" },
  { label: "Holder portal", href: "/portal" },
];
const entryFields = [
  { key: "title", label: "Title" },
  { key: "slug", label: "URL slug (optional)" },
  { key: "date", label: "Date" },
  { key: "endsAt", label: "End date (optional)" },
  { key: "location", label: "Location" },
  { key: "venue", label: "Venue" },
  { key: "video", label: "Video URL (HTTPS)", link: true },
  { key: "summary", label: "Description", multiline: true },
  { key: "proof", label: "Proof URL (HTTPS)", link: true },
] as const;
const wordLabels: Record<string, string> = {
  title: "Title",
  body: "Body text",
  kicker: "Kicker",
  cta: "Button label",
  note: "Footer note",
  responsibility: "Legal line",
  tagline: "Tagline",
};
const copyLabel = (key: string) => {
  const last = key.split(".").pop() ?? key;
  return wordLabels[last] ? `${wordLabels[last]} · ${key}` : key;
};
/** Grupos del punto 17 del PDF: copy navegable por sección, sin dejar claves fuera. */
const copyGroups = [
  {
    id: "brand",
    title: "Brand",
    help: "Shared brand lines used across the site.",
    match: (k: string) => k.startsWith("brand."),
  },
  {
    id: "home",
    title: "Home",
    help: "Copy of the home state block.",
    match: (k: string) => k.startsWith("home."),
  },
  {
    id: "tequila",
    title: "Tequila",
    help: "The real-world spirit page.",
    match: (k: string) => k.startsWith("tequila."),
  },
  {
    id: "art",
    title: "Art",
    help: "The art rework page.",
    match: (k: string) => k.startsWith("art."),
  },
  {
    id: "experiments",
    title: "Experiments",
    help: "The PVG experiment lab page.",
    match: (k: string) => k.startsWith("experiments."),
  },
  {
    id: "protocol",
    title: "Protocol",
    help: "The build-the-distillery / protocol block.",
    match: (k: string) => k.startsWith("protocol."),
  },
  {
    id: "story",
    title: "Story",
    help: "The story-so-far page intro.",
    match: (k: string) => k.startsWith("story."),
  },
  {
    id: "updates",
    title: "Updates",
    help: "The updates page intro.",
    match: (k: string) => k.startsWith("updates."),
  },
  {
    id: "mission",
    title: "Mission",
    help: "The mission block (build the distillery).",
    match: (k: string) => k.startsWith("mission."),
  },
  {
    id: "holder",
    title: "Holder portal",
    help: "Copy shown to holders in the portal invitation.",
    match: (k: string) => k.startsWith("holder."),
  },
  {
    id: "footer",
    title: "Footer",
    help: "Footer note and the adult-responsibility line.",
    match: (k: string) => k.startsWith("footer."),
  },
];
/** Campo de imagen: elige del catálogo o sube una nueva al bucket público. */
function MediaField({
  label,
  value,
  media,
  busy,
  help,
  onChange,
  onUpload,
}: {
  label: string;
  value: string;
  media: MediaItem[];
  busy: boolean;
  help?: string;
  onChange: (url: string) => void;
  onUpload: Uploader;
}) {
  const known = media.some((m) => m.url === value);
  return (
    <div className="media-field">
      <label className="field">
        <span>{label}</span>
        <select value={value} onChange={(e) => onChange(e.target.value)}>
          <option value="">Not set — keep the current look</option>
          {value && !known && <option value={value}>Current image</option>}
          {media.map((m, i) => (
            <option key={i} value={m.url}>
              {m.alt || m.url}
            </option>
          ))}
        </select>
      </label>
      <label className="field">
        <span>Upload a new image for {label.toLowerCase()}</span>
        <input
          type="file"
          accept="image/png,image/jpeg,image/webp"
          disabled={busy}
          onChange={(e) => {
            const input = e.currentTarget;
            const file = input.files?.[0];
            input.value = "";
            void (async () => {
              const url = await onUpload(file);
              if (url) onChange(url);
            })();
          }}
        />
      </label>
      <div className="media-field-foot">
        {value ? (
          <>
            <img
              className="media-field-preview"
              src={value}
              alt={`Preview of ${label}`}
            />
            <button className="button" onClick={() => onChange("")}>
              Remove
            </button>
          </>
        ) : (
          <span className="muted">No image selected.</span>
        )}
      </div>
      {help && <p className="editor-help">{help}</p>}
    </div>
  );
}
/** Enlace: avisa en el momento si no es una URL https utilizable. */
function LinkField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <>
      <Field label={label} value={value} onChange={onChange} />
      {!!value && !isHttpsUrl(value) && (
        <p className="link-warning" role="alert">
          Not a valid https link. Remove it or paste the full{" "}
          <code>https://…</code> address.
        </p>
      )}
    </>
  );
}
/**
 * Galería de imágenes del sitio (Tequila y behind-the-scenes de Art).
 * Sube varias a la vez al mismo bucket de siempre, deja elegir del catálogo,
 * ordenar, describir cada imagen y borrar. El orden es el del carrusel.
 */
function GalleryField({
  label,
  help,
  min,
  withCaption = false,
  value,
  media,
  busy,
  onChange,
  onUpload,
}: {
  label: string;
  help?: string;
  /** Aviso cuando faltan imágenes para que la galería se monte (mínimo 4). */
  min?: number;
  withCaption?: boolean;
  value: Slide[];
  media: MediaItem[];
  busy: boolean;
  onChange: (next: Slide[]) => void;
  onUpload: Uploader;
}) {
  const patch = (index: number, fields: Partial<Slide>) =>
    onChange(value.map((s, i) => (i === index ? { ...s, ...fields } : s)));
  const move = (index: number, delta: number) => {
    const next = [...value];
    const target = index + delta;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  };
  const addFiles = (files: File[]) => {
    if (!files.length) return;
    void (async () => {
      const urls: string[] = [];
      for (const file of files) {
        const url = await onUpload(file);
        if (url) urls.push(url);
      }
      if (urls.length) onChange([...value, ...urls.map((url) => ({ url }))]);
    })();
  };
  return (
    <div className="media-field">
      <label className="field">
        <span>Add images to {label.toLowerCase()} (several at once)</span>
        <input
          type="file"
          accept="image/png,image/jpeg,image/webp"
          multiple
          disabled={busy}
          onChange={(e) => {
            const input = e.currentTarget;
            // Copiar los ficheros antes de vaciar el input: asignar value=""
            // vacía el FileList capturado.
            const files = Array.from(input.files ?? []);
            input.value = "";
            addFiles(files);
          }}
        />
      </label>
      <label className="field">
        <span>Add from the media library</span>
        <select
          value=""
          disabled={!media.length}
          onChange={(e) => {
            if (e.target.value) onChange([...value, { url: e.target.value }]);
          }}
        >
          <option value="">Choose an uploaded image…</option>
          {media.map((m, i) => (
            <option key={i} value={m.url}>
              {m.alt || m.url}
            </option>
          ))}
        </select>
      </label>
      {value.length ? (
        <ul className="gallery-admin-list">
          {value.map((slide, i) => (
            <li key={`${slide.url}-${i}`}>
              <img
                src={slide.url}
                alt={`${label} image ${i + 1}`}
                loading="lazy"
              />
              <div className="gallery-admin-fields">
                <Field
                  label={`Image description / alt text (${i + 1})`}
                  value={slide.alt ?? ""}
                  onChange={(v) => patch(i, { alt: v || undefined })}
                />
                {withCaption && (
                  <Field
                    label={`Caption (${i + 1})`}
                    value={slide.caption ?? ""}
                    onChange={(v) => patch(i, { caption: v || undefined })}
                  />
                )}
              </div>
              <div className="gallery-admin-actions">
                <button
                  className="icon-button"
                  aria-label={`Move ${label} image ${i + 1} up`}
                  disabled={i === 0}
                  onClick={() => move(i, -1)}
                >
                  <ArrowUp size={16} />
                </button>
                <button
                  className="icon-button"
                  aria-label={`Move ${label} image ${i + 1} down`}
                  disabled={i === value.length - 1}
                  onClick={() => move(i, 1)}
                >
                  <ArrowDown size={16} />
                </button>
                <button
                  className="icon-button delete-button"
                  aria-label={`Remove ${label} image ${i + 1}`}
                  onClick={() => onChange(value.filter((_, j) => j !== i))}
                >
                  Remove
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="editor-help">No images yet.</p>
      )}
      {min !== undefined && value.length > 0 && value.length < min && (
        <p className="link-warning" role="alert">
          Add at least {min} images: with fewer, the gallery stays hidden and
          the page looks exactly as it does today.
        </p>
      )}
      {help && <p className="editor-help">{help}</p>}
    </div>
  );
}
/**
 * Destino de un botón (petición 3 del PDF): elige una página del sitio o
 * escribe una URL `https://`. Se avisa en el momento si el esquema no vale, y
 * el sitio, además, cae al destino por defecto en vez de publicarlo.
 */
function LinkPickerField({
  label,
  value,
  suggestions,
  onChange,
}: {
  label: string;
  value: string;
  suggestions: { label: string; href: string }[];
  onChange: (v: string) => void;
}) {
  const valid = !value || safeLinkHref(value, "") !== "";
  return (
    <div className="media-field">
      <label className="field">
        <span>{label}</span>
        <select
          value={
            valid && suggestions.some((s) => s.href === value) ? value : ""
          }
          onChange={(e) => {
            if (e.target.value) onChange(e.target.value);
          }}
        >
          <option value="">Choose a page of the site…</option>
          {suggestions.map((s) => (
            <option key={s.href} value={s.href}>
              {s.label}
            </option>
          ))}
        </select>
      </label>
      <label className="field">
        <span>Or type a link (internal route or https://)</span>
        <input value={value} onChange={(e) => onChange(e.target.value)} />
      </label>
      {!valid && (
        <p className="link-warning" role="alert">
          Only internal routes (<code>/updates</code>) or <code>https://…</code>{" "}
          links are allowed. Anything else keeps the default destination.
        </p>
      )}
    </div>
  );
}
export function Admin() {
  const { content, mode, publish } = useSite();
  const [draft, setDraft] = useState<SiteContent>(() =>
    withContentDefaults(content),
  );
  const [tab, setTab] = useState("Copy");
  const [copyGroup, setCopyGroup] = useState("hero");
  const [copyQuery, setCopyQuery] = useState("");
  const [ready, setReady] = useState(false);
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [authorized, setAuthorized] = useState(false);
  const [checked, setChecked] = useState(false);
  const [busy, setBusy] = useState(false);
  const [preview, setPreview] = useState(false);
  const [revisions, setRevisions] = useState<Revision[]>([]);
  const [media, setMedia] = useState<MediaItem[]>([]);
  useEffect(() => {
    if (mode === "preview" && process.env.NODE_ENV === "production") {
      setChecked(true);
      return;
    }
    if (mode === "preview") {
      try {
        const data = JSON.parse(
          localStorage.getItem("mingles-draft") || "null",
        );
        if (isSiteContent(data)) setDraft(withContentDefaults(data));
        setRevisions(
          JSON.parse(localStorage.getItem("mingles-revisions") || "[]"),
        );
        setMedia(JSON.parse(localStorage.getItem("mingles-media") || "[]"));
      } catch {}
      setAuthorized(true);
      setChecked(true);
      setReady(true);
      return;
    }
    const db = getSupabase();
    if (!db) {
      setChecked(true);
      return;
    }
    const check = async () => {
      const { data: ok } = await db.rpc("is_content_admin");
      setAuthorized(!!ok);
      setChecked(true);
      if (ok) {
        const { data } = await db
          .from("website_drafts")
          .select("document")
          .eq("id", "website")
          .maybeSingle();
        if (isSiteContent(data?.document))
          setDraft(withContentDefaults(data.document));
        const { data: assets } = await db
          .from("media_assets")
          .select("url,alt")
          .order("created_at", { ascending: false });
        if (assets) setMedia(assets);
        const { data: history } = await db
          .from("admin_audit_log")
          .select("created_at,before_document")
          .order("created_at", { ascending: false })
          .limit(12);
        if (history)
          setRevisions(
            history
              .filter((r) => isSiteContent(r.before_document))
              .map((r) => ({ at: r.created_at, content: r.before_document })),
          );
        setReady(true);
      }
    };
    void check();
    const { data } = db.auth.onAuthStateChange(() => {
      setTimeout(() => void check(), 0);
    });
    return () => data.subscription.unsubscribe();
  }, [mode]);
  useEffect(() => {
    if (!ready || !authorized || mode !== "preview") return;
    const id = setTimeout(() => {
      try {
        localStorage.setItem("mingles-draft", JSON.stringify(draft));
      } catch {
        setMessage(
          "Local storage is full. Export your draft before continuing.",
        );
      }
    }, 500);
    return () => clearTimeout(id);
  }, [draft, ready, authorized, mode]);
  const updateCopy = (key: string, value: string) =>
    setDraft((d) => ({ ...d, copy: { ...d.copy, [key]: value } }));
  const patchVisuals = (patch: Partial<Visuals>) =>
    setDraft((d) => ({ ...d, visuals: { ...d.visuals, ...patch } }));
  /** Imagen + su texto alternativo en un solo paso (evita dos renders). */
  const patchPhoto = (
    key: "tequilaHero" | "agaveBackground" | "artHero" | "artistPortrait",
    patch: Partial<Photo>,
  ) =>
    setDraft((d) => {
      const visuals = d.visuals ?? {};
      const artist = visuals.artist ?? {};
      switch (key) {
        case "tequilaHero":
          return {
            ...d,
            visuals: {
              ...visuals,
              ...(patch.url !== undefined
                ? { tequilaHeroShot: patch.url || undefined }
                : {}),
              ...(patch.alt !== undefined
                ? { tequilaHeroAlt: patch.alt || undefined }
                : {}),
            },
          };
        case "agaveBackground":
          return {
            ...d,
            visuals: {
              ...visuals,
              ...(patch.url !== undefined
                ? { agaveBackground: patch.url || undefined }
                : {}),
              ...(patch.alt !== undefined
                ? { agaveBackgroundAlt: patch.alt || undefined }
                : {}),
            },
          };
        case "artHero":
          return {
            ...d,
            visuals: {
              ...visuals,
              ...(patch.url !== undefined
                ? { artHeroShot: patch.url || undefined }
                : {}),
              ...(patch.alt !== undefined
                ? { artHeroAlt: patch.alt || undefined }
                : {}),
            },
          };
        default:
          return {
            ...d,
            visuals: {
              ...visuals,
              artist: {
                ...artist,
                ...(patch.url !== undefined
                  ? { portrait: patch.url || undefined }
                  : {}),
                ...(patch.alt !== undefined
                  ? { portraitAlt: patch.alt || undefined }
                  : {}),
              },
            },
          };
      }
    });
  /** Galerías nuevas: carrusel de Tequila y behind-the-scenes de Art. */
  const patchSlides = (
    key: "tequilaGallery" | "behindScenes",
    slides: Slide[],
  ) =>
    setDraft((d) => {
      const visuals = d.visuals ?? {};
      if (key === "tequilaGallery")
        return {
          ...d,
          visuals: { ...visuals, tequilaGallery: slides },
        };
      return {
        ...d,
        visuals: {
          ...visuals,
          artist: { ...(visuals.artist ?? {}), behindScenes: slides },
        },
      };
    });
  /** Contexto de Mike Lombard: nombre, biografía y retrato. */
  const patchArtist = (patch: Partial<NonNullable<Visuals["artist"]>>) =>
    setDraft((d) => ({
      ...d,
      visuals: {
        ...d.visuals,
        artist: { ...(d.visuals?.artist ?? {}), ...patch },
      },
    }));
  /** Una de las tres eras del lineage de Art. */
  const patchEra = (index: number, patch: Partial<EraDetails>) =>
    setDraft((d) => {
      const eras = Array.from(
        { length: 3 },
        (_, i) => d.visuals?.eras?.[i] ?? {},
      );
      eras[index] = { ...eras[index], ...patch };
      return { ...d, visuals: { ...d.visuals, eras } };
    });
  const setCardBackground = (id: string, url: string) =>
    setDraft((d) => {
      const cardBackgrounds = { ...(d.visuals?.cardBackgrounds ?? {}) };
      if (url) cardBackgrounds[id] = url;
      else delete cardBackgrounds[id];
      return { ...d, visuals: { ...d.visuals, cardBackgrounds } };
    });
  const patchEntry = (
    kind: "updates" | "stories",
    id: string,
    patch: Partial<Entry>,
  ) =>
    setDraft((d) => ({
      ...d,
      [kind]: d[kind].map((x) => (x.id === id ? { ...x, ...patch } : x)),
    }));
  async function save(doPublish: boolean) {
    setBusy(true);
    setMessage("");
    if (
      !draft.hero.title.trim() ||
      draft.projects.some((p) => !p.title.trim()) ||
      [...draft.updates, ...draft.stories].some(
        (e) => !e.title.trim() || !e.summary.trim() || !e.date,
      )
    ) {
      setMessage("Add titles, dates, and summaries before saving.");
      setBusy(false);
      return;
    }
    // Un enlace que no sea https no se publica: el sitio no debe recibir HTML ni
    // esquemas ejecutables.
    const badLink = [...draft.updates, ...draft.stories].find(
      (e) =>
        (e.proof && !isHttpsUrl(e.proof)) || (e.video && !isHttpsUrl(e.video)),
    );
    if (badLink) {
      setMessage(
        `"${badLink.title || "Untitled entry"}" has a proof or video link that is not a valid https address. Fix or clear it before saving.`,
      );
      setBusy(false);
      return;
    }
    const next = withContentDefaults(draft);
    try {
      if (mode === "preview") {
        localStorage.setItem("mingles-draft", JSON.stringify(next));
        if (doPublish) {
          const history = [
            { at: new Date().toISOString(), content },
            ...revisions,
          ].slice(0, 12);
          localStorage.setItem("mingles-revisions", JSON.stringify(history));
          setRevisions(history);
          publish(next);
        }
        setMessage(
          doPublish
            ? "Published to this browser preview. No production website was changed."
            : "Draft saved in this browser.",
        );
      } else {
        const db = getSupabase();
        if (!db) throw new Error("CMS connection unavailable.");
        const { error } = await db.rpc("save_website", {
          document: next,
          should_publish: doPublish,
        });
        if (error) throw error;
        if (doPublish) publish(next);
        setMessage(
          doPublish
            ? "Published to the connected website."
            : "Draft saved to Supabase.",
        );
      }
    } catch (e) {
      setMessage(
        e instanceof Error
          ? e.message
          : "Save failed. Your edits are still here.",
      );
    } finally {
      setBusy(false);
    }
  }
  async function login(e: React.FormEvent) {
    e.preventDefault();
    const db = getSupabase();
    if (!db) return;
    setBusy(true);
    const { error } = await db.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: false,
        emailRedirectTo: `${location.origin}/admin`,
      },
    });
    setMessage(
      error ? error.message : "Check your email for the admin sign-in link.",
    );
    setBusy(false);
  }
  function move(index: number, delta: number) {
    setDraft((d) => {
      const modules = [...d.modules];
      [modules[index], modules[index + delta]] = [
        modules[index + delta],
        modules[index],
      ];
      return { ...d, modules };
    });
  }
  function newEntry(kind: "updates" | "stories") {
    const entry: Entry = {
      id: crypto.randomUUID(),
      title: "",
      category: kind === "updates" ? "Art" : "Event",
      date: new Date().toISOString().slice(0, 10),
      summary: "",
      proof: "",
      published: false,
      gallery: [],
    };
    setDraft((d) => ({ ...d, [kind]: [entry, ...d[kind]] }));
  }
  async function upload(file?: File): Promise<string | null> {
    if (!file) return null;
    if (
      !["image/png", "image/jpeg", "image/webp"].includes(file.type) ||
      file.size > MAX_UPLOAD_BYTES
    ) {
      setMessage(
        `Choose a PNG, JPEG, or WebP under ${MAX_UPLOAD_MB} MB. Videos are added as HTTPS links, not uploads.`,
      );
      return null;
    }
    setBusy(true);
    try {
      let url = "";
      if (mode === "preview") {
        url = await new Promise<string>((resolve, reject) => {
          const r = new FileReader();
          r.onload = () => resolve(String(r.result));
          r.onerror = reject;
          r.readAsDataURL(file);
        });
      } else {
        const db = getSupabase();
        if (!db) throw Error("Storage unavailable");
        const path = `${crypto.randomUUID()}.${file.type.split("/")[1]}`;
        const { error } = await db.storage
          .from("public-media")
          .upload(path, file, { contentType: file.type, upsert: false });
        if (error) throw error;
        url = db.storage.from("public-media").getPublicUrl(path).data.publicUrl;
        const { error: metaError } = await db.from("media_assets").insert({
          url,
          alt: file.name,
          path,
          mime_type: file.type,
          size_bytes: file.size,
        });
        if (metaError) throw metaError;
      }
      const next = [...media, { url, alt: file.name }];
      if (mode === "preview")
        localStorage.setItem("mingles-media", JSON.stringify(next));
      setMedia(next);
      setMessage("Image added. Set an approved description before using it.");
      return url;
    } catch (e) {
      setMessage(
        e instanceof Error
          ? e.message
          : "Upload failed. Local storage may be full.",
      );
      return null;
    } finally {
      setBusy(false);
    }
  }
  /** Sube varias imágenes seguidas (galería de una entrada) y devuelve sus URLs. */
  async function uploadMany(files: File[]) {
    if (!files.length) return [];
    const urls: string[] = [];
    for (const file of files) {
      const url = await upload(file);
      if (url) urls.push(url);
    }
    return urls;
  }
  function exportDraft() {
    const url = URL.createObjectURL(
      new Blob([JSON.stringify(draft, null, 2)], { type: "application/json" }),
    );
    const link = document.createElement("a");
    link.href = url;
    link.download = "mingles-content-draft.json";
    link.click();
    URL.revokeObjectURL(url);
  }
  // El documento guardado puede ser anterior al bloque `visuals`.
  const visuals = draft.visuals ?? {};
  if (!checked)
    return (
      <main id="main" className="admin">
        <h1>CONTENT STUDIO</h1>
        <p>Checking access…</p>
      </main>
    );
  if (!authorized)
    return (
      <main id="main" className="admin">
        <span className="eyebrow">MINGLES / ADMIN ACCESS</span>
        <h1>CONTENT STUDIO</h1>
        <p>Sign in with your approved content admin account.</p>
        <form className="admin-login" onSubmit={login}>
          <Field label="Admin email" value={email} onChange={setEmail} />
          <button className="button button-dark" disabled={busy}>
            Send secure sign-in link
          </button>
        </form>
        <p role="status" className="message">
          {message}
        </p>
        <p className="editor-help">
          Signing in does not grant an admin role. An existing project
          administrator must assign it in Supabase.
        </p>
      </main>
    );
  return (
    <main id="main" className="admin">
      <span className="eyebrow">MINGLES / CONTENT OPERATIONS</span>
      <h1>KEEP THE BUILD ALIVE.</h1>
      <p>Copy, state, and stories. One place to shape the next chapter.</p>
      <div className="admin-notice">
        {mode === "preview"
          ? "LOCAL DESIGN STUDIO — edits stay in this browser. Drafts autosave locally; Publish updates this preview. No shared backend is connected."
          : "CONNECTED CONTENT STUDIO — publishing changes the connected public website. Save draft before reviewing."}
      </div>
      <div className="admin-toolbar">
        <Status>{mode === "preview" ? "Local draft" : "Supabase CMS"}</Status>
        <button className="button" onClick={() => setPreview(!preview)}>
          <Eye size={15} />
          {preview ? "Close preview" : "Preview"}
        </button>
        <button className="button" onClick={() => save(false)} disabled={busy}>
          <Save size={15} />
          Save draft
        </button>
        <button
          className="button button-dark"
          onClick={() => save(true)}
          disabled={busy}
        >
          <Upload size={15} />
          {busy ? "Saving…" : "Publish"}
        </button>
      </div>
      <p role="status" className="message">
        {message}
      </p>
      {preview && (
        <div className="preview-panel">
          <span className="eyebrow">
            DRAFT HERO PREVIEW / {draft.modules.filter((m) => m.enabled).length}{" "}
            ACTIVE MODULES
          </span>
          <h2>{draft.hero.title}</h2>
          <p>{draft.hero.description}</p>
          <div className="project-grid">
            {draft.projects
              .filter((p) => p.enabled)
              .slice(0, 4)
              .map((p) => (
                <div className="project-card" key={p.id}>
                  <h3>{p.title}</h3>
                  <Status>{p.status}</Status>
                </div>
              ))}
          </div>
        </div>
      )}
      <div className="admin-tabs" aria-label="Editor areas">
        {tabOrder.map((t) => (
          <button key={t} aria-pressed={tab === t} onClick={() => setTab(t)}>
            {t}
          </button>
        ))}
      </div>
      {/* Una línea de ayuda por pestaña: qué se puede hacer aquí y en qué orden. */}
      <p className="editor-help admin-tab-help">{tabHelp[tab]}</p>
      {tab === "Copy" && (
        <>
          <label className="field copy-search">
            <span>Find text</span>
            <input
              value={copyQuery}
              placeholder="Search every field by label or by the text inside it"
              onChange={(e) => setCopyQuery(e.target.value)}
            />
          </label>
          {(() => {
            const keys = Object.keys(draft.copy);
            const groups = copyGroups.map((g) => ({
              ...g,
              keys: keys.filter(g.match),
            }));
            const other = keys.filter(
              (k) => !copyGroups.some((g) => g.match(k)),
            );
            if (other.length)
              groups.push({
                id: "other",
                title: "Other copy",
                help: "Keys added later that do not match a known section. They stay editable here.",
                match: () => false,
                keys: other,
              });
            const heroFields = Object.entries(draft.hero);
            const query = copyQuery.trim().toLowerCase();
            const heroMatches = heroFields.filter(
              ([key, value]) =>
                !query ||
                key.toLowerCase().includes(query) ||
                value.toLowerCase().includes(query),
            );
            if (query) {
              const matches = groups
                .map((g) => ({
                  ...g,
                  keys: g.keys.filter(
                    (k) =>
                      k.toLowerCase().includes(query) ||
                      (draft.copy[k] ?? "").toLowerCase().includes(query),
                  ),
                }))
                .filter((g) => g.keys.length);
              const total = matches.reduce((n, g) => n + g.keys.length, 0);
              return (
                <>
                  <p className="editor-help" role="status">
                    {total + heroMatches.length} matching field
                    {total + heroMatches.length === 1 ? "" : "s"}.
                  </p>
                  {!!heroMatches.length && (
                    <div className="editor-card">
                      <h3>Hero</h3>
                      <div className="editor-grid">
                        {heroMatches.map(([key, value]) => (
                          <Field
                            key={key}
                            label={`Hero · ${key}`}
                            value={value}
                            multiline={key === "title" || key === "description"}
                            onChange={(v) =>
                              setDraft((d) => ({
                                ...d,
                                hero: { ...d.hero, [key]: v },
                              }))
                            }
                          />
                        ))}
                      </div>
                    </div>
                  )}
                  {matches.map((g) => (
                    <div className="editor-card" key={g.id}>
                      <h3>{g.title}</h3>
                      <div className="editor-grid">
                        {g.keys.map((key) => (
                          <Field
                            key={key}
                            label={copyLabel(key)}
                            value={draft.copy[key] ?? ""}
                            multiline
                            onChange={(v) => updateCopy(key, v)}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </>
              );
            }
            const current = groups.find((g) => g.id === copyGroup);
            return (
              <>
                <nav className="copy-nav" aria-label="Copy sections">
                  {[
                    { id: "hero", title: "Hero", count: heroFields.length },
                    ...groups.map((g) => ({
                      id: g.id,
                      title: g.title,
                      count: g.keys.length,
                    })),
                  ].map((g) => (
                    <button
                      key={g.id}
                      aria-pressed={copyGroup === g.id}
                      onClick={() => setCopyGroup(g.id)}
                    >
                      {g.title} <span className="copy-count">{g.count}</span>
                    </button>
                  ))}
                </nav>
                {copyGroup === "hero" ? (
                  <div className="editor-card">
                    <h3>Hero — top of the home page</h3>
                    <p className="editor-help">
                      The first thing a visitor reads. Line breaks are kept.
                    </p>
                    <div className="editor-grid">
                      {heroFields.map(([key, value]) => (
                        <Field
                          key={key}
                          label={key}
                          value={value}
                          multiline={key === "title" || key === "description"}
                          onChange={(v) =>
                            setDraft((d) => ({
                              ...d,
                              hero: { ...d.hero, [key]: v },
                            }))
                          }
                        />
                      ))}
                    </div>
                  </div>
                ) : current ? (
                  <div className="editor-card">
                    <h3>{current.title}</h3>
                    <p className="editor-help">{current.help}</p>
                    <div className="editor-grid">
                      {current.keys.map((key) => (
                        <Field
                          key={key}
                          label={copyLabel(key)}
                          value={draft.copy[key] ?? ""}
                          multiline
                          onChange={(v) => updateCopy(key, v)}
                        />
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="editor-help">This section has no copy yet.</p>
                )}
              </>
            );
          })()}
        </>
      )}
      {tab === "Navigation" && (
        <div className="editor-card">
          <h3>Public navigation</h3>
          <div className="editor-grid">
            {draft.nav.map((n, i) => (
              <Field
                key={i}
                label={n.href}
                value={n.label}
                onChange={(v) =>
                  setDraft((d) => ({
                    ...d,
                    nav: d.nav.map((x, j) =>
                      i === j ? { ...x, label: v } : x,
                    ),
                  }))
                }
              />
            ))}
          </div>
        </div>
      )}
      {tab === "Sections" && (
        <div className="editor-card">
          <h3>Home modules</h3>
          {draft.modules.map((m, i) => (
            <div className="module-row" key={m.id}>
              <input
                aria-label={`Show ${m.label}`}
                type="checkbox"
                checked={m.enabled}
                onChange={(e) =>
                  setDraft((d) => ({
                    ...d,
                    modules: d.modules.map((x) =>
                      x.id === m.id ? { ...x, enabled: e.target.checked } : x,
                    ),
                  }))
                }
              />
              <span>{m.label}</span>
              <button
                className="icon-button"
                aria-label={`Move ${m.label} up`}
                disabled={i === 0}
                onClick={() => move(i, -1)}
              >
                <ArrowUp size={16} />
              </button>
              <button
                className="icon-button"
                aria-label={`Move ${m.label} down`}
                disabled={i === draft.modules.length - 1}
                onClick={() => move(i, 1)}
              >
                <ArrowDown size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
      {tab === "Progress & experiments" && (
        <>
          <p className="editor-help">
            Symbol and background of each card are chosen in the Visuals tab.
          </p>
          {draft.projects.map((p, i) => (
            <div className="editor-card" key={p.id}>
              <h3>{p.title}</h3>
              <div className="editor-grid">
                {(["title", "eyebrow", "description", "href"] as const).map(
                  (key) => (
                    <Field
                      key={key}
                      label={key}
                      value={p[key]}
                      multiline={key === "description"}
                      onChange={(v) =>
                        setDraft((d) => ({
                          ...d,
                          projects: d.projects.map((x, j) =>
                            j === i ? { ...x, [key]: v } : x,
                          ),
                        }))
                      }
                    />
                  ),
                )}
                <label className="field">
                  <span>Status</span>
                  <select
                    value={p.status}
                    onChange={(e) =>
                      setDraft((d) => ({
                        ...d,
                        projects: d.projects.map((x, j) =>
                          j === i
                            ? { ...x, status: e.target.value as BuildStatus }
                            : x,
                        ),
                      }))
                    }
                  >
                    {statuses.map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                </label>
                <label className="field">
                  <span>Card media</span>
                  <select
                    value={p.media || ""}
                    onChange={(e) =>
                      setDraft((d) => ({
                        ...d,
                        projects: d.projects.map((x, j) =>
                          j === i
                            ? {
                                ...x,
                                media: e.target.value,
                                alt: media.find((m) => m.url === e.target.value)
                                  ?.alt,
                              }
                            : x,
                        ),
                      }))
                    }
                  >
                    <option value="">No official media selected</option>
                    {media.map((m, i) => (
                      <option key={i} value={m.url}>
                        {m.alt}
                      </option>
                    ))}
                  </select>
                </label>
                <Field
                  label="Image description / alt text"
                  value={p.alt || ""}
                  onChange={(v) =>
                    setDraft((d) => ({
                      ...d,
                      projects: d.projects.map((x, j) =>
                        j === i ? { ...x, alt: v } : x,
                      ),
                    }))
                  }
                />
              </div>
              <label className="module-row">
                <input
                  type="checkbox"
                  checked={p.enabled}
                  onChange={(e) =>
                    setDraft((d) => ({
                      ...d,
                      projects: d.projects.map((x, j) =>
                        j === i ? { ...x, enabled: e.target.checked } : x,
                      ),
                    }))
                  }
                />
                Visible
              </label>
            </div>
          ))}
          <button
            className="button"
            onClick={() =>
              setDraft((d) => ({
                ...d,
                projects: [
                  ...d.projects,
                  {
                    id: `experiment-${crypto.randomUUID()}`,
                    title: "New experiment",
                    eyebrow: "PVG / EXPERIMENT",
                    status: "Building",
                    description: "",
                    href: "/experiments",
                    enabled: false,
                  },
                ],
              }))
            }
          >
            <Plus size={16} />
            Add experiment
          </button>
        </>
      )}
      {(tab === "Updates" || tab === "Story") && (
        <>
          {(() => {
            const kind = tab === "Updates" ? "updates" : "stories";
            return (
              <>
                <button className="button" onClick={() => newEntry(kind)}>
                  <Plus size={16} />
                  Create {tab === "Updates" ? "update" : "story"}
                </button>
                {draft[kind].map((entry) => {
                  const gallery = entry.gallery ?? [];
                  const setGallery = (next: string[]) =>
                    patchEntry(kind, entry.id, { gallery: next });
                  return (
                    <div className="editor-card" key={entry.id}>
                      <h3>{entry.title || "Untitled draft"}</h3>
                      <div className="editor-grid">
                        {entryFields.map((field) =>
                          "link" in field && field.link ? (
                            <LinkField
                              key={field.key}
                              label={field.label}
                              value={entry[field.key] ?? ""}
                              onChange={(v) =>
                                patchEntry(kind, entry.id, {
                                  [field.key]: v,
                                })
                              }
                            />
                          ) : (
                            <Field
                              key={field.key}
                              label={field.label}
                              value={entry[field.key] ?? ""}
                              multiline={
                                "multiline" in field && field.multiline
                              }
                              onChange={(v) =>
                                patchEntry(kind, entry.id, {
                                  [field.key]: v,
                                })
                              }
                            />
                          ),
                        )}
                        <label className="field">
                          <span>Category</span>
                          <select
                            value={entry.category}
                            onChange={(e) =>
                              patchEntry(kind, entry.id, {
                                category: e.target.value,
                              })
                            }
                          >
                            {(kind === "updates"
                              ? [
                                  "Art",
                                  "Tequila",
                                  "PVG",
                                  "Protocol",
                                  "Migration",
                                  "Company",
                                ]
                              : [
                                  "Event",
                                  "Party",
                                  "Sponsorship",
                                  "Achievement",
                                  "Collaboration",
                                  "Community",
                                  "Product",
                                ]
                            ).map((x) => (
                              <option key={x}>{x}</option>
                            ))}
                          </select>
                        </label>
                        <label className="field">
                          <span>Event status</span>
                          <select
                            value={entry.eventStatus ?? ""}
                            onChange={(e) =>
                              patchEntry(kind, entry.id, {
                                eventStatus: e.target.value
                                  ? (e.target.value as Entry["eventStatus"])
                                  : undefined,
                              })
                            }
                          >
                            <option value="">Not set</option>
                            <option value="upcoming">Upcoming</option>
                            <option value="past">Past</option>
                          </select>
                        </label>
                      </div>
                      <div className="entry-media">
                        <MediaField
                          label="Cover image"
                          value={entry.media ?? ""}
                          media={media}
                          busy={busy}
                          help="Used as the card background on Story/Updates. Keep the title readable."
                          onChange={(url) =>
                            patchEntry(kind, entry.id, {
                              media: url || undefined,
                            })
                          }
                          onUpload={upload}
                        />
                        <div className="media-field">
                          <label className="field">
                            <span>Image description / alt text</span>
                            <input
                              value={entry.alt ?? ""}
                              onChange={(e) =>
                                patchEntry(kind, entry.id, {
                                  alt: e.target.value,
                                })
                              }
                            />
                          </label>
                          <label className="field">
                            <span>Add gallery images (several at once)</span>
                            <input
                              type="file"
                              accept="image/png,image/jpeg,image/webp"
                              multiple
                              disabled={busy}
                              onChange={(e) => {
                                const input = e.currentTarget;
                                // Copiar los ficheros ANTES de vaciar el input:
                                // asignar value="" vacía el FileList capturado.
                                const files = Array.from(input.files ?? []);
                                input.value = "";
                                void (async () => {
                                  const urls = await uploadMany(files);
                                  if (urls.length)
                                    setGallery([...gallery, ...urls]);
                                })();
                              }}
                            />
                          </label>
                          <label className="field">
                            <span>Add from the media library</span>
                            <select
                              value=""
                              disabled={!media.length}
                              onChange={(e) => {
                                if (e.target.value)
                                  setGallery([...gallery, e.target.value]);
                              }}
                            >
                              <option value="">
                                Choose an uploaded image…
                              </option>
                              {media.map((m, mi) => (
                                <option key={mi} value={m.url}>
                                  {m.alt || m.url}
                                </option>
                              ))}
                            </select>
                          </label>
                          {gallery.length ? (
                            <ul className="gallery-list">
                              {gallery.map((url, gi) => (
                                <li key={`${url}-${gi}`}>
                                  <img
                                    src={url}
                                    alt={`Gallery image ${gi + 1} of ${entry.title || "this entry"}`}
                                  />
                                  <div className="gallery-actions">
                                    <button
                                      className="icon-button"
                                      aria-label={`Move gallery image ${gi + 1} up`}
                                      disabled={gi === 0}
                                      onClick={() => {
                                        const next = [...gallery];
                                        [next[gi - 1], next[gi]] = [
                                          next[gi],
                                          next[gi - 1],
                                        ];
                                        setGallery(next);
                                      }}
                                    >
                                      <ArrowUp size={16} />
                                    </button>
                                    <button
                                      className="icon-button"
                                      aria-label={`Move gallery image ${gi + 1} down`}
                                      disabled={gi === gallery.length - 1}
                                      onClick={() => {
                                        const next = [...gallery];
                                        [next[gi + 1], next[gi]] = [
                                          next[gi],
                                          next[gi + 1],
                                        ];
                                        setGallery(next);
                                      }}
                                    >
                                      <ArrowDown size={16} />
                                    </button>
                                    <button
                                      className="icon-button delete-button"
                                      onClick={() =>
                                        setGallery(
                                          gallery.filter((_, j) => j !== gi),
                                        )
                                      }
                                    >
                                      Remove
                                    </button>
                                  </div>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p className="editor-help">
                              No gallery images yet. Upload or pick from the
                              media library; the order here is the order on the
                              detail page.
                            </p>
                          )}
                        </div>
                      </div>
                      <label className="module-row">
                        <input
                          type="checkbox"
                          checked={entry.published}
                          onChange={(e) =>
                            patchEntry(kind, entry.id, {
                              published: e.target.checked,
                            })
                          }
                        />
                        Include in next publish
                      </label>
                      <button
                        className="icon-button delete-button"
                        onClick={() =>
                          setDraft((d) => ({
                            ...d,
                            [kind]: d[kind].filter((x) => x.id !== entry.id),
                          }))
                        }
                      >
                        Remove from draft
                      </button>
                    </div>
                  );
                })}
                {!draft[kind].length && (
                  <p className="editor-help">
                    No invented content is seeded. Add the first verified entry,
                    then preview and publish.
                  </p>
                )}
              </>
            );
          })()}
        </>
      )}
      {tab === "Media" && (
        <>
          <p className="editor-help">
            {`Use approved Mingles media only. PNG, JPEG, WebP · up to ${MAX_UPLOAD_MB} MB. Uploads to the public bucket are immediately public; never upload unrevealed or confidential material. Uploaded images can be picked as a project card image, an entry cover, an entry gallery or a Visuals slot.`}
          </p>
          <label className="field">
            <span>Add an approved image</span>
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              disabled={busy}
              onChange={(e) => {
                const input = e.currentTarget;
                const file = input.files?.[0];
                input.value = "";
                void upload(file);
              }}
            />
          </label>
          <div className="media-grid">
            {media.map((m, i) => (
              <figure key={i}>
                <img src={m.url} alt={m.alt} />
                <figcaption>{m.alt}</figcaption>
              </figure>
            ))}
          </div>
        </>
      )}
      {tab === "Visuals" && (
        <>
          <div className="editor-card">
            <h3>Hero</h3>
            <p className="editor-help">
              The large box that holds the Mingles logo becomes an image, and
              the mouse-over effect is kept. The hero shot fills the right side.
            </p>
            <div className="editor-grid">
              <MediaField
                label="Hero art (logo box)"
                value={visuals.heroArt ?? ""}
                media={media}
                busy={busy}
                onChange={(url) => patchVisuals({ heroArt: url || undefined })}
                onUpload={upload}
              />
              <MediaField
                label="Hero shot (right side)"
                value={visuals.heroShot ?? ""}
                media={media}
                busy={busy}
                help="Preview image of Mike Lombard's art."
                onChange={(url) => patchVisuals({ heroShot: url || undefined })}
                onUpload={upload}
              />
            </div>
          </div>
          <div className="editor-card">
            <h3>Tequila</h3>
            <p className="editor-help">
              Page 1 and 2 of the brief. The hero shot fills the empty right
              side of the /tequila intro; the gallery needs at least 4 images
              and only then replaces the current look with the carousel.
            </p>
            <div className="editor-grid">
              <MediaField
                label="Tequila hero shot (intro, right side)"
                value={visuals.tequilaHeroShot ?? ""}
                media={media}
                busy={busy}
                help="Empty keeps the intro exactly as it looks today."
                onChange={(url) => patchPhoto("tequilaHero", { url })}
                onUpload={upload}
              />
              <Field
                label="Hero shot description (alt text)"
                value={visuals.tequilaHeroAlt ?? ""}
                onChange={(v) => patchPhoto("tequilaHero", { alt: v })}
              />
            </div>
            <GalleryField
              label="Tequila gallery"
              min={4}
              withCaption
              help="At least 4 images. The order here is the order of the carousel."
              value={visuals.tequilaGallery ?? []}
              media={media}
              busy={busy}
              onChange={(slides) => patchSlides("tequilaGallery", slides)}
              onUpload={upload}
            />
          </div>
          <div className="editor-card">
            <h3>Rooted in agave — background image</h3>
            <p className="editor-help">
              Page 3 of the brief. The image behind the “ROOTED IN AGAVE.”
              block. Its texts live in the Copy tab, under Tequila.
            </p>
            <div className="editor-grid">
              <MediaField
                label="Background of “ROOTED IN AGAVE.”"
                value={visuals.agaveBackground ?? ""}
                media={media}
                busy={busy}
                help="Empty keeps the drawn agave plant and the current label."
                onChange={(url) => patchPhoto("agaveBackground", { url })}
                onUpload={upload}
              />
              <Field
                label="Background description (alt text)"
                value={visuals.agaveBackgroundAlt ?? ""}
                onChange={(v) => patchPhoto("agaveBackground", { alt: v })}
              />
            </div>
          </div>
          <div className="editor-card">
            <h3>Art — hero shot and lineage</h3>
            <p className="editor-help">
              Pages 9 and 10 of the brief. The hero shot fills the empty right
              side of the /art intro. The lineage keeps three eras: change their
              titles, texts and images here.
            </p>
            <div className="editor-grid">
              <MediaField
                label="Art hero shot (intro, right side)"
                value={visuals.artHeroShot ?? ""}
                media={media}
                busy={busy}
                help="Empty keeps the intro exactly as it looks today."
                onChange={(url) => patchPhoto("artHero", { url })}
                onUpload={upload}
              />
              <Field
                label="Hero shot description (alt text)"
                value={visuals.artHeroAlt ?? ""}
                onChange={(v) => patchPhoto("artHero", { alt: v })}
              />
            </div>
            {Array.from({ length: 3 }, (_, i) => {
              const era = draft.visuals?.eras?.[i] ?? {};
              return (
                <div className="era-editor-row" key={i}>
                  <span className="eyebrow">Era 0{i + 1}</span>
                  <div className="editor-grid">
                    <Field
                      label={`Era ${i + 1} — tab and title`}
                      value={era.title ?? ""}
                      onChange={(v) => patchEra(i, { title: v })}
                    />
                    <Field
                      label={`Era ${i + 1} — status`}
                      value={era.status ?? ""}
                      onChange={(v) => patchEra(i, { status: v })}
                    />
                    <Field
                      label={`Era ${i + 1} — description`}
                      value={era.body ?? ""}
                      multiline
                      onChange={(v) => patchEra(i, { body: v })}
                    />
                  </div>
                  <div className="editor-grid">
                    <MediaField
                      label={`Era ${i + 1} — image`}
                      value={era.image ?? ""}
                      media={media}
                      busy={busy}
                      help="Empty keeps the current placeholder."
                      onChange={(url) =>
                        patchEra(i, { image: url || undefined })
                      }
                      onUpload={upload}
                    />
                    <Field
                      label={`Era ${i + 1} — image description (alt text)`}
                      value={era.imageAlt ?? ""}
                      onChange={(v) =>
                        patchEra(i, { imageAlt: v || undefined })
                      }
                    />
                  </div>
                </div>
              );
            })}
          </div>
          <div className="editor-card">
            <h3>Mike Lombard — context and behind the scenes</h3>
            <p className="editor-help">
              Page 11 of the brief. Portrait and biography of the artist, plus
              the behind-the-scenes gallery. The button to his portfolio is
              always shown and its default is https://www.mike-lombard.com.
            </p>
            <div className="editor-grid">
              <MediaField
                label="Portrait of Mike Lombard"
                value={visuals.artist?.portrait ?? ""}
                media={media}
                busy={busy}
                onChange={(url) => patchPhoto("artistPortrait", { url })}
                onUpload={upload}
              />
              <Field
                label="Portrait description (alt text)"
                value={visuals.artist?.portraitAlt ?? ""}
                onChange={(v) => patchPhoto("artistPortrait", { alt: v })}
              />
              <Field
                label="Artist name"
                value={visuals.artist?.name ?? ""}
                onChange={(v) => patchArtist({ name: v || undefined })}
              />
              <Field
                label="Biography"
                value={visuals.artist?.bio ?? ""}
                multiline
                onChange={(v) => patchArtist({ bio: v || undefined })}
              />
            </div>
            <GalleryField
              label="Behind the scenes gallery"
              withCaption
              help="Any number of images. With none, the block stays hidden."
              value={visuals.artist?.behindScenes ?? []}
              media={media}
              busy={busy}
              onChange={(slides) => patchSlides("behindScenes", slides)}
              onUpload={upload}
            />
          </div>
          <div className="editor-card">
            <h3>Buttons and links</h3>
            <p className="editor-help">
              Page 3 of the brief: the destination of each button is chosen
              here. Only internal routes (/updates) or https:// links are
              published.
            </p>
            <div className="editor-grid">
              <LinkPickerField
                label="“Follow the build” (Tequila block)"
                value={draft.copy["tequila.detail.cta.href"] ?? ""}
                suggestions={linkSuggestions}
                onChange={(v) => updateCopy("tequila.detail.cta.href", v)}
              />
              <LinkPickerField
                label="“Follow the build” (Tequila, bottom)"
                value={draft.copy["tequila.end.cta.href"] ?? ""}
                suggestions={linkSuggestions}
                onChange={(v) => updateCopy("tequila.end.cta.href", v)}
              />
              <LinkPickerField
                label="Art — portfolio CTA (Mike Lombard)"
                value={draft.copy["art.intro.cta.href"] ?? ""}
                suggestions={[
                  { label: "Mike Lombard portfolio", href: MIKE_LOMBARD_URL },
                  ...linkSuggestions,
                ]}
                onChange={(v) => updateCopy("art.intro.cta.href", v)}
              />
              <LinkPickerField
                label="“Follow the reveals” (Art, artist block)"
                value={draft.copy["art.artist.cta.href"] ?? ""}
                suggestions={linkSuggestions}
                onChange={(v) => updateCopy("art.artist.cta.href", v)}
              />
              <LinkPickerField
                label="“Follow the build” (Art, bottom)"
                value={draft.copy["art.end.cta.href"] ?? ""}
                suggestions={linkSuggestions}
                onChange={(v) => updateCopy("art.end.cta.href", v)}
              />
            </div>
          </div>
          <div className="editor-card">
            <h3>Bottle, silhouette and footer</h3>
            <p className="editor-help">
              Every slot is optional. An empty slot keeps the current look, so
              the page never shows a broken image.
            </p>
            <div className="editor-grid">
              <MediaField
                label="Bottle background"
                value={visuals.bottleBackground ?? ""}
                media={media}
                busy={busy}
                onChange={(url) =>
                  patchVisuals({ bottleBackground: url || undefined })
                }
                onUpload={upload}
              />
              <MediaField
                label="Big silhouette"
                value={visuals.bigSilhouette ?? ""}
                media={media}
                busy={busy}
                onChange={(url) =>
                  patchVisuals({ bigSilhouette: url || undefined })
                }
                onUpload={upload}
              />
              <MediaField
                label="Footer logo image"
                value={visuals.footerLogo ?? ""}
                media={media}
                busy={busy}
                help="Replaces the footer text with the logo typography image."
                onChange={(url) =>
                  patchVisuals({ footerLogo: url || undefined })
                }
                onUpload={upload}
              />
            </div>
          </div>
          <div className="editor-card">
            <h3>Project card symbols</h3>
            <p className="editor-help">
              Pick one symbol per card. “Site default” keeps the symbol the site
              uses today; “Agave” is the one-agave plant.
            </p>
            <div className="editor-grid">
              {draft.projects.map((p) => (
                <label className="field" key={p.id}>
                  <span>{p.title || p.id}</span>
                  <select
                    value={p.symbol ?? ""}
                    onChange={(e) =>
                      setDraft((d) => ({
                        ...d,
                        projects: d.projects.map((x) =>
                          x.id === p.id
                            ? {
                                ...x,
                                symbol:
                                  normalizeSymbol(e.target.value) ?? undefined,
                              }
                            : x,
                        ),
                      }))
                    }
                  >
                    <option value="">Site default</option>
                    {cardSymbols.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </label>
              ))}
            </div>
          </div>
          <div className="editor-card">
            <h3>Card backgrounds</h3>
            <p className="editor-help">
              Background image per project card (points 6 and 10 of the brief).
              Empty keeps the current design.
            </p>
            <div className="editor-grid">
              {draft.projects.map((p) => (
                <MediaField
                  key={p.id}
                  label={p.title || p.id}
                  value={visuals.cardBackgrounds?.[p.id] ?? ""}
                  media={media}
                  busy={busy}
                  onChange={(url) => setCardBackground(p.id, url)}
                  onUpload={upload}
                />
              ))}
            </div>
          </div>
        </>
      )}
      {tab === "Mingle lab" && <MingleLab />}
      {tab === "Revisions" && (
        <>
          <p className="editor-help">
            Restore a previous publication to the draft, review it, then
            publish. Local history keeps the last 12 versions.
          </p>
          {revisions.map((r, i) => (
            <div className="revision-row" key={i}>
              <span>{new Date(r.at).toLocaleString()}</span>
              <button
                className="button"
                onClick={() => {
                  setDraft(withContentDefaults(r.content));
                  setMessage(
                    "Revision restored to draft. Review before publishing.",
                  );
                }}
              >
                <RotateCcw size={15} />
                Restore draft
              </button>
            </div>
          ))}
          {!revisions.length && <p>No revisions yet.</p>}
          <button className="button" onClick={exportDraft}>
            Export draft backup
          </button>
          <button
            className="button"
            onClick={() => {
              setDraft(withContentDefaults(initialContent));
              setMessage(
                "Original brief content restored to draft. Publish to apply.",
              );
            }}
          >
            Restore brief to draft
          </button>
        </>
      )}
    </main>
  );
}
