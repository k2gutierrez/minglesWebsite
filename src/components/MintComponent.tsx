'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import Image from 'next/image'; // 1. We will keep using the Next.js Image component
import {
  TonConnectButton,
  useTonConnectUI,
  useTonWallet,
  CHAIN
} from "@tonconnect/ui-react";
import { Address, toNano, beginCell } from "@ton/core";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/swiper-bundle.css'

// ===================================================================
// 🚀 YOUR STICKER DATA (This is great)
// ===================================================================

const stickerData = [
  // ... (your sticker data is perfect) ...
  {
    id: 0,
    name: "Cheers",
    staticUrl: "ipfs://bafybeiejspbpjcpgtqfaoap6wya5izqgcyn5yvecusauus35ngayc5dixa/Cheers.png",
    animatedUrl: "/mingle-gifs/1.gif"
  },
  {
    id: 1,
    name: "Lol",
    staticUrl: "ipfs://bafybeiejspbpjcpgtqfaoap6wya5izqgcyn5yvecusauus35ngayc5dixa/Lol.png",
    animatedUrl: "/mingle-gifs/2.gif"
  },
  {
    id: 2,
    name: "Disco",
    staticUrl: "ipfs://bafybeiejspbpjcpgtqfaoap6wya5izqgcyn5yvecusauus35ngayc5dixa/Disco.png",
    animatedUrl: "/mingle-gifs/3.gif"
  },
  {
    id: 3,
    name: "Good Morning",
    staticUrl: "ipfs://bafybeiejspbpjcpgtqfaoap6wya5izqgcyn5yvecusauus35ngayc5dixa/GM.png",
    animatedUrl: "/mingle-gifs/4.gif"
  },
  {
    id: 4,
    name: "Good Night",
    staticUrl: "ipfs://bafybeiejspbpjcpgtqfaoap6wya5izqgcyn5yvecusauus35ngayc5dixa/GN.png",
    animatedUrl: "/mingle-gifs/5.gif"
  },
  {
    id: 5,
    name: "Love Tequila",
    staticUrl: "ipfs://bafybeiejspbpjcpgtqfaoap6wya5izqgcyn5yvecusauus35ngayc5dixa/LoveTequila.png",
    animatedUrl: "/mingle-gifs/6.gif"
  },
  {
    id: 6,
    name: "Kiss",
    staticUrl: "ipfs://bafybeiejspbpjcpgtqfaoap6wya5izqgcyn5yvecusauus35ngayc5dixa/Kiss.png",
    animatedUrl: "/mingle-gifs/7.gif"
  },
  {
    id: 7,
    name: "Puke",
    staticUrl: "ipfs://bafybeiejspbpjcpgtqfaoap6wya5izqgcyn5yvecusauus35ngayc5dixa/Puke.png",
    animatedUrl: "/mingle-gifs/8.gif"
  },
  {
    id: 8,
    name: "Dizzy",
    staticUrl: "ipfs://bafybeiejspbpjcpgtqfaoap6wya5izqgcyn5yvecusauus35ngayc5dixa/Dizzy.png",
    animatedUrl: "/mingle-gifs/9.gif"
  },
  {
    id: 9,
    name: "Thanks",
    staticUrl: "ipfs://bafybeiejspbpjcpgtqfaoap6wya5izqgcyn5yvecusauus35ngayc5dixa/Thanks.png",
    animatedUrl: "/mingle-gifs/10.gif"
  },
];

// 🚀 FIX 1: Using a faster, more reliable IPFS gateway
function formatIpfsUrl(ipfsUrl: string): string {
  if (!ipfsUrl || !ipfsUrl.startsWith('ipfs://')) {
    return ipfsUrl;
  }
  const cid = ipfsUrl.substring(7);
  // This gateway is built for high-demand content
  return `https://ipfs.io/ipfs/${cid}`;
}

// ===================================================================
// 🚀 YOUR CONTRACT INFO (This is great)
// ===================================================================
const collectionAddress = Address.parse(
  'EQAu_V5yikzOB8S_V-mSrt0A48VPi5uQZMT1iAsj-myyQ_EZ' // 👈 Your contract address
);
const STICKER_PACK_URL = 'https://t.me/addstickers/MinglesTequila'; // 👈 Your sticker pack link

// --- Contract Constants ---
const MINT_PACK_OP_CODE = 0x1;
const TESTNET_MINT_PRICE = toNano('1.4');
const MAINNET_MINT_PRICE = toNano('6.1');


