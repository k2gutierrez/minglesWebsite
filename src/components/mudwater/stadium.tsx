"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useAccount, useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import { getSupabase } from "@/lib/supabase";
import { ARENA, gameAbi } from "@/lib/mudwater/abi";
import type { ArenaPlayerState, GameState } from "@/lib/mudwater/types";
import { PlaySetup } from "./play-setup";
import {
  applyCounts,
  countsOf,
  formatCountdown,
  formatShare,
  type ArenaSnapshot,
  type StadiumSnapshot,
} from "@/lib/mudwater/stadium";

/* ------------------------------------------------------------------ *
 * The barrel: a round end of a cask, packed with digital liquid.
 * One shared cell field, so two barrels with the same population are
 * pixel identical at any total. The fill is a share of the arena, not an
 * absolute count: that is what keeps 100 and 1,000 players readable.
 * ------------------------------------------------------------------ */

const SIZE = 240;
const GRID = 20;
const CELL = SIZE / GRID;
const RADIUS = SIZE / 2 - 6;
const COOLDOWN = 300;

const CELL_FIELD: { x: number; y: number }[] = (() => {
  const cells: { x: number; y: number }[] = [];
  for (let row = 0; row <= GRID; row += 1) {
    const y = row * CELL + CELL / 2;
    for (let column = -1; column <= GRID; column += 1) {
      const x = column * CELL + CELL / 2 + (row % 2 ? CELL * 0.5 : 0);
      if (Math.hypot(x - SIZE / 2, y - SIZE / 2) <= RADIUS - CELL * 0.38) {
        cells.push({ x, y });
      }
    }
  }
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
  mine,
  pending,
  blocked,
  cta,
  onClick,
}: {
  arenaName: string;
  letter: string;
  players: number;
  share: number;
  fill: number;
  smallest: boolean;
  mine: boolean;
  pending: boolean;
  blocked: boolean;
  cta: string | null;
  onClick: () => void;
}) {
  const filled = Math.min(
    CELL_FIELD.length,
    players > 0 ? Math.max(1, Math.round(fill * CELL_FIELD.length)) : 0,
  );

  const className = [
    "mw-barrel",
    mine ? "is-mine" : "",
    pending ? "is-pending" : "",
    blocked ? "is-blocked" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      type="button"
      className={className}
      disabled={blocked}
      onClick={onClick}
      aria-label={`${arenaName} barrel ${letter}: ${players} players${
        mine ? ", you are here" : ""
      }`}
    >
      <span className="mw-barrel-letter" aria-hidden="true">
        <i>Barrel</i>
        {letter}
      </span>
      <span className="mw-barrel-badge" aria-hidden={!smallest}>
        MIN
      </span>
      <span className="mw-barrel-lamp" aria-hidden="true" />
      <svg className="mw-barrel-svg" viewBox={`0 0 ${SIZE} ${SIZE}`} aria-hidden="true">
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
        <circle className="mw-barrel-ring" cx={SIZE / 2} cy={SIZE / 2} r={RADIUS} />
      </svg>
      <span className="mw-barrel-figures">
        <b>{players}</b>
        <span>{formatShare(share)}</span>
      </span>
      {mine ? (
        <span className="mw-barrel-you">you</span>
      ) : (
        cta && <span className="mw-barrel-cta">{cta}</span>
      )}
    </button>
  );
}

const ARENA_TITLE: Record<string, string> = {
  holders: "Mingles Arena",
  open: "ApeChain Arena",
};

