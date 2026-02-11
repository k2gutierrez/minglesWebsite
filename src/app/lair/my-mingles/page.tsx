'use client';

import React, { useState, useEffect } from 'react';
import { useAtomValue, useSetAtom } from 'jotai'; 
import { minglesAtom, isLoadingMinglesAtom } from '@/components/engine/atoms'; 
import { useAccount } from 'wagmi';
import { supabase } from '@/components/engine/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, Copy, Wine, Users, Edit3, Save, 
  Share2, Loader2, Zap, X, Download, 
  Maximize2, Plus, Twitter
} from 'lucide-react';
import { ConnectWalletView } from '@/components/ConnectWalletView';
import { fetchUserMingles } from '@/components/engine/indexer';
import Link from 'next/link';

// --- TIPOS ---
const TEQUILA_OPTIONS = ["Blanco", "Reposado", "Añejo", "Cristalino"];

interface SelectedMingle {
  id?: string;
  name: string;
  image: string;
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
  const [isDownloading, setIsDownloading] = useState(false);
  const setMingles = useSetAtom(minglesAtom); // Setter para actualizar el estado global
  const [isRefreshing, setIsRefreshing] = useState(false); // Estado local para la animación del botón
  const setIsLoading = useSetAtom(isLoadingMinglesAtom);

   // --- NUEVA FUNCIÓN: RECARGA MANUAL ---
  const handleManualRefresh = async () => {
    if (!address) return;
    setIsRefreshing(true);
    try {
        const nfts = await fetchUserMingles(address);
        setMingles(nfts); // Actualizamos el estado global
    } catch (e) {
        console.error("Manual refresh failed", e);
    } finally {
        setTimeout(() => setIsRefreshing(false), 500); // Pequeño delay visual
    }
  };

  // Efecto para cargar los Mingles cuando se conecta la wallet
  useEffect(() => {
    const loadData = async () => {
      if (isConnected && address) {
        setIsLoading(true);
        const nfts = await fetchUserMingles(address);
        setMingles(nfts);
        setIsLoading(false);
      } else {
        setMingles([]); // Limpiar si se desconecta
      }
    };
    loadData();
  }, [isConnected, address, setIsLoading]);

