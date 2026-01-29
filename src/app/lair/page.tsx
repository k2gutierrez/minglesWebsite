'use client';

import React from 'react';
import Link from 'next/link';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { motion } from 'framer-motion';
import { 
  Home, Ticket, Calendar, MessageSquare, Settings, 
  Bell, Search, ExternalLink, Zap
} from 'lucide-react';

// Assets placeholders (usa los mismos que en home o nuevos)
const ASSETS = {
  logo: "/images/MinglesMiniaturaLogoRojo-02.png",
  avatar: "/images/Screenshot 2026-01-23 at 10.15.16 p.m..jpg", // Usando el gusano como avatar default
  event1: "/images/Screenshot 2026-01-23 at 10.17.00 p.m..jpg",
  event2: "/images/landing/community.jpg",
};

export default function LairPage() {
  return (
    <div className="min-h-screen bg-mingles-beige font-sans text-mingles-black flex flex-col md:flex-row">
      
      {/* --- SIDEBAR (Desktop) / BOTTOM NAV (Mobile) --- */}
      <aside className="w-full md:w-64 bg-mingles-black text-mingles-beige p-6 flex flex-col justify-between md:h-screen fixed md:sticky top-0 z-40 border-r-4 border-mingles-red">
         <div>
            <div className="flex items-center gap-3 mb-10">
               <img src={ASSETS.logo} className="w-8 h-8" />
               <span className="font-black text-2xl tracking-tighter uppercase">THE LAIR</span>
            </div>
            
            <nav className="space-y-2">
               {[
                 { icon: <Home/>, label: "Dashboard", active: true },
                 { icon: <Ticket/>, label: "My Koda Raffle", link: "/koda" },
                 { icon: <Calendar/>, label: "Events" },
                 { icon: <MessageSquare/>, label: "The Jungle (Chat)" },
               ].map((item, i) => (
                 item.link ? (
                   <Link key={i} href={item.link} className={`flex items-center gap-3 p-3 rounded-xl font-bold transition-all ${item.active ? 'bg-mingles-red text-white shadow-pop' : 'hover:bg-white/10 text-white/60 hover:text-white'}`}>
                      {item.icon} {item.label}
                   </Link>
                 ) : (
                   <button key={i} className={`w-full flex items-center gap-3 p-3 rounded-xl font-bold transition-all ${item.active ? 'bg-mingles-red text-white shadow-[4px_4px_0px_0px_#FFFFFF]' : 'hover:bg-white/10 text-white/60 hover:text-white'}`}>
                      {item.icon} {item.label}
                   </button>
                 )
               ))}
            </nav>
         </div>

         <div className="pt-6 border-t border-white/20 hidden md:block">
            <button className="flex items-center gap-3 text-sm font-bold opacity-60 hover:opacity-100 transition">
               <Settings className="w-4 h-4" /> Settings
            </button>
         </div>
      </aside>

      {/* --- MAIN CONTENT --- */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto pt-20 md:pt-8 pb-24 md:pb-8">
         
         {/* HEADER */}
         <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <div>
               <h1 className="text-4xl font-black uppercase leading-none">Welcome Back, <span className="text-mingles-red">Mingler.</span></h1>
               <p className="font-bold opacity-60">Here is what's happening in the jungle today.</p>
            </div>
            <div className="flex items-center gap-4">
               <button className="p-3 bg-white border-2 border-mingles-black rounded-full hover:bg-mingles-red hover:text-white transition shadow-pop">
                  <Bell className="w-5 h-5" />
               </button>
               <ConnectButton showBalance={false} accountStatus="avatar" chainStatus="icon" />
            </div>
         </header>

         {/* BENTO GRID DASHBOARD */}
         <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            
            {/* 1. PROFILE CARD */}
            <motion.div whileHover={{ y: -4 }} className="col-span-1 md:col-span-2 bg-mingles-white p-6 rounded-3xl border-4 border-mingles-black shadow-pop relative overflow-hidden">
               <div className="flex items-center gap-6 relative z-10">
                  <div className="w-24 h-24 rounded-2xl border-2 border-mingles-black overflow-hidden bg-mingles-beige">
                     <img src={ASSETS.avatar} className="w-full h-full object-cover" />
                  </div>
                  <div>
                     <span className="bg-mingles-black text-white text-xs font-black px-2 py-1 rounded uppercase">OG Member</span>
                     <h2 className="text-2xl font-black mt-1">Worm #8832</h2>
                     <div className="flex gap-4 mt-3 text-sm font-bold opacity-70">
                        <span>🥃 12 Tastings</span>
                        <span>🎟️ 5 Raffles</span>
                     </div>
                  </div>
               </div>
               {/* Background deco */}
               <div className="absolute right-0 top-0 w-32 h-32 bg-mingles-red/10 rounded-bl-full -z-0"></div>
            </motion.div>

            {/* 2. RAFFLE STATUS (CTA) */}
            <Link href="/koda" className="col-span-1 md:col-span-2 bg-mingles-red text-white p-6 rounded-3xl border-4 border-mingles-black shadow-pop flex flex-col justify-between group cursor-pointer hover:bg-red-600 transition">
               <div className="flex justify-between items-start">
                  <div>
                     <h3 className="text-2xl font-black uppercase">Koda Raffle</h3>
                     <p className="font-medium opacity-90 text-sm">Jackpot is active!</p>
                  </div>
                  <Zap className="w-8 h-8 fill-yellow-400 text-yellow-400 animate-pulse" />
               </div>
               <div className="flex items-center justify-between mt-4">
                  <div className="bg-black/20 px-3 py-1 rounded-lg text-xs font-bold">Phase 1: Holder Match</div>
                  <span className="font-black text-lg underline group-hover:scale-105 transition-transform">MINT NOW </span>
               </div>
            </Link>

            {/* 3. NEWS FEED */}
            <div className="col-span-1 md:col-span-2 lg:col-span-3 bg-white p-6 rounded-3xl border-2 border-mingles-black shadow-sm">
               <div className="flex justify-between items-center mb-6">
                  <h3 className="font-black text-xl uppercase flex items-center gap-2">
                     <MessageSquare className="w-5 h-5 text-mingles-red"/> The Daily Drip
                  </h3>
                  <button className="text-xs font-bold underline">View All</button>
               </div>
               
               <div className="space-y-4">
                  {[
                     { title: "ApeChain Migration Complete", date: "2h ago", tag: "Tech" },
                     { title: "New Tequila Batch: 'Agave Ghost' revealed", date: "5h ago", tag: "Product" },
                     { title: "Community Call Recap: DAO Voting starts soon", date: "1d ago", tag: "Governance" },
                  ].map((news, i) => (
                     <div key={i} className="flex items-center justify-between p-4 bg-mingles-beige rounded-xl border border-mingles-black/10 hover:border-mingles-black transition-colors cursor-pointer">
                        <div>
                           <h4 className="font-bold text-mingles-black">{news.title}</h4>
                           <span className="text-xs font-bold text-mingles-red">{news.tag}</span>
                        </div>
                        <span className="text-xs font-bold opacity-40">{news.date}</span>
                     </div>
                  ))}
               </div>
            </div>

            {/* 4. UPCOMING EVENTS */}
            <div className="col-span-1 md:col-span-1 bg-mingles-black text-mingles-beige p-6 rounded-3xl border-2 border-mingles-black shadow-pop">
               <h3 className="font-black text-xl uppercase mb-6 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-mingles-red"/> Events
               </h3>
               
               <div className="space-y-4">
                  <div className="group cursor-pointer">
                     <div className="h-24 w-full rounded-xl overflow-hidden mb-2 border border-white/20">
                        <img src={ASSETS.event1} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                     </div>
                     <div className="flex justify-between items-end">
                        <div>
                           <h4 className="font-bold text-white leading-tight">Tequila Tasting Night</h4>
                           <p className="text-xs text-mingles-red font-black uppercase">Feb 14 • Discord</p>
                        </div>
                        <button className="bg-mingles-white text-mingles-black p-1 rounded hover:bg-mingles-red hover:text-white transition">
                           <ExternalLink className="w-4 h-4"/>
                        </button>
                     </div>
                  </div>
               </div>
            </div>

         </div>
      </main>
    </div>
  );
}