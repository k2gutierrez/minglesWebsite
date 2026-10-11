import test from "node:test";
import assert from "node:assert/strict";
import {
  initialContent,
  isHttpsUrl,
  isSiteContent,
  normalizeSymbol,
  safeHref,
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
