"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getSupabase } from "@/lib/supabase";
import { GameActions, type GameState } from "./game-actions";
import {
  BARREL_LETTERS,
  DEMO_COUNTDOWN_SECONDS,
  applyCounts,
  countsOf,
  formatCountdown,
  formatShare,
  randomHandle,
  type ArenaId,
  type ArenaSnapshot,
  type FeedMovement,
  type StadiumSnapshot,
} from "@/lib/mudwater/stadium";

/* ------------------------------------------------------------------ *
 * The circular pixel barrel.
 *
 * One shared cell field, identical for every barrel, so two barrels with
 * the same population are pixel-identical at any total. Cells are display
 * units: they never map one-to-one to players.
 * ------------------------------------------------------------------ */

const SIZE = 240;
const GRID = 20;
const CELL = SIZE / GRID;
const RADIUS = SIZE / 2 - 6;

const CELL_FIELD: { x: number; y: number }[] = (() => {
  const cells: { x: number; y: number }[] = [];
  for (let row = 0; row <= GRID; row += 1) {
    const y = row * CELL + CELL / 2;
    for (let column = -1; column <= GRID; column += 1) {
      const x = column * CELL + CELL / 2 + (row % 2 ? CELL * 0.5 : 0);
      const distance = Math.hypot(x - SIZE / 2, y - SIZE / 2);
      if (distance <= RADIUS - CELL * 0.38) cells.push({ x, y });
    }
  }
  // Bottom-up, left-to-right: the liquid rises in staggered rows.
  cells.sort((a, b) => b.y - a.y || a.x - b.x);
  return cells;
})();

const SIDE = CELL * 0.88;

function Barrel({
  arenaName,
  letter,
  players,
  share,
  fill,
  smallest,
}: {
  arenaName: string;
  letter: string;
  players: number;
  share: number;
  fill: number;
  smallest: boolean;
}) {
  const filled = Math.min(
    CELL_FIELD.length,
    players > 0 ? Math.max(1, Math.round(fill * CELL_FIELD.length)) : 0,
  );

  return (
    <figure className="mw-barrel">
      <span className="mw-barrel-letter" aria-hidden="true">
        <i>Barrel</i>
        {letter}
      </span>
      <span className="mw-barrel-badge" aria-hidden={!smallest}>
        MIN
      </span>
      <span className="mw-barrel-lamp" aria-hidden="true" />
      <svg
        className="mw-barrel-svg"
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        role="img"
        aria-label={`${arenaName} barrel ${letter}: ${players} ${
          players === 1 ? "player" : "players"
        }`}
      >
        <circle
          className="mw-barrel-ring mw-barrel-ring-inner"
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS * 0.66}
        />
        {CELL_FIELD.map((cell, index) => (
          <rect
            key={index}
            className={index < filled ? "mw-cell is-on" : "mw-cell"}
            x={cell.x - SIDE / 2}
            y={cell.y - SIDE / 2}
            width={SIDE}
            height={SIDE}
            rx={0.7}
          />
        ))}
        <circle
          className="mw-barrel-ring"
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
        />
      </svg>
      <figcaption className="mw-barrel-figures">
        <b>{players}</b>
        <span>{formatShare(share)}</span>
      </figcaption>
    </figure>
  );
}

const ARENA_TITLE: Record<string, string> = {
  holders: "Mingles Arena",
  open: "ApeChain Arena",
};

