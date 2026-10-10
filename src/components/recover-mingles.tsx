"use client";
import { useCallback, useEffect, useState } from "react";
import { AlertTriangle, ExternalLink, RefreshCw, Unlock, Wallet } from "lucide-react";
import { getAddress, isAddress } from "viem";
import { COLLECTION } from "@/lib/web3/collection";
import {
  CAVA_STAKING_ADDRESS,
  unstakeEmergencyData,
} from "@/lib/web3/staking";
import { Status } from "./ui";

type Provider = {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
  on?: (event: string, listener: (value: unknown) => void) => void;
  removeListener?: (event: string, listener: (value: unknown) => void) => void;
};

const EXPLORER = COLLECTION.chain.blockExplorers.default.url;
const CHAIN_HEX = `0x${COLLECTION.chain.id.toString(16)}`;

/**
 * Recuperación de Mingles atrapados en el contrato de staking de CAVA.
 *
 * Decisiones que importan:
 *  - **No exige cuenta ni correo.** La acción la firma el usuario con su propia
 *    wallet, así que nadie queda bloqueado esperando un enlace de acceso.
 *  - Una sola transacción recupera **TODOS** los Mingles staked de esa wallet.
 *    La interfaz lo dice tres veces porque es contraintuitivo.
 *  - El contrato se lee en el servidor; aquí solo se firma y se muestra el
 *    resultado. Si la lectura falla, se dice — nunca se inventa un número.
 */
