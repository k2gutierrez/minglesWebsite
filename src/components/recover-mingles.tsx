"use client";
import { useCallback, useEffect, useState } from "react";
import {
  AlertTriangle,
  ExternalLink,
  RefreshCw,
  ShieldCheck,
  Unlock,
} from "lucide-react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount, useSwitchChain, useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import { COLLECTION } from "@/lib/web3/collection";
import { CAVA_STAKING_ADDRESS, cavaStakingAbi } from "@/lib/web3/staking";
import { Status } from "./ui";

const EXPLORER = COLLECTION.chain.blockExplorers.default.url;

/**
 * Recuperación de Mingles atrapados en el contrato de staking de CAVA.
 *
 * Decisiones que importan:
 *  - **No exige cuenta ni correo.** La acción la firma el usuario con su propia
 *    wallet, así que nadie queda bloqueado esperando un enlace de acceso.
 *  - Una sola transacción recupera **TODOS** los Mingles staked de esa wallet.
 *    La interfaz lo dice dos veces porque es contraintuitivo.
 *  - El contrato se lee en el servidor; aquí solo se firma y se muestra el
 *    resultado. Si la lectura falla, se dice — nunca se inventa un número.
 *  - El enlace a ApeScan queda como salida de emergencia: si esta página
 *    fallara, el usuario puede llamar la función a mano.
 */
export function RecoverMingles() {
  const [staked, setStaked] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [readError, setReadError] = useState("");

  const { address, chainId, isConnected } = useAccount();
  const { switchChainAsync } = useSwitchChain();
  const {
    writeContractAsync,
    data: hash,
    isPending,
    error: writeError,
    reset,
  } = useWriteContract();
  const { isLoading: confirming, isSuccess: confirmed } =
    useWaitForTransactionReceipt({ hash });

  const readStaked = useCallback(async (owner: string) => {
    setReadError("");
    try {
      const response = await fetch(`/api/staking?address=${owner}`, {
        cache: "no-store",
      });
      const data = await response.json();
      if (!response.ok) throw Error(data.error || "The chain could not be read.");
      setStaked(data.staked as string);
    } catch (e) {
      setStaked(null);
      setReadError(
        e instanceof Error ? e.message : "The chain could not be read.",
      );
    }
  }, []);

  useEffect(() => {
    if (address) void readStaked(address);
    else setStaked(null);
  }, [address, readStaked]);

  useEffect(() => {
    if (confirmed && address) {
      void readStaked(address);
      setMessage("Recovered. Your Mingles are back in your wallet.");
    }
  }, [confirmed, address, readStaked]);

  useEffect(() => {
    if (writeError)
      setMessage(
        (writeError as { code?: number }).code === 4001
          ? "Request cancelled. No transaction was sent."
          : writeError.message.slice(0, 160),
      );
  }, [writeError]);

  async function recover() {
    if (!address) return;
    reset();
    setMessage("Confirm the transaction in your wallet.");
    try {
      if (chainId !== COLLECTION.chain.id)
        await switchChainAsync({ chainId: COLLECTION.chain.id });
      await writeContractAsync({
        address: CAVA_STAKING_ADDRESS,
        abi: cavaStakingAbi,
        functionName: "unstakeNftsEmergency",
      });
      setMessage("Transaction sent. Waiting for confirmation on ApeChain…");
    } catch (e) {
      setMessage(
        (e as { code?: number }).code === 4001
          ? "Request cancelled. No transaction was sent."
          : e instanceof Error
            ? e.message.slice(0, 160)
            : "The recovery could not be sent.",
      );
    }
  }

  const stakedNumber = staked === null ? null : Number(staked);
  const hasStaked = stakedNumber !== null && stakedNumber > 0;
  const busy = isPending || confirming;

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
        <ConnectButton
          showBalance={false}
          chainStatus="icon"
          accountStatus={{ smallScreen: "avatar", largeScreen: "full" }}
        />
        {isConnected && (
          <button
            className="button"
            onClick={() => address && readStaked(address)}
            disabled={busy}
          >
            <RefreshCw size={14} />
            Check again
          </button>
        )}
      </div>

      {isConnected && address && (
        <div className="linked-wallet">
          <div className="wallet-row">
            <div>
              <span className="eyebrow">CONNECTED WALLET</span>
              <code>
                {address.slice(0, 8)}…{address.slice(-6)}
              </code>
            </div>
            <Status>Read-only</Status>
          </div>

          <div className="recover-count">
            <span className="eyebrow">STAKED IN CAVA</span>
            <strong>{staked === null ? "—" : staked}</strong>
            <small>
              {readError
                ? readError
                : staked === null
                  ? "Asking the contract about this wallet…"
                  : hasStaked
                    ? `This wallet has ${staked} Mingle${stakedNumber === 1 ? "" : "s"} inside the CAVA contract, not in the wallet.`
                    : "This wallet has nothing staked. If you staked from a different wallet, connect that one — the contract reports per wallet, not per person."}
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

      {hash && (
        <div className={confirmed ? "recover-done" : "wallet-notice"}>
          <strong>
            {confirmed ? "Recovered." : "Transaction sent."}
          </strong>
          <a
            href={`${EXPLORER}/tx/${hash}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            View the transaction ↗
          </a>
        </div>
      )}

      <p className="muted">
        <ShieldCheck size={13} /> We never ask for your seed phrase or private
        key. If this page cannot reach the contract, you can still recover
        directly:{" "}
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
