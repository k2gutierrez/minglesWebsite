'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAtomValue } from 'jotai'; // Importar Jotai hook
import { minglesAtom, isLoadingMinglesAtom } from '@/components/engine/atoms';
import { 
  User, Copy, Twitter, Download, Search, 
  Wine, Users, Sword, Trophy, ExternalLink, 
  Edit3, Save, Share2, AlertCircle, Loader2 
} from 'lucide-react';

const ASSETS = {
  pfpWorm: "/images/MinglesMiniaturaLogoRojo-03.png", 
  pfpHeart: "/images/Screenshot 2025-08-15 at 12.32.48 p.m..png",
  // Estos se usan como fallback o decoración si no hay imagen del indexer
  bottleSolo: "/images/Screenshot 2026-01-08 at 9.57.29 p.m..jpg", 
};

const TEQUILA_TYPES = ["Blanco", "Reposado", "Añejo", "Cristalino"];

// Datos de usuario simulados (esto luego vendría de tu backend/DB)
const USER_DATA = {
    username: "MingleMember",
    twitterHandle: "@mingles_dao",
    uniqueCode: "MINGLE-8X92",
    tequilaPoints: 0,
    friendsCount: 0,
    minglesInRaids: 0
};

export default function MyMinglesPage() {
  // --- ESTADO GLOBAL (WEB3) ---
  const myMingles = useAtomValue(minglesAtom); 
  const isLoading = useAtomValue(isLoadingMinglesAtom); 

  // --- ESTADO LOCAL (UI) ---
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [bio, setBio] = useState("Agitation meets distillation.");
  const [favTequila, setFavTequila] = useState("Reposado");
  
  // Lógica de Selección / Unbottle
  const [selectedMingleId, setSelectedMingleId] = useState<string | null>(null);
  const [isUnbottled, setIsUnbottled] = useState(false);

  // --- 👇 AQUÍ ESTÁ LA LÍNEA QUE FALTABA ---
  const [friendCodeInput, setFriendCodeInput] = useState(""); 

  // Derived Data
  const hasMingles = myMingles.length > 0;
  // Si no hay seleccionado, usa el primero de la lista (si existe)
  const activeMingle = myMingles.find(m => m.id === selectedMingleId) || myMingles[0];

  // Actions
  const copyCode = () => {
    navigator.clipboard.writeText(USER_DATA.uniqueCode);
    alert("Code copied!");
  };

  const shareTwitter = () => {
    const text = `Let's Mingle! Join my squad. My code: ${USER_DATA.uniqueCode}`;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleManualSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const id = e.target.value; 
    // Verificar si el usuario realmente tiene ese ID
    if (myMingles.find(m => m.id === id)) {
        setSelectedMingleId(id);
        setIsUnbottled(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-20">
      
      {/* --- 1. HEADER & PROFILE --- */}
      <section className="bg-white rounded-3xl border-4 border-[#1D1D1D] shadow-[4px_4px_0_0_#1D1D1D] p-6 md:p-8 relative overflow-hidden">
         <div className="absolute top-0 right-0 bg-[#E15162] text-white text-xs font-black px-4 py-1 rounded-bl-xl border-l-2 border-b-2 border-[#1D1D1D]">
            MEMBER PROFILE
         </div>

         <div className="flex flex-col md:flex-row gap-8">
            {/* Avatar Section */}
            <div className="flex-shrink-0 flex flex-col items-center">
                <div className="w-32 h-32 rounded-2xl border-4 border-[#1D1D1D] overflow-hidden bg-[#EDEDD9] relative mb-4">
                    <img src={ASSETS.pfpWorm} className="w-full h-full object-cover" alt="Profile" />
                </div>
                <button className="flex items-center gap-2 text-xs font-bold bg-[#1D1D1D] text-white px-3 py-1 rounded-full hover:bg-[#E15162] transition-colors">
                    <Twitter size={12} /> {USER_DATA.twitterHandle}
                </button>
            </div>

            {/* Info Section */}
            <div className="flex-grow space-y-4">
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-3xl font-black uppercase leading-none">{USER_DATA.username}</h1>
                        <div className="flex items-center gap-2 mt-2">
                            <span className="text-xs font-bold opacity-50 uppercase">My Code:</span>
                            <code className="bg-[#EDEDD9] px-2 py-1 rounded border border-[#1D1D1D] font-mono font-bold text-[#E15162]">{USER_DATA.uniqueCode}</code>
                            <button onClick={copyCode} className="p-1 hover:bg-[#EDEDD9] rounded"><Copy size={14}/></button>
                            <button onClick={shareTwitter} className="p-1 hover:bg-[#EDEDD9] rounded"><Share2 size={14}/></button>
                        </div>
                    </div>
                    <button 
                        onClick={() => setIsEditingProfile(!isEditingProfile)}
                        className="text-[#1D1D1D] hover:text-[#E15162]"
                    >
                        {isEditingProfile ? <Save size={20} /> : <Edit3 size={20} />}
                    </button>
                </div>

                {/* Bio Field */}
                <div>
                    <label className="text-[10px] font-black uppercase opacity-50 block mb-1">Bio</label>
                    {isEditingProfile ? (
                        <textarea 
                            value={bio} 
                            onChange={(e) => setBio(e.target.value)}
                            className="w-full bg-[#EDEDD9] border-2 border-[#1D1D1D] rounded-xl p-2 font-bold text-sm resize-none focus:outline-none"
                            rows={2}
                        />
                    ) : (
                        <p className="font-bold text-sm italic opacity-80">"{bio}"</p>
                    )}
                </div>

                {/* Tequila Preference Selector */}
                <div>
                    <label className="text-[10px] font-black uppercase opacity-50 block mb-2">Favorite Poison</label>
                    <div className="flex flex-wrap gap-2">
                        {TEQUILA_TYPES.map((type) => (
                            <button
                                key={type}
                                disabled={!isEditingProfile}
                                onClick={() => setFavTequila(type)}
                                className={`px-3 py-1 rounded-lg border-2 border-[#1D1D1D] text-xs font-bold transition-all ${
                                    favTequila === type 
                                    ? 'bg-[#E15162] text-white shadow-[2px_2px_0_0_#1D1D1D]' 
                                    : 'bg-white text-[#1D1D1D] opacity-50'
                                } ${isEditingProfile ? 'hover:opacity-100 cursor-pointer' : 'cursor-default'}`}
                            >
                                {type}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
         </div>
      </section>

      {/* --- 2. STATS BAR --- */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
         {[
            { label: "My Mingles", val: isLoading ? "..." : myMingles.length, icon: <User/>, color: "bg-blue-200" },
            { label: "In Raids", val: USER_DATA.minglesInRaids, icon: <Sword/>, color: "bg-red-200" },
            { label: "$TEQUILA Pts", val: USER_DATA.tequilaPoints, icon: <Wine/>, color: "bg-yellow-200" },
            { label: "Friends", val: USER_DATA.friendsCount, icon: <Users/>, color: "bg-green-200" },
         ].map((stat, i) => (
            <div key={i} className={`p-4 rounded-2xl border-2 border-[#1D1D1D] shadow-[2px_2px_0_0_#1D1D1D] flex flex-col items-center justify-center text-center ${stat.color}`}>
                <div className="mb-1 opacity-50 scale-75">{stat.icon}</div>
                <span className="text-3xl font-black">{stat.val}</span>
                <span className="text-[10px] font-bold uppercase tracking-wide">{stat.label}</span>
            </div>
         ))}
      </section>

      {/* --- 3. MY COLLECTION (Grid) --- */}
      <section>
         <div className="flex items-end justify-between mb-6 border-b-4 border-[#1D1D1D] pb-4">
            <h2 className="text-4xl font-black uppercase text-[#1D1D1D]">The Cellar</h2>
            <span className="text-sm font-bold bg-[#1D1D1D] text-white px-3 py-1 rounded-full">
                {isLoading ? "Loading..." : `${myMingles.length} / 1000`}
            </span>
         </div>

         {isLoading ? (
             <div className="flex justify-center py-20">
                 <Loader2 className="w-10 h-10 animate-spin text-[#1D1D1D]" />
             </div>
         ) : !hasMingles ? (
            // EMPTY STATE
            <div className="bg-[#EDEDD9] border-4 border-dashed border-[#1D1D1D]/30 rounded-3xl p-12 text-center flex flex-col items-center justify-center min-h-[300px]">
                <AlertCircle className="w-16 h-16 text-[#1D1D1D]/30 mb-4" />
                <h3 className="text-2xl font-black uppercase mb-2 text-[#1D1D1D]">No Mingles Found</h3>
                <p className="max-w-md font-bold opacity-60 mb-8 text-[#1D1D1D]">
                    Your cellar is empty. Visit the secondary markets to start your collection and unlock the lair.
                </p>
                <div className="flex gap-4">
                    <a href="#" className="bg-[#E15162] text-white px-6 py-3 rounded-xl border-2 border-[#1D1D1D] font-bold shadow-pop hover:shadow-none hover:translate-y-[2px] transition-all">
                        Buy on Magic Eden
                    </a>
                    <a href="#" className="bg-white text-[#1D1D1D] px-6 py-3 rounded-xl border-2 border-[#1D1D1D] font-bold shadow-pop hover:shadow-none hover:translate-y-[2px] transition-all">
                        Buy on OpenSea
                    </a>
                </div>
            </div>
         ) : (
            // GRID STATE
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {myMingles.map((mingle) => (
                    <motion.div 
                        key={mingle.id}
                        whileHover={{ y: -5 }}
                        onClick={() => setSelectedMingleId(mingle.id ? mingle.id : "")}
                        className={`cursor-pointer rounded-2xl border-4 overflow-hidden relative group transition-all ${selectedMingleId === mingle.id ? 'border-[#E15162] ring-4 ring-[#E15162]/20' : 'border-[#1D1D1D]'}`}
                    >
                        {/* Imagen del indexer */}
                        <img src={mingle.image} alt={mingle.name} className="w-full aspect-[4/5] object-cover bg-white" />
                        
                        <div className="absolute bottom-0 w-full bg-[#1D1D1D] text-white p-2 text-center">
                            <span className="font-bold text-sm">#{mingle.id}</span>
                        </div>
                    </motion.div>
                ))}
            </div>
         )}
      </section>

      {/* --- 4. UNBOTTLE TOOL (Interactive Section) --- */}
      {hasMingles && activeMingle && (
          <section className="bg-[#1D1D1D] text-[#EDEDD9] rounded-3xl p-6 md:p-10 shadow-[8px_8px_0_0_#E15162] relative overflow-hidden">
             {/* Background Decoration */}
             <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -z-0"></div>

             <div className="relative z-10 flex flex-col md:flex-row gap-12 items-center">
                
                {/* Controls Left */}
                <div className="w-full md:w-1/3 space-y-6">
                    <div>
                        <h2 className="text-3xl md:text-4xl font-black uppercase leading-none mb-2">Unbottle <br/> Your Mingle</h2>
                        <p className="opacity-60 text-sm font-bold">Select from grid or type ID to inspect.</p>
                    </div>

                    <div className="bg-white/10 p-4 rounded-2xl border-2 border-white/20">
                        <label className="text-[10px] font-black uppercase opacity-60 block mb-2">Manual Input</label>
                        <div className="flex items-center bg-[#EDEDD9] rounded-xl overflow-hidden border-2 border-transparent focus-within:border-[#E15162]">
                            <span className="pl-4 text-[#1D1D1D] font-bold">#</span>
                            <input 
                                type="number" 
                                placeholder={activeMingle.id}
                                onChange={handleManualSelect}
                                className="w-full bg-transparent p-3 font-black text-xl text-[#1D1D1D] outline-none placeholder-[#1D1D1D]/30"
                            />
                            <button className="p-3 text-[#1D1D1D] hover:bg-black/10"><Search size={20}/></button>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <button 
                            onClick={() => setIsUnbottled(false)}
                            className={`flex-1 py-3 rounded-xl font-black border-2 transition-all ${!isUnbottled ? 'bg-[#E15162] border-[#E15162] text-white' : 'bg-transparent border-white/20 text-white/50 hover:border-white'}`}
                        >
                            BOTTLED
                        </button>
                        <button 
                            onClick={() => setIsUnbottled(true)}
                            className={`flex-1 py-3 rounded-xl font-black border-2 transition-all ${isUnbottled ? 'bg-[#E15162] border-[#E15162] text-white' : 'bg-transparent border-white/20 text-white/50 hover:border-white'}`}
                        >
                            UNBOTTLED
                        </button>
                    </div>
                </div>

                {/* Visualizer Center */}
                <div className="w-full md:w-1/3 flex justify-center">
                    <div className="relative w-64 h-80 rounded-[2rem] border-4 border-white shadow-[0_0_40px_rgba(225,81,98,0.3)] bg-white overflow-hidden group">
                        <AnimatePresence mode="wait">
                            <motion.img 
                                key={isUnbottled ? 'pfp' : 'bottle'}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ type: "spring", bounce: 0.4 }}
                                src={isUnbottled ? `https://d9emswcmuvawb.cloudfront.net/${activeMingle.id}.png` : activeMingle.image}
                                className={`w-full h-full object-cover ${isUnbottled ? 'scale-125' : 'scale-100'}`} 
                                alt="Active Mingle"
                            />
                        </AnimatePresence>
                        
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-4">
                            <button className="bg-white text-[#1D1D1D] px-4 py-2 rounded-lg font-bold text-xs flex items-center gap-2 hover:scale-105 transition-transform">
                                <Download size={14}/> Download HD
                            </button>
                        </div>
                    </div>
                </div>

                {/* Details Right */}
                <div className="w-full md:w-1/3 space-y-4">
                    <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                        <h4 className="font-black text-xl mb-1 text-[#E15162]">Mingle #{activeMingle.id}</h4>
                        <p className="text-sm font-medium opacity-70">
                            {activeMingle.name}
                        </p>
                    </div>
                    <div className="text-sm opacity-60 leading-relaxed">
                        Unbottling your Mingle reveals the raw PFP version. Use this for your social profiles to gain extra multiplier points in the Raids.
                    </div>
                </div>

             </div>
          </section>
      )}

      {/* --- 5. FRIENDS SYSTEM --- */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Add Friend */}
          <div className="bg-[#E15162] rounded-3xl p-8 text-white border-4 border-[#1D1D1D] shadow-[4px_4px_0_0_#1D1D1D]">
              <div className="flex items-center gap-3 mb-4">
                  <Users className="w-8 h-8" />
                  <h2 className="text-2xl font-black uppercase">Add Friends</h2>
              </div>
              <p className="font-medium mb-6 opacity-90">
                  The more friends in your circle, the higher your $TEQUILA allocation multiplier.
              </p>
              <div className="flex gap-2">
                  <input 
                    type="text" 
                    placeholder="ENTER FRIEND CODE (e.g. MNGL-99)"
                    value={friendCodeInput}
                    onChange={(e) => setFriendCodeInput(e.target.value)}
                    className="flex-1 bg-white text-[#1D1D1D] px-4 py-3 rounded-xl font-bold uppercase placeholder-gray-400 outline-none border-2 border-transparent focus:border-[#1D1D1D]"
                  />
                  <button className="bg-[#1D1D1D] text-white px-6 py-3 rounded-xl font-black border-2 border-[#1D1D1D] hover:bg-white hover:text-[#1D1D1D] transition-colors">
                      ADD
                  </button>
              </div>
          </div>

          {/* Friend List (Preview) */}
          <div className="bg-white rounded-3xl p-8 border-4 border-[#1D1D1D] shadow-sm">
              <h2 className="text-2xl font-black uppercase mb-4 text-[#1D1D1D]">Your Circle ({USER_DATA.friendsCount})</h2>
              <div className="space-y-3 max-h-[160px] overflow-y-auto pr-2 custom-scrollbar">
                  {[1,2,3,4].map((f) => (
                      <div key={f} className="flex items-center justify-between p-3 bg-[#EDEDD9] rounded-xl border-2 border-[#1D1D1D]/10">
                          <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-[#1D1D1D] rounded-full overflow-hidden">
                                  {/* Placeholder para amigo */}
                                  <div className="w-full h-full bg-[#E15162]"></div>
                              </div>
                              <div>
                                  <p className="font-bold text-xs leading-none text-[#1D1D1D]">FriendName_{f}</p>
                                  <p className="text-[10px] opacity-50 font-bold text-[#1D1D1D]">5 Mingles</p>
                              </div>
                          </div>
                          <a href="#" className="p-2 hover:bg-white rounded-lg transition-colors">
                              <ExternalLink size={14} className="text-[#1D1D1D]" />
                          </a>
                      </div>
                  ))}
              </div>
          </div>
      </section>

    </div>
  );
}