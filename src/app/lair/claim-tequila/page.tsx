'use client';

import React, { useState } from 'react';
import { useAccount } from 'wagmi';
import { supabase } from '@/components/engine/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Ticket, AlertCircle, Loader2, PartyPopper, 
  RefreshCcw, ShoppingBag, Trophy, Info, 
  TrendingUp, DollarSign, Wine
} from 'lucide-react';
import { ConnectWalletView } from '@/components/ConnectWalletView';

export default function ClaimTequilaPage() {
  const { address, isConnected } = useAccount();

  // Estados de UI
  const [code, setCode] = useState("");
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState("");
  const [rewardAmount, setRewardAmount] = useState(0);

  // --- HANDLER: REDEEM CODE (Conexión a Supabase) ---
  const handleRedeem = async () => {
    if (!code || !address) return;
    setStatus('loading');
    setMessage("");

    try {
      // Llamada a la función RPC segura en Supabase "claim_code"
      const { data, error } = await supabase.rpc('claim_code', {
        p_code: code.trim(),
        p_wallet: address
      });

      if (error) throw error;

      if (data.success) {
        setRewardAmount(data.points);
        setStatus('success');
        setCode(""); // Limpiar input
      } else {
        setStatus('error');
        setMessage(data.message || "Invalid or Expired Code");
      }

    } catch (err) {
      console.error(err);
      setStatus('error');
      setMessage("Connection error. Please try again.");
    }
  };

  if (!isConnected) {
    return (
      <ConnectWalletView />
    );
  }

  return (
    <div className="max-w-5xl mx-auto pb-20 px-4 md:px-0 space-y-16">
      
      {/* --- HEADER --- */}
      <div className="text-center space-y-4">
        <div className="inline-block bg-[#E15162] p-4 rounded-3xl border-4 border-[#1D1D1D] shadow-[6px_6px_0_0_#1D1D1D] mb-4">
           <Ticket size={48} className="text-white" />
        </div>
        <h1 className="text-5xl md:text-6xl font-black uppercase text-[#1D1D1D] leading-none">
          Redeem <span className="text-[#E15162]">$TEQUILA</span>
        </h1>
        <p className="text-lg font-bold text-[#1D1D1D]/60 max-w-2xl mx-auto">
          The only way to earn $TEQUILA is by supporting the ecosystem. 
          Enter codes from <strong>Bottle Purchases</strong>, <strong>Memberships</strong>, or <strong>Community Raids</strong>.
        </p>
      </div>

      {/* --- REDEMPTION CARD --- */}
      <div className="max-w-xl mx-auto bg-white p-2 rounded-[2.5rem] border-4 border-[#1D1D1D] shadow-[12px_12px_0_0_#1D1D1D] relative overflow-hidden">
         
         {/* Success Overlay Animation */}
         <AnimatePresence>
            {status === 'success' && (
               <motion.div 
                 initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                 className="absolute inset-0 bg-[#E15162] z-20 flex flex-col items-center justify-center text-white rounded-[2rem]"
               >
                  <motion.div 
                    initial={{ scale: 0.5 }} animate={{ scale: 1.2 }} 
                    className="bg-white text-[#E15162] p-4 rounded-full border-4 border-[#1D1D1D] mb-4"
                  >
                     <PartyPopper size={48} />
                  </motion.div>
                  <h2 className="text-3xl font-black uppercase">Code Redeemed!</h2>
                  <p className="text-xl font-bold">+{rewardAmount} $TEQUILA Added</p>
                  <button onClick={() => setStatus('idle')} className="mt-6 bg-[#1D1D1D] text-white px-6 py-2 rounded-xl font-black uppercase text-sm hover:bg-white hover:text-[#1D1D1D] transition-colors">
                     Redeem Another
                  </button>
               </motion.div>
            )}
         </AnimatePresence>

         <div className="bg-[#EDEDD9] rounded-[2rem] p-8 md:p-10 border-2 border-[#1D1D1D]/10 text-center space-y-6">
            
            {/* Input Field */}
            <div className="space-y-2">
               <label className="text-xs font-black uppercase text-[#1D1D1D]/50 tracking-widest">Enter Unique Code</label>
               <div className="relative">
                  <input 
                    value={code}
                    onChange={(e) => { setCode(e.target.value.toUpperCase()); setStatus('idle'); }}
                    placeholder="BOTTLE-XXXX-XXXX"
                    className="w-full bg-white border-4 border-[#1D1D1D] rounded-2xl p-4 text-center font-mono text-2xl md:text-3xl font-black uppercase text-[#1D1D1D] placeholder:text-[#1D1D1D]/20 outline-none focus:border-[#E15162] transition-colors"
                  />
                  {status === 'error' && (
                     <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="absolute -bottom-8 left-0 right-0 flex justify-center items-center gap-1 text-red-600 font-bold text-xs">
                        <AlertCircle size={12} /> {message}
                     </motion.div>
                  )}
               </div>
            </div>

            <button 
               onClick={handleRedeem}
               disabled={!code || status === 'loading'}
               className="w-full bg-[#1D1D1D] text-white py-4 rounded-xl font-black text-xl uppercase shadow-[4px_4px_0_0_#E15162] hover:translate-y-[-2px] hover:shadow-[6px_6px_0_0_#E15162] active:translate-y-[0px] active:shadow-none transition-all disabled:opacity-50 disabled:pointer-events-none flex justify-center items-center gap-2"
            >
               {status === 'loading' ? <Loader2 className="animate-spin" /> : "Verify & Claim"}
            </button>
         </div>
      </div>


      {/* --- THE REAL WORLD FLYWHEEL --- */}
      <section className="mt-20">
         <div className="text-center mb-10 space-y-2">
            <h2 className="text-3xl md:text-4xl font-black uppercase text-[#1D1D1D] flex items-center justify-center gap-3">
               <RefreshCcw className="text-[#E15162] w-8 h-8 md:w-10 md:h-10"/> The Mingles Flywheel
            </h2>
            <p className="text-sm font-bold opacity-60 max-w-xl mx-auto">
               Sustainable value driven by Real World Assets (RWA) and Product Sales. Not hype.
            </p>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* STEP 1: SALES */}
            <div className="bg-white p-8 rounded-[2.5rem] border-4 border-[#1D1D1D] flex flex-col items-center text-center relative overflow-hidden group hover:-translate-y-1 transition-transform">
               <div className="absolute top-0 right-0 bg-[#E15162] text-white px-4 py-1 rounded-bl-2xl font-black text-xs uppercase">Step 1</div>
               <div className="bg-green-100 p-5 rounded-full border-2 border-green-600 mb-6 text-green-700">
                  <ShoppingBag size={36} />
               </div>
               <h3 className="text-xl font-black uppercase mb-3 text-[#1D1D1D]">Real Sales</h3>
               <p className="text-sm font-bold text-[#1D1D1D]/60 leading-relaxed">
                  We sell <strong>Physical Bottles</strong> and <strong>Monthly Memberships</strong> to non-NFT holders. Every product contains a unique code that brings users into our ecosystem.
               </p>
            </div>

            {/* STEP 2: BUYBACKS */}
            <div className="bg-white p-8 rounded-[2.5rem] border-4 border-[#1D1D1D] flex flex-col items-center text-center relative overflow-hidden group hover:-translate-y-1 transition-transform">
               <div className="absolute top-0 right-0 bg-[#E15162] text-white px-4 py-1 rounded-bl-2xl font-black text-xs uppercase">Step 2</div>
               <div className="bg-blue-100 p-5 rounded-full border-2 border-blue-600 mb-6 text-blue-700">
                  <TrendingUp size={36} />
               </div>
               <h3 className="text-xl font-black uppercase mb-3 text-[#1D1D1D]">Value Injection</h3>
               <p className="text-sm font-bold text-[#1D1D1D]/60 leading-relaxed">
                  A percentage of every bottle & membership sale goes directly to <strong>Buyback Mingles</strong> from the secondary market (Sweeping the Floor) and funding Community Prizes.
               </p>
            </div>

            {/* STEP 3: GROWTH */}
            <div className="bg-white p-8 rounded-[2.5rem] border-4 border-[#1D1D1D] flex flex-col items-center text-center relative overflow-hidden group hover:-translate-y-1 transition-transform">
               <div className="absolute top-0 right-0 bg-[#E15162] text-white px-4 py-1 rounded-bl-2xl font-black text-xs uppercase">Step 3</div>
               <div className="bg-yellow-100 p-5 rounded-full border-2 border-yellow-600 mb-6 text-yellow-700">
                  <Trophy size={36} />
               </div>
               <h3 className="text-xl font-black uppercase mb-3 text-[#1D1D1D]">Community Rewards</h3>
               <p className="text-sm font-bold text-[#1D1D1D]/60 leading-relaxed">
                  More sales = More buybacks = Higher value. We reward active members with <strong>$TEQUILA</strong>, which can be used for exclusive Merch, Whitelists, and IRL Events.
               </p>
            </div>

         </div>

         {/* ARROW CONNECTORS (Mobile hidden, Desktop visible) */}
         {/* <div className="hidden md:flex justify-between px-20 -mt-4 mb-4 text-[#1D1D1D]/20">
             <ArrowRight size={48} />
             <ArrowRight size={48} />
         </div> */}

         {/* SUMMARY BANNER */}
         <div className="mt-8 bg-[#1D1D1D] text-[#EDEDD9] p-6 rounded-2xl text-center border-4 border-[#E15162] shadow-lg">
             <p className="font-black uppercase text-lg md:text-xl flex items-center justify-center gap-2">
                <Wine size={24} className="text-[#E15162]"/> 
                Sustainable Ecosystem: Powered by Real Revenue, Not Inflation.
             </p>
         </div>
      </section>

      {/* --- DISCLAIMER --- */}
      <footer className="mt-16 border-t-2 border-[#1D1D1D]/10 pt-8 text-center px-4">
         <div className="inline-flex items-start gap-3 bg-[#EDEDD9] p-6 rounded-2xl border border-[#1D1D1D]/20 text-left max-w-3xl">
            <Info size={32} className="text-[#1D1D1D] shrink-0 mt-0.5" />
            <div>
               <p className="text-xs font-black uppercase text-[#1D1D1D] mb-1">Legal Disclaimer</p>
               <p className="text-[10px] md:text-xs font-bold text-[#1D1D1D]/60 leading-relaxed">
                  $TEQUILA is a <strong>community loyalty point system</strong> designed solely for entertainment and engagement within the Mingles ecosystem. 
                  It is <strong>NOT a cryptocurrency</strong>, has <strong>NO monetary value</strong>, and cannot be exchanged for fiat currency or other cryptocurrencies on any exchange. 
                  Points are generated via product purchases and participation, and are non-transferable. The Mingles team reserves the right to adjust the system to ensure fair play.
               </p>
            </div>
         </div>
      </footer>

    </div>
  );
}

function ArrowRight({ size, className }: { size: number, className?: string }) {
    return (
        <svg 
            width={size} height={size} viewBox="0 0 24 24" fill="none" 
            stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" 
            className={`rotate-90 md:rotate-0 ${className}`}
        >
            <path d="M5 12h14" />
            <path d="M12 5l7 7-7 7" />
        </svg>
    )
}