"use client";
import { useEffect, useState, useCallback, useRef } from "react";
import {
  Wallet,
  RefreshCw,
  ShieldCheck,
  ExternalLink,
  Unlink,
} from "lucide-react";
import { getAddress } from "viem";
import { apeChain } from "viem/chains";
import { useAccount, useSignMessage, useSwitchChain } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import {
  COLLECTION,
  type HolderData,
  type Holdings,
} from "@/lib/web3/collection";
import { getSupabase } from "@/lib/supabase";
import { Status } from "./ui";
import { MingleDetail } from "./mingle-detail";
export async function api<T>(path: string, input?: unknown): Promise<T> {
  const db = getSupabase();
  const session = await db?.auth.getSession();
  const token = session?.data.session?.access_token;
  if (!token) throw Error("Sign in to your account first.");
  const response = await fetch(path, {
    method: input === undefined ? "GET" : "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      ...(input === undefined ? {} : { "Content-Type": "application/json" }),
    },
    body: input === undefined ? undefined : JSON.stringify(input),
    cache: "no-store",
  });
  const data = await response.json();
  if (!response.ok) throw Error(data.error || "Request failed.");
  return data;
}
export type Web3Configuration = {
  walletConfigured: boolean;
  authConfigured: boolean;
  chainId: number;
  address: string;
};
export function useHolder(user: string | null) {
  const [config, setConfig] = useState<Web3Configuration | null>(null);
  const [data, setData] = useState<HolderData>({ wallets: [], holdings: [] });
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [connected, setConnected] = useState<string | null>(null);
  const [pendingUnlink, setPendingUnlink] = useState<string | null>(null);
  const generation = useRef(0);
  // La conexión la maneja RainbowKit/wagmi. Aquí solo se lee la cuenta.
  const { address, chainId } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const { switchChainAsync } = useSwitchChain();
  useEffect(() => {
    let alive = true;
    fetch("/api/web3/config")
      .then((r) => r.json())
      .then((c) => {
        if (alive) setConfig(c);
      })
      .catch(() => {
        if (alive) setMessage("Wallet configuration could not be loaded.");
      });
    return () => {
      alive = false;
    };
  }, []);
  useEffect(() => {
    // Si la cuenta o la red cambian en la wallet, el vínculo verificado deja de
    // ser válido para esa cuenta: se pide firmar otra vez.
    setConnected(null);
    setMessage(
      "Wallet account or network changed. Link again to verify the selected account.",
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address, chainId]);
  const load = useCallback(async () => {
    if (!user || !config?.walletConfigured) return;
    const version = generation.current;
    try {
      const result = await api<HolderData>("/api/holder");
      if (version === generation.current) setData(result);
    } catch (e) {
      if (version === generation.current)
        setMessage(
          e instanceof Error ? e.message : "Could not load your account.",
        );
    }
  }, [user, config?.walletConfigured]);
  useEffect(() => {
    generation.current++;
    setData({ wallets: [], holdings: [] });
    setConnected(null);
    setMessage("");
    setPendingUnlink(null);
    void load();
  }, [load]);
  async function connect() {
    if (!user) {
      setMessage("Sign in with email, then link your wallet to that account.");
      return;
    }
    if (!config?.walletConfigured) {
      setMessage(
        "The administrator must configure Supabase and the wallet backend first.",
      );
      return;
    }
    if (!address) {
      setMessage("Choose a wallet with the Connect button first.");
      return;
    }
    const version = generation.current;
    setBusy(true);
    setMessage("Confirm the account and the network in your wallet.");
    try {
      if (chainId !== COLLECTION.chain.id) {
        setMessage("Switching the wallet to ApeChain…");
        await switchChainAsync({ chainId: COLLECTION.chain.id });
      }
      const owner = getAddress(address);
      const challenge = await api<{ id: string; message: string }>(
        "/api/wallet/challenge",
        { address: owner },
      );
      setMessage(
        "Review and sign the account-link message. No gas or token approval.",
      );
      // RainbowKit conecta; la firma sigue siendo nuestra y se verifica en el
      // servidor contra el mensaje exacto que emitió el challenge.
      const signature = await signMessageAsync({ message: challenge.message });
      if (version !== generation.current) return;
      await api("/api/wallet/verify", { id: challenge.id, signature });
      if (version !== generation.current) return;
      setConnected(owner);
      setMessage(
        "Wallet verified. Select Verify NFTs to read your collection.",
      );
      await load();
    } catch (e) {
      if (version === generation.current)
        setMessage(
          (e as { code?: number }).code === 4001
            ? "Request cancelled. Nothing was linked."
            : e instanceof Error
              ? e.message
              : "Wallet connection failed.",
        );
    } finally {
      setBusy(false);
    }
  }
  async function refresh(walletId: string) {
    const version = generation.current;
    setBusy(true);
    setMessage(
      "Reading the collection on ApeChain. This can take up to a minute; no transaction is sent.",
    );
    try {
      await api<{ snapshot: Holdings }>("/api/holder/refresh", { walletId });
      if (version === generation.current) {
        await load();
        setMessage("Ownership verified at the block shown below.");
      }
    } catch (e) {
      if (version === generation.current)
        setMessage(e instanceof Error ? e.message : "Verification failed.");
    } finally {
      setBusy(false);
    }
  }
  async function unlink(walletId: string) {
    const version = generation.current;
    setBusy(true);
    try {
      await api("/api/wallet/unlink", { walletId });
      if (version === generation.current) {
        setPendingUnlink(null);
        setConnected(null);
        await load();
        setMessage("Wallet unlinked from this account. No NFT was moved.");
      }
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Could not unlink.");
    } finally {
      setBusy(false);
    }
  }
  return {
    config,
    data,
    message,
    busy,
    connected,
    pendingUnlink,
    setPendingUnlink,
    connect,
    refresh,
    unlink,
  };
}
export type HolderController = ReturnType<typeof useHolder>;
export function WalletPanel({
  holder,
  user,
  showTokens = false,
}: {
  holder: HolderController;
  user: string | null;
  showTokens?: boolean;
}) {
  const { config, data, busy, message } = holder;
  return (
    <section className="wallet-panel">
      <div className="wallet-heading">
        <div>
          <span className="eyebrow">APECHAIN / VERIFIED OWNERSHIP</span>
          <h2>CONNECT YOUR MINGLES.</h2>
        </div>
        <ShieldCheck size={32} />
      </div>
      <p>Link your wallet with a signature. Your NFTs stay in your wallet.</p>
      <a
        className="contract-link"
        href={`${COLLECTION.chain.blockExplorers.default.url}/address/${COLLECTION.address}`}
        target="_blank"
        rel="noopener noreferrer"
      >
        {COLLECTION.address}
        <ExternalLink size={12} />
      </a>
      {!config?.walletConfigured && (
        <p className="wallet-notice">
          Backend setup pending. The collection is configured; the site
          administrator must connect Supabase before wallet verification is
          available.
        </p>
      )}
      <div className="wallet-actions">
        {/* RainbowKit: modal de conexión, con QR de WalletConnect para móvil. */}
        <ConnectButton
          showBalance={false}
          chainStatus="icon"
          accountStatus={{ smallScreen: "avatar", largeScreen: "full" }}
        />
        <button
          className="button button-coral"
          onClick={holder.connect}
          disabled={busy || !user || !config?.walletConfigured}
        >
          <ShieldCheck size={17} />
          {busy
            ? "Working…"
            : !user
              ? "Sign in before linking"
              : "Verify & link wallet"}
        </button>
      </div>
      <p className="muted">
        Connecting only opens the wallet. Linking requires a free signature: no
        gas, no token approval, and your NFTs never move.
      </p>
      <p className="wallet-message" role="status" aria-live="polite">
        {message}
      </p>
      {data.wallets.map((wallet) => {
        const snapshot = data.holdings.find((h) => h.walletId === wallet.id);
        return (
          <div className="linked-wallet" key={wallet.id}>
            <div className="wallet-row">
              <div>
                <span className="eyebrow">LINKED WALLET</span>
                <code>
                  {wallet.address.slice(0, 8)}…{wallet.address.slice(-6)}
                </code>
              </div>
              <Status>Signature verified</Status>
              <button
                className="button"
                onClick={() => holder.refresh(wallet.id)}
                disabled={busy}
              >
                <RefreshCw size={14} />
                {snapshot ? "Refresh NFTs" : "Verify NFTs"}
              </button>
              <button
                className="icon-button"
                aria-label={`Unlink wallet ${wallet.address}`}
                onClick={() => holder.setPendingUnlink(wallet.id)}
                disabled={busy}
              >
                <Unlink size={16} />
              </button>
            </div>
            {holder.pendingUnlink === wallet.id && (
              <div className="wallet-confirm">
                <p>
                  Remove this wallet from your Mingles account? Your NFTs remain
                  in the wallet.
                </p>
                <button
                  className="button"
                  onClick={() => holder.unlink(wallet.id)}
                  disabled={busy}
                >
                  Unlink account
                </button>
                <button
                  className="button"
                  onClick={() => holder.setPendingUnlink(null)}
                >
                  Cancel
                </button>
              </div>
            )}
            {snapshot ? (
              <div className="snapshot-summary">
                <strong>{snapshot.balance} Mingles</strong>
                <span>
                  Snapshot: {new Date(snapshot.checkedAt).toLocaleString()} ·
                  block {snapshot.blockNumber}
                </span>
                <small>
                  Historical ownership check. Refresh after a transfer; no
                  activation or entitlement is implied.
                </small>
              </div>
            ) : (
              <p className="muted">Ownership has not been checked yet.</p>
            )}
            {showTokens && snapshot && (
              <TokenGrid tokenIds={snapshot.tokenIds} user={user} />
            )}
          </div>
        );
      })}
    </section>
  );
}
function TokenGrid({
  tokenIds,
  user,
}: {
  tokenIds: string[];
  user: string | null;
}) {
  const [page, setPage] = useState(0);
  const [open, setOpen] = useState<{
    tokenId: string;
    name: string;
    image: string | null;
  } | null>(null);
  useEffect(() => setPage(0), [tokenIds]);
  return (
    <>
      <div className="nft-grid">
        {tokenIds.slice(page * 12, page * 12 + 12).map((id) => (
          <TokenCard
            key={`${user}-${id}`}
            tokenId={id}
            onOpen={(data) => setOpen({ tokenId: id, ...data })}
          />
        ))}
      </div>
      {open && (
        <MingleDetail
          tokenId={open.tokenId}
          name={open.name}
          officialImage={open.image}
          onClose={() => setOpen(null)}
        />
      )}
      {tokenIds.length > 12 && (
        <div className="wallet-actions">
          <button
            className="button"
            disabled={page === 0}
            onClick={() => setPage((p) => p - 1)}
          >
            Previous
          </button>
          <span>
            Page {page + 1} / {Math.ceil(tokenIds.length / 12)}
          </span>
          <button
            className="button"
            disabled={(page + 1) * 12 >= tokenIds.length}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </button>
        </div>
      )}
    </>
  );
}
function TokenCard({
  tokenId,
  onOpen,
}: {
  tokenId: string;
  onOpen: (data: { name: string; image: string | null }) => void;
}) {
  const [token, setToken] = useState<{
    name: string;
    image: string | null;
  } | null>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    api<{ name: string; image: string | null }>(`/api/holder/token/${tokenId}`)
      .then((t) => {
        if (active) setToken(t);
      })
      .catch((e) => {
        if (active) setError(e.message);
      });
    return () => {
      active = false;
    };
  }, [tokenId]);
  return (
    <article className="nft-card">
      <button
        type="button"
        className="nft-open"
        onClick={() =>
          onOpen({ name: token?.name || `Mingle #${tokenId}`, image: token?.image ?? null })
        }
        aria-label={`Open the three views of ${token?.name || `Mingle #${tokenId}`}`}
      >
        {token?.image ? (
          <img
            src={token.image}
            alt={token.name}
            loading="lazy"
            referrerPolicy="no-referrer"
            onError={() => setToken((t) => (t ? { ...t, image: null } : t))}
          />
        ) : (
          <div className="nft-placeholder">
            <Wallet size={28} />
            <span>
              {error
                ? "Verification unavailable"
                : token
                  ? "Official media unavailable"
                  : "Loading official token…"}
            </span>
          </div>
        )}
      </button>
      <div>
        <span className="eyebrow">APECHAIN / #{tokenId}</span>
        <h3>{token?.name || `Mingle #${tokenId}`}</h3>
        {error && <p role="status">{error}</p>}
        <a
          href={`${COLLECTION.chain.blockExplorers.default.url}/token/${COLLECTION.address}?a=${tokenId}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          View on explorer ↗
        </a>
      </div>
    </article>
  );
}
