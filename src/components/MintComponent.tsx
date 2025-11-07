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

/////////// Modal
// --- Types (for TypeScript) ---
// We define the props for our Modal component
type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
};

// --- Modal Component ---
// This is the reusable modal component
const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  // If the modal is not open, return null to render nothing
  if (!isOpen) {
    return null;
  }

  // This function handles the backdrop click
  // It calls onClose, but stops the event from bubbling
  // up to the modal content's wrapper.
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // We check if the click is on the backdrop itself, not on the modal content
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    // Main modal overlay
    // 'fixed': Positions relative to the viewport
    // 'inset-0': Covers the entire screen (top/right/bottom/left = 0)
    // 'z-50': Sits on top of other content
    // 'flex items-center justify-center': Centers the modal content
    // 'bg-black/60': Semi-transparent black background
    // 'backdrop-blur-sm': Adds a blur effect to the content behind
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      {/* Modal Content Container */}
      {/* 'relative': For positioning the close button
        'bg-white': White background
        'rounded-lg': Rounded corners
        'shadow-2xl': Strong drop shadow
        'p-6': Padding inside the modal
        
        Responsiveness:
        'w-11/12': Mobile-first (91% width)
        'md:w-3/4': Medium screens (75% width)
        'lg:w-1/2': Large screens (50% width)
        'max-w-2xl': Sets a maximum width for very large screens
      */}
      <div
        className="relative w-11/12 max-w-2xl rounded-lg bg-white p-6 shadow-2xl md:w-3/4 lg:w-1/2"
        // This stops a click inside the modal from bubbling up
        // to the backdrop and closing the modal.
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 transition-colors hover:text-gray-800"
          aria-label="Close modal"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="h-6 w-6"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Modal Title (optional) */}
        {title && (
          <h2 className="mb-4 text-2xl font-semibold text-gray-900">{title}</h2>
        )}

        {/* Modal Body (children) */}
        <div className="text-gray-700">{children}</div>

        {/* Modal Footer (example) */}
        <div className="mt-6 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="rounded-lg bg-gray-200 px-4 py-2 text-sm font-medium text-gray-800 transition-colors hover:bg-gray-300"
          >
            Close
          </button>
          {/* <button
            onClick={onClose} // You would likely have a different action here
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
          >
            Confirm
          </button> */}
        </div>
      </div>
    </div>
  );
};

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
  const [isModalOpen, setIsModalOpen] = useState(false);

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
    setIsModalOpen(true)                 /////////////////////////////////////
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
      setTimeout(() => {
        setIsModalOpen(true);
      }, 1500);
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

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  // ===================================================================
  // 🚀 4. THE RESPONSIVE JSX (FIXED)
  // ===================================================================
  return (
    // We keep this container. It's a great mobile-first frame.
    <div className="w-full max-w-md mx-auto h-screen sm:h-auto flex-col justify-start p-6 text-black">

      <Modal 
        isOpen={isModalOpen} 
        onClose={closeModal} 
        title="Welcome!"
      > 
        <Image src={"/Mingles267.png"} alt='Ape 267' className='' width={120} height={120} />
        <p className='md:text-lg text-base mt-5 font-[family-name:var(--font-vietnamItalic)]'>
          "Welcome to the 900+ holders Tequila Club - and thanks for minting."
        </p>
        <p className="mt-4 md:text-lg text-base modal-margin font-[family-name:var(--font-vietnamItalic)]">
          -<span className='text-blue-400 font-[family-name:var(--font-vietnamMedium)]'>MBAMemo</span>
        </p>

        <a
          href={STICKER_PACK_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-5 rounded-lg text-base md:text-lg text-center font-[family-name:var(--font-vietnamMedium)]"
        >
          Add Sticker Pack
        </a>
      </Modal>

      {/* --- Title --- */}
      <div className='flex items-center'>
        <p className="flex items-center text-lg md:text-2xl font-bold text-black text-center font-[family-name:var(--font-vietnamMedium)]">
          Mingles Tequila
          <Image src={"/Verified.png"} alt='Mingles Verified' className='ps-1' width={20} height={20} />
        </p>
        
      </div>
      <p className="text-xs md:text-sm font-bold text-gray-300 mb-2 text-center text-pad font-[family-name:var(--font-vietnamItalic)]">By <Link href={"https://www.mingles.wtf"}><span className='text-xs font-bold text-blue-400 font-[family-name:var(--font-vietnamItalic)]'>Mingles</span></Link></p>

      <p className="flex items-center text-base md:text-xl text-black text-center font-[family-name:var(--font-vietnamLight)]">
        The 1st tequila-inspired collectible stickers on TON
      </p>

      {/* Align to left */}
      <div id='divToAlignToLeft' className='w-full flex justify-normal space-x-2 mb-1 font-[family-name:var(--font-vietnamLight)]'>
        <div className="text-xs md:text-sm font-bold bg-indigo-100 text-indigo-500 bg-gray-100 rounded-full px-1">NFT</div>
        <div className="text-xs md:text-sm font-bold text-gray-500 bg-gray-100 rounded-full px-1">1,111 SUPPLY</div>
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