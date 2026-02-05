'use client';

import React, { useState, useEffect } from 'react';
import { useAtomValue } from 'jotai'; 
import { minglesAtom, isLoadingMinglesAtom } from '@/components/engine/atoms'; 
import { useAccount } from 'wagmi';
import { supabase } from '@/components/engine/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, Copy, Wine, Users, Edit3, Save, 
  Share2, Loader2, Zap, X, Download, 
  Maximize2, Plus, Twitter, CheckCircle2
} from 'lucide-react';

// --- TIPOS ---
const TEQUILA_OPTIONS = ["Blanco", "Reposado", "Añejo", "Cristalino"];

interface SelectedMingle {
  id?: string;
  name: string;
  image: string; // Imagen base (Bottled)
  type?: string;
}

interface Friend {
  username: string;
  mingleCount: number;
}

// Multipliers Logic
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
  const { address, isConnected } = useAccount();
  const mingles = useAtomValue(minglesAtom);
  const isLoadingMingles = useAtomValue(isLoadingMinglesAtom);

  // --- ESTADO PERFIL ---
  const [profile, setProfile] = useState({
    username: "Mingle Member", 
    bio: "Just a worm in the bottle.", 
    twitter: "",
    favTequila: "Blanco",
    code: "...", 
    points: 0,
  });
  const [friends, setFriends] = useState<Friend[]>([]);
  
  // Edición
  const [isEditing, setIsEditing] = useState(false);
  const [tempData, setTempData] = useState({ ...profile });
  const [friendCodeInput, setFriendCodeInput] = useState("");

  // --- ESTADO MODAL ---
  const [selectedMingle, setSelectedMingle] = useState<SelectedMingle | null>(null);
  const [viewMode, setViewMode] = useState<'bottled' | 'unbottled' | 'zoom'>('bottled');

  // --- 1. CARGAR DATOS ---
  useEffect(() => {
    const loadData = async () => {
      if (!address) return;

      // A. Cargar/Crear Usuario
      let { data: userData } = await supabase
        .from('users')
        .select('*')
        .eq('wallet_address', address)
        .single();

      if (!userData) {
        // Crear si no existe
        const newCode = `MNGL-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
        const { data: newUser } = await supabase
          .from('users')
          .insert([{ 
             wallet_address: address, 
             referral_code: newCode,
             username: "Mingle Member",
             bio: "Just a worm in the bottle."
          }])
          .select()
          .single();
        userData = newUser;
      }

      if (userData) {
        const userProfile = {
          username: userData.username,
          bio: userData.bio || "",
          twitter: userData.twitter || "", // Nuevo campo
          favTequila: userData.fav_tequila || "Blanco", // Nuevo campo
          code: userData.referral_code,
          points: userData.points
        };
        setProfile(userProfile);
        setTempData(userProfile); // Sincronizar temp
      }

      // B. Cargar Amigos
      const { data: friendsData } = await supabase
        .from('friends')
        .select('friend_wallet')
        .eq('user_wallet', address);

      if (friendsData && friendsData.length > 0) {
         const friendWallets = friendsData.map(f => f.friend_wallet);
         const { data: friendsProfiles } = await supabase
            .from('users')
            .select('username')
            .in('wallet_address', friendWallets);
         
         if (friendsProfiles) {
            setFriends(friendsProfiles.map(f => ({ username: f.username, mingleCount: 0 })));
         }
      }
    };

    if (isConnected) loadData();
  }, [address, isConnected]);

  // --- 2. GUARDAR PERFIL ---
  const handleSave = async () => {
    if (!address) return;
    
    // Aseguramos que la tabla tenga las columnas 'twitter' y 'fav_tequila'
    const { error } = await supabase
      .from('users')
      .update({ 
        username: tempData.username, 
        bio: tempData.bio,
        twitter: tempData.twitter,
        fav_tequila: tempData.favTequila
      })
      .eq('wallet_address', address);

    if (!error) {
      setProfile(tempData);
      setIsEditing(false);
    } else {
      alert("Error saving profile. Check database columns.");
    }
  };

  // --- 3. AGREGAR AMIGO ---
  const handleAddFriend = async () => {
    if (!friendCodeInput || !address) return;
    
    const { data: friendUser } = await supabase
       .from('users')
       .select('wallet_address, username')
       .eq('referral_code', friendCodeInput)
       .single();

    if (friendUser) {
       if (friendUser.wallet_address === address) return alert("Can't add yourself!");
       
       const { error } = await supabase
          .from('friends')
          .insert([{ user_wallet: address, friend_wallet: friendUser.wallet_address }]);
       
       if (!error) {
          setFriends(prev => [...prev, { username: friendUser.username, mingleCount: 0 }]);
          setFriendCodeInput("");
          alert("Friend added!");
       } else {
          alert("Friend already added.");
       }
    } else {
       alert("Invalid Code");
    }
  };

  // --- LOGICA DE IMÁGENES (MODAL) ---
  const getModalImage = () => {
    if (!selectedMingle) return "";
    
    // AQUI CONECTARÍAS LAS URLS REALES
    // Por ahora uso la imagen base para bottled y placeholders visuales para el resto
    // Idealmente: `https://my-api.com/images/${viewMode}/${selectedMingle.id}.png`
    
    if (viewMode === 'bottled') return selectedMingle.image;
    
    // Fallback logic para demo (Tu hermano debe cambiar esto por las URLs reales)
    if (viewMode === 'unbottled') return `https://d9emswcmuvawb.cloudfront.net/${selectedMingle.id}.png`; // Debería ser imagen full body
    if (viewMode === 'zoom') return `https://d9emswcmuvawb.cloudfront.net/PFP${selectedMingle.id}.png`; // Debería ser face crop
    
    return selectedMingle.image;
  };

  // --- MULTIPLIERS ---
  const holdMult = getHoldMultiplier(mingles.length);
  const socialMult = getSocialMultiplier(friends.length);
  const totalMult = (holdMult * socialMult).toFixed(2);

  // --- RENDER ---
  if (!isConnected) return null;

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20 relative px-4 md:px-0">
      
      {/* === MODAL === */}
      <AnimatePresence>
        {selectedMingle && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4"
            onClick={() => setSelectedMingle(null)}
          >
            <motion.div 
              initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
              className="bg-white w-full max-w-sm md:max-w-4xl h-[85vh] md:h-auto rounded-[2rem] overflow-hidden flex flex-col md:flex-row relative"
              onClick={(e) => e.stopPropagation()}
            >
               {/* 1. VISOR DE IMAGEN (Sin Zoom CSS, cambio de Source) */}
               <div className="flex-1 bg-[#EDEDD9] relative overflow-hidden flex items-center justify-center h-3/5 md:h-auto border-b-4 md:border-r-4 border-[#1D1D1D]">
                  
                  <img 
                    key={viewMode} // Key fuerza re-render al cambiar modo
                    src={getModalImage()} 
                    className="w-full h-full object-contain p-4" 
                    alt={`${selectedMingle.name} - ${viewMode}`}
                  />

                  {/* Botones de Estado */}
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex bg-[#1D1D1D] p-1 rounded-full shadow-xl gap-1 z-20">
                     {['bottled', 'unbottled', 'zoom'].map((mode) => (
                        <button 
                           key={mode}
                           onClick={() => setViewMode(mode as any)}
                           className={`px-3 py-2 rounded-full text-[10px] font-black uppercase transition-all ${viewMode === mode ? 'bg-[#E15162] text-white' : 'text-[#EDEDD9] hover:text-white'}`}
                        >
                           {mode}
                        </button>
                     ))}
                  </div>

                  <button onClick={() => setSelectedMingle(null)} className="absolute top-4 right-4 bg-black/20 text-[#1D1D1D] p-2 rounded-full z-20 hover:bg-[#E15162] hover:text-white">
                     <X size={20} />
                  </button>
               </div>

               {/* 2. INFO PANEL */}
               <div className="bg-white p-6 flex flex-col justify-between h-2/5 md:h-auto md:w-[350px]">
                  <div>
                     <h2 className="text-3xl font-black uppercase text-[#1D1D1D] leading-none mb-1">{selectedMingle.name}</h2>
                     <p className="text-sm font-bold text-[#1D1D1D]/40">Mingle #{selectedMingle.id}</p>
                  </div>

                  <div className="space-y-3">
                     <button className="w-full bg-[#1D1D1D] text-white py-4 rounded-xl font-black uppercase hover:bg-[#E15162] transition-colors flex items-center justify-center gap-2">
                        <Download size={18} /> Download {viewMode}
                     </button>
                     
                     <a 
                       href={`https://twitter.com/intent/tweet?text=Check out my Mingle!&url=${window.location.href}`} 
                       target="_blank" rel="noreferrer"
                       className="w-full border-2 border-[#1D1D1D] py-4 rounded-xl font-black uppercase hover:bg-[#EDEDD9] transition-colors flex items-center justify-center gap-2"
                     >
                        <Share2 size={18} /> Share on X
                     </a>
                  </div>
               </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>


      {/* === 1. PROFILE SECTION (Con Twitter & Tequila) === */}
      <section className="bg-[#1D1D1D] text-[#EDEDD9] rounded-[2.5rem] p-6 md:p-8 border-4 border-[#1D1D1D] shadow-[8px_8px_0_0_#E15162] relative overflow-hidden">
         <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none"><Wine size={140} /></div>
         
         <div className="flex flex-col md:flex-row gap-6 relative z-10">
            {/* Avatar */}
            <div className="w-24 h-24 rounded-2xl border-4 border-[#EDEDD9] overflow-hidden bg-white shrink-0">
               <img src={mingles.length > 0 ? mingles[0].image : "/images/placeholder_bottle.png"} className="w-full h-full object-cover"/>
            </div>

            {/* Info Editable */}
            <div className="flex-1 space-y-4">
               {isEditing ? (
                  <div className="space-y-3 bg-white/5 p-4 rounded-xl border border-white/10">
                     <input 
                        value={tempData.username} 
                        onChange={e => setTempData({...tempData, username: e.target.value})} 
                        className="bg-white/10 text-xl font-black rounded px-2 py-1 w-full"
                        placeholder="Username"
                     />
                     <textarea 
                        value={tempData.bio} 
                        onChange={e => setTempData({...tempData, bio: e.target.value})} 
                        className="bg-white/10 text-sm font-bold w-full rounded p-2 h-16 resize-none"
                        placeholder="Bio"
                     />
                     <div className="flex gap-2">
                        <div className="flex items-center gap-2 bg-white/10 rounded px-2 py-1 flex-1">
                           <Twitter size={14} className="opacity-50"/>
                           <input 
                              value={tempData.twitter} 
                              onChange={e => setTempData({...tempData, twitter: e.target.value})} 
                              className="bg-transparent text-sm font-bold w-full outline-none"
                              placeholder="@twitter_handle"
                           />
                        </div>
                        <select 
                           value={tempData.favTequila}
                           onChange={e => setTempData({...tempData, favTequila: e.target.value})}
                           className="bg-white/10 text-sm font-bold rounded px-2 py-1 outline-none text-white"
                        >
                           {TEQUILA_OPTIONS.map(opt => <option key={opt} value={opt} className="text-black">{opt}</option>)}
                        </select>
                     </div>
                     <button onClick={handleSave} className="bg-[#E15162] text-white w-full py-2 rounded-lg font-black text-xs uppercase hover:bg-white hover:text-black transition-colors">Save Changes</button>
                  </div>
               ) : (
                  <div className="space-y-2">
                     <div className="flex items-center gap-3">
                        <h1 className="text-3xl md:text-4xl font-black uppercase">{profile.username}</h1>
                        <button onClick={() => setIsEditing(true)} className="opacity-50 hover:opacity-100 hover:text-[#E15162]"><Edit3 size={20}/></button>
                     </div>
                     <p className="text-sm font-bold opacity-60 max-w-md leading-tight">{profile.bio}</p>
                     
                     <div className="flex gap-4 pt-2">
                        {profile.twitter && (
                           <div className="flex items-center gap-1 text-xs font-bold bg-[#1D1D1D] border border-[#EDEDD9]/20 px-2 py-1 rounded">
                              <Twitter size={12} className="text-[#E15162]"/> {profile.twitter}
                           </div>
                        )}
                        <div className="flex items-center gap-1 text-xs font-bold bg-[#1D1D1D] border border-[#EDEDD9]/20 px-2 py-1 rounded">
                           <Wine size={12} className="text-[#E15162]"/> {profile.favTequila}
                        </div>
                     </div>
                  </div>
               )}
            </div>
         </div>
      </section>

      {/* === 2. MULTIPLIER STATS (SEPARADO) === */}
      <section className="bg-white p-6 rounded-[2.5rem] border-4 border-[#1D1D1D] shadow-sm">
         <div className="flex items-center gap-3 mb-6">
            <div className="bg-[#E15162] text-white p-2 rounded-lg"><Zap size={24}/></div>
            <h2 className="text-2xl font-black uppercase text-[#1D1D1D]">Multiplier Breakdown</h2>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Hold Bonus */}
            <div className="bg-[#EDEDD9] p-4 rounded-2xl border-2 border-[#1D1D1D] flex flex-col justify-between">
               <div>
                  <p className="text-xs font-black uppercase opacity-50 mb-1">Hold Bonus</p>
                  <div className="flex items-center gap-2">
                     <Wine className="text-[#1D1D1D]" size={20}/>
                     <span className="text-2xl font-black">x{holdMult}</span>
                  </div>
               </div>
               <p className="text-[10px] font-bold mt-2 opacity-60">Based on {mingles.length} Mingles owned.</p>
            </div>

            {/* Social Bonus */}
            <div className="bg-[#EDEDD9] p-4 rounded-2xl border-2 border-[#1D1D1D] flex flex-col justify-between">
               <div>
                  <p className="text-xs font-black uppercase opacity-50 mb-1">Social Bonus</p>
                  <div className="flex items-center gap-2">
                     <Users className="text-[#1D1D1D]" size={20}/>
                     <span className="text-2xl font-black">x{socialMult}</span>
                  </div>
               </div>
               <p className="text-[10px] font-bold mt-2 opacity-60">Based on {friends.length} Circle members.</p>
            </div>

            {/* Total */}
            <div className="bg-[#1D1D1D] text-white p-4 rounded-2xl border-2 border-[#1D1D1D] flex flex-col justify-center text-center shadow-[4px_4px_0_0_#E15162]">
               <p className="text-xs font-black uppercase opacity-50 mb-1">Total Multiplier</p>
               <span className="text-4xl font-black text-[#E15162]">x{totalMult}</span>
            </div>
         </div>
      </section>

      {/* === 3. SOCIAL === */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         {/* Code & Add */}
         <div className="bg-[#E15162] p-6 rounded-3xl border-4 border-[#1D1D1D] text-white">
            <h3 className="text-xl font-black uppercase mb-4 flex items-center gap-2"><Users/> Grow Circle</h3>
            <div className="space-y-4">
               <div>
                  <label className="text-[10px] font-black uppercase opacity-70 mb-1 block">Your Code</label>
                  <div className="flex gap-2">
                     <div className="bg-black/20 border-2 border-white/20 rounded-xl px-4 py-3 font-mono text-sm font-bold flex-1 truncate text-center">
                        {profile.code || "GENERATING..."}
                     </div>
                     <button onClick={() => navigator.clipboard.writeText(profile.code)} className="bg-white text-[#E15162] p-3 rounded-xl border-2 border-[#1D1D1D] hover:scale-105 active:scale-95 shadow-sm"><Copy size={20} /></button>
                     <a href={`https://twitter.com/intent/tweet?text=Join my Lair using code: ${profile.code}`} target="_blank" rel="noreferrer" className="bg-[#1D1D1D] text-white p-3 rounded-xl border-2 border-[#1D1D1D] hover:scale-105 active:scale-95 shadow-sm"><Twitter size={20} /></a>
                  </div>
               </div>
               <div>
                  <label className="text-[10px] font-black uppercase opacity-70 mb-1 block">Add Friend's Code</label>
                  <div className="flex gap-2">
                     <input value={friendCodeInput} onChange={(e) => setFriendCodeInput(e.target.value.toUpperCase())} placeholder="MNGL-XXXX" className="bg-white/90 text-[#1D1D1D] placeholder-[#1D1D1D]/30 border-2 border-[#1D1D1D] rounded-xl px-4 py-3 font-black text-sm flex-1 outline-none uppercase"/>
                     <button onClick={handleAddFriend} disabled={!friendCodeInput} className="bg-[#1D1D1D] text-white px-4 rounded-xl border-2 border-[#1D1D1D] font-black hover:bg-white hover:text-[#1D1D1D] disabled:opacity-50"><Plus size={20} /></button>
                  </div>
               </div>
            </div>
         </div>

         {/* Friend List */}
         <div className="bg-white p-6 rounded-3xl border-4 border-[#1D1D1D] flex flex-col">
            <h3 className="text-xl font-black uppercase mb-4 text-[#1D1D1D]">My Friends</h3>
            {friends.length === 0 ? (
               <div className="flex-1 flex flex-col items-center justify-center text-center opacity-50 border-2 border-dashed border-[#1D1D1D]/20 rounded-xl p-4">
                  <Users size={32} className="mb-2"/>
                  <p className="font-black text-sm uppercase">No Friends Yet</p>
                  <p className="font-bold text-xs">GO MINGLE!</p>
               </div>
            ) : (
               <div className="space-y-2 overflow-y-auto max-h-[200px] pr-2 custom-scrollbar">
                  {friends.map((friend, i) => (
                     <div key={i} className="flex items-center justify-between bg-[#EDEDD9] p-3 rounded-xl border border-[#1D1D1D]/10">
                        <div className="flex items-center gap-3">
                           <div className="w-8 h-8 bg-[#1D1D1D] rounded-full overflow-hidden border border-[#1D1D1D]"><div className="w-full h-full bg-[#E15162]"/></div>
                           <span className="font-black text-xs text-[#1D1D1D] uppercase">{friend.username}</span>
                        </div>
                        <span className="text-[10px] font-bold opacity-50">Member</span>
                     </div>
                  ))}
               </div>
            )}
         </div>
      </div>

      {/* === 4. GALLERY === */}
      <section>
          <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-black uppercase text-[#1D1D1D]">My Collection</h2>
          </div>

          {isLoadingMingles ? (
             <div className="flex justify-center py-20"><Loader2 size={48} className="text-[#1D1D1D] animate-spin" /></div>
          ) : mingles.length === 0 ? (
             <div className="text-center py-20 bg-white rounded-3xl border-4 border-[#1D1D1D] border-dashed">
                <p className="text-xl font-black text-[#1D1D1D] mb-2">No Mingles Found</p>
                <button className="bg-[#E15162] text-white px-6 py-3 rounded-xl font-black uppercase border-2 border-[#1D1D1D] shadow-[4px_4px_0_0_#1D1D1D]">Buy Mingle</button>
             </div>
          ) : (
             <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {mingles.map((nft) => (
                   <motion.div 
                      key={nft.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      onClick={() => { setSelectedMingle(nft); setViewMode('bottled'); }}
                      className="group bg-white p-2 md:p-3 rounded-2xl border-4 border-[#1D1D1D] shadow-[4px_4px_0_0_#1D1D1D] active:translate-y-[2px] active:shadow-none cursor-pointer"
                   >
                      <div className="aspect-square rounded-xl overflow-hidden border-2 border-[#1D1D1D]/10 mb-3 bg-[#EDEDD9] relative">
                          <img src={nft.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                             <Maximize2 className="text-white drop-shadow-md" />
                          </div>
                      </div>
                      <div className="flex justify-between items-center px-1">
                          <h3 className="font-black text-xs md:text-sm uppercase text-[#1D1D1D] truncate">{nft.name}</h3>
                          <span className="text-[10px] font-bold text-[#1D1D1D]/40">#{nft.id}</span>
                      </div>
                   </motion.div>
                ))}
             </div>
          )}
      </section>

    </div>
  );
}