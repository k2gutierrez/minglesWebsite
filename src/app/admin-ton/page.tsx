"use client";

import { TonConnectUIProvider, TonConnectButton, useTonConnectUI } from "@tonconnect/ui-react";
import { beginCell } from "@ton/core";
// import your wrapper encoder:
import { storeSetSaleActive } from "@/server/wrappers/StickerCollection";
import { useState } from "react";

const MANIFEST_URL = "https://mingles.wtf/tonconnect-manifest.json";
// ⬇️ put your deployed StickerCollection address here (same network as your wallet)
const COLLECTION_ADDRESS = "EQDo1a0B_JYrH2mXLgae8E1yRi3SGiSCGiKUxgt3rH4Y4xgr";

function AdminButtons() {
  const [tonConnectUI] = useTonConnectUI();
  const [loading, setLoading] = useState(false);

  const sendSale = async (active: boolean) => {
    try {
      setLoading(true);

      // Build payload for SetSaleActive
      const msg = { $$type: "SetSaleActive", active } as const;
      const payloadCell = beginCell().store(storeSetSaleActive(msg)).endCell();
      const payloadBase64 = payloadCell.toBoc({ idx: false }).toString("base64");

      // Small amount to cover fees (no state changes on collection except flag)
      // 0.02 TON is typically enough; bump if needed.
      const amountNano = (20_000_000n).toString();

      await tonConnectUI.sendTransaction({
        validUntil: Math.floor(Date.now() / 1000) + 300,
        messages: [
          {
            address: COLLECTION_ADDRESS,
            amount: amountNano,
            payload: payloadBase64,
          },
        ],
      });

      alert(active ? "Sale turned ON ✅" : "Sale turned OFF ⛔");
    } catch (e: any) {
      console.error(e);
      alert(e?.message || "Transaction failed / rejected");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "grid", gap: 12 }}>
      <button className="border border-solid bg-green-600 text-white" disabled={loading} onClick={() => sendSale(true)} style={{ padding: 12, borderRadius: 10 }}>
        {loading ? "Sending..." : "Enable Sale (ON)"}
      </button>
      <button className="border border-solid bg-red-600 text-white" disabled={loading} onClick={() => sendSale(false)} style={{ padding: 12, borderRadius: 10 }}>
        {loading ? "Sending..." : "Disable Sale (OFF)"}
      </button>
    </div>
  );
}

export default function AdminSalePage() {
  return (
    <TonConnectUIProvider manifestUrl={MANIFEST_URL}>
      <main className="text-black" style={{ minHeight: "70vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16 }}>
        <p className="text-lg">Mingles Tequila — Admin Sale Switch</p>
        <TonConnectButton />
        <AdminButtons />
        <p style={{ opacity: 0.7, fontSize: 12 }}>
          Must be sent from the <b>owner</b> wallet of the collection.
        </p>
      </main>
    </TonConnectUIProvider>
  );
}