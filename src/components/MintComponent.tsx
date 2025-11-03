'use client';

import { 
  TonConnectButton, 
  useTonConnectUI, 
  useTonWallet 
} from "@tonconnect/ui-react";
import { Address, toNano, beginCell } from "@ton/core";

// Your contract address
const collectionAddress = Address.parse(
  'EQBRF_OcMEnJQ1ub72csljBIRav6-cKgPZ6K9CBG8JISf1C6'
  //'kQBRF_OcMEnJQ1ub72csljBIRav6-cKgPZ6K9CBG8JISf-sw'
);

// Your mint op-code (from the contract)
const MINT_PACK_OP_CODE = 0x1;

// Testnet mint price (0.1 for pack + 0.55 for gas)
const MINT_PRICE = toNano('0.75');

export function MintComponent() {
  const [tonConnectUI] = useTonConnectUI();
  const wallet = useTonWallet();

  const handleMint = async () => {
    if (!wallet) {
      alert("Please connect your wallet first.");
      return;
    }

    // 1. Build the message payload (the op-code)
    // This creates a cell with 'storeUint(1, 32)'
    const payload = beginCell()
      .storeUint(MINT_PACK_OP_CODE, 32)
      .endCell();

    // 2. Define the transaction
    const transaction = {
      validUntil: Math.floor(Date.now() / 1000) + 600, // 10 minutes
      messages: [
        {
          address: collectionAddress.toString(),
          amount: MINT_PRICE.toString(),
          payload: payload.toBoc().toString("base64"), // Body as base64
        },
      ],
    };

    try {
      // 3. Send the transaction
      const result = await tonConnectUI.sendTransaction(transaction);
      alert("Transaction sent! Check your wallet.");
      
      // You can check the transaction BOC in result.boc
      // and monitor its status

    } catch (error) {
      console.error("Mint failed:", error);
      alert("Mint failed. See console for details.");
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 p-8">
      <g className="text-2xl text-black font-bold">Mint Your TGS Pack</g>
      <p className="text-black">Mint a pack of 10 stickers for 0.1 TON (Testnet).</p>
      
      {/* 1. The Connect Button */}
      <TonConnectButton />

      {/* 2. The Mint Button */}
      {wallet && (
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          onClick={handleMint}
        >
          Mint 10-Pack
        </button>
      )}
    </div>
  );
}