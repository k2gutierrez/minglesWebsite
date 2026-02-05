'use client';

import React from 'react';
import { motion } from 'framer-motion';

export default function LorePage() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-12">
        <span className="bg-[#E15162] text-white px-4 py-1 rounded-full font-bold text-xs uppercase mb-4 inline-block border-2 border-[#1D1D1D]">Chapter 1</span>
        <h1 className="text-5xl md:text-7xl font-black uppercase text-[#1D1D1D]">The Origin</h1>
      </div>

      <div className="space-y-12">
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="bg-white p-8 md:p-12 rounded-3xl border-4 border-[#1D1D1D] shadow-[8px_8px_0_0_#1D1D1D]"
        >
          <div className="flex flex-col md:flex-row gap-8 items-center">
             <div className="flex-1">
                <h2 className="text-3xl font-black mb-4 uppercase">In the beginning...</h2>
                <p className="font-medium text-lg leading-relaxed opacity-80 mb-4">
                   Before the blockchain, there was only the agave. Deep in the digital highlands of Jalisco, a glitch occurred during the minting of the first genesis block.
                </p>
                <p className="font-medium text-lg leading-relaxed opacity-80">
                   The worms woke up. They weren't just bait anymore; they were sentient, thirsty, and ready to party on-chain.
                </p>
             </div>
             <div className="w-full md:w-1/3 aspect-[3/4] bg-[#1D1D1D] rounded-2xl border-2 border-[#1D1D1D] rotate-2">
                {/* Image Placeholder */}
             </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
          className="bg-[#E15162] text-white p-8 md:p-12 rounded-3xl border-4 border-[#1D1D1D] shadow-[8px_8px_0_0_#1D1D1D]"
        >
             <h2 className="text-3xl font-black mb-4 uppercase">The Rebellion</h2>
             <p className="font-medium text-lg leading-relaxed">
                They refused to be swallowed. Instead, they built the Lair. A place where every Mingle could stake their claim and earn their keep.
             </p>
        </motion.div>
      </div>
    </div>
  );
}