/**
 * THE LAST BARREL — stadium domain model.
 *
 * Pure functions only. Both the server page and the client stadium use this
 * module, so the numbers rendered in the hero and the numbers painted inside
 * the barrels can never disagree.
 *
 * Live data is not wired yet. `getStadiumSnapshot()` is the single seam:
 * when the ApeChain reader lands, it returns the same shape and nothing else
 * changes.
 */

export const BARREL_LETTERS = ["A", "B", "C"] as const;
export type BarrelLetter = (typeof BARREL_LETTERS)[number];

export type ArenaId = "holders" | "open";

export const PHASES = ["preview", "open", "closed"] as const;
export type Phase = (typeof PHASES)[number];

/** 48h window, per Ruleset V4.0. */
export const GAME_HOURS = 48;
/** Per-arena cooldown, in seconds. */
export const COOLDOWN_SECONDS = 300;

export interface FeedMovement {
  id: string;
  handle: string;
  arena: ArenaId;
  label: string;
  joined: boolean;
}

export interface BarrelSnapshot {
  letter: BarrelLetter;
  players: number;
  /** players / arena total, 0..1 */
  share: number;
  /** Visual liquid level, 0..1. Display only — never a source of truth. */
  fill: number;
}

export interface ArenaSnapshot {
  id: ArenaId;
  name: string;
  gate: string;
  pack: string;
  total: number;
  barrels: BarrelSnapshot[];
  /** Least populated non-empty barrel. Empty barrels never qualify. */
  smallest: BarrelLetter | null;
}

export interface StadiumSnapshot {
  phase: Phase;
  /** ISO timestamp, or null when no deadline is configured yet (preview). */
  closesAt: string | null;
  players: number;
  transactions: number;
  arenas: ArenaSnapshot[];
  movements: FeedMovement[];
}

/**
 * Non-linear fill so a 33% crowd share reads at roughly 49% of the circle and
 * 100 vs 1,000 participants stay visually comparable.
 * Counts and percentages are always exact; this is decoration.
 */
export function fillFor(players: number, total: number): number {
  if (players <= 0 || total <= 0) return 0;
  const share = Math.min(1, players / total);
  const fill = 0.06 + 0.74 * Math.sqrt(share);
  return Math.min(1, Math.max(0, fill));
}

/** Fewest players among barrels that actually have someone in them. */
export function smallestNonEmpty(
  counts: readonly number[],
): BarrelLetter | null {
  let index = -1;
  let min = Number.POSITIVE_INFINITY;
  for (let i = 0; i < counts.length && i < BARREL_LETTERS.length; i += 1) {
    const value = counts[i] ?? 0;
    if (value > 0 && value < min) {
      min = value;
      index = i;
    }
  }
  return index === -1 ? null : BARREL_LETTERS[index];
}

export function countsOf(arena: ArenaSnapshot): number[] {
  return arena.barrels.map((barrel) => barrel.players);
}

/** Recompute totals, shares, fills and the qualifying barrel from new counts. */
export function applyCounts(
  arena: ArenaSnapshot,
  counts: readonly number[],
): ArenaSnapshot {
  const players = counts.map((value) => Math.max(0, Math.trunc(value)));
  const total = players.reduce((sum, value) => sum + value, 0);
  return {
    ...arena,
    total,
    smallest: smallestNonEmpty(players),
    barrels: BARREL_LETTERS.map((letter, index) => {
      const value = players[index] ?? 0;
      return {
        letter,
        players: value,
        share: total > 0 ? value / total : 0,
        fill: fillFor(value, total),
      };
    }),
  };
}

interface ArenaSeed {
  id: ArenaId;
  name: string;
  gate: string;
  pack: string;
  counts: readonly number[];
}

function seedArena(seed: ArenaSeed): ArenaSnapshot {
  const base: ArenaSnapshot = {
    id: seed.id,
    name: seed.name,
    gate: seed.gate,
    pack: seed.pack,
    total: 0,
    barrels: [],
    smallest: null,
  };
  return applyCounts(base, seed.counts);
}

// Illustrative populations from the approved UI spec. Replaced by chain reads.
const DEMO_ARENAS: ArenaSeed[] = [
  {
    id: "holders",
    name: "Mingles Holders",
    gate: "Arena 01 · eligible Mingles NFT required",
    pack: "1 Mudwater pack",
    counts: [35, 26, 11],
  },
  {
    id: "open",
    name: "Open Swamp",
    gate: "Arena 02 · open to eligible X accounts",
    pack: "1 Mudwater pack",
    counts: [125, 87, 32],
  },
];

const DEMO_HANDLES = [
  "@minglefan",
  "@swampgoer",
  "@degenmike",
  "@chainlover",
  "@mudraider",
  "@bored_hunter",
  "@agaveworm",
  "@apevault",
  "@thelostape",
  "@wormcult",
] as const;

const DEMO_MOVEMENTS: FeedMovement[] = (
  [
    { handle: "@minglefan", arena: "holders", label: "B → C", joined: false },
    { handle: "@swampgoer", arena: "open", label: "JOINED A", joined: true },
    { handle: "@degenmike", arena: "holders", label: "C → B", joined: false },
    { handle: "@chainlover", arena: "open", label: "A → C", joined: false },
    { handle: "@agaveworm", arena: "holders", label: "A → B", joined: false },
  ] as Omit<FeedMovement, "id">[]
).map((row, index) => ({ ...row, id: `demo-${index}` }));

/** Decorative countdown used only while no real deadline is configured. */
export const DEMO_COUNTDOWN_SECONDS = 17 * 3600 + 48 * 60 + 22;

function readPhase(): Phase {
  const raw = process.env.NEXT_PUBLIC_MUDWATER_PHASE;
  return PHASES.includes(raw as Phase) ? (raw as Phase) : "preview";
}

function readClosesAt(): string | null {
  const raw = process.env.NEXT_PUBLIC_MUDWATER_CLOSES_AT;
  const parsed = raw ? Date.parse(raw) : Number.NaN;
  return Number.isFinite(parsed) ? new Date(parsed).toISOString() : null;
}

/**
 * Single data seam. No clock reads here on purpose: the snapshot must be
 * identical on the server and the client so the markup hydrates cleanly.
 * The countdown is computed in the browser from `closesAt`.
 */
export function getStadiumSnapshot(): StadiumSnapshot {
  const arenas = DEMO_ARENAS.map(seedArena);
  return {
    phase: readPhase(),
    closesAt: readClosesAt(),
    players: arenas.reduce((sum, arena) => sum + arena.total, 0),
    transactions: 1092,
    arenas,
    movements: DEMO_MOVEMENTS,
  };
}

export function randomHandle(random: () => number): string {
  const index = Math.floor(random() * DEMO_HANDLES.length);
  return DEMO_HANDLES[Math.min(index, DEMO_HANDLES.length - 1)] ?? "@anon";
}

export function formatShare(share: number): string {
  return `${(share * 100).toFixed(1)}%`;
}

/** hh:mm:ss until close; negative values clamp to zero. */
export function formatCountdown(msRemaining: number): string {
  const total = Math.max(0, Math.floor(msRemaining / 1000));
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const seconds = total % 60;
  return [hours, minutes, seconds]
    .map((value) => String(value).padStart(2, "0"))
    .join(":");
}

export function formatShortDuration(msRemaining: number): string {
  const total = Math.max(0, Math.floor(msRemaining / 1000));
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  return `${hours}h ${String(minutes).padStart(2, "0")}m`;
}
