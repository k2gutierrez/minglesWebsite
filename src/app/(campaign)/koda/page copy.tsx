'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useWriteContract } from 'wagmi';
import React, { useState, useEffect, ReactNode } from 'react';
import {
    Ticket, Info, X, ShieldCheck, RefreshCw, Zap, Flame, Wallet, CheckCircle, ChevronRight, ChevronLeft, AlertCircle, Clock, ExternalLink
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// --- TYPES (MODALS) ---
type ModalType = 'stickers' | 'feels' | 'koda' | 'incentives' | null;

// --- CONFIG & ASSETS ---
const stats = {
    totalTickets: 1000,
    soldTickets: 50,
    activationThreshold: 264,
    ticketPriceApe: 75,
};

// NOMBRES DE ARCHIVO EXACTOS SEGÚN TU SOLICITUD
const ASSETS = {
    logo: "/images/MLogo.png",
    stickerCover: "/mingle-gifs/1.gif",
    feelsPackPreview: "/images/FeelsPack.png",
    feelsModalCircle: "/images/FeelShowcase.png",
    kodaCardImage: "/images/koda.png",
    kodaVideo: "/KodaShowcase.mov", // <--- NUEVO VIDEO AQUÍ
    openSeaLogo: "/images/OpenSeaLogo.png",
    gifArray: Array.from({ length: 10 }, (_, i) => `/mingle-gifs/${i + 1}.gif`),
};

export default function MinglesRaffle() {

    const { address, isConnected } = useAccount();

    // --- STATES ---
    const [activeModal, setActiveModal] = useState<ModalType>(null);
    const [tonAddress, setTonAddress] = useState<string>('');
    // const [isConnected, setIsConnected] = useState<boolean>(false);
    const [isScanning, setIsScanning] = useState<boolean>(false);
    const [minglesHeld, setMinglesHeld] = useState<number>(0);

    // --- PHASE LOGIC ---
    const PHASE_1_CAP = 100;
    const PHASE_2_CAP = 200;
    let currentPhase = 0;
    let bonusRemaining = 0;
    let phaseTitle = "";

    if (stats.soldTickets < PHASE_1_CAP) {
        currentPhase = 1;
        bonusRemaining = PHASE_1_CAP - stats.soldTickets;
        phaseTitle = "PHASE 1: HOLDER MATCH";
    } else if (stats.soldTickets < PHASE_2_CAP) {
        currentPhase = 2;
        bonusRemaining = PHASE_2_CAP - stats.soldTickets;
        phaseTitle = "PHASE 2: 3-FOR-2 DEAL";
    } else {
        currentPhase = 3;
        bonusRemaining = 0;
        phaseTitle = "INCENTIVES DEPLETED";
    }

    // --- HANDLERS ---
    const handleConnect = () => {
        setIsScanning(true);
        setTimeout(() => {
            setMinglesHeld(5); // MOCK DATA
            setIsScanning(false);
        }, 1500);
    };

    const openModal = (type: ModalType) => setActiveModal(type);
    const closeModal = () => setActiveModal(null);

    return (
        <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans selection:bg-blue-200">

            {/* NAVBAR */}
            <nav className="sticky top-0 z-40 bg-[#F8FAFC]/90 backdrop-blur-md border-b border-slate-200">
                <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <img src={ASSETS.logo} alt="Mingles Logo" className="w-10 h-10 rounded-xl shadow-sm" />
                        <div className="font-extrabold text-xl tracking-tight">
                            Mingles Koda Raffle
                        </div>
                    </div>

                    {!isConnected ? (
                        <button
                            onClick={handleConnect}
                            disabled={isScanning}
                            className="bg-slate-900 text-white px-5 py-2 rounded-xl text-sm font-bold shadow-lg hover:bg-slate-800 transition flex items-center gap-2 disabled:opacity-70"
                        >
                            {isScanning ? (
                                <><RefreshCw className="w-4 h-4 animate-spin" /> Scanning...</>
                            ) : (
                                <><Wallet className="w-4 h-4" />Not Connected</>
                            )}
                        </button>
                    ) : (
                        <div className="flex items-center gap-2 bg-white border border-slate-200 px-4 py-2 rounded-xl shadow-sm">
                            <div className="w-2 h-2 rounded-full bg-green-500"></div>
                            <span className="text-sm font-bold text-slate-700">{address ? address : "No Wallet" }</span>
                            <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-0.5 rounded ml-2">
                                {minglesHeld} Mingles
                            </span>
                        </div>
                    )}
                </div>
            </nav>

            <main className="max-w-7xl mx-auto px-4 py-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">

                {/* === LEFT COL: MINT MACHINE === */}
                <div className="lg:col-span-5 order-2 lg:order-1 lg:sticky lg:top-24">

                    {/* === DYNAMIC PHASE PANEL === */}
                    <div className="mb-6 relative group overflow-hidden rounded-2xl shadow-xl transition-all duration-500">
                        <div className={`absolute inset-0 opacity-10 ${currentPhase === 1 ? 'bg-yellow-500' : currentPhase === 2 ? 'bg-blue-500' : 'bg-slate-500'}`}></div>
                        <div className={`bg-white border-2 p-5 relative z-10 ${currentPhase === 1 ? 'border-yellow-400' : currentPhase === 2 ? 'border-blue-400' : 'border-slate-200'}`}>
                            <div className="flex justify-between items-start mb-3">
                                <div>
                                    <h3 className={`font-black text-lg flex items-center gap-2 ${currentPhase === 1 ? 'text-yellow-600' : currentPhase === 2 ? 'text-blue-600' : 'text-slate-500'}`}>
                                        {currentPhase === 1 && <Flame className="w-5 h-5 fill-yellow-500" />}
                                        {currentPhase === 2 && <Zap className="w-5 h-5 fill-blue-500" />}
                                        {currentPhase === 3 && <X className="w-5 h-5" />}
                                        {phaseTitle}
                                    </h3>
                                    <p className="text-xs text-slate-500 font-medium">
                                        {currentPhase === 1 && "Exclusive: Buy 1 Get 1 Free (Holders Only)"}
                                        {currentPhase === 2 && "Public Deal: Buy 2 Tickets, Get 3 Entries"}
                                        {currentPhase === 3 && "Standard Sale. No extra entries."}
                                    </p>
                                </div>
                                {currentPhase < 3 && (
                                    <div className="text-right">
                                        <span className="block text-2xl font-black text-slate-800">{bonusRemaining}/100</span>
                                        <span className="text-[10px] font-bold text-slate-400 uppercase">Available</span>
                                    </div>
                                )}
                            </div>
                            {currentPhase < 3 ? (
                                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mb-3">
                                    <div className={`h-full transition-all duration-1000 ${currentPhase === 1 ? 'bg-yellow-400' : 'bg-blue-400'}`} style={{ width: `${(bonusRemaining / 100) * 100}%` }}></div>
                                </div>
                            ) : (
                                <div className="w-full bg-slate-100 h-2 rounded-full mb-3 flex items-center justify-center"><span className="text-[10px] text-slate-400 font-bold uppercase">Sold Out</span></div>
                            )}
                            <button onClick={() => openModal('incentives')} className="w-full text-center text-xs font-bold underline decoration-dotted text-slate-500 hover:text-slate-800">
                                View Incentive Rules & Details
                            </button>
                        </div>
                    </div>

                    {/* === MAIN MINT BOX === */}
                    <div className="bg-white rounded-[2rem] p-6 shadow-2xl border border-slate-100 relative">
                        <div className="mb-6">
                            <h1 className="text-3xl font-black text-slate-900 leading-none mb-2">Mint Ticket</h1>
                            <p className="text-sm text-slate-500 font-medium">Supply: {stats.soldTickets} / {stats.totalTickets}</p>

                            <div className="mt-3 inline-flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
                                <Clock className="w-4 h-4 text-slate-500" />
                                <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                                    Next Draw: <span className="text-blue-600">Feb 3, 2026 @ 8PM EST</span>
                                </span>
                            </div>
                        </div>

                        <MintMachineUI
                            stats={stats}
                            tonAddress={tonAddress}
                            setTonAddress={setTonAddress}
                            currentPhase={currentPhase}
                            isConnected={isConnected}
                            minglesHeld={minglesHeld}
                            handleConnect={handleConnect}
                        />

                        <div className="mt-6 pt-4 border-t border-slate-100 flex gap-3 opacity-80">
                            <ShieldCheck className="w-5 h-5 text-green-500 shrink-0" />
                            <p className="text-[10px] text-slate-500 leading-relaxed">
                                <strong>Treasury Protection:</strong> If an unsold ticket wins, the raffle repeats after 5 days until a real participant wins. <br />
                                Min. Sale: {stats.activationThreshold} tickets.
                            </p>
                        </div>
                    </div>
                </div>

                {/* === RIGHT COL: REWARDS & INFO === */}
                <div className="lg:col-span-7 order-1 lg:order-2">

                    <div className="mb-12">
                        <h1 className="text-5xl md:text-6xl font-black text-slate-900 mb-6 tracking-tight leading-[0.95]">
                            One Mint. <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Three Rewards.</span>
                        </h1>
                        <p className="text-lg text-slate-600 max-w-xl leading-relaxed">
                            Participate in the Mingles x Otherside experimental raffle.
                            Mint a Soulbound Ticket to unlock guaranteed assets and a shot at the Jackpot.
                        </p>
                    </div>

                    {/* === REWARDS GRID === */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
                        <RewardCard
                            title="Mingles TON Pack"
                            subtitle="TON Stickers Airdrop"
                            icon="🪱"
                            image={ASSETS.stickerCover}
                            onClick={() => openModal('stickers')}
                        />
                        <RewardCard
                            title="Otherside Feels Pack"
                            subtitle="Future Airdrop"
                            icon="👽"
                            image={ASSETS.feelsPackPreview}
                            onClick={() => openModal('feels')}
                        />
                        <div
                            onClick={() => openModal('koda')}
                            className="group cursor-pointer bg-slate-900 text-white rounded-2xl p-4 shadow-xl hover:-translate-y-1 transition relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 w-24 h-24 bg-yellow-500 blur-[40px] opacity-20 group-hover:opacity-40 transition"></div>
                            <div className="flex justify-between items-center mb-4 relative z-10">
                                <span className="text-2xl">🦍</span>
                                <span className="text-[10px] font-bold bg-yellow-400 text-black px-2 py-0.5 rounded">JACKPOT</span>
                            </div>
                            <h3 className="font-bold text-lg text-yellow-400 mb-1">Win Koda #3946</h3>
                            <p className="text-xs text-white/90 mb-4">Repeats if Treasury wins</p>
                            <img src={ASSETS.kodaCardImage} alt="Koda" className="w-full h-32 object-cover rounded-xl relative z-10 shadow-sm" />
                        </div>
                    </div>

                    {/* --- GAME THEORY --- */}
                    <div className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-sm mb-10">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="bg-blue-100 p-2 rounded-lg">
                                <RefreshCw className="w-6 h-6 text-blue-600" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-slate-900">Why Buy Early? (Game Theory)</h3>
                                <p className="text-xs text-slate-500">Your ticket value increases over time.</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
                            <div className="hidden md:block absolute top-4 left-10 right-10 h-0.5 bg-slate-100 -z-10"></div>
                            <div className="relative z-10 flex flex-col items-center text-center">
                                <div className="w-8 h-8 bg-white border-2 border-slate-300 text-slate-600 rounded-full flex items-center justify-center font-bold text-sm mb-3 shadow-sm">1</div>
                                <h4 className="font-bold text-slate-900 text-sm mb-1">Activation</h4>
                                <p className="text-xs text-slate-500 leading-snug max-w-[180px]">Raffle triggers at {stats.activationThreshold} tickets. Mingles Treasury owns all unsold tickets.</p>
                            </div>
                            <div className="relative z-10 flex flex-col items-center text-center">
                                <div className="w-8 h-8 bg-white border-2 border-slate-300 text-slate-600 rounded-full flex items-center justify-center font-bold text-sm mb-3 shadow-sm">2</div>
                                <h4 className="font-bold text-slate-900 text-sm mb-1">Treasury Wins?</h4>
                                <p className="text-xs text-slate-500 leading-snug max-w-[180px]">If the winning number is unsold, the prize <span className="font-bold text-blue-600">ROLLS OVER</span>. A 5-day timer starts.</p>
                            </div>
                            <div className="relative z-10 flex flex-col items-center text-center">
                                <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm mb-3 shadow-lg">3</div>
                                <h4 className="font-bold text-slate-900 text-sm mb-1">Infinite Value</h4>
                                <p className="text-xs text-slate-500 leading-snug max-w-[180px]">The raffle repeats. Your early ticket <span className="font-bold text-blue-600">STAYS VALID</span> for all subsequent draws.</p>
                            </div>
                        </div>
                    </div>

                </div>
            </main>

            {/* MODALS */}
            <AnimatePresence>
                {activeModal && (
                    <ModalWrapper onClose={closeModal} title={
                        activeModal === 'stickers' ? "Mingles TON Pack" :
                            activeModal === 'feels' ? "Otherside Feels Pack" :
                                activeModal === 'incentives' ? "Raffle Incentive Rules" :
                                    "Grand Prize: Koda #3946"
                    }>
                        {activeModal === 'stickers' && (
                            <div className="text-center">
                                <StickerCarousel images={ASSETS.gifArray} />
                                <p className="text-sm text-slate-600 mt-4 px-4">
                                    You get all 10 animated stickers delivered directly to your TON Wallet via Airdrop.
                                </p>
                            </div>
                        )}

                        {activeModal === 'feels' && (
                            <div className="text-center">
                                <div className="w-32 h-32 mx-auto bg-blue-100 rounded-full mb-6 overflow-hidden border-4 border-white shadow-lg p-1">
                                    <img src={ASSETS.feelsModalCircle} className="w-full h-full object-cover rounded-full" alt="Feels Showcase" />
                                </div>
                                <h4 className="font-bold text-lg text-slate-900 mb-2">10-Pack Exclusive Emotes</h4>
                                <p className="text-sm text-slate-500 mb-6">
                                    Locked until LIVE. Snapshot taken at Mint Out.
                                </p>
                            </div>
                        )}

                        {/* --- KODA MODAL CON VIDEO --- */}
                        {activeModal === 'koda' && (
                            <div className="text-left">
                                {/* Video Container */}
                                <div className="relative aspect-video bg-black rounded-2xl overflow-hidden shadow-lg mb-6 group cursor-pointer border border-slate-800">
                                    {/* VIDEO REAL */}
                                    <video
                                        src={ASSETS.kodaVideo}
                                        className="w-full h-full object-cover"
                                        controls
                                        autoPlay
                                        loop
                                        playsInline
                                        muted // Muted necesario para autoplay en muchos navegadores
                                    >
                                        Your browser does not support the video tag.
                                    </video>
                                </div>

                                <div className="flex justify-between items-end mb-4 border-b border-slate-100 pb-4">
                                    <div>
                                        <h3 className="text-2xl font-black text-slate-900 leading-none">Koda #3946</h3>
                                        <div className="flex gap-2 mt-2">
                                            <span className="bg-yellow-100 text-yellow-700 text-[10px] font-bold px-2 py-1 rounded flex items-center gap-1">
                                                <Zap className="w-3 h-3" /> Core Traits
                                            </span>
                                        </div>
                                    </div>

                                    <a
                                        href="https://opensea.io/"
                                        target="_blank"
                                        rel="noreferrer"
                                        className="group/btn relative w-12 h-12 bg-white border border-slate-200 rounded-full flex items-center justify-center shadow-md hover:scale-105 hover:shadow-xl transition-all duration-300"
                                        title="View on OpenSea"
                                    >
                                        <img
                                            src={ASSETS.openSeaLogo}
                                            alt="OpenSea"
                                            className="w-6 h-6 opacity-80 group-hover/btn:opacity-100 transition object-contain"
                                        />
                                    </a>
                                </div>
                                <p className="text-sm text-slate-500 leading-relaxed">
                                    The ultimate prize. This Koda includes rare traits and will be transferred immediately to the raffle winner.
                                </p>
                            </div>
                        )}

                        {activeModal === 'incentives' && (
                            <div className="space-y-4">
                                <div className={`p-4 rounded-xl border-2 ${currentPhase === 1 ? 'border-yellow-400 bg-yellow-50' : 'border-slate-100 opacity-50'}`}>
                                    <div className="flex justify-between mb-2"><h4 className="font-bold text-slate-900">Phase 1: Holder Match</h4><span className="text-xs font-bold bg-slate-200 px-2 py-0.5 rounded">0-100 Sold</span></div>
                                    <p className="text-xs text-slate-600">If you hold a Mingle NFT, buying 1 ticket gives you 1 extra free entry. (1:1 Ratio).</p>
                                </div>
                                <div className={`p-4 rounded-xl border-2 ${currentPhase === 2 ? 'border-blue-400 bg-blue-50' : 'border-slate-100 opacity-50'}`}>
                                    <div className="flex justify-between mb-2"><h4 className="font-bold text-slate-900">Phase 2: 3-for-2</h4><span className="text-xs font-bold bg-slate-200 px-2 py-0.5 rounded">100-200 Sold</span></div>
                                    <p className="text-xs text-slate-600">Open to public. Buy a bundle of 2 tickets, receive 3 entries total.</p>
                                </div>
                                <div className="text-center pt-2"><span className="text-xs text-slate-400">Current Status: </span><span className="text-xs font-bold text-slate-900">{currentPhase === 1 ? "Phase 1 Active" : currentPhase === 2 ? "Phase 2 Active" : "Incentives Ended"}</span></div>
                            </div>
                        )}
                    </ModalWrapper>
                )}
            </AnimatePresence>

        </div>
    );
}

// ==========================================
// === UI COMPONENTS ===
// ==========================================

interface MintMachineUIProps {
    stats: typeof stats;
    tonAddress: string;
    setTonAddress: (addr: string) => void;
    currentPhase: number;
    isConnected: boolean;
    minglesHeld: number;
    handleConnect: () => void;
}

function MintMachineUI({ stats, tonAddress, setTonAddress, currentPhase, minglesHeld }: any) {
    const [quantity, setQuantity] = useState<number>(1);
    const [status, setStatus] = useState<'idle' | 'signing' | 'success'>('idle');

    // Calculate Bonus Logic
    const { isConnected } = useAccount(); // Get real state
    const calculateBonus = (qty: number) => {
        let entries = qty; let bonus = 0; let message = "";
        if (currentPhase === 1) {
            if (!isConnected) { message = "Connect wallet for bonus"; } else {
                const eligibleForBonus = Math.min(qty, minglesHeld); bonus = eligibleForBonus; entries = qty + bonus;
                if (bonus > 0) message = `+${bonus} Free (Holder Match)`; else if (minglesHeld === 0) message = "No Mingles detected"; else message = "Max bonus reached";
            }
        } else if (currentPhase === 2) {
            const freeTickets = Math.floor(qty / 2); bonus = freeTickets; entries = qty + bonus;
            if (bonus > 0) message = "3-for-2 Applied"; else message = "Add 1 for free ticket";
        }
        return { entries, bonus, message };
    };
    
    const { entries, bonus, message } = calculateBonus(quantity);
    const totalCost = quantity * stats.ticketPriceApe;

    // Your Mint Interaction Logic
    const handleInteract = async () => {
        if (status !== 'idle') return;
        if (!tonAddress) return alert("Enter TON Address");
        // Note: You don't need to check !isConnected here because the button won't show if not connected
        
        setStatus('signing');
        // HERE YOU WOULD ADD YOUR REAL CONTRACT WRITE LOGIC
        await new Promise(r => setTimeout(r, 2000)); 
        setStatus('success'); 
        setTimeout(() => setStatus('idle'), 6000);
    };

    return (
        <div className="mt-4 relative z-10">
            {/* INPUTS (Address & Quantity) - Kept same as before */}
            <div className="mb-6 space-y-4">
                <div><label className="text-[10px] font-bold text-slate-500 uppercase mb-1 block">TON Address (Required)</label><input type="text" value={tonAddress} onChange={(e) => setTonAddress(e.target.value)} placeholder="UQDx..." className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm font-mono focus:border-blue-500 outline-none"/></div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex justify-between items-center">
                    <div><span className="block text-xs font-bold text-slate-500 uppercase">Quantity</span><div className="flex items-center gap-2 mt-1"><button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-6 h-6 bg-white border rounded flex items-center justify-center font-bold hover:border-blue-500">-</button><span className="font-bold w-4 text-center">{quantity}</span><button onClick={() => setQuantity(quantity + 1)} className="w-6 h-6 bg-white border rounded flex items-center justify-center font-bold hover:border-blue-500">+</button></div></div>
                    <div className="text-right"><span className="block text-sm font-bold text-slate-900">{totalCost} $APE</span><span className="text-[10px] text-slate-400">Total Cost</span></div>
                </div>
            </div>

            {/* --- MACHINE UI --- */}
            <div className="bg-gradient-to-b from-indigo-500 to-blue-600 rounded-3xl p-5 border-[6px] border-blue-300 shadow-xl relative">
                
                {/* SLOT WINDOW */}
                <div className="bg-slate-900 rounded-xl h-24 mb-5 border-b-4 border-black/30 relative flex items-end justify-center overflow-hidden shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)]">
                    <AnimatePresence>
                        {status === 'success' && (
                            <motion.div initial={{ y: 100, rotate: -5 }} animate={{ y: -10, rotate: 0 }} exit={{ y: -150, opacity: 0 }} transition={{ type: "spring", bounce: 0.5 }} className="w-3/4 h-5/6 bg-gradient-to-br from-yellow-300 via-yellow-500 to-yellow-600 rounded-lg p-2 flex flex-col items-center justify-center border-2 border-yellow-200 shadow-2xl relative bottom-2">
                                <span className="text-[8px] font-bold uppercase text-yellow-900/60 mb-1">YOU RECEIVED</span><span className="text-4xl font-black text-yellow-900 tracking-tighter leading-none">{entries}</span><span className="text-[10px] font-bold text-yellow-900 uppercase">ENTRIES</span>
                            </motion.div>
                        )}
                    </AnimatePresence>
                    {status !== 'success' && (
                        <div className="text-center pb-2 w-full px-2">
                            <div className="text-[10px] text-blue-200 font-mono uppercase mb-1 tracking-widest opacity-70">Potential Win</div>
                            <div className="text-white font-black text-2xl drop-shadow-md">{entries} ENTRIES</div>
                             {bonus > 0 && (<div className="text-[10px] text-green-300 font-bold mt-1 animate-pulse">{message}</div>)}
                        </div>
                    )}
                </div>

                {/* --- RAINBOWKIT CUSTOM BUTTON WRAPPER --- */}
                <ConnectButton.Custom>
                    {({
                        account,
                        chain,
                        openConnectModal,
                        authenticationStatus,
                        mounted,
                    }) => {
                        const ready = mounted && authenticationStatus !== 'loading';
                        const connected =
                            ready &&
                            account &&
                            chain &&
                            (!authenticationStatus ||
                                authenticationStatus === 'authenticated');

                        return (
                            <>
                                {/* LEVER (Triggers Connect OR Mint based on state) */}
                                <div className="absolute -right-8 top-16 h-24 w-12 z-20">
                                     <motion.div 
                                        onClick={connected ? handleInteract : openConnectModal} // <--- MAGIC HERE
                                        animate={status === 'signing' || status === 'success' ? { rotate: 45 } : { rotate: 0 }}
                                        className="w-4 h-full bg-gradient-to-r from-gray-300 to-gray-400 rounded-full origin-bottom ml-4 cursor-pointer relative transition-transform"
                                        style={{ transformOrigin: 'bottom center' }}
                                    >
                                        <div className="w-12 h-12 bg-red-500 rounded-full absolute -top-4 -left-4 shadow-[inset_-4px_-4px_10px_rgba(0,0,0,0.4),2px_5px_10px_rgba(0,0,0,0.3)] border-b-4 border-red-700">
                                            <div className="absolute top-2 left-2 w-3 h-3 bg-white rounded-full opacity-40 blur-[1px]"></div>
                                        </div>
                                    </motion.div>
                                     <div className="absolute bottom-0 left-3 w-6 h-6 bg-blue-800 rounded-full border-2 border-blue-400"></div>
                                </div>

                                {/* BUTTONS (Changes based on connection state) */}
                                <div className="relative z-10">
                                    {status === 'idle' ? (
                                        !connected ? (
                                            // STATE 1: NOT CONNECTED -> OPEN RAINBOW MODAL
                                            <button 
                                                onClick={openConnectModal} 
                                                type="button"
                                                className="w-full bg-slate-900 border-2 border-slate-700 text-white font-bold py-4 rounded-xl flex justify-center items-center gap-2 hover:bg-slate-800 transition shadow-lg"
                                            >
                                                <Wallet className="w-5 h-5"/> CONNECT WALLET
                                            </button>
                                        ) : (
                                            // STATE 2: CONNECTED -> MINT ACTION
                                            <button 
                                                onClick={handleInteract}
                                                className="w-full bg-yellow-400 hover:bg-yellow-300 text-yellow-900 font-black text-xl py-4 rounded-xl shadow-[0_6px_0_rgb(180,83,9)] active:shadow-none active:translate-y-1.5 transition-all uppercase tracking-wider border-b-4 border-yellow-600"
                                            >
                                                PULL TO MINT
                                            </button>
                                        )
                                    ) : (
                                        // STATE 3: MINTING IN PROCESS
                                        <div className="w-full bg-blue-900/50 text-white py-4 rounded-xl text-center font-bold text-sm animate-pulse border border-white/20">
                                            {status === 'signing' ? 'CONFIRM IN WALLET...' : 'MINTING SUCCESS!'}
                                        </div>
                                    )}
                                </div>
                            </>
                        );
                    }}
                </ConnectButton.Custom>

            </div>
            
            <p className="text-center text-[10px] text-slate-400 mt-4">
                Click the lever or the button to mint ticket(s)
            </p>
        </div>
    );
}

function StickerCarousel({ images }: { images: string[] }) {
    const [idx, setIdx] = useState(0);
    const next = () => setIdx((prev) => (prev + 1) % images.length);
    const prev = () => setIdx((prev) => (prev - 1 + images.length) % images.length);
    return (
        <div className="relative w-full aspect-square bg-slate-100 rounded-xl overflow-hidden group shadow-inner border border-slate-200">
            <div className="w-full h-full flex items-center justify-center bg-white"><img src={images[idx]} alt={`Sticker ${idx + 1}`} className="max-w-full max-h-full object-contain" /></div>
            <div className="absolute inset-0 flex justify-between items-center p-4"><button onClick={prev} className="bg-white/80 backdrop-blur-sm p-2 rounded-full shadow-md hover:bg-white hover:scale-110 transition text-slate-700"><ChevronLeft className="w-6 h-6" /></button><button onClick={next} className="bg-white/80 backdrop-blur-sm p-2 rounded-full shadow-md hover:bg-white hover:scale-110 transition text-slate-700"><ChevronRight className="w-6 h-6" /></button></div>
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-xs font-bold backdrop-blur-md">{idx + 1} / {images.length}</div>
        </div>
    );
}

interface RewardCardProps { title: string; subtitle: string; icon: ReactNode | string; image: string; onClick: () => void; }
function RewardCard({ title, subtitle, icon, image, onClick }: RewardCardProps) {
    return (
        <div onClick={onClick} className="group cursor-pointer bg-white border border-slate-200 rounded-2xl p-4 hover:shadow-lg transition">
            <div className="flex justify-between items-start mb-3"><span className="text-2xl">{icon}</span><Info className="w-4 h-4 text-slate-300 group-hover:text-blue-500" /></div>
            <div className="h-32 w-full bg-slate-100 rounded-lg mb-3 overflow-hidden relative"><img src={image} className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition duration-300" alt={title} /></div>
            <h4 className="font-bold text-slate-900">{title}</h4><p className="text-xs text-slate-500">{subtitle}</p>
        </div>
    );
}

interface ModalWrapperProps { children: ReactNode; onClose: () => void; title: string; }
function ModalWrapper({ children, onClose, title }: ModalWrapperProps) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white w-full max-w-md rounded-2xl p-6 relative z-10 shadow-2xl">
                <div className="flex justify-between mb-4 items-center"><h3 className="font-bold text-lg">{title}</h3><button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-full transition"><X className="w-5 h-5" /></button></div>
                {children}
            </motion.div>
        </div>
    );
}