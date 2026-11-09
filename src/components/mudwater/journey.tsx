"use client";

import { useCallback, useState } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount, useSignMessage } from "wagmi";
import { getSupabase } from "@/lib/supabase";
import { signInWithX } from "@/lib/mudwater/auth";
import type { PlayerState } from "@/lib/mudwater/types";

/**
 * The four steps, as actions rather than instructions.
 *
 * Every card is the thing it describes: the first one starts the X flow, the
 * second one links the wallet, the third one opens the post, the fourth one
 * jumps to the board. A finished step says so and the next one opens.
 *
 * Memo's note: a guide that only explains is a wall of text. This one is the
 * flow.
 */

const CARDS = [
  { key: "a", letter: "A", text: "Barrel A is the only safe spot. Follow me if you dare." },
  { key: "b", letter: "B", text: "I moved to B. The other barrels are traps." },
  { key: "c", letter: "C", text: "Nobody should enter C. Seriously. Stay away." },
] as const;

type CardKey = (typeof CARDS)[number]["key"];

const SHARE_URL = "https://www.mingles.wtf/mudwater";

function short(address: string) {
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

export function Journey({
  player,
  live,
  onPlay,
}: {
  player: PlayerState | null;
  live: boolean;
  onPlay: () => void;
}) {
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [card, setCard] = useState<CardKey | null>(null);
  const [opened, setOpened] = useState(false);

  const { address, isConnected, connector } = useAccount();
  const { signMessageAsync } = useSignMessage();

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

  function walletMessage(e: unknown) {
    const text = e instanceof Error ? e.message : "";
    if (/not been authorized|4100|rejected|denied/i.test(text)) {
      return "Your wallet didn't approve the signature. Unlock it and try again.";
    }
    return text.split("\n")[0].slice(0, 160) || "Could not link the wallet.";
  }

  async function link() {
    if (!address) return;
    setBusy("link");
    setError(null);
    try {
      await connector?.getAccounts?.().catch(() => undefined);
      const challenge = await call("/api/mudwater/wallet", { address });
      const signature = await signMessageAsync({ message: challenge.message });
      await call("/api/mudwater/wallet/verify", {
        id: challenge.id,
        address,
        signature,
      });
      window.location.reload();
    } catch (e) {
      setError(walletMessage(e));
    } finally {
      setBusy(null);
    }
  }

  function share(key: CardKey) {
    const chosen = CARDS.find((c) => c.key === key);
    if (!chosen) return;

    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(
        chosen.text,
      )}&url=${encodeURIComponent(SHARE_URL)}`,
      "_blank",
      "noopener,noreferrer",
    );

    setCard(key);
    setOpened(true);
    setError(null);
  }

  async function confirm() {
    setBusy("share");
    setError(null);
    try {
      await call("/api/mudwater/pass", { card });
      window.location.reload();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save your post.");
    } finally {
      setBusy(null);
    }
  }

  const signedIn = Boolean(player);
  const bound = Boolean(player?.wallet);
  const shared = Boolean(player?.verified);

  const state = (done: boolean, previous: boolean, index: number) =>
    done ? "done" : previous ? "now" : index === 1 ? "now" : "next";

  return (
    <section className="mw-journey" id="play" aria-label="Steps to play">
      <div className="mw-journey-head">
        <h2>Four steps to the last move</h2>
        <p>One account, one wallet, no entry fee.</p>
      </div>

      <ol className="mw-steps-live">
        <li className={`mw-step is-${state(signedIn, true, 1)}`}>
          <span className="mw-step-n">{signedIn ? "✓" : "01"}</span>
          <div className="mw-step-body">
            <p className="mw-step-title">Sign in with X</p>
            {signedIn ? (
              <p className="mw-step-done">@{player?.handle}</p>
            ) : (
              <button
                className="mw-button"
                type="button"
                disabled={busy !== null || !live}
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
            )}
          </div>
        </li>

        <li className={`mw-step is-${state(bound, signedIn, 2)}`}>
          <span className="mw-step-n">{bound ? "✓" : "02"}</span>
          <div className="mw-step-body">
            <p className="mw-step-title">Bind a wallet</p>
            {bound ? (
              <p className="mw-step-done">{short(player?.wallet ?? "")}</p>
            ) : (
              <div className="mw-step-row">
                <ConnectButton
                  chainStatus="icon"
                  showBalance={false}
                  accountStatus="address"
                />
                <button
                  className="mw-button"
                  type="button"
                  disabled={!isConnected || busy !== null || !signedIn}
                  onClick={link}
                >
                  {busy === "link" ? "Signing…" : "Sign to link"}
                </button>
              </div>
            )}
          </div>
        </li>

        <li className={`mw-step is-${state(shared, bound, 3)}`}>
          <span className="mw-step-n">{shared ? "✓" : "03"}</span>
          <div className="mw-step-body">
            <p className="mw-step-title">Share a post</p>
            {shared ? (
              <p className="mw-step-done">Posted</p>
            ) : (
              <>
                <div className="mw-cards">
                  {CARDS.map((c) => (
                    <button
                      key={c.key}
                      type="button"
                      className={card === c.key ? "mw-card is-picked" : "mw-card"}
                      disabled={busy !== null || !bound}
                      onClick={() => share(c.key)}
                      aria-label={c.text}
                    >
                      <span className="mw-card-letter">{c.letter}</span>
                    </button>
                  ))}
                </div>
                {opened && (
                  <button
                    className="mw-button"
                    type="button"
                    disabled={busy !== null || card === null}
                    onClick={confirm}
                  >
                    {busy === "share" ? "Saving…" : "I posted it"}
                  </button>
                )}
              </>
            )}
          </div>
        </li>

        <li className={`mw-step is-${shared ? "now" : "next"}`}>
          <span className="mw-step-n">04</span>
          <div className="mw-step-body">
            <p className="mw-step-title">Play the game</p>
            <button
              className="mw-button mw-button-play"
              type="button"
              onClick={onPlay}
            >
              Play the game ↓
            </button>
          </div>
        </li>
      </ol>

      {error && (
        <p className="mw-auth-error" role="status">
          {error}
        </p>
      )}
    </section>
  );
}
