'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trophy, Users, Zap, Play, Gift, 
  Wine, Sticker, Lock, RefreshCw, X,
  AlertTriangle, Twitter, CheckCircle2, Copy
} from 'lucide-react';
import { useAccount } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';

// --- TYPES ---
type UserStatus = {
  isEligible: boolean; // True si NO tiene listings
  listedCount: number;
  totalMingles: number;
  friendsCount: number;
  twitterConnected: boolean;
  points: number;
  nextDropTime: string; // ISO String
};

type DailyTask = {
  id: string;
  label: string;
  reward: number;
  completed: boolean;
};

// --- LOGIC HELPERS ---
const getHoldingMultiplier = (count: number) => {
  if (count >= 20) return 2.0;
  if (count >= 15) return 1.75;
  if (count >= 10) return 1.5;
  if (count >= 5) return 1.25;
  if (count >= 3) return 1.1;
  if (count >= 1) return 1.05;
  return 1.0;
};

const getSocialMultiplier = (friends: number) => {
  if (friends > 15) return 0.5;
  if (friends > 10) return 0.3;
  if (friends > 5) return 0.15;
  return 0.05; // Base por tener al menos 1
};

export default function LairPage() {
  const { address, isConnected } = useAccount();

  // --- MOCK STATE (Simulando respuesta de tu API/Indexer) ---
  const [user, setUser] = useState<UserStatus>({
    isEligible: true, // Cambia a false para probar la UI de penalización
    listedCount: 0,
    totalMingles: 8, // Tier 5-10
    friendsCount: 4, // Tier 0-5
    twitterConnected: false,
    points: 4200,
    nextDropTime: new Date(Date.now() + 1000 * 60 * 60 * 12).toISOString() // 12 horas restantes
  });

  const [tasks, setTasks] = useState<DailyTask[]>([
    { id: '1', label: 'Check in Daily', reward: 50, completed: true },
    { id: '2', label: 'Retweet Announcement', reward: 100, completed: false },
    { id: '3', label: 'Play Prison Break Level 1', reward: 150, completed: false },
  ]);

  // Cálculos en tiempo real
  const holdMult = getHoldingMultiplier(user.totalMingles);
  const socialMult = getSocialMultiplier(user.friendsCount);
  const twitterMult = user.twitterConnected ? 0.2 : 0;
  const totalMult = (holdMult + socialMult + twitterMult).toFixed(2);
  
  // Handlers simulados
  const handleConnectTwitter = () => {
    // Aquí iría la lógica OAuth con NextAuth
    setUser(prev => ({ ...prev, twitterConnected: true }));
  };

  const copyReferral = () => {
    navigator.clipboard.writeText(`MING-${address?.slice(-4)}`);
    // Toast notification here
  };

  if (!isConnected) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-mingles-beige gap-6 p-4">
      <div className="w-24 h-24 bg-mingles-red rounded-full flex items-center justify-center text-4xl mb-4 animate-bounce">🐛</div>
      <h1 className="text-3xl font-black text-center">Enter The Lair</h1>
      <ConnectButton />
    </div>
  );

  return (
    <div className="min-h-screen bg-mingles-beige pb-32 transition-colors duration-700">
      
      {/* 1. HEADER & IDENTITY */}
      <header className="bg-mingles-dark pt-8 pb-20 px-4 rounded-b-[2.5rem] shadow-2xl relative overflow-hidden">
         {/* Background noise texture */}
         <div className="absolute inset-0 opacity-20 bg-[url('/noise.png')]"></div>
         
         <div className="container mx-auto flex flex-col items-center relative z-10">
            {/* Eligibility Warning Banner */}
            {!user.isEligible && (
               <motion.div 
                 initial={{ y: -50, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
                 className="w-full max-w-md bg-red-500/10 border border-red-500 text-red-200 px-4 py-3 rounded-xl mb-6 flex items-center gap-3"
               >
                  <AlertTriangle className="text-red-500 shrink-0" />
                  <div className="text-sm">
                    <span className="font-bold block text-red-400">POINTS PAUSED</span>
                    You have {user.listedCount} Mingles listed. Delist to resume earning.
                  </div>
               </motion.div>
            )}

            {/* Main Score Display */}
            <div className="text-center mb-6">
                <p className="text-gray-400 text-xs font-bold tracking-[0.2em] uppercase mb-2">Total $TEQUILA Balance</p>
                <div className="text-6xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-400 flex items-center justify-center gap-2">
                   {user.points.toLocaleString()}
                   <span className="text-2xl text-agave-green self-start mt-2">$TEQ</span>
                </div>
            </div>

            {/* Multiplier Dashboard */}
            <div className="bg-white/10 backdrop-blur-md border border-white/10 p-4 rounded-2xl w-full max-w-lg">
                <div className="flex justify-between items-end mb-4">
                    <span className="text-white font-bold">Current Multiplier</span>
                    <span className="text-3xl font-black text-yellow-400">x{totalMult}</span>
                </div>
                
                {/* Visual Bars Breakdown */}
                <div className="space-y-3">
                    {/* Holding Tier */}
                    <div className="flex items-center gap-3 text-xs">
                        <span className="text-gray-400 w-16">Hold ({user.totalMingles})</span>
                        <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
                            <motion.div 
                              initial={{ width: 0 }} animate={{ width: `${(user.totalMingles / 25) * 100}%` }} 
                              className="h-full bg-blue-500"
                            />
                        </div>
                        <span className="text-blue-400 font-bold">+ {holdMult}x</span>
                    </div>
                    
                    {/* Friends Tier */}
                    <div className="flex items-center gap-3 text-xs">
                        <span className="text-gray-400 w-16">Friends ({user.friendsCount})</span>
                        <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
                             <motion.div 
                              initial={{ width: 0 }} animate={{ width: `${(user.friendsCount / 20) * 100}%` }} 
                              className="h-full bg-pink-500"
                            />
                        </div>
                        <span className="text-pink-400 font-bold">+ {socialMult}x</span>
                    </div>

                     {/* Twitter Bonus */}
                     <div className="flex items-center gap-3 text-xs">
                        <span className="text-gray-400 w-16">Twitter</span>
                        <div className="flex-1">
                            {!user.twitterConnected ? (
                                <button onClick={handleConnectTwitter} className="flex items-center gap-2 text-[10px] bg-[#1DA1F2] hover:bg-[#1a91da] text-white px-2 py-1 rounded transition-colors">
                                    <Twitter size={10} /> Connect for +0.2x
                                </button>
                            ) : (
                                <span className="flex items-center gap-1 text-green-400 font-bold"><CheckCircle2 size={12}/> Connected</span>
                            )}
                        </div>
                        <span className={user.twitterConnected ? "text-green-400 font-bold" : "text-gray-600"}>+ 0.2x</span>
                    </div>
                </div>
            </div>
         </div>
      </header>

      {/* 2. BODY CONTENT */}
      <div className="container mx-auto px-4 -mt-10 relative z-20 space-y-6">
        
        {/* Daily Tasks & Claims */}
        <section className="bg-white rounded-3xl p-6 shadow-xl border-2 border-mingles-dark">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-xl font-black uppercase">Daily Drop</h2>
                    <p className="text-xs text-gray-500 font-bold flex items-center gap-1">
                       Next refill in: <span className="text-mingles-red">08:42:15</span>
                    </p>
                </div>
                <div className="bg-agave-light/30 text-agave-green p-3 rounded-full">
                    <Gift size={24} />
                </div>
            </div>

            <div className="space-y-3">
                {tasks.map(task => (
                    <div key={task.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
                        <div className="flex items-center gap-3">
                             <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 ${task.completed ? 'bg-green-500 border-green-500' : 'border-gray-300'}`}>
                                 {task.completed && <CheckCircle2 size={14} className="text-white" />}
                             </div>
                             <span className={`text-sm font-bold ${task.completed ? 'text-gray-400 line-through' : 'text-gray-800'}`}>{task.label}</span>
                        </div>
                        <span className="text-xs font-black bg-gray-200 px-2 py-1 rounded text-gray-600">
                            +{(task.reward * parseFloat(totalMult)).toFixed(0)}
                        </span>
                    </div>
                ))}
            </div>
        </section>

        {/* Invite Friend Widget */}
        <section className="bg-mingles-red text-white rounded-3xl p-6 shadow-xl border-2 border-mingles-dark relative overflow-hidden">
             <div className="absolute top-0 right-0 p-4 opacity-20 rotate-12">
                 <Users size={80} />
             </div>
             <h3 className="text-lg font-black mb-2">Boost your Multiplier</h3>
             <p className="text-white/80 text-sm mb-4 max-w-[80%]">Invite friends to unlock the next tier (Target: 6 friends).</p>
             
             <div className="flex gap-2">
                 <div className="flex-1 bg-black/20 rounded-xl px-4 py-3 font-mono text-sm flex items-center justify-between border border-white/20">
                     <span>MING-{address?.slice(-4) || '0000'}</span>
                     <button onClick={copyReferral}><Copy size={16} className="text-white/70 hover:text-white"/></button>
                 </div>
                 <button className="bg-white text-mingles-red font-bold px-4 rounded-xl shadow-lg active:scale-95 transition-transform">
                     Share
                 </button>
             </div>
        </section>

        {/* 3. BENTO GRID NAVIGATION */}
        <div>
            <h2 className="text-xl font-black text-mingles-dark mb-4 px-2 mt-8">Lair Activities</h2>
            <div className="grid grid-cols-2 gap-4 pb-12">
                
                {/* Mingles Prison Break */}
                <Link href="/lair/prison-break" className="col-span-2 bg-gray-900 rounded-2xl p-6 border-2 border-mingles-dark text-white relative overflow-hidden group hover:shadow-[0px_10px_20px_rgba(0,0,0,0.4)] transition-all">
                    <div className="absolute right-[-20px] top-[-20px] w-32 h-32 bg-purple-500 rounded-full blur-3xl opacity-30 group-hover:opacity-50 transition-opacity"></div>
                    <div className="relative z-10 flex justify-between items-center">
                        <div>
                            <span className="bg-purple-500 text-xs font-bold px-2 py-0.5 rounded text-white mb-1 inline-block">GAME</span>
                            <h3 className="text-2xl font-black italic tracking-tighter">PRISON BREAK</h3>
                            <p className="text-gray-400 text-xs mt-1">Earn points by playing</p>
                        </div>
                        <Play size={32} className="fill-white" />
                    </div>
                </Link>

                {/* Redeem (Spin) */}
                <Link href="/lair/redeem" className="col-span-1 bg-white rounded-2xl p-4 border-2 border-mingles-dark shadow-[4px_4px_0px_0px_#1a1a1a] active:translate-y-[2px] active:shadow-none transition-all flex flex-col justify-between h-32">
                    <div className="bg-pink-100 w-10 h-10 rounded-full flex items-center justify-center text-pink-600">
                        <Gift size={20} />
                    </div>
                    <div>
                        <h3 className="font-black text-lg leading-none">Spin & Win</h3>
                        <span className="text-[10px] font-bold text-gray-400 uppercase">Spend Points</span>
                    </div>
                </Link>

                {/* Koda Raffle */}
                <Link href="/lair/raffle" className="col-span-1 bg-white rounded-2xl p-4 border-2 border-mingles-dark shadow-[4px_4px_0px_0px_#1a1a1a] active:translate-y-[2px] active:shadow-none transition-all flex flex-col justify-between h-32">
                    <div className="bg-blue-100 w-10 h-10 rounded-full flex items-center justify-center text-blue-600">
                        <Trophy size={20} />
                    </div>
                    <div>
                        <h3 className="font-black text-lg leading-none">Koda Raffle</h3>
                        <span className="text-[10px] font-bold text-gray-400 uppercase">Weekly Draw</span>
                    </div>
                </Link>

                {/* Tequila Status */}
                 <Link href="/lair/tequila" className="col-span-2 bg-agave-green text-white rounded-2xl p-4 border-2 border-mingles-dark flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Wine />
                        <div>
                            <h3 className="font-black text-lg">Mingles Tequila</h3>
                            <p className="text-xs opacity-80">Track bottle production</p>
                        </div>
                    </div>
                    <div className="text-2xl font-black opacity-30">0%</div>
                </Link>

                 {/* Other links (Stickers, Cava, etc) */}
                 <div className="col-span-2 grid grid-cols-3 gap-2">
                    <Link href="/lair/livestreams" className="bg-white p-3 rounded-xl border-2 border-mingles-dark flex flex-col items-center justify-center text-center gap-1">
                        <Play size={16} />
                        <span className="text-[10px] font-bold">Live</span>
                    </Link>
                    <Link href="/lair/cava" className="bg-white p-3 rounded-xl border-2 border-mingles-dark flex flex-col items-center justify-center text-center gap-1">
                        <Lock size={16} />
                        <span className="text-[10px] font-bold">Cava</span>
                    </Link>
                    <Link href="/lair/stickers" className="bg-white p-3 rounded-xl border-2 border-mingles-dark flex flex-col items-center justify-center text-center gap-1">
                        <Sticker size={16} />
                        <span className="text-[10px] font-bold">Stickers</span>
                    </Link>
                 </div>

            </div>
        </div>

      </div>
    </div>
  );
}