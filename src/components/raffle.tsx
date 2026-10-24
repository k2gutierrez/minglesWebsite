"use client";

import { useEffect, useMemo, useState } from "react";
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
  RAFFLE_ABI_COMMON,
  RAFFLE_ADDRESS,
  RAFFLE_MAX,
  raffleConfigured,
  shortAddress,
  type RaffleWinner,
} from "@/lib/web3/raffle";
import {
  raffleEntryMessage,
  raffleOwnerEntriesMessage,
  raffleWithdrawalMessage,
  type RaffleContact,
} from "@/lib/web3/raffle-message";

type OwnerEntry = {
  number: number;
  wallet: string;
  name: string;
  email: string;
  phone: string;
  note: string | null;
  created_at: string;
  network: string;
};

type OwnerAuth = {
  address: Address;
  signature: `0x${string}`;
  timestamp: number;
};

const LOOT = [
  "Sealed Booster Box (24 packs) signed by Beeple & Figge",
  "Sealed Decks (2)",
  "Playmats (2)",
  "Pouch with Playing Beads (2)",
  "2026 ApeFest GM Tote (Red)",
  "ApeFest Merch Bag (Red)",
  "1 Mingle Tequila NFT",
];

function formatPrice(value: bigint) {
  const text = formatEther(value);
  if (!text.includes(".")) return text;
  return text.replace(/0+$/, "").replace(/\.$/, "");
}