function Arena({ arena }: { arena: ArenaSnapshot }) {
  const title = ARENA_TITLE[arena.id] ?? arena.name;

  return (
    <section className="mw-arena" aria-label={`${title}, ${arena.name}`}>
      <header className="mw-arena-head">
        <div className="mw-arena-heading">
          <h3 className="mw-arena-title">{title}</h3>
          <p className="mw-arena-name">{arena.name}</p>
        </div>
        <span className="mw-chip">{arena.pack}</span>
      </header>
      <p className="mw-arena-gate">{arena.gate}</p>
      <div className="mw-barrels">
        {arena.barrels.map((barrel) => (
          <Barrel
            key={barrel.letter}
            arenaName={arena.name}
            letter={barrel.letter}
            players={barrel.players}
            share={barrel.share}
            fill={barrel.fill}
            smallest={arena.smallest === barrel.letter}
          />
        ))}
      </div>
      <p className="mw-arena-foot">
        Least populated non-empty barrel wins.{" "}
        {arena.smallest
          ? `Barrel ${arena.smallest} qualifies right now.`
          : "No barrel qualifies while the arena is empty."}
      </p>
    </section>
  );
}

export function Stadium({
  snapshot,
  live = false,
}: {
  snapshot: StadiumSnapshot;
  live?: boolean;
}) {
  const [arenas, setArenas] = useState<ArenaSnapshot[]>(snapshot.arenas);
  const [movements, setMovements] = useState<FeedMovement[]>(snapshot.movements);
  const [transactions, setTransactions] = useState(snapshot.transactions);
  const [remaining, setRemaining] = useState<number | null>(null);
  const [activeArena, setActiveArena] = useState<ArenaId>("holders");
  const [remote, setRemote] = useState<GameState | null>(null);

  // Mirrors for the demo ticker so the interval never depends on stale state.
  const arenasRef = useRef(arenas);
  const sequence = useRef(0);

  useEffect(() => {
    arenasRef.current = arenas;
  }, [arenas]);

  const loadRemote = useCallback(async () => {
    try {
      const { data } = (await getSupabase()?.auth.getSession()) ?? { data: null };
      const access = data?.session?.access_token;
      const response = await fetch("/api/mudwater/state", {
        headers: access ? { authorization: `Bearer ${access}` } : undefined,
        cache: "no-store",
      });
      if (!response.ok) return;
      setRemote((await response.json()) as GameState);
    } catch {
      // Keep the last good reading. A failed poll must never blank the stadium.
    }
  }, []);

  useEffect(() => {
    if (!live) return;
    void loadRemote();
    const id = window.setInterval(() => void loadRemote(), 6_000);
    return () => window.clearInterval(id);
  }, [live, loadRemote]);

  // Countdown. Rendered as a placeholder on the server, so hydration is safe.
  useEffect(() => {
    const target = remote?.configured
      ? remote.deadline * 1000
      : snapshot.closesAt
        ? Date.parse(snapshot.closesAt)
        : Date.now() + DEMO_COUNTDOWN_SECONDS * 1000;
    const tick = () => setRemaining(Math.max(0, target - Date.now()));
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [snapshot.closesAt, remote?.deadline, remote?.configured]);

  // Preview only: a decorative ticker. Real builds replace this with chain
  // events pushed through the data layer — never with client-side invention.
  useEffect(() => {
    if (live || snapshot.phase !== "preview") return;

    const id = window.setInterval(() => {
      const current = arenasRef.current;
      const arenaIndex = Math.random() < 0.55 ? 1 : 0;
      const arena = current[arenaIndex];
      if (!arena) return;

      const counts = countsOf(arena);
      const from = Math.floor(Math.random() * counts.length);
      const to = (from + 1 + Math.floor(Math.random() * 2)) % counts.length;
      const joined = Math.random() < 0.18 || (counts[from] ?? 0) === 0;

      const nextCounts = [...counts];
      if (!joined) {
        nextCounts[from] = (nextCounts[from] ?? 0) - 1;
      }
      nextCounts[to] = (nextCounts[to] ?? 0) + 1;

      const next = [...current];
      next[arenaIndex] = applyCounts(arena, nextCounts);
      setArenas(next);

      sequence.current += 1;
      const entry: FeedMovement = {
        id: `tick-${sequence.current}`,
        handle: randomHandle(Math.random),
        arena: arena.id,
        label: joined
          ? `JOINED ${BARREL_LETTERS[to]}`
          : `${BARREL_LETTERS[from]} → ${BARREL_LETTERS[to]}`,
        joined,
      };
      setMovements((previous) => [entry, ...previous].slice(0, 9));
      setTransactions((value) => value + 1);
    }, 2400);

    return () => window.clearInterval(id);
  }, [snapshot.phase]);

  const liveArenas = useMemo(() => {
    if (!remote?.configured) return null;
    return snapshot.arenas.map((arena, index) =>
      applyCounts(arena, index === 0 ? remote.counts.holders : remote.counts.open),
    );
  }, [remote, snapshot.arenas]);

  // Never paint the demo numbers on a live page, not even for one frame.
  const shown =
    liveArenas ??
    (live
      ? snapshot.arenas.map((arena) => applyCounts(arena, [0, 0, 0]))
      : arenas);

  const total = useMemo(
    () => shown.reduce((sum, arena) => sum + arena.total, 0),
    [shown],
  );

  const countdown =
    remaining === null ? "--:--:--" : formatCountdown(remaining);

  return (
    <section className="mw-stadium" aria-label="Live stadium">
      <svg className="mw-defs" width="0" height="0" aria-hidden="true" focusable="false">
        <defs>
          <linearGradient id="mw-liquid" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#F2EDD0" />
            <stop offset="0.42" stopColor="#D6C97F" />
            <stop offset="1" stopColor="#8A8045" />
          </linearGradient>
        </defs>
      </svg>
      <div className="mw-stadium-grid">
        <aside className="mw-rail" aria-label="Game state">
          <div className="mw-stat">
            <span>Players</span>
            <b>{total.toLocaleString("en-US")}</b>
          </div>
          {!live && (
            <div className="mw-stat">
              <span>Onchain txs</span>
              <b>{transactions.toLocaleString("en-US")}</b>
            </div>
          )}
          <div className="mw-stat">
            <span>Closes in</span>
            <b className="mw-stat-clock">{countdown}</b>
          </div>
          <div className="mw-stat">
            <span>Prize</span>
            <b>2 packs</b>
          </div>
        </aside>

        <div className="mw-arenas">
          <div className="mw-switch" role="group" aria-label="Choose arena">
            {shown.map((arena) => (
              <button
                key={arena.id}
                type="button"
                aria-pressed={activeArena === arena.id}
                onClick={() => setActiveArena(arena.id)}
              >
                {arena.name}
              </button>
            ))}
          </div>

          {shown.map((arena) => (
            <div
              key={arena.id}
              className={
                arena.id === activeArena ? "mw-arena-wrap is-active" : "mw-arena-wrap"
              }
            >
              <Arena arena={arena} />
            </div>
          ))}
        </div>

        <aside className="mw-feed" aria-label="Live movements">
          <h3>Live movements</h3>
          {live ? (
            <p className="mw-feed-empty">
              Counts come straight from the contract. Confirmed movements show up
              here as they happen.
            </p>
          ) : (
          <ol>
            {movements.map((movement) => (
              <li key={movement.id}>
                <span
                  className={
                    movement.arena === "holders" ? "mw-avatar is-holder" : "mw-avatar"
                  }
                  aria-hidden="true"
                >
                  {movement.arena === "holders" ? "M" : "X"}
                </span>
                <span className="mw-handle">{movement.handle}</span>
                <span
                  className={movement.joined ? "mw-move is-join" : "mw-move"}
                >
                  {movement.label}
                </span>
              </li>
            ))}
          </ol>
          )}
          <p className="mw-feed-note">
            {snapshot.phase === "preview"
              ? "Preview build · simulated movements"
              : "Confirmed onchain activity only"}
          </p>
        </aside>
      </div>
      {live && remote?.configured && (
        <GameActions state={remote} refresh={() => void loadRemote()} />
      )}
    </section>
  );
}