export function RecoverMingles() {
  const [provider, setProvider] = useState<Provider | null>(null);
  const [walletName, setWalletName] = useState("");
  const [address, setAddress] = useState<string | null>(null);
  const [staked, setStaked] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  // Descubrimiento EIP-6963, con respaldo a la wallet inyectada clásica.
  useEffect(() => {
    const announce = (event: Event) => {
      const detail = (
        event as CustomEvent<{ info: { name: string }; provider: Provider }>
      ).detail;
      if (!detail?.provider?.request) return;
      setProvider((current) => current ?? detail.provider);
      setWalletName((current) => current || String(detail.info?.name ?? "Wallet"));
    };
    window.addEventListener("eip6963:announceProvider", announce);
    window.dispatchEvent(new Event("eip6963:requestProvider"));
    if (window.ethereum) {
      setProvider((current) => current ?? window.ethereum!);
      setWalletName((current) => current || "Browser wallet");
    }
    return () => window.removeEventListener("eip6963:announceProvider", announce);
  }, []);

  const readStaked = useCallback(async (owner: string) => {
    try {
      const response = await fetch(`/api/staking?address=${owner}`, {
        cache: "no-store",
      });
      const data = await response.json();
      if (!response.ok) throw Error(data.error || "The chain could not be read.");
      setStaked(data.staked as string);
    } catch (e) {
      setStaked(null);
      setMessage(e instanceof Error ? e.message : "The chain could not be read.");
    }
  }, []);

  async function switchNetwork() {
    if (!provider) return;
    if ((await provider.request({ method: "eth_chainId" })) === CHAIN_HEX) return;
    try {
      await provider.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: CHAIN_HEX }],
      });
    } catch (e) {
      if ((e as { code?: number }).code !== 4902) throw e;
      await provider.request({
        method: "wallet_addEthereumChain",
        params: [
          {
            chainId: CHAIN_HEX,
            chainName: COLLECTION.chain.name,
            nativeCurrency: COLLECTION.chain.nativeCurrency,
            rpcUrls: [...COLLECTION.chain.rpcUrls.default.http],
            blockExplorerUrls: [EXPLORER],
          },
        ],
      });
      await provider.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: CHAIN_HEX }],
      });
    }
  }

  async function connect() {
    if (!provider) {
      setMessage(
        "No EVM wallet found. Open this page in a wallet browser or install MetaMask.",
      );
      return;
    }
    setBusy(true);
    setMessage("Confirm the wallet account and network.");
    try {
      const accounts = await provider.request({ method: "eth_requestAccounts" });
      if (!Array.isArray(accounts) || !isAddress(String(accounts[0])))
        throw Error("No wallet account was selected.");
      await switchNetwork();
      const owner = getAddress(String(accounts[0]));
      setAddress(owner);
      setTxHash(null);
      setDone(false);
      await readStaked(owner);
      setMessage("");
    } catch (e) {
      setMessage(
        (e as { code?: number }).code === 4001
          ? "Request cancelled. Nothing was signed."
          : e instanceof Error
            ? e.message
            : "Wallet connection failed.",
      );
    } finally {
      setBusy(false);
    }
  }

  async function recover() {
    if (!provider || !address) return;
    setBusy(true);
    setTxHash(null);
    setDone(false);
    setMessage(
      "Review the transaction in your wallet. It recovers every staked Mingle at once.",
    );
    try {
      await switchNetwork();
      const hash = await provider.request({
        method: "eth_sendTransaction",
        params: [
          {
            from: address,
            to: CAVA_STAKING_ADDRESS,
            data: unstakeEmergencyData(),
          },
        ],
      });
      if (typeof hash !== "string") throw Error("The wallet did not return a transaction.");
      setTxHash(hash);
      setMessage("Transaction sent. Waiting for confirmation on ApeChain…");

      for (let attempt = 0; attempt < 40; attempt++) {
        await new Promise((resolve) => setTimeout(resolve, 3000));
        const receipt = (await provider.request({
          method: "eth_getTransactionReceipt",
          params: [hash],
        })) as { status?: string } | null;
        if (!receipt) continue;
        if (receipt.status === "0x1") {
          setDone(true);
          setMessage("Recovered. Your Mingles are back in your wallet.");
          await readStaked(address);
        } else {
          setMessage("The transaction failed onchain. Nothing was recovered.");
        }
        break;
      }
    } catch (e) {
      setMessage(
        (e as { code?: number }).code === 4001
          ? "Request cancelled. No transaction was sent."
          : e instanceof Error
            ? e.message
            : "The recovery could not be sent.",
      );
    } finally {
      setBusy(false);
    }
  }

  const stakedNumber = staked === null ? null : Number(staked);
  const hasStaked = stakedNumber !== null && stakedNumber > 0;

  return (
    <section className="wallet-panel">
      <div className="wallet-heading">
        <div>
          <span className="eyebrow">CAVA / RECOVERY</span>
          <h2>GET YOUR MINGLES BACK.</h2>
        </div>
        <Unlock size={32} />
      </div>

      <p>
        Mingles staked in the CAVA contract are still yours. This page asks the
        contract how many you have and gives you one transaction to take them
        back. No account or email is needed.
      </p>

      <a
        className="contract-link"
        href={`${EXPLORER}/address/${CAVA_STAKING_ADDRESS}`}
        target="_blank"
        rel="noopener noreferrer"
      >
        {CAVA_STAKING_ADDRESS}
        <ExternalLink size={12} />
      </a>

      <div className="recover-warning">
        <AlertTriangle size={18} />
        <div>
          <strong>One transaction recovers ALL of them.</strong>
          <span>
            The contract has no per-token recovery: this single action releases
            every Mingle you have staked. You pay only the network fee.
          </span>
        </div>
      </div>

      <div className="wallet-actions">
        <button
          className="button button-coral"
          onClick={connect}
          disabled={busy}
        >
          <Wallet size={17} />
          {address ? "Reconnect wallet" : "Connect wallet"}
        </button>

        {address && (
          <button
            className="button"
            onClick={() => readStaked(address)}
            disabled={busy}
          >
            <RefreshCw size={14} />
            Check again
          </button>
        )}
      </div>

      {address && (
        <div className="linked-wallet">
          <div className="wallet-row">
            <div>
              <span className="eyebrow">CONNECTED WALLET</span>
              <code>
                {address.slice(0, 8)}…{address.slice(-6)}
              </code>
            </div>
            {walletName && <Status>{walletName}</Status>}
          </div>

          <div className="recover-count">
            <span className="eyebrow">STAKED IN CAVA</span>
            <strong>{staked === null ? "—" : staked}</strong>
            <small>
              {staked === null
                ? "Reading the contract…"
                : hasStaked
                  ? "These are inside the staking contract, not in your wallet."
                  : "Nothing staked for this wallet. Nothing to recover."}
            </small>
          </div>

          <div className="wallet-actions">
            <button
              className="button button-coral"
              onClick={recover}
              disabled={busy || !hasStaked}
            >
              <Unlock size={16} />
              {busy ? "Working…" : "Recover my Mingles"}
            </button>
            <small>
              {hasStaked
                ? `Recovers all ${staked} in the same transaction.`
                : "The button turns on when the contract reports a balance."}
            </small>
          </div>
        </div>
      )}

      <p className="wallet-message" role="status" aria-live="polite">
        {message}
      </p>

      {txHash && (
        <div className={done ? "recover-done" : "wallet-notice"}>
          <strong>{done ? "Recovered." : "Transaction sent."}</strong>
          <a
            href={`${EXPLORER}/tx/${txHash}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            View the transaction ↗
          </a>
        </div>
      )}

      <p className="muted">
        If this page cannot reach the contract, you can still recover directly:{" "}
        <a
          href={`${EXPLORER}/address/${CAVA_STAKING_ADDRESS}#writeContract`}
          target="_blank"
          rel="noopener noreferrer"
        >
          open the contract on ApeScan and call unstakeNftsEmergency ↗
        </a>
      </p>
    </section>
  );
}
