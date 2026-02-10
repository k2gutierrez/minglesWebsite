'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAtomValue } from 'jotai';
import { useAccount } from 'wagmi';
import { 
  Sword, Skull, Clock, Backpack, 
  CheckCircle2, Loader2, TrendingUp, HelpCircle,
  XCircle, Play, AlertTriangle, Briefcase, ChevronRight, ArrowLeft
} from 'lucide-react';

import { minglesAtom, isLoadingMinglesAtom } from '@/components/engine/atoms';
import { supabase } from '@/components/engine/supabase'; 
import { ConnectWalletView } from '@/components/ConnectWalletView';
import { fetchUserMingles } from '@/components/engine/indexer';

// ==========================================
// 🔧 CONFIGURACIÓN
// ==========================================
const IS_DEV_MODE = true; // true = Minutos (Testing), false = Días (Prod)

const DURATION_CONFIG = {
  7:  { label: "7 Days",  seconds: IS_DEV_MODE ? 60 : 604800 },
  15: { label: "15 Days", seconds: IS_DEV_MODE ? 120 : 1296000 },
  30: { label: "30 Days", seconds: IS_DEV_MODE ? 180 : 2592000 }
};

// ==========================================
// 🧠 BASE DE DATOS (TRAITS & RAIDS)
// ==========================================

type TraitData = { rarity: string; passiveType: string; passiveVal: number; exclusiveItem: string; itemEffect: string; };