  // --- ESTADO PERFIL ---
  const [profile, setProfile] = useState({
    username: "Mingle Member", 
    bio: "Just a worm in the bottle.", 
    twitter: "",
    favTequila: "Blanco", // Default
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
          twitter: userData.twitter || "",
          favTequila: userData.fav_tequila || "Blanco",
          code: userData.referral_code,
          points: userData.points
        };
        setProfile(userProfile);
        setTempData(userProfile);
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
      alert("Error saving profile.");
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

  // --- HANDLER: DOWNLOAD IMAGE ---
  const handleDownload = async () => {
    if (!selectedMingle) return;
    
    setIsDownloading(true);
    const imageUrl = getModalImage() as string; // funcionó
    const fileName = `Mingle-${selectedMingle.id}-${viewMode}.png`;

    try {
      // CAMBIO CLAVE: Usamos nuestra API interna para evitar bloqueo CORS de AWS
      // Esto hace: Tu Navegador -> Tu Servidor NextJS -> AWS -> Tu Navegador
      const response = await fetch(`/api/download-image?url=${encodeURIComponent(imageUrl)}`);
      
      if (!response.ok) throw new Error("Network response was not ok");

      const blob = await response.blob();
      
      // Crear link temporal y forzar descarga
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName; // Ahora sí respetará el nombre
      
      document.body.appendChild(link);
      link.click();
      
      // Limpieza
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error("Download failed, falling back to tab:", error);
      // Solo si falla nuestro proxy, abrimos la pestaña
      window.open(imageUrl, '_blank');
    } finally {
      setIsDownloading(false);
    }
  };

  // --- LOGICA IMÁGENES MODAL ---
  const getModalImage = () => {
    if (!selectedMingle) return "";
    if (viewMode == 'bottled') {
      return selectedMingle.image; 
    } else if (viewMode == 'unbottled') {
      return `https://d9emswcmuvawb.cloudfront.net/${selectedMingle.id}.png`;
    } else if (viewMode == 'zoom') {
      return `https://d9emswcmuvawb.cloudfront.net/PFP${selectedMingle.id}.png`;
    }
    
  };

  // --- MULTIPLIERS ---
  const holdMult = getHoldMultiplier(mingles.length);
  const socialMult = getSocialMultiplier(friends.length);
  const totalMult = (holdMult * socialMult).toFixed(2);

  if (!isConnected) return <ConnectWalletView />;

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
               {/* 1. VISOR DE IMAGEN (Source Swap) */}
               <div className="flex-1 bg-[#EDEDD9] relative overflow-hidden flex items-center justify-center h-3/5 md:h-auto border-b-4 md:border-r-4 border-[#1D1D1D]">
                  <img 
                    key={viewMode} 
                    src={getModalImage()} 
                    className="w-full h-full object-contain p-4 transition-opacity duration-300" 
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
                     <button 
                        onClick={handleDownload}
                        disabled={isDownloading}
                        className="w-full bg-[#1D1D1D] text-white py-4 rounded-xl font-black uppercase hover:bg-[#E15162] transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                     >
                        {isDownloading ? (
                           <Loader2 size={18} className="animate-spin" />
                        ) : (
                           <Download size={18} />
                        )}
                        {isDownloading ? "Downloading..." : `Download ${viewMode}`}
                     </button>
                     
                     <Link
                       href={`https://twitter.com/intent/tweet?text=Check out my Mingle!&url=${window.location.href}`} 
                       target="_blank" rel="noreferrer"
                       className="w-full border-2 border-[#1D1D1D] py-4 rounded-xl font-black uppercase hover:bg-[#EDEDD9] transition-colors flex items-center justify-center gap-2"
                     >
                        <Share2 size={18} /> Share on X
                     </Link>
                  </div>
               </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* === 1. PROFILE SECTION (REDISEÑADA) === */}
      <section className="bg-[#1D1D1D] text-[#EDEDD9] rounded-[2.5rem] p-6 md:p-8 border-4 border-[#1D1D1D] shadow-[8px_8px_0_0_#E15162] relative overflow-hidden">
         <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none"><Wine size={140} /></div>
         
         <div className="flex flex-col md:flex-row gap-8 relative z-10">
            {/* Avatar */}
            <div className="w-24 h-24 md:w-32 md:h-32 rounded-2xl border-4 border-[#EDEDD9] overflow-hidden bg-white shrink-0">
               <img src={mingles.length > 0 ? mingles[0].image : "/images/placeholder_bottle.png"} className="w-full h-full object-cover"/>
            </div>

            {/* Info Principal */}
            <div className="flex-1 flex flex-col justify-between space-y-4">
               
               {/* Header Info */}
               <div>
                   <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                          {isEditing ? (
                             <input 
                               value={tempData.username} 
                               onChange={e => setTempData({...tempData, username: e.target.value})} 
                               className="bg-white/10 text-2xl md:text-3xl font-black rounded px-2 py-1 w-full max-w-xs text-white"
                               placeholder="Username"
                             />
                          ) : (
                             <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tight">{profile.username}</h1>
                          )}
                          
                          <button onClick={() => isEditing ? handleSave() : setIsEditing(true)} className="opacity-50 hover:opacity-100 hover:text-[#E15162] transition-colors">
                             {isEditing ? <Save size={24} className="text-[#E15162]"/> : <Edit3 size={24}/>}
                          </button>
                      </div>
                   </div>

