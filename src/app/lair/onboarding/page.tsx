'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Play } from 'lucide-react';

export default function OnboardingPage() {
  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8 border-b-4 border-[#1D1D1D] pb-6">
        <h1 className="text-4xl font-black uppercase text-[#1D1D1D]">Onboarding</h1>
        <p className="opacity-70 font-bold">Learn the ropes of the jungle.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {[1, 2, 3, 4].map((v) => (
          <motion.div 
            key={v}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: v * 0.1 }}
            className="group bg-white rounded-3xl border-4 border-[#1D1D1D] overflow-hidden shadow-[4px_4px_0_0_#1D1D1D]"
          >
            {/* Placeholder de Video */}
            <div className="aspect-video bg-[#1D1D1D] relative flex items-center justify-center cursor-pointer">
               <div className="w-16 h-16 bg-[#E15162] rounded-full flex items-center justify-center border-2 border-white group-hover:scale-110 transition-transform">
                  <Play className="fill-white text-white ml-1" />
               </div>
               <span className="absolute bottom-4 right-4 bg-black/70 text-white text-xs font-bold px-2 py-1 rounded">04:20</span>
            </div>
            <div className="p-6">
               <h3 className="font-black text-xl uppercase mb-2">Video Title {v}: How to Stake</h3>
               <p className="text-sm opacity-60 font-medium">Learn how to send your Mingles to raids and earn tequila points.</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}