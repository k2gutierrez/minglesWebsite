"use client";

import { useMemo, useState } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import {
  useAccount,
  usePublicClient,
  useReadContracts,
  useSignMessage,
  useSwitchChain,
  useWriteContract,
} from "wagmi";
import { formatEther, zeroAddress, type Address } from "viem";
import { raffleChain } from "@/lib/web3/chains";
import {
  RAFFLE_ABI,
  RAFFLE_ADDRESS,
  RAFFLE_MAX,
  RAFFLE_PRICE,
  raffleConfigured,
  shortAddress,
  type RaffleWinner,
} from "@/lib/web3/raffle";
import { raffleEntryMessage } from "@/lib/web3/raffle-message";

const LOOT = [
  "Sealed Booster Box (24 packs) signed by Beeple & Figge",
  "Sealed Decks (2)",
  "Sealed Booster Box (24 packs)",
  "Playmats (2)",
  "Pouch with Playing Beads (2)",
  "2026 ApeFest GM Tote (Red)",
  "ApeFest Merch Bag (Red)",
  "1 Mingle Tequila NFT",
];

const STEPS = [
  {
    n: "01",
    title: "Connect your wallet",
    body: "ApeChain only. Your wallet is your ticket; there is no account to create.",
  },
  {
    n: "02",
    title: "Pick one number",
    body: "Numbers 1 to 25. One number per transaction, 690 APE each, paid in native APE.",
  },
  {
    n: "03",
    title: "Sign and enter",
    body: "Sign a message so we can reach you if you win, then confirm the transaction.",
  },
];