const STEPS = [
  {
    n: "01",
    title: "Connect your wallet",
    body: "Use the network shown on this page. Your wallet is your ticket; there is no account to create.",
  },
  {
    n: "02",
    title: "Pick one number",
    body: "Numbers 1 to 25. One number per transaction, paid in the chain's native token.",
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
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    note: "",
  });
  const [busy, setBusy] = useState(false);
  const [busyNumber, setBusyNumber] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [done, setDone] = useState<number | null>(null);
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>();
  const [ownerBusy, setOwnerBusy] = useState<string | null>(null);
  const [ownerMessage, setOwnerMessage] = useState("");
  const [winningNumber, setWinningNumber] = useState("");
  // Compras de esta sesión: ocultan el número al instante aunque el RPC tarde
  // un par de segundos en reflejar el nuevo dueño.
  const [recentPurchases, setRecentPurchases] = useState<
    { number: number; buyer: Address }[]
  >([]);
  const [ownerEntries, setOwnerEntries] = useState<OwnerEntry[]>([]);
  const [entriesLoading, setEntriesLoading] = useState(false);
  const [entriesError, setEntriesError] = useState("");
  // Firma vigente del owner para leer Supabase. La API la acepta 5 minutos;
  // la reutilizamos para el auto-refresh de 30s y pedimos otra al expirar.
  const [ownerAuth, setOwnerAuth] = useState<OwnerAuth | null>(null);
  const [modal, setModal] = useState<{
    title: string;
    message: string;
  } | null>(null);
  const [pendingContact, setPendingContact] = useState<{
    contact: RaffleContact;
    signature: `0x${string}`;
  } | null>(null);
  const [contactSaving, setContactSaving] = useState(false);
  const [contactSaved, setContactSaved] = useState(false);
  const [contactError, setContactError] = useState("");

  const symbol = raffleChain.nativeCurrency.symbol;
  const chainName = raffleChain.name;

  const infoContracts = [
    {
      address: RAFFLE_ADDRESS,
      abi: RAFFLE_ABI_COMMON,
      functionName: "getCounter",
      chainId: raffleChain.id,
    },
    {
      address: RAFFLE_ADDRESS,
      abi: RAFFLE_ABI_COMMON,
      functionName: "getIsSellOut",
      chainId: raffleChain.id,
    },
    {
      address: RAFFLE_ADDRESS,
      abi: RAFFLE_ABI_COMMON,
      functionName: "getRaffleEnd",
      chainId: raffleChain.id,
    },
    {
      address: RAFFLE_ADDRESS,
      abi: RAFFLE_ABI_COMMON,
      functionName: "getIsCancelled",
      chainId: raffleChain.id,
    },
    {
      address: RAFFLE_ADDRESS,
      abi: RAFFLE_ABI_COMMON,
      functionName: "getPrice",
      chainId: raffleChain.id,
    },
    {
      address: RAFFLE_ADDRESS,
      abi: RAFFLE_ABI_COMMON,
      functionName: "getWinnerInfo",
      chainId: raffleChain.id,
    },
    {
      address: RAFFLE_ADDRESS,
      abi: RAFFLE_ABI_COMMON,
      functionName: "getContractBalance",
      chainId: raffleChain.id,
    },
    {
      address: RAFFLE_ADDRESS,
      abi: RAFFLE_ABI_COMMON,
      functionName: "owner",
      chainId: raffleChain.id,
    },
  ] as const;

  const { data: info, refetch: refetchInfo } = useReadContracts({
    contracts: infoContracts,
    query: { enabled: raffleConfigured, refetchInterval: 20_000 },
  });

  const numberContracts = useMemo(
    () =>
      Array.from({ length: RAFFLE_MAX }, (_, index) => ({
        address: RAFFLE_ADDRESS,
        abi: RAFFLE_ABI_COMMON,
        functionName: "getUserAddressByNumber" as const,
        args: [index + 1] as const,
        chainId: raffleChain.id,
      })),
    [],
  );

  const { data: numbers, refetch: refetchNumbers } = useReadContracts({
    contracts: numberContracts,
    query: { enabled: raffleConfigured, refetchInterval: 20_000 },
  });

  const counter = info?.[0]?.status === "success" ? Number(info[0].result) : 0;
  const soldOut = info?.[1]?.status === "success" ? info[1].result : false;
  const ended = info?.[2]?.status === "success" ? info[2].result : false;
  const cancelled = info?.[3]?.status === "success" ? info[3].result : false;
  const price =
    info?.[4]?.status === "success" ? (info[4].result as bigint) : undefined;
  const displayPrice = price === undefined ? "—" : formatPrice(price);
  const winner =
    info?.[5]?.status === "success"
      ? (info[5].result as unknown as RaffleWinner)
      : undefined;
  const contractBalance =
    info?.[6]?.status === "success" ? (info[6].result as bigint) : 0n;
  const ownerAddress =
    info?.[7]?.status === "success" ? (info[7].result as Address) : undefined;

  const rows = useMemo(
    () =>
      Array.from({ length: RAFFLE_MAX }, (_, index) => {
        const number = index + 1;
        const result = numbers?.[index];
        const owner =
          result?.status === "success" ? (result.result as Address) : undefined;
        const recent = recentPurchases.find((item) => item.number === number);
        const onchainOwner =
          !!owner && owner !== zeroAddress ? owner : undefined;
        return {
          number,
          owner,
          taken: !!onchainOwner || !!recent,
          mine:
            (!!onchainOwner &&
              !!address &&
              onchainOwner.toLowerCase() === address.toLowerCase()) ||
            (!!recent &&
              !!address &&
              recent.buyer.toLowerCase() === address.toLowerCase()),
        };
      }),
    [numbers, address, recentPurchases],
  );

  const mine = rows.filter((row) => row.mine);
  const takenRows = rows.filter((row) => row.taken);
  const isOwner =
    !!address &&
    !!ownerAddress &&
    address.toLowerCase() === ownerAddress.toLowerCase();
  const wrongChain = !!address && chainId !== raffleChain.id;
  const blocked = !raffleConfigured || cancelled || ended || soldOut;
  const explorer = raffleChain.blockExplorers?.default.url;

  async function refresh() {
    await Promise.all([refetchInfo(), refetchNumbers()]);
  }

  async function saveContact(contact: RaffleContact, signature: `0x${string}`) {
    setContactSaving(true);
    setContactSaved(false);
    setContactError("");
    setPendingContact(null);

    let lastError = "Your contact could not be saved.";
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const response = await fetch("/api/raffle/entries", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...contact, signature }),
        });
        const payload = (await response.json().catch(() => ({}))) as {
          error?: string;
        };
        if (response.ok) {
          setContactSaved(true);
          setContactSaving(false);
          return true;
        }
        lastError = payload.error || "Your contact could not be saved.";
        // 409 = the RPC may not have indexed the purchase yet; 503 = the RPC
        // or Supabase had a transient hiccup. Retry both.
        if (response.status !== 409 && response.status !== 503) break;
      } catch (cause) {
        lastError = friendlyError(cause);
      }
      if (attempt < 2)
        await new Promise((resolve) => setTimeout(resolve, 1_500));
    }

    setContactSaving(false);
    setContactError(lastError);
    setPendingContact({ contact, signature });
    return false;
  }

  async function enter() {
    if (!address || selected === null || !publicClient || price === undefined)
      return;
    const number = selected;
    setBusy(true);
    setError("");
    setContactSaved(false);
    setContactError("");
    setPendingContact(null);
    try {
      const contact = {
        number,
        address,
        name: form.name,
        email: form.email,
        phone: form.phone,
        note: form.note || undefined,
        chainId: raffleChain.id,
        contract: RAFFLE_ADDRESS,
      };
      const message = raffleEntryMessage(contact);
      const signature = await signMessageAsync({ message });

      // Simulate first: if the number is already taken, the raffle is closed
      // or the value is wrong, viem throws before spending gas.
      await publicClient.simulateContract({
        address: RAFFLE_ADDRESS,
        abi: RAFFLE_ABI_COMMON,
        functionName: "pickNumber",
        args: [number],
        value: price,
        account: address,
      });

      const hash = await writeContractAsync({
        address: RAFFLE_ADDRESS,
        abi: RAFFLE_ABI_COMMON,
        functionName: "pickNumber",
        args: [number],
        value: price,
        chainId: raffleChain.id,
      });
      const receipt = await publicClient.waitForTransactionReceipt({ hash });

      if (receipt.status !== "success") {
        setModal({
          title: "Number already bought",
          message: `Number ${number} was taken by another wallet before your transaction. Pick another one.`,
        });
        setSelected(null);
        await refresh();
        return;
      }

      setTxHash(hash);
      setRecentPurchases((prev) => [
        ...prev.filter((item) => item.number !== number),
        { number, buyer: address },
      ]);
      setContactSaving(true);
      setDone(number);
      setSelected(null);

      // The contact is saved only after the purchase is confirmed. The API
      // checks that this wallet is the onchain owner; no 30-minute hold.
      await saveContact(contact, signature);
      await refresh();
    } catch (cause) {
      if (isAlreadyBought(cause)) {
        setModal({
          title: "Number already bought",
          message: `Number ${number} was taken by another wallet. Pick another one.`,
        });
        setSelected(null);
        await refresh();
      } else {
        setError(friendlyError(cause));
      }
    } finally {
      setBusy(false);
    }
  }

  async function registerWinner() {
    if (!publicClient || !address) return;
    if (!soldOut) {
      setError(
        "The winner can only be registered after all 25 numbers are sold.",
      );
      return;
    }
    const number = Number(winningNumber);
    if (!Number.isInteger(number) || number < 1 || number > RAFFLE_MAX) {
      setError(`Enter a winning number between 1 and ${RAFFLE_MAX}.`);
      return;
    }

    setOwnerBusy("winner");
    setOwnerMessage("");
    setError("");
    try {
      await publicClient.simulateContract({
        address: RAFFLE_ADDRESS,
        abi: RAFFLE_ABI_COMMON,
        functionName: "setWinner",
        args: [number],
        account: address,
      });

      const hash = await writeContractAsync({
        address: RAFFLE_ADDRESS,
        abi: RAFFLE_ABI_COMMON,
        functionName: "setWinner",
        args: [number],
        chainId: raffleChain.id,
      });
      const receipt = await publicClient.waitForTransactionReceipt({ hash });
      if (receipt.status !== "success")
        throw new Error(
          "The transaction reverted onchain. The winner was not registered.",
        );

      setOwnerMessage(
        `Winner registered: number ${number}. The pot is now withdrawable.`,
      );
      await refresh();
    } catch (cause) {
      setError(friendlyError(cause));
    } finally {
      setOwnerBusy(null);
    }
  }

  async function fetchOwnerEntries(auth: OwnerAuth, silent = false) {
    if (!silent) setEntriesLoading(true);
    setEntriesError("");
    try {
      const response = await fetch("/api/raffle/entries", {
        headers: {
          "x-owner-address": auth.address,
          "x-owner-signature": auth.signature,
          "x-owner-timestamp": String(auth.timestamp),
        },
      });
      const payload = (await response.json().catch(() => ({}))) as {
        error?: string;
        entries?: OwnerEntry[];
      };
      if (response.status === 401) {
        setOwnerAuth(null);
        setEntriesError(
          "Owner signature expired. Press Refresh to sign again.",
        );
        return;
      }
      if (!response.ok)
        throw new Error(payload.error || "The buyer list could not be loaded.");
      setOwnerEntries(payload.entries ?? []);
    } catch (cause) {
      setEntriesError(friendlyError(cause));
    } finally {
      if (!silent) setEntriesLoading(false);
    }
  }

  async function loadOwnerEntries() {
    if (!address) return;
    // Reutiliza la firma mientras siga vigente. La API acepta 5 minutos;
    // usamos 4 para no quedar justo en el borde.
    if (
      ownerAuth &&
      ownerAuth.address.toLowerCase() === address.toLowerCase() &&
      Date.now() - ownerAuth.timestamp < 4 * 60_000
    ) {
      await fetchOwnerEntries(ownerAuth);
      return;
    }

    setEntriesLoading(true);
    setEntriesError("");
    try {
      const timestamp = Date.now();
      const signature = await signMessageAsync({
        message: raffleOwnerEntriesMessage({
          address,
          chainId: raffleChain.id,
          contract: RAFFLE_ADDRESS,
          timestamp,
        }),
      });
      const auth = { address, signature, timestamp };
      setOwnerAuth(auth);
      await fetchOwnerEntries(auth);
    } catch (cause) {
      setEntriesError(friendlyError(cause));
    } finally {
      setEntriesLoading(false);
    }
  }

  // Auto-refresh de la lista cada 30 segundos mientras la firma del owner
  // siga siendo válida. Al expirar, se pide una nueva con el botón Refresh.
  useEffect(() => {
    if (!isOwner || !ownerAuth) return;

    const id = window.setInterval(() => {
      if (Date.now() - ownerAuth.timestamp > 4 * 60_000) {
        setOwnerAuth(null);
        setEntriesError(
          "Owner signature expired. Press Refresh to sign again.",
        );
        return;
      }
      void fetchOwnerEntries(ownerAuth, true);
    }, 30_000);

    return () => window.clearInterval(id);
    // fetchOwnerEntries se recrea en cada render; el efecto depende de la
    // firma y de isOwner, que son los valores que cambian.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOwner, ownerAuth]);

  async function cancelRaffle() {
    if (!publicClient) return;
    if (
      !window.confirm(
        `Cancel the raffle? Every holder will be able to take their ${symbol} back.`,
      )
    )
      return;
    setOwnerBusy("cancel");
    setOwnerMessage("");
    setError("");
    try {
      const hash = await writeContractAsync({
        address: RAFFLE_ADDRESS,
        abi: RAFFLE_ABI_COMMON,
        functionName: "cancelRaffle",
        chainId: raffleChain.id,
      });
      const receipt = await publicClient.waitForTransactionReceipt({ hash });
      if (receipt.status !== "success")
        throw new Error("The transaction reverted onchain.");
      setOwnerMessage("Raffle cancelled. Refunds are open.");
      await refresh();
    } catch (cause) {
      setError(friendlyError(cause));
    } finally {
      setOwnerBusy(null);
    }
  }

  async function withdrawPot() {
    if (!publicClient) return;
    setOwnerBusy("withdraw");
    setOwnerMessage("");
    setError("");
    try {
      const hash = await writeContractAsync({
        address: RAFFLE_ADDRESS,
        abi: RAFFLE_ABI_COMMON,
        functionName: "withdrawFunds",
        chainId: raffleChain.id,
      });
      const receipt = await publicClient.waitForTransactionReceipt({ hash });
      if (receipt.status !== "success")
        throw new Error("The transaction reverted onchain.");
      setOwnerMessage("Pot withdrawn to the owner wallet.");
      await refresh();
    } catch (cause) {
      setError(friendlyError(cause));
    } finally {
      setOwnerBusy(null);
    }
  }

  async function refundNumber(number: number) {
    if (!publicClient) return;
    setOwnerBusy(`refund-${number}`);
    setOwnerMessage("");
    setError("");
    try {
      const hash = await writeContractAsync({
        address: RAFFLE_ADDRESS,
        abi: RAFFLE_ABI_COMMON,
        functionName: "sendMoneyBackToUser",
        args: [number],
        chainId: raffleChain.id,
      });
      const receipt = await publicClient.waitForTransactionReceipt({ hash });
      if (receipt.status !== "success")
        throw new Error("The transaction reverted onchain.");
      setOwnerMessage(`Number ${number} refunded.`);
      await refresh();
    } catch (cause) {
      setError(friendlyError(cause));
    } finally {
      setOwnerBusy(null);
    }
  }

  async function leave(number: number) {
    if (!publicClient || !address) return;
    setBusyNumber(number);
    setError("");
    try {
      // La firma autoriza a borrar el contacto en Supabase. Se pide antes de
      // la transacción para no dejar el número libre y los datos colgados.
      const signature = await signMessageAsync({
        message: raffleWithdrawalMessage({
          number,
          address,
          chainId: raffleChain.id,
          contract: RAFFLE_ADDRESS,
        }),
      });

      const hash = await writeContractAsync({
        address: RAFFLE_ADDRESS,
        abi: RAFFLE_ABI_COMMON,
        functionName: "removeNumber",
        args: [number],
        chainId: raffleChain.id,
      });
      const receipt = await publicClient.waitForTransactionReceipt({ hash });
      if (receipt.status !== "success")
        throw new Error(
          "The transaction reverted onchain. The number was not released.",
        );

      setRecentPurchases((prev) =>
        prev.filter(
          (item) =>
            !(
              item.number === number &&
              item.buyer.toLowerCase() === address.toLowerCase()
            ),
        ),
      );
      await refresh();

      const removeEntry = () =>
        fetch("/api/raffle/entries", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ number, address, signature }),
        });

      let response = await removeEntry();
      // Si el RPC del servidor va unos segundos atrás, todavía ve el número a
      // nombre del usuario. Un reintento corto suele resolverlo.
      if (response.status === 409) {
        await new Promise((resolve) => setTimeout(resolve, 2_500));
        response = await removeEntry();
      }
      if (!response.ok) {
        const payload = (await response.json().catch(() => ({}))) as {
          error?: string;
        };
        throw new Error(
          payload.error ||
            "Your number was released onchain, but your contact details could not be removed. Try again in a moment.",
        );
      }
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
            the full ApeFest kit and a Mingle Tequila NFT. Twenty-five numbers,{" "}
            {displayPrice} {symbol} each, one winner.
          </p>
          <div className="raffle-meta">
            <div>
              <strong>
                {displayPrice} {symbol}
              </strong>
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
          {displayPrice} {symbol} / NUMBER ✳ 25 NUMBERS ✳ ONE WINNER ✳ MUDWATER
          TCG ✳ APEFEST 2026 ✳
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
            <p>
              {displayPrice} {symbol} per number · native {symbol} on{" "}
              {chainName}
            </p>
          </div>
        </div>

        <p className="raffle-board-help">
          <strong>How to enter:</strong> connect your wallet, pick an available
          number, fill in your contact details, sign the message and confirm the
          payment. If you change your mind, you can leave the raffle from
          &ldquo;Your numbers&rdquo; below and get the full price back while the
          raffle is not sold out.
        </p>

        {!raffleConfigured && (
          <div className="raffle-banner">
            The raffle contract is not configured yet. The page is ready: it
            opens as soon as the address for this network is set (
            <code>NEXT_PUBLIC_RAFFLE_ADDRESS_MAINNET</code>,{" "}
            <code>NEXT_PUBLIC_RAFFLE_ADDRESS_CURTIS</code>, …).
          </div>
        )}
        {raffleConfigured && cancelled && (
          <div className="raffle-banner raffle-banner-alert">
            This raffle was cancelled. If you hold a number, take your {symbol}{" "}
            back below.
          </div>
        )}
        {raffleConfigured && ended && (
          <div className="raffle-banner raffle-banner-win">
            Winner: number <strong>{winner?.winnerNumber ?? "—"}</strong>{" "}
            {winner?.winnerAddress
              ? `(${shortAddress(winner.winnerAddress)})`
              : ""}
            . We will contact the winner with the details on file.
          </div>
        )}
        {raffleConfigured && soldOut && !ended && !cancelled && (
          <div className="raffle-banner">
            All 25 numbers are taken. Numbers are locked; the owner will
            register the winning number onchain. Refunds and cancellation are no
            longer available after sellout.
          </div>
        )}

        <div className="raffle-board-grid">
          <div className="raffle-numbers-wrap">
            <div
              className="raffle-numbers"
              role="group"
              aria-label="Raffle numbers"
            >
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
                    disabled={
                      blocked || row.taken || busy || price === undefined
                    }
                    onClick={() => {
                      setSelected(row.number);
                      setDone(null);
                      setError("");
                    }}
                  >
                    <span>{String(row.number).padStart(2, "0")}</span>
                    <small>
                      {row.mine ? "yours" : row.taken ? "taken" : "available"}
                    </small>
                  </button>
                );
              })}
            </div>
            <p className="raffle-fine">
              Availability is read live from the contract. Numbers already taken
              cannot be selected.
            </p>
          </div>

          <div className="raffle-checkout">
            {done !== null ? (
              <div className="raffle-done">
                <span className="eyebrow">YOU ARE IN</span>
                <h3>Number {String(done).padStart(2, "0")}</h3>
                {contactSaving ? (
                  <p>Saving your contact details…</p>
                ) : contactSaved ? (
                  <p>
                    Your entry is onchain. We saved your contact details for the
                    draw.
                  </p>
                ) : (
                  <>
                    <p className="raffle-error">
                      Your entry is onchain, but we could not save your contact
                      details.
                      {contactError ? ` ${contactError}` : ""}
                    </p>
                    {pendingContact && (
                      <button
                        type="button"
                        className="raffle-secondary"
                        onClick={() =>
                          void saveContact(
                            pendingContact.contact,
                            pendingContact.signature,
                          )
                        }
                      >
                        Retry saving contact
                      </button>
                    )}
                  </>
                )}
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
                  disabled={contactSaving}
                  onClick={() => {
                    setDone(null);
                    setForm({ name: "", email: "", phone: "", note: "" });
                    setContactSaved(false);
                    setContactError("");
                    setPendingContact(null);
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
                      Number {String(selected).padStart(2, "0")} ·{" "}
                      {displayPrice} {symbol}
                    </span>
                  )}
                </div>

                {selected === null && (
                  <p className="raffle-fine">
                    Pick an available number on the board to start. You will
                    sign a message with your contact details, then confirm the
                    payment in your wallet.
                  </p>
                )}

                {wrongChain && (
                  <button
                    type="button"
                    className="raffle-switch"
                    onClick={() =>
                      switchChainAsync({ chainId: raffleChain.id }).catch(() =>
                        setError("Switch the network in your wallet."),
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
                    Phone or Twitter
                    <input
                      required
                      type="text"
                      autoComplete="off"
                      maxLength={80}
                      placeholder="@handle, https://x.com/handle or +52 55 1234 5678"
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
                      blocked ||
                      price === undefined
                    }
                  >
                    {busy
                      ? "Confirming…"
                      : selected === null
                        ? "Pick a number"
                        : `Enter for ${displayPrice} ${symbol}`}
                  </button>
                </form>

                <p className="raffle-fine">
                  We save your contact after the purchase is confirmed. MetaMask
                  will show a hash of your details, not your name, email or
                  phone; the contact itself is stored offchain in Supabase. If
                  the number was already bought, nothing is charged and no
                  contact is saved.
                </p>
              </>
            )}

            {error && <p className="raffle-error">{error}</p>}
          </div>
        </div>

        {isOwner && (
          <div className="raffle-owner">
            <div className="raffle-owner-head">
              <div>
                <span className="eyebrow">OWNER CONSOLE</span>
                <h3>Run the raffle</h3>
              </div>
              <span className="raffle-owner-tag">
                {shortAddress(address)} · ONCHAIN
              </span>
            </div>
            <p className="raffle-fine">
              Only the owner wallet sees this panel. Every action is an onchain
              transaction and cannot be undone.
            </p>
            <div className="raffle-owner-actions">
              <label className="raffle-owner-winner">
                Winning number
                <input
                  type="number"
                  min={1}
                  max={RAFFLE_MAX}
                  inputMode="numeric"
                  placeholder="1–25"
                  value={winningNumber}
                  disabled={ended || cancelled || ownerBusy !== null}
                  onChange={(event) => setWinningNumber(event.target.value)}
                />
              </label>
              <button
                type="button"
                className="raffle-primary"
                disabled={
                  !soldOut ||
                  !winningNumber ||
                  ended ||
                  cancelled ||
                  ownerBusy !== null
                }
                onClick={() => void registerWinner()}
              >
                {ownerBusy === "winner" ? "Registering…" : "Register winner"}
              </button>
              <button
                type="button"
                className="raffle-secondary"
                disabled={soldOut || ended || cancelled || ownerBusy !== null}
                title={
                  soldOut && !ended && !cancelled
                    ? "Cancellation is disabled after sellout. Register the winner instead."
                    : undefined
                }
                onClick={() => void cancelRaffle()}
              >
                {ownerBusy === "cancel" ? "Cancelling…" : "Cancel raffle"}
              </button>
              {ended && (
                <button
                  type="button"
                  className="raffle-secondary"
                  disabled={contractBalance === 0n || ownerBusy !== null}
                  onClick={() => void withdrawPot()}
                >
                  {ownerBusy === "withdraw"
                    ? "Withdrawing…"
                    : `Withdraw ${formatPrice(contractBalance)} ${symbol}`}
                </button>
              )}
            </div>
            <p className="raffle-fine">
              Pot: {formatPrice(contractBalance)} {symbol} · {counter} /{" "}
              {RAFFLE_MAX} numbers sold
              {ended
                ? " · winner registered"
                : cancelled
                  ? " · raffle cancelled"
                  : soldOut
                    ? " · sold out: cancellation disabled, register the winner"
                    : " · the draw unlocks at 25 / 25; until then holders can leave or the owner can cancel"}
            </p>
            <div className="raffle-owner-entries">
              <div className="raffle-owner-entries-head">
                <span className="eyebrow">BUYERS (SUPABASE)</span>
                <button
                  type="button"
                  className="raffle-secondary"
                  disabled={entriesLoading || ownerBusy !== null}
                  onClick={() => void loadOwnerEntries()}
                >
                  {entriesLoading
                    ? "Loading…"
                    : ownerEntries.length > 0
                      ? "Refresh list"
                      : "Load buyer list"}
                </button>
              </div>
              <p className="raffle-fine">
                {ownerAuth
                  ? "Auto-updating every 30 seconds while the owner signature is valid."
                  : "Sign once to load the list; it then refreshes every 30 seconds."}
              </p>
              {entriesError && <p className="raffle-error">{entriesError}</p>}
              {ownerAuth &&
                ownerEntries.length === 0 &&
                !entriesLoading &&
                !entriesError && (
                  <p className="raffle-fine">
                    No entries in Supabase for this network yet.
                  </p>
                )}
              {ownerEntries.length > 0 && (
                <div className="raffle-owner-table-wrap">
                  <table className="raffle-owner-table">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Wallet</th>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Phone / Twitter</th>
                        <th>Note</th>
                        <th>Status</th>
                        <th>Saved</th>
                        <th />
                      </tr>
                    </thead>
                    <tbody>
                      {ownerEntries.map((entry) => {
                        const chainRow = rows.find(
                          (row) => row.number === entry.number,
                        );
                        const onchainOwner =
                          chainRow?.owner && chainRow.owner !== zeroAddress
                            ? chainRow.owner
                            : undefined;
                        const status = !onchainOwner
                          ? "Not paid"
                          : onchainOwner.toLowerCase() ===
                              entry.wallet.toLowerCase()
                            ? "Onchain"
                            : `Other wallet (${shortAddress(onchainOwner)})`;
                        const contact = entry.phone.trim();
                        const twitterUrl = contact.startsWith("@")
                          ? `https://x.com/${contact.slice(1)}`
                          : /^https?:\/\/(?:www\.)?(?:twitter|x)\.com\//i.test(
                                contact,
                              )
                            ? contact
                            : /^(?=.*[A-Za-z_])[A-Za-z0-9_]{2,15}$/.test(
                                  contact,
                                )
                              ? `https://x.com/${contact}`
                              : undefined;

                        return (
                          <tr key={`${entry.number}-${entry.wallet}`}>
                            <td>{String(entry.number).padStart(2, "0")}</td>
                            <td title={entry.wallet}>
                              {shortAddress(entry.wallet)}
                            </td>
                            <td>{entry.name}</td>
                            <td>
                              <a href={`mailto:${entry.email}`}>
                                {entry.email}
                              </a>
                            </td>
                            <td>
                              {twitterUrl ? (
                                <a
                                  href={twitterUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  {entry.phone}
                                </a>
                              ) : (
                                entry.phone
                              )}
                            </td>
                            <td>{entry.note || "—"}</td>
                            <td>{status}</td>
                            <td>
                              {new Date(entry.created_at).toLocaleString()}
                            </td>
                            <td>
                              <button
                                type="button"
                                className="raffle-secondary"
                                disabled={
                                  status !== "Onchain" ||
                                  ended ||
                                  cancelled ||
                                  ownerBusy !== null
                                }
                                onClick={() =>
                                  setWinningNumber(String(entry.number))
                                }
                              >
                                Use
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
            {cancelled && takenRows.length > 0 && (
              <div className="raffle-owner-refunds">
                <span className="eyebrow">REFUNDS</span>
                <div className="raffle-owner-refund-list">
                  {takenRows.map((row) => (
                    <button
                      key={row.number}
                      type="button"
                      className="raffle-secondary"
                      disabled={ownerBusy !== null}
                      onClick={() => void refundNumber(row.number)}
                    >
                      {ownerBusy === `refund-${row.number}`
                        ? "Refunding…"
                        : `Refund #${String(row.number).padStart(2, "0")}`}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {ownerMessage && <p className="raffle-owner-msg">{ownerMessage}</p>}
          </div>
        )}

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
                    disabled={busyNumber === row.number || ended || soldOut}
                    onClick={() => void leave(row.number)}
                  >
                    {busyNumber === row.number
                      ? "Confirming…"
                      : cancelled
                        ? `Refund ${displayPrice} ${symbol}`
                        : "Leave & refund"}
                  </button>
                </div>
              ))}
            </div>
            <p className="raffle-fine">
              Leaving refunds {displayPrice} {symbol} and frees the number
              immediately. You can leave only while the raffle is not sold out;
              once all 25 numbers are sold, numbers are locked until the owner
              registers the winner.
            </p>
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
              The draw happens only at 25 / 25. If the raffle does not sell out,
              the owner can cancel and every holder can take their {symbol}{" "}
              back. Once all 25 numbers are sold, numbers are locked: buyers
              cannot leave and the owner must register the winning number.
            </p>
          </div>
          <div>
            <h3>How is the winner picked?</h3>
            <p>
              Once all 25 numbers are sold, the owner draws the winning number
              offchain and registers it onchain with <code>setWinner</code>. The
              contract only accepts a number that is currently held, stores the
              winner&apos;s address and publishes the result. The owner&apos;s
              reputation is the guarantee behind the offchain draw.
            </p>
          </div>
          <div>
            <h3>How do I receive the prize?</h3>
            <p>
              We contact the winner with the name, email and phone or Twitter
              signed at entry, then coordinate shipping.
            </p>
          </div>
          <div>
            <h3>Which currency?</h3>
            <p>
              {displayPrice} {symbol} per number, paid in native {symbol} on{" "}
              {chainName}. One number per transaction.
            </p>
          </div>
        </div>
      </section>

      {modal && (
        <div
          className="raffle-modal-backdrop"
          role="presentation"
          onClick={() => setModal(null)}
        >
          <div
            className="raffle-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="raffle-modal-title"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className="raffle-modal-close"
              aria-label="Close"
              onClick={() => setModal(null)}
            >
              ×
            </button>
            <span className="eyebrow">NUMBER UNAVAILABLE</span>
            <h3 id="raffle-modal-title">{modal.title}</h3>
            <p>{modal.message}</p>
            <button
              type="button"
              className="raffle-primary"
              onClick={() => {
                setModal(null);
                document
                  .getElementById("board")
                  ?.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
            >
              Pick another number
            </button>
          </div>
        </div>
      )}
    </main>
  );
}

function isAlreadyBought(cause: unknown) {
  const message = cause instanceof Error ? cause.message : "";
  return /NumberAlreadyPicked|already taken|already bought/i.test(message);
}

function friendlyError(cause: unknown) {
  const message = cause instanceof Error ? cause.message : "";
  if (/user rejected|denied/i.test(message))
    return "Transaction cancelled in your wallet.";
  if (/insufficient funds/i.test(message))
    return "Not enough funds in this wallet for the number plus gas.";
  if (/NumberAlreadyPicked/i.test(message))
    return "That number was just taken by another wallet. Pick another one.";
  if (/NoSellOut/i.test(message))
    return "The winner can only be registered after all 25 numbers are sold.";
  if (/NoEntries/i.test(message)) return "There are no entries yet.";
  if (/SellOut/i.test(message))
    return "The raffle is sold out right now. Try another number or wait for a cancellation.";
  if (/InvalidAmount/i.test(message))
    return "The amount sent is below the current price. Refresh the page and try again.";
  if (/RaffleEnded/i.test(message)) return "This raffle already ended.";
  if (/RaffleIsCancelled/i.test(message)) return "This raffle was cancelled.";
  if (/NumberNotPicked/i.test(message))
    return "That number is not currently held. Check the board.";
  if (/was not purchased|was not registered|was not released/i.test(message))
    return message;
  if (/reverted/i.test(message))
    return "The transaction reverted onchain. Nothing was changed.";
  return message || "Something went wrong. Please try again.";
}
