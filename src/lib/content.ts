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
 * Imagen del CMS con su texto alternativo.
 * Se guarda como objeto (no como cadena) para que el admin pueda escribir la
 * descripción de cada imagen; el normalizador también acepta cadenas sueltas.
 */
export type Photo = { url?: string; alt?: string };
/**
 * Diapositiva de un carrusel: la foto y, si el admin la escribe, una leyenda.
 * El carrusel exige 4 como mínimo para montarse (petición 2 del PDF).
 */
export type Slide = Photo & { caption?: string };
/** Un punto de la lista "01 / 02 / 03" del bloque ROOTED IN AGAVE. */
export type AgavePoint = { title?: string; body?: string };
/**
 * Contenido del bloque "ROOTED IN AGAVE" / "THE SPIRIT. THE SURPRISE.".
 * Todo opcional: cada hueco vacío conserva el texto o la imagen actuales.
 */
export type AgaveDetails = {
  status?: string;
  title?: string;
  body?: string;
  points?: AgavePoint[];
};
/** Una tarjeta del bloque "PROOF AT EVERY STEP.". */
export type ProofCard = { title?: string; tagline?: string };
/**
 * Una era del lineage de Art. Los fondos e imágenes los sube el admin; si
 * faltan, la era se ve exactamente como hasta ahora.
 */
export type EraDetails = {
  title?: string;
  body?: string;
  status?: string;
  image?: string;
  imageAlt?: string;
};
/**
 * Contexto de Mike Lombard (petición 11 del PDF): retrato, biografía y galería
 * behind-the-scenes. El CTA al portfolio es obligatorio y no depende de estos
 * campos: siempre apunta a MIKE_LOMBARD_URL mientras el admin no ponga otra.
 */
export type ArtistDetails = {
  name?: string;
  bio?: string;
  portrait?: string;
  portraitAlt?: string;
  behindScenes?: Slide[];
};
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
  /** Hero shot del intro de /tequila (hoy ese hueco está vacío). */
  tequilaHeroShot?: string;
  tequilaHeroAlt?: string;
  /** Galería de la botella: se monta a partir de 4 imágenes. */
  tequilaGallery?: Slide[];
  /** Fondo del bloque "ROOTED IN AGAVE". */
  agaveBackground?: string;
  agaveBackgroundAlt?: string;
  /** Hero shot del intro de /art. */
  artHeroShot?: string;
  artHeroAlt?: string;
  /** Contexto y behind-the-scenes de Mike Lombard. */
  artist?: ArtistDetails;
  /** Las tres eras del lineage de Art. */
  eras?: EraDetails[];
};
/**
 * Portfolio de Mike Lombard. Es el destino obligatorio del CTA de Art: mientras
 * el admin no escriba otro, el botón apunta aquí.
 */