const WORM_DATABASE: Record<string, TraitData> = {
  // Las llaves deben ser minúsculas para facilitar el match
  'godlike': { rarity: 'Godlike', passiveType: 'omni', passiveVal: 20, exclusiveItem: 'Mythic Sigil', itemEffect: '+40% Yield' },
  'gold': { rarity: 'Legendary', passiveType: 'yield', passiveVal: 12, exclusiveItem: 'Golden Extractor', itemEffect: '+25% Yield' },
  'lava': { rarity: 'Legendary', passiveType: 'boss', passiveVal: 8, exclusiveItem: 'Volcanic Charge', itemEffect: '+20% Boss' },
  'water-lightning': { rarity: 'Legendary', passiveType: 'loot', passiveVal: 10, exclusiveItem: 'Tempest Net', itemEffect: '+30% Loot' },
  'tequila': { rarity: 'Legendary', passiveType: 'yield', passiveVal: 12, exclusiveItem: 'Añejo Core', itemEffect: '+25% Yield' },
  'ice': { rarity: 'Epic', passiveType: 'boss', passiveVal: 7, exclusiveItem: 'Cryo Spike', itemEffect: '+15% Boss' },
  'rock-wind': { rarity: 'Epic', passiveType: 'boss', passiveVal: 7, exclusiveItem: 'Gale Hook', itemEffect: '+15% Boss' },
  'space-suit': { rarity: 'Epic', passiveType: 'loot', passiveVal: 8, exclusiveItem: 'Void Scanner', itemEffect: '+25% Loot' },
  'shroom': { rarity: 'Epic', passiveType: 'loot', passiveVal: 8, exclusiveItem: 'Spore Cache', itemEffect: '+25% Loot' },
  'peyote': { rarity: 'Epic', passiveType: 'loot', passiveVal: 8, exclusiveItem: 'Spirit Totem', itemEffect: '+25% Loot' },
  'catrín': { rarity: 'Epic', passiveType: 'yield', passiveVal: 10, exclusiveItem: 'Silver Cane', itemEffect: '+20% Yield' },
  'catrin': { rarity: 'Epic', passiveType: 'yield', passiveVal: 10, exclusiveItem: 'Silver Cane', itemEffect: '+20% Yield' },
  'alebrije': { rarity: 'Epic', passiveType: 'loot', passiveVal: 8, exclusiveItem: 'Spirit Paint', itemEffect: '+25% Loot' },
  'spirit': { rarity: 'Epic', passiveType: 'loot', passiveVal: 8, exclusiveItem: 'Ectoplasm Vial', itemEffect: '+25% Loot' },
  'mariachi': { rarity: 'Epic', passiveType: 'yield', passiveVal: 10, exclusiveItem: 'War Drum', itemEffect: '+20% Yield' },
  'zombie': { rarity: 'Rare', passiveType: 'boss', passiveVal: 6, exclusiveItem: 'Rotten Bomb', itemEffect: '+12% Boss' },
  'xolo': { rarity: 'Rare', passiveType: 'boss', passiveVal: 6, exclusiveItem: 'Shadow Collar', itemEffect: '+12% Boss' },
  'ai': { rarity: 'Rare', passiveType: 'loot', passiveVal: 6, exclusiveItem: 'Backdoor Chip', itemEffect: '+20% Loot' },
  'robot': { rarity: 'Rare', passiveType: 'boss', passiveVal: 6, exclusiveItem: 'Targeting Module', itemEffect: '+12% Boss' },
  'jaguar': { rarity: 'Rare', passiveType: 'boss', passiveVal: 6, exclusiveItem: 'Predator Claw', itemEffect: '+12% Boss' },
  'slime': { rarity: 'Rare', passiveType: 'loot', passiveVal: 6, exclusiveItem: 'Slime Pouch', itemEffect: '+20% Loot' },
  'agave': { rarity: 'Uncommon', passiveType: 'yield', passiveVal: 6, exclusiveItem: 'Agave Resin', itemEffect: '+10% Yield' },
  'ape': { rarity: 'Uncommon', passiveType: 'boss', passiveVal: 4, exclusiveItem: 'Primal Grip', itemEffect: '+8% Boss' },
  'water': { rarity: 'Uncommon', passiveType: 'loot', passiveVal: 5, exclusiveItem: 'River Satchel', itemEffect: '+15% Loot' },
  'blue axolotl': { rarity: 'Uncommon', passiveType: 'loot', passiveVal: 5, exclusiveItem: 'Blue Slime Jar', itemEffect: '+15% Loot' },
  'pink axolotl': { rarity: 'Uncommon', passiveType: 'loot', passiveVal: 5, exclusiveItem: 'Pink Slime Jar', itemEffect: '+15% Loot' },
  'jimador': { rarity: 'Uncommon', passiveType: 'yield', passiveVal: 6, exclusiveItem: 'Jima Blade', itemEffect: '+10% Yield' },
  'classic': { rarity: 'Common', passiveType: 'yield', passiveVal: 3, exclusiveItem: 'Rusty Tool', itemEffect: '+6% Yield' },
  'unknown': { rarity: 'Common', passiveType: 'yield', passiveVal: 3, exclusiveItem: 'Old Flask', itemEffect: '+6% Yield' }
};

// FIX: Búsqueda Insensible a Mayúsculas
const getWormStats = (type?: string): TraitData => {
  if (!type) return WORM_DATABASE['unknown'];
  const normalizedType = type.toLowerCase();
  
  // 1. Búsqueda exacta
  if (WORM_DATABASE[normalizedType]) return WORM_DATABASE[normalizedType];
  
  // 2. Búsqueda parcial (ej: "gold worm" contiene "gold")
  const key = Object.keys(WORM_DATABASE).find(k => normalizedType.includes(k));
  
  // Debug para ver qué está llegando si falla
  if (!key) console.log(`Stats lookup failed for: ${type} (normalized: ${normalizedType})`);
  
  return key ? WORM_DATABASE[key] : WORM_DATABASE['unknown'];
};

// Items visuales
const ITEMS_INFO: Record<string, { name: string, type: 'yield'|'boss'|'loot', val: number }> = {
  'rusty_key': { name: "Rusty Key", type: 'loot', val: 5 },
  'dynamite': { name: "Dynamite", type: 'boss', val: 15 },
  'raven_monocle': { name: "Raven's Monocle", type: 'yield', val: 10 },
  'golden_harvester': { name: "Golden Harvester", type: 'yield', val: 50 },
  'xp_scroll': { name: "XP Scroll", type: 'loot', val: 0 }, // Ejemplo sin stat de batalla
};

