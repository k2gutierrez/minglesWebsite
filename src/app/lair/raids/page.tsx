'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useAtomValue } from 'jotai';
import { useAccount } from 'wagmi';
import { 
  Sword, Skull, Clock, Backpack, 
  CheckCircle2, Loader2, Map,
  TrendingUp, AlertTriangle, HelpCircle,
  Play, TrendingDown
} from 'lucide-react';

// Imports de tu arquitectura
import { minglesAtom, isLoadingMinglesAtom } from '@/components/engine/atoms';
import { supabase } from '@/components/engine/supabase';
import { ConnectWalletView } from '@/components/ConnectWalletView';

// --- 1. BASE DE DATOS DE ITEMS ---
const ITEMS_DB: Record<string, { name: string, effect: string, type: 'loot' | 'boss' | 'xp' }> = {
  'rusty_key': { name: "Rusty Key", effect: "+5% Loot Chance", type: "loot" },
  'dynamite': { name: "Dynamite", effect: "+15% Boss Kill Chance", type: "boss" },
  'raven_monocle': { name: "Raven's Monocle", effect: "+10% Yield Bonus", type: "loot" },
  'golden_harvester': { name: "Golden Harvester", effect: "+50% Yield Bonus", type: "loot" },
};

// --- 2. TRAITS ---
const WORM_TRAITS: Record<string, { bonus: string, numeric: number, type: 'tequila' | 'boss' | 'loot' | 'speed' | 'chaos' | 'omni', tier: number }> = {
  'The Don': { bonus: '+50% TEQ / +20% BOSS', numeric: 50, type: 'omni', tier: 0 },
  'Gold': { bonus: '+25% Yield', numeric: 25, type: 'tequila', tier: 1 },
  'Lava': { bonus: '+15% Boss Kill', numeric: 15, type: 'boss', tier: 1 },
  'Tequila': { bonus: '+20% Yield', numeric: 20, type: 'tequila', tier: 2 },
  'Ice': { bonus: '+12% Boss Kill', numeric: 12, type: 'boss', tier: 2 },
  'Space-Suit': { bonus: '+18% Loot Chance', numeric: 18, type: 'loot', tier: 2 },
  'Zombie': { bonus: '+10% Boss Kill', numeric: 10, type: 'boss', tier: 3 },
  'Mariachi': { bonus: '+15% Yield', numeric: 15, type: 'tequila', tier: 3 },
  'Robot': { bonus: '+8% Boss Kill', numeric: 8, type: 'boss', tier: 4 },
  'Agave': { bonus: '+12% Yield', numeric: 12, type: 'tequila', tier: 4 },
  'Classic Red': { bonus: '+5% Yield', numeric: 5, type: 'tequila', tier: 5 },
  'Classic White': { bonus: '+5% Yield', numeric: 5, type: 'tequila', tier: 5 },
  'Blue Axolotl': { bonus: '+8% Loot Chance', numeric: 8, type: 'loot', tier: 5 },
  'Unknown': { bonus: '+5% Yield', numeric: 5, type: 'tequila', tier: 5 }
};

const getTraitInfo = (type?: string) => {
  if (!type) return WORM_TRAITS['Unknown'];
  if (WORM_TRAITS[type]) return WORM_TRAITS[type];
  const key = Object.keys(WORM_TRAITS).find(k => type.includes(k));
  return key ? WORM_TRAITS[key] : WORM_TRAITS['Unknown'];
};

