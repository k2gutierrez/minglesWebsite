import test from "node:test";
import assert from "node:assert/strict";
import {
  initialContent,
  isHttpsUrl,
  isSiteContent,
  MIKE_LOMBARD_URL,
  normalizeSymbol,
  safeHref,
  safeLinkHref,
  entrySlug,
  withContentDefaults,
} from "../src/lib/content.ts";
/**
 * Forma EXACTA del documento publicado en producción antes de la Capa 1: sin
 * `visuals`, sin campos de imagen en las entradas y con el orden de claves que
 * devuelve Supabase. Es el caso que no puede romperse nunca.
 */
const legacyDocument = {
  nav: [{ href: "/tequila", label: "Tequila" }],
  copy: { "brand.tagline": "AGAVE. ART. A LITTLE ANARCHY." },
  hero: {
    title: "A LITTLE WEIRD.",
    eyebrow: "ROOTED IN AGAVE.",
    primary: "Explore the build",
    secondary: "Our story",
    description: "Collectible identity.",
  },
  modules: [{ id: "state", label: "Building now", enabled: true }],
  stories: [],
  updates: [
    {
      id: "33df338f-d6f2-4449-9c11-d1c28d5f52e5",
      date: "2026-09-23",
      proof: "",
      title: "Testins UPDATE",
      summary: "Testing Testing 2",
      category: "Company",
      published: true,
    },
  ],
  projects: [
    {
      id: "art",
      href: "/art",
      media: "https://example.supabase.co/storage/v1/object/public/x.png",
      title: "Art rework",
      status: "Revealing",
      enabled: true,
      eyebrow: "A NEW ERA",
      description: "New character direction.",
      alt: "Approved art",
    },
  ],
};
test("links allow internal routes, anchors, and HTTPS only", () => {
  for (const url of [
    "/art",
    "/experiments#gluttons",
    "#building",
    "https://example.com/proof",
  ])
    assert.equal(safeHref(url), url);
  for (const url of [
    "javascript:alert(1)",
    "//example.com",
    "data:text/html,test",
    "http://example.com",
    "/\\example.com",
  ])
    assert.equal(safeHref(url), "/updates");
});
test("content rejects missing and malformed nested records", () => {
  assert.ok(isSiteContent(initialContent));
  for (const value of [
    null,
    {},
    { ...initialContent, projects: [null] },
    { ...initialContent, hero: { title: "Only title" } },
    { ...initialContent, updates: [{ title: "Missing fields" }] },
  ])
    assert.equal(isSiteContent(value), false);
});
test("seed does not invent published proof or distribution data", () => {
  assert.equal(initialContent.updates.length, 0);
  assert.equal(initialContent.stories.length, 0);
  assert.ok(!initialContent.projects.some((p) => p.status === "Live"));
  assert.equal(
    initialContent.modules.length,
    new Set(initialContent.modules.map((m) => m.id)).size,
  );
});
test("the already-published document still validates and keeps its content", () => {
  assert.ok(isSiteContent(legacyDocument));
  const normalized = withContentDefaults(legacyDocument);
  // Nada de lo publicado se pierde ni se reescribe.
  assert.equal(normalized.hero.title, legacyDocument.hero.title);
  assert.equal(normalized.nav[0].label, "Tequila");
  assert.equal(normalized.copy["brand.tagline"], legacyDocument.copy["brand.tagline"]);
  assert.equal(normalized.updates[0].title, "Testins UPDATE");
  assert.equal(normalized.updates[0].summary, "Testing Testing 2");
  assert.equal(normalized.updates[0].published, true);
  assert.equal(normalized.projects[0].media, legacyDocument.projects[0].media);
  assert.equal(normalized.projects[0].alt, "Approved art");
  // Los campos nuevos se rellenan con valores neutros, no con contenido inventado.
  assert.deepEqual(normalized.visuals.cardBackgrounds, {});
  assert.equal(normalized.visuals.heroArt, undefined);
  assert.equal(normalized.visuals.heroShot, undefined);
  assert.equal(normalized.visuals.footerLogo, undefined);
  assert.equal(normalized.visuals.bigSilhouette, undefined);
  assert.equal(normalized.visuals.bottleBackground, undefined);
  assert.deepEqual(normalized.updates[0].gallery, []);
  assert.equal(normalized.updates[0].media, undefined);
  assert.equal(normalized.updates[0].video, undefined);
  assert.equal(normalized.updates[0].eventStatus, undefined);
  assert.equal(normalized.projects[0].symbol, undefined);
  // Sigue siendo un documento válido después de normalizarlo.
  assert.ok(isSiteContent(normalized));
});
test("new visual and entry fields survive a JSON round trip", () => {
  const document = withContentDefaults({
    ...legacyDocument,
    visuals: {
      heroArt: "https://example.com/hero.png",
      heroShot: "https://example.com/shot.png",
      footerLogo: "https://example.com/footer.png",
      bigSilhouette: "https://example.com/silhouette.png",
      bottleBackground: "https://example.com/bottle.png",
      cardBackgrounds: { art: "https://example.com/art-card.png" },
    },
    updates: [
      {
        ...legacyDocument.updates[0],
        media: "https://example.com/cover.png",
        alt: "Cover",
        slug: "Opening Party",
        location: "Guadalajara",
        venue: "Casa Mingles",
        gallery: ["https://example.com/1.png", "https://example.com/2.png"],
        video: "https://www.youtube.com/watch?v=abc",
        endsAt: "2026-10-12",
        eventStatus: "past",
      },
    ],
    projects: [{ ...legacyDocument.projects[0], symbol: "chisel" }],
  });
  const roundTrip = JSON.parse(JSON.stringify(document));
  assert.deepEqual(roundTrip.visuals.cardBackgrounds, {
    art: "https://example.com/art-card.png",
  });
  assert.equal(roundTrip.visuals.footerLogo, "https://example.com/footer.png");
  assert.equal(roundTrip.projects[0].symbol, "chisel");
  assert.deepEqual(roundTrip.updates[0].gallery, [
    "https://example.com/1.png",
    "https://example.com/2.png",
  ]);
  assert.equal(roundTrip.updates[0].eventStatus, "past");
  assert.equal(roundTrip.updates[0].venue, "Casa Mingles");
  // El slug se sanea a un segmento de URL, no se guarda tal cual.
  assert.equal(roundTrip.updates[0].slug, "opening-party");
  assert.ok(isSiteContent(roundTrip));
});
test("malformed optional fields are sanitised instead of rejecting the document", () => {
  const document = withContentDefaults({
    ...legacyDocument,
    visuals: { heroArt: 42, cardBackgrounds: { art: "", bottle: "/x.png" } },
    updates: [
      {
        ...legacyDocument.updates[0],
        media: null,
        gallery: "not-an-array",
        eventStatus: "somtime",
        video: 17,
      },
    ],
    projects: [{ ...legacyDocument.projects[0], symbol: "not-a-symbol" }],
  });
  assert.equal(document.visuals.heroArt, undefined);
  assert.deepEqual(document.visuals.cardBackgrounds, { bottle: "/x.png" });
  assert.deepEqual(document.updates[0].gallery, []);
  assert.equal(document.updates[0].eventStatus, undefined);
  assert.equal(document.updates[0].video, undefined);
  assert.equal(document.projects[0].symbol, undefined);
});
test("symbols are limited to the catalogue and slugs are URL-safe", () => {
  assert.equal(normalizeSymbol("agave"), "agave");
  assert.equal(normalizeSymbol("bottle"), "bottle");
  assert.equal(normalizeSymbol("Fingerprint"), undefined);
  assert.equal(normalizeSymbol(""), undefined);
  assert.equal(entrySlug({ ...legacyDocument.updates[0], slug: "" }), "testins-update");
  assert.equal(
    entrySlug({ ...legacyDocument.updates[0], title: "¡Fiesta en Guadalajara!" }),
    "fiesta-en-guadalajara",
  );
  assert.equal(
    entrySlug({ ...legacyDocument.updates[0], title: "", slug: "" }),
    "entry-33df338f",
  );
});
test("video and proof links must be clean HTTPS URLs", () => {
  assert.ok(isHttpsUrl("https://www.youtube.com/watch?v=abc"));
  for (const value of [
    "javascript:alert(1)",
    "http://example.com/video",
    "data:text/html,<script>",
    "/story/party",
    "https://user:pass@example.com/video",
    "https://example.com/a b",
  ])
    assert.equal(isHttpsUrl(value), false);
});
/* ---------------------------------------------------------------------------
   Etapa 1 del PDF (páginas 1, 2, 3, 4, 9, 10 y 11): Tequila y Art editables.
   Lo que no puede romperse es que el documento ya publicado —que no trae
   ninguno de estos campos— siga validando y se normalice sin inventar nada.
   --------------------------------------------------------------------------- */
