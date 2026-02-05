'use client';

import React, { useState, useEffect } from 'react';
import { useAtomValue } from 'jotai'; 
import { minglesAtom, isLoadingMinglesAtom } from '@/components/engine/atoms'; 
import { useAccount } from 'wagmi';
import { supabase } from '@/components/engine/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, Copy, Wine, Users, ExternalLink, 
  Edit3, Save, Share2, Loader2, Zap, 
  X, Download, Maximize2, ScanEye
} from 'lucide-react';

// --- UTILIDADES Y TIPOS ---
const TEQUILA_TYPES = ["Blanco", "Reposado", "Añejo", "Cristalino"];

// Interface para el Mingle seleccionado (extiende lo que viene del atom)
interface SelectedMingle {
  id: string;
  name: string;
  image: string;
  type?: string;
  attributes?: any[]; // Para mostrar los traits
}

const getHoldMultiplier = (count: number) => {
  if (count >= 100) return 2.0;
  if (count >= 21) return 1.6;
  if (count >= 11) return 1.4;
  if (count >= 6) return 1.25;
  if (count >= 2) return 1.1;
  return 1.0; 
};

const getSocialMultiplier = (friendsCount: number) => {
  if (friendsCount >= 51) return 1.8;
  if (friendsCount >= 26) return 1.5;
  if (friendsCount >= 11) return 1.3;
  if (friendsCount >= 4) return 1.15;
  if (friendsCount >= 1) return 1.05;
  return 1.0;
};

