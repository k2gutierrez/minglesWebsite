"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount, useSignMessage, useWriteContract } from "wagmi";
import { getSupabase } from "@/lib/supabase";
import { ARENA, gameAbi } from "@/lib/mudwater/abi";
import { signInWithX } from "@/lib/mudwater/auth";

/**
 * The player side of the stadium.
 *
 * Four steps, one at a time. The rule is that the page never shows two calls to
 * action, because the previous version did and nobody knew what to press next.
 */

export interface GameState {
  configured: boolean;
  chainId: number;
  contract: string;
  deadline: number;
  counts: { holders: number[]; open: number[] };
  player: null | {
    handle: string;
    avatar: string | null;
    wallet: string | null;
    verified: boolean;
    isHolder?: boolean | null;
    holders: { barrel: number; entered: boolean; lastAction: number } | null;
    open: { barrel: number; entered: boolean; lastAction: number } | null;
    passes?: Array<{
      activation: number;
      status: string;
      tx_hash: string | null;
      expiry: string;
    }>;
  };
}

const COOLDOWN = 300;
const SHARE_URL = "https://www.mingles.wtf/mudwater";

/** The three cards from the rules. The text is the bluff, the barrel is real. */
const CARDS = [
  {
    key: "a",
    letter: "A",
    text: "Barrel A is the only safe spot. Follow me if you dare.",
  },
  {
    key: "b",
    letter: "B",
    text: "I moved to B. The other barrels are traps.",
  },
  {
    key: "c",
    letter: "C",
    text: "Nobody should enter C. Seriously. Stay away.",
  },
] as const;

type CardKey = (typeof CARDS)[number]["key"];

function Step({
  number,
  title,
  hint,
  state,
  children,
}: {
  number: number;
  title: string;
  hint?: string;
  state: "done" | "now" | "next";
  children?: React.ReactNode;
}) {
  return (
    <li className={`mw-step is-${state}`}>
      <span className="mw-step-n">{state === "done" ? "✓" : number}</span>
      <div className="mw-step-body">
        <p className="mw-step-title">{title}</p>
        {hint && state === "now" && <p className="mw-step-hint">{hint}</p>}
        {children && state === "now" && (
          <div className="mw-step-action">{children}</div>
        )}
      </div>
    </li>
  );
}

