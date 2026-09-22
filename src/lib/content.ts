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
};
export type Entry = {
  id: string;
  title: string;
  category: string;
  date: string;
  summary: string;
  proof: string;
  published: boolean;
};
export type Module = { id: string; label: string; enabled: boolean };
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
};
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