export const MIKE_LOMBARD_URL = "https://www.mike-lombard.com";
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
    // --- Etapa 3 (continuacion) ---
    "cards.explore": "EXPLORE ↗",
    "home.lab.kicker": "03 / THE EXPERIMENT LAB",
    "home.lab.cta": "Inside the lab",
    "home.protocol.cta": "See how it connects",
    "home.protocol.vertical": "MINGLES PROTOCOL / NOT LIVE",
    // Modulo compartido por /experiments y /play (mismas claves a proposito).
    "modules.pvg.label": "PVG",
    "modules.pvg.caption": "IDENTITY STUDY / GAME MEDIA PENDING",
    "modules.pvg.cta": "View experiment",
    "experiments.lab.title": "PVG IS THE LAB. MINGLES IS THE IDENTITY.",
    "experiments.rules.title1": "WATCH THE BUILD.",
    "experiments.rules.title2": "KNOW THE RULES.",
    "experiments.rules.body":
      "The deep game experience lives with PVG. Participation only opens when rules, costs, limits, and official links are ready.",
    "experiments.rules.note":
      "Rules, fees, results, and any Mingles allocation: not yet published.",
    "tequila.agave.eyebrow": "REAL-WORLD SPIRIT",
    // --- Etapa 3: claves que los componentes ya usaban pero NO estaban en el
    // modelo, asi que el panel no mostraba su campo aunque el texto se viera. ---
    "hero.foot": "THE WORLD OF MINGLES",
    "home.progress.kicker": "PROGRESS, NOT PROMISES.",
    "story.kicker": "BUILT THROUGH PEOPLE",
    "updates.kicker": "FROM THE BUILD LOG",
    "updates.heading": "LATEST MOVES.",
    "holder.kicker": "FOR THE ONES WHO OWN THE WEIRD",
    "tequila.bottle.label": "THE BOTTLE",
    "tequila.cap.label": "THE CAP",
    "tequila.experience.label": "THE EXPERIENCE",
    "tequila.detail.status": "In development",
    "tequila.gallery.label": "Tequila gallery",
    "art.artist.name": "Mike Lombard",
    "art.artist.bts.heading": "BEHIND THE SCENES.",
    "art.artist.portfolio.href": "https://www.mike-lombard.com",
    "protocol.engine.label": "ENGINE",
    // Rotulos del recuadro interactivo (BrandArt).
    "field.corner": "M / IDENTITY IN MOTION",
    "field.cornerAccent": "INTERACTIVE FIELD",
    "field.hint": "MOVE YOUR CURSOR / EXPLORE THE FIELD",
    "tequila.agave.title": "ROOTED\nIN AGAVE.",
    "tequila.agave.note": "PRODUCT PHOTOGRAPHY TO FOLLOW",
    "tequila.detail.title": "THE SPIRIT.\nTHE SURPRISE.",
    // --- Etapa 3: copy que estaba fijo en el codigo ---
    // Banda CTA compartida (varias paginas). Si el admin la deja vacia, cada
    // pagina conserva su texto y su destino actuales.
    "cta.band.eyebrow": "THE NEXT CHAPTER IS BEING BUILT.",
    "cta.band.label": "Follow the build",
    "cta.band.href": "",
    // Etiquetas de las tarjetas de Story y Updates (mismo componente).
    "cards.readMore": "Read more",
    "cards.eventDetails": "Event details",
    // Destileria (/build-the-distillery)
    "mission.eyebrow": "OUR NORTH STAR",
    "protocol.engine1.title": "CHARACTER IP",
    "protocol.engine1.body":
      "Mingles is the collectible identity at the center of everything we build.",
    "protocol.engine2.title": "THE EXPERIMENT LAB",
    "protocol.engine2.body":
      "PVG creates onchain experiments, with demand beyond the holder community.",
    "protocol.engine3.title": "REAL-WORLD TEQUILA",
    "protocol.engine3.body":
      "A physical product that carries the Mingles brand into the world.",
    "protocol.bridge.title": "THE FUTURE BRIDGE.",
    "protocol.bridge.body":
      "Activation is being designed to connect eligible ownership to published allocations from selected systems. It will be opt-in. No economics are live.",
    "protocol.flow.1": "Outside demand",
    "protocol.flow.2": "Tequila / PVG",
    "protocol.flow.3": "Published allocation",
    "protocol.flow.4": "Activated Mingles",
    "protocol.flow.5": "Distribution record",
    "protocol.bridge.note":
      "Future architecture only. Allocations, periods, fees, contracts, and eligibility remain subject to published rules and approval.",
    /**
     * Copy editable del bloque "THE SPIRIT. THE SURPRISE.". Es una clave nueva
     * con el mismo valor que `tequila.body`, así que si el admin ya editó la
     * antigua se sigue leyendo hasta que toque este campo.
     */
    "tequila.detail.body":
      "A bottle that belongs in the real world. A collectible cap that belongs in the Mingles universe.",
    "tequila.detail.cta": "Follow the build",
    "tequila.detail.cta.href": "/updates",
    "tequila.gallery.eyebrow": "THE BOTTLE / GALLERY",
    "tequila.gallery.heading": "LOOK AT THE SPIRIT.",
    "tequila.gallery.autoplay": "Autoplay",
    "tequila.proof.eyebrow": "PRODUCT FIRST",
    "tequila.proof.title": "PROOF AT EVERY STEP.",
    "tequila.proof.card.1.title": "Bottle & cap",
    "tequila.proof.card.2.title": "Packaging & unboxing",
    "tequila.proof.card.3.title": "Production & testing",
    "tequila.proof.card.1.tagline": "Official media awaiting publication",
    "tequila.proof.card.2.tagline": "Official media awaiting publication",
    "tequila.proof.card.3.tagline": "Official media awaiting publication",
    "tequila.proof.body":
      "Launch information, availability, and retail channels will be published when confirmed.",
    "tequila.detail.1.title": "The bottle",
    "tequila.detail.2.title": "Reveal your Mingle",
    "tequila.detail.3.title": "The whole experience",
    "tequila.detail.1.body":
      "Product details will be published with verified production information.",
    "tequila.detail.2.body":
      "The collectible cap is the signature moment. The full reveal comes with the real product.",
    "tequila.detail.3.body":
      "Packaging, unboxing, and the details that make it Mingles.",
    "tequila.end.eyebrow": "THE NEXT CHAPTER IS BEING BUILT.",
    "tequila.end.cta": "Follow the build",
    "tequila.end.cta.href": "/updates",
    "art.title": "SAME WEIRD DNA.\nNEW CREATURES.",
    "art.body":
      "A new era by Mike Lombard. More character, more authorship, and a whole new way to meet your Mingle.",
    "art.kicker": "02 / COLLECTIBLE IDENTITY",
    "art.cta": "Explore the new era",
    "art.intro.cta": "View Mike Lombard's portfolio",
    "art.intro.cta.href": MIKE_LOMBARD_URL,
    "art.lineage.eyebrow": "THREE CHAPTERS. ONE IDENTITY.",
    "art.lineage.title": "AN EVOLUTION.\nSTILL A MINGLE.",
    "art.lineage.body":
      "Explore the lineage. Each era is part of the story; official art is shown only when approved.",
    "art.artist.eyebrow": "THE ARTIST / MIKE LOMBARD",
    "art.artist.title": "MORE CHARACTER.\nMORE MINGLES.",
    "art.artist.body":
      "The new art direction builds a stronger foundation for character IP: weird, irreverent creatures of the agave that can live in collectibles, product, and play.",
    "art.artist.body2":
      "Collection and migration details will follow once the official rules are finalized.",
    "art.artist.cta": "Follow the reveals",
    "art.artist.cta.href": "/updates",
    "art.artist.portfolio": "Mike Lombard's portfolio",
    "art.artist.bts.eyebrow": "BEHIND THE SCENES",
    "art.artist.bts.body":
      "Sketches, work in progress, and the studio moments behind the new Mingles.",
    "art.end.eyebrow": "THE NEXT CHAPTER IS BEING BUILT.",
    "art.end.cta": "Follow the build",
    "art.end.cta.href": "/updates",
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
  /**
   * Solo el documento local (si el CMS no responde) trae `visuals`. Se limita a
   * los textos alternativos por defecto: ninguna imagen inventada.
   */
  visuals: {
    tequilaHeroAlt: "Mingles bottle",
    artHeroAlt: "Official Mingles art",
    agaveBackgroundAlt: "Agave field",
    artist: { portraitAlt: "Mike Lombard" },
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
 * Destino de un botón elegido en el admin (petición 3 del PDF): ruta interna
 * (`/...`), ancla (`#...`) o `https://`. Cualquier otro esquema —`javascript:`,
 * `data:`, `mailto:`— se cambia por `fallback` en lugar de publicarse.
 */
export function safeLinkHref(value: string, fallback = "") {
  if (typeof value !== "string") return fallback;
  const clean = safeHref(value.trim(), "");
  return clean === "" ? fallback : clean;
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
/**
 * Una imagen del CMS solo se acepta si es un `https://` limpio. Cualquier otra
 * cosa —`javascript:`, `data:`, `http://` o una ruta interna— se descarta y el
 * hueco se queda como estaba.
 */
function normalizePhotoUrl(value: unknown) {
  return typeof value === "string" && isHttpsUrl(value) ? value : undefined;
}
/** Acepta `{url,alt,caption}` o la cadena suelta de una galería antigua. */
function normalizeSlide(value: unknown): Slide | undefined {
  if (typeof value === "string") {
    const url = normalizePhotoUrl(value);
    return url ? { url } : undefined;
  }
  if (!isRecord(value)) return undefined;
  const url = normalizePhotoUrl(value.url);
  if (!url) return undefined;
  return {
    url,
    alt: optionalText(value.alt),
    caption: optionalText(value.caption),
  };
}
function normalizeSlides(value: unknown): Slide[] {
  return Array.isArray(value)
    ? value.map(normalizeSlide).filter((s): s is Slide => !!s)
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
  const eras: EraDetails[] = Array.from({ length: 3 }, (_, i) => {
    const raw = Array.isArray(record.eras) ? record.eras[i] : undefined;
    const era = isRecord(raw) ? raw : {};
    return {
      title: optionalText(era.title),
      body: optionalText(era.body),
      status: optionalText(era.status),
      image: normalizePhotoUrl(era.image),
      imageAlt: optionalText(era.imageAlt),
    };
  });
  const artistRaw = isRecord(record.artist) ? record.artist : {};
  return {
    heroArt: optionalText(record.heroArt),
    heroShot: optionalText(record.heroShot),
    footerLogo: optionalText(record.footerLogo),
    bigSilhouette: optionalText(record.bigSilhouette),
    bottleBackground: optionalText(record.bottleBackground),
    cardBackgrounds,
    tequilaHeroShot: normalizePhotoUrl(record.tequilaHeroShot),
    tequilaHeroAlt: optionalText(record.tequilaHeroAlt),
    tequilaGallery: normalizeSlides(record.tequilaGallery),
    agaveBackground: normalizePhotoUrl(record.agaveBackground),
    agaveBackgroundAlt: optionalText(record.agaveBackgroundAlt),
    artHeroShot: normalizePhotoUrl(record.artHeroShot),
    artHeroAlt: optionalText(record.artHeroAlt),
    artist: {
      name: optionalText(artistRaw.name),
      bio: optionalText(artistRaw.bio),
      portrait: normalizePhotoUrl(artistRaw.portrait),
      portraitAlt: optionalText(artistRaw.portraitAlt),
      behindScenes: normalizeSlides(artistRaw.behindScenes),
    },
    eras,
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
    /**
     * Rellena las claves de copy que el documento no trae.
     *
     * El panel construye sus campos a partir de `draft.copy`, así que una clave
     * que no esté en el documento **no aparece en el admin** y su texto queda
     * imposible de editar. El documento publicado se guardó antes de que
     * existieran estas claves, de modo que sin esto no se verían (es justo lo
     * que reporta el cliente: "algunas secciones ni aparecen en el panel").
     *
     * Los valores por defecto son el texto que el sitio **ya enseña**, así que
     * rellenarlos no cambia nada visible; y lo que haya guardado siempre gana.
     */
    copy: { ...initialContent.copy, ...(raw.copy ?? {}) },
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
 * Valores por defecto de los campos nuevos de la Etapa 1. Se usan en el admin
 * para que cada campo muestre el texto que el sitio enseña hoy y en la página
 * como respaldo cuando el CMS no trae nada (el documento publicado no los
 * tiene). Nunca añaden contenido nuevo: solo reproducen lo que ya se ve.
 */
export const tequilaDetailDefaults: {
  title: string;
  body: string;
  points: { title: string; body: string }[];
} = {
  title: "THE SPIRIT.\nTHE SURPRISE.",
  body: "A bottle that belongs in the real world. A collectible cap that belongs in the Mingles universe.",
  points: [
    {
      title: "The bottle",
      body: "Product details will be published with verified production information.",
    },
    {
      title: "Reveal your Mingle",
      body: "The collectible cap is the signature moment. The full reveal comes with the real product.",
    },
    {
      title: "The whole experience",
      body: "Packaging, unboxing, and the details that make it Mingles.",
    },
  ],
};
export const proofDefaults: {
  eyebrow: string;
  title: string;
  cards: { title: string; tagline: string }[];
  body: string;
  ctaLabel: string;
} = {
  eyebrow: "PRODUCT FIRST",
  title: "PROOF AT EVERY STEP.",
  cards: [
    { title: "Bottle & cap", tagline: "Official media awaiting publication" },
    {
      title: "Packaging & unboxing",
      tagline: "Official media awaiting publication",
    },
    {
      title: "Production & testing",
      tagline: "Official media awaiting publication",
    },
  ],
  body: "Launch information, availability, and retail channels will be published when confirmed.",
  ctaLabel: "Follow the build",
};
export const endCtaDefaults = {
  eyebrow: "THE NEXT CHAPTER IS BEING BUILT.",
  label: "Follow the build",
  href: "/updates",
};
export const agaveDefaults: {
  status: string;
  title: string;
  body: string;
  points: { title: string; body: string }[];
} = {
  status: "Building",
  title: "THE SPIRIT.\nTHE SURPRISE.",
  body: tequilaDetailDefaults.body,
  points: tequilaDetailDefaults.points,
};
export const eraDefaults: { title: string; body: string; status: string }[] = [
  {
    title: "Legacy PFP",
    body: "The original collectible identity. The beginning of the Mingles story, preserved as part of its provenance.",
    status: "Official assets pending",
  },
  {
    title: "ApeChain",
    body: "The current official ApeChain chapter. Verified token art will appear with ownership and provenance data.",
    status: "Official assets pending",
  },
  {
    title: "Lombard era",
    body: "Incoming authored character art by Mike Lombard. Same recognizable DNA, a new creative chapter.",
    status: "Reveal pending",
  },
];
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