export function MintComponent() {
  const [tonConnectUI] = useTonConnectUI();
  const wallet = useTonWallet();
  const [selectedSticker, setSelectedSticker] = useState(stickerData[7]);
  const [isLoading, setIsLoading] = useState(false);
  const [isHolder, setIsHolder] = useState(false);

  // --- Holder Checking Logic (Unchanged) ---
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

  // --- Mint Logic (Unchanged) ---
  const handleMint = async () => {
    // ... (your mint logic is perfect) ...
    if (!wallet) return;
    const isTestnet = wallet.account.chain === CHAIN.TESTNET;
    const mintPrice = isTestnet ? TESTNET_MINT_PRICE : MAINNET_MINT_PRICE;
    const payload = beginCell().storeUint(MINT_PACK_OP_CODE, 32).endCell();
    const transaction = {
      validUntil: Math.floor(Date.now() / 1000) + 600,
      messages: [{
        address: collectionAddress.toString(),
        amount: mintPrice.toString(),
        payload: payload.toBoc().toString("base64"),
      }],
    };
    try {
      await tonConnectUI.sendTransaction(transaction);
      alert("Mint transaction sent! Check your wallet.");
    } catch (error) {
      console.error("Mint failed:", error);
      alert("Mint failed. See console for details.");
    }
  };

  // --- Button Render Logic (Unchanged) ---
  const renderContent = () => {
    // ... (your render logic is perfect) ...
    if (isLoading) return <div className="text-gray-500">Checking wallet...</div>;
    if (isHolder) {
      return (
        <a
          href={STICKER_PACK_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg text-lg w-full text-center"
        >
          Add Sticker Pack
        </a>
      );
    }
    if (wallet) {
      return (
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg text-lg w-full"
          onClick={handleMint}
        >
          Mint 10-Pack
        </button>
      );
    }
    return <p className="text-gray-500 text-center">Connect your wallet to mint.</p>;
  };

  // ===================================================================
  // 🚀 4. THE RESPONSIVE JSX (FIXED)
  // ===================================================================
  return (
    // We keep this container. It's a great mobile-first frame.
    <div className="w-full max-w-md mx-auto h-screen sm:h-auto flex-col justify-start p-6 text-black">
      {/* --- Title --- */}
      <div className='flex flex-col items-center'>
        <p className="flex items-center text-lg md:text-2xl font-bold text-black text-center">
          Mingles Tequila
          <Image src={"/Verified.png"} alt='Mingles Verified' className='ps-1' width={20} height={20} />
        </p>
        <p className="text-xs md:text-sm font-bold text-gray-300 mb-2 text-center text-pad">By <Link href={"https://www.mingles.wtf"}><span className='text-xs font-bold text-blue-400'>Mingles</span></Link></p>
      </div>

      {/* Align to left */}
      <div id='divToAlignToLeft' className='w-full flex justify-normal space-x-2 mb-1'>
        <div className="text-xs md:text-sm font-bold text-indigo-400 bg-gray-100 rounded-full px-1">NFT</div>
        <div className="text-xs md:text-sm font-bold text-gray-400 bg-gray-100 rounded-full px-1">1,111 SUPPLY</div>
      </div>


      {/* --- Big Image Display (FIXED) --- */}
      <div className="relative w-full aspect-square border border-solid bg-gray-100 rounded-3xl  border-transparent mb-4">
        {/* 🚀 FIX 2: Use `fill` and `object-fit` to make the Image
            responsive. This ignores `height` and `width` and
            makes the image fill its parent container.
            We also add `unoptimized` which is critical for GIFs.
        */}
        <Image
          key={selectedSticker.id} // Forces re-render on change
          src={selectedSticker.animatedUrl}
          alt={selectedSticker.name}
          fill={true}
          objectFit="contain" // 'contain' fits the whole GIF
          unoptimized={true} // 'unoptimized' ensures the GIF animates
        />
      </div>


      {/* The spacer divs are now gone */}

      <Swiper
        modules={[Navigation, Pagination]}
        spaceBetween={3}
        slidesPerView={4}
        breakpoints={{
          640: {
            slidesPerView: 4,
          },
          1024: {
            slidesPerView: 4,
          },
        }}
        navigation={false}
        pagination={true}

        className="mySwiper w-full mb-8"
      >
        {
          stickerData.map((data, index) => (

            <SwiperSlide className="cursor-pointer " key={index} onClick={() => setSelectedSticker(data)}>

              <div
                key={data.id}
                className="flex-shrink-0 cursor-pointer snap-start"
              >
                <Image
                  src={formatIpfsUrl(data.staticUrl)}
                  alt={data.name}
                  width={200}
                  height={200}
                  className={`
                      bg-gray-100
                w-16 h-16 sm:w-20 sm:h-20
                object-cover rounded-lg border-2 
                ${selectedSticker.id === data.id
                      ? 'border-blue-500'
                      : 'border-gray-100'
                    }
                hover:border-blue-300 transition-all`}
                />
              </div>


            </SwiperSlide>
          ))}
      </Swiper>

      <p className="flex items-center text-base md:text-xl text-black text-center">
        The 1st tequila-inspired collectible stickers on TON
      </p>


      {/* The spacer divs are now gone */}


      {/* --- Connect Button --- */}
      <div className="w-full flex justify-end mb-6">
        <TonConnectButton />
      </div>

      {/* --- Mint/Holder Button Area (Sticks to bottom on mobile) --- */}
      <div className="w-full mt-auto">
        {renderContent()}
      </div>

      {/* --- CSS to hide scrollbar (optional, but clean) --- */}
      <style jsx>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}