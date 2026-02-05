'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Construction, ArrowLeft, Clock, Hammer } from 'lucide-react';

export default function ComingSoonPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: "spring", bounce: 0.5 }}
        className="max-w-lg w-full bg-white rounded-3xl border-4 border-[#1D1D1D] shadow-[8px_8px_0_0_#1D1D1D] overflow-hidden relative"
      >
        {/* Striped Warning Header */}
        <div className="h-4 w-full bg-[repeating-linear-gradient(45deg,#E15162,#E15162_10px,#1D1D1D_10px,#1D1D1D_20px)] opacity-20"></div>

        <div className="p-8 md:p-12 text-center">
           
           {/* Icon Animation */}
           <div className="relative inline-block mb-8">
              <div className="w-24 h-24 bg-[#EDEDD9] rounded-full border-4 border-[#1D1D1D] flex items-center justify-center relative z-10">
                 <Hammer className="w-10 h-10 text-[#1D1D1D] animate-bounce" />
              </div>
              <div className="absolute top-0 right-0 -mr-2 -mt-2 bg-[#E15162] text-white p-2 rounded-full border-2 border-[#1D1D1D] animate-pulse">
                 <Clock size={16} />
              </div>
           </div>

           <h1 className="text-4xl md:text-5xl font-black uppercase text-[#1D1D1D] mb-4 leading-none tracking-tight">
             Work in <br/> <span className="text-[#E15162]">Progress</span>
           </h1>
           
           <p className="text-lg font-bold text-[#1D1D1D]/60 mb-8 leading-relaxed">
             The worms are currently building this section of the Lair. We are distilling something special here.
           </p>

           <div className="space-y-3">
              <div className="bg-[#EDEDD9] px-4 py-2 rounded-lg border-2 border-[#1D1D1D] inline-block mb-6 rotate-1">
                 <span className="font-mono font-bold text-xs uppercase tracking-widest text-[#1D1D1D]">ETA: Coming Soon</span>
              </div>

              <Link 
                href="/lair"
                className="w-full block bg-[#1D1D1D] text-white py-4 rounded-xl font-black text-lg border-2 border-[#1D1D1D] hover:bg-white hover:text-[#1D1D1D] hover:shadow-[4px_4px_0_0_#1D1D1D] transition-all flex items-center justify-center gap-2 group"
              >
                <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                Return to Dashboard
              </Link>
           </div>
        </div>

        {/* Footer Decoration */}
        <div className="bg-[#EDEDD9] p-4 border-t-4 border-[#1D1D1D] text-center">
           <p className="text-[10px] font-black uppercase opacity-40">Mingles Construction Crew</p>
        </div>
      </motion.div>

    </div>
  );
}