"use client";

import { useCallback, useState } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount, useSignMessage } from "wagmi";
import { getSupabase } from "@/lib/supabase";
import { signInWithX } from "@/lib/mudwater/auth";

/**
 * The three things a player has to do once. Shown above the stadium until they
 * are done, then it disappears for the rest of the game: from that point the
 * barrels are the interface, not a form.
 */

const CARDS = [
  { key: "a", letter: "A", text: "Barrel A is the only safe spot. Follow me if you dare." },
  { key: "b", letter: "B", text: "I moved to B. The other barrels are traps." },
  { key: "c", letter: "C", text: "Nobody should enter C. Seriously. Stay away." },
] as const;

type CardKey = (typeof CARDS)[number]["key"];

const SHARE_URL = "https://www.mingles.wtf/mudwater";

export interface SetupPlayer {
  handle: string;
  wallet: string | null;
  verified: boolean;
}

const name = (handle: string) => (/^x[0-9a-f]{6}$/i.test(handle) ? "your account" : `@${handle}`);

export function PlaySetup({
  player,
  refresh,
}: {
  player: SetupPlayer | null;
  refresh: () => void;
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

  /** viem surfaces provider errors raw; a 4100 is always the same thing. */
  function walletMessage(e: unknown) {
    const text = e instanceof Error ? e.message : "";
    if (/not been authorized|4100|User rejected|denied/i.test(text)) {
      return "Your wallet didn't approve the signature. Unlock it, make sure the right account is selected, and try again.";
    }
    return text.split("\n")[0].slice(0, 180) || "Could not link the wallet.";
  }

  async function signOut() {
    await getSupabase()?.auth.signOut();
    window.location.reload();
  }

  async function link() {
    if (!address) return;
    setBusy("link");
    setError(null);
    try {
      // Ask the wallet to authorise the account before signing. Without this a
      // reloaded tab can hold a connection the wallet no longer trusts, and the
      // signature comes back as a bare 4100.
      await connector?.getAccounts?.().catch(() => undefined);

      const challenge = await call("/api/mudwater/wallet", { address });
      const signature = await signMessageAsync({ message: challenge.message });
      await call("/api/mudwater/wallet/verify", {
        id: challenge.id,
        address,
        signature,
      });
      refresh();
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
      refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save your post.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="mw-setup">
      {!player && (
        <div className="mw-setup-row">
          <p className="mw-setup-copy">
            <b>One step to play.</b> Sign in with your X account. One account,
            one wallet, two arenas.
          </p>
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
        </div>
      )}

      {player && !player.wallet && (
        <div className="mw-setup-row">
          <p className="mw-setup-copy">
            <b>Almost there, {name(player.handle)}.</b> Link the wallet that
            will play. It is a free signature, no gas.
          </p>
          <div className="mw-setup-actions">
            <ConnectButton
              chainStatus="icon"
              showBalance={false}
              accountStatus="address"
            />
            <button
              className="mw-button"
              type="button"
              disabled={!isConnected || busy !== null}
              onClick={link}
            >
              {busy === "link" ? "Signing…" : "Link wallet"}
            </button>
          </div>
        </div>
      )}

      {player && player.wallet && !player.verified && (
        <div className="mw-setup-post">
          <p className="mw-setup-copy">
            <b>Last step, {name(player.handle)}.</b> Pick what you want to say. X
            opens with the text ready. Post it and come back.
          </p>

          <div className="mw-cards">
            {CARDS.map((c) => (
              <button
                key={c.key}
                type="button"
                className={card === c.key ? "mw-card is-picked" : "mw-card"}
                disabled={busy !== null}
                onClick={() => share(c.key)}
              >
                <span className="mw-card-letter">{c.letter}</span>
                <span className="mw-card-text">{c.text}</span>
              </button>
            ))}
          </div>

          {opened && (
            <button
              className="mw-button mw-button-lg"
              type="button"
              disabled={busy !== null || card === null}
              onClick={confirm}
            >
              {busy === "share" ? "Saving…" : "I posted it, let me play"}
            </button>
          )}
        </div>
      )}

      {player && (
        <p className="mw-setup-switch">
          Not you?{" "}
          <button type="button" onClick={() => void signOut()}>
            Sign out and use another account
          </button>
        </p>
      )}

      {error && (
        <p className="mw-auth-error" role="status">
          {error}
        </p>
      )}
    </div>
  );
}
