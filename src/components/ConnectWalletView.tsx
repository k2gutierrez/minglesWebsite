'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Wallet, Mail, Gift, ShieldCheck, ArrowRight, ExternalLink } from 'lucide-react';
import { LairConnectButton } from '@/components/LairConnectButton';

export const ConnectWalletView = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4">
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl w-full bg-white rounded-[3rem] border-4 border-[#1D1D1D] shadow-[12px_12px_0_0_#1D1D1D] overflow-hidden"
      >
        
        {/* HEADER: EL BENEFICIO CLARO */}
        <div className="bg-[#1D1D1D] text-[#EDEDD9] p-8 text-center relative overflow-hidden">
          {/* Background decoration */}
          <Wallet size={180} className="absolute -bottom-10 -left-10 text-white opacity-5 rotate-12" />
          
          <h1 className="text-3xl md:text-4xl font-black uppercase mb-4 relative z-10">
            Unlock Your Rewards
          </h1>
          <p className="text-sm md:text-base font-bold opacity-80 max-w-md mx-auto relative z-10 leading-relaxed">
            To earn <span className="text-[#E15162]">$TEQUILA</span> and receive exclusive collectibles, 
            we need a safe place to send them. That place is your <span className="text-white underline decoration-[#E15162] decoration-4 underline-offset-4">Digital Wallet</span>.
          </p>
        </div>

        <div className="p-8 md:p-10 space-y-10">
          
          {/* SECTION 1: WHAT IS IT? (Education) */}
          <div className="flex gap-4 items-start">
             <div className="bg-[#EDEDD9] p-3 rounded-2xl border-2 border-[#1D1D1D] shrink-0">
                <ShieldCheck size={28} className="text-[#1D1D1D]" />
             </div>
             <div>
                <h3 className="font-black uppercase text-lg text-[#1D1D1D]">It's just your Digital ID</h3>
                <p className="text-sm font-bold text-[#1D1D1D]/60 leading-relaxed mt-1">
                   Mingles operates on blockchain technology to ensure every collectible is truly yours. 
                   Your wallet acts as your login and your backpack for rewards.
                </p>
             </div>
          </div>

          {/* SECTION 2: THE EASY PATH (Glyph) */}
          <div className="bg-[#E15162] rounded-3xl p-6 text-white border-4 border-[#1D1D1D] relative group">
             <div className="absolute top-0 right-0 bg-[#1D1D1D] text-white text-[10px] font-black uppercase px-3 py-1 rounded-bl-xl">
                New User? Start Here
             </div>
             
             <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="bg-white/20 p-4 rounded-full">
                   <Mail size={32} />
                </div>
                <div className="flex-1 text-center md:text-left">
                   <h3 className="font-black uppercase text-xl mb-1">No Wallet? No Problem.</h3>
                   <p className="text-xs font-bold opacity-90 mb-4">
                      Create one instantly using just your email. It's safe, fast, and free.
                   </p>
                   <a 
                     href="https://useglyph.io" 
                     target="_blank" 
                     rel="noreferrer"
                     className="inline-flex items-center gap-2 bg-white text-[#E15162] px-5 py-2 rounded-xl font-black uppercase text-xs hover:bg-[#1D1D1D] hover:text-white transition-colors shadow-sm"
                   >
                      Create Wallet with Email <ExternalLink size={14} />
                   </a>
                </div>
             </div>
          </div>

          {/* SECTION 3: THE ACTION (Connect) */}
          <div className="text-center space-y-4 pt-4 border-t-2 border-[#1D1D1D]/10">
             <p className="text-xs font-black uppercase text-[#1D1D1D]/40">
                Already have an email or wallet setup?
             </p>
             
             <div className="flex justify-center">
                {/* Usamos tu botón existente, pero centrado y grande */}
                <div className="scale-110"> 
                   <LairConnectButton isMobile={false} /> 
                </div>
             </div>
          </div>

        </div>

      </motion.div>
    </div>
  );
};