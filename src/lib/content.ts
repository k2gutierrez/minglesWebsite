export type Status =
  | "Revealing"
  | "Building"
  | "In development"
  | "Migration prep"
  | "Testing"
  | "Live"
  | "Complete"
  | "Archived";
export type Item = {
  id: string;
  title: string;
  eyebrow: string;
  status: Status;
  description: string;
  href: string;
  enabled: boolean;
  media?: string;
  alt?: string;
  /** Símbolo elegido para la tarjeta; si falta, el sitio usa el de siempre. */
  symbol?: string;
};
export type EventStatus = "upcoming" | "past";
/**
 * Entrada de Updates o Story. Los campos de la Capa 1 (portada, galería, vídeo,
 * datos de evento) son **opcionales** a propósito: el documento ya publicado en
 * producción no los trae y debe seguir validando tal cual.
 */
export type Entry = {
  id: string;
  title: string;
  category: string;
  date: string;
  summary: string;
  proof: string;
  published: boolean;
  /** Imagen de portada (la card del sitio la usa de fondo). */
  media?: string;
  /** Texto alternativo de la portada. */
  alt?: string;
  /** Segmento de URL para la página de detalle; si falta se deriva del título. */
  slug?: string;
  location?: string;
  venue?: string;
  /** Imágenes adicionales de la entrada (galería del detalle). */
  gallery?: string[];
  /** Enlace HTTPS a un vídeo (YouTube, Vimeo, MP4 público…). */
  video?: string;
  /** Fecha de fin de un evento; opcional. */
  endsAt?: string;
  eventStatus?: EventStatus;
};
export type Module = { id: string; label: string; enabled: boolean };
/**
 * Recuadros visuales del sitio. Todo opcional: si un campo está vacío, el sitio
 * mantiene el aspecto actual (nunca deja un hueco roto).
 */
export type Visuals = {
  /** Imagen del recuadro grande del héroe, conservando el efecto hover. */
  heroArt?: string;
  /** Imagen preview del arte de la derecha del héroe. */
  heroShot?: string;
  /** Imagen con la tipografía del logo, en lugar del texto del footer. */
  footerLogo?: string;
  /** Silueta grande (hoy la huella). */
  bigSilhouette?: string;
  /** Foto de la botella de fondo. */
  bottleBackground?: string;
  /** Fondo por tarjeta de proyecto, con el `id` del proyecto como clave. */
  cardBackgrounds?: Record<string, string>;
};
export type SiteContent = {
  hero: {
    eyebrow: string;
    title: string;
    description: string;
    primary: string;
    secondary: string;
  };
  nav: { label: string; href: string }[];
  copy: Record<string, string>;
  projects: Item[];
  modules: Module[];
  updates: Entry[];
  stories: Entry[];
  visuals?: Visuals;
};
/**
 * Catálogo de símbolos que el admin puede elegir por tarjeta de proyecto.
 * `agave` es la planta que pidió el cliente (1 AGAVE) y `chisel` sustituye a la
 * huella para Art Rework. La Capa 2 (sitio público) traduce estos ids a iconos.
 */
