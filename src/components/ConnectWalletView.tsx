'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Wallet, Gift, Mail, ArrowDown, ExternalLink } from 'lucide-react';
import { LairConnectButton } from '@/components/LairConnectButton';
import Link from 'next/link';

export const ConnectWalletView = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 py-10">
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full bg-white rounded-[3rem] border-4 border-[#1D1D1D] shadow-[12px_12px_0_0_#1D1D1D] overflow-hidden relative"
      >
        
        {/* 1. VISUAL HOOK: THE REWARDS */}
        <div className="bg-[#E15162] p-8 flex flex-col items-center text-center relative overflow-hidden">
           {/* Background Icons */}
           <Gift size={120} className="absolute -top-6 -right-6 text-white opacity-10 rotate-12" />
           <Wallet size={100} className="absolute -bottom-8 -left-8 text-white opacity-10 -rotate-12" />
           
           <div className="bg-white p-4 rounded-full border-4 border-[#1D1D1D] shadow-sm z-10 mb-4 relative">
              <Gift size={48} className="text-[#E15162]" />
              {/* Floating decorative elements */}
              <motion.div animate={{ y: [-5, 5, -5] }} transition={{ repeat: Infinity, duration: 2 }} className="absolute -top-2 -right-2 bg-[#EDEDD9] border-2 border-[#1D1D1D] text-[10px] font-black px-2 py-0.5 rounded-full">$TEQ</motion.div>
              <motion.div animate={{ y: [5, -5, 5] }} transition={{ repeat: Infinity, duration: 2.5 }} className="absolute -bottom-1 -left-3 bg-[#EDEDD9] border-2 border-[#1D1D1D] text-[10px] font-black px-2 py-0.5 rounded-full">NFTs</motion.div>
           </div>

           <h1 className="text-3xl font-black uppercase text-white mb-2 z-10 leading-none">
              Want Rewards?
           </h1>
           <p className="text-sm font-bold text-white/90 leading-tight max-w-[200px] z-10">
              You need a place to keep them.
           </p>
        </div>

        {/* 2. THE SIMPLE EXPLANATION (Graphic Flow) */}
        <div className="p-8 flex flex-col items-center space-y-6 bg-[#EDEDD9]">
           
           {/* Metaphor */}
           <div className="flex items-center gap-4 bg-white p-4 rounded-2xl border-2 border-[#1D1D1D] w-full">
              <div className="bg-[#1D1D1D] p-2 rounded-xl shrink-0">
                 <Wallet size={24} className="text-white" />
              </div>
              <div>
                 <h3 className="font-black uppercase text-sm text-[#1D1D1D]">A Wallet is just...</h3>
                 <p className="text-xs font-bold text-[#1D1D1D]/60 leading-tight">
                    Your secure digital backpack & ID for Mingles.
                 </p>
              </div>
           </div>

           <ArrowDown size={24} className="text-[#1D1D1D]/20 animate-bounce" />

           {/* The Action Area */}
           <div className="w-full text-center space-y-4 relative z-20">
              <div className="scale-110 inline-block">
                 {/* Este botón abre el modal de Rainbowkit/Glyph */}
                 <LairConnectButton isMobile={false} />
              </div>
              
              <p className="text-xs font-black uppercase text-[#1D1D1D]/40">
                 Click to connect or create one
              </p>
           </div>
        </div>

        {/* 3. THE EASY PATH FOOTER */}
        <Link
           href="https://useglyph.io" 
           target="_blank" 
           rel="noreferrer"
           className="block bg-[#1D1D1D] p-4 text-center text-white hover:bg-[#E15162] transition-colors group"
        >
           <div className="flex items-center justify-center gap-2 text-xs font-bold uppercase opacity-80 group-hover:opacity-100">
              <Mail size={16} />
              New? Create a wallet easily with Email via Glyph 
              <ExternalLink size={12} />
           </div>
        </Link>

      </motion.div>
    </div>
  );
};