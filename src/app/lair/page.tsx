'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  User, Youtube, Gamepad2, Ticket, BookOpen, 
  Wine, Trophy, Sword, Calendar, Newspaper, DollarSign
} from 'lucide-react';

// Configuración de las tarjetas
const DASHBOARD_CARDS = [
  { title: "My Mingles", path: "/lair/my-mingles", icon: <User />, color: "bg-blue-300", desc: "View your collection & points" },
  { title: "Onboarding", path: "/lair/onboarding", icon: <Youtube />, color: "bg-yellow-300", desc: "Start here, new blood" },
  { title: "News", path: "/lair/news", icon: <Newspaper />, color: "bg-pink-300", desc: "Latest updates" },
  { title: "Games", path: "/lair/games", icon: <Gamepad2 />, color: "bg-purple-300", desc: "Play Prison Break" },
  { title: "Raffles", path: "/koda", icon: <Ticket />, color: "bg-[#E15162]", desc: "Win the Koda", text: "text-white" },
  { title: "Lore", path: "/lair/lore", icon: <BookOpen />, color: "bg-orange-300", desc: "The Mingles History" },
  { title: "Tequila", path: "/lair/tequila", icon: <Wine />, color: "bg-green-300", desc: "Production updates" },
  { title: "Prize Pools", path: "/lair/prizepools", icon: <Trophy />, color: "bg-cyan-300", desc: "Spend $TEQUILA points" },
  { title: "Mingles Raids", path: "/lair/raids", icon: <Sword />, color: "bg-red-900", desc: "Send Mingles on missions", text: "text-white" },
  { title: "Events", path: "/lair/events", icon: <Calendar />, color: "bg-indigo-300", desc: "IRL & Online Calendar" },
  { title: "Claim $Tequila", path: "/lair/claim-tequila", icon: <DollarSign />, color: "bg-green-600", desc: "Claim $Tequila" },
];

export default function LairDashboard() {
  return (
    <div className="max-w-6xl mx-auto">
      <motion.div 
         initial={{ opacity: 0, y: 20 }}
         animate={{ opacity: 1, y: 0 }}
         className="mb-8"
      >
         <h1 className="text-4xl md:text-5xl font-black uppercase mb-2">Welcome Home</h1>
         <p className="font-medium opacity-60">Select a module to interact with the ecosystem.</p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
        {DASHBOARD_CARDS.map((card, i) => (
          <Link href={card.path} key={i}>
            <motion.div 
              whileHover={{ y: -5, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`h-full p-6 rounded-3xl border-4 border-[#1D1D1D] shadow-[4px_4px_0_0_#1D1D1D] hover:shadow-[8px_8px_0_0_#1D1D1D] transition-all flex flex-col justify-between min-h-[180px] ${card.color} ${card.text || 'text-[#1D1D1D]'}`}
            >
               <div>
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center border-2 border-[#1D1D1D] shadow-sm mb-4 bg-white/20 backdrop-blur-sm`}>
                     {React.cloneElement(card.icon as React.ReactElement, { size: 24 })}
                  </div>
                  <h3 className="font-black text-2xl uppercase leading-none mb-1">{card.title}</h3>
               </div>
               <p className="text-sm font-bold opacity-70">{card.desc}</p>
            </motion.div>
          </Link>
        ))}
      </div>
    </div>
  );
}