// --- 3. CONFIGURACIÓN DE RAIDS ---
// He agregado 4 slots de loot a cada boss para tu diseño
const RAID_LOCATIONS = [
  {
    id: 1,
    name: "The Quick Heist",
    description: "Low risk warehouse extraction. Ideal for quick liquidity.",
    boss: "Warehouse Manager",
    bossImg: "/images/bosses/manager.jpg", 
    bossDesc: "A grumpy mid-level manager guarding the keys.",
    difficulty: "Easy",
    img: "/images/raids/raid_1.jpg",
    color: "from-green-900 to-black",
    // 4 SLOTS DE LOOT
    bossLoot: [
        { id: "rusty_key", name: "Rusty Key", desc: "Increases Loot Chance in future raids.", dropRate: "40%", img: "/images/items/rusty_key.png" },
        { id: "xp_scroll", name: "XP Scroll", desc: "Boosts XP gain by 50%.", dropRate: "20%", img: "/images/items/scroll.png" },
        { id: "mystery_1", name: "???", desc: "Rare unknown item.", dropRate: "5%", img: "/images/items/question.png" },
        { id: "mystery_2", name: "???", desc: "Rare unknown item.", dropRate: "1%", img: "/images/items/question.png" }
    ],
    yields: {
        7: { min: 600, max: 800 },
        15: { min: 1400, max: 1800 },
        30: { min: 3000, max: 4000 }
    }
  },
  {
    id: 2,
    name: "Casa Raven Siege",
    description: "Assault on the fortress. High danger, heavy bags.",
    boss: "General Cork",
    bossImg: "/images/bosses/general_cork.jpg",
    bossDesc: "Heavily armored tactician. Resistant to basic attacks.",
    difficulty: "Hard",
    img: "/images/raids/raid_2.jpg",
    color: "from-red-900 to-black",
    bossLoot: [
        { id: "raven_monocle", name: "Raven's Monocle", desc: "Boosts $TEQUILA Yield permanently.", dropRate: "15%", img: "/images/items/monocle.png" },
        { id: "dynamite", name: "Dynamite Pack", desc: "Guaranteed Boss Kill consumable.", dropRate: "25%", img: "/images/items/dynamite.png" },
        { id: "shield", name: "Cork's Shield", desc: "Prevents raid failure.", dropRate: "10%", img: "/images/items/shield.png" },
        { id: "mystery_gold", name: "Golden Ticket", desc: "Legendary Access.", dropRate: "0.5%", img: "/images/items/gold_ticket.png" }
    ],
    yields: {
        7: { min: 1500, max: 2000 },
        15: { min: 3500, max: 4500 },
        30: { min: 8000, max: 10000 } 
    }
  }
];

const DURATION_OPTIONS = [
  { days: 7, label: "7 Days", seconds: 604800 },
  { days: 15, label: "15 Days", seconds: 1296000 },
  { days: 30, label: "30 Days", seconds: 2592000 }
];