export const cardSymbols = [
  { id: "agave", label: "Agave (1 agave plant)" },
  { id: "chisel", label: "Chisel (art rework)" },
  { id: "bottle", label: "Bottle (tequila)" },
  { id: "fingerprint", label: "Fingerprint" },
  { id: "orbit", label: "Orbit" },
  { id: "layers", label: "Layers" },
  { id: "flask", label: "Lab flask (experiments)" },
  { id: "gem", label: "Gem (collectible)" },
] as const;
export type CardSymbol = (typeof cardSymbols)[number]["id"];
export const eventStatuses: EventStatus[] = ["upcoming", "past"];
export const initialContent: SiteContent = {
  hero: {
    eyebrow: "ROOTED IN AGAVE. BUILT TO EVOLVE.",
    title: "A LITTLE WEIRD.\nA LOT OF SPIRIT.",
    description:
      "Collectible identity. Real-world tequila. Onchain experiments. Welcome to the next chapter of Mingles.",
    primary: "Explore the build",
    secondary: "Our story",
  },
  nav: [
    { label: "Tequila", href: "/tequila" },
    { label: "Art", href: "/art" },
    { label: "Story", href: "/story" },
    { label: "Experiments", href: "/experiments" },
    { label: "Updates", href: "/updates" },
  ],
  copy: {
    "brand.tagline": "AGAVE. ART. A LITTLE ANARCHY.",
    "home.state.title": "GOOD THINGS TAKE BUILDING.",
    "home.state.body":
      "One world. A few very different ways to bring it to life.",
    "tequila.title": "FROM AGAVE.\nWITH ATTITUDE.",
    "tequila.body":
      "We said we would make tequila. We are. A new bottle, a collectible cap, and a real-world expression of the Mingles spirit.",
    "tequila.kicker": "01 / THE REAL-WORLD SPIRIT",
    "tequila.cta": "Follow the bottle",
    "art.title": "SAME WEIRD DNA.\nNEW CREATURES.",
    "art.body":
      "A new era by Mike Lombard. More character, more authorship, and a whole new way to meet your Mingle.",
    "art.kicker": "02 / COLLECTIBLE IDENTITY",
    "art.cta": "Explore the new era",
    "experiments.title": "SERIOUSLY\nEXPERIMENTAL.",
    "experiments.body":
      "PVG is our experiment lab. Onchain systems built to be watched, played, and put to the test.",
    "protocol.title": "OWN THE CHARACTER.\nFOLLOW THE POSSIBILITIES.",
    "protocol.body":
      "Mingles Protocol is the future bridge between ownership and the value our ecosystem creates. Activation rules are still being built.",
    "story.title": "THE STORY\nSO FAR.",
    "story.body":
      "People, parties, experiments, and the things we actually shipped. A place for the moments that made Mingles.",
    "updates.title": "NOT A ROADMAP.\nA BUILD LOG.",
    "updates.body":
      "What changed. What shipped. What comes next. Real updates, with the proof to back them up.",
    "mission.title": "BUILD THE\nDISTILLERY.",
    "mission.body":
      "Character IP. Onchain experiments. Real-world tequila. Three engines, one shared direction: a stronger Mingles.",
    "holder.title": "YOUR MINGLES.\nYOUR NEXT CHAPTER.",
    "holder.body":
      "A home for your collection, its evolution, and what comes next.",
    "footer.note": "Collectible identity. Real-world spirit.",
    "footer.responsibility": "Made for adults. Enjoy responsibly.",
  },
  projects: [
    {
      id: "art",
      title: "Art rework",
      eyebrow: "A NEW ERA",
      status: "Revealing",
      description:
        "New character direction by Mike Lombard. Official reveals will appear here when approved.",
      href: "/art",
      enabled: true,
    },
    {
      id: "bottle",
      title: "New bottle",
      eyebrow: "PHYSICAL PROOF",
      status: "Building",
      description:
        "Tequila, packaging, and a collectible cap. Follow the product as it takes shape.",
      href: "/tequila",
      enabled: true,
    },
    {
      id: "protocol",
      title: "Mingles Protocol",
      eyebrow: "THE FUTURE BRIDGE",
      status: "In development",
      description:
        "Ownership and opt-in participation. Rules will be published before activation opens.",
      href: "/build-the-distillery",
      enabled: true,
    },
    {
      id: "collection",
      title: "Next collection",
      eyebrow: "THE NEXT CHAPTER",
      status: "Migration prep",
      description:
        "Collection evolution, with provenance and migration details when finalized.",
      href: "/art",
      enabled: true,
    },
    {
      id: "gluttons",
      title: "Gluttons",
      eyebrow: "PVG / EXPERIMENT 01",
      status: "Building",
      description:
        "An onchain experiment from PVG. Approved rules, participation details, and launch links are coming.",
      href: "/experiments",
      enabled: true,
    },
    {
      id: "outbreak",
      title: "Outbreak Z",
      eyebrow: "PVG / EXPERIMENT 02",
      status: "Building",
      description:
        "The next system in the PVG lab. Watch for a verified build update before participation opens.",
      href: "/experiments",
      enabled: true,
    },
  ],
  modules: [
    { id: "state", label: "Building now", enabled: true },
    { id: "tequila", label: "Tequila", enabled: true },
    { id: "art", label: "Art rework", enabled: true },
    { id: "experiments", label: "Experiments", enabled: true },
    { id: "protocol", label: "Protocol preview", enabled: true },
    { id: "story", label: "The story so far", enabled: true },
    { id: "updates", label: "Latest updates", enabled: true },
    { id: "holder", label: "Holder invitation", enabled: true },
  ],
  updates: [],
  stories: [],
};
export const statuses: Status[] = [
  "Revealing",
  "Building",
  "In development",
  "Migration prep",
  "Testing",
  "Live",
  "Complete",
  "Archived",
];
export function safeHref(value: string, fallback = "/updates") {
  if (typeof value !== "string" || /[\\\u0000-\u0020]/.test(value))
    return fallback;
  if (/^#[a-zA-Z0-9_-]+$/.test(value) || /^\/(?!\/)/.test(value)) return value;
  try {
    const url = new URL(value);
    if (url.protocol === "https:" && !url.username && !url.password)
      return url.href;
  } catch {
    /* invalid URL */
  }
  return fallback;
}
/**
 * true solo para URLs https absolutas y limpias; los enlaces de vídeo lo exigen.
 * Acepta `undefined` para poder usarse directamente sobre campos opcionales.
 */
export function isHttpsUrl(value: string | undefined | null) {
  return (
    typeof value === "string" &&
    value.startsWith("https://") &&
    safeHref(value, "") === value
  );
}
const isRecord = (v: unknown): v is Record<string, unknown> =>
  !!v && typeof v === "object" && !Array.isArray(v);
/** Texto opcional: lo que no sea una cadena con contenido queda sin definir. */
function optionalText(value: unknown) {
  return typeof value === "string" && value.trim() ? value : undefined;
}
/** Galería: solo URLs/cadenas con contenido; cualquier otra cosa se descarta. */
function stringList(value: unknown) {
  return Array.isArray(value)
    ? value.filter((v): v is string => typeof v === "string" && !!v.trim())
    : [];
}
/** Convierte un título en un segmento de URL seguro (sin acentos ni símbolos). */
export function slugify(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}
function normalizeSlug(value: unknown) {
  return typeof value === "string" ? slugify(value) || undefined : undefined;
}
/** Solo se aceptan símbolos del catálogo; si no, la tarjeta usa el de siempre. */
export function normalizeSymbol(value: unknown) {
  return cardSymbols.some((s) => s.id === value)
    ? (value as CardSymbol)
    : undefined;
}
function normalizeEntry(entry: Entry): Entry {
  return {
    ...entry,
    media: optionalText(entry.media),
    alt: optionalText(entry.alt),
    slug: normalizeSlug(entry.slug),
    location: optionalText(entry.location),
    venue: optionalText(entry.venue),
    gallery: stringList(entry.gallery),
    video: optionalText(entry.video),
    endsAt: optionalText(entry.endsAt),
    eventStatus:
      entry.eventStatus === "upcoming" || entry.eventStatus === "past"
        ? entry.eventStatus
        : undefined,
  };
}
function normalizeVisuals(value: unknown): Visuals {
  const record = isRecord(value) ? value : {};
  const cardBackgrounds: Record<string, string> = {};
  if (isRecord(record.cardBackgrounds))
    for (const [id, url] of Object.entries(record.cardBackgrounds))
      if (typeof url === "string" && url.trim()) cardBackgrounds[id] = url;
  return {
    heroArt: optionalText(record.heroArt),
    heroShot: optionalText(record.heroShot),
    footerLogo: optionalText(record.footerLogo),
    bigSilhouette: optionalText(record.bigSilhouette),
    bottleBackground: optionalText(record.bottleBackground),
    cardBackgrounds,
  };
}
/**
 * Normaliza cualquier documento válido al modelo actual. Es la red de seguridad
 * de la compatibilidad hacia atrás: el documento publicado hoy no tiene los
 * campos de la Capa 1 y, aun así, se lee sin exigirle nada nuevo.
 */
export function withContentDefaults(raw: SiteContent): SiteContent {
  return {
    ...raw,
    visuals: normalizeVisuals(raw.visuals),
    projects: (raw.projects ?? []).map((p) => ({
      ...p,
      symbol: normalizeSymbol(p.symbol),
    })),
    updates: (raw.updates ?? []).map(normalizeEntry),
    stories: (raw.stories ?? []).map(normalizeEntry),
  };
}
/**
 * Slug estable de una entrada para su página de detalle. La Capa 2 lo usa como
 * respaldo cuando el admin no escribió uno: `entrySlug(entry)`.
 */
export function entrySlug(entry: Entry) {
  return (
    normalizeSlug(entry.slug) ||
    slugify(entry.title) ||
    `entry-${entry.id.slice(0, 8)}`
  );
}
export function isSiteContent(value: unknown): value is SiteContent {
  const record = (v: unknown): v is Record<string, unknown> =>
    !!v && typeof v === "object" && !Array.isArray(v);
  const strings = (v: unknown, keys: string[]) =>
    record(v) && keys.every((k) => typeof v[k] === "string");
  const entries = (v: unknown) =>
    Array.isArray(v) &&
    v.every(
      (e) =>
        strings(e, ["id", "title", "category", "date", "summary", "proof"]) &&
        typeof e.published === "boolean",
    );
  if (!record(value)) return false;
  return (
    strings(value.hero, [
      "eyebrow",
      "title",
      "description",
      "primary",
      "secondary",
    ]) &&
    record(value.copy) &&
    Object.values(value.copy).every((v) => typeof v === "string") &&
    Array.isArray(value.nav) &&
    value.nav.every((n) => strings(n, ["label", "href"])) &&
    Array.isArray(value.projects) &&
    value.projects.every(
      (p) =>
        strings(p, [
          "id",
          "title",
          "eyebrow",
          "status",
          "description",
          "href",
        ]) &&
        typeof p.enabled === "boolean" &&
        statuses.includes(p.status),
    ) &&
    Array.isArray(value.modules) &&
    value.modules.every(
      (m) => strings(m, ["id", "label"]) && typeof m.enabled === "boolean",
    ) &&
    entries(value.updates) &&
    entries(value.stories)
  );
}
