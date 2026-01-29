'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Heart, Gem, ExternalLink, Info, AlertCircle } from 'lucide-react';

interface JoinModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Usamos las imágenes que ya tienes para el "Showcase"
const PREVIEW_NFTS = [
  "/images/MinglesMiniaturaLogoRojo-03.png", 
  "/images/Screenshot 2025-08-15 at 12.32.48 p.m..png",
  "/images/Screenshot 2026-01-23 at 10.15.16 p.m..jpg",
  "/images/Screenshot 2026-01-08 at 9.57.29 p.m..jpg"
];

export default function JoinModal({ isOpen, onClose }: JoinModalProps) {
  const [showDisclaimer, setShowDisclaimer] = useState(false);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 overflow-y-auto">
          {/* Backdrop Blur */}
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-mingles-black/80 backdrop-blur-sm"
          />
          
          {/* Modal Container */}
          <motion.div 
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative bg-mingles-white w-full max-w-4xl rounded-3xl border-4 border-mingles-black p-6 md:p-10 shadow-pop overflow-hidden z-10 my-8"
          >
            <button 
              onClick={onClose} 
              className="absolute top-4 right-4 p-2 bg-mingles-beige rounded-full border-2 border-mingles-black hover:bg-mingles-red hover:text-white transition-colors z-20"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="text-center mb-10">
              <h2 className="text-4xl md:text-5xl font-black text-mingles-black uppercase tracking-tighter mb-2">
                Choose Your Path
              </h2>
              <p className="text-lg font-bold text-mingles-black/60">
                Support the culture or own a piece of it.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative">
              
              {/* OPCIÓN 1: MONTHLY SUPPORTER */}
              <div className="bg-mingles-beige rounded-2xl border-2 border-mingles-black p-6 flex flex-col relative overflow-hidden group hover:shadow-pop transition-all">
                <div className="absolute top-0 right-0 bg-mingles-black text-white text-xs font-black px-3 py-1 rounded-bl-xl">
                  WEB2 FRIENDLY
                </div>
                
                <div className="w-16 h-16 bg-white border-2 border-mingles-black rounded-full flex items-center justify-center mb-4 text-mingles-red shadow-sm">
                   <Heart className="w-8 h-8 fill-current" />
                </div>
                
                <h3 className="text-2xl font-black uppercase mb-2">Mingles Supporter</h3>
                <p className="text-sm font-medium opacity-70 mb-6 flex-grow">
                  Love the vibe? Help the project grow, keep the servers running, and fuel the tequila fund.
                </p>

                <div className="text-center mb-6">
                   <span className="text-4xl font-black">$5</span>
                   <span className="text-sm font-bold opacity-60">/ USD Month</span>
                </div>

                <a 
                  href="#" // <--- AQUÍ PONDRÁS TU LINK DE STRIPE
                  target="_blank"
                  className="w-full py-4 bg-white border-2 border-mingles-black rounded-xl font-black text-lg hover:bg-mingles-red hover:text-white transition-colors text-center flex items-center justify-center gap-2"
                >
                  Support Now <Heart className="w-4 h-4" />
                </a>
              </div>

              {/* OPCIÓN 2: LIFETIME MEMBER (NFT) */}
              <div className="bg-mingles-black text-mingles-beige rounded-2xl border-2 border-mingles-black p-6 flex flex-col relative overflow-hidden group hover:shadow-pop transition-all">
                <div className="absolute top-0 right-0 bg-mingles-red text-white text-xs font-black px-3 py-1 rounded-bl-xl border-l-2 border-b-2 border-mingles-black">
                  LIFETIME ACCESS
                </div>

                <div className="flex items-center gap-3 mb-4">
                    <div className="w-16 h-16 bg-mingles-red border-2 border-white rounded-full flex items-center justify-center text-white shadow-sm">
                       <Gem className="w-8 h-8" />
                    </div>
                    <div>
                        <h3 className="text-2xl font-black uppercase leading-none">Mingles Holder</h3>
                        <p className="text-xs font-bold opacity-60">The Official Collection</p>
                    </div>
                </div>

                {/* SHOWCASE DE COLECCIÓN */}
                <div className="grid grid-cols-4 gap-2 mb-6">
                    {PREVIEW_NFTS.map((src, i) => (
                        <div key={i} className="aspect-square rounded-lg border border-mingles-beige/30 overflow-hidden bg-white/10">
                            <img src={src} className="w-full h-full object-cover opacity-80 hover:opacity-100 transition-opacity" alt="NFT" />
                        </div>
                    ))}
                </div>
                
                <p className="text-sm font-medium opacity-70 mb-6 flex-grow">
                  Own the asset. Get voting rights, exclusive drops, and full access to the Lair.
                </p>

                <div className="flex flex-col gap-3 mt-auto">
                    <a 
                      href="#" // <--- LINK MAGIC EDEN
                      className="w-full py-3 bg-mingles-red border-2 border-transparent hover:border-white rounded-xl font-black text-white hover:bg-mingles-red/90 transition-colors text-center flex items-center justify-center gap-2"
                    >
                      Buy on Magic Eden <ExternalLink className="w-4 h-4"/>
                    </a>
                    <a 
                      href="#" // <--- LINK OPENSEA
                      className="w-full py-3 bg-transparent border-2 border-mingles-beige/30 rounded-xl font-bold text-mingles-beige hover:bg-mingles-beige hover:text-mingles-black transition-colors text-center flex items-center justify-center gap-2"
                    >
                      Buy on OpenSea
                    </a>
                </div>
              </div>
            </div>

            {/* DISCLAIMER SECTION */}
            <div className="mt-8 pt-6 border-t-2 border-mingles-black/10 text-center">
                <button 
                    onClick={() => setShowDisclaimer(!showDisclaimer)}
                    className="text-xs font-bold text-mingles-black/40 hover:text-mingles-black flex items-center justify-center gap-1 mx-auto"
                >
                    <AlertCircle className="w-3 h-3" /> 
                    {showDisclaimer ? "Hide Disclaimer" : "Read Disclaimer"}
                </button>
                
                {showDisclaimer && (
                    <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        className="text-[10px] text-left text-mingles-black/60 mt-4 bg-mingles-beige p-4 rounded-xl border border-mingles-black/20"
                    >
                        <p className="font-bold mb-1">DISCLAIMER:</p>
                        <p>
                            Mingles NFTs are digital collectibles created for entertainment and community purposes. 
                            They are not investment contracts, securities, or financial instruments. 
                            The $5/month support option is a voluntary donation to support the creators and server costs; it does not grant equity or profit-sharing rights. 
                            Values of digital assets can fluctuate. Please do your own research before purchasing. 
                            Drink responsibly. Mint responsibly.
                        </p>
                    </motion.div>
                )}
            </div>

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}