                   {/* Bio & Twitter */}
                   <div className="space-y-3">
                      {isEditing ? (
                         <>
                           <textarea 
                              value={tempData.bio} 
                              onChange={e => setTempData({...tempData, bio: e.target.value})} 
                              className="bg-white/10 text-sm font-bold w-full rounded p-3 h-20 resize-none text-[#EDEDD9]"
                              placeholder="Write a short bio..."
                           />
                           <div className="flex items-center gap-2 bg-white/10 rounded px-3 py-2 w-full max-w-xs">
                              <Twitter size={16} className="text-[#E15162]"/>
                              <input 
                                 value={tempData.twitter} 
                                 onChange={e => setTempData({...tempData, twitter: e.target.value})} 
                                 className="bg-transparent text-sm font-bold w-full outline-none text-white placeholder-white/30"
                                 placeholder="@twitter_handle"
                              />
                           </div>
                         </>
                      ) : (
                         <>
                           <p className="text-sm font-bold opacity-70 max-w-lg leading-relaxed">{profile.bio}</p>
                           {profile.twitter && (
                              <Link href={`https://twitter.com/${profile.twitter.replace('@','')}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-xs font-black bg-black/30 hover:bg-[#E15162] transition-colors px-3 py-1.5 rounded-lg border border-white/10">
                                 <Twitter size={12}/> {profile.twitter}
                              </Link>
                           )}
                         </>
                      )}
                   </div>
               </div>

               {/* TEQUILA PREFERENCE (UI UX MEJORADO) */}
               <div className="bg-black/20 p-4 rounded-2xl border border-white/5 mt-2">
                  <p className="text-[10px] font-black uppercase text-[#EDEDD9]/50 mb-3 flex items-center gap-1">
                     <Wine size={12}/> My Favorite Tequila
                  </p>
                  
                  <div className="flex flex-wrap gap-2">
                     {TEQUILA_OPTIONS.map((opt) => {
                        // Determinamos cuál está seleccionado (Temporal o Guardado)
                        const isSelected = (isEditing ? tempData.favTequila : profile.favTequila) === opt;
                        
                        return (
                           <button
                              key={opt}
                              onClick={() => isEditing && setTempData({...tempData, favTequila: opt})}
                              disabled={!isEditing} // Solo clickeable en modo edición
                              className={`
                                 px-3 py-1.5 rounded-lg text-xs font-black uppercase border-2 transition-all
                                 ${isSelected 
                                    ? 'bg-[#E15162] border-[#E15162] text-white shadow-[0_0_10px_rgba(225,81,98,0.5)] scale-105 z-10' 
                                    : 'bg-transparent border-white/10 text-white/30 hover:border-white/30'
                                 }
                                 ${isEditing ? 'cursor-pointer hover:scale-105' : 'cursor-default'}
                              `}
                           >
                              {opt}
                           </button>
                        )
                     })}
                  </div>
               </div>
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
            <div className="bg-[#EDEDD9] p-4 rounded-2xl border-2 border-[#1D1D1D] flex flex-col justify-between hover:scale-[1.02] transition-transform">
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
            <div className="bg-[#EDEDD9] p-4 rounded-2xl border-2 border-[#1D1D1D] flex flex-col justify-between hover:scale-[1.02] transition-transform">
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
                     <div className="bg-black/20 border-2 border-white/20 rounded-xl px-4 py-3 font-mono text-sm font-bold flex-1 truncate text-center select-all">
                        {profile.code || "GENERATING..."}
                     </div>
                     <button onClick={() => navigator.clipboard.writeText(profile.code)} className="bg-white text-[#E15162] p-3 rounded-xl border-2 border-[#1D1D1D] hover:scale-105 active:scale-95 shadow-sm"><Copy size={20} /></button>
                     <Link href={`https://twitter.com/intent/tweet?text=Join my Lair using code: ${profile.code}`} target="_blank" rel="noreferrer" className="bg-[#1D1D1D] text-white p-3 rounded-xl border-2 border-[#1D1D1D] hover:scale-105 active:scale-95 shadow-sm"><Twitter size={20} /></Link>
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