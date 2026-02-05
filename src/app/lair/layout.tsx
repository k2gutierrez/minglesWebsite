'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Menu, X, Home, User, Youtube, Gamepad2, Ticket, 
  BookOpen, Wine, Trophy, Sword, Calendar, ExternalLink, LogOut, DollarSign 
} from 'lucide-react';
import { LairConnectButton } from '@/components/LairConnectButton';

const MENU_ITEMS = [
  { name: 'Dashboard', path: '/lair', icon: <Home /> },
  { name: 'My Mingles', path: '/lair/my-mingles', icon: <User /> }, // Placeholder
  { name: 'Onboarding', path: '/lair/onboarding', icon: <Youtube /> },
  { name: 'News', path: '/lair/news', icon: <Youtube /> },
  { name: 'Games', path: '/lair/games', icon: <Gamepad2 /> },
  { name: 'Raffles', path: '/koda', icon: <Ticket /> }, // Link a la rifa existente
  { name: 'Lore', path: '/lair/lore', icon: <BookOpen /> },
  { name: 'Tequila', path: '/lair/tequila', icon: <Wine /> },
  { name: 'Prize Pools', path: '/lair/prizepools', icon: <Trophy /> }, // Placeholder
  { name: 'Mingles Raids', path: '/lair/raids', icon: <Sword /> }, // Placeholder
  { name: 'Events', path: '/lair/events', icon: <Calendar /> },
  { name: 'Claim $Tequila', path: '/lair/claim-tequila', icon: <DollarSign /> },
];

export default function LairLayout({ children }: { children: React.ReactNode }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-[#EDEDD9] text-[#1D1D1D] font-sans selection:bg-[#E15162] selection:text-white">
      
      {/* --- TOP BAR (MOBILE) --- */}
      <header className="lg:hidden fixed top-0 w-full z-40 px-4 py-3 bg-[#EDEDD9]/90 backdrop-blur-md border-b-2 border-[#1D1D1D] flex justify-between items-center">
         <Link href="/lair" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#E15162] rounded-lg border-2 border-[#1D1D1D]"></div> {/* Placeholder Logo */}
            <span className="font-black uppercase tracking-tighter text-lg">The Lair</span>
         </Link>
         <button onClick={() => setIsMenuOpen(true)} className="p-2 border-2 border-[#1D1D1D] rounded-lg bg-white shadow-[2px_2px_0_0_#1D1D1D] active:translate-y-[2px] active:shadow-none transition-all">
            <Menu className="w-6 h-6"/>
         </button>
      </header>

      {/* --- SIDEBAR NAVIGATION (DESKTOP) --- */}
      <aside className="hidden lg:flex fixed left-0 top-0 h-screen w-64 flex-col border-r-4 border-[#1D1D1D] bg-white z-30">
         <div className="p-6 border-b-4 border-[#1D1D1D]">
            <h1 className="font-black text-3xl uppercase tracking-tighter text-[#E15162]">Mingles<br/><span className="text-[#1D1D1D]">Lair</span></h1>
         </div>
         <nav className="flex-1 overflow-y-auto p-4 space-y-2 no-scrollbar">
            {MENU_ITEMS.map((item) => {
               const isActive = pathname === item.path;
               return (
                  <Link 
                    key={item.path} 
                    href={item.path}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all border-2 ${isActive ? 'bg-[#1D1D1D] text-white border-[#1D1D1D] shadow-[4px_4px_0_0_#E15162]' : 'bg-white text-[#1D1D1D] border-transparent hover:border-[#1D1D1D] hover:bg-[#EDEDD9]'}`}
                  >
                     {React.cloneElement(item.icon as React.ReactElement, { size: 20 })}
                     {item.name}
                  </Link>
               )
            })}
         </nav>
         <div className="p-4 border-t-4 border-[#1D1D1D] bg-[#EDEDD9]">
            <LairConnectButton isMobile={false} />
         </div>
      </aside>

      {/* --- MOBILE MENU OVERLAY --- */}
      <AnimatePresence>
         {isMenuOpen && (
            <motion.div 
               initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
               className="lg:hidden fixed inset-0 z-50 bg-[#1D1D1D]/80 backdrop-blur-sm flex justify-end"
               onClick={() => setIsMenuOpen(false)}
            >
               <motion.div 
                  initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
                  transition={{ type: "spring", damping: 25, stiffness: 200 }}
                  className="w-4/5 h-full bg-[#EDEDD9] border-l-4 border-[#1D1D1D] flex flex-col shadow-2xl"
                  onClick={(e) => e.stopPropagation()}
               >
                  <div className="p-4 flex justify-between items-center border-b-2 border-[#1D1D1D] bg-white">
                     <span className="font-black uppercase">Menu</span>
                     <button onClick={() => setIsMenuOpen(false)} className="p-2 rounded-full hover:bg-[#1D1D1D] hover:text-white transition-colors">
                        <X className="w-6 h-6"/>
                     </button>
                  </div>
                  <nav className="flex-1 overflow-y-auto p-4 space-y-2">
                     {MENU_ITEMS.map((item) => (
                        <Link 
                           key={item.path} 
                           href={item.path}
                           onClick={() => setIsMenuOpen(false)}
                           className={`flex items-center gap-4 px-4 py-4 rounded-xl font-bold border-2 ${pathname === item.path ? 'bg-[#E15162] text-white border-[#1D1D1D]' : 'bg-white border-[#1D1D1D] shadow-[2px_2px_0_0_#1D1D1D] active:shadow-none active:translate-y-[2px]'}`}
                        >
                           {React.cloneElement(item.icon as React.ReactElement, { size: 20 })}
                           {item.name}
                        </Link>
                     ))}
                     <div className="mt-8">
                        <LairConnectButton isMobile={true} />
                     </div>
                  </nav>
               </motion.div>
            </motion.div>
         )}
      </AnimatePresence>

      {/* --- MAIN CONTENT AREA --- */}
      <main className="lg:pl-64 min-h-screen flex flex-col pt-16 lg:pt-0">
         <div className="flex-1 p-4 md:p-8 overflow-x-hidden">
            {children}
         </div>

         {/* --- GLOBAL FOOTER --- */}
         <footer className="bg-[#1D1D1D] text-[#EDEDD9] p-8 border-t-4 border-[#E15162]">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
               <div className="flex gap-4">
                  {['Twitter', 'Discord', 'Magic Eden', 'OpenSea'].map((link) => (
                     <a key={link} href="#" className="text-xs font-bold uppercase hover:text-[#E15162] transition-colors">{link}</a>
                  ))}
               </div>
               <p className="text-[10px] opacity-50">© 2026 Mingles DAO. All rights reserved.</p>
            </div>
         </footer>
      </main>
    </div>
  );
}