export function Raffle() {
  const { address, chainId } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const { switchChainAsync } = useSwitchChain();
  const { writeContractAsync } = useWriteContract();
  const publicClient = usePublicClient({ chainId: raffleChain.id });

  const [selected, setSelected] = useState<number | null>(null);
  const [form, setForm] = useState({ name: "", email: "", phone: "", note: "" });
  const [busy, setBusy] = useState(false);
  const [busyNumber, setBusyNumber] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [done, setDone] = useState<number | null>(null);
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>();

  const infoContracts = [
    { address: RAFFLE_ADDRESS, abi: RAFFLE_ABI, functionName: "getCounter" },
    { address: RAFFLE_ADDRESS, abi: RAFFLE_ABI, functionName: "getIsSellOut" },
    { address: RAFFLE_ADDRESS, abi: RAFFLE_ABI, functionName: "getRaffleEnd" },
    { address: RAFFLE_ADDRESS, abi: RAFFLE_ABI, functionName: "getIsCancelled" },
    { address: RAFFLE_ADDRESS, abi: RAFFLE_ABI, functionName: "getPrice" },
    { address: RAFFLE_ADDRESS, abi: RAFFLE_ABI, functionName: "getWinnerInfo" },
  ] as const;

  const {
    data: info,
    refetch: refetchInfo,
  } = useReadContracts({
    contracts: infoContracts,
    query: { enabled: raffleConfigured, refetchInterval: 20_000 },
  });

  const numberContracts = useMemo(
    () =>
      Array.from({ length: RAFFLE_MAX }, (_, index) => ({
        address: RAFFLE_ADDRESS,
        abi: RAFFLE_ABI,
        functionName: "getUserAddressByNumber" as const,
        args: [index + 1] as const,
      })),
    [],
  );

  const {
    data: numbers,
    refetch: refetchNumbers,
  } = useReadContracts({
    contracts: numberContracts,
    query: { enabled: raffleConfigured, refetchInterval: 20_000 },
  });

  const counter =
    info?.[0]?.status === "success" ? Number(info[0].result) : 0;
  const soldOut = info?.[1]?.status === "success" ? info[1].result : false;
  const ended = info?.[2]?.status === "success" ? info[2].result : false;
  const cancelled = info?.[3]?.status === "success" ? info[3].result : false;
  const price =
    info?.[4]?.status === "success" ? (info[4].result as bigint) : RAFFLE_PRICE;
  const winner =
    info?.[5]?.status === "success"
      ? (info[5].result as unknown as RaffleWinner)
      : undefined;

  const rows = useMemo(
    () =>
      Array.from({ length: RAFFLE_MAX }, (_, index) => {
        const result = numbers?.[index];
        const owner =
          result?.status === "success" ? (result.result as Address) : undefined;
        const taken = !!owner && owner !== zeroAddress;
        return {
          number: index + 1,
          owner,
          taken,
          mine:
            !!owner &&
            owner !== zeroAddress &&
            !!address &&
            owner.toLowerCase() === address.toLowerCase(),
        };
      }),
    [numbers, address],
  );

  const mine = rows.filter((row) => row.mine);
  const wrongChain = !!address && chainId !== raffleChain.id;
  const blocked = !raffleConfigured || cancelled || ended || soldOut;
  const explorer = raffleChain.blockExplorers?.default.url;

  async function refresh() {
    await Promise.all([refetchInfo(), refetchNumbers()]);
  }

  async function enter() {
    if (!address || selected === null || !publicClient) return;
    setBusy(true);
    setError("");
    try {
      const contact = {
        number: selected,
        address,
        name: form.name,
        email: form.email,
        phone: form.phone,
        note: form.note || undefined,
      };
      const message = raffleEntryMessage(contact);
      const signature = await signMessageAsync({ message });

      // Primero los datos de contacto, luego la compra: si la compra falla, el
      // número sigue libre y el contacto sobra (no se pierde nada).
      const response = await fetch("/api/raffle/entries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...contact, signature }),
      });
      const payload = (await response.json().catch(() => ({}))) as {
        error?: string;
      };
      if (!response.ok)
        throw new Error(payload.error || "Your details could not be saved.");

      const hash = await writeContractAsync({
        address: RAFFLE_ADDRESS,
        abi: RAFFLE_ABI,
        functionName: "pickNumber",
        args: [selected],
        value: price,
      });
      await publicClient.waitForTransactionReceipt({ hash });
      setTxHash(hash);
      setDone(selected);
      setSelected(null);
      await refresh();
    } catch (cause) {
      setError(friendlyError(cause));
    } finally {
      setBusy(false);
    }
  }

  async function leave(number: number) {
    if (!publicClient) return;
    setBusyNumber(number);
    setError("");
    try {
      const hash = await writeContractAsync({
        address: RAFFLE_ADDRESS,
        abi: RAFFLE_ABI,
        functionName: "removeNumber",
        args: [number],
      });
      await publicClient.waitForTransactionReceipt({ hash });
      await refresh();
    } catch (cause) {
      setError(friendlyError(cause));
    } finally {
      setBusyNumber(null);
    }
  }

  return (
    <main id="main" className="raffle">
      <section className="raffle-hero">
        <div className="raffle-hero-copy">
          <span className="eyebrow">MINGLES × APEFEST 2026</span>
          <h1>
            One box.
            <br />
            Twenty-five
            <br />
            numbers.
          </h1>
          <p className="raffle-lede">
            A sealed BAYC Mudwater TCG booster box signed by Beeple &amp; Figge,
            the full ApeFest kit and a Mingle Tequila NFT. Twenty-five numbers,
            690 APE each, one winner.
          </p>
          <div className="raffle-meta">
            <div>
              <strong>{formatEther(RAFFLE_PRICE)} APE</strong>
              <span>per number</span>
            </div>
            <div>
              <strong>{RAFFLE_MAX}</strong>
              <span>numbers only</span>
            </div>
            <div>
              <strong>01</strong>
              <span>winner takes all</span>
            </div>
          </div>
          <a className="button button-coral" href="#board">
            Pick your number
          </a>
        </div>
        <div className="raffle-hero-art">
          <img src="/raffle/pack.jpg" alt="BAYC Mudwater TCG kit" />
          <span className="raffle-stamp">SIGNED BY BEEPLE &amp; FIGGE</span>
        </div>
      </section>

      <div className="raffle-ticker" aria-hidden="true">
        <span>
          690 APE / NUMBER ✳ 25 NUMBERS ✳ ONE WINNER ✳ MUDWATER TCG ✳ APEFEST
          2026 ✳
        </span>
      </div>

      <section className="raffle-section raffle-prize">
        <div className="raffle-section-head">
          <div>
            <span className="eyebrow">THE PRIZE</span>
            <h2>Everything in the box.</h2>
          </div>
          <p>
            One sealed booster box signed by the artists, plus the full ApeFest
            kit that came with it and a Mingle Tequila NFT from our cellar.
          </p>
        </div>
        <div className="raffle-prize-grid">
          <ul className="raffle-loot">
            {LOOT.map((item) => (
              <li key={item}>
                <span>✳</span>
                {item}
              </li>
            ))}
          </ul>
          <div className="raffle-gallery">
            <figure className="raffle-shot raffle-shot-wide">
              <img src="/raffle/kit.jpg" alt="Full ApeFest kit laid out" />
            </figure>
            <figure className="raffle-shot">
              <img src="/raffle/bundle.jpg" alt="Sealed box, decks and mats" />
            </figure>
            <figure className="raffle-shot">
              <img src="/raffle/signed.jpg" alt="Signed Mudwater booster box" />
            </figure>
            <figure className="raffle-shot raffle-shot-wide">
              <img src="/raffle/tote.jpg" alt="ApeFest tote and merch bag" />
            </figure>
          </div>
        </div>
      </section>

      <section className="raffle-section raffle-how">
        <div className="raffle-section-head">
          <div>
            <span className="eyebrow">HOW IT WORKS</span>
            <h2>Three steps, one number.</h2>
          </div>
        </div>
        <div className="raffle-steps">
          {STEPS.map((step) => (
            <div key={step.n} className="raffle-step">
              <span className="raffle-step-number">{step.n}</span>
              <h3>{step.title}</h3>
              <p>{step.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="board" className="raffle-board">
        <div className="raffle-board-head">
          <div>
            <span className="eyebrow">THE BOARD</span>
            <h2>
              {counter} / {RAFFLE_MAX} claimed
            </h2>
          </div>
          <div className="raffle-board-status">
            <span className="status">
              <span />
              {!raffleConfigured
                ? "Opening soon"
                : cancelled
                  ? "Cancelled"
                  : ended
                    ? "Winner drawn"
                    : soldOut
                      ? "Sold out"
                      : "Open"}
            </span>
            <p>{formatEther(price)} APE per number · native APE on ApeChain</p>
          </div>
        </div>

        {!raffleConfigured && (
          <div className="raffle-banner">
            The raffle contract is not configured yet. The page is ready: it
            opens as soon as <code>NEXT_PUBLIC_RAFFLE_ADDRESS</code> is set.
          </div>
        )}
        {raffleConfigured && cancelled && (
          <div className="raffle-banner raffle-banner-alert">
            This raffle was cancelled. If you hold a number, take your APE back
            below.
          </div>
        )}
        {raffleConfigured && ended && (
          <div className="raffle-banner raffle-banner-win">
            Winner: number <strong>{winner?.winnerNumber ?? "—"}</strong>{" "}
            {winner?.winnerAddress ? `(${shortAddress(winner.winnerAddress)})` : ""}
            . We will contact the winner with the details on file.
          </div>
        )}
        {raffleConfigured && soldOut && !ended && !cancelled && (
          <div className="raffle-banner">
            All 25 numbers are taken. The draw happens when Mingles rolls the
            winner onchain.
          </div>
        )}

        <div className="raffle-board-grid">
          <div className="raffle-numbers-wrap">
            <div className="raffle-numbers" role="group" aria-label="Raffle numbers">
              {rows.map((row) => {
                const isSelected = selected === row.number;
                return (
                  <button
                    key={row.number}
                    type="button"
                    className={`raffle-number${row.taken ? " is-taken" : ""}${
                      row.mine ? " is-mine" : ""
                    }${isSelected ? " is-selected" : ""}`}
                    aria-pressed={isSelected}
                    disabled={blocked || row.taken || busy}
                    onClick={() => {
                      setSelected(row.number);
                      setDone(null);
                      setError("");
                    }}
                  >
                    <span>{String(row.number).padStart(2, "0")}</span>
                    <small>
                      {row.mine
                        ? "yours"
                        : row.taken
                          ? "taken"
                          : "free"}
                    </small>
                  </button>
                );
              })}
            </div>
            <p className="raffle-fine">
              Availability is read live from the contract. Numbers already
              taken cannot be selected.
            </p>
          </div>

          <div className="raffle-checkout">
            {done !== null ? (
              <div className="raffle-done">
                <span className="eyebrow">YOU ARE IN</span>
                <h3>Number {String(done).padStart(2, "0")}</h3>
                <p>
                  Your entry is onchain. We saved your contact details for the
                  draw.
                </p>
                {txHash && explorer && (
                  <a
                    className="raffle-tx"
                    href={`${explorer}/tx/${txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View transaction ↗
                  </a>
                )}
                <button
                  type="button"
                  className="raffle-secondary"
                  onClick={() => {
                    setDone(null);
                    setForm({ name: "", email: "", phone: "", note: "" });
                  }}
                >
                  Pick another number
                </button>
              </div>
            ) : (
              <>
                <span className="eyebrow">YOUR ENTRY</span>
                <div className="raffle-connect-row">
                  <ConnectButton.Custom>
                    {({
                      account,
                      chain,
                      mounted,
                      openAccountModal,
                      openConnectModal,
                    }) => {
                      if (!mounted)
                        return (
                          <button className="raffle-connect" disabled>
                            Connect wallet
                          </button>
                        );
                      if (!account)
                        return (
                          <button
                            className="raffle-connect"
                            onClick={openConnectModal}
                          >
                            Connect wallet
                          </button>
                        );
                      return (
                        <button
                          className="raffle-connect"
                          onClick={openAccountModal}
                        >
                          {account.displayName}
                          {chain ? ` · ${chain.name}` : ""}
                        </button>
                      );
                    }}
                  </ConnectButton.Custom>
                  {selected !== null && (
                    <span className="raffle-picked">
                      Number {String(selected).padStart(2, "0")}
                    </span>
                  )}
                </div>

                {wrongChain && (
                  <button
                    type="button"
                    className="raffle-switch"
                    onClick={() =>
                      switchChainAsync({ chainId: raffleChain.id }).catch(
                        () => setError("Switch the network in your wallet."),
                      )
                    }
                  >
                    Switch to {raffleChain.name}
                  </button>
                )}

                <form
                  className="raffle-form"
                  onSubmit={(event) => {
                    event.preventDefault();
                    void enter();
                  }}
                >
                  <label>
                    Name
                    <input
                      required
                      minLength={2}
                      maxLength={80}
                      autoComplete="name"
                      value={form.name}
                      onChange={(event) =>
                        setForm({ ...form, name: event.target.value })
                      }
                    />
                  </label>
                  <label>
                    Email
                    <input
                      required
                      type="email"
                      autoComplete="email"
                      value={form.email}
                      onChange={(event) =>
                        setForm({ ...form, email: event.target.value })
                      }
                    />
                  </label>
                  <label>
                    Phone
                    <input
                      required
                      type="tel"
                      autoComplete="tel"
                      value={form.phone}
                      onChange={(event) =>
                        setForm({ ...form, phone: event.target.value })
                      }
                    />
                  </label>
                  <label>
                    Note <span>(optional)</span>
                    <input
                      maxLength={280}
                      value={form.note}
                      onChange={(event) =>
                        setForm({ ...form, note: event.target.value })
                      }
                    />
                  </label>
                  <button
                    type="submit"
                    className="raffle-primary"
                    disabled={
                      !raffleConfigured ||
                      !address ||
                      selected === null ||
                      busy ||
                      wrongChain ||
                      blocked
                    }
                  >
                    {busy
                      ? "Confirming…"
                      : selected === null
                        ? "Pick a number"
                        : `Enter for ${formatEther(price)} APE`}
                  </button>
                </form>

                <p className="raffle-fine">
                  We save your contact before the purchase. If you reject the
                  wallet transaction, the number stays free and nothing is
                  charged.
                </p>
              </>
            )}

            {error && <p className="raffle-error">{error}</p>}
          </div>
        </div>

        {mine.length > 0 && (
          <div className="raffle-mine">
            <span className="eyebrow">YOUR NUMBERS</span>
            <div className="raffle-mine-list">
              {mine.map((row) => (
                <div key={row.number} className="raffle-mine-item">
                  <strong>{String(row.number).padStart(2, "0")}</strong>
                  <button
                    type="button"
                    className="raffle-secondary"
                    disabled={busyNumber === row.number || soldOut}
                    onClick={() => void leave(row.number)}
                  >
                    {busyNumber === row.number
                      ? "Confirming…"
                      : cancelled
                        ? "Refund APE"
                        : "Leave raffle"}
                  </button>
                </div>
              ))}
            </div>
            {soldOut && !cancelled && (
              <p className="raffle-fine">
                The raffle is sold out; numbers are frozen until the draw.
              </p>
            )}
          </div>
        )}
      </section>

      <section className="raffle-section raffle-faq">
        <div className="raffle-section-head">
          <div>
            <span className="eyebrow">THE FINE PRINT</span>
            <h2>What you should know.</h2>
          </div>
        </div>
        <div className="raffle-faq-grid">
          <div>
            <h3>What if all 25 numbers do not sell?</h3>
            <p>
              The draw only happens at 25 / 25. If they do not sell, Mingles can
              cancel the raffle and every holder can take their APE back.
            </p>
          </div>
          <div>
            <h3>How is the winner picked?</h3>
            <p>
              Mingles rolls the vRNG onchain once the raffle is sold out. The
              winning number is public and verifiable.
            </p>
          </div>
          <div>
            <h3>How do I receive the prize?</h3>
            <p>
              We contact the winner with the name, email and phone signed at
              entry, then coordinate shipping.
            </p>
          </div>
          <div>
            <h3>Which currency?</h3>
            <p>
              690 APE per number, paid in native APE on ApeChain. One number per
              transaction.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}

function friendlyError(cause: unknown) {
  const message = cause instanceof Error ? cause.message : "";
  if (/user rejected|denied/i.test(message))
    return "Transaction cancelled in your wallet.";
  if (/insufficient funds/i.test(message))
    return "Not enough APE in this wallet for the number plus gas.";
  return message || "Something went wrong. Please try again.";
}