const RAID_LOCATIONS = [
  {
    id: 1,
    name: "The Quick Heist",
    description: "Low risk warehouse extraction. Ideal for quick liquidity.",
    boss: "Warehouse Manager",
    // Placeholder vertical verde oscuro
    bossImg: "https://placehold.co/600x800/1b4d1b/ffffff/png?text=Boss:+Manager", 
    bossDesc: "A grumpy mid-level manager guarding the keys.",
    difficulty: "Easy",
    // Placeholder horizontal para el fondo
    img: "https://placehold.co/800x400/0f2e0f/ffffff/png?text=Raid:+Warehouse",
    color: "from-green-900 to-black",
    bossLoot: [
        { name: "Rusty Key", dropRate: "40%", img: "https://placehold.co/200x200/333/E15162/png?text=Key", desc: "Common loot key" },
        { name: "XP Scroll", dropRate: "20%", img: "https://placehold.co/200x200/ddd/000/png?text=Scroll", desc: "Boosts XP" },
        { name: "Mystery Box", dropRate: "5%", img: "https://placehold.co/200x200/444/fff/png?text=???", desc: "Unknown contents" },
        { name: "Rare Gem", dropRate: "1%", img: "https://placehold.co/200x200/800080/fff/png?text=Gem", desc: "High value" }
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
    // Placeholder vertical rojo oscuro
    bossImg: "https://placehold.co/600x800/4d1b1b/ffffff/png?text=Boss:+Gen.+Cork",
    bossDesc: "Heavily armored tactician. Resistant to basic attacks.",
    difficulty: "Hard",
    // Placeholder horizontal
    img: "https://placehold.co/800x400/2e0f0f/ffffff/png?text=Raid:+Fortress",
    color: "from-red-900 to-black",
    bossLoot: [
        { name: "Raven's Monocle", dropRate: "15%", img: "https://placehold.co/200x200/000/fff/png?text=Monocle", desc: "Passive Yield Boost" },
        { name: "Dynamite Pack", dropRate: "25%", img: "https://placehold.co/200x200/900/fff/png?text=TNT", desc: "Boss Killer" },
        { name: "Cork's Shield", dropRate: "10%", img: "https://placehold.co/200x200/555/fff/png?text=Shield", desc: "Defense Item" },
        { name: "Golden Ticket", dropRate: "0.5%", img: "https://placehold.co/200x200/ffd700/000/png?text=Ticket", desc: "Legendary Access" }
    ],
    yields: {
        7: { min: 1500, max: 2000 },
        15: { min: 3500, max: 4500 },
        30: { min: 8000, max: 10000 } 
    }
  }
];

export default function RaidsPage() {
  const { address, isConnected } = useAccount();
  const mingles = useAtomValue(minglesAtom);
  const isLoadingMingles = useAtomValue(isLoadingMinglesAtom);
  
  // Vistas
  const [view, setView] = useState<'dashboard' | 'setup'>('dashboard');
  
  // Selección
  const [selectedLocation, setSelectedLocation] = useState<any>(null);
  const [selectedDurationKey, setSelectedDurationKey] = useState<7 | 15 | 30>(7);
  const [selectedMingles, setSelectedMingles] = useState<string[]>([]);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  
  // Datos Globales
  const [inventory, setInventory] = useState<any[]>([]);
  const [activeSessions, setActiveSessions] = useState<any[]>([]); 
  const [lockedMingles, setLockedMingles] = useState<string[]>([]); 
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Resultado Modal
  const [resultModal, setResultModal] = useState<any>(null);

  // --- CARGA DE DATOS ---
  const loadUserData = async () => {
    if (!address) return;
    
    // A. Misiones Activas
    const { data: raids } = await supabase.from('active_raids').select('*').eq('wallet_address', address);
    if (raids) {
        const allSquads = raids.flatMap(r => r.squad); 
        setLockedMingles(allSquads);
        const mappedSessions = raids.map(r => {
            const raidInfo = RAID_LOCATIONS.find(loc => loc.id === r.raid_id);
            const endTime = new Date(r.end_time).getTime();
            return { ...r, endTime, location: raidInfo };
        });
        setActiveSessions(mappedSessions);
    }

    // B. Inventario
    const { data: items } = await supabase.from('player_inventory').select('*').eq('wallet_address', address).gt('quantity', 0);
    if (items) setInventory(items);
  };

  useEffect(() => {
    if (isConnected) loadUserData();
    const interval = setInterval(() => { if(isConnected) loadUserData(); }, 5000);
    return () => clearInterval(interval);
  }, [address, isConnected]);

  // --- CÁLCULOS ---
  const calculateWinChance = (squadIds: string[], itemIds: string[]) => {
    let chance = 0; 
    if (squadIds.length >= 5) chance = 50 + ((Math.min(squadIds.length, 10) - 5) * 5);
    
    squadIds.forEach(id => {
      const m = mingles.find(u => u.id === id);
      const data = getWormStats(m?.type);
      if (data.passiveType === 'boss' || data.passiveType === 'omni') chance += data.passiveVal;
    });

    itemIds.forEach(itemId => {
       const info = ITEMS_INFO[itemId];
       if (info?.type === 'boss') chance += info.val;
    });

    return Math.min(chance, 100);
  };

  const setupStats = useMemo(() => {
      const winChance = calculateWinChance(selectedMingles, selectedItems);
      let yieldBonus = 0;
      let lootBonus = 0;
      
      selectedMingles.forEach(id => {
        const m = mingles.find(u => u.id === id);
        const data = getWormStats(m?.type);
        if (data.passiveType === 'yield' || data.passiveType === 'omni') yieldBonus += data.passiveVal;
        if (data.passiveType === 'loot' || data.passiveType === 'omni') lootBonus += data.passiveVal;
      });
      
      selectedItems.forEach(itemId => {
         const info = ITEMS_INFO[itemId];
         if (info?.type === 'yield') yieldBonus += info.val;
         if (info?.type === 'loot') lootBonus += info.val;
      });

      return { winChance, yieldBonus, lootBonus };
  }, [selectedMingles, selectedItems, mingles]);

  const estimatedTequila = useMemo(() => {
    if (!selectedLocation) return "0";
    const baseRange = selectedLocation.yields[selectedDurationKey];
    const rawMin = baseRange.min * Math.max(1, selectedMingles.length);
    const rawMax = baseRange.max * Math.max(1, selectedMingles.length);
    const totalMult = 1 + (setupStats.yieldBonus / 100);
    return `${Math.floor(rawMin * totalMult)} - ${Math.floor(rawMax * totalMult)}`;
  }, [selectedLocation, selectedDurationKey, selectedMingles, setupStats]);

  // --- ACCIONES ---

  // START RAID
  const startRaid = async () => {
    if (!address) return;
    if (selectedMingles.length === 0) return alert("Select squad.");
    
    setIsProcessing(true);
    const durationConfig = DURATION_CONFIG[selectedDurationKey];
    const now = new Date();
    const endTime = new Date(now.getTime() + (durationConfig.seconds * 1000));
    
    try {
        // 1. Quema de Items
        for (const itemId of selectedItems) {
            const current = inventory.find(i => i.item_id === itemId);
            if (current && current.quantity > 0) {
                 await supabase.from('player_inventory')
                    .update({ quantity: current.quantity - 1 })
                    .match({ wallet_address: address, item_id: itemId });
            }
        }

        // 2. Insertar Raid
        const { error } = await supabase.from('active_raids').insert([{
            wallet_address: address,
            raid_id: selectedLocation.id,
            squad: selectedMingles,
            items: selectedItems,
            end_time: endTime.toISOString()
        }]);

        if (error) throw error;

        await loadUserData();
        setView('dashboard');
        setSelectedMingles([]);
        setSelectedItems([]);

    } catch (e) {
        console.error(e);
        alert("Error starting raid.");
    } finally {
        setIsProcessing(false);
    }
  };

  // RESOLVE MISSION (Win/Loss)
  const resolveMission = async (session: any) => {
    setIsProcessing(true);
    try {
        const currentMingles = await fetchUserMingles(address!);
        const stillOwns = session.squad.every((id: string) => currentMingles.some((m: any) => m.id === id));

        if (!stillOwns) {
            await supabase.from('active_raids').delete().eq('id', session.id);
            alert("Security Fail: Mingles missing. Raid Failed.");
            await loadUserData();
            setIsProcessing(false);
            return;
        }

        const winChance = calculateWinChance(session.squad, session.items || []);
        const roll = Math.random() * 100;
        const isVictory = roll <= winChance;

        let rewards = null;

        if (isVictory) {
            const raidConfig = RAID_LOCATIONS.find(r => r.id === session.raid_id);
            const durationSec = (new Date(session.end_time).getTime() - new Date(session.start_time).getTime()) / 1000;
            let daysKey: 7|15|30 = 7;
            if (durationSec > 1000000) daysKey = 15;
            if (durationSec > 2000000) daysKey = 30;

            const range = raidConfig!.yields[daysKey];
            const baseAmount = Math.floor(Math.random() * (range.max - range.min + 1)) + range.min;
            const amount = baseAmount * session.squad.length;

            await supabase.rpc('add_points', { p_wallet: address, p_amount: amount });

            const lootRoll = Math.random() * 100;
            let itemFound = null;
            if (lootRoll < 30) {
                 const lootDef = raidConfig!.bossLoot[0];
                 const itemId = lootDef.name.toLowerCase().replace(/ /g, '_');
                 // Aquí deberías hacer el upsert real del item
                 // ... await supabase.from('player_inventory').upsert(...)
                 itemFound = lootDef;
            }
            rewards = { tequila: amount, item: itemFound };
        } 

        await supabase.from('active_raids').delete().eq('id', session.id);
        
        setResultModal({ isVictory, roll, winChance, rewards, squadSize: session.squad.length });
        await loadUserData();

    } catch (e) {
        console.error(e);
        alert("Error resolving mission.");
    } finally {
        setIsProcessing(false);
    }
  };

  const cancelRaid = async (sessionId: number) => {
    if (!confirm("Cancel mission? Items used will NOT be returned.")) return;
    setIsProcessing(true);
    await supabase.from('active_raids').delete().eq('id', sessionId);
    await loadUserData();
    setIsProcessing(false);
  };

  // --- HELPERS UI ---
  const toggleMingle = (id: string) => {
     if (lockedMingles.includes(id)) return;
     if (selectedMingles.includes(id)) setSelectedMingles(prev => prev.filter(m => m !== id));
     else {
        if (selectedMingles.length >= 10) return alert("Max 10 per squad.");
        setSelectedMingles(prev => [...prev, id]);
     }
  };
  
  const toggleItem = (itemId: string) => {
      if (selectedItems.includes(itemId)) setSelectedItems(prev => prev.filter(i => i !== itemId));
      else {
          if (selectedItems.length >= 4) return alert("Max 4 items.");
          setSelectedItems(prev => [...prev, itemId]);
      }
  };

  // --- RENDER ---
  if (!isConnected) return <ConnectWalletView />;
  
  // MODAL DE RESULTADO
  if (resultModal) {
      return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
              <div className={`bg-white rounded-3xl p-8 max-w-md w-full text-center border-8 ${resultModal.isVictory ? 'border-green-500' : 'border-red-500'}`}>
                  {resultModal.isVictory ? (
                      <>
                        <CheckCircle2 size={80} className="text-green-500 mx-auto mb-4"/>
                        <h2 className="text-4xl font-black uppercase text-[#1D1D1D]">Boss Defeated!</h2>
                        <div className="bg-[#EDEDD9] p-4 rounded-xl mb-4 mt-4">
                            <p className="text-xs font-black uppercase">Rewards</p>
                            <p className="text-3xl font-black text-[#E15162]">+{resultModal.rewards.tequila} $TEQ</p>
                            {resultModal.rewards.item && <p className="text-sm font-bold text-green-600 mt-2">Item Found: {resultModal.rewards.item.name}</p>}
                        </div>
                      </>
                  ) : (
                      <>
                        <XCircle size={80} className="text-red-500 mx-auto mb-4"/>
                        <h2 className="text-4xl font-black uppercase text-[#1D1D1D]">Mission Failed</h2>
                        <p className="text-gray-500 font-bold mb-6">The Boss overpowered your squad.</p>
                        <p className="text-xs bg-red-100 text-red-600 p-2 rounded">Success Chance: {Math.floor(resultModal.winChance)}% | Roll: {Math.floor(resultModal.roll)}</p>
                      </>
                  )}
                  <button onClick={() => setResultModal(null)} className="w-full bg-[#1D1D1D] text-white py-4 rounded-xl font-black uppercase mt-4">
                      {resultModal.isVictory ? "Claim & Return" : "Retreat Squad"}
                  </button>
              </div>
          </div>
      )
  }

  // VISTA SETUP
  if (view === 'setup' && selectedLocation) {
      return (
         <div className="max-w-7xl mx-auto pb-20">
             <button onClick={() => setView('dashboard')} className="mb-4 flex items-center gap-2 font-black uppercase hover:text-[#E15162]"><ArrowLeft/> Back to Command Center</button>
             
             <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* CONFIGURACIÓN Y SQUAD */}
                <div className="lg:col-span-8 space-y-6">
                    {/* Duration */}
                    <div className="bg-white p-6 rounded-[2rem] border-4 border-[#1D1D1D]">
                        <h3 className="text-xl font-black uppercase mb-4"><Clock className="inline mr-2"/> 1. Duration</h3>
                        <div className="grid grid-cols-3 gap-4">
                            {([7, 15, 30] as const).map(d => (
                                <div key={d} onClick={() => setSelectedDurationKey(d)} className={`cursor-pointer border-4 rounded-xl p-4 text-center ${selectedDurationKey === d ? 'bg-[#E15162] border-[#E15162] text-white' : 'border-[#1D1D1D]'}`}>
                                    <span className="text-2xl font-black">{DURATION_CONFIG[d].label}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Squad Selection */}
                    <div className="bg-[#EDEDD9] p-6 rounded-[2rem] border-4 border-[#1D1D1D]">
                        <div className="flex justify-between mb-4">
                            <h3 className="text-xl font-black uppercase"><Sword className="inline mr-2"/> 2. Squad</h3>
                            <span className="bg-[#1D1D1D] text-white px-3 rounded-full text-xs font-bold py-1">{selectedMingles.length}/10</span>
                        </div>
                        <div className="grid grid-cols-2 gap-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                            {mingles.map(mingle => {
                                const isLocked = lockedMingles.includes(mingle.id!);
                                const isSelected = selectedMingles.includes(mingle.id!);
                                const stats = getWormStats(mingle.type);
                                return (
                                    <div key={mingle.id} onClick={() => !isLocked && toggleMingle(mingle.id!)}
                                         className={`p-2 rounded-xl border-4 flex items-center gap-3 transition-all ${isLocked ? 'opacity-40 grayscale cursor-not-allowed' : 'cursor-pointer'} ${isSelected ? 'bg-[#1D1D1D] text-white border-[#1D1D1D]' : 'bg-white border-[#1D1D1D]/10'}`}>
                                        <img src={mingle.image} className="w-10 h-10 rounded bg-gray-300"/>
                                        <div>
                                            <p className="text-[10px] font-black uppercase">#{mingle.id}</p>
                                            {isLocked ? <span className="text-[9px] font-bold text-red-500">ON MISSION</span> : 
                                             <span className="text-[9px] font-bold opacity-70">+{stats.passiveVal}% {stats.passiveType}</span>}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                        <div className="mt-6 bg-white/50 p-4 rounded-xl border-2 border-[#1D1D1D]/10">
                            <h4 className="text-xs font-black uppercase mb-2 flex items-center gap-2"><Backpack size={14}/> Consumables (Max 4)</h4>
                            <div className="grid grid-cols-4 gap-4">
                                {[0,1,2,3].map(idx => {
                                    const item = inventory[idx];
                                    const isSelected = item && selectedItems.includes(item.item_id);
                                    return (
                                        <div key={idx} onClick={() => item && toggleItem(item.item_id)} className={`aspect-square rounded-xl border-2 flex items-center justify-center relative ${item ? 'bg-white cursor-pointer hover:scale-105' : 'border-dashed opacity-50'} ${isSelected ? 'ring-4 ring-[#E15162]' : ''}`}>
                                             {item && (<><img src={`/images/items/${item.item_id}.png`} className="w-full h-full object-contain p-2"/><span className="absolute bottom-1 right-1 bg-black text-white text-[9px] px-1 rounded">x{item.quantity}</span></>)}
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    </div>
                </div>

                {/* COL DERECHA: BOSS + STATS */}
                <div className="lg:col-span-4 space-y-6">
                    {/* RESTAURADO: BOSS CARD */}
                    <div className="bg-[#1D1D1D] text-white p-6 rounded-[2rem] border-4 border-[#1D1D1D]">
                         <h3 className="text-xl font-black uppercase mb-4 flex items-center gap-2"><Skull className="text-[#E15162]"/> Target</h3>
                         <div className="aspect-square rounded-xl overflow-hidden mb-4 relative">
                             <img src={selectedLocation.bossImg} className="w-full h-full object-cover"/>
                             <div className="absolute bottom-0 inset-x-0 bg-black/80 p-2 text-center">
                                 <p className="font-black uppercase text-lg">{selectedLocation.boss}</p>
                             </div>
                         </div>
                         <div className="grid grid-cols-4 gap-2">
                             {selectedLocation.bossLoot.map((loot:any, i:number) => (
                                 <div key={i} className="aspect-square bg-white/10 rounded-lg flex items-center justify-center p-1" title={loot.name}>
                                     <img src={loot.img} className="w-full h-full object-contain"/>
                                 </div>
                             ))}
                         </div>
                    </div>

                    <div className="bg-[#1D1D1D] text-white p-6 rounded-[2rem] border-4 border-[#1D1D1D] sticky top-4">
                        <h3 className="text-2xl font-black uppercase mb-6">Simulation</h3>
                        <div className="mb-6">
                            <p className="text-xs opacity-50 uppercase mb-1">Win Probability</p>
                            <div className="flex items-center gap-2">
                                <div className="h-4 flex-1 bg-gray-700 rounded-full overflow-hidden">
                                    <div className={`h-full ${setupStats.winChance > 80 ? 'bg-green-500' : 'bg-yellow-500'}`} style={{ width: `${setupStats.winChance}%` }}/>
                                </div>
                                <span className="font-black text-xl">{setupStats.winChance}%</span>
                            </div>
                        </div>
                        <div className="mb-8">
                            <p className="text-xs opacity-50 uppercase">Potential Earnings</p>
                            <p className="text-3xl font-black text-[#E15162]">{estimatedTequila} $TEQ</p>
                        </div>
                        <button onClick={startRaid} disabled={isProcessing} className="w-full bg-[#E15162] text-white py-4 rounded-xl font-black uppercase text-xl hover:bg-white hover:text-[#1D1D1D] transition-colors disabled:opacity-50">
                            {isProcessing ? <Loader2 className="animate-spin mx-auto"/> : "Deploy Squad"}
                        </button>
                    </div>
                </div>
             </div>
         </div>
      )
  }

  // VISTA DASHBOARD
  return (
    <div className="max-w-7xl mx-auto pb-20 space-y-8">
        <h1 className="text-5xl font-black uppercase text-[#1D1D1D]">Mission Control</h1>

        {/* MISIONES ACTIVAS */}
        <section>
            <h2 className="text-xl font-black uppercase mb-4 flex items-center gap-2"><Clock/> Active Operations</h2>
            {activeSessions.length === 0 ? (
                <div className="bg-white p-8 rounded-[2rem] border-4 border-[#1D1D1D] border-dashed text-center opacity-50">
                    <p className="font-bold">No active missions. Deploy a squad below.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {activeSessions.map((session) => {
                        const now = Date.now();
                        const timeLeft = Math.max(0, Math.ceil((session.endTime - now) / 1000));
                        const isComplete = timeLeft === 0;

                        return (
                            <div key={session.id} className={`p-6 rounded-[2rem] border-4 border-[#1D1D1D] relative overflow-hidden ${isComplete ? 'bg-green-100' : 'bg-white'}`}>
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="font-black uppercase text-lg leading-none">{session.location?.name}</h3>
                                        <p className="text-xs font-bold opacity-60">Squad: {session.squad.length} Mingles</p>
                                    </div>
                                    {isComplete ? <CheckCircle2 className="text-green-600"/> : <Loader2 className="animate-spin text-[#E15162]"/>}
                                </div>
                                
                                {isComplete ? (
                                    <button onClick={() => resolveMission(session)} disabled={isProcessing} className="w-full bg-[#1D1D1D] text-white py-3 rounded-xl font-black uppercase hover:scale-105 transition-transform">
                                        {isProcessing ? "..." : "Resolve Mission"}
                                    </button>
                                ) : (
                                    <div>
                                        <div className="text-3xl font-black font-mono text-center my-4">
                                            {Math.floor(timeLeft / 60)}m {timeLeft % 60}s
                                        </div>
                                        <button onClick={() => cancelRaid(session.id)} className="w-full border-2 border-[#1D1D1D]/10 text-red-500 py-2 rounded-lg text-xs font-black uppercase hover:bg-red-50">
                                            Abort Mission
                                        </button>
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>
            )}
        </section>

        {/* CONTRATOS */}
        <section>
            <h2 className="text-xl font-black uppercase mb-4 flex items-center gap-2"><Briefcase/> Available Contracts</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {RAID_LOCATIONS.map(raid => (
                    <motion.div 
                        key={raid.id} 
                        whileHover={{ scale: 1.01 }}
                        onClick={() => { setSelectedLocation(raid); setView('setup'); }}
                        className="bg-[#1D1D1D] text-white rounded-[2rem] overflow-hidden cursor-pointer relative h-48 group"
                    >
                         <img src={raid.img} className="absolute inset-0 w-full h-full object-cover opacity-50 group-hover:opacity-70 transition-opacity"/>
                         <div className="absolute inset-0 p-6 flex flex-col justify-end">
                             <div className="flex justify-between items-end">
                                 <div>
                                     <h3 className="text-2xl font-black uppercase">{raid.name}</h3>
                                     <span className="bg-[#E15162] px-2 py-0.5 rounded text-[10px] font-bold uppercase">{raid.difficulty}</span>
                                 </div>
                                 <div className="bg-white text-[#1D1D1D] p-2 rounded-full"><ChevronRight/></div>
                             </div>
                         </div>
                    </motion.div>
                ))}
            </div>
        </section>
    </div>
  );
}