export default function RaidsPage() {
  const { address, isConnected } = useAccount();
  const mingles = useAtomValue(minglesAtom);
  const isLoadingMingles = useAtomValue(isLoadingMinglesAtom);

  // Estados UI
  const [view, setView] = useState<'list' | 'setup' | 'active' | 'verifying' | 'result'>('list');
  const [subTab, setSubTab] = useState<'squad' | 'boss'>('squad'); 
  const [selectedLocation, setSelectedLocation] = useState<any>(null);
  const [selectedDuration, setSelectedDuration] = useState<any>(DURATION_OPTIONS[0]);
  
  // Selección
  const [selectedMingles, setSelectedMingles] = useState<string[]>([]);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  
  // Datos
  const [inventory, setInventory] = useState<any[]>([]);
  const [userMultipliers, setUserMultipliers] = useState({ hold: 1.0, social: 1.0 });
  const [activeSession, setActiveSession] = useState<any>(null);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [raidResult, setRaidResult] = useState<any>(null);

  // --- INIT ---
  useEffect(() => {
    const initData = async () => {
      if (!address) return;

      const { data: session } = await supabase.from('active_raids').select('*').eq('wallet_address', address).single();
      if (session) {
        const endTime = new Date(session.end_time).getTime();
        const now = Date.now();
        const timeLeft = Math.max(0, Math.ceil((endTime - now) / 1000));
        const loc = RAID_LOCATIONS.find(r => r.id === session.raid_id);
        
        setActiveSession({ ...session, endTime, location: loc });
        setTimeRemaining(timeLeft);
        setView('active');
      }

      const { data: items } = await supabase.from('player_inventory').select('*').eq('wallet_address', address).gt('quantity', 0);
      if (items) setInventory(items);

      setUserMultipliers({ hold: 1.1, social: 1.05 }); 
    };

    if (isConnected) initData();
  }, [address, isConnected]);

  // --- TIMER ---
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (view === 'active' && activeSession && timeRemaining !== null && timeRemaining > 0) {
      interval = setInterval(() => {
        const now = Date.now();
        const timeLeft = Math.max(0, Math.ceil((activeSession.endTime - now) / 1000));
        setTimeRemaining(timeLeft);
        if (timeLeft <= 0) { setTimeRemaining(0); clearInterval(interval); }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [view, activeSession, timeRemaining]);

  // --- CALCULADORA ---
  const stats = useMemo(() => {
    let bossChance = 0;
    if (selectedMingles.length >= 5) bossChance = 50 + ((Math.min(selectedMingles.length, 10) - 5) * 5);
    
    let totalYieldBonus = 0;
    let lootChanceBonus = 0;

    selectedMingles.forEach(id => {
      const m = mingles.find(u => u.id === id);
      const trait = getTraitInfo(m?.type);
      
      if (trait.type === 'boss' || trait.type === 'omni') bossChance += trait.numeric; 
      if (trait.type === 'tequila' || trait.type === 'omni') totalYieldBonus += trait.numeric;
      if (trait.type === 'loot') lootChanceBonus += trait.numeric;
    });

    selectedItems.forEach(itemId => {
       const itemDef = ITEMS_DB[itemId];
       if (itemDef?.type === 'boss') bossChance += 15;
       if (itemDef?.type === 'loot') lootChanceBonus += 5;
    });

    return {
      bossChance: Math.min(bossChance, 100),
      yieldBonus: totalYieldBonus,
      lootBonus: lootChanceBonus
    };
  }, [selectedMingles, selectedItems, mingles]);

  const estimatedTequila = useMemo(() => {
    if (!selectedLocation) return "0";
    const baseRange = selectedLocation.yields[selectedDuration.days];
    
    const rawMin = baseRange.min * selectedMingles.length;
    const rawMax = baseRange.max * selectedMingles.length;
    
    const totalMult = (1 + (stats.yieldBonus / 100)) * userMultipliers.hold * userMultipliers.social;
    
    return `${Math.floor(rawMin * totalMult)} - ${Math.floor(rawMax * totalMult)}`;
  }, [selectedLocation, selectedDuration, selectedMingles, stats, userMultipliers]);

  // --- HANDLERS ---
  const toggleMingle = (id: string) => {
    if (selectedMingles.includes(id)) setSelectedMingles(prev => prev.filter(m => m !== id));
    else {
      if (selectedMingles.length >= 10) return alert("Squad full (Max 10).");
      setSelectedMingles(prev => [...prev, id]);
    }
  };

  const toggleItem = (itemId: string) => {
    const hasItem = inventory.find(i => i.item_id === itemId && i.quantity > 0);
    if (!hasItem) return;

    if (selectedItems.includes(itemId)) setSelectedItems(prev => prev.filter(i => i !== itemId));
    else {
      if (selectedItems.length >= 3) return alert("Backpack full (Max 3).");
      setSelectedItems(prev => [...prev, itemId]);
    }
  };

  const startRaid = async () => {
    if (!address) return;
    if (selectedMingles.length === 0) return alert("Select squad.");

    // PROD: selectedDuration.seconds
    const durationSec = 30; // DEMO
    const now = new Date();
    const endTime = new Date(now.getTime() + (durationSec * 1000));

    const { data, error } = await supabase.from('active_raids').insert([{
        wallet_address: address,
        raid_id: selectedLocation.id,
        squad: selectedMingles,
        items: selectedItems,
        end_time: endTime.toISOString()
    }]).select().single();

    if (error) return alert("Error starting raid. Check console.");

    setActiveSession({ ...data, endTime: endTime.getTime(), location: selectedLocation });
    setTimeRemaining(durationSec);
    setView('active');
  };

  const finalizeRaid = async () => {
    setView('verifying');
    setTimeout(async () => {
        await supabase.from('active_raids').delete().eq('wallet_address', address);
        setActiveSession(null);
        setRaidResult({ 
            tequila: 4500, 
            xp: 100, 
            bossKilled: true,
            bossLootFound: selectedLocation.bossLoot[0] 
        });
        setView('result');
    }, 2000);
  };

  const formatTime = (seconds: number) => {
    const d = Math.floor(seconds / 86400);
    const h = Math.floor((seconds % 86400) / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${d}d ${h}h ${m}m ${s}s`;
  };

  if (!isConnected) return <ConnectWalletView />;
  if (isLoadingMingles) return <div className="flex justify-center h-[50vh]"><Loader2 className="animate-spin text-[#E15162]"/></div>;

  return (
    <div className="max-w-7xl mx-auto pb-20 space-y-8">
      
      {/* HEADER */}
      <div className="flex justify-between items-end border-b-4 border-[#1D1D1D] pb-4">
         <div>
            <h1 className="text-5xl font-black uppercase text-[#1D1D1D] leading-none mb-2">Mingles Raids</h1>
            <p className="font-bold text-[#1D1D1D]/60">Soft-Stake Strategy Game.</p>
         </div>
         {view === 'setup' && (
            <button onClick={() => setView('list')} className="font-black uppercase underline decoration-[#E15162] decoration-4">Back to Map</button>
         )}
      </div>

      {/* --- VISTA 1: LISTA --- */}
      {view === 'list' && !activeSession && (
         <div className="grid grid-cols-1 gap-8">
            {RAID_LOCATIONS.map((raid) => (
               <motion.div 
                  key={raid.id}
                  whileHover={{ scale: 1.01 }}
                  onClick={() => { setSelectedLocation(raid); setView('setup'); setSubTab('squad'); }}
                  className="relative h-64 md:h-80 rounded-[2.5rem] overflow-hidden border-4 border-[#1D1D1D] cursor-pointer group shadow-[8px_8px_0_0_#1D1D1D]"
               >
                  <img src={raid.img} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  <div className={`absolute inset-0 bg-gradient-to-t ${raid.color} opacity-90 group-hover:opacity-80 transition-opacity`} />
                  <div className="absolute inset-0 p-8 flex flex-col justify-end text-white">
                     <div className="flex justify-between items-end">
                        <div>
                           <div className="flex gap-2 mb-3">
                               <span className="bg-[#E15162] text-white text-xs font-black uppercase px-3 py-1 rounded">Boss: {raid.boss}</span>
                               <span className="bg-white text-[#1D1D1D] text-xs font-black uppercase px-3 py-1 rounded">Diff: {raid.difficulty}</span>
                           </div>
                           <h2 className="text-4xl md:text-5xl font-black uppercase leading-none mb-2 drop-shadow-lg">{raid.name}</h2>
                           <p className="text-lg font-bold opacity-90 max-w-2xl leading-tight drop-shadow-md">{raid.description}</p>
                        </div>
                     </div>
                  </div>
               </motion.div>
            ))}
         </div>
      )}

      {/* --- VISTA 2: SETUP --- */}
      {view === 'setup' && selectedLocation && (
         <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* LEFT COLUMN */}
            <div className="lg:col-span-8 space-y-6">
               
               {/* 1. DURATION SELECTOR */}
               <div className="bg-white p-6 rounded-[2rem] border-4 border-[#1D1D1D]">
                  <h3 className="text-xl font-black uppercase mb-4 flex items-center gap-2"><Clock/> 1. Select Duration</h3>
                  <div className="grid grid-cols-3 gap-4">
                     {DURATION_OPTIONS.map((opt) => (
                        <div 
                           key={opt.days}
                           onClick={() => setSelectedDuration(opt)}
                           className={`cursor-pointer rounded-xl border-4 p-4 text-center transition-all ${selectedDuration.days === opt.days ? 'border-[#E15162] bg-[#E15162] text-white shadow-lg scale-105' : 'border-[#1D1D1D] bg-white hover:bg-[#EDEDD9]'}`}
                        >
                           <p className="text-2xl font-black">{opt.label}</p>
                           <p className="text-[10px] font-bold uppercase opacity-80 mt-1">
                              Base: {selectedLocation.yields[opt.days].min}-{selectedLocation.yields[opt.days].max}
                           </p>
                        </div>
                     ))}
                  </div>
               </div>

               {/* 2. TABBED AREA */}
               <div className="bg-[#EDEDD9] p-6 rounded-[2rem] border-4 border-[#1D1D1D] min-h-[500px]">
                  <div className="flex gap-4 mb-6 border-b-2 border-[#1D1D1D]/10 pb-4">
                      <button onClick={() => setSubTab('squad')} className={`text-xl font-black uppercase ${subTab === 'squad' ? 'text-[#E15162]' : 'text-[#1D1D1D] opacity-50'}`}>2. Assemble Squad</button>
                      <button onClick={() => setSubTab('boss')} className={`text-xl font-black uppercase ${subTab === 'boss' ? 'text-[#E15162]' : 'text-[#1D1D1D] opacity-50'}`}>Target Intel</button>
                      <span className="ml-auto bg-[#1D1D1D] text-white px-3 py-1 rounded-full text-xs font-bold self-center">{selectedMingles.length}/10</span>
                  </div>

                  {subTab === 'squad' && (
                      <>
                        {/* MINGLES GRID */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar mb-6">
                            {mingles.map((mingle) => {
                                const isSelected = selectedMingles.includes(mingle.id!);
                                const trait = getTraitInfo(mingle.type);
                                console.log("mingle type: ", mingle.type);
                                
                                return (
                                    <div 
                                        key={mingle.id} 
                                        onClick={() => toggleMingle(mingle.id!)}
                                        className={`flex items-center gap-3 p-3 rounded-xl border-4 cursor-pointer transition-all ${isSelected ? 'bg-[#1D1D1D] border-[#1D1D1D] text-white' : 'bg-white border-[#1D1D1D]/20 hover:border-[#1D1D1D]'}`}
                                    >
                                        <img src={mingle.image} className="w-10 h-10 rounded-lg bg-gray-200 object-cover border border-white/20 shrink-0" />
                                        <div className="flex-1 overflow-hidden">
                                            <div className="flex justify-between">
                                                <p className="text-[10px] font-black uppercase opacity-60 truncate">{mingle.name}</p>
                                                {isSelected && <CheckCircle2 size={14} className="text-[#E15162] shrink-0" />}
                                            </div>
                                            <p className={`text-xs font-black uppercase leading-tight ${isSelected ? 'text-[#E15162]' : 'text-[#1D1D1D]'}`}>
                                                {mingle.type} {trait.bonus}
                                            </p>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>

                        {/* BACKPACK SECTION (6 SLOTS FIXED) */}
                        <div className="bg-white/50 p-4 rounded-xl border-2 border-[#1D1D1D]/10">
                            <h4 className="text-sm font-black uppercase flex items-center gap-2 mb-3"><Backpack size={16}/> Supplies ({selectedItems.length}/3)</h4>
                            
                            <div className="grid grid-cols-6 gap-2">
                                {[0, 1, 2, 3, 4, 5].map((index) => {
                                    // Obtenemos el item real si existe
                                    const invItem = inventory[index];
                                    const itemDef = invItem ? ITEMS_DB[invItem.item_id] : null;
                                    const isSelected = invItem ? selectedItems.includes(invItem.item_id) : false;

                                    return (
                                        <div 
                                            key={index}
                                            onClick={() => invItem && toggleItem(invItem.item_id)}
                                            className={`
                                                aspect-square rounded-xl border-2 flex flex-col items-center justify-center relative transition-all
                                                ${invItem 
                                                    ? 'bg-white cursor-pointer hover:scale-105' 
                                                    : 'bg-transparent border-dashed border-[#1D1D1D]/20'
                                                }
                                                ${isSelected ? 'border-[#E15162] shadow-[0_0_10px_rgba(225,81,98,0.3)]' : invItem ? 'border-[#1D1D1D]/20' : ''}
                                            `}
                                        >
                                            {invItem ? (
                                                <>
                                                    {/* PLACEHOLDER DE IMAGEN SI NO HAY */}
                                                    <div className="text-xs font-black uppercase text-center leading-none z-10">{itemDef?.name.split(' ')[0]}</div>
                                                    <div className="absolute top-1 right-1 bg-[#1D1D1D] text-white text-[8px] font-bold px-1 rounded-full">x{invItem.quantity}</div>
                                                    {isSelected && <div className="absolute inset-0 border-2 border-[#E15162] rounded-xl pointer-events-none"/>}
                                                </>
                                            ) : (
                                                <HelpCircle size={16} className="text-[#1D1D1D]/10" />
                                            )}
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                      </>
                  )}

                  {subTab === 'boss' && (
                      <div className="flex flex-col md:flex-row gap-6 h-full">
                          {/* BOSS CARD */}
                          <div className="w-full md:w-5/12">
                              <div className="aspect-[3/4] rounded-2xl overflow-hidden border-4 border-[#1D1D1D] relative shadow-lg group">
                                  {/* Asegúrate de subir la imagen a /public/images/bosses/... */}
                                  <img src={selectedLocation.bossImg} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" />
                                  <div className="absolute bottom-0 inset-x-0 bg-[#1D1D1D]/90 p-4 text-white backdrop-blur-sm">
                                      <p className="text-2xl font-black uppercase leading-none mb-1">{selectedLocation.boss}</p>
                                      <p className="text-xs font-bold opacity-60">{selectedLocation.bossDesc}</p>
                                  </div>
                              </div>
                          </div>
                          
                          {/* LOOT TABLE (4 SLOTS) */}
                          <div className="flex-1">
                              <h4 className="font-black uppercase text-lg border-b-2 border-[#1D1D1D]/10 pb-4 mb-4">Possible Drops</h4>
                              <div className="grid grid-cols-2 gap-4">
                                  {/* Renderizamos siempre 4 espacios */}
                                  {[0, 1, 2, 3].map((idx) => {
                                      const loot = selectedLocation.bossLoot[idx];
                                      return (
                                          <div key={idx} className="bg-white p-3 rounded-xl border-2 border-[#1D1D1D] flex flex-col gap-2 relative overflow-hidden group">
                                              {loot ? (
                                                  <>
                                                      <div className="flex items-start justify-between">
                                                          <div className="w-10 h-10 bg-[#EDEDD9] rounded-lg border border-[#1D1D1D]/10 flex items-center justify-center">
                                                              {/* Aquí iría la imagen del loot */}
                                                              <img src={loot.img || "/images/placeholder_bottle.png"} className="w-full h-full object-contain p-1" />
                                                          </div>
                                                          <span className="bg-[#E15162]/10 text-[#E15162] text-[9px] font-black px-1.5 py-0.5 rounded uppercase">{loot.dropRate}</span>
                                                      </div>
                                                      <div>
                                                          <p className="font-black uppercase text-xs leading-none mb-1">{loot.name}</p>
                                                          <p className="text-[10px] font-bold opacity-50 leading-tight">{loot.desc}</p>
                                                      </div>
                                                  </>
                                              ) : (
                                                  <div className="flex items-center justify-center h-full opacity-20">
                                                      <HelpCircle size={24}/>
                                                  </div>
                                              )}
                                          </div>
                                      )
                                  })}
                              </div>
                          </div>
                      </div>
                  )}
               </div>
            </div>

            {/* RIGHT COLUMN: LIVE STATS */}
            <div className="lg:col-span-4 space-y-6">
               <div className="bg-[#1D1D1D] text-white p-6 rounded-[2rem] border-4 border-[#1D1D1D] shadow-[8px_8px_0_0_#EDEDD9] sticky top-4">
                  <h3 className="text-2xl font-black uppercase mb-6 border-b border-white/20 pb-4">Mission Intel</h3>
                  
                  {/* Estimated Yield */}
                  <div className="mb-8">
                     <p className="text-xs font-bold uppercase opacity-50 mb-1">Projected Earnings</p>
                     <div className="flex items-center gap-2">
                        <TrendingUp className="text-[#E15162]" size={32}/>
                        <div>
                           <p className="text-3xl font-black leading-none">{estimatedTequila}</p>
                           <p className="text-sm font-bold text-[#E15162]">$TEQUILA</p>
                        </div>
                     </div>
                  </div>

                  {/* Accumulated Stats */}
                  <div className="space-y-4 mb-8">
                     <div className="bg-white/10 p-3 rounded-xl flex justify-between items-center">
                        <div className="flex flex-col">
                            <span className="text-xs font-bold uppercase">Boss Kill Chance</span>
                            <span className="text-[10px] opacity-50">Base + Items + Traits</span>
                        </div>
                        <span className={`font-black ${stats.bossChance > 80 ? 'text-green-400' : 'text-orange-400'}`}>{stats.bossChance}%</span>
                     </div>

                     <div className="bg-white/10 p-3 rounded-xl flex justify-between items-center">
                        <div className="flex flex-col">
                            <span className="text-xs font-bold uppercase">Loot Drop Chance</span>
                            <span className="text-[10px] opacity-50">Squad Traits Bonus</span>
                        </div>
                        <span className="font-black text-[#E15162]">+{stats.lootBonus}%</span>
                     </div>

                     <div className="bg-white/10 p-3 rounded-xl flex justify-between items-center">
                        <div className="flex flex-col">
                            <span className="text-xs font-bold uppercase">Multipliers</span>
                            <span className="text-[10px] opacity-50">Hold + Social</span>
                        </div>
                        <span className="font-black text-blue-400">x{(userMultipliers.hold * userMultipliers.social).toFixed(2)}</span>
                     </div>
                  </div>

                  <button 
                     onClick={startRaid}
                     disabled={selectedMingles.length === 0}
                     className="w-full bg-[#E15162] text-white py-4 rounded-xl font-black uppercase text-xl hover:bg-white hover:text-[#1D1D1D] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                     Start Raid <Sword fill="currentColor" size={20}/>
                  </button>
               </div>
            </div>
         </div>
      )}

      {/* --- VISTA 3: ACTIVE (TIMER) --- */}
      {(view === 'active' || view === 'verifying') && activeSession && (
         <div className="max-w-2xl mx-auto text-center py-20">
            <div className="bg-white rounded-[3rem] border-4 border-[#1D1D1D] p-10 shadow-[12px_12px_0_0_#1D1D1D] relative overflow-hidden">
               <div className="absolute inset-0 opacity-5 bg-[url('/images/pattern.png')]"></div>
               {view === 'verifying' ? (
                  <div className="animate-pulse flex flex-col items-center">
                     <Loader2 size={64} className="text-[#E15162] animate-spin mb-4" />
                     <h2 className="text-3xl font-black uppercase">Verifying Loot...</h2>
                  </div>
               ) : timeRemaining === 0 ? (
                  <div className="space-y-6">
                     <CheckCircle2 size={80} className="text-green-500 mx-auto" />
                     <div>
                        <h2 className="text-4xl font-black uppercase text-[#1D1D1D]">Mission Complete</h2>
                        <p className="text-lg font-bold opacity-60">Your squad has returned.</p>
                     </div>
                     <button onClick={finalizeRaid} className="w-full bg-[#1D1D1D] text-white py-4 rounded-2xl font-black uppercase text-xl shadow-[4px_4px_0_0_#E15162] hover:translate-y-[-2px] transition-transform">
                        Claim Rewards
                     </button>
                  </div>
               ) : (
                  <div>
                     <div className="inline-block bg-[#EDEDD9] px-4 py-1 rounded-full border-2 border-[#1D1D1D] text-xs font-black uppercase mb-6">
                        In Progress • {activeSession.location?.name}
                     </div>
                     <Clock size={64} className="mx-auto text-[#1D1D1D] mb-4 animate-pulse" />
                     <p className="text-6xl md:text-8xl font-black font-mono text-[#1D1D1D] tracking-tighter">
                        {formatTime(timeRemaining || 0)}
                     </p>
                     <p className="text-sm font-bold opacity-40 mt-4 uppercase tracking-widest">Time Remaining</p>
                  </div>
               )}
            </div>
         </div>
      )}

      {/* --- VISTA 4: RESULTADO --- */}
      {view === 'result' && raidResult && (
         <div className="max-w-md mx-auto bg-white rounded-[3rem] border-4 border-[#1D1D1D] overflow-hidden text-center shadow-[12px_12px_0_0_#1D1D1D]">
            <div className="bg-[#E15162] p-8">
               <h2 className="text-4xl font-black uppercase text-white">Mission Report</h2>
            </div>
            <div className="p-8 space-y-6">
               <div>
                  <p className="text-xs font-bold uppercase opacity-50">Total Stolen</p>
                  <p className="text-5xl font-black text-[#1D1D1D]">+{raidResult.tequila} $TEQ</p>
               </div>
               {raidResult.bossLootFound && (
                  <div className="bg-[#EDEDD9] p-4 rounded-2xl border-2 border-[#1D1D1D]">
                     <p className="text-xs font-black uppercase mb-2">Rare Loot Found!</p>
                     <p className="text-xl font-bold flex items-center justify-center gap-2">
                        <span>{raidResult.bossLootFound.name}</span>
                     </p>
                  </div>
               )}
               <button onClick={() => { setRaidResult(null); setView('list'); }} className="w-full bg-[#1D1D1D] text-white py-3 rounded-xl font-black uppercase">
                  Return to Base
               </button>
            </div>
         </div>
      )}
    </div>
  );
}