export default function MyMinglesPage() {
  // 1. Estado Global
  const { address, isConnected } = useAccount();
  const mingles = useAtomValue(minglesAtom);
  const isLoadingMingles = useAtomValue(isLoadingMinglesAtom);
  
  // 2. Estado Local (Perfil)
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [profile, setProfile] = useState({
    username: "New_Mingle",
    code: "LOADING...",
    points: 0,
    friendsCount: 0
  });
  const [isEditing, setIsEditing] = useState(false);
  const [newUsername, setNewUsername] = useState("");

  // 3. Estado Local (Visualización Mingle)
  const [selectedMingle, setSelectedMingle] = useState<SelectedMingle | null>(null);
  const [viewMode, setViewMode] = useState<'bottled' | 'unbottled'>('bottled');

  // --- EFECTO: SUPABASE ---
  useEffect(() => {
    const fetchProfile = async () => {
      if (!address) return;
      setLoadingProfile(true);
      const { data } = await supabase
        .from('users')
        .select('*')
        .eq('wallet_address', address)
        .single();

      if (data) {
        setProfile({
          username: data.username || "Mingle_Member",
          code: data.referral_code || "NO-CODE",
          points: data.points || 0,
          friendsCount: 0 
        });
        setNewUsername(data.username);
      }
      setLoadingProfile(false);
    };

    if (isConnected) fetchProfile();
  }, [address, isConnected]);

  // --- HANDLERS ---
  const handleSaveProfile = async () => {
    if (!address || !newUsername) return;
    const { error } = await supabase
      .from('users')
      .update({ username: newUsername })
      .eq('wallet_address', address);

    if (!error) {
      setProfile(prev => ({ ...prev, username: newUsername }));
      setIsEditing(false);
    } else {
      alert("Error updating profile");
    }
  };

  const holdMult = getHoldMultiplier(mingles.length);
  const socialMult = getSocialMultiplier(profile.friendsCount);
  const totalMult = (holdMult * socialMult).toFixed(2);

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center space-y-4">
        <div className="bg-[#EDEDD9] p-8 rounded-full border-4 border-[#1D1D1D]">
           <User size={64} className="text-[#1D1D1D] opacity-20" />
        </div>
        <h2 className="text-2xl font-black uppercase text-[#1D1D1D]">Wallet Not Connected</h2>
        <p className="font-bold text-[#1D1D1D]/50">Please connect your wallet in the sidebar to view your Lair.</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20 relative">
      
      {/* --- MODAL: MINGLE INSPECTOR (Overlay) --- */}
      <AnimatePresence>
        {selectedMingle && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => setSelectedMingle(null)} // Click outside to close
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }} 
              animate={{ scale: 1, y: 0 }} 
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white w-full max-w-4xl rounded-[2.5rem] border-4 border-[#1D1D1D] overflow-hidden shadow-[0_0_50px_rgba(225,81,98,0.3)] flex flex-col md:flex-row max-h-[90vh]"
              onClick={(e) => e.stopPropagation()} // Prevent close on modal click
            >
              {/* LEFT: IMAGE AREA */}
              <div className="w-full md:w-1/2 bg-[#EDEDD9] relative flex items-center justify-center border-b-4 md:border-b-0 md:border-r-4 border-[#1D1D1D] overflow-hidden group">
                 {/* El Toggle Bottled/Unbottled altera la visualización */}
                 <div className={`relative w-full h-full transition-all duration-700 ease-in-out ${viewMode === 'unbottled' ? 'scale-100' : 'scale-100'}`}>
                    <img 
                      src={viewMode === 'unbottled' ? `https://d9emswcmuvawb.cloudfront.net/${selectedMingle.id}.png` : selectedMingle.image} 
                      className="w-full h-full object-cover" 
                      alt={selectedMingle.name}
                    />
                 </div>

                 {/* Overlay UI on Image */}
                 <div className="absolute top-4 left-4 right-4 flex justify-between z-10">
                    <div className="bg-[#1D1D1D]/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-black uppercase text-[#1D1D1D] border border-[#1D1D1D]/10">
                       ID: {selectedMingle.id}
                    </div>
                    <button onClick={() => setSelectedMingle(null)} className="bg-[#1D1D1D] text-white p-2 rounded-full hover:bg-[#E15162] transition-colors">
                       <X size={20} />
                    </button>
                 </div>

                 {/* TOGGLE SWITCH */}
                 <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex bg-[#1D1D1D] p-1 rounded-full border-2 border-white/20 shadow-xl z-10">
                    <button 
                       onClick={() => setViewMode('bottled')}
                       className={`px-4 py-2 rounded-full text-xs font-black uppercase transition-all ${viewMode === 'bottled' ? 'bg-[#EDEDD9] text-[#1D1D1D]' : 'text-white hover:text-[#EDEDD9]'}`}
                    >
                       Bottled
                    </button>
                    <button 
                       onClick={() => setViewMode('unbottled')}
                       className={`px-4 py-2 rounded-full text-xs font-black uppercase transition-all ${viewMode === 'unbottled' ? 'bg-[#E15162] text-white' : 'text-white hover:text-[#EDEDD9]'}`}
                    >
                       Unbottled
                    </button>
                 </div>
              </div>

              {/* RIGHT: DATA AREA */}
              <div className="w-full md:w-1/2 p-8 flex flex-col bg-white overflow-y-auto">
                 <div className="mb-6">
                    <h2 className="text-4xl font-black uppercase text-[#1D1D1D] leading-[0.9] mb-2">{selectedMingle.name}</h2>
                    <div className="flex gap-2">
                       <span className="bg-[#E15162] text-white px-3 py-1 rounded-lg text-xs font-black uppercase">
                          {selectedMingle.type || 'Tequila Worm'}
                       </span>
                       <span className="bg-[#EDEDD9] text-[#1D1D1D] border border-[#1D1D1D] px-3 py-1 rounded-lg text-xs font-black uppercase flex items-center gap-1">
                          <ScanEye size={12}/> {viewMode === 'bottled' ? 'Full View' : 'Inspection Mode'}
                       </span>
                    </div>
                 </div>

                 {/* Stats / Traits */}
                 <div className="flex-1 space-y-4">
                    <h3 className="text-sm font-black uppercase text-[#1D1D1D]/40 border-b-2 border-[#1D1D1D]/10 pb-2">DNA Analysis</h3>
                    
                    {/* Mock Traits (Si el indexer no trae attributes aún, mostramos placeholders) */}
                    <div className="grid grid-cols-2 gap-3">
                       {['Background', 'Bottle', 'Worm Type', 'Hat', 'Item'].map((trait) => (
                          <div key={trait} className="bg-[#EDEDD9] p-3 rounded-xl border-2 border-[#1D1D1D]/10">
                             <p className="text-[10px] uppercase font-bold text-[#1D1D1D]/50">{trait}</p>
                             <p className="text-sm font-black text-[#1D1D1D]">Loading...</p>
                          </div>
                       ))}
                    </div>
                 </div>

                 {/* Actions Footer */}
                 <div className="mt-8 flex gap-3 pt-6 border-t-2 border-[#1D1D1D]/10">
                    <button className="flex-1 bg-[#1D1D1D] text-white py-4 rounded-xl font-black uppercase hover:bg-[#E15162] transition-colors flex items-center justify-center gap-2">
                       <Download size={18} /> Download
                    </button>
                    <button className="px-4 py-4 border-2 border-[#1D1D1D] rounded-xl hover:bg-[#EDEDD9] transition-colors">
                       <Share2 size={18} />
                    </button>
                    <a 
                       href={`https://opensea.io/assets/ethereum/CONTRACT_ADDRESS/${selectedMingle.id}`} 
                       target="_blank" 
                       rel="noreferrer"
                       className="px-4 py-4 border-2 border-[#1D1D1D] rounded-xl hover:bg-[#EDEDD9] transition-colors"
                    >
                       <ExternalLink size={18} />
                    </a>
                 </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>


      {/* --- DASHBOARD HEADER (Sin cambios) --- */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* LEFT: ID CARD */}
          <div className="lg:col-span-4">
              <div className="bg-[#1D1D1D] text-[#EDEDD9] p-6 rounded-[2.5rem] border-4 border-[#1D1D1D] shadow-[8px_8px_0_0_#E15162] relative overflow-hidden h-full flex flex-col justify-between">
                  <div className="absolute top-0 right-0 p-4 opacity-10">
                      <Wine size={120} />
                  </div>
                  <div>
                      <div className="flex items-center gap-4 mb-6">
                          <div className="w-20 h-20 rounded-2xl border-4 border-[#EDEDD9] overflow-hidden bg-white">
                              <img src={mingles.length > 0 ? mingles[0].image : "/images/placeholder_bottle.png"} className="w-full h-full object-cover"/>
                          </div>
                          <div>
                              <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Operative</p>
                              {isEditing ? (
                                <div className="flex items-center gap-2">
                                  <input value={newUsername} onChange={(e) => setNewUsername(e.target.value)} className="bg-white/10 border border-white/20 rounded px-2 py-1 text-sm font-bold w-32" />
                                  <button onClick={handleSaveProfile} className="bg-[#E15162] p-1 rounded hover:bg-white hover:text-black"><Save size={14}/></button>
                                </div>
                              ) : (
                                <h2 className="text-2xl font-black uppercase leading-none flex items-center gap-2">
                                  {loadingProfile ? "..." : profile.username}
                                  <button onClick={() => setIsEditing(true)} className="opacity-50 hover:opacity-100 hover:text-[#E15162] transition-opacity"><Edit3 size={16} /></button>
                                </h2>
                              )}
                              <div className="flex items-center gap-2 mt-1 bg-white/10 px-2 py-1 rounded-lg w-fit">
                                  <span className="text-xs font-mono font-bold">{profile.code}</span>
                                  <Copy size={12} className="cursor-pointer hover:text-[#E15162]" />
                              </div>
                          </div>
                      </div>
                      <div className="space-y-4">
                          <div>
                              <p className="text-[10px] font-black uppercase opacity-50 mb-1">Total Balance</p>
                              <div className="flex items-baseline gap-2">
                                  <span className="text-5xl font-black text-white">{profile.points}</span>
                                  <span className="text-sm font-bold text-[#E15162]">$TEQUILA</span>
                              </div>
                          </div>
                      </div>
                  </div>
                  <div className="mt-8 bg-[#EDEDD9] text-[#1D1D1D] p-4 rounded-xl flex justify-between items-center">
                      <div>
                          <p className="text-[10px] font-black uppercase opacity-60">Global Multiplier</p>
                          <p className="text-2xl font-black flex items-center gap-1"><Zap size={20} className="fill-current text-[#E15162]" /> x{totalMult}</p>
                      </div>
                      <div className="text-right text-[10px] font-bold opacity-60"><p>Hold: x{holdMult}</p><p>Social: x{socialMult}</p></div>
                  </div>
              </div>
          </div>

          {/* RIGHT: STATISTICS */}
          <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-3xl border-4 border-[#1D1D1D] shadow-[4px_4px_0_0_#1D1D1D] flex flex-col justify-between">
                  <div className="flex justify-between items-start mb-4">
                      <div className="bg-[#EDEDD9] p-3 rounded-xl border-2 border-[#1D1D1D]"><Wine size={24} className="text-[#1D1D1D]" /></div>
                      <span className="text-xs font-black uppercase bg-[#1D1D1D] text-white px-3 py-1 rounded-full">Hold Bonus: x{holdMult}</span>
                  </div>
                  <div>
                      <h3 className="text-4xl font-black text-[#1D1D1D] mb-1">{isLoadingMingles ? <Loader2 className="animate-spin"/> : mingles.length}</h3>
                      <p className="text-sm font-bold text-[#1D1D1D]/50 uppercase">Mingles in Wallet</p>
                  </div>
              </div>
              <div className="bg-white p-6 rounded-3xl border-4 border-[#1D1D1D] shadow-[4px_4px_0_0_#1D1D1D] flex flex-col justify-between">
                  <div className="flex justify-between items-start mb-4">
                      <div className="bg-[#EDEDD9] p-3 rounded-xl border-2 border-[#1D1D1D]"><Users size={24} className="text-[#1D1D1D]" /></div>
                      <span className="text-xs font-black uppercase bg-[#1D1D1D] text-white px-3 py-1 rounded-full">Social Bonus: x{socialMult}</span>
                  </div>
                  <div>
                      <h3 className="text-4xl font-black text-[#1D1D1D] mb-1">{profile.friendsCount}</h3>
                      <p className="text-sm font-bold text-[#1D1D1D]/50 uppercase">Circle Members</p>
                  </div>
              </div>
              <div className="md:col-span-2 bg-[#E15162] p-6 rounded-3xl border-4 border-[#1D1D1D] text-white flex flex-col md:flex-row justify-between items-center gap-6">
                  <div>
                      <h3 className="text-2xl font-black uppercase mb-2">Grow your Circle</h3>
                      <p className="text-sm font-bold opacity-80 max-w-md">Invite friends to join the Lair. Gain +5% multiplier for every member (Max x1.8).</p>
                  </div>
                  <div className="flex gap-2 w-full md:w-auto">
                      <div className="bg-black/20 border-2 border-white/20 rounded-xl px-4 py-3 font-mono text-sm font-bold flex-1 md:flex-none truncate">mingles.wtf/join/{profile.code}</div>
                      <button className="bg-white text-[#E15162] p-3 rounded-xl border-2 border-[#1D1D1D] hover:scale-105 transition-transform shadow-[2px_2px_0_0_#1D1D1D]"><Share2 size={20} /></button>
                  </div>
              </div>
          </div>
      </section>

      {/* --- GALLERY SECTION --- */}
      <section>
          <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                  <div className="bg-[#1D1D1D] text-white p-2 rounded-lg"><Wine size={20} /></div>
                  <h2 className="text-3xl font-black uppercase text-[#1D1D1D]">My Collection</h2>
              </div>
              <div className="flex gap-2">
                  {TEQUILA_TYPES.map(type => (
                      <button key={type} className="hidden md:block px-3 py-1 rounded-lg border-2 border-[#1D1D1D] text-xs font-black uppercase hover:bg-[#1D1D1D] hover:text-white transition-colors">{type}</button>
                  ))}
              </div>
          </div>

          {isLoadingMingles ? (
             <div className="flex justify-center py-20"><Loader2 size={48} className="text-[#1D1D1D] animate-spin" /></div>
          ) : mingles.length === 0 ? (
             <div className="text-center py-20 bg-white rounded-3xl border-4 border-[#1D1D1D] border-dashed">
                <p className="text-xl font-black text-[#1D1D1D] mb-2">No Mingles Found</p>
                <p className="text-sm font-bold text-[#1D1D1D]/50 mb-6">Your cellar is empty. Visit the market to start your collection.</p>
                <button className="bg-[#E15162] text-white px-6 py-3 rounded-xl font-black uppercase border-2 border-[#1D1D1D] shadow-[4px_4px_0_0_#1D1D1D]">Buy Mingle</button>
             </div>
          ) : (
             <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {mingles.map((nft) => (
                   <motion.div 
                      key={nft.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      onClick={() => setSelectedMingle(nft as SelectedMingle)} // CLICK PARA ABRIR MODAL
                      className="group bg-white p-3 rounded-2xl border-4 border-[#1D1D1D] shadow-[4px_4px_0_0_#1D1D1D] hover:translate-y-[-4px] hover:shadow-[6px_6px_0_0_#E15162] transition-all cursor-pointer"
                   >
                      <div className="aspect-square rounded-xl overflow-hidden border-2 border-[#1D1D1D]/10 mb-3 bg-[#EDEDD9] relative">
                          <img src={nft.image} alt={nft.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                          
                          {/* Hover Overlay Icon */}
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                             <Maximize2 className="text-white" size={32} />
                          </div>
                      </div>
                      
                      <div className="flex justify-between items-start">
                          <div>
                              <h3 className="font-black text-sm uppercase text-[#1D1D1D] truncate max-w-[120px]">{nft.name}</h3>
                              <p className="text-[10px] font-bold text-[#1D1D1D]/50">ID: {nft.id || 'Tequila Worm'}</p>
                          </div>
                      </div>
                   </motion.div>
                ))}
             </div>
          )}
      </section>

    </div>
  );
}