function clock(seconds: number) {
  const m = Math.floor(Math.max(0, seconds) / 60);
  const s = Math.max(0, seconds) % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export function Stadium({
  snapshot,
  live = false,
}: {
  snapshot: StadiumSnapshot;
  live?: boolean;
}) {
  const [arenas, setArenas] = useState<ArenaSnapshot[]>(snapshot.arenas);
  const [remote, setRemote] = useState<GameState | null>(null);
  const [remaining, setRemaining] = useState<number | null>(null);
  const [activeArena, setActiveArena] = useState<"holders" | "open">("holders");
  const [now, setNow] = useState(() => Math.floor(Date.now() / 1000));
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [target, setTarget] = useState<{ arena: "holders" | "open"; barrel: number } | null>(
    null,
  );
  const [sealTarget, setSealTarget] = useState<"holders" | "open" | null>(null);
  const [draw, setDraw] = useState<{
    arenas: { name: string; counts: number[]; winning: string[]; candidates: { wallet: string; barrel: string }[] }[];
  } | null>(null);
  const [revealing, setRevealing] = useState(false);

  const { address } = useAccount();
  const { writeContractAsync, data: hash } = useWriteContract();
  const { isSuccess, isLoading: confirming } = useWaitForTransactionReceipt({ hash });

  const arenasRef = useRef(arenas);

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
    const id = window.setInterval(() => void loadRemote(), 3_000);
    return () => window.clearInterval(id);
  }, [live, loadRemote]);

  useEffect(() => {
    const id = window.setInterval(() => setNow(Math.floor(Date.now() / 1000)), 1000);
    return () => window.clearInterval(id);
  }, []);

  // The close comes from the chain, never from a local guess.
  useEffect(() => {
    const targetMs = remote?.configured
      ? remote.deadline * 1000
      : snapshot.closesAt
        ? Date.parse(snapshot.closesAt)
        : Date.now() + 17 * 3600 * 1000;

    const tick = () => setRemaining(Math.max(0, targetMs - Date.now()));
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [snapshot.closesAt, remote?.deadline, remote?.configured]);

  // Confirmation is the game beat: say it, then refresh the board a couple of
  // times while the node catches up.
  useEffect(() => {
    if (!isSuccess || !target) return;

    setToast(`You're in Barrel ${"ABC"[target.barrel]} · ${ARENA_TITLE[target.arena]}`);
    void loadRemote();
    const a = window.setTimeout(() => void loadRemote(), 900);
    const b = window.setTimeout(() => void loadRemote(), 2400);
    const c = window.setTimeout(() => setToast(null), 3200);
    setTarget(null);

    return () => {
      window.clearTimeout(a);
      window.clearTimeout(b);
      window.clearTimeout(c);
    };
  }, [isSuccess, target, loadRemote]);

  useEffect(() => {
    if (!isSuccess || !sealTarget) return;

    setToast(`${ARENA_TITLE[sealTarget]} sealed`);
    setSealTarget(null);
    void loadRemote();
    const a = window.setTimeout(() => void loadRemote(), 1200);
    const b = window.setTimeout(() => setToast(null), 3200);

    return () => {
      window.clearTimeout(a);
      window.clearTimeout(b);
    };
  }, [isSuccess, sealTarget, loadRemote]);

  const seal = useCallback(
    async (arena: "holders" | "open") => {
      if (!remote?.configured) return;
      setError(null);
      setSealTarget(arena);

      try {
        await writeContractAsync({
          address: remote.contract as `0x${string}`,
          abi: gameAbi,
          functionName: "seal",
          args: [ARENA[arena]],
        });
      } catch (e) {
        const message = e instanceof Error ? e.message : "The seal failed.";
        setError(message.split("\n")[0].slice(0, 160));
        setSealTarget(null);
      }
    },
    [remote, writeContractAsync],
  );

  async function reveal() {
    setRevealing(true);
    setError(null);
    try {
      const response = await fetch("/api/mudwater/draw", { cache: "no-store" });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error ?? "Could not read the log.");
      setDraw(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not read the log.");
    } finally {
      setRevealing(false);
    }
  }

  const move = useCallback(
    async (arena: "holders" | "open", barrel: number) => {
      const p = remote?.player;
      if (!remote?.configured || !p?.verified) return;

      const own = p[arena];
      if (own?.entered && own.barrel === barrel) return;
      if (own?.entered && now < own.lastAction + COOLDOWN) return;

      setError(null);
      setTarget({ arena, barrel });

      try {
        await writeContractAsync({
          address: remote.contract as `0x${string}`,
          abi: gameAbi,
          functionName: "act",
          args: [ARENA[arena], barrel],
        });
      } catch (e) {
        const message = e instanceof Error ? e.message : "The move failed.";
        setError(message.split("\n")[0].slice(0, 160));
        setTarget(null);
      }
    },
    [remote, now, writeContractAsync],
  );

  const liveArenas = useMemo(() => {
    if (!remote?.configured) return null;
    return snapshot.arenas.map((arena, index) =>
      applyCounts(arena, index === 0 ? remote.counts.holders : remote.counts.open),
    );
  }, [remote, snapshot.arenas]);

  // Never paint the demo numbers on a live page, not even for one frame.
  const shown =
    liveArenas ??
    (live ? snapshot.arenas.map((a) => applyCounts(a, [0, 0, 0])) : arenas);

  // The fake ticker only runs when there is no chain behind the page.
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

      const next = [...counts];
      next[from] = Math.max(0, (next[from] ?? 0) - 1);
      next[to] = (next[to] ?? 0) + 1;

      const updated = [...current];
      updated[arenaIndex] = applyCounts(arena, next);
      setArenas(updated);
    }, 2400);

    return () => window.clearInterval(id);
  }, [live, snapshot.phase]);

  const total = useMemo(() => shown.reduce((s, a) => s + a.total, 0), [shown]);
  const closed = remaining !== null && remaining <= 0;
  const isOwner = Boolean(
    address && remote?.owner && address.toLowerCase() === remote.owner.toLowerCase(),
  );
  const bothSealed = Boolean(remote?.sealed?.holders && remote?.sealed?.open);
  const countdown = remaining === null ? "--:--:--" : formatCountdown(remaining);
  const player = remote?.player ?? null;
  const verified = Boolean(player?.verified);

  return (
    <>
      {live && remote?.configured && (
        <PlaySetup player={player} refresh={() => void loadRemote()} />
      )}

      <section
        className={`mw-stadium${verified ? " is-playing" : ""}`}
        aria-label="Live stadium"
      >
        <svg className="mw-defs" width="0" height="0" aria-hidden="true" focusable="false">
          <defs>
            <linearGradient id="mw-liquid" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#F2EDD0" />
              <stop offset="0.42" stopColor="#C9BC74" />
              <stop offset="1" stopColor="#8A8045" />
            </linearGradient>
          </defs>
        </svg>

        <div className="mw-hud">
          <div className="mw-hud-item">
            <span>Players</span>
            <b>{total}</b>
          </div>
          <div className="mw-hud-item">
            <span>Closes in</span>
            <b className="mw-hud-clock">{countdown}</b>
          </div>
          <div className="mw-hud-item">
            <span>Prize</span>
            <b>2 packs</b>
          </div>
          {player && (
            <div className="mw-hud-item mw-hud-you">
              <span>You</span>
              <b>
                @{player.handle}
                {verified ? "" : " · not playing yet"}
              </b>
            </div>
          )}
        </div>

        {isOwner && (
          <section className="mw-operator" aria-label="Operator">
            <div className="mw-operator-head">
              <p className="mw-eyebrow">Operator</p>
              <b>@{player?.handle ?? "owner"} · this wallet owns the contract</b>
            </div>
            <p className="mw-operator-note">
              Ownership gives no powers here: the counts are the counts and the
              draw reads the log. Sealing is open to anyone, so this panel is
              only a shortcut.
            </p>
            <div className="mw-operator-actions">
              {(["holders", "open"] as const).map((key) => (
                <button
                  key={key}
                  className="mw-button"
                  type="button"
                  disabled={!closed || Boolean(remote?.sealed?.[key]) || sealTarget !== null}
                  onClick={() => void seal(key)}
                >
                  {remote?.sealed?.[key]
                    ? `${ARENA_TITLE[key]} sealed`
                    : closed
                      ? `Seal ${ARENA_TITLE[key]}`
                      : `Seals at the close`}
                </button>
              ))}
              <button
                className="mw-button"
                type="button"
                disabled={revealing}
                onClick={() => void reveal()}
              >
                {revealing ? "Reading…" : "Read the log"}
              </button>
            </div>
            <p className="mw-operator-meta">
              {remote?.contract}
            </p>
          </section>
        )}

        <div className="mw-switch" role="group" aria-label="Choose arena">
          {shown.map((arena) => (
            <button
              key={arena.id}
              type="button"
              aria-pressed={activeArena === arena.id}
              onClick={() => setActiveArena(arena.id)}
            >
              {ARENA_TITLE[arena.id] ?? arena.name}
            </button>
          ))}
        </div>

        <div className="mw-arenas">
          {shown.map((arena) => {
            const own: ArenaPlayerState | null =
              arena.id === "holders" ? (player?.holders ?? null) : (player?.open ?? null);
            const gated = arena.id === "holders" && player?.isHolder === false;
            const canPlay = verified && !gated && Boolean(remote?.configured);
            const cooldownLeft = own?.entered
              ? Math.max(0, own.lastAction + COOLDOWN - now)
              : 0;

            return (
              <section
                key={arena.id}
                className={`mw-arena${activeArena === arena.id ? " is-active" : ""}`}
                aria-label={`${ARENA_TITLE[arena.id]}, ${arena.name}`}
              >
                <header className="mw-arena-head">
                  <div className="mw-arena-heading">
                    <h3 className="mw-arena-title">
                      {ARENA_TITLE[arena.id] ?? arena.name}
                    </h3>
                    <p className="mw-arena-name">{arena.name}</p>
                  </div>
                  <span className="mw-chip">{arena.pack}</span>
                </header>
                <p className="mw-arena-gate">{arena.gate}</p>

                <div className="mw-barrels">
                  {arena.barrels.map((barrel, index) => {
                    const mine = Boolean(own?.entered && own.barrel === index);
                    const pending =
                      target?.arena === arena.id &&
                      target?.barrel === index &&
                      confirming;
                    const blocked = !canPlay || (cooldownLeft > 0 && !mine);

                    return (
                      <Barrel
                        key={barrel.letter}
                        arenaName={ARENA_TITLE[arena.id] ?? arena.name}
                        letter={barrel.letter}
                        players={barrel.players}
                        share={barrel.share}
                        fill={barrel.fill}
                        smallest={arena.smallest === barrel.letter}
                        mine={mine}
                        pending={pending}
                        blocked={blocked}
                        cta={
                          blocked
                            ? null
                            : own?.entered
                              ? "Move here"
                              : "Enter"
                        }
                        onClick={() => void move(arena.id, index)}
                      />
                    );
                  })}
                </div>

                <footer className="mw-arena-foot">
                  {closed && !remote?.sealed?.[arena.id] ? (
                    <button
                      className="mw-button mw-seal"
                      type="button"
                      disabled={sealTarget !== null}
                      onClick={() => void seal(arena.id)}
                    >
                      {sealTarget === arena.id
                        ? "Sealing…"
                        : "Close the game and publish the final counts"}
                    </button>
                  ) : remote?.sealed?.[arena.id] ? (
                    <>Sealed. These counts are final and nobody can change them.</>
                  ) : gated ? (
                    <>This arena is for Mingles holders. Your wallet holds none.</>
                  ) : !verified ? (
                    <>Finish the steps above to start playing.</>
                  ) : cooldownLeft > 0 ? (
                    <>
                      Next move in <b>{clock(cooldownLeft)}</b>
                    </>
                  ) : own?.entered ? (
                    <>
                      You are in Barrel {"ABC"[own.barrel]}. Tap another barrel to
                      move.
                    </>
                  ) : (
                    <>Tap a barrel to enter.</>
                  )}
                </footer>
              </section>
            );
          })}
        </div>

        {closed && (
          <section className="mw-reveal" aria-label="Result">
            <div className="mw-reveal-head">
              <div>
                <p className="mw-eyebrow">After the close</p>
                <h3>The log is the record</h3>
                <p className="mw-reveal-copy">
                  Every entry and every move is an Action event. The draw reads
                  that log, finds the least populated barrel and orders its
                  players with the drand round announced before the close. The
                  script is public, so anyone can reproduce the same order.
                </p>
              </div>
              <button
                className="mw-button"
                type="button"
                disabled={revealing}
                onClick={() => void reveal()}
              >
                {revealing ? "Reading the log…" : "Read the log"}
              </button>
            </div>

            {draw && (
              <div className="mw-reveal-grid">
                {draw.arenas.map((a) => (
                  <div key={a.name} className="mw-reveal-card">
                    <b>{a.name}</b>
                    <p className="mw-reveal-counts">
                      A {a.counts[0]} · B {a.counts[1]} · C {a.counts[2]}
                    </p>
                    <p className="mw-reveal-winning">
                      {a.winning.length
                        ? `Barrel ${a.winning.join(" + ")} qualifies`
                        : "Nobody entered"}
                    </p>
                    <ul>
                      {a.candidates.map((c) => (
                        <li key={c.wallet}>
                          <code>{c.wallet}</code>
                          <span>{c.barrel}</span>
                        </li>
                      ))}
                    </ul>
                    {!bothSealed && (
                      <p className="mw-reveal-warn">
                        Seal both arenas before using this for the prize.
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        <aside className="mw-feed" aria-label="Live movements">
          <h3>Live movements</h3>
          <p className="mw-feed-empty">
            Counts come straight from the contract. Confirmed movements show up
            here as they happen.
          </p>
          <p className="mw-feed-note">Confirmed onchain activity only</p>
        </aside>
      </section>

      {toast && (
        <div className="mw-toast" role="status">
          {toast}
        </div>
      )}

      {error && (
        <p className="mw-auth-error" role="status">
          {error}
        </p>
      )}
    </>
  );
}
