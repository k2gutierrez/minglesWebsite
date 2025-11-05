'use client';

// 1. 🚀 IMPORT 'CHAIN' HERE
import { useState, useEffect } from 'react';
import { 
  TonConnectButton, 
  useTonConnectUI, 
  useTonWallet,
  CHAIN // 👈 Add this import
} from "@tonconnect/ui-react";
import { Address, toNano, beginCell } from "@ton/core";

// 2. 🚀 UPDATE THESE VALUES 🚀
const collectionAddress = Address.parse(
  'EQCovn_ej_iywA64Lzlvkr4Ur3RaZNfx3RdqWzcBN5yTsggM' // 👈 Your latest contract address
);
const STICKER_PACK_URL = 'https://t.me/addstickers/MinglesTequila'; // 👈 Your sticker pack link

// --- Contract Constants ---
const MINT_PACK_OP_CODE = 0x1;
const TESTNET_MINT_PRICE = toNano('1.15'); // 0.5 (price) + 1.0 (gas) + 0.05 (buffer)
const MAINNET_MINT_PRICE = toNano('6.05'); // 5.0 (price) + 1.0 (gas) + 0.05 (buffer)


export function MintComponent() {
  const [tonConnectUI] = useTonConnectUI();
  const wallet = useTonWallet();

  const [isLoading, setIsLoading] = useState(false);
  const [isHolder, setIsHolder] = useState(false);

  useEffect(() => {
    
    async function checkHolderStatus() {
      if (!wallet) {
        setIsHolder(false);
        return;
      }

      setIsLoading(true);
      try {
        const userAddress = Address.parse(wallet.account.address).toString();
        const collectionAddr = collectionAddress.toString();

        //
        // 🚀 2. FIX THE API URL CHECK
        //
        const isTestnet = wallet.account.chain === CHAIN.TESTNET;
        const apiUrl = isTestnet ? 'https://testnet.tonapi.io' : 'https://tonapi.io';

        const response = await fetch(
          `${apiUrl}/v2/accounts/${userAddress}/nfts?collection=${collectionAddr}&limit=1`
        );
        const data = await response.json();

        if (data.nft_items && data.nft_items.length > 0) {
          setIsHolder(true);
        } else {
          setIsHolder(false);
        }
      } catch (error) {
        console.error("Failed to check holder status:", error);
        setIsHolder(false);
      } finally {
        setIsLoading(false);
      }
    }

    checkHolderStatus();

  }, [wallet]);

  const handleMint = async () => {
    if (!wallet) return;

    //
    // 🚀 3. FIX THE MINT PRICE CHECK (This was your error)
    //
    const isTestnet = wallet.account.chain === CHAIN.TESTNET;
    const mintPrice = isTestnet ? TESTNET_MINT_PRICE : MAINNET_MINT_PRICE;

    const payload = beginCell()
      .storeUint(MINT_PACK_OP_CODE, 32)
      .endCell();

    const transaction = {
      validUntil: Math.floor(Date.now() / 1000) + 600,
      messages: [
        {
          address: collectionAddress.toString(),
          amount: mintPrice.toString(),
          payload: payload.toBoc().toString("base64"),
        },
      ],
    };

    try {
      await tonConnectUI.sendTransaction(transaction);
      alert("Mint transaction sent! Check your wallet.");
    } catch (error) {
      console.error("Mint failed:", error);
      alert("Mint failed. See console for details.");
    }
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="text-white">
          Checking your wallet for NFTs...
        </div>
      );
    }

    if (isHolder) {
      return (
        <div className="flex flex-col items-center gap-4 text-center">
          <p className="text-2xl font-bold text-green-400">✅ Welcome, Holder!</p>
          <p className="text-gray-300">Here is your exclusive access to the TGS sticker pack.</p>
          <a
            href={STICKER_PACK_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg text-lg"
          >
            Add Sticker Pack to Telegram
          </a>
        </div>
      );
    }

    if (wallet) {
      return (
        <div className="flex flex-col items-center gap-4">
          <p className="text-gray-300">You don't own a sticker NFT yet. Mint a pack to get access!</p>
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg text-lg"
            onClick={handleMint}
          >
            Mint 10-Pack
          </button>
        </div>
      );
    }

    return <p className="text-gray-400">Connect your wallet to begin.</p>;
  };

  return (
    <div className="flex flex-col items-center gap-6 p-8 bg-gray-900 rounded-lg shadow-xl">
      <p className="text-3xl font-bold text-white">Mingles Tequila Stickers</p>
      
      <TonConnectButton />

      <div className="mt-4">
        {renderContent()}
      </div>
    </div>
  );
}