export function GameActions({
  state,
  refresh,
}: {
  state: GameState;
  refresh: () => void;
}) {
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [card, setCard] = useState<CardKey | null>(null);
  const [openedX, setOpenedX] = useState(false);
  const [now, setNow] = useState(() => Math.floor(Date.now() / 1000));

  const { address, isConnected } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const { writeContractAsync } = useWriteContract();

  useEffect(() => {
    const id = setInterval(() => setNow(Math.floor(Date.now() / 1000)), 1000);
    return () => clearInterval(id);
  }, []);

  const call = useCallback(async (path: string, payload: unknown) => {
    const { data } = (await getSupabase()?.auth.getSession()) ?? { data: null };
    const access = data?.session?.access_token;
    if (!access) throw new Error("Your session expired. Sign in again.");

    const response = await fetch(path, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${access}`,
      },
      body: JSON.stringify(payload),
    });

    const parsed = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(parsed?.error ?? "The request failed.");
    return parsed;
  }, []);

  async function linkWallet() {
    if (!address) return;
    setBusy("link");
    setError(null);
    try {
      const challenge = await call("/api/mudwater/wallet", { address });
      const signature = await signMessageAsync({ message: challenge.message });
      await call("/api/mudwater/wallet/verify", {
        id: challenge.id,
        address,
        signature,
      });
      refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not link the wallet.");
    } finally {
      setBusy(null);
    }
  }

  function openX(key: CardKey) {
    const chosen = CARDS.find((c) => c.key === key);
    if (!chosen) return;

    const intent = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
      chosen.text,
    )}&url=${encodeURIComponent(SHARE_URL)}`;

    window.open(intent, "_blank", "noopener,noreferrer");
    setCard(key);
    setOpenedX(true);
    setError(null);
  }

  async function confirmPost() {
    setBusy("pass");
    setError(null);
    try {
      await call("/api/mudwater/pass", { card });
      refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not activate the pass.");
    } finally {
      setBusy(null);
    }
  }

  async function move(arena: keyof typeof ARENA, barrel: number) {
    setBusy(`${arena}-${barrel}`);
    setError(null);
    try {
      await writeContractAsync({
        address: state.contract as `0x${string}`,
        abi: gameAbi,
        functionName: "act",
        args: [ARENA[arena], barrel],
      });
      refresh();
    } catch (e) {
      const message = e instanceof Error ? e.message : "The move failed.";
      setError(message.split("\n")[0].slice(0, 160));
    } finally {
      setBusy(null);
    }
  }

  const player = state.player;
  const passActive = Boolean(player?.verified);

  const current = !player ? 1 : !player.wallet ? 2 : !passActive ? 3 : 4;
  const stepState = (n: number) => (n < current ? "done" : n === current ? "now" : "next");

  const arenas = useMemo(
    () => [
      { key: "holders" as const, title: "Mingles Arena", name: "Mingles Holders" },
      { key: "open" as const, title: "ApeChain Arena", name: "Open Swamp" },
    ],
    [],
  );

  return (
    <section className="mw-play" aria-label="Play">
      <div className="mw-play-head">
        <p className="mw-panel-title">How to play</p>
        {player && (
          <p className="mw-play-id">
            @{player.handle}
            {player.wallet
              ? ` · ${player.wallet.slice(0, 6)}…${player.wallet.slice(-4)}`
              : ""}
            {passActive ? " · verified" : ""}
          </p>
        )}
      </div>

      <ol className="mw-steps-live">
        <Step
          number={1}
          title="Sign in with X"
          hint="One X account per player. We keep the account id, not the handle."
          state={stepState(1)}
        >
          <button
            className="mw-button mw-button-lg"
            type="button"
            disabled={busy !== null}
            onClick={async () => {
              setError(null);
              const result = await signInWithX();
              if (!result.ok) {
                setError(
                  result.reason === "unconfigured"
                    ? "Sign-in is not connected on this build yet."
                    : (result.message ?? "Could not start the sign-in."),
                );
              }
            }}
          >
            Sign in with X
          </button>
        </Step>

        <Step
          number={2}
          title="Link your wallet"
          hint="Free signature, no gas, no transaction. This wallet will play for you."
          state={stepState(2)}
        >
          <div className="mw-step-row">
            <ConnectButton
              chainStatus="icon"
              showBalance={false}
              accountStatus="address"
            />
            <button
              className="mw-button"
              type="button"
              disabled={!isConnected || busy !== null}
              onClick={linkWallet}
            >
              {busy === "link" ? "Signing…" : "Sign to link"}
            </button>
          </div>
        </Step>

        <Step
          number={3}
          title="Share your post"
          hint="Pick what you want to say. X opens with the text ready. Post it, come back and confirm. One post is enough for the whole game."
          state={stepState(3)}
        >
          <div className="mw-cards">
            {CARDS.map((c) => (
              <button
                key={c.key}
                type="button"
                className={card === c.key ? "mw-card is-picked" : "mw-card"}
                disabled={busy !== null}
                onClick={() => openX(c.key)}
              >
                <span className="mw-card-letter">{c.letter}</span>
                <span className="mw-card-text">{c.text}</span>
              </button>
            ))}
          </div>

          {openedX && (
            <button
              className="mw-button mw-button-lg"
              type="button"
              disabled={busy !== null || card === null}
              onClick={confirmPost}
            >
              {busy === "pass" ? "Checking…" : "I posted it"}
            </button>
          )}
        </Step>

        <Step
          number={4}
          title="Pick your barrel"
          hint="Five minutes between moves in each arena. The emptiest barrel wins. Move as often as you like from here."
          state={stepState(4)}
        >
          <div className="mw-play-arenas">
            {arenas.map(({ key, title, name }) => {
              const own = player?.[key];
              const gated = key === "holders" && player?.isHolder === false;
              const cooldownLeft = own?.entered
                ? Math.max(0, own.lastAction + COOLDOWN - now)
                : 0;

              return (
                <div
                  key={key}
                  className={gated ? "mw-play-arena is-gated" : "mw-play-arena"}
                >
                  <div className="mw-play-arena-head">
                    <b>{title}</b>
                    <span>{name}</span>
                    {gated && <em>holders only</em>}
                  </div>
                  <div className="mw-play-buttons">
                    {[0, 1, 2].map((barrel) => {
                      const mine = own?.entered && own.barrel === barrel;
                      return (
                        <button
                          key={barrel}
                          className={mine ? "mw-mini is-mine" : "mw-mini"}
                          type="button"
                          disabled={
                            gated ||
                            !passActive ||
                            cooldownLeft > 0 ||
                            busy !== null
                          }
                          onClick={() => move(key, barrel)}
                        >
                          {busy === `${key}-${barrel}` ? "…" : `ABC`[barrel]}
                        </button>
                      );
                    })}
                    {cooldownLeft > 0 && (
                      <span className="mw-panel-note">{cooldownLeft}s</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </Step>
      </ol>

      <p className="mw-play-rule">
        One post is all we ask. If you win and it is no longer public at review,
        the prize goes to the next candidate.
      </p>

      {error && (
        <p className="mw-auth-error" role="status">
          {error}
        </p>
      )}
    </section>
  );
}
