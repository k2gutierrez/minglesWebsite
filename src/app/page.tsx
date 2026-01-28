'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { 
  ArrowRight, MessageCircle, ExternalLink, Play,  
  Wine, Users, StickyNote, Warehouse
} from 'lucide-react';

// --- CONFIGURACIÓN DE IMÁGENES ---
// Asegúrate de tener estas imágenes en public/images/landing/
const LANDING_ASSETS = {
  logo: "/images/MLogo.png",
  // Bento Grid Images
  tequila: "/images/landing/tequila-bottle.png",
  koda: "/images/Koda.png",
  community: "/images/IMG_4123-p-1080.jpg",
  stickers: "/mingle-gifs/8.gif",
  cava: "/images/Barriles_Escala.png",
  livestream: "/images/landing/live.jpg",
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#FDF8F3] text-slate-900 font-sans selection:bg-red-200 overflow-x-hidden">
      
      {/* --- NAVBAR FLOTANTE --- */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-4 py-4">
        <div className="max-w-7xl mx-auto bg-white/80 backdrop-blur-md border border-slate-200/50 rounded-2xl shadow-sm px-4 py-3 flex justify-between items-center">
            
            {/* Logo */}
            <div className="flex items-center gap-3">
               <motion.img 
                 whileHover={{ rotate: 20 }}
                 src={LANDING_ASSETS.logo} 
                 alt="Mingles" 
                 className="w-10 h-10 rounded-xl cursor-pointer" 
               />
               <span className="hidden md:block font-black text-xl tracking-tighter text-slate-900">
                 MINGLES<span className="text-red-600">.</span>TEQUILA
               </span>
            </div>

            {/* Wallet Connect */}
            <div>
              <ConnectButton showBalance={false} accountStatus="avatar" chainStatus="icon" />
            </div>
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <section className="pt-32 pb-16 px-4 relative overflow-hidden">
         {/* Fondo decorativo (Glow rojo) */}
         <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-red-500/5 rounded-full blur-[100px] -z-10 animate-pulse"></div>

         <div className="max-w-4xl mx-auto text-center">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <span className="inline-block py-1 px-3 rounded-full bg-red-100 text-red-600 text-xs font-bold tracking-widest mb-4 border border-red-200">
                APECHAIN'S FINEST SPIRIT
              </span>
              <h1 className="text-6xl md:text-8xl font-black text-slate-900 leading-[0.9] mb-6 tracking-tight">
                Tequila Community <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-orange-600">Tequila Collectibles.</span>
              </h1>
              <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto mb-8 font-medium leading-relaxed">
                Mingles is more than a Tequila brand. We are a crypto-native community building the bridge between agitation and distillation on ApeChain.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <a 
                    href="https://magiceden.io/" 
                    target="_blank" 
                    rel="noreferrer"
                    className="w-full sm:w-auto px-8 py-4 bg-red-600 text-white font-black rounded-xl hover:bg-red-700 hover:scale-105 transition shadow-xl shadow-red-500/20 flex items-center justify-center gap-2"
                  >
                    COLLECT ON MAGIC EDEN <ExternalLink className="w-5 h-5"/>
                  </a>
                  <a 
                    href="https://discord.gg/" 
                    target="_blank" 
                    rel="noreferrer"
                    className="w-full sm:w-auto px-8 py-4 bg-white text-slate-900 border-2 border-slate-200 font-bold rounded-xl hover:border-slate-400 hover:bg-slate-50 transition flex items-center justify-center gap-2"
                  >
                    JOIN DISCORD <MessageCircle className="w-5 h-5"/>
                  </a>
              </div>
            </motion.div>
         </div>
      </section>

      {/* --- BENTO GRID NAVIGATION --- */}
      <section className="max-w-7xl mx-auto px-4 pb-24">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 grid-rows-auto gap-4 md:h-[600px]">
              
              {/* 1. KODA RAFFLE (Feature - Big Card) */}
              <Link href="/koda" className="group md:col-span-2 md:row-span-2 relative rounded-3xl overflow-hidden cursor-pointer shadow-sm hover:shadow-2xl transition-all duration-300 border border-slate-200 bg-black">
                  <motion.div whileHover={{ scale: 1.05 }} className="absolute inset-0">
                      <img src={LANDING_ASSETS.koda} alt="Raffle" className="w-full h-full object-cover opacity-80 group-hover:opacity-60 transition" />
                  </motion.div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent p-8 flex flex-col justify-end">
                      <div className="flex justify-between items-end">
                          <div>
                            <span className="bg-yellow-400 text-black text-xs font-black px-2 py-1 rounded mb-2 inline-block">LIVE NOW</span>
                            <h2 className="text-3xl md:text-4xl font-black text-white mb-2">Win a Koda</h2>
                            <p className="text-gray-300 text-sm md:text-base max-w-sm">Participate in our exclusive Holder Match raffle. One mint, three rewards.</p>
                          </div>
                          <div className="bg-white text-black p-3 rounded-full group-hover:rotate-45 transition duration-300">
                              <ArrowRight className="w-6 h-6" />
                          </div>
                      </div>
                  </div>
              </Link>

              {/* 2. TEQUILA PRODUCT */}
              <div className="group md:col-span-1 md:row-span-2 relative rounded-3xl overflow-hidden cursor-pointer shadow-sm hover:shadow-xl transition border border-slate-200 bg-white">
                  <motion.div whileHover={{ scale: 1.05 }} className="absolute inset-0">
                      <img src={LANDING_ASSETS.tequila} alt="Tequila" className="w-full h-full object-cover" />
                  </motion.div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent p-6 flex flex-col justify-end">
                      <div className="flex items-center gap-2 mb-1 text-white">
                        <Wine className="w-5 h-5" />
                        <h3 className="font-bold text-xl">Our Tequila</h3>
                      </div>
                      <p className="text-white/80 text-xs">Crafted in Jalisco. Powered by Web3.</p>
                  </div>
              </div>

              {/* 3. COMMUNITY */}
              <a href="https://discord.gg/" target="_blank" className="group relative rounded-3xl overflow-hidden cursor-pointer shadow-sm hover:shadow-xl transition border border-slate-200 bg-indigo-600">
                  <motion.div whileHover={{ scale: 1.1 }} className="absolute inset-0 opacity-40 mix-blend-multiply">
                      <img src={LANDING_ASSETS.community} alt="Community" className="w-full h-full object-cover" />
                  </motion.div>
                  <div className="absolute inset-0 p-6 flex flex-col justify-between">
                      <Users className="w-8 h-8 text-white" />
                      <div>
                        <h3 className="font-bold text-xl text-white">The Jungle</h3>
                        <p className="text-white/80 text-xs">Join 10k+ Minglers</p>
                      </div>
                  </div>
              </a>

              {/* 4. STICKERS */}
              <div className="group relative rounded-3xl overflow-hidden cursor-pointer shadow-sm hover:shadow-xl transition border border-slate-200 bg-yellow-400">
                   <motion.div whileHover={{ rotate: 5, scale: 1.1 }} className="absolute inset-0 flex items-center justify-center p-4">
                      <img src={LANDING_ASSETS.stickers} alt="Stickers" className="w-3/4 h-3/4 object-contain drop-shadow-lg" />
                  </motion.div>
                  <div className="absolute bottom-4 left-6">
                      <h3 className="font-bold text-lg text-slate-900 flex items-center gap-2">
                        <StickyNote className="w-4 h-4"/> Sticker Pack
                      </h3>
                  </div>
              </div>

              {/* 5. CAVA (Inventory) - MANTENIDO COMO "LA CAVA" */}
              <div className="group relative rounded-3xl overflow-hidden cursor-pointer shadow-sm hover:shadow-xl transition border border-slate-200 bg-stone-800">
                  <motion.div whileHover={{ scale: 1.05 }} className="absolute inset-0 opacity-60">
                      <img src={LANDING_ASSETS.cava} alt="Cava" className="w-full h-full object-cover" />
                  </motion.div>
                  <div className="absolute inset-0 p-6 flex flex-col justify-center items-center text-center">
                      {/*<Warehouse className="w-8 h-8 text-white mb-2" />*/}
                      {/* Aquí se mantiene La Cava */}
                      <h3 className="font-bold text-lg text-white">La Cava</h3>
                      <span className="text-[10px] font-bold bg-red-600 text-white px-2 py-0.5 rounded mt-2">COMING SOON</span>
                  </div>
              </div>

              {/* 6. LIVESTREAMS */}
              <div className="group relative rounded-3xl overflow-hidden cursor-pointer shadow-sm hover:shadow-xl transition border border-slate-200 bg-red-600">
                  <motion.div whileHover={{ scale: 1.05 }} className="absolute inset-0">
                      <img src={LANDING_ASSETS.livestream} alt="Live" className="w-full h-full object-cover opacity-50 mix-blend-overlay" />
                  </motion.div>
                  <div className="absolute inset-0 p-6 flex items-center justify-center">
                       <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition">
                           <Play className="w-5 h-5 text-red-600 ml-1 fill-red-600" />
                       </div>
                  </div>
                  <div className="absolute bottom-4 left-6">
                      <h3 className="font-bold text-white">Livestreams</h3>
                  </div>
              </div>

          </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="bg-white border-t border-slate-200 py-12">
          <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="flex items-center gap-2">
                 <img src={LANDING_ASSETS.logo} alt="Logo" className="w-8 h-8 rounded opacity-80" />
                 <span className="font-bold text-slate-400">© 2026 Mingles</span>
              </div>
              <div className="flex gap-6 text-sm font-bold text-slate-500">
                  <a href="#" className="hover:text-red-600 transition">Twitter / X</a>
                  <a href="#" className="hover:text-red-600 transition">Instagram</a>
                  <a href="#" className="hover:text-red-600 transition">Terms</a>
              </div>
          </div>
      </footer>

    </div>
  );
}