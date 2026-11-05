"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount, useSignMessage, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { getSupabase } from "@/lib/supabase";
import { ARENA, gameAbi } from "@/lib/mudwater/abi";
import { signInWithX } from "@/lib/mudwater/auth";

/**
 * The player half of the stadium: sign in, link a wallet, declare a post, move.
 *
 * It does not poll. The parent gives it the state it already fetched and a
 * `refresh` callback, so there is one poller in the page, not two.
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
    passExpiry: number;
    isHolder?: boolean | null;
    holders: { barrel: number; entered: boolean; lastAction: number } | null;
    open: { barrel: number; entered: boolean; lastAction: number } | null;
    passes?: Array<{ activation: number; status: string; tx_hash: string | null; expiry: string }>;
  };
}

const COOLDOWN = 300;

function hoursLeft(iso: number) {
  const diff = iso * 1000 - Date.now();
  if (diff <= 0) return "expired";
  const h = Math.floor(diff / 3_600_000);
  const m = Math.floor((diff % 3_600_000) / 60_000);
  return `${h}h ${String(m).padStart(2, "0")}m`;
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
  const [postUrl, setPostUrl] = useState("");
  const [now, setNow] = useState(() => Math.floor(Date.now() / 1000));

  const { address, isConnected } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const { writeContractAsync } = useWriteContract();

  useEffect(() => {
    const id = setInterval(() => setNow(Math.floor(Date.now() / 1000)), 1000);
    return () => clearInterval(id);
  }, []);

  const token = useCallback(async () => {
    const { data } = (await getSupabase()?.auth.getSession()) ?? { data: null };
    return data?.session?.access_token ?? null;
  }, []);

  async function call(path: string, payload: unknown) {
    const access = await token();
    if (!access) throw new Error("Your session expired. Sign in again.");

    const response = await fetch(path, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${access}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data?.error ?? "The request failed.");
    return data;
  }

  async function linkWallet() {
    if (!address) return;
    setBusy("link");
    setError(null);
    try {
      const challenge = await call("/api/mudwater/wallet", { address });
      const signature = await signMessageAsync({
        message: challenge.message,
      });
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

  async function declarePass() {
    setBusy("pass");
    setError(null);
    try {
      await call("/api/mudwater/pass", { postUrl });
      setPostUrl("");
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
      const hash = await writeContractAsync({
        address: state.contract as `0x${string}`,
        abi: gameAbi,
        functionName: "act",
        args: [ARENA[arena], barrel],
      });
      void hash;
      refresh();
    } catch (e) {
      const message = e instanceof Error ? e.message : "The move failed.";
      setError(message.split("\n")[0].slice(0, 160));
    } finally {
      setBusy(null);
    }
  }

  const player = state.player;
  const passActive = Boolean(player && player.passExpiry > now);

  const arenas = useMemo(
    () =>
      [
        { key: "holders" as const, label: "Mingles Holders" },
        { key: "open" as const, label: "Open Swamp" },
      ],
    [],
  );

  if (!player) {
    return (
      <div className="mw-actions-panel">
        <p className="mw-panel-title">Play</p>
        <p className="mw-panel-text">
          Sign in with X to play. One account, one wallet, two arenas.
        </p>
        <button
          className="mw-button"
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
        {error && <p className="mw-auth-error">{error}</p>}
      </div>
    );
  }

  return (
    <div className="mw-actions-panel">
      <div className="mw-panel-head">
        <div>
          <p className="mw-panel-title">@{player.handle}</p>
          <p className="mw-panel-text">
            {player.wallet
              ? `Wallet ${player.wallet.slice(0, 6)}…${player.wallet.slice(-4)}`
              : "No wallet linked yet"}
          </p>
        </div>
        <div className="mw-panel-status">
          <span className={passActive ? "mw-dot is-on" : "mw-dot"} />
          {passActive ? `Pass ${hoursLeft(player.passExpiry)}` : "No pass"}
        </div>
      </div>

      {!player.wallet && (
        <div className="mw-panel-row">
          <ConnectButton chainStatus="icon" showBalance={false} accountStatus="address" />
          <button
            className="mw-button"
            type="button"
            disabled={!isConnected || busy !== null}
            onClick={linkWallet}
          >
            {busy === "link" ? "Signing…" : "Link this wallet"}
          </button>
        </div>
      )}

      {player.wallet && !passActive && (
        <div className="mw-panel-row">
          <input
            className="mw-input"
            placeholder="https://x.com/you/status/..."
            value={postUrl}
            onChange={(event) => setPostUrl(event.target.value)}
          />
          <button
            className="mw-button"
            type="button"
            disabled={busy !== null || postUrl.length < 12}
            onClick={declarePass}
          >
            {busy === "pass" ? "Activating…" : "Declare post"}
          </button>
        </div>
      )}

      {arenas.map(({ key, label }) => {
        const own = player[key];
        const gated = key === "holders" && player.isHolder === false;
        const cooldownLeft = own?.entered
          ? Math.max(0, own.lastAction + COOLDOWN - now)
          : 0;

        return (
          <div className={gated ? "mw-panel-arena is-gated" : "mw-panel-arena"} key={key}>
            <span className="mw-panel-label">
              {label}
              {gated && <em className="mw-panel-tag">holders only</em>}
            </span>
            <div className="mw-panel-buttons">
              {[0, 1, 2].map((barrel) => {
                const mine = own?.entered && own.barrel === barrel;
                return (
                  <button
                    key={barrel}
                    className={mine ? "mw-mini is-mine" : "mw-mini"}
                    type="button"
                    disabled={gated || !passActive || cooldownLeft > 0 || busy !== null}
                    onClick={() => move(key, barrel)}
                  >
                    {busy === `${key}-${barrel}`
                      ? "…"
                      : `ABC`[barrel]}
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

      {error && <p className="mw-auth-error">{error}</p>}
    </div>
  );
}
