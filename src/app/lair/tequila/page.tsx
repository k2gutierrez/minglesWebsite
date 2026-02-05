'use client';

import React from 'react';

export default function TequilaPage() {
  const STAGES = [
    { name: "Harvest", done: true },
    { name: "Cooking", done: true },
    { name: "Fermentation", done: true },
    { name: "Distillation", done: false },
    { name: "Aging", done: false },
    { name: "Bottling", done: false },
  ];

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-end mb-12 border-b-4 border-[#1D1D1D] pb-6 gap-4">
        <div>
           <h1 className="text-4xl font-black uppercase text-[#1D1D1D]">Production Status</h1>
           <p className="opacity-70 font-bold">Batch #001 - "Genesis Reposado"</p>
        </div>
        <div className="bg-white border-2 border-[#1D1D1D] px-4 py-2 rounded-xl font-bold shadow-[4px_4px_0_0_#1D1D1D]">
           ETA: Q4 2026
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
         {/* Visual Status */}
         <div className="bg-white p-8 rounded-3xl border-4 border-[#1D1D1D] shadow-[4px_4px_0_0_#1D1D1D] h-fit">
            <h3 className="font-black text-xl uppercase mb-6">Process Timeline</h3>
            <div className="space-y-6 relative">
               <div className="absolute left-[11px] top-2 bottom-2 w-1 bg-[#EDEDD9]"></div>
               {STAGES.map((stage, i) => (
                  <div key={i} className="flex items-center gap-4 relative z-10">
                     <div className={`w-6 h-6 rounded-full border-2 border-[#1D1D1D] flex items-center justify-center ${stage.done ? 'bg-[#E15162]' : 'bg-white'}`}>
                        {stage.done && <div className="w-2 h-2 bg-white rounded-full"></div>}
                     </div>
                     <span className={`font-bold text-lg ${stage.done ? 'text-[#1D1D1D]' : 'opacity-40'}`}>{stage.name}</span>
                  </div>
               ))}
            </div>
         </div>

         {/* Bottle Preview */}
         <div className="bg-[#EDEDD9] rounded-3xl border-4 border-[#1D1D1D] flex items-center justify-center p-12 relative overflow-hidden">
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#1D1D1D_2px,transparent_2px)] [background-size:16px_16px]"></div>
            <div className="w-48 h-96 bg-white rounded-t-full rounded-b-3xl border-4 border-[#1D1D1D] shadow-2xl relative z-10 flex items-center justify-center">
               <span className="font-black -rotate-90 text-2xl opacity-20 uppercase tracking-widest">Bottle Render</span>
            </div>
         </div>
      </div>
    </div>
  );
}