test("a document without the Etapa 1 fields keeps the site exactly as it was", () => {
  const normalized = withContentDefaults(legacyDocument);
  // Sin hero shots, sin galería y sin contexto: los componentes no pintan nada.
  assert.equal(normalized.visuals.tequilaHeroShot, undefined);
  assert.equal(normalized.visuals.tequilaHeroAlt, undefined);
  assert.deepEqual(normalized.visuals.tequilaGallery, []);
  assert.equal(normalized.visuals.agaveBackground, undefined);
  assert.equal(normalized.visuals.artHeroShot, undefined);
  assert.equal(normalized.visuals.artist.name, undefined);
  assert.equal(normalized.visuals.artist.portrait, undefined);
  assert.equal(normalized.visuals.artist.bio, undefined);
  assert.deepEqual(normalized.visuals.artist.behindScenes, []);
  // El lineage siempre son tres eras, vacías: la página usa sus textos de siempre.
  assert.equal(normalized.visuals.eras.length, 3);
  for (const era of normalized.visuals.eras) {
    assert.equal(era.title, undefined);
    assert.equal(era.body, undefined);
    assert.equal(era.image, undefined);
  }
  // Sigue siendo válido después de normalizarlo.
  assert.ok(isSiteContent(normalized));
});
test("the shape published in production today still validates untouched", () => {
  // Reproduce el documento real de `site_content.published` (Supabase): trae
  // `visuals` con heroArt/footerLogo/cardBackgrounds y ninguna clave nueva.
  const published = {
    ...legacyDocument,
    visuals: {
      heroArt: "https://x.supabase.co/storage/v1/object/public/public-media/a.webp",
      footerLogo:
        "https://x.supabase.co/storage/v1/object/public/public-media/b.png",
      cardBackgrounds: {
        art: "https://x.supabase.co/storage/v1/object/public/public-media/c.webp",
        bottle:
          "https://x.supabase.co/storage/v1/object/public/public-media/d.webp",
      },
    },
  };
  assert.ok(isSiteContent(published));
  const normalized = withContentDefaults(JSON.parse(JSON.stringify(published)));
  assert.equal(normalized.visuals.heroArt, published.visuals.heroArt);
  assert.equal(normalized.visuals.footerLogo, published.visuals.footerLogo);
  assert.deepEqual(
    normalized.visuals.cardBackgrounds,
    published.visuals.cardBackgrounds,
  );
  assert.equal(normalized.visuals.heroShot, undefined);
  assert.deepEqual(normalized.visuals.tequilaGallery, []);
  // La normalización no añade ni quita claves obligatorias del documento.
  assert.deepEqual(
    Object.keys(normalized).sort(),
    Object.keys(published).sort(),
  );
});
test("Etapa 1 images, galleries and artist context survive a round trip", () => {
  const document = withContentDefaults({
    ...legacyDocument,
    visuals: {
      tequilaHeroShot: "https://example.com/tequila-hero.png",
      tequilaHeroAlt: "Mingles bottle",
      tequilaGallery: [
        { url: "https://example.com/1.png", alt: "Bottle", caption: "01" },
        "https://example.com/2.png",
        { url: "https://example.com/3.png" },
        { url: "https://example.com/4.png" },
      ],
      agaveBackground: "https://example.com/agave.png",
      agaveBackgroundAlt: "Agave field",
      artHeroShot: "https://example.com/art-hero.png",
      artist: {
        name: "Mike Lombard",
        bio: "Painter and illustrator.",
        portrait: "https://example.com/mike.png",
        portraitAlt: "Mike Lombard",
        behindScenes: [
          { url: "https://example.com/bts-1.png", caption: "Sketching" },
        ],
      },
      eras: [
        { title: "Legacy PFP", image: "https://example.com/era-1.png" },
        { title: "ApeChain", body: "Current chapter." },
      ],
    },
  });
  const roundTrip = JSON.parse(JSON.stringify(document));
  assert.equal(roundTrip.visuals.tequilaHeroShot, "https://example.com/tequila-hero.png");
  assert.equal(roundTrip.visuals.tequilaGallery.length, 4);
  // La cadena suelta se guarda como objeto con su URL.
  assert.deepEqual(roundTrip.visuals.tequilaGallery[1], {
    url: "https://example.com/2.png",
  });
  assert.equal(roundTrip.visuals.tequilaGallery[0].caption, "01");
  assert.equal(roundTrip.visuals.artist.name, "Mike Lombard");
  assert.equal(
    roundTrip.visuals.artist.behindScenes[0].caption,
    "Sketching",
  );
  assert.equal(roundTrip.visuals.eras.length, 3);
  assert.equal(roundTrip.visuals.eras[0].image, "https://example.com/era-1.png");
  assert.equal(roundTrip.visuals.eras[1].body, "Current chapter.");
  assert.ok(isSiteContent(roundTrip));
});
test("unsafe image URLs are dropped instead of published", () => {
  const document = withContentDefaults({
    ...legacyDocument,
    visuals: {
      tequilaHeroShot: "javascript:alert(1)",
      artHeroShot: "http://example.com/art.png",
      agaveBackground: 42,
      tequilaGallery: [
        { url: "javascript:alert(1)" },
        { url: "http://example.com/plain.png" },
        "data:text/html,<script>",
        { url: "https://example.com/ok.png", alt: "  Bottle  " },
      ],
      artist: {
        portrait: "/local.png",
        behindScenes: [{ url: "javascript:void(0)" }],
      },
      eras: [{ image: "javascript:alert(1)" }, { image: "https://ok/x.png" }],
    },
  });
  assert.equal(document.visuals.tequilaHeroShot, undefined);
  assert.equal(document.visuals.artHeroShot, undefined);
  assert.equal(document.visuals.agaveBackground, undefined);
  // Una ruta interna tampoco vale como imagen: el hueco no se pinta.
  assert.equal(document.visuals.artist.portrait, undefined);
  // `https://` no se reescribe (el alt se conserva tal cual, como en las
  // entradas de Updates).
  assert.deepEqual(document.visuals.tequilaGallery, [
    { url: "https://example.com/ok.png", alt: "  Bottle  ", caption: undefined },
  ]);
  assert.deepEqual(document.visuals.artist.behindScenes, []);
  assert.equal(document.visuals.eras[0].image, undefined);
  assert.equal(document.visuals.eras[1].image, "https://ok/x.png");
});
test("CTA destinations accept internal routes and https only", () => {
  assert.equal(safeLinkHref("/updates"), "/updates");
  assert.equal(safeLinkHref("  /art#lineage  "), "/art#lineage");
  assert.equal(safeLinkHref("#building"), "#building");
  assert.equal(safeLinkHref(MIKE_LOMBARD_URL), "https://www.mike-lombard.com/");
  for (const value of [
    "javascript:alert(1)",
    "data:text/html,<script>",
    "mailto:hi@example.com",
    "http://example.com/insecure",
    "//example.com",
    "/\\example.com",
    "",
    "   ",
  ])
    assert.equal(safeLinkHref(value, "/updates"), "/updates");
  assert.equal(safeLinkHref("javascript:alert(1)"), "");
});
test("the local seed writes the current Tequila and Art copy", () => {
  // El documento local (sin CMS) no inventa imágenes, pero sí trae los textos
  // que el sitio enseña hoy para que el admin los vea escritos.
  assert.ok(!initialContent.visuals.tequilaHeroShot);
  assert.match(initialContent.copy["tequila.detail.cta.href"], /^\//);
  assert.match(initialContent.copy["art.intro.cta.href"], /^https:\/\//);
  assert.equal(
    initialContent.copy["art.intro.cta.href"],
    MIKE_LOMBARD_URL,
  );
  for (const key of [
    "tequila.proof.card.1.title",
    "tequila.proof.card.2.title",
    "tequila.proof.card.3.title",
    "tequila.proof.card.1.tagline",
    "tequila.proof.card.2.tagline",
    "tequila.proof.card.3.tagline",
    "tequila.detail.1.title",
    "tequila.detail.2.title",
    "tequila.detail.3.title",
    "tequila.detail.1.body",
    "tequila.detail.2.body",
    "tequila.detail.3.body",
    "tequila.end.eyebrow",
    "art.lineage.title",
    "art.artist.bts.body",
  ])
    assert.ok(initialContent.copy[key], `falta el copy por defecto ${key}`);
});

