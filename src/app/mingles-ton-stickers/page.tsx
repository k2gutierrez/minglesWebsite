"use client";

import Image from "next/image";
import React, { useMemo, useState } from "react";
import { TonConnectUIProvider, TonConnectButton, useTonConnectUI } from "@tonconnect/ui-react";
import worm from "../../../public/images/White_Hearts_Right-p-500.png";

const MANIFEST_URL = "https://www.mingles.wtf/tonconnect-manifest.json";
const COLLECTION_ADDRESS = "EQA1qg9-ge8gmUn1UkjAe7gcrNUdCW9XnnIC7BpTrXXmDoKS";
const CID = "bafybeiejti2pggxqo5r2guonr5fz2gddkavhxxlmmkhyqzllnzk62meury";

function MintButton() {
  const [tonConnectUI] = useTonConnectUI();
  const [loading, setLoading] = useState(false);

  const uris = useMemo(() => {
    const base = `ipfs://${CID}/metadata`;
    return {
      uri0: `${base}/0.json`,
      uri1: `${base}/1.json`,
      uri2: `${base}/2.json`,
      uri3: `${base}/3.json`,
      uri4: `${base}/4.json`,
      uri5: `${base}/5.json`,
      uri6: `${base}/6.json`,
      uri7: `${base}/7.json`,
      uri8: `${base}/8.json`,
      uri9: `${base}/9.json`,
    };
  }, []);

  const onMint = async () => {
    try {
      setLoading(true);

      // (optional) guard: make sure wallet is on TESTNET for your test contract
      const chain = (tonConnectUI as any)?.account?.chain; // 'mainnet' | 'testnet'
      if (chain !== "testnet") {
        alert("Please switch your wallet to TESTNET for this collection.");
        return;
      }

      // Ask backend for payload + suggested amount
      const resp = await fetch("/api/mintpack-browser", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ collection: COLLECTION_ADDRESS, uris }),
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data?.error || "Failed to create payload");

      // 🔒 Ensure at least 5.6 TON (in nanotons)
      const MIN_56 = 5_600_000_000n; // 5.6 TON
      const amountNano = (() => {
        try {
          const v = BigInt(data.amountNano ?? "0");
          return (v < MIN_56 ? MIN_56 : v).toString();
        } catch {
          return MIN_56.toString();
        }
      })();

      await tonConnectUI.sendTransaction({
        validUntil: Math.floor(Date.now() / 1000) + 300,
        messages: [
          {
            address: COLLECTION_ADDRESS,
            amount: amountNano,
            payload: data.payloadBase64, // base64 BOC from your API
          },
        ],
      });

      alert("Mint submitted! Check the testnet explorer for confirmation.");
    } catch (e: any) {
      console.error(e);
      alert(e?.message || "Mint failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button className="bg-red-500" onClick={onMint} disabled={loading} style={{ padding: 12, borderRadius: 12 }}>
      {loading ? "Minting..." : "Mint 10 (5 TON)"}
    </button>
  );
}

export default function MintBrowserPage() {
  return (
    <TonConnectUIProvider manifestUrl={MANIFEST_URL}>
      <main className="font-[family-name:var(--font-hogfish)]" style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", gap: 16, justifyContent: "center" }}>
        <p className="text-black" style={{ fontSize: 22, fontWeight: 800 }}>Mingles Tequila — At TON</p>
        <Image src={worm} alt="Mingles-TON" width={250} height={250} />
        <TonConnectButton />
        <MintButton />
        <p className="text-black" style={{ opacity: 0.7, fontSize: 13 }}>Each purchase mints a 10-sticker pack. Price: 5 TON.</p>
      </main>
    </TonConnectUIProvider>
  );
}