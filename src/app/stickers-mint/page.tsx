"use client";

import React, { useEffect, useMemo, useState } from "react";
import { TonConnectUIProvider, TonConnectButton, useTonConnectUI } from "@tonconnect/ui-react";

const COLLECTION_ADDRESS = "EQDo1a0B_JYrH2mXLgae8E1yRi3SGiSCGiKUxgt3rH4Y4xgr";
const CID = "bafybeiejti2pggxqo5r2guonr5fz2gddkavhxxlmmkhyqzllnzk62meury";
const MANIFEST_URL = "/tonconnect-manifest.json";

declare global {
  interface Window { Telegram?: any; }
}

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

  // Ajustes de la WebApp (tema, expand) al cargar dentro de Telegram
  useEffect(() => {
    const tg = window.Telegram?.WebApp;
    if (tg) {
      try {
        tg.ready();
        tg.expand(); // pantalla completa
        // Opcional: usar tg.themeParams para adaptar estilos
      } catch { }
    }
  }, []);

  const onMint = async () => {
    try {
      setLoading(true);

      // Pide al server el payload (body) y el monto total (5 TON + buffer)
      // 🔹 Lee el initData que Telegram inyecta dentro de su WebApp
      const initData = (window as any)?.Telegram?.WebApp?.initData || "";

      // 🔹 Envía initData junto con los demás datos al backend
      const resp = await fetch("/api/mintpack", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ collection: COLLECTION_ADDRESS, uris, initData }),
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data?.error || "No se pudo generar el payload");

      // Enviar la tx al contrato de colección
      await tonConnectUI.sendTransaction({
        validUntil: Math.floor(Date.now() / 1000) + 300,
        messages: [
          {
            address: COLLECTION_ADDRESS,
            amount: data.amountNano,     // 5 TON + buffer en nanotons
            payload: data.payloadBase64, // cuerpo MintPack (10 URIs)
          },
        ],
      });

      alert("¡Mint enviado! Revisa el explorer para confirmar.");
    } catch (e: any) {
      console.error(e);
      alert(e?.message || "Mint falló");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={onMint}
      disabled={loading}
      style={{ padding: "12px 18px", borderRadius: 12, boxShadow: "0 4px 16px rgba(0,0,0,.1)" }}
    >
      {loading ? "Minting..." : "Mint 10 (5 TON)"}
    </button>
  );
}

export default function TgMintPage() {
  return (
    <TonConnectUIProvider manifestUrl={MANIFEST_URL}>
      <main style={{ minHeight: "100vh", display: "flex", flexDirection: "column", gap: 16, alignItems: "center", justifyContent: "center" }}>
        <h1 style={{ fontSize: 22, fontWeight: 800 }}>Mingles Tequila — Mint en Telegram</h1>
        <TonConnectButton />
        <MintButton />
        <p style={{ opacity: 0.7, fontSize: 12, textAlign: "center", maxWidth: 320 }}>
          Cada compra mintea 10 stickers (pack). Max supply: 1100 packs.
        </p>
      </main>
    </TonConnectUIProvider>
  );
}