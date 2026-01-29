'use client';

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';
import { useRouter } from 'next/navigation';
import { X, Mail, Wallet } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const { isConnected } = useAccount();
  const router = useRouter();

  useEffect(() => {
    if (isConnected) {
      setTimeout(() => {
        router.push('/lair'); 
      }, 500);
    }
  }, [isConnected, router]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-mingles-black/60 backdrop-blur-sm"
          />
          
          <motion.div 
            initial={{ scale: 0.9, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, y: 20, opacity: 0 }}
            className="relative bg-mingles-white border-4 border-mingles-black rounded-3xl p-8 w-full max-w-md shadow-pop overflow-hidden"
          >
            <button 
              onClick={onClose} 
              className="absolute top-4 right-4 p-2 bg-mingles-beige rounded-full border-2 border-mingles-black hover:bg-mingles-red hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center mb-8">
              <h2 className="text-3xl font-black text-mingles-black mb-2 uppercase">Member Login</h2>
              <p className="text-mingles-black/70 font-medium">Enter the Jungle.</p>
            </div>

            <div className="space-y-4">
              <button 
                onClick={() => alert("Coming soon!")}
                className="w-full flex items-center justify-center gap-3 py-4 rounded-xl border-2 border-mingles-black font-bold text-lg hover:shadow-pop hover:-translate-y-1 transition-all bg-mingles-beige text-mingles-black"
              >
                <Mail className="w-5 h-5" />
                Login with Email
              </button>

              <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t-2 border-mingles-black/10"></div>
                <span className="flex-shrink mx-4 text-mingles-black/40 font-bold text-xs uppercase">OR WEB3</span>
                <div className="flex-grow border-t-2 border-mingles-black/10"></div>
              </div>

              <div className="flex justify-center w-full">
                <ConnectButton.Custom>
                  {({ openConnectModal, mounted }) => (
                    <button
                      onClick={openConnectModal}
                      disabled={!mounted}
                      className="w-full flex items-center justify-center gap-3 py-4 rounded-xl border-2 border-mingles-black font-bold text-lg hover:shadow-pop hover:-translate-y-1 transition-all bg-mingles-red text-white"
                    >
                      <Wallet className="w-5 h-5" />
                      Connect Wallet
                    </button>
                  )}
                </ConnectButton.Custom>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}